from __future__ import annotations

import argparse
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parents[1]
Pruefung = tuple[str, Callable[[], list[str]]]


def lade_json(relativ: str) -> dict[str, Any]:
    pfad = ROOT / relativ
    with pfad.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"JSON-Wurzel ist kein Objekt: {relativ}")
    return data


def ausgabe(titel: str, wert: object) -> None:
    print(f"{titel:<34} {wert}")


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


def lade_baseline_pruefer() -> Any:
    pfad = ROOT / "WERKZEUGE" / "baseline_pruefen.py"
    spec = importlib.util.spec_from_file_location("provoware_baseline_pruefen", pfad)
    if spec is None or spec.loader is None:
        raise RuntimeError("Baseline-Prüfer kann nicht geladen werden.")
    modul = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modul)
    return modul


def pruefe_baseline() -> list[str]:
    try:
        ergebnis = lade_baseline_pruefer().pruefe()
    except Exception as exc:
        return [f"Baseline-Prüfung nicht ausführbar: {exc}"]
    return [str(eintrag) for eintrag in ergebnis]


def pruefe_wissensschema(coverage: dict[str, Any]) -> list[str]:
    schema = coverage.get("wissensschema")
    if not isinstance(schema, dict):
        return ["Coverage-Wissensschema fehlt."]
    erwartet = {
        "reifegrad": "E2",
        "status": "BESTAETIGT",
        "goldene_regel": False,
    }
    return [
        f"Coverage-{schluessel} ist nicht {wert}."
        for schluessel, wert in erwartet.items()
        if schema.get(schluessel) != wert
    ]


def pruefe_coverage_konsistenz(
    status: dict[str, Any], handover: dict[str, Any], summary: dict[str, Any]
) -> list[str]:
    fehler: list[str] = []
    if status.get("p04_fortschritt_prozent") != summary.get("fachfortschritt_prozent"):
        fehler.append("P04-Fortschritt widerspricht MASTERPLAN-Coverage.")
    if status.get("naechste_iteration") != summary.get("next_iteration"):
        fehler.append("Nächste Iteration widerspricht MASTERPLAN-Coverage.")
    if handover.get("next_iteration") != summary.get("next_iteration"):
        fehler.append("ITERATIONSUEBERGABE widerspricht MASTERPLAN-Coverage.")
    if summary.get("phase_close_allowed") is not False:
        fehler.append("P04 darf im aktuellen 2/4-Stand nicht geschlossen sein.")
    return fehler


def pruefe_coverage() -> list[str]:
    try:
        status = lade_json("PROJEKTSTATUS.json")
        handover = lade_json("ITERATIONSUEBERGABE.json")
        coverage = lade_json("docs/MASTERPLAN_COVERAGE_P04.json")
    except (OSError, UnicodeError, json.JSONDecodeError, ValueError) as exc:
        return [f"Coverage-Grunddaten nicht lesbar: {exc}"]

    summary = coverage.get("expected_summary")
    qualification = coverage.get("qualification")
    if not isinstance(summary, dict):
        return ["Coverage-Zusammenfassung fehlt."]

    fehler = pruefe_wissensschema(coverage)
    if not isinstance(qualification, dict) or qualification.get("status") != "PASS_REAL":
        fehler.append("Coverage-Qualification ist nicht PASS_REAL.")
    fehler.extend(pruefe_coverage_konsistenz(status, handover, summary))
    return fehler


