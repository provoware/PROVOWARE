import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load_json(relative_path: str):
    return json.loads((ROOT / relative_path).read_text(encoding="utf-8"))


def test_question_ids_are_unique_and_valid():
    catalog = load_json("data/questions.json")
    ids = [question["id"] for question in catalog["questions"]]
    assert len(ids) == len(set(ids))
    assert all("." in question_id for question_id in ids)


def test_recommendations_reference_existing_options():
    catalog = load_json("data/questions.json")
    for question in catalog["questions"]:
        values = {option["value"] for option in question["options"]}
        assert question["recommendedValue"] in values


def test_rules_reference_known_questions():
    questions = load_json("data/questions.json")
    rules = load_json("data/rules.json")
    known = {question["id"] for question in questions["questions"]}
    for rule in rules["rules"]:
        conditions = rule["when"].get("all", []) + rule["when"].get("any", [])
        assert conditions
        assert all(condition["questionId"] in known for condition in conditions)
