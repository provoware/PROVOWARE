#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXPECTED_FILES = [
    ".github/workflows/ci.yml",
    "README.md", "TODO.md", "CHANGELOG.md", "SCHWACHSTELLEN.md", "AGENTS.md",
    "UPGRADEPOOL.md", "PROJEKTORDNERSTRUKTUR.md", "requirements.txt", "index.html",
    "css/variables.css", "css/layout.css", "css/components.css", "css/themes.css",
    "css/project-manager.css", "css/project-transfer.css",
    "js/app.js", "js/migration-engine.js", "js/storage-engine.js", "js/project-repository.js",
    "js/project-manager.js", "js/project-transfer.js", "js/project-transfer-manager.js",
    "js/accessibility.js", "js/storage-manager.js", "js/state-manager.js", "js/workflow-engine.js",
    "js/rule-engine.js", "js/validation-engine.js", "js/report-generator.js", "js/report-manager.js",
    "js/ui/app-ui.js",
    "data/questions.json", "data/rules.json", "data/templates.json", "data/prompts.json",
    "schemas/project.schema.json", "schemas/project-package.schema.json",
    "schemas/template.schema.json", "schemas/questions.schema.json",
    "tests/unit/test_catalogs.py", "tests/unit/test_storage_contract.py",
    "tests/unit/test_migration_matrix.py", "tests/unit/test_storage_failures.py",
    "tests/unit/test_report_generator.py", "tests/unit/test_project_management.py",
    "tests/unit/test_project_transfer.py", "tests/unit/test_accessibility_contract.py",
    "tests/integration/test_structure.py", "tests/smoke/test_index.py",
    "tests/smoke/browser-smoke.js", "tests/smoke/run_browser_smoke.py",
    "tests/smoke/project-management-smoke.js", "tests/smoke/run_project_management_smoke.py",
    "tests/smoke/transfer-accessibility-smoke.js", "tests/smoke/run_transfer_accessibility_smoke.py",
    "tests/smoke/storage-failure-smoke.js", "tests/smoke/run_storage_failure_smoke.py",
    "tests/smoke/failure-harness.html",
    "tests/fixtures/project-v1.0.0.json", "tests/fixtures/project-v1.1.0.json",
    "tests/fixtures/project-valid.json", "scripts/build.py", "scripts/validate.py", "scripts/release.py",
    "docs/ARCHITEKTUR.md", "docs/DATENMODELL.md", "docs/TESTPLAN.md", "docs/BEDIENHILFE.md", "dist/.gitkeep"
]


def load_json(relative_path: str):
    path = ROOT / relative_path
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise AssertionError(f"Ungültige JSON-Datei {relative_path}: {exc}") from exc


def validate_structure():
    missing = [path for path in EXPECTED_FILES if not (ROOT / path).is_file()]
    assert not missing, f"Fehlende Dateien: {missing}"


def validate_catalogs():
    questions = load_json("data/questions.json")
    rules = load_json("data/rules.json")
    templates = load_json("data/templates.json")
    prompts = load_json("data/prompts.json")
    phase_ids = {phase["id"] for phase in questions["phases"]}
    question_ids = [question["id"] for question in questions["questions"]]
    assert len(question_ids) == len(set(question_ids)), "Doppelte Frage-IDs erkannt."
    assert all(question["phaseId"] in phase_ids for question in questions["questions"]), "Unbekannte Phase in Fragenkatalog."
    known_questions = set(question_ids)
    for question in questions["questions"]:
        option_values = {option["value"] for option in question["options"]}
        assert question["recommendedValue"] in option_values, f"Ungültige Empfehlung bei {question['id']}"
    rule_ids = [rule["id"] for rule in rules["rules"]]
    assert len(rule_ids) == len(set(rule_ids)), "Doppelte Regel-IDs erkannt."
    for rule in rules["rules"]:
        conditions = rule["when"].get("all", []) + rule["when"].get("any", [])
        assert conditions, f"Regel ohne Bedingung: {rule['id']}"
        assert all(condition["questionId"] in known_questions for condition in conditions), f"Unbekannte Frage in Regel {rule['id']}"
    for collection, key in ((templates, "templates"), (prompts, "prompts")):
        ids = [item["id"] for item in collection[key]]
        assert len(ids) == len(set(ids)), f"Doppelte IDs in {key}."


