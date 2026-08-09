from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def test_projektstatus_identitaet() -> None:
    data = json.loads((ROOT / "PROJEKTSTATUS.json").read_text(encoding="utf-8"))
    assert data["kanonischer_projektname"] == "PROVOWARE"
    assert data["repository"] == "https://github.com/provoware/PROVOWARE"
    assert data["letzte_abgeschlossene_iteration"] == "I004"
    assert data["naechste_iteration"] == "I005"

def test_masterplan_hash_ist_konsistent() -> None:
    status = json.loads((ROOT / "PROJEKTSTATUS.json").read_text(encoding="utf-8"))
    baseline = json.loads((ROOT / "CURRENT_BASELINE.json").read_text(encoding="utf-8"))
    assert status["masterplan"]["sha256"] == baseline["masterplan_sha256"]

def test_plan_hat_33_phasen() -> None:
    plan = json.loads((ROOT / "PLAN_MASTER.json").read_text(encoding="utf-8"))
    assert len(plan["phasen"]) == 33
    assert plan["phasen"][0]["id"] == "P00"
    assert plan["phasen"][-1]["id"] == "P32"

def test_release_gates_sind_vollstaendig() -> None:
    gates = json.loads((ROOT / "RELEASE_GATES.json").read_text(encoding="utf-8"))["gates"]
    assert [g["id"] for g in gates] == [f"G{i}" for i in range(16)]
