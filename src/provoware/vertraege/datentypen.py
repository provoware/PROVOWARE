"""Strikt typisierte Kernverträge für IDs, Status, Fehler und Operationsergebnisse.

Diese Schicht ist absichtlich frei von Qt-, SQLite-, Datei- und Modulabhängigkeiten.
Sie bildet eine stabile Sprachgrenze zwischen späterem Core, Persistenz und Desktop-Adapter.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import StrEnum
from typing import ClassVar, Final, Self
from uuid import UUID, uuid4

_ID_RE: Final = re.compile(r"^(?P<prefix>[a-z]{2,4})_(?P<uuid>[0-9a-f]{32})$")
_CODE_RE: Final = re.compile(r"^[A-Z][A-Z0-9_]{2,63}$")


@dataclass(frozen=True, slots=True)
class _BasisId:
    """Unveränderliche, präfixierte UUID-ID mit kanonischem Textformat."""

    wert: str
    PRAEFIX: ClassVar[str]

    def __post_init__(self) -> None:
        match = _ID_RE.fullmatch(self.wert)
        if match is None or match.group("prefix") != self.PRAEFIX:
            raise ValueError(
                f"Ungültige {type(self).__name__}: erwartet {self.PRAEFIX}_<32 hex-Zeichen>."
            )
        UUID(hex=match.group("uuid"))

    @classmethod
    def neu(cls) -> Self:
        """Erzeugt eine neue zufällige ID im kanonischen Format."""

        return cls(f"{cls.PRAEFIX}_{uuid4().hex}")

    @classmethod
    def parse(cls, text: str) -> Self:
        """Validiert Text und liefert den konkret typisierten ID-Wert."""

        return cls(text)

    def __str__(self) -> str:
        return self.wert


@dataclass(frozen=True, slots=True)
class ProjektId(_BasisId):
    PRAEFIX: ClassVar[str] = "prj"


@dataclass(frozen=True, slots=True)
class ObjektId(_BasisId):
    PRAEFIX: ClassVar[str] = "obj"


@dataclass(frozen=True, slots=True)
class RevisionId(_BasisId):
    PRAEFIX: ClassVar[str] = "rev"


@dataclass(frozen=True, slots=True)
class ChangeId(_BasisId):
    PRAEFIX: ClassVar[str] = "chg"


@dataclass(frozen=True, slots=True)
class OperationId(_BasisId):
    PRAEFIX: ClassVar[str] = "op"


class Status(StrEnum):
    """Stabile, maschinenlesbare Zustände für Kernoperationen und Controller."""

    BEREIT = "BEREIT"
    IN_ARBEIT = "IN_ARBEIT"
    VALIDIERT = "VALIDIERT"
    BLOCKIERT = "BLOCKIERT"


class Fehlerklasse(StrEnum):
    """Kleine stabile Fehlerklassifikation ohne UI- oder Persistenzsemantik."""

    VALIDIERUNG = "VALIDIERUNG"
    NICHT_GEFUNDEN = "NICHT_GEFUNDEN"
    KONFLIKT = "KONFLIKT"
    BERECHTIGUNG = "BERECHTIGUNG"
    IO = "IO"
    INTEGRITAET = "INTEGRITAET"
    INTERN = "INTERN"


@dataclass(frozen=True, slots=True)
class FehlerInfo:
    """Strukturierte Fehlerdaten; Nutzertext und Diagnosecode bleiben getrennt."""

    klasse: Fehlerklasse
    code: str
    nachricht: str

    def __post_init__(self) -> None:
        if _CODE_RE.fullmatch(self.code) is None:
            raise ValueError("Fehlercode muss 3-64 Zeichen aus A-Z, 0-9 und _ besitzen.")
        if not self.nachricht.strip():
            raise ValueError("Fehlernachricht darf nicht leer sein.")

    def als_dict(self) -> dict[str, str]:
        return {
            "klasse": self.klasse.value,
            "code": self.code,
            "nachricht": self.nachricht,
        }


@dataclass(frozen=True, slots=True)
class OperationErgebnis[T]:
    """Explizites Erfolgs-/Fehlerergebnis ohne Magic-String-Schnittstelle."""

    erfolgreich: bool
    wert: T | None = None
    fehler: FehlerInfo | None = None

    def __post_init__(self) -> None:
        if self.erfolgreich and self.fehler is not None:
            raise ValueError("Ein erfolgreiches Ergebnis darf keinen Fehler enthalten.")
        if not self.erfolgreich and self.fehler is None:
            raise ValueError("Ein fehlgeschlagenes Ergebnis benötigt FehlerInfo.")

    @classmethod
    def erfolg(cls, wert: T | None = None) -> OperationErgebnis[T]:
        return cls(erfolgreich=True, wert=wert, fehler=None)

    @classmethod
    def fehlgeschlagen(cls, fehler: FehlerInfo) -> OperationErgebnis[T]:
        return cls(erfolgreich=False, wert=None, fehler=fehler)

    def fehler_dict(self) -> dict[str, str] | None:
        if self.fehler is None:
            return None
        return self.fehler.als_dict()
