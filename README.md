# PROVOWARE

**Status:** Neuaufbau · `0.1.0-dev` · Baseline- und Fundamentphase  
**Repository:** `provoware/PROVOWARE`  
**Aktuelle Baseline:** `BASELINE-2026-08-09-I005`  
**Ziel:** portables, offline-first Linux-Desktopwerkzeug auf professioneller Engineering-Basis.

Dieses Repository wurde auf Grundlage des Entwicklungs-Masterplans **EXPERT FINAL v2.0.0 vom 2026-08-09** neu initialisiert. Die frühere Browser-Prototyp-Baseline bleibt als GitHub-Backupzweig erhalten und wird nicht als neue Entwicklungsbasis weitergeführt.

## Aktueller Implementierungsstand

Abgeschlossen und qualifiziert:
- I000: Masterplan als Baseline registriert und gehasht.
- I001: Technologie-Baseline maschinenlesbar fixiert.
- I002: Projekt-/Repository-Identität eingeführt.
- I003: neue Repository- und Ordnerstruktur angelegt.
- I004: `pyproject.toml` und zentrale Qualitätskonfiguration erstellt.
- I005: Offline-Wheelhouse auf Ubuntu 22.04 amd64 / CPython 3.13.15 erzeugt, inventarisiert und offline verifiziert.

Nächster Pflichtschritt:
- I006: reproduzierbarer Clean-Bootstrap vollständig offline aus dem verifizierten I005-Artefakt.

## I005-Qualifikation

Der GitHub-Actions-Lauf `31330952896` hat auf Ubuntu 22.04.5 LTS x86_64 mit CPython 3.13.15 und pip 25.2 insgesamt **50 Wheels mit 294428822 Bytes** erzeugt. Eine zweite frische Umgebung wurde ausschließlich mit `PIP_NO_INDEX=1` und `--no-index` aus diesem Wheelhouse installiert. `pip check`, Import-/CLI-Smoke, Baselineprüfung, 11 Projekttests sowie Ruff Check/Format waren grün.

Das unveränderliche Actions-Artefakt besitzt die ID `9042907351` und SHA-256 `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040`. Die internen Wheel-Hashes wurden nach dem Download zusätzlich gegen `WHEELHOUSE_SHA256.txt` geprüft.

## Harte Entwicklungsregel

Noch keine breite Modul-, Daten- oder UI-Implementierung. Zuerst wird P01 mit I006 vollständig qualifiziert; anschließend folgen P02 und der kritische Proof-of-Architecture-Pfad.

## Lokale Baseline-Prüfung

```bash
python3 WERKZEUGE/baseline_pruefen.py
pytest -q
```

## Masterplan-Identität

- Datei: `PROVOWARE_VOLLSTAENDIGER_ENTWICKLUNGSPLAN_EXPERT_FINAL_v2.0.0_2026-08-09.pdf`
- SHA-256: `e0aa1afe47a9cde2333d651fbf662c923382be00bd3af17a35f63d867dba3f8c`
- Größe: `269583` Bytes
- Seiten: 81

Die PDF selbst wird über Hash, Metadaten und Baseline-Dokumentation identifiziert; der Repository-Kern bleibt textbasiert und diff-freundlich.
