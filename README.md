# PROVOWARE

**Status:** Neuaufbau · `0.1.0-dev` · P00/P01/P02 qualifiziert · P03 freigegeben  
**Repository:** `provoware/PROVOWARE`  
**Aktuelle Baseline:** `BASELINE-2026-08-10-I010`  
**Letzte abgeschlossene Iteration:** `I010`  
**Nächste Iteration:** `I011`  
**P02-Fortschritt:** **100 %**  
**P03-Fortschritt:** **0 %**  
**Ziel:** portables, offline-first Linux-Desktopwerkzeug auf professioneller Engineering-Basis.

## Aktueller Implementierungsstand

Abgeschlossen und qualifiziert sind I000-I010. P00, P01 und P02 sind vollständig qualifiziert. I007-I009 definieren die Kern-, Schema- und Operationsverträge. I010 friert diese drei Schichten als gemeinsame P02-Architekturbasis ein und beweist mit positiven und negativen Tests, dass API- und Architekturdrift erkannt werden. Erst nach dieser grünen Gesamtqualifikation wurde P03 freigegeben.

## P02 — qualifizierte Vertragsbasis

### I007 — öffentliche Kern-API

Qualifiziert und geschützt sind `ProjektId`, `ObjektId`, `RevisionId`, `ChangeId`, `OperationId`, `Status`, `Fehlerklasse`, `FehlerInfo` und die Erfolgs-/Fehlerinvarianten von `OperationErgebnis[T]`.

### I008 — Manifest- und Projektschemata

`SchemaVersion` und `ProduktVersion` sind technisch getrennt. `ManifestSchema` und `ProjektSchema` sind strikt versioniert, lehnen unbekannte Felder ab und serialisieren deterministisch. Golden-Fixtures und eine AST-basierte Architekturgrenze sichern die Schicht ab.

Finale I008-Qualifikation: Run `31336626886`, Artifact `9044527742`, **0,000618 MB**, SHA-256 `f58529730ac88675ab1b002130abca1f33e8ceffc4df8727c7a09e7ebf194e61`.

### I009 — Operationsverträge

`src/provoware/vertraege/operationen.py` definiert die serialisierbare Operationshülle ohne Handler-, Datei-, SQLite-, Qt- oder Ausführungslogik.

Qualifiziert sind `OperationArt`, die unveränderliche kanonische `OperationPayload`, `OperationRequest` und `OperationResult`. Request und Result korrelieren ausschließlich über `OperationId`; Resultate verwenden ausschließlich `OperationErgebnis[OperationPayload]` und `FehlerInfo`. Payloads sind tief begrenzt und Fließkommazahlen werden für eindeutige kanonische Semantik abgewiesen.

Finale I009-Qualifikation: Run `31337914639`, Artifact `9044902480`, **0,000663 MB**, SHA-256 `962e8e45bb2df60a6ead6750bf9b737520ea30290eabf3df73510a10ef7ec5f9`; 49 Contracttests und 68 Gesamtregressionstests bestanden.

## I010 — P02 Architecture Gate

I010 führt die bisher getrennten Schutzmechanismen zu einem einzigen reproduzierbaren Gesamtgate zusammen.

Qualifiziert sind:

- `P02_API_SNAPSHOT.json` als kanonische maschinenlesbare öffentliche P02-API,
- Snapshot-Fingerprint `2e74f555a8b7cc4aaa45f7cb109eaf22a1c255953d9ff98bb159ad2df895ed16`,
- Symbolnamen und Typklassen,
- Dataclass-Felder,
- ID-Präfixe und Enumwerte,
- Manifest-, Projekt- und Operationsschemaversionen,
- Pflichtfelder und Vertragsmarker,
- stabile Schema-/Operationsfehlercodes,
- `P02_QUELLINVENTAR.json` als exaktes hashgebundenes Quelleninventar,
- AST-Abhängigkeitsmatrix über sämtliche P02-Vertragsquellen,
- Versionsraum- und Traceability-Prüfung,
- Scope-Freeze gegen vorgezogene P03-Produktquellen.

### Negativnachweis

Absichtliche Verletzungen werden tatsächlich blockiert. Test-Fixtures erzwingen ROT bei:

