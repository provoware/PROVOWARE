import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

EXPECTED = [
    "index.html",
    ".github/workflows/ci.yml",
    "css/variables.css", "css/layout.css", "css/components.css", "css/themes.css", "css/project-manager.css",
    "js/app.js", "js/migration-engine.js", "js/storage-engine.js", "js/project-repository.js",
    "js/project-manager.js", "js/storage-manager.js", "js/state-manager.js", "js/workflow-engine.js",
    "js/rule-engine.js", "js/validation-engine.js", "js/report-generator.js", "js/report-manager.js",
    "js/ui/app-ui.js",
    "data/questions.json", "data/rules.json", "data/templates.json", "data/prompts.json",
    "schemas/project.schema.json", "schemas/template.schema.json", "schemas/questions.schema.json",
    "tests/fixtures/project-v1.0.0.json", "tests/fixtures/project-v1.1.0.json",
    "tests/fixtures/project-valid.json", "tests/unit/test_report_generator.py",
    "tests/unit/test_project_management.py", "tests/smoke/storage-failure-smoke.js",
    "tests/smoke/run_storage_failure_smoke.py", "tests/smoke/failure-harness.html",
    "scripts/validate.py", "scripts/build.py", "scripts/release.py"
]


def test_expected_structure_exists():
    missing = [path for path in EXPECTED if not (ROOT / path).is_file()]
    assert not missing, f"Fehlende Dateien: {missing}"


def test_all_json_files_parse():
    for directory in (ROOT / "data", ROOT / "schemas", ROOT / "tests" / "fixtures"):
        for path in directory.glob("*.json"):
            json.loads(path.read_text(encoding="utf-8"))
