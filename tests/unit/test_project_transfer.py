import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="Node.js ist für den Projekttransfer-Vertragstest erforderlich.")


def run_contract():
    script = r'''
const fs = require("fs");
global.window = { Provoware: {} };
global.structuredClone = global.structuredClone || (value => JSON.parse(JSON.stringify(value)));
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function checksum(value) {
  const text = stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
window.Provoware.storage = {
  PROJECT_SCHEMA_VERSION: "1.2.0",
  checksum,
  createPayload(state) {
    return {
      schemaVersion: "1.2.0", projectId: state.projectId, name: state.projectName,
      answers: structuredClone(state.answers), currentQuestionId: state.currentQuestionId,
      theme: state.theme, questionCatalogVersion: state.catalog.catalogVersion,
      createdAt: state.createdAt, updatedAt: "2026-08-05T05:00:00.000Z",
      lastValidatedAt: "2026-08-05T05:00:00.000Z"
    };
  }
};
for (const path of ["js/migration-engine.js", "js/validation-engine.js", "js/project-repository.js", "js/project-transfer.js"]) {
  eval(fs.readFileSync(path, "utf8"));
}
const catalog = {
  catalogVersion: "1.0.0",
  phases: [{ id: "core", title: "Kern" }],
  questions: [
    { id: "q.one", phaseId: "core", required: true, options: [{ value: "a", label: "A" }, { value: "b", label: "B" }], recommendedValue: "a" },
    { id: "q.two", phaseId: "core", required: true, options: [{ value: "x", label: "X" }, { value: "y", label: "Y" }], recommendedValue: "x" }
  ]
};
const state = {
  projectId: "transfer-test", projectName: "Transfer Test", projectLifecycle: "active",
  revision: 4, answers: { "q.one": "a" }, currentQuestionId: "q.one", theme: "dark",
  createdAt: "2026-08-05T04:00:00.000Z", catalog
};
const transfer = window.Provoware.projectTransfer;
const packageData = transfer.createPackage(state, "0.8.0");
if (packageData.checksum !== checksum(transfer.coreFromPackage(packageData))) throw new Error("Exportprüfsumme ungültig.");
const freePreview = transfer.preparePreview(packageData, catalog, null);
if (!freePreview.valid || freePreview.allowedModes.join(",") !== "preserve,new") throw new Error("Freie Projekt-ID falsch bewertet.");

const existing = {
  record: { payload: { ...structuredClone(packageData.project), answers: { "q.one": "b", "q.two": "x" } } },
  summary: { id: "transfer-test", name: "Transfer Test", revision: 9, lifecycle: { state: "active" } }
};
const conflictPreview = transfer.preparePreview(packageData, catalog, existing);
if (!conflictPreview.valid || !conflictPreview.allowedModes.includes("replace") || conflictPreview.comparison.conflictCount < 1) {
  throw new Error("ID-Konflikt wurde nicht vollständig erkannt.");
}
const archivedPreview = transfer.preparePreview(packageData, catalog, {
  ...existing,
  summary: { ...existing.summary, lifecycle: { state: "archive" } }
});
if (archivedPreview.allowedModes.includes("replace")) throw new Error("Archiviertes Projekt darf nicht ersetzt werden.");

const tampered = structuredClone(packageData);
tampered.project.name = "Manipuliert";
const tamperedPreview = transfer.preparePreview(tampered, catalog, existing);
if (tamperedPreview.valid || tamperedPreview.checksumValid) throw new Error("Manipulierte Prüfsumme wurde akzeptiert.");

const unknown = structuredClone(packageData);
unknown.project.answers["q.unknown"] = "evil";
const unknownCore = transfer.coreFromPackage(unknown);
unknown.checksum = checksum(unknownCore);
const unknownPreview = transfer.preparePreview(unknown, catalog, null);
if (unknownPreview.valid || !unknownPreview.answerInspection.unknownQuestionIds.includes("q.unknown")) throw new Error("Unbekannte Frage-ID wurde nicht blockiert.");

const invalidValue = structuredClone(packageData);
invalidValue.project.answers["q.one"] = "invalid";
invalidValue.checksum = checksum(transfer.coreFromPackage(invalidValue));
const invalidPreview = transfer.preparePreview(invalidValue, catalog, null);
if (invalidPreview.valid || invalidPreview.answerInspection.invalidAnswerValues.length !== 1) throw new Error("Ungültiger Antwortwert wurde nicht blockiert.");

const legacy = structuredClone(packageData);
legacy.project = {
  schemaVersion: "1.1.0", projectId: "legacy-import", name: "Legacy Import",
  answers: { "q.one": "a" }, currentQuestionId: "q.one", theme: "dark",
  createdAt: "2026-08-05T03:00:00.000Z", updatedAt: "2026-08-05T03:00:00.000Z"
};
legacy.source.projectId = "legacy-import";
legacy.source.projectName = "Legacy Import";
legacy.source.projectSchemaVersion = "1.1.0";
legacy.checksum = checksum(transfer.coreFromPackage(legacy));
const legacyPreview = transfer.preparePreview(legacy, catalog, null);
if (!legacyPreview.valid || !legacyPreview.migrationRequired || legacyPreview.targetSchemaVersion !== "1.2.0") {
  throw new Error("Legacy-Paket wurde nicht kontrolliert migriert.");
}

let oversizedBlocked = false;
try { transfer.parseJsonText(`{"payload":"${"x".repeat(transfer.MAX_IMPORT_BYTES)}"}`); }
catch (_error) { oversizedBlocked = true; }
if (!oversizedBlocked) throw new Error("Dateigrößenlimit wurde nicht erzwungen.");

console.log(JSON.stringify({
  checksum: true,
  freeModes: freePreview.allowedModes,
  conflictCount: conflictPreview.comparison.conflictCount,
  legacySteps: legacyPreview.migrationSteps.length,
  blockedUnknown: unknownPreview.errors.length,
  blockedInvalid: invalidPreview.errors.length
}));
'''
    completed = subprocess.run(
        [NODE, "-e", script], cwd=ROOT, check=True, capture_output=True, text=True
    )
    return json.loads(completed.stdout)


def test_project_package_checksum_migration_and_conflicts():
    result = run_contract()
    assert result["checksum"] is True
    assert result["freeModes"] == ["preserve", "new"]
    assert result["conflictCount"] >= 1
    assert result["legacySteps"] == 1
    assert result["blockedUnknown"] >= 1
    assert result["blockedInvalid"] >= 1


def test_transfer_ui_requires_read_only_preview_and_replace_confirmation():
    manager = (ROOT / "js" / "project-transfer-manager.js").read_text(encoding="utf-8")
    app = (ROOT / "js" / "app.js").read_text(encoding="utf-8")
    assert "file.size > namespace.projectTransfer.MAX_IMPORT_BYTES" in manager
    assert "await file.text()" in manager
    assert 'mode === "replace"' in manager
    assert 'transfer-replace-checkbox' in manager
    assert 'transfer-replace-name' in manager
    assert '"pre-import-backup"' in app
    assert "inspectImportPackage" in app
    assert "applyImport" in app