- SQLite-Import,
- Qt/PySide-Import,
- Handler-Abhängigkeit,
- Datei-I/O,
- neuer unregistrierter P02-Produktdatei,
- vorgezogener P03-Produktquelle.

### Finale I010-Qualifikation

- PR: `#11`
- Workflow-Run: `31339417368`
- Job: `93310619106`
- Branch-Head: `650efc515d9cfbc3e1a4e3e80bd1dcbde0fbe7a0`
- Qualifikations-Merge-Ref: `ed2d95d8096072a9b4732c479e9a9d9a1de7c600`
- Main-Merge-Commit: `7dfe6d2cf039d9b974bad464ed0efa0aa6eec998`
- Artifact-ID: `9045351696`
- Artifact-Größe: **0,000683 MB** (`683 Byte`)
- Artifact-SHA-256: `6ebf3d679a063eaf4b09f8cc7b8adcc51cea16643596d545796d1acd0f22a9b9`
- Receipt-SHA-256: `cb0b092abd5b2356e5c0197a5e8df48c6e50612d822772d049bb374a6d1c5fee`
- Ruff Check: GRÜN
- Ruff Format: GRÜN / 20 Dateien
- `mypy --strict`: GRÜN / 11 Quelldateien
- Architektur-/Negativtests: **12 bestanden**
- Contracttests: **49 bestanden**
- Gesamtregression: **80 bestanden**
- I005-, I006-, I007-, I008- und I009-Regressionsworkflows auf dem finalen I010-Head: erneut GRÜN

## Projekt lokal prüfen — alle Befehle

```bash
cd "$HOME/PROVOWARE"
python3 WERKZEUGE/baseline_pruefen.py
python3 WERKZEUGE/p02_architekturgate.py --phase-abschluss --nach-promotion
ruff check src tests WERKZEUGE
ruff format --check src tests WERKZEUGE
mypy \
  src/provoware/vertraege \
  WERKZEUGE/p02_architekturgate.py \
  tests/architecture/test_p02_architekturgate.py \
  tests/contract/test_datentypen.py \
  tests/contract/test_id_varianten.py \
  tests/contract/test_i007_api_freeze.py \
  tests/contract/test_schemata.py \
  tests/contract/test_operationen.py
pytest -q -m architecture tests/architecture
pytest -q -m contract tests/contract
pytest -q
```

Die Qualitätswerkzeuge werden produktiv aus dem verifizierten I005-Wheelhouse verwendet. Für die reine Baselineprüfung genügt:

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
python3 WERKZEUGE/p02_architekturgate.py --phase-abschluss --nach-promotion
```

## Vorhandenes Repository aktualisieren

```bash
cd "$HOME/PROVOWARE"
git status
git pull --ff-only
python3 WERKZEUGE/baseline_pruefen.py
python3 WERKZEUGE/p02_architekturgate.py --phase-abschluss --nach-promotion
```

## I010-GitHub-Evidence ansehen und herunterladen

```bash
gh auth status
gh run view 31339417368 -R provoware/PROVOWARE
gh run download 31339417368 -R provoware/PROVOWARE
```

## Rückfall auf I009 ansehen

```bash
git fetch origin backup/vor-i010-promotion-2026-08-10
git log --oneline --decorate -5 origin/backup/vor-i010-promotion-2026-08-10
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

**I011 — Linux-Systemprofil und X11-Erkennung.** I011 beginnt P03 als read-only Plattformprofil. Ubuntu 22.04 und 24.04 amd64 X11 bilden den Abnahmekern. Pfadnormalisierung, atomare Dateischreibprimitive und Lock-Leases bleiben ausdrücklich I012-I014 vorbehalten.

## Masterplan-Identität

Version `2.0.0` · Stand `2026-08-09` · **0,270 MB** · 81 Seiten · SHA-256 `e0aa1afe47a9cde2333d651fbf662c923382be00bd3af17a35f63d867dba3f8c`.

## Dokumentationsregel

Jede Installations-, Wiederherstellungs-, Build- oder Bedienanleitung enthält alle benötigten Befehle vollständig, kopierbar und in richtiger Reihenfolge. Bei Downloads, Paketen und Artefakten wird die Größe zusätzlich in **MB** angegeben.
