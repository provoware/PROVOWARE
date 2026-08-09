# PROVOWARE

**Status:** Neuaufbau · `0.1.0-dev` · P01 qualifiziert / P02 bereit  
**Repository:** `provoware/PROVOWARE`  
**Aktuelle Baseline:** `BASELINE-2026-08-09-I006`  
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
- I006: zwei vollständige Clean-Bootstraps ausschließlich aus dem verifizierten I005-Artefakt reproduzierbar durchgeführt.

**P00 und P01 sind damit qualifiziert.** Nächster Pflichtschritt ist **I007** in P02: ID-, Status-, Fehler- und Ergebnis-Typen als strikt typisierte Kernverträge.

## I005-Qualifikation

Workflow `31330952896` erzeugte auf Ubuntu 22.04.5 LTS x86_64 / CPython 3.13.15 insgesamt **50 Wheels mit 294428822 Bytes**. Das Actions-Artefakt `9042907351` besitzt SHA-256 `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040`; alle internen Wheel-Hashes wurden zusätzlich nachverifiziert.

## I006-Qualifikation

Workflow `31331742667` lud exakt dieses I005-Artefakt, prüfte vor dem Entpacken den äußeren SHA-256 und danach Manifest, Evidence und sämtliche Wheel-Hashes. Anschließend wurden zwei leere Entwicklungsumgebungen ausschließlich mit `PIP_NO_INDEX=1`, `--no-index`, lokalem `PIP_FIND_LINKS` und einer zusätzlichen Proxy-Falle aufgebaut.

Beide Installationen lieferten byteidentische Paket-Freezes mit SHA-256 `5e44649e72afd6b6076f76c21bcb29b8232d17ae106bdece4e0cca122090b1ed`. In beiden Umgebungen waren `pip check`, Projektinstallation, Baseline-Prüfer, 17 Pytest-Tests, Ruff Check/Format und Import-Smoke grün. Das I006-Evidence-Artefakt `9043135144` besitzt SHA-256 `2029a08b0b772524bb023b1066bf0730a3ec2ca118723af6caf5c4f3778f7636`.

## Harte Entwicklungsregel

Noch keine breite Modul-, Daten- oder UI-Implementierung. P02 definiert zuerst die Verträge und Architekturgrenzen. Der kritische Proof-of-Architecture-Pfad bleibt Voraussetzung für späteren Funktionsausbau.

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
