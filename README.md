# PROVOWARE

**Status:** Neuaufbau · `0.1.0-dev` · P00/P01 qualifiziert · P02 in Arbeit  
**Repository:** `provoware/PROVOWARE`  
**Aktuelle Baseline:** `BASELINE-2026-08-09-I008`  
**Letzte abgeschlossene Iteration:** `I008`  
**Nächste Iteration:** `I009`  
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
- I008: versionierte Manifest-/Projektschemata, Golden-Fixtures und Schema-/Produktversions-Trennung qualifiziert.
- Transfer V1: automatischer 24-MiB-Teiltransfer mit Hashprüfung, Backup, Rollback und End-to-End-Installer repo-integriert.

**P00 und P01 sind vollständig qualifiziert. P02 steht nach I008 bei 50 %.** Nächster Pflichtschritt ist **I009 — OperationRequest-/OperationResult-Verträge**.

## I007 — öffentliche Kern-API

Die in I007 qualifizierten Präfixe und Invarianten werden seit I008 durch Contracttests als öffentliche API geschützt:

- `ProjektId` → `prj_...`
- `ObjektId` → `obj_...`
- `RevisionId` → `rev_...`
- `ChangeId` → `chg_...`
- `OperationId` → `op_...`
- stabile Werte für `Status` und `Fehlerklasse`
- stabile Erfolgs-/Fehlerinvarianten von `OperationErgebnis[T]`

## I008 — Manifest- und Projektschemata

Die Schemaschicht `src/provoware/vertraege/schemata.py` ist bewusst unabhängig von Qt, SQLite, Datei-I/O, Handlern und Modulen.

Qualifiziert sind:

- `SchemaVersion`: ausschließlich numerisches `MAJOR.MINOR.PATCH`
- `ProduktVersion`: eigener Typ, optional mit Vorab-Suffix wie `0.1.0-dev`
- `ManifestSchema`: minimale Identitätshülle
- `ProjektSchema`: minimale Projektidentität mit qualifiziertem `Status`
- `SchemaValidierungsfehler`: stabiler Code, Feldbezug und Nachricht
- deterministische JSON-Serialisierung
- strikte Pflichtfelder und Ablehnung unbekannter Felder
- Golden-Fixtures für gültige und ungültige Beispiele
- AST-basierte Architekturgrenze gegen verbotene Imports und Dateizugriffe

Finale GitHub-Qualifikation:

- Workflow-Run: `31336626886`
- Job: `93303450280`
- Artifact-ID: `9044527742`
- Artifact-Größe: **0,000618 MB** (`618 Byte`)
- Artifact-SHA-256: `f58529730ac88675ab1b002130abca1f33e8ceffc4df8727c7a09e7ebf194e61`
- Receipt-SHA-256: `60d5db55ab1b95e77ad92cd7ae99781bd5b665c071ca95648f30cada5138f7ea`
- `mypy --strict`: GRÜN / 7 Quelldateien
- Contracttests: **30 bestanden**
- Gesamtregression: **48 bestanden**
- Ruff Check/Format: GRÜN / 15 Dateien
- I007-Regressionsworkflow auf finalem I008-Head: GRÜN

## Projekt lokal prüfen — alle Befehle

```bash
cd "$HOME/PROVOWARE"
python3 WERKZEUGE/baseline_pruefen.py
ruff check src tests WERKZEUGE
ruff format --check src tests WERKZEUGE
mypy \
  src/provoware/vertraege \
  tests/contract/test_datentypen.py \
  tests/contract/test_id_varianten.py \
  tests/contract/test_i007_api_freeze.py \
  tests/contract/test_schemata.py
pytest -q -m contract tests/contract
pytest -q
```

Die Qualitätswerkzeuge werden produktiv aus dem verifizierten I005-Wheelhouse verwendet. Ohne lokal installierte Werkzeuge reicht für die reine Baselineprüfung:

```bash
cd "$HOME/PROVOWARE"
python3 WERKZEUGE/baseline_pruefen.py
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

## I008-GitHub-Evidence ansehen und herunterladen

```bash
gh auth status
gh run view 31336626886 -R provoware/PROVOWARE
gh run download 31336626886 -R provoware/PROVOWARE
```

## Rückfall auf den vorherigen validierten I007-Stand ansehen

```bash
git fetch origin backup/vor-i008-promotion-2026-08-09
git log --oneline --decorate -5 origin/backup/vor-i008-promotion-2026-08-09
```

## Transfer V1 — Mechanismus und Installation

Der repo-integrierte Transfermechanismus arbeitet mit maximal **24 MiB / 25,17 MB** großen Teilstücken, prüft Einzel- und Gesamthashes, validiert das ZIP und die Baseline, sichert den vorhandenen Zielstand und rollt bei Fehler automatisch zurück.

Der historische I006-Referenztransfer besitzt **295,21 MB** (`281,53 MiB`). Für jede neue Übergabe wird ein neues, zur aktuellen Baseline passendes Teilset erzeugt.

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

## Qualifizierte Offline-Basis

- I005: 50 Wheels, **294,43 MB**, Artifact `9042907351`, SHA-256 `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040`.
- I006: zwei reproduzierbare Offline-Bootstraps, Artifact `9043135144`, ca. **0,003 MB**, SHA-256 `2029a08b0b772524bb023b1066bf0730a3ec2ca118723af6caf5c4f3778f7636`.
- I007: Kernverträge, Artifact `9044073684`, **0,000575 MB**.
- I008: Schemas, Artifact `9044527742`, **0,000618 MB**.

## Harte Entwicklungsregel

Keine breite Modul-, Daten- oder UI-Implementierung vorziehen. P02 schließt zuerst I007–I010 als stabile Vertrags- und Architekturbasis ab. Auf I008 folgt I009; danach schließt I010 das P02-Architekturgate.

## Masterplan-Identität

- Version: `2.0.0`
- Stand: `2026-08-09`
- Größe: **0,270 MB** (`269583` Byte)
- Seiten: 81
- SHA-256: `e0aa1afe47a9cde2333d651fbf662c923382be00bd3af17a35f63d867dba3f8c`

## Dokumentationsregel

Jede Installations-, Wiederherstellungs-, Build- oder Bedienanleitung enthält alle benötigten Befehle vollständig, kopierbar und in richtiger Reihenfolge. Bei Downloads, Paketen und Artefakten wird die Größe zusätzlich in **MB** angegeben.
