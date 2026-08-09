from __future__ import annotations

import ast
import json
from pathlib import Path

import provoware.vertraege as vertraege
from provoware.vertraege import (
    MANIFEST_SCHEMA_VERSION,
    OPERATION_SCHEMA_VERSION,
    PROJEKT_SCHEMA_VERSION,
    ChangeId,
    Fehlerklasse,
    ObjektId,
    OperationId,
    ProjektId,
    RevisionId,
    Status,
)

ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT = json.loads(
    (ROOT / "tests/fixtures/i010/p02_api_snapshot.json").read_text(encoding="utf-8")
)


def test_oeffentliche_api_entspricht_snapshot() -> None:
    assert vertraege.__all__ == SNAPSHOT["oeffentliche_symbole"]


def test_id_praefixe_und_enums_bleiben_stabil() -> None:
    klassen = {
        "ChangeId": ChangeId,
        "ObjektId": ObjektId,
        "OperationId": OperationId,
        "ProjektId": ProjektId,
        "RevisionId": RevisionId,
    }
    assert {name: cls.PRAEFIX for name, cls in klassen.items()} == SNAPSHOT["id_praefixe"]
    assert [wert.value for wert in Status] == SNAPSHOT["statuswerte"]
    assert [wert.value for wert in Fehlerklasse] == SNAPSHOT["fehlerklassen"]


def test_schema_versionen_bleiben_getrennt_und_stabil() -> None:
    assert str(MANIFEST_SCHEMA_VERSION) == SNAPSHOT["schema_versionen"]["manifest"]
    assert str(OPERATION_SCHEMA_VERSION) == SNAPSHOT["schema_versionen"]["operation"]
    assert str(PROJEKT_SCHEMA_VERSION) == SNAPSHOT["schema_versionen"]["projekt"]


def test_exaktes_p02_produktquellinventar() -> None:
    gefunden = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "src").rglob("*.py"))
    assert gefunden == SNAPSHOT["produktquellen"]


def test_gesamte_p02_vertragsschicht_bleibt_architektonisch_rein() -> None:
    verbotene_praefixe = (
        "PySide",
        "PyQt",
        "sqlite",
        "pathlib",
        "provoware.module",
        "provoware.ui",
        "provoware.handler",
        "provoware.persistenz",
    )
    for rel in SNAPSHOT["produktquellen"]:
        source = (ROOT / rel).read_text(encoding="utf-8")
        baum = ast.parse(source)
        for knoten in ast.walk(baum):
            if isinstance(knoten, ast.Import):
                for alias in knoten.names:
                    assert not alias.name.startswith(verbotene_praefixe), (rel, alias.name)
            elif isinstance(knoten, ast.ImportFrom):
                modul = knoten.module or ""
                assert not modul.startswith(verbotene_praefixe), (rel, modul)
            elif isinstance(knoten, ast.Call) and isinstance(knoten.func, ast.Name):
                assert knoten.func.id != "open", rel
