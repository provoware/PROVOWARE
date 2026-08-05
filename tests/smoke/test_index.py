from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_index_contains_accessible_core_regions():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    for marker in (
        "<header", "<main", "<nav", "<section", "<aside", "<footer", "<dialog",
        'aria-live="polite"', 'id="storage-manager-button"', 'id="snapshot-confirm"',
        'id="report-manager-button"', 'id="report-dialog"', 'id="report-preview-content"',
        'id="project-manager-button"', 'id="project-dialog"', 'id="project-new-form"',
        'id="project-filter"', 'id="project-action-checkbox"', 'id="current-project-name"',
        'data-report-format="markdown"', 'data-report-format="html"',
        'data-report-format="text"', 'data-report-format="json"',
        'src="js/migration-engine.js"', 'src="js/project-repository.js"',
        'src="js/project-manager.js"', 'src="js/report-manager.js"'
    ):
        assert marker in html
    assert html.index('src="js/migration-engine.js"') < html.index('src="js/storage-engine.js"')
    assert html.index('src="js/storage-engine.js"') < html.index('src="js/project-repository.js"') < html.index('src="js/state-manager.js"')
    assert html.index('src="js/report-generator.js"') < html.index('src="js/project-manager.js"') < html.index('src="js/app.js"')


def test_runtime_has_no_remote_assets():
    runtime_files = [ROOT / "index.html", *list((ROOT / "css").glob("*.css")), *list((ROOT / "js").rglob("*.js"))]
    for path in runtime_files:
        text = path.read_text(encoding="utf-8")
        assert "https://" not in text
        assert "http://" not in text
