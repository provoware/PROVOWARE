#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXPECTED_FILES = [
    "README.md", "TODO.md", "CHANGELOG.md", "SCHWACHSTELLEN.md", "AGENTS.md",
    "UPGRADEPOOL.md", "PROJEKTORDNERSTRUKTUR.md", "requirements.txt", "index.html",
    "css/variables.css", "css/layout.css", "css/components.css", "css/themes.css",
    "js/app.js", "js/state-manager.js", "js/workflow-engine.js", "js/rule-engine.js",
    "js/validation-engine.js", "js/report-generator.js", "js/ui/app-ui.js",
    "data/questions.json", "data/rules.json", "data/templates.json", "data/prompts.json",
    "schemas/project.schema.json", "schemas/template.schema.json", "schemas/questions.schema.json",
    "tests/unit/test_catalogs.py", "tests/integration/test_structure.py", "tests/smoke/test_index.py",
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
    try:
        import jsonschema
    except ImportError:
        print("[HINWEIS] jsonschema nicht installiert; strukturelle Ersatzprüfung wird verwendet.")
        for path in ("schemas/project.schema.json", "schemas/template.schema.json", "schemas/questions.schema.json"):
            schema = load_json(path)
            assert schema.get("type") == "object"
        return

    project_schema = load_json("schemas/project.schema.json")
    template_schema = load_json("schemas/template.schema.json")
    questions_schema = load_json("schemas/questions.schema.json")
    jsonschema.Draft202012Validator.check_schema(project_schema)
    jsonschema.Draft202012Validator.check_schema(template_schema)
    jsonschema.Draft202012Validator.check_schema(questions_schema)
    jsonschema.validate(load_json("tests/fixtures/project-valid.json"), project_schema)
    jsonschema.validate(load_json("data/questions.json"), questions_schema)
    for template in load_json("data/templates.json")["templates"]:
        jsonschema.validate(template, template_schema)


def validate_html_references():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    references = re.findall(r'(?:href|src)="([^"]+)"', html)
    local_references = [ref for ref in references if not ref.startswith(("#", "data:"))]
    missing = [ref for ref in local_references if not (ROOT / ref).is_file()]
    assert not missing, f"Fehlende HTML-Verweise: {missing}"


def validate_javascript_syntax():
    node = shutil.which("node")
    if not node:
        print("[HINWEIS] Node.js nicht vorhanden; JavaScript-Syntaxprüfung übersprungen.")
        return
    for path in sorted((ROOT / "js").rglob("*.js")):
        subprocess.run([node, "--check", str(path)], check=True, capture_output=True, text=True)


def validate_no_remote_runtime_assets():
    runtime_paths = [ROOT / "index.html", *sorted((ROOT / "css").glob("*.css")), *sorted((ROOT / "js").rglob("*.js"))]
    for path in runtime_paths:
        text = path.read_text(encoding="utf-8")
        assert "https://" not in text and "http://" not in text, f"Externe Laufzeitadresse in {path.relative_to(ROOT)}"


def main():
    checks = [
        ("Struktur", validate_structure),
        ("Datenkataloge", validate_catalogs),
        ("Schemata", validate_schemas),
        ("HTML-Verweise", validate_html_references),
        ("JavaScript-Syntax", validate_javascript_syntax),
        ("Offline-Laufzeit", validate_no_remote_runtime_assets),
    ]
    for label, check in checks:
        check()
        print(f"[OK] {label}")
    print("[OK] Alle Validierungen bestanden.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, subprocess.CalledProcessError) as exc:
        print(f"[FEHLER] {exc}", file=sys.stderr)
        raise SystemExit(1)
