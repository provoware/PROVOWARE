"""Eng gekapselte atomare Temp/Replace-Primitive für P03/I015.

Die erste mutierende Plattformprimitive ist nur zulässig, wenn die qualifizierten
Vorbedingungen aus I012 (Projektwurzel), I013 (Symlinkfreiheit) und I014
(unmittelbare Dateiidentität) dasselbe normalisierte Ziel bestätigen.

Der Erfolgsweg lautet: Temp-Datei im Zielverzeichnis -> Berechtigungsbits übernehmen ->
Dateidaten schreiben -> Datei-fsync -> os.replace -> Verzeichnis-fsync. Ein Fehler nach
``os.replace`` wird ausdrücklich als bereits erfolgte Mutation ausgewiesen; es wird keine
falsche Rollback-Garantie behauptet.
"""

from __future__ import annotations

import os
import stat
import tempfile
from contextlib import suppress
from dataclasses import dataclass
from enum import StrEnum
from pathlib import PurePosixPath

from provoware.plattform.dateiidentitaet import DateiArt, StalePruefung, StaleStatus
from provoware.plattform.dateisystem_probe import DateisystemProbe, ProbeStatus
from provoware.plattform.pfade import PfadPruefung, PfadStatus


class ReplaceStatus(StrEnum):
    """Maschinenlesbarer Ausgang genau einer Replace-Operation."""

    ERSETZT = "ERSETZT"
    BLOCKIERT = "BLOCKIERT"
    FEHLER_VOR_REPLACE = "FEHLER_VOR_REPLACE"
    FEHLER_NACH_REPLACE = "FEHLER_NACH_REPLACE"


@dataclass(frozen=True, slots=True)
class ReplaceErgebnis:
    """Ergebnis mit expliziter Aussage, ob das Ziel bereits mutiert wurde."""

    ziel: str
    status: ReplaceStatus
    mutation_erfolgt: bool
    temp_pfad: str | None
    fehler_typ: str | None
    begruendung: str


def _blockiert(ziel: str, begruendung: str) -> ReplaceErgebnis:
    return ReplaceErgebnis(
        ziel=ziel,
        status=ReplaceStatus.BLOCKIERT,
        mutation_erfolgt=False,
        temp_pfad=None,
        fehler_typ=None,
        begruendung=begruendung,
    )


def _vorbedingungen_pruefen(
    *,
    ziel: str,
    pfadpruefung: PfadPruefung,
    dateisystemprobe: DateisystemProbe,
    stale_pruefung: StalePruefung,
) -> ReplaceErgebnis | None:
    roh = ziel.strip()
    if not roh or "\x00" in roh:
        return _blockiert(roh, "Zielpfad fehlt oder ist ungültig.")

    posix = PurePosixPath(roh)
    normalisiert = str(posix)
    if not posix.is_absolute() or ".." in posix.parts or normalisiert != roh:
        return _blockiert(
            roh,
            "Ziel muss absolut, traversal-frei und bereits kanonisch normalisiert sein.",
        )

    if pfadpruefung.status is not PfadStatus.INNERHALB or pfadpruefung.normalisiert != normalisiert:
        return _blockiert(
            normalisiert,
            "I012-Projektwurzel-Prüfung bestätigt dieses Ziel nicht eindeutig.",
        )

    if (
        dateisystemprobe.status is not ProbeStatus.SICHER
        or dateisystemprobe.eingabe != normalisiert
    ):
        return _blockiert(
            normalisiert,
            "I013-Symlinkprobe bestätigt dieses Ziel nicht eindeutig als sicher.",
        )

    aktuell = stale_pruefung.aktuell
    if (
        stale_pruefung.status is not StaleStatus.GLEICH
        or stale_pruefung.erwartet.pfad != normalisiert
        or aktuell.pfad != normalisiert
        or aktuell.identitaet is None
        or aktuell.identitaet.art is not DateiArt.DATEI
    ):
        return _blockiert(
            normalisiert,
            "I014-Stale-Guard bestätigt keine unveränderte reguläre Zieldatei.",
        )

    return None


def _temp_aufräumen(temp_pfad: str | None) -> str | None:
    if temp_pfad is None:
        return None
    try:
        os.unlink(temp_pfad)
    except OSError:
        return temp_pfad
    return None


def atomar_ersetzen(
    *,
    ziel: str,
    inhalt: bytes,
    pfadpruefung: PfadPruefung,
    dateisystemprobe: DateisystemProbe,
    stale_pruefung: StalePruefung,
) -> ReplaceErgebnis:
    """Ersetze genau eine bestehende reguläre Datei hinter drei fail-closed Gates.

    Die Funktion ist absichtlich kein Batch-, Delete-, Lock- oder Recovery-System. Sie
    kapselt nur eine einzelne Temp/Replace-Operation. Ein erfolgreiches ``os.replace``
    ist auf POSIX-Dateisystemen ein atomarer Namenswechsel; die abschließende
    Verzeichnis-Synchronisierung ist davon als eigener Dauerhaftigkeitsschritt getrennt.
    """

    block = _vorbedingungen_pruefen(
        ziel=ziel,
        pfadpruefung=pfadpruefung,
        dateisystemprobe=dateisystemprobe,
        stale_pruefung=stale_pruefung,
    )
    if block is not None:
        return block

    normalisiert = str(PurePosixPath(ziel.strip()))
    ziel_pfad = PurePosixPath(normalisiert)
    verzeichnis = str(ziel_pfad.parent)
    identitaet = stale_pruefung.aktuell.identitaet
    assert identitaet is not None

    temp_pfad: str | None = None
    ersetzt = False
    try:
        fd, temp_pfad = tempfile.mkstemp(
            prefix=f".{ziel_pfad.name}.provoware-",
            dir=verzeichnis,
        )
        try:
            os.fchmod(fd, stat.S_IMODE(identitaet.modus))
            with os.fdopen(fd, "wb", closefd=True) as handle:
                handle.write(inhalt)
                handle.flush()
                os.fsync(handle.fileno())
        except BaseException:
            with suppress(OSError):
                os.close(fd)
            raise

        os.replace(temp_pfad, normalisiert)
        ersetzt = True
        temp_pfad = None

        dir_fd = os.open(verzeichnis, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
        try:
            os.fsync(dir_fd)
        finally:
            os.close(dir_fd)
    except OSError as exc:
        temp_pfad = _temp_aufräumen(temp_pfad)
        if ersetzt:
            return ReplaceErgebnis(
                ziel=normalisiert,
                status=ReplaceStatus.FEHLER_NACH_REPLACE,
                mutation_erfolgt=True,
                temp_pfad=temp_pfad,
                fehler_typ=type(exc).__name__,
                begruendung=(
                    "Ziel wurde ersetzt, aber die abschließende Verzeichnis-"
                    "Synchronisierung schlug fehl; Dauerhaftigkeit ist unbekannt."
                ),
            )
        return ReplaceErgebnis(
            ziel=normalisiert,
            status=ReplaceStatus.FEHLER_VOR_REPLACE,
            mutation_erfolgt=False,
            temp_pfad=temp_pfad,
            fehler_typ=type(exc).__name__,
            begruendung=(
                "Operation wurde vor os.replace abgebrochen; das Original wurde nicht ersetzt."
            ),
        )

    return ReplaceErgebnis(
        ziel=normalisiert,
        status=ReplaceStatus.ERSETZT,
        mutation_erfolgt=True,
        temp_pfad=None,
        fehler_typ=None,
        begruendung="Datei atomar ersetzt und Datei sowie Zielverzeichnis synchronisiert.",
    )
