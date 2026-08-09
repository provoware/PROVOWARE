from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_p01_ordnerstruktur() -> None:
    for rel in ["src", "tests", "WERKZEUGE", "docs", "EVIDENCE"]:
        assert (ROOT / rel).is_dir(), rel


def test_i007_implementiert_nur_vertragsschicht() -> None:
    files = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "src").rglob("*.py"))
    assert files == [
        "src/provoware/__init__.py",
        "src/provoware/vertraege/__init__.py",
        "src/provoware/vertraege/datentypen.py",
    ]
