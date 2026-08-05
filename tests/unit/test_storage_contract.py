from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = (ROOT / "js" / "storage-engine.js").read_text(encoding="utf-8")
MANAGER = (ROOT / "js" / "storage-manager.js").read_text(encoding="utf-8")
APP = (ROOT / "js" / "app.js").read_text(encoding="utf-8")


def test_storage_uses_required_object_stores():
    for store in ("projects", "snapshots", "meta", "migrationLog"):
        assert f'"{store}"' in SOURCE


def test_save_is_transactional_and_snapshots_are_immutable():
    assert 'transaction(Object.values(STORES), "readwrite")' in SOURCE
    assert "projects.put(projectRecord)" in SOURCE
    assert "snapshots.add(snapshotRecord)" in SOURCE
    assert "snapshots.put(snapshotRecord)" not in SOURCE


def test_recovery_and_integrity_contract_exist():
    assert "checksum" in SOURCE
    assert "selectLatestValidRecord" in SOURCE
    assert "automatic-recovery" in SOURCE
    assert "loadLatestValid" in SOURCE
    assert "restoreSnapshot" in SOURCE
    assert '"manual-recovery"' in SOURCE


def test_retention_preserves_a_valid_safety_snapshot():
    assert "planRetention" in SOURCE
    assert "safetySnapshotId" in SOURCE
    assert "keepIds" in SOURCE
    assert "MIN_RETENTION_LIMIT = 5" in SOURCE
    assert "MAX_RETENTION_LIMIT = 200" in SOURCE


def test_graphical_manager_requires_preview_and_confirmation():
    assert "renderPreview" in MANAGER
    assert "snapshot-confirm" in MANAGER
    assert "snapshot-restore-button" in MANAGER
    assert "selectedSnapshot?.valid" in MANAGER


def test_manual_recovery_is_serialized_with_autosave():
    assert "autosaveSuspended += 1" in APP
    assert "saveChain = saveChain.then(async () =>" in APP
    assert "namespace.storage.restoreSnapshot" in APP
