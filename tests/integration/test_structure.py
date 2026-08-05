import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

EXPECTED = [
    "index.html",
    "css/variables.css", "css/layout.css", "css/components.css", "css/themes.css",
    "js/app.js", "js/storage-engine.js", "js/storage-manager.js", "js/state-manager.js",
    "js/workflow-engine.js", "js/rule-engine.js", "js/validation-engine.js",
    "js/report-generator.js", "js/ui/app-ui.js",
    "data/questions.json", "data/rules.json", "data/templates.json", "data/prompts.json",
    "schemas/project.schema.json", "schemas/template.schema.json", "schemas/questions.schema.json",
    "scripts/validate.py", "scripts/build.py", "scripts/release.py"
]


def test_expected_structure_exists():
    missing = [path for path in EXPECTED if not (ROOT / path).is_file()]
    assert not missing, f"Fehlende Dateien: {missing}"


def test_all_json_files_parse():
    for directory in (ROOT / "data", ROOT / "schemas", ROOT / "tests" / "fixtures"):
        for path in directory.glob("*.json"):
            json.loads(path.read_text(encoding="utf-8"))
