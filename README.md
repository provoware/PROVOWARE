# PROVOWARE

**Status:** Neuaufbau · `0.1.0-dev` · P00/P01 qualifiziert · P02 in Arbeit  
**Repository:** `provoware/PROVOWARE`  
**Aktuelle Baseline:** `BASELINE-2026-08-09-I007`  
**Letzte abgeschlossene Iteration:** `I007`  
**Nächste Iteration:** `I008`  
**Ziel:** portables, offline-first Linux-Desktopwerkzeug auf professioneller Engineering-Basis.

## Aktueller Implementierungsstand

Abgeschlossen und qualifiziert:

- I000: Masterplan-Baseline registriert und gehasht.
- I001: Technologie-Baseline maschinenlesbar fixiert.
- I002: Projekt-/Repository-Identität eingeführt.
- I003: neue Repository- und Ordnerstruktur angelegt.
- I004: `pyproject.toml` und zentrale Qualitätskonfiguration erstellt.
- I005: Offline-Wheelhouse auf Ubuntu 22.04 amd64 / CPython 3.13.15 erzeugt und offline verifiziert.
- I006: zwei vollständige Offline-Clean-Bootstraps reproduzierbar qualifiziert.
- I007: strikt typisierte ID-, Status-, Fehler- und Ergebnisverträge qualifiziert.
- Transfer V1: automatischer 24-MiB-Teiltransfer mit Hashprüfung, Backup, Rollback und End-to-End-Installer repo-integriert.

**P00 und P01 sind vollständig qualifiziert. P02 steht nach I007 bei 25 %.** Nächster Pflichtschritt ist **I008 — Manifest- und Projektschemata**.

## I007 — Kernverträge

Die Vertragsschicht `src/provoware/vertraege/` ist bewusst unabhängig von Qt, SQLite, Datei-I/O und Modulen. Sie enthält:

- `ProjektId`, `ObjektId`, `RevisionId`, `ChangeId`, `OperationId`
- kanonische präfixierte UUID-Formate
- `Status`
- `Fehlerklasse` und `FehlerInfo`
- `OperationErgebnis[T]`

Finale GitHub-Qualifikation:

- Workflow-Run: `31335066204`
- Artifact-ID: `9044073684`
- Artifact-Größe: **0,000575 MB** (`575 Byte`)
- Artifact-SHA-256: `007a7f0412274a1dcf72379202f87f3fa7629be4de6dd500534ed4a88373a909`
- Receipt-SHA-256: `11cb28d66188298496c65059918d707b17a1cb4e95087c8368e6c9aa49221d33`
- `mypy --strict`: GRÜN
- Contracttests: **16 bestanden**
- Gesamtregression: **33 bestanden**
- Ruff Check/Format: GRÜN

Zusätzlich waren die abschließenden Revalidierungen von I005, I006 und Transfer V1 grün.

## Projekt lokal prüfen — alle Befehle

```bash
cd "$HOME/PROVOWARE"
python3 WERKZEUGE/baseline_pruefen.py
pytest -q
```

Mit dem qualifizierten Entwicklungs-Wheelhouse zusätzlich:

```bash
cd "$HOME/PROVOWARE"
mypy src/provoware/vertraege tests/contract/test_datentypen.py tests/contract/test_id_varianten.py
ruff check src tests WERKZEUGE
ruff format --check src tests WERKZEUGE
pytest -q -m contract tests/contract
pytest -q
```

## Repository frisch klonen — alle Befehle

```bash
cd "$HOME"
git clone https://github.com/provoware/PROVOWARE.git
cd PROVOWARE
python3 WERKZEUGE/baseline_pruefen.py
```

## Vorhandenes Repository aktualisieren — alle Befehle

```bash
cd "$HOME/PROVOWARE"
git status
git pull --ff-only
python3 WERKZEUGE/baseline_pruefen.py
```

## I007-GitHub-Lauf ansehen und Evidence laden

```bash
gh auth status
gh run view 31335066204 -R provoware/PROVOWARE
gh run download 31335066204 -R provoware/PROVOWARE
```

