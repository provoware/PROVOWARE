# PROVOWARE

**Status:** Neuaufbau · `0.1.0-dev` · P00/P01 qualifiziert · P02 in Arbeit  
**Repository:** `provoware/PROVOWARE`  
**Aktuelle Baseline:** `BASELINE-2026-08-09-I009`  
**Letzte abgeschlossene Iteration:** `I009`  
**Nächste Iteration:** `I010`  
**P02-Fortschritt:** **75 %**  
**Ziel:** portables, offline-first Linux-Desktopwerkzeug auf professioneller Engineering-Basis.

## Aktueller Implementierungsstand

Abgeschlossen und qualifiziert sind I000-I009. P00 und P01 sind vollständig qualifiziert. Innerhalb P02 sind I007 Kernverträge, I008 Manifest-/Projektschemata und I009 Operationsverträge grün. I010 schließt P02 als gemeinsames Architektur- und Vertragsgate; erst danach darf P03 beginnen.

## I007 — öffentliche Kern-API

Qualifiziert und seit I008 als öffentliche API geschützt sind `ProjektId`, `ObjektId`, `RevisionId`, `ChangeId`, `OperationId`, `Status`, `Fehlerklasse`, `FehlerInfo` und die Erfolgs-/Fehlerinvarianten von `OperationErgebnis[T]`.

## I008 — Manifest- und Projektschemata

`SchemaVersion` und `ProduktVersion` sind technisch getrennt. `ManifestSchema` und `ProjektSchema` sind strikt versioniert, lehnen unbekannte Felder ab und serialisieren deterministisch. Golden-Fixtures und eine AST-basierte Architekturgrenze sichern die Schicht ab.

Finale I008-Qualifikation: Run `31336626886`, Artifact `9044527742`, **0,000618 MB**, SHA-256 `f58529730ac88675ab1b002130abca1f33e8ceffc4df8727c7a09e7ebf194e61`.

## I009 — Operationsverträge

`src/provoware/vertraege/operationen.py` definiert ausschließlich die serialisierbare Operationshülle und enthält keine Handler-, Datei-, SQLite-, Qt- oder Ausführungslogik.

Qualifiziert sind:

- `OperationArt` als validierter Code-Werttyp ohne vorgezogene Fach-Enum,
- `OperationPayload` als unveränderliche kanonische JSON-Objekthülle,
- tiefe Payload-Validierung mit maximal 16 Ebenen, 1024 Container-Einträgen, 128 Zeichen pro Schlüssel und 65.536 Byte kanonischer Payload-Größe,
- explizite Ablehnung von Fließkommazahlen für eindeutige kanonische Semantik,
- `OperationRequest` mit `OperationId`, Operationsart und Payload,
- `OperationResult` auf Basis von `OperationErgebnis[OperationPayload]` und `FehlerInfo`,
- Request-/Result-Korrelation ausschließlich über `OperationId`,
- deterministische JSON-Serialisierung und SHA-256-Fingerprints,
- fail-closed Ablehnung unbekannter Felder,
- gültige und ungültige Golden-Fixtures,
- AST-basierte Architekturgrenze gegen Handler, GUI, SQLite, Persistenz und Dateizugriffe.

Finale GitHub-Qualifikation:

- PR: `#9`
- Workflow-Run: `31337914639`
- Job: `93306696652`
- Branch-Head: `b4ae4a4ef54dff3fabfa6b428f7e62af91100a3f`
- Main-Merge-Commit: `5f94bfc43c038530738d1a320ba6c9a050b39a17`
- Artifact-ID: `9044902480`
- Artifact-Größe: **0,000663 MB** (`663 Byte`)
- Artifact-SHA-256: `962e8e45bb2df60a6ead6750bf9b737520ea30290eabf3df73510a10ef7ec5f9`
- Receipt-SHA-256: `46b8bb9f9f6fa215f70c7fb89fe7afaf884ece0918e02055daa11eb5e4a05e23`
- Ruff Check/Format: GRÜN / 17 Dateien
- `mypy --strict`: GRÜN / 9 Quelldateien
- Contracttests: **49 bestanden**
- Gesamtregression: **68 bestanden**
- I007-Regressionsworkflow: GRÜN / Run `31337914654`
- I008-Regressionsworkflow: GRÜN / Run `31337914673`

## Behobene Inkonsistenzen in I009

Der obsolete parallele I008-PR #7 wurde geschlossen. Außerdem wurde `i008-schemata.yml` promotionsfest gemacht: Nach der I008-Promotion wird nicht mehr fälschlich eine I007-Baseline verlangt; stattdessen wird die aktuelle validierte Baseline geprüft und die historische I008-Evidence separat an Artifact-ID und SHA-256 gebunden.

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
  tests/contract/test_schemata.py \
  tests/contract/test_operationen.py
pytest -q -m contract tests/contract
pytest -q
```

Die Qualitätswerkzeuge werden aus dem verifizierten I005-Wheelhouse verwendet. Für eine reine Baselineprüfung genügt:

```bash
cd "$HOME/PROVOWARE"
python3 WERKZEUGE/baseline_pruefen.py
```

## Repository frisch klonen

```bash
cd "$HOME"
git clone https://github.com/provoware/PROVOWARE.git
cd PROVOWARE
python3 WERKZEUGE/baseline_pruefen.py
```

## Vorhandenes Repository aktualisieren

```bash
cd "$HOME/PROVOWARE"
git status
git pull --ff-only
python3 WERKZEUGE/baseline_pruefen.py
```

## I009-GitHub-Evidence ansehen und herunterladen

```bash
gh auth status
gh run view 31337914639 -R provoware/PROVOWARE
gh run download 31337914639 -R provoware/PROVOWARE
```

## Rückfall auf I008 ansehen

```bash
git fetch origin backup/vor-i009-promotion-2026-08-09
git log --oneline --decorate -5 origin/backup/vor-i009-promotion-2026-08-09
```

## Transfer V1

Der repo-integrierte Transfermechanismus arbeitet mit maximal **24 MiB / 25,17 MB** großen Teilstücken, prüft Einzel- und Gesamthashes, validiert ZIP und Baseline, sichert einen vorhandenen Zielstand und rollt bei Fehler automatisch zurück.

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

## Nächster Pflichtschritt

**I010 — P02-Architekturgate und Gesamtqualifikation.** Das Gate muss I007-I009 gemeinsam als API-, Schema-, Quellinventar-, Abhängigkeits-, Traceability- und Regressionsbasis qualifizieren. Keine P03-Funktion wird in I010 vorgezogen.

## Masterplan-Identität

Version `2.0.0` · Stand `2026-08-09` · **0,270 MB** · 81 Seiten · SHA-256 `e0aa1afe47a9cde2333d651fbf662c923382be00bd3af17a35f63d867dba3f8c`.

## Dokumentationsregel

Jede Installations-, Wiederherstellungs-, Build- oder Bedienanleitung enthält alle benötigten Befehle vollständig, kopierbar und in richtiger Reihenfolge. Bei Downloads, Paketen und Artefakten wird die Größe zusätzlich in **MB** angegeben.
