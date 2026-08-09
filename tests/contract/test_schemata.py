from __future__ import annotations

import pytest

from provoware.vertraege.schemata import ManifestSchema, ProjektSchema, SCHEMA_VERSION

PID = "prj_0123456789abcdef0123456789abcdef"


@pytest.mark.contract
def test_projektschema_akzeptiert_minimal_gueltigen_vertrag() -> None:
    wert, fehler = ProjektSchema.validiere({"schema": SCHEMA_VERSION, "projekt_id": PID, "name": "Demo", "version": "0.1.0"})
    assert fehler == ()
    assert wert is not None and str(wert.projekt_id) == PID


@pytest.mark.contract
def test_projektschema_blockiert_unbekannte_felder() -> None:
    wert, fehler = ProjektSchema.validiere({"schema": SCHEMA_VERSION, "projekt_id": PID, "name": "Demo", "version": "0.1.0", "extra": True})
    assert wert is None
    assert {x.code for x in fehler} == {"SCHEMA_FELD_UNBEKANNT"}


@pytest.mark.contract
def test_projektschema_blockiert_fehlendes_pflichtfeld() -> None:
    wert, fehler = ProjektSchema.validiere({"schema": SCHEMA_VERSION, "projekt_id": PID, "name": "Demo"})
    assert wert is None
    assert "SCHEMA_PFLICHTFELD_FEHLT" in {x.code for x in fehler}


@pytest.mark.contract
def test_projektschema_blockiert_fremde_version() -> None:
    wert, fehler = ProjektSchema.validiere({"schema": "2.0.0", "projekt_id": PID, "name": "Demo", "version": "0.1.0"})
    assert wert is None
    assert "SCHEMA_VERSION_UNTERSTUETZT_NICHT" in {x.code for x in fehler}


@pytest.mark.contract
def test_manifest_akzeptiert_gueltigen_vertrag() -> None:
    wert, fehler = ManifestSchema.validiere({"schema": SCHEMA_VERSION, "projekt_id": PID, "revision": 0, "eintraege": ["a", "b"]})
    assert fehler == ()
    assert wert is not None and wert.eintraege == ("a", "b")


@pytest.mark.contract
def test_manifest_blockiert_bool_als_revision() -> None:
    wert, fehler = ManifestSchema.validiere({"schema": SCHEMA_VERSION, "projekt_id": PID, "revision": True, "eintraege": []})
    assert wert is None
    assert "SCHEMA_REVISION_UNGUELTIG" in {x.code for x in fehler}


@pytest.mark.contract
def test_manifest_blockiert_untypisierte_eintraege() -> None:
    wert, fehler = ManifestSchema.validiere({"schema": SCHEMA_VERSION, "projekt_id": PID, "revision": 1, "eintraege": ["ok", 7]})
    assert wert is None
    assert "SCHEMA_EINTRAEGE_UNGUELTIG" in {x.code for x in fehler}


@pytest.mark.contract
def test_schemafehler_ist_strukturiert_und_uebersetzbar() -> None:
    _, fehler = ProjektSchema.validiere({"schema": SCHEMA_VERSION, "projekt_id": PID, "name": "Demo"})
    info = fehler[0].als_fehlerinfo()
    assert info.code == "SCHEMA_PFLICHTFELD_FEHLT"
    assert info.klasse.value == "VALIDIERUNG"
