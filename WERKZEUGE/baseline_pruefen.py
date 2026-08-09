from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
_ITERATION_RE = re.compile(r"^I(\d{3})$")

PFLICHT = [
    "PROJEKTSTATUS.json",
    "CURRENT_BASELINE.json",
    "TECHNOLOGIE_BASELINE.json",
    "ANFORDERUNGSREGISTER.json",
    "TRACEABILITY.json",
    "PLAN_MASTER.json",
    "ARCHITEKTURREGISTER.json",
    "KOMPONENTENREGISTER.json",
    "VERSIONSREGISTER.json",
    "REGELREGISTER.json",
    "ZUSTANDSAUTOMATEN.json",
    "RELEASE_GATES.json",
    "FEHLERKLASSEN.json",
    "TECHNISCHE_SCHULDEN.json",
    "PLAN_DELTA.json",
    "ITERATIONSUEBERGABE.json",
    "MANIFEST_PROJEKT.json",
    "pyproject.toml",
]


def lade_json(pfad: Path) -> object:
    with pfad.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def als_objekt(value: object, name: str, fehler: list[str]) -> dict[str, Any] | None:
    if not isinstance(value, dict):
        fehler.append(f"JSON-Wurzel ist kein Objekt: {name}")
        return None
    return value


def pruefe_pflichtdateien() -> list[str]:
    fehler: list[str] = []
    for rel in PFLICHT:
        pfad = ROOT / rel
        if not pfad.is_file():
            fehler.append(f"Fehlt: {rel}")
            continue
        if not rel.endswith(".json"):
            continue
        try:
            data = lade_json(pfad)
        except (OSError, json.JSONDecodeError) as exc:
            fehler.append(f"Ungültiges JSON {rel}: {exc}")
            continue
        if not isinstance(data, dict) or "schema" not in data:
            fehler.append(f"Schemafeld fehlt: {rel}")
    return fehler


def pruefe_iterationsfolge(
    status: dict[str, Any], baseline: dict[str, Any], fehler: list[str]
) -> None:
    letzte = status.get("letzte_abgeschlossene_iteration")
    naechste = status.get("naechste_iteration")

    if letzte != baseline.get("letzte_iteration"):
        fehler.append(
            "Letzte Iteration zwischen PROJEKTSTATUS und CURRENT_BASELINE inkonsistent."
        )
    if naechste != baseline.get("naechste_iteration"):
        fehler.append(
            "Nächste Iteration zwischen PROJEKTSTATUS und CURRENT_BASELINE inkonsistent."
        )

    if not isinstance(letzte, str) or not isinstance(naechste, str):
        fehler.append("Letzte/nächste Iteration fehlen oder sind keine Strings.")
        return

    match_letzte = _ITERATION_RE.fullmatch(letzte)
    match_naechste = _ITERATION_RE.fullmatch(naechste)
    if not match_letzte or not match_naechste:
        fehler.append("Iterationsformat ist ungültig; erwartet I000-I999.")
        return
    if int(match_naechste.group(1)) != int(match_letzte.group(1)) + 1:
        fehler.append("Iterationsfolge ist nicht fortlaufend.")


def pruefe_identitaet(
    status: dict[str, Any], baseline: dict[str, Any], fehler: list[str]
) -> None:
    if status.get("kanonischer_projektname") != "PROVOWARE":
        fehler.append("Projektname inkonsistent.")
    if status.get("repository") != "https://github.com/provoware/PROVOWARE":
        fehler.append("Repository-Identität inkonsistent.")
    if status.get("aktuelle_baseline") != baseline.get("baseline_id"):
        fehler.append("Baseline-ID zwischen PROJEKTSTATUS und CURRENT_BASELINE inkonsistent.")
    if status.get("version") != baseline.get("version"):
        fehler.append("Projektversion zwischen PROJEKTSTATUS und CURRENT_BASELINE inkonsistent.")


def pruefe_masterplan(
    status: dict[str, Any], baseline: dict[str, Any], fehler: list[str]
) -> None:
    masterplan = status.get("masterplan")
    if not isinstance(masterplan, dict):
        fehler.append("Masterplan-Metadaten fehlen in PROJEKTSTATUS.")
        return
    if masterplan.get("sha256") != baseline.get("masterplan_sha256"):
        fehler.append("Masterplan-Hash zwischen PROJEKTSTATUS und CURRENT_BASELINE inkonsistent.")


def pruefe() -> list[str]:
    fehler = pruefe_pflichtdateien()
    if fehler:
        return fehler

    status = als_objekt(
        lade_json(ROOT / "PROJEKTSTATUS.json"), "PROJEKTSTATUS.json", fehler
    )
    baseline = als_objekt(
        lade_json(ROOT / "CURRENT_BASELINE.json"), "CURRENT_BASELINE.json", fehler
    )
    if status is None or baseline is None:
        return fehler

    pruefe_identitaet(status, baseline, fehler)
    pruefe_masterplan(status, baseline, fehler)
    pruefe_iterationsfolge(status, baseline, fehler)
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
