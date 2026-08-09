"""Versionierte, strikt validierbare Manifest- und Projektschemata.

Die Schicht ist absichtlich frei von Qt-, SQLite-, Datei-I/O- und Modulabhängigkeiten.
Schema-Version und Produktversion sind technisch getrennte Werttypen.
"""

from __future__ import annotations

import json
import re
from collections.abc import Mapping
from dataclasses import dataclass
from typing import ClassVar, Final, Self

from provoware.vertraege.datentypen import ProjektId, Status

_SCHEMA_VERSION_RE: Final = re.compile(r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$")
_PRODUKT_VERSION_RE: Final = re.compile(
    r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$"
)
_PROJEKTNAME_RE: Final = re.compile(r"^[^\x00-\x1f\x7f]{1,120}$")


class SchemaValidierungsfehler(ValueError):
    """Strukturierter Fehler an einer öffentlichen Schemavertragsgrenze."""

    def __init__(self, code: str, nachricht: str, feld: str | None = None) -> None:
        super().__init__(nachricht)
        self.code = code
        self.nachricht = nachricht
        self.feld = feld

    def als_dict(self) -> dict[str, str | None]:
        return {"code": self.code, "feld": self.feld, "nachricht": self.nachricht}


@dataclass(frozen=True, slots=True)
class SchemaVersion:
    """Schema-Version im stabilen numerischen MAJOR.MINOR.PATCH-Format."""

    wert: str

    def __post_init__(self) -> None:
        if _SCHEMA_VERSION_RE.fullmatch(self.wert) is None:
            raise ValueError("SchemaVersion muss numerisch im Format MAJOR.MINOR.PATCH vorliegen.")

    @classmethod
    def parse(cls, text: str) -> Self:
        return cls(text)

    def __str__(self) -> str:
        return self.wert


@dataclass(frozen=True, slots=True)
class ProduktVersion:
    """Produktversion; bewusst anderer Typ als SchemaVersion."""

    wert: str

    def __post_init__(self) -> None:
        if _PRODUKT_VERSION_RE.fullmatch(self.wert) is None:
            raise ValueError(
                "ProduktVersion muss MAJOR.MINOR.PATCH oder MAJOR.MINOR.PATCH-SUFFIX sein."
            )

    @classmethod
    def parse(cls, text: str) -> Self:
        return cls(text)

    def __str__(self) -> str:
        return self.wert


MANIFEST_SCHEMA_VERSION: Final = SchemaVersion("1.0.0")
PROJEKT_SCHEMA_VERSION: Final = SchemaVersion("1.0.0")


def _pruefe_schluessel(
    daten: Mapping[str, object], *, erforderlich: frozenset[str], schema_name: str
) -> None:
    vorhanden = frozenset(daten)
    fehlend = erforderlich - vorhanden
    unbekannt = vorhanden - erforderlich
    if fehlend:
        raise SchemaValidierungsfehler(
            "SCHEMA_PFLICHTFELD_FEHLT",
            f"{schema_name}: Pflichtfeld fehlt: {', '.join(sorted(fehlend))}.",
            sorted(fehlend)[0],
        )
    if unbekannt:
        raise SchemaValidierungsfehler(
            "SCHEMA_UNBEKANNTES_FELD",
            f"{schema_name}: unbekanntes Feld: {', '.join(sorted(unbekannt))}.",
            sorted(unbekannt)[0],
        )


def _text(daten: Mapping[str, object], feld: str) -> str:
    wert = daten[feld]
    if not isinstance(wert, str):
        raise SchemaValidierungsfehler(
            "SCHEMA_FELDTYP_UNGUELTIG", f"Feld {feld} muss Text sein.", feld
        )
    return wert


def _schema_version(text: str, erwartet: SchemaVersion) -> SchemaVersion:
    try:
        version = SchemaVersion.parse(text)
    except ValueError as exc:
        raise SchemaValidierungsfehler(
            "SCHEMA_VERSION_UNGUELTIG", str(exc), "schema"
        ) from exc
    if version != erwartet:
        raise SchemaValidierungsfehler(
            "SCHEMA_VERSION_INKOMPATIBEL",
            f"Schema-Version {version} ist inkompatibel; erwartet wird {erwartet}.",
            "schema",
        )
    return version


def _produktversion(text: str) -> ProduktVersion:
    try:
        return ProduktVersion.parse(text)
    except ValueError as exc:
        raise SchemaValidierungsfehler(
            "PRODUKTVERSION_UNGUELTIG", str(exc), "produktversion"
        ) from exc


def _projekt_id(text: str) -> ProjektId:
    try:
        return ProjektId.parse(text)
    except ValueError as exc:
        raise SchemaValidierungsfehler("PROJEKT_ID_UNGUELTIG", str(exc), "projekt_id") from exc


@dataclass(frozen=True, slots=True)
class ManifestSchema:
    """Minimale, strikt versionierte Manifesthülle für PROVOWARE."""

    schema: SchemaVersion
    projekt_id: ProjektId
    produktversion: ProduktVersion

    ART: ClassVar[str] = "MANIFEST"
    PFLICHTFELDER: ClassVar[frozenset[str]] = frozenset(
        {"art", "schema", "projekt_id", "produktversion"}
    )

    def __post_init__(self) -> None:
        if self.schema != MANIFEST_SCHEMA_VERSION:
            raise ValueError(f"ManifestSchema benötigt Schema-Version {MANIFEST_SCHEMA_VERSION}.")

    @classmethod
    def aus_mapping(cls, daten: Mapping[str, object]) -> Self:
        _pruefe_schluessel(daten, erforderlich=cls.PFLICHTFELDER, schema_name=cls.__name__)
        art = _text(daten, "art")
        if art != cls.ART:
            raise SchemaValidierungsfehler(
                "SCHEMA_ART_UNGUELTIG", f"ManifestSchema erwartet art={cls.ART}.", "art"
            )
        return cls(
            schema=_schema_version(_text(daten, "schema"), MANIFEST_SCHEMA_VERSION),
            projekt_id=_projekt_id(_text(daten, "projekt_id")),
            produktversion=_produktversion(_text(daten, "produktversion")),
        )

    def als_dict(self) -> dict[str, str]:
        return {
            "art": self.ART,
            "schema": str(self.schema),
            "projekt_id": str(self.projekt_id),
            "produktversion": str(self.produktversion),
        }

    def als_json(self) -> str:
        return json.dumps(
            self.als_dict(), ensure_ascii=False, sort_keys=True, separators=(",", ":")
        )


@dataclass(frozen=True, slots=True)
class ProjektSchema:
    """Minimale, strikt versionierte Projektidentität ohne Persistenzsemantik."""

    schema: SchemaVersion
    projekt_id: ProjektId
    name: str
    produktversion: ProduktVersion
    status: Status

    ART: ClassVar[str] = "PROJEKT"
    PFLICHTFELDER: ClassVar[frozenset[str]] = frozenset(
        {"art", "schema", "projekt_id", "name", "produktversion", "status"}
    )

    def __post_init__(self) -> None:
        if self.schema != PROJEKT_SCHEMA_VERSION:
            raise ValueError(f"ProjektSchema benötigt Schema-Version {PROJEKT_SCHEMA_VERSION}.")
        if self.name != self.name.strip() or _PROJEKTNAME_RE.fullmatch(self.name) is None:
            raise ValueError(
                "Projektname muss 1-120 sichtbare Zeichen ohne Rand-Leerraum besitzen."
            )

    @classmethod
    def aus_mapping(cls, daten: Mapping[str, object]) -> Self:
        _pruefe_schluessel(daten, erforderlich=cls.PFLICHTFELDER, schema_name=cls.__name__)
        art = _text(daten, "art")
        if art != cls.ART:
            raise SchemaValidierungsfehler(
                "SCHEMA_ART_UNGUELTIG", f"ProjektSchema erwartet art={cls.ART}.", "art"
            )
        name = _text(daten, "name")
        if name != name.strip() or _PROJEKTNAME_RE.fullmatch(name) is None:
            raise SchemaValidierungsfehler(
                "PROJEKTNAME_UNGUELTIG",
                "Projektname muss 1-120 sichtbare Zeichen ohne Rand-Leerraum besitzen.",
                "name",
            )
        status_text = _text(daten, "status")
        try:
            status = Status(status_text)
        except ValueError as exc:
            raise SchemaValidierungsfehler(
                "STATUS_UNGUELTIG", f"Unbekannter Status: {status_text}.", "status"
            ) from exc
        return cls(
            schema=_schema_version(_text(daten, "schema"), PROJEKT_SCHEMA_VERSION),
            projekt_id=_projekt_id(_text(daten, "projekt_id")),
            name=name,
            produktversion=_produktversion(_text(daten, "produktversion")),
            status=status,
        )

    def als_dict(self) -> dict[str, str]:
        return {
            "art": self.ART,
            "schema": str(self.schema),
            "projekt_id": str(self.projekt_id),
            "name": self.name,
            "produktversion": str(self.produktversion),
            "status": self.status.value,
        }

    def als_json(self) -> str:
        return json.dumps(
            self.als_dict(), ensure_ascii=False, sort_keys=True, separators=(",", ":")
        )
