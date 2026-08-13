from __future__ import annotations

import argparse
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]


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
    fehler: list[str] = []
    if sys.version_info[:2] != (3, 13):
        fehler.append(
            f"Python {sys.version_info.major}.{sys.version_info.minor} erkannt; erwartet wird Python 3.13."
        )
    return fehler


def pruefe_json_dateien() -> list[str]:
    fehler: list[str] = []
    for pfad in sorted(ROOT.rglob("*.json")):
        if any(teil in {".git", ".venv", "build", "dist"} for teil in pfad.parts):
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
        modul = lade_baseline_pruefer()
        ergebnis = modul.pruefe()
    except Exception as exc:  # noqa: BLE001 - Startdiagnose muss Fehler verständlich melden
        return [f"Baseline-Prüfung nicht ausführbar: {exc}"]
    return [str(eintrag) for eintrag in ergebnis]


def pruefe_coverage() -> list[str]:
    fehler: list[str] = []
    try:
        status = lade_json("PROJEKTSTATUS.json")
        handover = lade_json("ITERATIONSUEBERGABE.json")
        coverage = lade_json("docs/MASTERPLAN_COVERAGE_P04.json")
    except (OSError, UnicodeError, json.JSONDecodeError, ValueError) as exc:
        return [f"Coverage-Grunddaten nicht lesbar: {exc}"]

    summary = coverage.get("expected_summary")
    qualification = coverage.get("qualification")
    wissensschema = coverage.get("wissensschema")
    if not isinstance(summary, dict):
        fehler.append("Coverage-Zusammenfassung fehlt.")
        return fehler
    if not isinstance(qualification, dict) or qualification.get("status") != "PASS_REAL":
        fehler.append("Coverage-Qualification ist nicht PASS_REAL.")
    if not isinstance(wissensschema, dict):
        fehler.append("Coverage-Wissensschema fehlt.")
    else:
        if wissensschema.get("reifegrad") != "E2":
            fehler.append("Coverage-Reifegrad ist nicht E2.")
        if wissensschema.get("status") != "BESTAETIGT":
            fehler.append("Coverage-Wissensstatus ist nicht BESTAETIGT.")
        if wissensschema.get("goldene_regel") is not False:
            fehler.append("Coverage wurde unerwartet als Goldene Regel markiert.")

    if status.get("p04_fortschritt_prozent") != summary.get("fachfortschritt_prozent"):
        fehler.append("P04-Fortschritt widerspricht MASTERPLAN-Coverage.")
    if status.get("naechste_iteration") != summary.get("next_iteration"):
        fehler.append("Nächste Iteration widerspricht MASTERPLAN-Coverage.")
    if handover.get("next_iteration") != summary.get("next_iteration"):
        fehler.append("ITERATIONSUEBERGABE widerspricht MASTERPLAN-Coverage.")
    if summary.get("phase_close_allowed") is not False:
        fehler.append("P04 darf im aktuellen 2/4-Stand nicht geschlossen sein.")
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
    return prozess.returncode == 0, f"{name}: {'GRÜN' if prozess.returncode == 0 else 'ROT'}"


def vollpruefung() -> list[str]:
    fehler: list[str] = []
    befehle = [
        ("Ruff", ["ruff", "check", "src", "tests", "WERKZEUGE", "tools"]),
        ("Ruff Format", ["ruff", "format", "--check", "src", "tests", "WERKZEUGE", "tools"]),
        ("mypy", ["mypy", "src/provoware"]),
        ("pytest", [sys.executable, "-m", "pytest", "-q"]),
    ]
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

    print("\nPROVOWARE — Klick & Start")
    print("=" * 52)
    ausgabe("Version", status.get("version"))
    ausgabe("Projektstatus", status.get("status"))
    ausgabe("Letzte Iteration", status.get("letzte_abgeschlossene_iteration"))
    ausgabe("Nächste Iteration", status.get("naechste_iteration"))
    ausgabe("P04-Fortschritt", f"{status.get('p04_fortschritt_prozent')} %")
    ausgabe("P04-Pflichtkerne", f"{summary.get('qualifiziert')}/{summary.get('pflichtkerne_gesamt')} qualifiziert")
    ausgabe("P04-Abschluss erlaubt", "NEIN" if summary.get("phase_close_allowed") is False else "UNBEKANNT")
    ausgabe("Nächstes Ziel", handover.get("next_goal"))
    print("=" * 52)


def main() -> int:
    parser = argparse.ArgumentParser(description="PROVOWARE Klick-&-Start-Prüfung")
    parser.add_argument(
        "--vollpruefung",
        action="store_true",
        help="Zusätzlich Ruff, mypy und pytest ausführen, sofern installiert.",
    )
    args = parser.parse_args()

    try:
        zeige_status()
    except Exception as exc:  # noqa: BLE001 - Startdiagnose
        print(f"STARTSTATUS: ROT — {exc}", file=sys.stderr)
        return 2

    pruefungen = [
        ("Python 3.13", pruefe_python),
        ("JSON-Struktur", pruefe_json_dateien),
        ("Baseline-Konsistenz", pruefe_baseline),
        ("P04-Coverage", pruefe_coverage),
        ("Historische Gates", pruefe_historische_gates),
    ]
    fehler: list[str] = []
    print("\nSchnellprüfung")
    print("-" * 52)
    for name, funktion in pruefungen:
        ergebnis = funktion()
        if ergebnis:
            print(f"[ROT]   {name}")
            for eintrag in ergebnis:
                print(f"        - {eintrag}")
            fehler.extend(ergebnis)
        else:
            print(f"[GRÜN]  {name}")

    if args.vollpruefung:
        fehler.extend(vollpruefung())

    if fehler:
        print(f"\nSTARTPRÜFUNG: ROT — {len(fehler)} Befund(e)")
        return 1
    print("\nSTARTPRÜFUNG: GRÜN")
    if not args.vollpruefung:
        print("Tipp: Für die komplette Entwicklerprüfung: ./PROVOWARE_STARTEN.sh --vollpruefung")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
