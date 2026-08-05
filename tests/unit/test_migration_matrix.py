import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SOURCE = (ROOT / "js" / "migration-engine.js").read_text(encoding="utf-8")


def test_migration_matrix_declares_all_required_steps():
    assert '"1.0.0"' in SOURCE
    assert 'to: "1.1.0"' in SOURCE
    assert '"1.1.0"' in SOURCE
    assert 'to: TARGET_SCHEMA_VERSION' in SOURCE
    assert 'TARGET_SCHEMA_VERSION = "1.2.0"' in SOURCE


def test_migration_matrix_runs_stepwise_with_node():
    node = shutil.which("node")
    if not node:
        pytest.skip("Node.js ist nicht installiert.")
    script = f"""
      global.window = {{}};
      global.structuredClone = global.structuredClone || (value => JSON.parse(JSON.stringify(value)));
      eval({json.dumps(SOURCE)});
      const m = window.Provoware.migrations;
      const now = '2026-08-05T03:00:00.000Z';
      const v100 = {json.dumps(json.loads((ROOT / 'tests/fixtures/project-v1.0.0.json').read_text(encoding='utf-8')))};
      const v110 = {json.dumps(json.loads((ROOT / 'tests/fixtures/project-v1.1.0.json').read_text(encoding='utf-8')))};
      const v120 = {json.dumps(json.loads((ROOT / 'tests/fixtures/project-valid.json').read_text(encoding='utf-8')))};
      const a = m.migratePayload(v100, {{now, catalogVersion:'1.0.0'}});
      const b = m.migratePayload(v110, {{now, catalogVersion:'1.0.0'}});
      const c = m.migratePayload(v120, {{now, catalogVersion:'1.0.0'}});
      console.log(JSON.stringify({{a:a.steps,b:b.steps,c:c.steps,payload:a.payload}}));
    """
    result = subprocess.run([node, "-e", script], check=True, capture_output=True, text=True)
    output = json.loads(result.stdout)
    assert output["a"] == [{"from": "1.0.0", "to": "1.1.0"}, {"from": "1.1.0", "to": "1.2.0"}]
    assert output["b"] == [{"from": "1.1.0", "to": "1.2.0"}]
    assert output["c"] == []
    assert output["payload"]["questionCatalogVersion"] == "1.0.0"
    assert output["payload"]["lastValidatedAt"] == "2026-08-05T03:00:00.000Z"
