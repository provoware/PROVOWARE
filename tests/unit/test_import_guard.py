from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_replace_guard_rechecks_project_revision_and_confirmation():
    source = (ROOT / "js" / "project-transfer-manager.js").read_text(encoding="utf-8")

    assert "namespace.projectRepository.getProjectRecord(candidatePreview.payload.projectId)" in source
    assert "current.summary.revision !== candidatePreview.existingProject.revision" in source
    assert "Das lokale Projekt wurde seit der Vorschau verändert" in source
    assert 'candidatePreview.existingProject?.lifecycle?.state !== "active"' in source
    assert 'elements["transfer-replace-checkbox"]?.checked !== true' in source
    assert 'elements["transfer-replace-name"]?.value !== candidatePreview.existingProject?.name' in source


def test_new_import_name_is_bounded_and_suffix_is_not_duplicated():
    transfer = (ROOT / "js" / "project-transfer.js").read_text(encoding="utf-8")
    manager = (ROOT / "js" / "project-transfer-manager.js").read_text(encoding="utf-8")

    assert "80 - suffix.length" in transfer
    assert 'return `${base || "Projekt"}${suffix}`' in transfer
    assert 'replace(/ – Import$/, "")' in manager
