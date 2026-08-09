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
- Transfer V1: automatischer 24-MiB-Teiltransfer mit Hashprüfung, Backup, Rollback und End-to-End-Installer repo-integriert.

**P00 und P01 sind qualifiziert.** Nächster Pflichtschritt ist **I007** in P02: ID-, Status-, Fehler- und Ergebnis-Typen als strikt typisierte Kernverträge.

## Transfer V1 — Größe und Installation

Die validierte Referenzübergabe besitzt **295,21 MB** (`281,53 MiB`) Gesamtgröße.

- Teil 001–011: je **25,17 MB** (`24,00 MiB`).
- Teil 012: **18,39 MB** (`17,53 MiB`).
- Installer: **0,009 MB**.
- Starter-ZIP: **0,006 MB**.
- Gesamt-SHA-256: `9b91cd77787ca01ada815b26920967774a918c889b69522f8d00cbc3329a6b17`.

Die knapp 300 MB Binärdaten werden nicht dauerhaft als normale Git-Blobs gespeichert. Der repo-eigene Workflow `.github/workflows/transfer-v1.yml` baut und prüft **alle** Transferbestandteile und veröffentlicht sie gemeinsam als GitHub-Actions-Artefakt. Die vollständige Anleitung und sämtliche Befehle stehen unter `TRANSFER/README.md`.

### Installation mit vorhandenen Teilstücken

```bash
mkdir -p "$HOME/Downloads/PROVOWARE_I006_TRANSFER_V1"
cd "$HOME/Downloads/PROVOWARE_I006_TRANSFER_V1"
ls -lh PROVOWARE_INSTALLIEREN.sh PROVOWARE_I006_TRANSFER_V1.teil*.pvpart
chmod +x PROVOWARE_INSTALLIEREN.sh
bash PROVOWARE_INSTALLIEREN.sh
```

Danach prüfen:

```bash
cd "$HOME/PROVOWARE"
python3 WERKZEUGE/baseline_pruefen.py
cat TRANSFER/INSTALLATIONSNACHWEIS.json
```

Anderes Ziel:

```bash
cd "$HOME/Downloads/PROVOWARE_I006_TRANSFER_V1"
PROVOWARE_ZIEL="$HOME/PROVOWARE_TEST" bash PROVOWARE_INSTALLIEREN.sh
cd "$HOME/PROVOWARE_TEST"
python3 WERKZEUGE/baseline_pruefen.py
```

### Repo-Workflow starten

```bash
gh auth status
gh workflow run transfer-v1.yml -R provoware/PROVOWARE
gh run list -R provoware/PROVOWARE --workflow transfer-v1.yml --limit 5
gh run view RUN_ID -R provoware/PROVOWARE
gh run download RUN_ID -R provoware/PROVOWARE
```

## I005-Qualifikation

Workflow `31330952896` erzeugte auf Ubuntu 22.04.5 LTS x86_64 / CPython 3.13.15 insgesamt **50 Wheels mit 294,43 MB** (`280,79 MiB`, 294.428.822 Byte). Das Actions-Artefakt `9042907351` besitzt SHA-256 `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040`; alle internen Wheel-Hashes wurden zusätzlich nachverifiziert.

## I006-Qualifikation

Workflow `31331742667` lud exakt dieses I005-Artefakt, prüfte vor dem Entpacken den äußeren SHA-256 und danach Manifest, Evidence und sämtliche Wheel-Hashes. Anschließend wurden zwei leere Entwicklungsumgebungen ausschließlich mit `PIP_NO_INDEX=1`, `--no-index`, lokalem `PIP_FIND_LINKS` und einer zusätzlichen Proxy-Falle aufgebaut.

Beide Installationen lieferten byteidentische Paket-Freezes mit SHA-256 `5e44649e72afd6b6076f76c21bcb29b8232d17ae106bdece4e0cca122090b1ed`. In beiden Umgebungen waren `pip check`, Projektinstallation, Baseline-Prüfer, 17 Pytest-Tests, Ruff Check/Format und Import-Smoke grün. Das I006-Evidence-Artefakt `9043135144` besitzt **0,003 MB** und SHA-256 `2029a08b0b772524bb023b1066bf0730a3ec2ca118723af6caf5c4f3778f7636`.

## Harte Entwicklungsregel

Noch keine breite Modul-, Daten- oder UI-Implementierung. P02 definiert zuerst die Verträge und Architekturgrenzen. Der kritische Proof-of-Architecture-Pfad bleibt Voraussetzung für späteren Funktionsausbau.

## Lokale Baseline-Prüfung

```bash
cd "$HOME/PROVOWARE"
python3 WERKZEUGE/baseline_pruefen.py
pytest -q
```

## Repository frisch klonen

```bash
cd "$HOME"
git clone https://github.com/provoware/PROVOWARE.git
cd PROVOWARE
python3 WERKZEUGE/baseline_pruefen.py
```

## Masterplan-Identität

- Datei: `PROVOWARE_VOLLSTAENDIGER_ENTWICKLUNGSPLAN_EXPERT_FINAL_v2.0.0_2026-08-09.pdf`
- SHA-256: `e0aa1afe47a9cde2333d651fbf662c923382be00bd3af17a35f63d867dba3f8c`
- Größe: **0,270 MB** · `269583` Byte
- Seiten: 81

## Dokumentationsregel

Jede Installations-, Wiederherstellungs-, Build- oder Bedienanleitung muss künftig alle benötigten Befehle vollständig, kopierbar und in richtiger Reihenfolge enthalten. Bei Download-/Artefaktangaben wird zusätzlich die Größe in **MB** angegeben.
