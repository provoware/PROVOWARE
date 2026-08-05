import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
NODE = shutil.which("node")
pytestmark = pytest.mark.skipif(NODE is None, reason="Node.js ist für den Vorlagenvertrag erforderlich.")


def run_node_contract():
    script = r'''
const fs = require("fs");
global.window = { Provoware: {} };
global.structuredClone = global.structuredClone || (value => JSON.parse(JSON.stringify(value)));
const ns = window.Provoware;
function load(path) { eval(fs.readFileSync(path, "utf8")); }
load("js/rule-engine.js");
const manifest = JSON.parse(fs.readFileSync("data/templates.json", "utf8"));
for (const entry of manifest.templates) load(entry.modulePath);
load("js/template-core.js");
const questions = JSON.parse(fs.readFileSync("data/questions.json", "utf8"));
const rules = JSON.parse(fs.readFileSync("data/rules.json", "utf8")).rules;
const appState = { catalog: questions, rules, templates: manifest.templates, answers: { "project.scope": "minimal" } };
const core = ns.templateProfilesCore;
const catalog = { catalogVersion: manifest.catalogVersion, profileSchemaVersion: manifest.profileSchemaVersion, templates: ns.templateBuiltinTemplates };
const validation = core.validateCatalog(catalog, appState);
if (!validation.valid) throw new Error(validation.errors.join("\n"));
if (validation.templateCount !== 6 || validation.profileCount !== 18) throw new Error("Katalogumfang falsch.");
if (manifest.templates.reduce((sum, item) => sum + item.profileCount, 0) !== 18) throw new Error("Manifest-Profilzahl falsch.");
for (const descriptor of manifest.templates) {
  if (!fs.existsSync(descriptor.modulePath)) throw new Error(`Modul fehlt: ${descriptor.modulePath}`);
  const template = catalog.templates.find(item => item.id === descriptor.id);
  if (!template || template.profiles.length !== descriptor.profileCount) throw new Error(`Profilzahl stimmt nicht: ${descriptor.id}`);
  for (const profile of template.profiles) {
    if (Object.keys(profile.answers).length !== questions.questions.length) throw new Error(`Unvollständige Antworten: ${template.id}/${profile.id}`);
    const critical = ns.rules.evaluate(rules, profile.answers).filter(rule => rule.severity === "critical");
    if (critical.length) throw new Error(`Integriertes Profil enthält kritischen Konflikt: ${template.id}/${profile.id}`);
  }
}
const entry = { key: "test", kind: "builtin", template: catalog.templates[0], profile: catalog.templates[0].profiles[1] };
const preview = core.buildPreview(entry, appState);
if (!preview.valid || preview.differences.length !== questions.questions.length || preview.changedCount < 1) throw new Error("Vorschauvertrag falsch.");
const packageData = core.createProfilePackage(entry.profile);
const restored = core.parseProfilePackage(JSON.stringify(packageData), appState);
if (restored.id !== entry.profile.id) throw new Error("Profilexport nicht wiederherstellbar.");
const tampered = structuredClone(packageData);
tampered.profile.title = "Manipuliert";
let blocked = false;
try { core.parseProfilePackage(JSON.stringify(tampered), appState); } catch (_error) { blocked = true; }
if (!blocked) throw new Error("Manipuliertes Profilpaket wurde akzeptiert.");
const incomplete = structuredClone(entry.profile);
delete incomplete.answers[questions.questions[0].id];
if (core.validateProfile(incomplete, appState).valid) throw new Error("Unvollständiges Profil wurde akzeptiert.");
console.log(JSON.stringify({ templates: validation.templateCount, profiles: validation.profileCount, differences: preview.differences.length, tamperBlocked: blocked }));
'''
    completed = subprocess.run([NODE, "-e", script], cwd=ROOT, check=True, capture_output=True, text=True)
    return json.loads(completed.stdout)


def test_modular_template_catalog_and_profiles_are_complete():
    result = run_node_contract()
    assert result == {"templates": 6, "profiles": 18, "differences": 6, "tamperBlocked": True}


def test_template_runtime_contract_is_safe_and_local():
    state = (ROOT / "js" / "state-manager.js").read_text(encoding="utf-8")
    loader = (ROOT / "js" / "template-manager.js").read_text(encoding="utf-8")
    core = (ROOT / "js" / "template-core.js").read_text(encoding="utf-8")
    ui = (ROOT / "js" / "template-ui.js").read_text(encoding="utf-8")
    assert 'script.src = "js/template-manager.js"' in state
    assert "data/template-profiles" in loader
    assert "template-catalog-adapter.js" in loader
    assert 'PROFILE_TYPE = "template-profile"' in core
    assert 'type: "template-origin"' in core
    assert "Fehlende Frage-IDs" in core
    assert "Erwartete Regeln stimmen nicht" in core
    assert '"project-created-from-template"' in ui
    assert "lastPreviewFingerprint" in ui
    assert 'id="template-confirm"' in ui
    assert 'id="template-critical-confirm"' in ui
    assert "https://" not in loader + core + ui
    assert "http://" not in loader + core + ui


def test_all_template_javascript_modules_pass_node_syntax_check():
    paths = [
        ROOT / "js" / "template-manager.js",
        ROOT / "js" / "template-core.js",
        ROOT / "js" / "template-catalog-adapter.js",
        ROOT / "js" / "template-ui.js",
        *sorted((ROOT / "data" / "template-profiles").glob("*.js")),
        ROOT / "tests" / "smoke" / "template-profile-smoke.js",
    ]
    assert len(paths) == 11
    for path in paths:
        subprocess.run([NODE, "--check", str(path)], check=True, capture_output=True, text=True)
