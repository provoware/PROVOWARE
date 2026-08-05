from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = (ROOT / "js" / "storage-engine.js").read_text(encoding="utf-8")


def test_quota_and_abort_failpoints_exist_and_are_test_only():
    assert "quota-before-write" in SOURCE
    assert "abort-after-project-put" in SOURCE
    assert "QuotaExceededError" in SOURCE
    assert "transaction.abort()" in SOURCE
    assert "__PROVOWARE_TESTING__" in SOURCE


def test_migration_is_atomic_and_keeps_original_snapshots():
    assert "migrateProjectAndSnapshots" in SOURCE
    assert 'transaction(Object.values(STORES), "readwrite")' in SOURCE
    assert 'reason: "pre-migration-backup"' in SOURCE
    assert 'reason: "snapshot-migration"' in SOURCE
    assert 'reason: "schema-migration"' in SOURCE
    assert "snapshotStore.add" in SOURCE
    assert "snapshotStore.put" not in SOURCE


def test_damaged_snapshot_sequences_are_skipped():
    assert "selectLatestUsableRecord" in SOURCE
    assert "prepareRecord" in SOURCE
    assert "prepared.checksumValid && prepared.valid" in SOURCE
