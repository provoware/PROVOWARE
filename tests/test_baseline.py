from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def lade(name: str) -> dict[str, object]:
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def test_projektstatus_identitaet_und_baseline_sind_konsistent() -> None:
    status = lade("PROJEKTSTATUS.json")
    baseline = lade("CURRENT_BASELINE.json")

    assert status["kanonischer_projektname"] == "PROVOWARE"
    assert status["repository"] == "https://github.com/provoware/PROVOWARE"
    assert status["aktuelle_baseline"] == baseline["baseline_id"]
    assert status["letzte_abgeschlossene_iteration"] == baseline["letzte_iteration"]
    assert status["naechste_iteration"] == baseline["naechste_iteration"]
    assert status["version"] == baseline["version"]


def test_masterplan_hash_ist_konsistent() -> None:
    status = lade("PROJEKTSTATUS.json")
    baseline = lade("CURRENT_BASELINE.json")
    masterplan = status["masterplan"]
    assert isinstance(masterplan, dict)
    assert masterplan["sha256"] == baseline["masterplan_sha256"]


def test_iterationsfolge_ist_fortlaufend() -> None:
    status = lade("PROJEKTSTATUS.json")
    letzte = str(status["letzte_abgeschlossene_iteration"])
    naechste = str(status["naechste_iteration"])
    assert letzte.startswith("I") and naechste.startswith("I")
    assert int(naechste[1:]) == int(letzte[1:]) + 1


def test_plan_hat_33_phasen() -> None:
    plan = lade("PLAN_MASTER.json")
    phasen = plan["phasen"]
    assert isinstance(phasen, list)
    assert len(phasen) == 33
    assert phasen[0]["id"] == "P00"
    assert phasen[-1]["id"] == "P32"


def test_release_gates_sind_vollstaendig() -> None:
    gates = lade("RELEASE_GATES.json")["gates"]
    assert isinstance(gates, list)
    assert [g["id"] for g in gates] == [f"G{i}" for i in range(16)]
