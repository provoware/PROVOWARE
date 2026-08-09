from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_p01_ordnerstruktur() -> None:
    for rel in ["src", "tests", "WERKZEUGE", "docs", "EVIDENCE"]:
        assert (ROOT / rel).is_dir(), rel


def test_keine_breite_fachimplementierung_vor_i005() -> None:
    files = [p for p in (ROOT / "src").rglob("*.py")]
    assert [p.relative_to(ROOT).as_posix() for p in files] == ["src/provoware/__init__.py"]
