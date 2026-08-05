import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="Node.js ist für den Projektverwaltungs-Vertragstest erforderlich.")


def run_project_contract():
    script = r'''
const fs = require("fs");
global.window = { Provoware: { storage: { PROJECT_SCHEMA_VERSION: "1.2.0" } } };
global.structuredClone = global.structuredClone || (value => JSON.parse(JSON.stringify(value)));
eval(fs.readFileSync("js/project-repository.js", "utf8"));
const repository = window.Provoware.projectRepository;
const lifecycle = repository.normalizeLifecycle({}, "alpha-project");
if (lifecycle.state !== "active" || lifecycle.key !== "lifecycle:alpha-project") throw new Error("Legacy-Projekte müssen standardmäßig aktiv sein.");
if (!repository.lifecycleActionAllowed("active", "archive")) throw new Error("Archivieren fehlt.");
if (!repository.lifecycleActionAllowed("archive", "restore")) throw new Error("Archivwiederherstellung fehlt.");
if (!repository.lifecycleActionAllowed("trash", "delete")) throw new Error("Papierkorblöschung fehlt.");
if (repository.lifecycleActionAllowed("archive", "open")) throw new Error("Archiviertes Projekt darf nicht direkt geöffnet werden.");
const projectId = repository.createProjectId("Mein neues Projekt", []);
if (!/^mein-neues-projekt-[a-z0-9]+$/.test(projectId)) throw new Error(`Ungültige Projekt-ID: ${projectId}`);
const payload = repository.createBlankPayload({
  projectId,
  name: "Mein neues Projekt",
  catalogVersion: "1.0.0",
  currentQuestionId: "project.goal_clarity",
  theme: "dark"
});
if (payload.projectId !== projectId || payload.schemaVersion !== "1.2.0") throw new Error("Leerer Projektstand ist inkonsistent.");
if (Object.keys(payload.answers).length !== 0) throw new Error("Neues Projekt darf keine fremden Antworten enthalten.");
let shortNameBlocked = false;
try { repository.validateName("x"); } catch (_error) { shortNameBlocked = true; }
if (!shortNameBlocked) throw new Error("Zu kurzer Projektname wurde nicht blockiert.");
console.log(JSON.stringify({ projectId, lifecycle: lifecycle.state, schema: payload.schemaVersion }));
'''
    completed = subprocess.run(
        [NODE, "-e", script],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed.stdout)


def test_project_lifecycle_and_blank_project_contract():
    result = run_project_contract()
    assert result["lifecycle"] == "active"
    assert result["schema"] == "1.2.0"


def test_permanent_delete_is_scoped_and_confirmed():
    source = (ROOT / "js" / "project-repository.js").read_text(encoding="utf-8")
    assert 'transaction(Object.values(namespace.storage.STORES), "readwrite")' in source
    assert 'String(expectedName || "") !== actualName' in source
    assert 'lifecycleActionAllowed(lifecycle.state, "delete")' in source
    assert 'snapshots.index("projectId")' in source
    assert 'migrations.index("projectId")' in source
    assert "projects.delete(projectId)" in source


def test_switching_and_fallback_are_serialized():
    source = (ROOT / "js" / "app.js").read_text(encoding="utf-8")
    assert "settlePendingSave" in source
    assert 'persistNow("project-switch")' in source or 'settlePendingSave("project-switch")' in source
    assert "activateFallback" in source
    assert 'item.lifecycle.state === "active"' in source


def test_project_manager_requires_exact_delete_confirmation():
    source = (ROOT / "js" / "project-manager.js").read_text(encoding="utf-8")
    assert 'value !== pendingAction.project.name' in source
    assert 'project-action-checkbox' in source
    assert 'Endgültig löschen' in source
