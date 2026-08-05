from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_accessibility_module_covers_dialog_stack_focus_and_escape():
    source = (ROOT / "js" / "accessibility.js").read_text(encoding="utf-8")
    assert "dialogStack" in source
    assert "openerByDialog" in source
    assert "focusableElements" in source
    assert 'event.key !== "Tab"' in source
    assert 'event.key !== "Escape"' in source
    assert 'new Event("cancel"' in source
    assert "showModal" in source
    assert "queueMicrotask" in source


def test_arrow_navigation_and_basic_audit_are_present():
    source = (ROOT / "js" / "accessibility.js").read_text(encoding="utf-8")
    for marker in (
        "data-arrow-navigation",
        '"ArrowUp"',
        '"ArrowDown"',
        '"ArrowLeft"',
        '"ArrowRight"',
        '"Home"',
        '"End"',
        "Doppelte ID",
        "Schaltfläche ohne zugänglichen Namen",
        "Formularfeld ohne Beschriftung",
        "Dialog ohne gültige Überschrift",
        "Positiver tabindex",
    ):
        assert marker in source


def test_all_major_dialogs_are_labelled_and_navigation_marked():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    for dialog_id in ("project-dialog", "transfer-dialog", "report-dialog", "storage-dialog"):
        assert f'id="{dialog_id}"' in html
        assert f'id="{dialog_id}" class="storage-dialog" aria-labelledby=' in html
    assert html.count('data-arrow-navigation="vertical"') >= 2
    assert html.count('data-arrow-navigation="horizontal"') >= 2
    assert 'id="transfer-audit-result"' in html
