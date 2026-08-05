from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_index_contains_accessible_core_regions():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    for marker in (
        "<header", "<main", "<nav", "<section", "<aside", "<footer", "<dialog",
        'aria-live="polite"', 'id="storage-manager-button"', 'id="snapshot-confirm"',
        'src="js/migration-engine.js"'
    ):
        assert marker in html
    assert html.index('src="js/migration-engine.js"') < html.index('src="js/storage-engine.js"')


def test_runtime_has_no_remote_assets():
    runtime_files = [ROOT / "index.html", *list((ROOT / "css").glob("*.css")), *list((ROOT / "js").rglob("*.js"))]
    for path in runtime_files:
        text = path.read_text(encoding="utf-8")
        assert "https://" not in text
        assert "http://" not in text
