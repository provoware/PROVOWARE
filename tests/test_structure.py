from __future__ import annotations

import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_p01_ordnerstruktur() -> None:
    for rel in ["src", "tests", "WERKZEUGE", "docs", "EVIDENCE"]:
        assert (ROOT / rel).is_dir(), rel


def test_i008_implementiert_nur_vertrags_und_schemaschicht() -> None:
    files = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "src").rglob("*.py"))
    assert files == [
        "src/provoware/__init__.py",
        "src/provoware/vertraege/__init__.py",
        "src/provoware/vertraege/datentypen.py",
        "src/provoware/vertraege/schemata.py",
    ]


def test_schemaschicht_hat_keine_verbotenen_importe_oder_dateizugriffe() -> None:
    source = (ROOT / "src/provoware/vertraege/schemata.py").read_text(encoding="utf-8")
    baum = ast.parse(source)
    verbotene_module = ("PySide", "PyQt", "sqlite", "pathlib", "provoware.module")

    for knoten in ast.walk(baum):
        if isinstance(knoten, ast.Import):
            for alias in knoten.names:
                assert not alias.name.startswith(verbotene_module), alias.name
        elif isinstance(knoten, ast.ImportFrom):
            modul = knoten.module or ""
            assert not modul.startswith(verbotene_module), modul
        elif isinstance(knoten, ast.Call) and isinstance(knoten.func, ast.Name):
            assert knoten.func.id != "open", "open"
