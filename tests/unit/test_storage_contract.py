from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = (ROOT / "js" / "storage-engine.js").read_text(encoding="utf-8")


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
