from __future__ import annotations

import json
from pathlib import Path
from typing import cast

import pytest

from provoware.vertraege import (
    MANIFEST_SCHEMA_VERSION,
    PROJEKT_SCHEMA_VERSION,
    ManifestSchema,
    ProduktVersion,
    ProjektSchema,
    SchemaValidierungsfehler,
    SchemaVersion,
    Status,
)

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "i008"


def _fixture(name: str) -> dict[str, object]:
    raw = json.loads((FIXTURES / name).read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise AssertionError(f"Fixture {name} muss ein JSON-Objekt sein.")
    return cast(dict[str, object], raw)


@pytest.mark.contract
def test_schema_und_produktversion_sind_getrennte_typen() -> None:
    schema = SchemaVersion.parse("1.0.0")
    produkt = ProduktVersion.parse("0.1.0-dev")

    assert str(schema) == "1.0.0"
    assert str(produkt) == "0.1.0-dev"
    with pytest.raises(ValueError):
        SchemaVersion.parse(str(produkt))
    assert ProduktVersion.parse(str(produkt)) == produkt


@pytest.mark.contract
def test_autoritative_schema_versionen_sind_stabil() -> None:
    assert SchemaVersion("1.0.0") == MANIFEST_SCHEMA_VERSION
    assert SchemaVersion("1.0.0") == PROJEKT_SCHEMA_VERSION


@pytest.mark.contract
def test_manifest_golden_fixture_roundtrip_deterministisch() -> None:
    manifest = ManifestSchema.aus_mapping(_fixture("manifest_gueltig.json"))

    assert manifest.als_dict() == {
        "art": "MANIFEST",
        "schema": "1.0.0",
        "projekt_id": "prj_0123456789abcdef0123456789abcdef",
        "produktversion": "0.1.0-dev",
    }
    assert manifest.als_json() == (
        '{"art":"MANIFEST","produktversion":"0.1.0-dev",'
        '"projekt_id":"prj_0123456789abcdef0123456789abcdef","schema":"1.0.0"}'
    )


@pytest.mark.contract
def test_projekt_golden_fixture_roundtrip_deterministisch() -> None:
    projekt = ProjektSchema.aus_mapping(_fixture("projekt_gueltig.json"))

    assert projekt.name == "PROVOWARE"
    assert projekt.status is Status.BEREIT
    assert projekt.als_json() == (
        '{"art":"PROJEKT","name":"PROVOWARE","produktversion":"0.1.0-dev",'
        '"projekt_id":"prj_0123456789abcdef0123456789abcdef",'
        '"schema":"1.0.0","status":"BEREIT"}'
    )


@pytest.mark.contract
def test_manifest_unbekanntes_feld_wird_abgewiesen() -> None:
    with pytest.raises(SchemaValidierungsfehler) as exc_info:
        ManifestSchema.aus_mapping(_fixture("manifest_ungueltig_unbekanntes_feld.json"))

    assert exc_info.value.code == "SCHEMA_UNBEKANNTES_FELD"
    assert exc_info.value.feld == "spaeteres_fachfeld"


@pytest.mark.contract
def test_produktversion_darf_nicht_als_schema_version_durchrutschen() -> None:
    with pytest.raises(SchemaValidierungsfehler) as exc_info:
        ManifestSchema.aus_mapping(_fixture("manifest_ungueltig_schema_ist_produktversion.json"))

    assert exc_info.value.code == "SCHEMA_VERSION_UNGUELTIG"
    assert exc_info.value.feld == "schema"


@pytest.mark.contract
def test_fehlendes_projektpflichtfeld_wird_strukturiert_gemeldet() -> None:
    with pytest.raises(SchemaValidierungsfehler) as exc_info:
        ProjektSchema.aus_mapping(_fixture("projekt_ungueltig_pflichtfeld_fehlt.json"))

    assert exc_info.value.als_dict() == {
        "code": "SCHEMA_PFLICHTFELD_FEHLT",
        "feld": "status",
        "nachricht": "ProjektSchema: Pflichtfeld fehlt: status.",
    }


@pytest.mark.contract
def test_inkompatible_schema_version_wird_abgewiesen() -> None:
    daten = _fixture("manifest_gueltig.json")
    daten["schema"] = "2.0.0"

    with pytest.raises(SchemaValidierungsfehler) as exc_info:
        ManifestSchema.aus_mapping(daten)

    assert exc_info.value.code == "SCHEMA_VERSION_INKOMPATIBEL"


@pytest.mark.contract
def test_falsche_schema_art_wird_abgewiesen() -> None:
    daten = _fixture("projekt_gueltig.json")
    daten["art"] = "MANIFEST"

    with pytest.raises(SchemaValidierungsfehler) as exc_info:
        ProjektSchema.aus_mapping(daten)

    assert exc_info.value.code == "SCHEMA_ART_UNGUELTIG"


@pytest.mark.contract
def test_ungueltiger_status_wird_strukturiert_abgewiesen() -> None:
    daten = _fixture("projekt_gueltig.json")
    daten["status"] = "FERTIG"

    with pytest.raises(SchemaValidierungsfehler) as exc_info:
        ProjektSchema.aus_mapping(daten)

    assert exc_info.value.code == "STATUS_UNGUELTIG"
    assert exc_info.value.feld == "status"
