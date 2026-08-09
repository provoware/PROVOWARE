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


def test_schemaschicht_hat_keine_verbotenen_importe() -> None:
    text = (ROOT / "src/provoware/vertraege/schemata.py").read_text(encoding="utf-8").lower()
    for verboten in ["pyside", "pyqt", "sqlite", "pathlib", "open(", "provoware.module"]:
        assert verboten not in text, verboten
