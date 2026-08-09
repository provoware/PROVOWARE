from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PFLICHT = [
    "PROJEKTSTATUS.json", "CURRENT_BASELINE.json", "TECHNOLOGIE_BASELINE.json",
    "ANFORDERUNGSREGISTER.json", "TRACEABILITY.json", "PLAN_MASTER.json",
    "ARCHITEKTURREGISTER.json", "KOMPONENTENREGISTER.json", "VERSIONSREGISTER.json",
    "REGELREGISTER.json", "ZUSTANDSAUTOMATEN.json", "RELEASE_GATES.json",
    "FEHLERKLASSEN.json", "TECHNISCHE_SCHULDEN.json", "PLAN_DELTA.json",
    "ITERATIONSUEBERGABE.json", "MANIFEST_PROJEKT.json", "pyproject.toml",
]

def lade_json(pfad: Path) -> object:
    with pfad.open("r", encoding="utf-8") as handle:
        return json.load(handle)

def pruefe() -> list[str]:
    fehler: list[str] = []
    for rel in PFLICHT:
        if not (ROOT / rel).is_file():
            fehler.append(f"Fehlt: {rel}")
    for rel in PFLICHT:
        if rel.endswith(".json") and (ROOT / rel).is_file():
            try:
                data = lade_json(ROOT / rel)
            except (OSError, json.JSONDecodeError) as exc:
                fehler.append(f"Ungültiges JSON {rel}: {exc}")
                continue
            if not isinstance(data, dict) or "schema" not in data:
                fehler.append(f"Schemafeld fehlt: {rel}")
    status = lade_json(ROOT / "PROJEKTSTATUS.json")
    if isinstance(status, dict):
        if status.get("kanonischer_projektname") != "PROVOWARE":
            fehler.append("Projektname inkonsistent.")
        if status.get("repository") != "https://github.com/provoware/PROVOWARE":
            fehler.append("Repository-Identität inkonsistent.")
        if status.get("letzte_abgeschlossene_iteration") != "I004":
            fehler.append("Iterationsstatus inkonsistent.")
    return fehler

def main() -> int:
    fehler = pruefe()
    if fehler:
        print("BASELINE: ROT")
        for eintrag in fehler:
            print(f"- {eintrag}")
        return 1
    print("BASELINE: GRÜN")
    print(f"Register geprüft: {sum(1 for p in PFLICHT if p.endswith('.json'))}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
