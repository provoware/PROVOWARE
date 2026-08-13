from __future__ import annotations

import argparse
import importlib.util
import json
import shutil
import subprocess
import sys
from collections.abc import Callable
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
Pruefung = tuple[str, Callable[[], list[str]]]


def lade_json(relativ: str) -> dict[str, Any]:
    data = json.loads((ROOT / relativ).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"JSON-Wurzel ist kein Objekt: {relativ}")
    return data


def pruefe_python() -> list[str]:
    if sys.version_info[:2] == (3, 13):
        return []
    version = f"{sys.version_info.major}.{sys.version_info.minor}"
    return [f"Python {version} erkannt; erwartet wird Python 3.13."]


def pruefe_json_dateien() -> list[str]:
    fehler: list[str] = []
    ignoriert = {".git", ".venv", "build", "dist"}
    for pfad in sorted(ROOT.rglob("*.json")):
        if any(teil in ignoriert for teil in pfad.parts):
            continue
        try:
            json.loads(pfad.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            fehler.append(f"JSON ungültig: {pfad.relative_to(ROOT)}: {exc}")
    return fehler


def pruefe_baseline() -> list[str]:
    pfad = ROOT / "WERKZEUGE" / "baseline_pruefen.py"
    try:
        spec = importlib.util.spec_from_file_location("baseline_pruefen", pfad)
        if spec is None or spec.loader is None:
            return ["Baseline-Prüfer kann nicht geladen werden."]
        modul = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(modul)
        return [str(eintrag) for eintrag in modul.pruefe()]
    except Exception as exc:
        return [f"Baseline-Prüfung nicht ausführbar: {exc}"]


def pruefe_coverage() -> list[str]:
    try:
        status = lade_json("PROJEKTSTATUS.json")
        handover = lade_json("ITERATIONSUEBERGABE.json")
        coverage = lade_json("docs/MASTERPLAN_COVERAGE_P04.json")
    except (OSError, UnicodeError, json.JSONDecodeError, ValueError) as exc:
        return [f"Coverage-Grunddaten nicht lesbar: {exc}"]

    summary = coverage.get("expected_summary")
    schema = coverage.get("wissensschema")
    qualification = coverage.get("qualification")
    if not isinstance(summary, dict) or not isinstance(schema, dict):
        return ["Coverage-Zusammenfassung oder Wissensschema fehlt."]

    soll = {
        "reifegrad": "E2",
        "status": "BESTAETIGT",
        "goldene_regel": False,
    }
    fehler = [f"Coverage-{k} inkonsistent." for k, v in soll.items() if schema.get(k) != v]
    if not isinstance(qualification, dict) or qualification.get("status") != "PASS_REAL":
        fehler.append("Coverage-Qualification ist nicht PASS_REAL.")
    paare = [
        (status.get("p04_fortschritt_prozent"), summary.get("fachfortschritt_prozent")),
        (status.get("naechste_iteration"), summary.get("next_iteration")),
        (handover.get("next_iteration"), summary.get("next_iteration")),
    ]
    if any(links != rechts for links, rechts in paare):
        fehler.append("Projektstatus, Übergabe und Coverage widersprechen sich.")
    if summary.get("phase_close_allowed") is not False:
        fehler.append("P04 darf im aktuellen Stand nicht geschlossen sein.")
    return fehler


def pruefe_historische_gates() -> list[str]:
    skript = ROOT / "tools" / "historical_gate_linter.py"
    prozess = subprocess.run(
        [sys.executable, str(skript)], cwd=ROOT, text=True, capture_output=True, check=False
    )
    if prozess.returncode == 0:
        return []
    text = (prozess.stderr or prozess.stdout).strip()
    return [f"Historische-Gates-Linter ROT: {text or 'unbekannter Fehler'}"]


def zeige_status() -> None:
    status = lade_json("PROJEKTSTATUS.json")
    handover = lade_json("ITERATIONSUEBERGABE.json")
    summary = lade_json("docs/MASTERPLAN_COVERAGE_P04.json")["expected_summary"]
    print("\nPROVOWARE — Klick & Start")
    print("=" * 52)
    print(f"Version:              {status.get('version')}")
    print(f"Projektstatus:        {status.get('status')}")
    print(f"Letzte Iteration:     {status.get('letzte_abgeschlossene_iteration')}")
    print(f"Nächste Iteration:    {status.get('naechste_iteration')}")
    print(f"P04-Fortschritt:      {status.get('p04_fortschritt_prozent')} %")
    print(f"P04-Pflichtkerne:     {summary.get('qualifiziert')}/4 qualifiziert")
    print(f"Nächstes Ziel:        {handover.get('next_goal')}")
    print("=" * 52)


def vollpruefung() -> list[str]:
    befehle = [
        ["ruff", "check", "src", "tests", "WERKZEUGE"],
        ["ruff", "format", "--check", "src", "tests", "WERKZEUGE"],
        ["mypy", "src/provoware"],
        [sys.executable, "-m", "pytest", "-q"],
    ]
    fehler: list[str] = []
    for befehl in befehle:
        if befehl[0] != sys.executable and shutil.which(befehl[0]) is None:
            fehler.append(f"Werkzeug fehlt: {befehl[0]}")
            continue
        if subprocess.run(befehl, cwd=ROOT, check=False).returncode != 0:
            fehler.append(f"Prüfung ROT: {' '.join(befehl)}")
    return fehler


def main() -> int:
    parser = argparse.ArgumentParser(description="PROVOWARE Klick-&-Start-Prüfung")
    parser.add_argument("--vollpruefung", action="store_true")
    args = parser.parse_args()
    zeige_status()
    pruefungen: list[Pruefung] = [
        ("Python 3.13", pruefe_python),
        ("JSON-Struktur", pruefe_json_dateien),
        ("Baseline-Konsistenz", pruefe_baseline),
        ("P04-Coverage", pruefe_coverage),
        ("Historische Gates", pruefe_historische_gates),
    ]
    fehler: list[str] = []
    print("\nSchnellprüfung")
    for name, funktion in pruefungen:
        ergebnis = funktion()
        print(f"[{'ROT' if ergebnis else 'GRÜN'}] {name}")
        fehler.extend(ergebnis)
    if args.vollpruefung:
        fehler.extend(vollpruefung())
    if fehler:
        for eintrag in fehler:
            print(f"- {eintrag}")
        print(f"\nSTARTPRÜFUNG: ROT — {len(fehler)} Befund(e)")
        return 1
    print("\nSTARTPRÜFUNG: GRÜN")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
