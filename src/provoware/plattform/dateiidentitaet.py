"""Read-only Dateiidentität und Stale-Guard für P03/I014.

I014 erfasst einen typisierten ``lstat``-Snapshot und vergleicht ihn später erneut.
Die Komponente verändert das Dateisystem nicht und ersetzt die getrennte I013-Symlinkprobe
nicht. Ein erfolgreicher Recheck ist nur ein unmittelbarer Vorzustandsbeweis und keine
Dauer- oder Lock-Garantie.
"""

from __future__ import annotations

import json
import os
import stat
from dataclasses import dataclass
from enum import StrEnum
from hashlib import sha256
from typing import Protocol


class LstatFunktion(Protocol):
    """Injizierbare, ausschließlich lesende ``lstat``-Grenze."""

    def __call__(self, pfad: str, /) -> os.stat_result: ...


class IdentitaetsStatus(StrEnum):
    """Erfassungszustand eines Dateiidentitäts-Snapshots."""

    ERFASST = "ERFASST"
    UNBEKANNT = "UNBEKANNT"


class StaleStatus(StrEnum):
    """Ergebnis eines fail-closed Identitätsvergleichs."""

    GLEICH = "GLEICH"
    STALE = "STALE"
    UNBEKANNT = "UNBEKANNT"


class DateiArt(StrEnum):
    """Aus ``st_mode`` abgeleitete Objektart."""

    DATEI = "DATEI"
    VERZEICHNIS = "VERZEICHNIS"
    SYMLINK = "SYMLINK"
    SONSTIG = "SONSTIG"


@dataclass(frozen=True, slots=True)
class DateiIdentitaet:
    """Minimale stat-basierte Identität für einen unmittelbaren Recheck."""

    geraet: int
    inode: int
    art: DateiArt
    modus: int
    groesse: int
    mtime_ns: int
    ctime_ns: int


@dataclass(frozen=True, slots=True)
class IdentitaetsSnapshot:
    """Read-only Erfassung eines Pfads inklusive deterministischem Fingerprint."""

    pfad: str
    status: IdentitaetsStatus
    identitaet: DateiIdentitaet | None
    fehler_typ: str | None
    begruendung: str
    fingerprint_sha256: str


@dataclass(frozen=True, slots=True)
class StalePruefung:
    """Vergleich eines erwarteten Snapshots mit dem aktuell gelesenen Zustand."""

    status: StaleStatus
    erwartet: IdentitaetsSnapshot
    aktuell: IdentitaetsSnapshot
    geaenderte_merkmale: tuple[str, ...]
    begruendung: str
    fingerprint_sha256: str


def _dateiart(modus: int) -> DateiArt:
    if stat.S_ISLNK(modus):
        return DateiArt.SYMLINK
    if stat.S_ISREG(modus):
        return DateiArt.DATEI
    if stat.S_ISDIR(modus):
        return DateiArt.VERZEICHNIS
    return DateiArt.SONSTIG


def _identitaet_von_stat(befund: os.stat_result) -> DateiIdentitaet:
    return DateiIdentitaet(
        geraet=befund.st_dev,
        inode=befund.st_ino,
        art=_dateiart(befund.st_mode),
        modus=befund.st_mode,
        groesse=befund.st_size,
        mtime_ns=befund.st_mtime_ns,
        ctime_ns=befund.st_ctime_ns,
    )