def pruefe_historische_gates() -> list[str]:
    skript = ROOT / "tools" / "historical_gate_linter.py"
    if not skript.is_file():
        return ["Historische-Gates-Linter fehlt."]
    prozess = subprocess.run(
        [sys.executable, str(skript)],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if prozess.returncode == 0:
        return []
    text = (prozess.stderr or prozess.stdout).strip()
    return [f"Historische-Gates-Linter ROT: {text or 'unbekannter Fehler'}"]


def befehl_ausfuehren(name: str, befehl: list[str]) -> tuple[bool, str]:
    if shutil.which(befehl[0]) is None and befehl[0] != sys.executable:
        return False, f"{name}: Werkzeug nicht installiert ({befehl[0]})."
    print(f"\n--- {name} ---")
    prozess = subprocess.run(befehl, cwd=ROOT, check=False)
    status = "GRÜN" if prozess.returncode == 0 else "ROT"
    return prozess.returncode == 0, f"{name}: {status}"


def vollpruefung() -> list[str]:
    befehle = [
        ("Ruff", ["ruff", "check", "src", "tests", "WERKZEUGE", "tools"]),
        ("Ruff Format", ["ruff", "format", "--check", "src", "tests", "WERKZEUGE", "tools"]),
        ("mypy", ["mypy", "src/provoware"]),
        ("pytest", [sys.executable, "-m", "pytest", "-q"]),
    ]
    fehler: list[str] = []
    for name, befehl in befehle:
        ok, meldung = befehl_ausfuehren(name, befehl)
        print(meldung)
        if not ok:
            fehler.append(meldung)
    return fehler


def zeige_status() -> None:
    status = lade_json("PROJEKTSTATUS.json")
    handover = lade_json("ITERATIONSUEBERGABE.json")
    coverage = lade_json("docs/MASTERPLAN_COVERAGE_P04.json")
    summary = coverage.get("expected_summary", {})
    kernstand = f"{summary.get('qualifiziert')}/{summary.get('pflichtkerne_gesamt')} qualifiziert"
    abschluss = "NEIN" if summary.get("phase_close_allowed") is False else "UNBEKANNT"

    print("\nPROVOWARE — Klick & Start")
    print("=" * 52)
    ausgabe("Version", status.get("version"))
    ausgabe("Projektstatus", status.get("status"))
    ausgabe("Letzte Iteration", status.get("letzte_abgeschlossene_iteration"))
    ausgabe("Nächste Iteration", status.get("naechste_iteration"))
    ausgabe("P04-Fortschritt", f"{status.get('p04_fortschritt_prozent')} %")
    ausgabe("P04-Pflichtkerne", kernstand)
    ausgabe("P04-Abschluss erlaubt", abschluss)
    ausgabe("Nächstes Ziel", handover.get("next_goal"))
    print("=" * 52)


def fuehre_schnellpruefung(pruefungen: list[Pruefung]) -> list[str]:
    fehler: list[str] = []
    print("\nSchnellprüfung")
    print("-" * 52)
    for name, funktion in pruefungen:
        ergebnis = funktion()
        print(f"[{'ROT' if ergebnis else 'GRÜN'}]  {name}")
        for eintrag in ergebnis:
            print(f"        - {eintrag}")
        fehler.extend(ergebnis)
    return fehler


def main() -> int:
    parser = argparse.ArgumentParser(description="PROVOWARE Klick-&-Start-Prüfung")
    parser.add_argument("--vollpruefung", action="store_true")
    args = parser.parse_args()

    try:
        zeige_status()
    except Exception as exc:
        print(f"STARTSTATUS: ROT — {exc}", file=sys.stderr)
        return 2

    pruefungen: list[Pruefung] = [
        ("Python 3.13", pruefe_python),
        ("JSON-Struktur", pruefe_json_dateien),
        ("Baseline-Konsistenz", pruefe_baseline),
        ("P04-Coverage", pruefe_coverage),
        ("Historische Gates", pruefe_historische_gates),
    ]
    fehler = fuehre_schnellpruefung(pruefungen)
    if args.vollpruefung:
        fehler.extend(vollpruefung())

    if fehler:
        print(f"\nSTARTPRÜFUNG: ROT — {len(fehler)} Befund(e)")
        return 1
    print("\nSTARTPRÜFUNG: GRÜN")
    if not args.vollpruefung:
        print("Tipp: Vollprüfung mit ./PROVOWARE_STARTEN.sh --vollpruefung")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