## Transfer V1 — Referenzgröße und Installation

Der repo-integrierte Transfer-V1-Referenzstand für die I006-Übergabe besitzt **295,21 MB** (`281,53 MiB`). Der Transfermechanismus selbst bleibt als reproduzierbarer Builder Bestandteil des Repositorys; für jede neue Übergabe wird ein neues, zur Baseline passendes Teilset erzeugt.

- Teil 001–011: je **25,17 MB** (`24,00 MiB`)
- Teil 012: **18,39 MB** (`17,53 MiB`)
- Installer: ca. **0,009 MB**
- Starter-ZIP: ca. **0,006 MB**
- I006-Referenz-SHA-256: `9b91cd77787ca01ada815b26920967774a918c889b69522f8d00cbc3329a6b17`

### Teilpaket installieren — alle Befehle

```bash
mkdir -p "$HOME/Downloads/PROVOWARE_TRANSFER"
cd "$HOME/Downloads/PROVOWARE_TRANSFER"
ls -lh PROVOWARE_INSTALLIEREN.sh *.pvpart
chmod +x PROVOWARE_INSTALLIEREN.sh
bash PROVOWARE_INSTALLIEREN.sh
cd "$HOME/PROVOWARE"
python3 WERKZEUGE/baseline_pruefen.py
cat TRANSFER/INSTALLATIONSNACHWEIS.json
```

Anderes Ziel:

```bash
cd "$HOME/Downloads/PROVOWARE_TRANSFER"
PROVOWARE_ZIEL="$HOME/PROVOWARE_TEST" bash PROVOWARE_INSTALLIEREN.sh
cd "$HOME/PROVOWARE_TEST"
python3 WERKZEUGE/baseline_pruefen.py
cat TRANSFER/INSTALLATIONSNACHWEIS.json
```

### Transfer-Workflow manuell starten — alle Befehle

```bash
gh auth status
gh workflow run transfer-v1.yml -R provoware/PROVOWARE
gh run list -R provoware/PROVOWARE --workflow transfer-v1.yml --limit 5
gh run view RUN_ID -R provoware/PROVOWARE
gh run download RUN_ID -R provoware/PROVOWARE
```

## I005-Qualifikation

Workflow `31330952896` erzeugte **50 Wheels mit 294,43 MB** (`280,79 MiB`, `294428822` Byte). Artifact-ID `9042907351`; SHA-256 `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040`.

## I006-Qualifikation

Workflow `31331742667` führte zwei getrennte Offline-Clean-Bootstraps aus. Beide Paket-Freezes waren byteidentisch; Freeze-SHA-256 `5e44649e72afd6b6076f76c21bcb29b8232d17ae106bdece4e0cca122090b1ed`. Evidence-Artefakt `9043135144` besitzt ca. **0,003 MB** und SHA-256 `2029a08b0b772524bb023b1066bf0730a3ec2ca118723af6caf5c4f3778f7636`.

## Harte Entwicklungsregel

Noch keine breite Modul-, Daten- oder UI-Implementierung. P02 schließt zuerst I007–I010 als stabile Vertrags- und Architekturbasis ab. Erst danach folgt P03.

## Rückfall

Der vorherige I006-main-Stand bleibt auf folgendem Backupzweig erhalten:

```bash
git fetch origin backup/vor-i007-promotion-2026-08-09
git log --oneline --decorate -5 origin/backup/vor-i007-promotion-2026-08-09
```

## Masterplan-Identität

- Version: `2.0.0`
- Stand: `2026-08-09`
- Größe: **0,270 MB** (`269583` Byte)
- Seiten: 81
- SHA-256: `e0aa1afe47a9cde2333d651fbf662c923382be00bd3af17a35f63d867dba3f8c`

## Dokumentationsregel

Jede Installations-, Wiederherstellungs-, Build- oder Bedienanleitung enthält alle benötigten Befehle vollständig, kopierbar und in richtiger Reihenfolge. Bei Downloads, Paketen und Artefakten wird die Größe zusätzlich in **MB** angegeben.