def validate_schemas():
    project_schema = load_json("schemas/project.schema.json")
    package_schema = load_json("schemas/project-package.schema.json")
    template_schema = load_json("schemas/template.schema.json")
    questions_schema = load_json("schemas/questions.schema.json")
    assert project_schema["properties"]["schemaVersion"]["const"] == "1.2.0"
    assert package_schema["properties"]["packageSchemaVersion"]["const"] == "1.0.0"
    assert package_schema["properties"]["checksum"]["pattern"] == "^[a-f0-9]{8}$"
    try:
        import jsonschema
    except ImportError:
        print("[HINWEIS] jsonschema nicht installiert; strukturelle Ersatzprüfung wird verwendet.")
        for schema in (project_schema, package_schema, template_schema, questions_schema):
            assert schema.get("type") == "object"
        return
    for schema in (project_schema, package_schema, template_schema, questions_schema):
        jsonschema.Draft202012Validator.check_schema(schema)
    jsonschema.validate(load_json("tests/fixtures/project-valid.json"), project_schema)
    jsonschema.validate(load_json("data/questions.json"), questions_schema)
    for template in load_json("data/templates.json")["templates"]:
        jsonschema.validate(template, template_schema)


def validate_migration_contract():
    source = (ROOT / "js" / "migration-engine.js").read_text(encoding="utf-8")
    assert 'TARGET_SCHEMA_VERSION = "1.2.0"' in source
    assert '"1.0.0": Object.freeze({ to: "1.1.0"' in source
    assert '"1.1.0": Object.freeze({ to: TARGET_SCHEMA_VERSION' in source
    assert "while (current.schemaVersion !== TARGET_SCHEMA_VERSION)" in source
    assert "Zyklische Projektschema-Migration" in source


def validate_html_references():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    references = re.findall(r'(?:href|src)="([^"]+)"', html)
    local_references = [ref for ref in references if not ref.startswith(("#", "data:"))]
    missing = [ref for ref in local_references if not (ROOT / ref).is_file()]
    assert not missing, f"Fehlende HTML-Verweise: {missing}"
    order = [
        'src="js/migration-engine.js"', 'src="js/storage-engine.js"',
        'src="js/project-repository.js"', 'src="js/project-transfer.js"',
        'src="js/state-manager.js"', 'src="js/report-generator.js"',
        'src="js/ui/app-ui.js"', 'src="js/accessibility.js"',
        'src="js/project-manager.js"', 'src="js/project-transfer-manager.js"',
        'src="js/report-manager.js"', 'src="js/storage-manager.js"', 'src="js/app.js"'
    ]
    positions = [html.index(marker) for marker in order]
    assert positions == sorted(positions), "JavaScript-Ladereihenfolge für Projekt-, Transfer-, Berichts- und Speicherverwaltung ist ungültig."
    for marker in (
        'id="project-manager-button"', 'id="project-dialog"', 'id="project-new-form"',
        'id="project-filter"', 'id="project-action-checkbox"', 'id="current-project-name"',
        'id="project-transfer-button"', 'id="transfer-dialog"', 'id="transfer-file"',
        'id="transfer-checksum-status"', 'id="transfer-mode"', 'id="transfer-apply-button"',
        'id="transfer-audit-result"'
    ):
        assert marker in html, f"Projekt- oder Transferoberfläche fehlt: {marker}"


def validate_javascript_syntax():
    node = shutil.which("node")
    if not node:
        print("[HINWEIS] Node.js nicht vorhanden; JavaScript-Syntaxprüfung übersprungen.")
        return
    paths = [
        *sorted((ROOT / "js").rglob("*.js")),
        ROOT / "tests" / "smoke" / "browser-smoke.js",
        ROOT / "tests" / "smoke" / "project-management-smoke.js",
        ROOT / "tests" / "smoke" / "transfer-accessibility-smoke.js",
        ROOT / "tests" / "smoke" / "storage-failure-smoke.js",
    ]
    for path in paths:
        subprocess.run([node, "--check", str(path)], check=True, capture_output=True, text=True)


def validate_storage_contract():
    source = (ROOT / "js" / "storage-engine.js").read_text(encoding="utf-8")
    manager = (ROOT / "js" / "storage-manager.js").read_text(encoding="utf-8")
    for store in ("projects", "snapshots", "meta", "migrationLog"):
        assert f'"{store}"' in source, f"IndexedDB-Store fehlt: {store}"
    assert 'transaction(Object.values(STORES), "readwrite")' in source, "Gemeinsame Schreibtransaktion fehlt."
    assert "snapshots.add(snapshotRecord)" in source, "Snapshots müssen unveränderlich per add geschrieben werden."
    assert "migrateProjectAndSnapshots" in source and "pre-migration-backup" in source
    assert "schema-migration-step" in source and "schema-migration-complete" in source
    assert "quota-before-write" in source and "abort-after-project-put" in source
    assert "QuotaExceededError" in source and "transaction.abort()" in source
    assert "snapshot-confirm" in manager and "selectedSnapshot?.valid" in manager