def _hash_json(payload: object) -> str:
    kanonisch = json.dumps(
        payload,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    return sha256(kanonisch).hexdigest()


def _identitaet_payload(identitaet: DateiIdentitaet | None) -> dict[str, object] | None:
    if identitaet is None:
        return None
    return {
        "art": identitaet.art.value,
        "ctime_ns": identitaet.ctime_ns,
        "geraet": identitaet.geraet,
        "groesse": identitaet.groesse,
        "inode": identitaet.inode,
        "modus": identitaet.modus,
        "mtime_ns": identitaet.mtime_ns,
    }


def _snapshot(
    *,
    pfad: str,
    status: IdentitaetsStatus,
    identitaet: DateiIdentitaet | None,
    fehler_typ: str | None,
    begruendung: str,
) -> IdentitaetsSnapshot:
    fingerprint = _hash_json(
        {
            "fehler_typ": fehler_typ,
            "identitaet": _identitaet_payload(identitaet),
            "pfad": pfad,
            "status": status.value,
        }
    )
    return IdentitaetsSnapshot(
        pfad=pfad,
        status=status,
        identitaet=identitaet,
        fehler_typ=fehler_typ,
        begruendung=begruendung,
        fingerprint_sha256=fingerprint,
    )


def erfasse_dateiidentitaet(
    pfad: str,
    *,
    lstat_funktion: LstatFunktion | None = None,
) -> IdentitaetsSnapshot:
    """Erfasse die aktuelle Identität eines absoluten Pfads ausschließlich per ``lstat``."""

    eingabe = pfad.strip()
    if not eingabe or "\x00" in eingabe or not os.path.isabs(eingabe):
        return _snapshot(
            pfad=eingabe,
            status=IdentitaetsStatus.UNBEKANNT,
            identitaet=None,
            fehler_typ="UNGUELTIGE_EINGABE",
            begruendung="Dateiidentität benötigt einen gültigen absoluten Pfad.",
        )

    try:
        befund = os.lstat(eingabe) if lstat_funktion is None else lstat_funktion(eingabe)
    except OSError as exc:
        return _snapshot(
            pfad=eingabe,
            status=IdentitaetsStatus.UNBEKANNT,
            identitaet=None,
            fehler_typ=type(exc).__name__,
            begruendung="Dateiidentität konnte nicht sicher gelesen werden.",
        )

    return _snapshot(
        pfad=eingabe,
        status=IdentitaetsStatus.ERFASST,
        identitaet=_identitaet_von_stat(befund),
        fehler_typ=None,
        begruendung="Dateiidentität wurde read-only per lstat erfasst.",
    )


def _geaenderte_merkmale(a: DateiIdentitaet, b: DateiIdentitaet) -> tuple[str, ...]:
    merkmale = (
        "geraet",
        "inode",
        "art",
        "modus",
        "groesse",
        "mtime_ns",
        "ctime_ns",
    )
    return tuple(name for name in merkmale if getattr(a, name) != getattr(b, name))


def pruefe_stale_guard(
    erwartet: IdentitaetsSnapshot,
    *,
    lstat_funktion: LstatFunktion | None = None,
) -> StalePruefung:
    """Vergleiche einen früheren Snapshot fail-closed mit einem aktuellen ``lstat``-Befund."""

    aktuell = erfasse_dateiidentitaet(erwartet.pfad, lstat_funktion=lstat_funktion)
    if (
        erwartet.status is not IdentitaetsStatus.ERFASST
        or erwartet.identitaet is None
        or aktuell.status is not IdentitaetsStatus.ERFASST
        or aktuell.identitaet is None
    ):
        status = StaleStatus.UNBEKANNT
        geaendert: tuple[str, ...] = ()
        begruendung = (
            "Mindestens eine Identität ist unbekannt; Gleichheit darf nicht behauptet werden."
        )
    else:
        geaendert = _geaenderte_merkmale(erwartet.identitaet, aktuell.identitaet)
        if geaendert:
            status = StaleStatus.STALE
            begruendung = "Mindestens ein relevantes Stat-Merkmal hat sich geändert."
        else:
            status = StaleStatus.GLEICH
            begruendung = "Alle qualifizierten Stat-Merkmale sind im unmittelbaren Recheck gleich."

    fingerprint = _hash_json(
        {
            "aktuell": aktuell.fingerprint_sha256,
            "erwartet": erwartet.fingerprint_sha256,
            "geaenderte_merkmale": list(geaendert),
            "status": status.value,
        }
    )
    return StalePruefung(
        status=status,
        erwartet=erwartet,
        aktuell=aktuell,
        geaenderte_merkmale=geaendert,
        begruendung=begruendung,
        fingerprint_sha256=fingerprint,
    )
