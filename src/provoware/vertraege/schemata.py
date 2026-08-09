"""Reine, strikt validierbare Manifest- und Projektverträge ohne I/O-Abhängigkeit."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Final, Mapping, Self

from provoware.vertraege.datentypen import FehlerInfo, Fehlerklasse, ProjektId

SCHEMA_VERSION: Final = "1.0.0"


@dataclass(frozen=True, slots=True)
class SchemaFehler:
    feld: str
    code: str
    nachricht: str

    def als_fehlerinfo(self) -> FehlerInfo:
        return FehlerInfo(Fehlerklasse.VALIDIERUNG, self.code, f"{self.feld}: {self.nachricht}")


def _pruefe_felder(daten: Mapping[str, object], *, erlaubt: frozenset[str], pflicht: frozenset[str]) -> tuple[SchemaFehler, ...]:
    fehler: list[SchemaFehler] = []
    for feld in sorted(pflicht - daten.keys()):
        fehler.append(SchemaFehler(feld, "SCHEMA_PFLICHTFELD_FEHLT", "Pflichtfeld fehlt."))
    for feld in sorted(daten.keys() - erlaubt):
        fehler.append(SchemaFehler(feld, "SCHEMA_FELD_UNBEKANNT", "Unbekanntes Feld ist nicht erlaubt."))
    return tuple(fehler)


def _text(daten: Mapping[str, object], feld: str) -> str | None:
    wert = daten.get(feld)
    return wert if isinstance(wert, str) and bool(wert.strip()) else None


@dataclass(frozen=True, slots=True)
class ProjektSchema:
    schema: str
    projekt_id: ProjektId
    name: str
    version: str

    @classmethod
    def validiere(cls, daten: Mapping[str, object]) -> tuple[Self | None, tuple[SchemaFehler, ...]]:
        erlaubt = frozenset({"schema", "projekt_id", "name", "version"})
        fehler = list(_pruefe_felder(daten, erlaubt=erlaubt, pflicht=erlaubt))
        schema = _text(daten, "schema")
        if schema is not None and schema != SCHEMA_VERSION:
            fehler.append(SchemaFehler("schema", "SCHEMA_VERSION_UNTERSTUETZT_NICHT", f"Erwartet {SCHEMA_VERSION}."))
        projekt_id_text = _text(daten, "projekt_id")
        projekt_id: ProjektId | None = None
        if projekt_id_text is not None:
            try:
                projekt_id = ProjektId.parse(projekt_id_text)
            except ValueError:
                fehler.append(SchemaFehler("projekt_id", "SCHEMA_PROJEKT_ID_UNGUELTIG", "Projekt-ID ist ungültig."))
        name = _text(daten, "name")
        version = _text(daten, "version")
        for feld, wert in (("schema", schema), ("projekt_id", projekt_id_text), ("name", name), ("version", version)):
            if feld in daten and wert is None:
                fehler.append(SchemaFehler(feld, "SCHEMA_TYP_UNGUELTIG", "Nichtleerer Text erwartet."))
        if fehler or projekt_id is None or schema is None or name is None or version is None:
            return None, tuple(fehler)
        return cls(schema, projekt_id, name, version), ()


@dataclass(frozen=True, slots=True)
class ManifestSchema:
    schema: str
    projekt_id: ProjektId
    revision: int
    eintraege: tuple[str, ...]

    @classmethod
    def validiere(cls, daten: Mapping[str, object]) -> tuple[Self | None, tuple[SchemaFehler, ...]]:
        erlaubt = frozenset({"schema", "projekt_id", "revision", "eintraege"})
        fehler = list(_pruefe_felder(daten, erlaubt=erlaubt, pflicht=erlaubt))
        schema = _text(daten, "schema")
        if schema is not None and schema != SCHEMA_VERSION:
            fehler.append(SchemaFehler("schema", "SCHEMA_VERSION_UNTERSTUETZT_NICHT", f"Erwartet {SCHEMA_VERSION}."))
        projekt_id_text = _text(daten, "projekt_id")
        projekt_id: ProjektId | None = None
        if projekt_id_text is not None:
            try:
                projekt_id = ProjektId.parse(projekt_id_text)
            except ValueError:
                fehler.append(SchemaFehler("projekt_id", "SCHEMA_PROJEKT_ID_UNGUELTIG", "Projekt-ID ist ungültig."))
        revision_obj = daten.get("revision")
        revision = revision_obj if isinstance(revision_obj, int) and not isinstance(revision_obj, bool) and revision_obj >= 0 else None
        if "revision" in daten and revision is None:
            fehler.append(SchemaFehler("revision", "SCHEMA_REVISION_UNGUELTIG", "Nichtnegative Ganzzahl erwartet."))
        eintraege_obj = daten.get("eintraege")
        eintraege: tuple[str, ...] | None = None
        if isinstance(eintraege_obj, list) and all(isinstance(x, str) and bool(x.strip()) for x in eintraege_obj):
            eintraege = tuple(eintraege_obj)
        elif "eintraege" in daten:
            fehler.append(SchemaFehler("eintraege", "SCHEMA_EINTRAEGE_UNGUELTIG", "Liste nichtleerer Texte erwartet."))
        if "schema" in daten and schema is None:
            fehler.append(SchemaFehler("schema", "SCHEMA_TYP_UNGUELTIG", "Nichtleerer Text erwartet."))
        if "projekt_id" in daten and projekt_id_text is None:
            fehler.append(SchemaFehler("projekt_id", "SCHEMA_TYP_UNGUELTIG", "Nichtleerer Text erwartet."))
        if fehler or projekt_id is None or schema is None or revision is None or eintraege is None:
            return None, tuple(fehler)
        return cls(schema, projekt_id, revision, eintraege), ()