def validate_project_contract():
    repository = (ROOT / "js" / "project-repository.js").read_text(encoding="utf-8")
    manager = (ROOT / "js" / "project-manager.js").read_text(encoding="utf-8")
    app = (ROOT / "js" / "app.js").read_text(encoding="utf-8")
    for state in ("active", "archive", "trash"):
        assert f'"{state}"' in repository, f"Projektstatus fehlt: {state}"
    for operation in ("createProject", "renameProject", "duplicateProject", "setLifecycle", "permanentDelete"):
        assert operation in repository, f"Projektoperation fehlt: {operation}"
    assert 'String(expectedName || "") !== actualName' in repository
    assert 'lifecycleActionAllowed(lifecycle.state, "delete")' in repository
    assert 'snapshots.index("projectId")' in repository and 'migrations.index("projectId")' in repository
    assert 'transaction(Object.values(namespace.storage.STORES), "readwrite")' in repository
    assert "settlePendingSave" in app and "activateFallback" in app
    assert "listProjects" in app and "openProject" in app and "deleteProject" in app
    assert 'value !== pendingAction.project.name' in manager
    assert 'project-action-checkbox' in manager


def validate_transfer_contract():
    transfer = (ROOT / "js" / "project-transfer.js").read_text(encoding="utf-8")
    manager = (ROOT / "js" / "project-transfer-manager.js").read_text(encoding="utf-8")
    app = (ROOT / "js" / "app.js").read_text(encoding="utf-8")
    for marker in (
        'PACKAGE_SCHEMA_VERSION = "1.0.0"', "MAX_IMPORT_BYTES", "checksum(coreFromPackage",
        "preparePreview", "unknownQuestionIds", "invalidAnswerValues", "compareProjects",
        'existingIsActive ? ["new", "replace"] : ["new"]'
    ):
        assert marker in transfer, f"Projekttransfervertrag fehlt: {marker}"
    assert "await file.text()" in manager
    assert 'mode === "replace"' in manager
    assert 'transfer-replace-checkbox' in manager and 'transfer-replace-name' in manager
    assert '"pre-import-backup"' in app
    assert "inspectImportPackage" in app and "applyImport" in app and "exportCurrentProject" in app


def validate_accessibility_contract():
    source = (ROOT / "js" / "accessibility.js").read_text(encoding="utf-8")
    for marker in (
        "dialogStack", "openerByDialog", "focusableElements", "trapTab", "handleEscape",
        "data-arrow-navigation", '"ArrowUp"', '"ArrowDown"', '"ArrowLeft"', '"ArrowRight"',
        "Doppelte ID", "Formularfeld ohne Beschriftung", "Dialog ohne gültige Überschrift"
    ):
        assert marker in source, f"Barrierefreiheitsvertrag fehlt: {marker}"


def validate_no_remote_runtime_assets():
    runtime_paths = [ROOT / "index.html", *sorted((ROOT / "css").glob("*.css")), *sorted((ROOT / "js").rglob("*.js"))]
    for path in runtime_paths:
        text = path.read_text(encoding="utf-8")
        assert "https://" not in text and "http://" not in text, f"Externe Laufzeitadresse in {path.relative_to(ROOT)}"


def run_browser_smoke():
    subprocess.run([sys.executable, str(ROOT / "tests" / "smoke" / "run_browser_smoke.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "tests" / "smoke" / "run_project_management_smoke.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "tests" / "smoke" / "run_transfer_accessibility_smoke.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "tests" / "smoke" / "run_storage_failure_smoke.py")], check=True)


def main():
    parser = argparse.ArgumentParser(description="PROVOWARE-Struktur und Datenverträge prüfen.")
    parser.add_argument("--browser", action="store_true", help="zusätzlich alle Browser-Smoke-Tests ausführen")
    args = parser.parse_args()
    checks = [
        ("Struktur", validate_structure),
        ("Datenkataloge", validate_catalogs),
        ("Schemata", validate_schemas),
        ("Migrationsmatrix", validate_migration_contract),
        ("HTML-Verweise", validate_html_references),
        ("JavaScript-Syntax", validate_javascript_syntax),
        ("Speichervertrag", validate_storage_contract),
        ("Mehrprojektvertrag", validate_project_contract),
        ("Projekttransfervertrag", validate_transfer_contract),
        ("Barrierefreiheitsvertrag", validate_accessibility_contract),
        ("Offline-Laufzeit", validate_no_remote_runtime_assets),
    ]
    for label, check in checks:
        check()
        print(f"[OK] {label}")
    if args.browser:
        run_browser_smoke()
        print("[OK] Browser-Smoke")
    print("[OK] Alle Validierungen bestanden.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, subprocess.CalledProcessError, ModuleNotFoundError) as exc:
        print(f"[FEHLER] {exc}", file=sys.stderr)
        raise SystemExit(1)
