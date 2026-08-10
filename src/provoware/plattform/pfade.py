"""Read-only Pfadnormalisierung und Projektwurzel-Schutz für P03/I012.

Die Prüfung arbeitet rein lexikalisch auf POSIX-Pfaden und führt keinerlei Datei-I/O aus.
Symlink-Sicherheit wird deshalb explizit als injizierter Vorprüfstatus behandelt: Ohne
belegtes symlink-freies Ergebnis wird ein Kandidat niemals als INNERHALB qualifiziert.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from enum import StrEnum
from hashlib import sha256
from pathlib import PurePosixPath


class PfadStatus(StrEnum):
    """Ergebnis der read-only Projektwurzel-Prüfung."""

    INNERHALB = "INNERHALB"
    BLOCKIERT = "BLOCKIERT"
    UNBEKANNT = "UNBEKANNT"


@dataclass(frozen=True, slots=True)
class PfadPruefung:
    """Deterministisches Ergebnis einer Projektpfad-Prüfung."""

    projektwurzel: str
    eingabe: str
    normalisiert: str | None
    relativ_zur_wurzel: str | None
    status: PfadStatus
    begruendung: str
    fingerprint_sha256: str


def _fingerprint(
    *,
    projektwurzel: str,
    eingabe: str,
    normalisiert: str | None,
    relativ_zur_wurzel: str | None,
    status: PfadStatus,
) -> str:
    basis = {
        "eingabe": eingabe,
        "normalisiert": normalisiert,
        "projektwurzel": projektwurzel,
        "relativ_zur_wurzel": relativ_zur_wurzel,
        "status": status.value,
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
    projektwurzel: str,
    eingabe: str,
    normalisiert: str | None,
    relativ_zur_wurzel: str | None,
    status: PfadStatus,
    begruendung: str,
) -> PfadPruefung:
    return PfadPruefung(
        projektwurzel=projektwurzel,
        eingabe=eingabe,
        normalisiert=normalisiert,
        relativ_zur_wurzel=relativ_zur_wurzel,
        status=status,
        begruendung=begruendung,
        fingerprint_sha256=_fingerprint(
            projektwurzel=projektwurzel,
            eingabe=eingabe,
            normalisiert=normalisiert,
            relativ_zur_wurzel=relativ_zur_wurzel,
            status=status,
        ),
    )


def pruefe_projektpfad(
    projektwurzel: str,
    kandidat: str,
    *,
    symlink_frei: bool | None,
) -> PfadPruefung:
    """Prüfe einen Kandidaten fail-closed gegen eine absolute Projektwurzel.

    ``symlink_frei`` stammt aus einer vorgelagerten read-only Prüfung. ``None`` bedeutet,
    dass die Symlink-Sicherheit nicht belegt wurde. Ein solcher Kandidat bleibt UNBEKANNT.
    ``False`` blockiert den Kandidaten. Diese Funktion selbst fragt das Dateisystem nie ab.
    """

    wurzel_roh = projektwurzel.strip()
    kandidat_roh = kandidat.strip()

    if not wurzel_roh or "\x00" in wurzel_roh:
        return _ergebnis(
            projektwurzel=wurzel_roh,
            eingabe=kandidat_roh,
            normalisiert=None,
            relativ_zur_wurzel=None,
            status=PfadStatus.UNBEKANNT,
            begruendung="Projektwurzel fehlt oder ist ungültig.",
        )

    wurzel = PurePosixPath(wurzel_roh)
    if not wurzel.is_absolute() or ".." in wurzel.parts:
        return _ergebnis(
            projektwurzel=wurzel_roh,
            eingabe=kandidat_roh,
            normalisiert=None,
            relativ_zur_wurzel=None,
            status=PfadStatus.UNBEKANNT,
            begruendung="Projektwurzel muss absolut und traversal-frei sein.",
        )

    if not kandidat_roh or "\x00" in kandidat_roh or kandidat_roh.startswith("~"):
        return _ergebnis(
            projektwurzel=str(wurzel),
            eingabe=kandidat_roh,
            normalisiert=None,
            relativ_zur_wurzel=None,
            status=PfadStatus.BLOCKIERT,
            begruendung="Kandidatenpfad fehlt oder enthält nicht erlaubte Sondersemantik.",
        )

    kandidat_pfad = PurePosixPath(kandidat_roh)
    if ".." in kandidat_pfad.parts:
        return _ergebnis(
            projektwurzel=str(wurzel),
            eingabe=kandidat_roh,
            normalisiert=None,
            relativ_zur_wurzel=None,
            status=PfadStatus.BLOCKIERT,
            begruendung="Parent-Traversal über '..' ist nicht zulässig.",
        )

    normalisiert_pfad = kandidat_pfad if kandidat_pfad.is_absolute() else wurzel / kandidat_pfad
    normalisiert = str(normalisiert_pfad)

    try:
        relativ = normalisiert_pfad.relative_to(wurzel)
    except ValueError:
        return _ergebnis(
            projektwurzel=str(wurzel),
            eingabe=kandidat_roh,
            normalisiert=normalisiert,
            relativ_zur_wurzel=None,
            status=PfadStatus.BLOCKIERT,
            begruendung="Kandidatenpfad liegt außerhalb der Projektwurzel.",
        )

    relativ_text = str(relativ)
    if symlink_frei is False:
        return _ergebnis(
            projektwurzel=str(wurzel),
            eingabe=kandidat_roh,
            normalisiert=normalisiert,
            relativ_zur_wurzel=relativ_text,
            status=PfadStatus.BLOCKIERT,
            begruendung="Symlink-Risiko wurde durch die vorgelagerte Prüfung erkannt.",
        )
    if symlink_frei is None:
        return _ergebnis(
            projektwurzel=str(wurzel),
            eingabe=kandidat_roh,
            normalisiert=normalisiert,
            relativ_zur_wurzel=relativ_text,
            status=PfadStatus.UNBEKANNT,
            begruendung="Symlink-Sicherheit ist nicht belegt.",
        )

    return _ergebnis(
        projektwurzel=str(wurzel),
        eingabe=kandidat_roh,
        normalisiert=normalisiert,
        relativ_zur_wurzel=relativ_text,
        status=PfadStatus.INNERHALB,
        begruendung="Kandidatenpfad liegt lexikalisch innerhalb der Projektwurzel und ist als symlink-frei belegt.",
    )
