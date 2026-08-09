# PROVOWARE

**Status:** Neuaufbau · `0.1.0-dev` · Baseline- und Fundamentphase  
**Repository:** `provoware/PROVOWARE`  
**Ziel:** portables, offline-first Linux-Desktopwerkzeug auf professioneller Engineering-Basis.

Dieses Repository wurde auf Grundlage des Entwicklungs-Masterplans **EXPERT FINAL v2.0.0 vom 2026-08-09** neu initialisiert. Die frühere Browser-Prototyp-Baseline bleibt als GitHub-Backupzweig erhalten und wird nicht als neue Entwicklungsbasis weitergeführt.

## Aktueller Implementierungsstand

Abgeschlossen:
- I000: Masterplan als Baseline registriert und gehasht.
- I001: Technologie-Baseline maschinenlesbar fixiert.
- I002: Projekt-/Repository-Identität eingeführt.
- I003: neue Repository- und Ordnerstruktur angelegt.
- I004: `pyproject.toml` und zentrale Qualitätskonfiguration erstellt.

Vorbereitet, aber **noch nicht als abgeschlossen markiert**:
- I005: Offline-Wheelhouse und Toolinventar.
- I006: reproduzierbarer Offline-Bootstrap.

## Harte Entwicklungsregel

Noch keine breite Modul-, Daten- oder UI-Implementierung. Zuerst werden P00/P01 vollständig qualifiziert; anschließend folgen P02 und der kritische Proof-of-Architecture-Pfad.

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
