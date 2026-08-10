"""Read-only lstat-Dateisystemprobe für P03/I013.

Die Probe folgt keinen Symlinks, löst keine Pfade auf und verändert das Dateisystem nicht.
Sie erzeugt aus segmentweisen ``lstat``-Befunden einen deterministischen Symlink-Status,
der direkt als Vorprüfung für die reine I012-Pfadgrenze verwendet werden kann.
"""

from __future__ import annotations

import json
import stat
from collections.abc import Callable
from dataclasses import dataclass
from enum import StrEnum
from hashlib import sha256
from os import lstat, stat_result
from pathlib import PurePosixPath


LstatFunktion = Callable[[str], stat_result]


class ProbeStatus(StrEnum):
    """Symlink-Sicherheitszustand einer read-only Pfadprobe."""

    SICHER = "SICHER"
    SYMLINK = "SYMLINK"
    UNBEKANNT = "UNBEKANNT"


class PfadArt(StrEnum):
    """Durch ``lstat`` beobachtete Art eines Pfadsegments."""

    DATEI = "DATEI"
    VERZEICHNIS = "VERZEICHNIS"
    SYMLINK = "SYMLINK"
    SONSTIG = "SONSTIG"


@dataclass(frozen=True, slots=True)
class SegmentBefund:
    """Deterministischer Befund für genau ein geprüftes Pfadsegment."""

    pfad: str
    art: PfadArt


@dataclass(frozen=True, slots=True)
class DateisystemProbe:
    """Gesamtergebnis einer segmentweisen, read-only ``lstat``-Prüfung."""

    eingabe: str
    status: ProbeStatus
    befunde: tuple[SegmentBefund, ...]
    symlink_segment: str | None
    fehler_segment: str | None
    fehler_typ: str | None
    begruendung: str
    fingerprint_sha256: str

    @property
    def symlink_frei(self) -> bool | None:
        """Übersetze den Befund in den von I012 erwarteten Vorprüfstatus."""

        if self.status is ProbeStatus.SICHER:
            return True
        if self.status is ProbeStatus.SYMLINK:
            return False
        return None


def _art_von_modus(modus: int) -> PfadArt:
    if stat.S_ISLNK(modus):
        return PfadArt.SYMLINK
    if stat.S_ISDIR(modus):
        return PfadArt.VERZEICHNIS
    if stat.S_ISREG(modus):
        return PfadArt.DATEI
    return PfadArt.SONSTIG


def _fingerprint(
    *,
    eingabe: str,
    status: ProbeStatus,
    befunde: tuple[SegmentBefund, ...],
    symlink_segment: str | None,
    fehler_segment: str | None,
    fehler_typ: str | None,
) -> str:
    basis = {
        "befunde": [{"art": befund.art.value, "pfad": befund.pfad} for befund in befunde],
        "eingabe": eingabe,
        "fehler_segment": fehler_segment,
        "fehler_typ": fehler_typ,
        "status": status.value,
        "symlink_segment": symlink_segment,
    }
    kanonisch = json.dumps(
        basis,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    return sha256(kanonisch).hexdigest()


def _ergebnis(
    *,
    eingabe: str,
    status: ProbeStatus,
    befunde: tuple[SegmentBefund, ...],
    begruendung: str,
    symlink_segment: str | None = None,
    fehler_segment: str | None = None,
    fehler_typ: str | None = None,
) -> DateisystemProbe:
    return DateisystemProbe(
        eingabe=eingabe,
        status=status,
        befunde=befunde,
        symlink_segment=symlink_segment,
        fehler_segment=fehler_segment,
        fehler_typ=fehler_typ,
        begruendung=begruendung,
        fingerprint_sha256=_fingerprint(
            eingabe=eingabe,
            status=status,
            befunde=befunde,
            symlink_segment=symlink_segment,
            fehler_segment=fehler_segment,
            fehler_typ=fehler_typ,
        ),
    )


def _segmente(pfad: PurePosixPath) -> tuple[str, ...]:
    aktuell = PurePosixPath("/")
    segmente = ["/"]
    for teil in pfad.parts[1:]:
        aktuell /= teil
        segmente.append(str(aktuell))
    return tuple(segmente)


def pruefe_dateisystempfad(
    pfad: str,
    *,
    lstat_funktion: LstatFunktion = lstat,
) -> DateisystemProbe:
    """Prüfe einen absoluten POSIX-Pfad segmentweise mit ``lstat``.

    Die Funktion folgt keinen Symlinks. Nicht existente Segmente, Berechtigungsfehler und
    sonstige ``OSError``-Zustände bleiben fail-closed ``UNBEKANNT``. Eine erfolgreiche
    Probe ist ausdrücklich keine TOCTOU-Garantie für spätere mutierende Operationen.
    """

    eingabe = pfad.strip()
    if not eingabe or "\x00" in eingabe:
        return _ergebnis(
            eingabe=eingabe,
            status=ProbeStatus.UNBEKANNT,
            befunde=(),
            begruendung="Pfad fehlt oder ist ungültig.",
            fehler_typ="UNGUELTIGE_EINGABE",
        )

    posix_pfad = PurePosixPath(eingabe)
    if not posix_pfad.is_absolute() or ".." in posix_pfad.parts:
        return _ergebnis(
            eingabe=eingabe,
            status=ProbeStatus.UNBEKANNT,
            befunde=(),
            begruendung="Pfad muss absolut und traversal-frei sein.",
            fehler_typ="UNGUELTIGE_EINGABE",
        )

    befunde: list[SegmentBefund] = []
    for segment in _segmente(posix_pfad):
        try:
            stat_befund = lstat_funktion(segment)
        except OSError as exc:
            return _ergebnis(
                eingabe=str(posix_pfad),
                status=ProbeStatus.UNBEKANNT,
                befunde=tuple(befunde),
                begruendung="Mindestens ein Pfadsegment konnte nicht sicher gelesen werden.",
                fehler_segment=segment,
                fehler_typ=type(exc).__name__,
            )

        art = _art_von_modus(stat_befund.st_mode)
        befunde.append(SegmentBefund(pfad=segment, art=art))
        if art is PfadArt.SYMLINK:
            return _ergebnis(
                eingabe=str(posix_pfad),
                status=ProbeStatus.SYMLINK,
                befunde=tuple(befunde),
                begruendung="Mindestens ein Pfadsegment ist ein Symlink.",
                symlink_segment=segment,
            )

    return _ergebnis(
        eingabe=str(posix_pfad),
        status=ProbeStatus.SICHER,
        befunde=tuple(befunde),
        begruendung="Alle Pfadsegmente wurden per lstat gelesen und sind symlink-frei.",
    )
