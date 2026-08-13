# PROVOWARE

**Status:** Entwicklung · `0.1.0-dev` · P02/P03 qualifiziert · P04 in Arbeit  
**Repository:** `provoware/PROVOWARE`  
**Aktuelle Herkunftsbaseline:** `BASELINE-2026-08-10-I015`  
**Letzte abgeschlossene Projektiteration:** `I018`  
**Nächste Projektiteration:** `I019`  
**P04-Fortschritt:** **50 % (2/4 Pflichtkerne qualifiziert)**  
**Ziel:** portables, offline-first Linux-Desktopwerkzeug und Wissensspeicher auf professioneller Engineering-Basis.

## Klick & Start

Nach dem Entpacken im Projektordner:

```bash
chmod +x PROVOWARE_STARTEN.sh
./PROVOWARE_STARTEN.sh
```

Die Startdatei installiert **nichts automatisch aus dem Internet**. Sie sucht Python 3.13, zeigt den aktuellen Projektstand und führt eine read-only Schnellprüfung aus:

- JSON-Struktur,
- Baseline-Konsistenz,
- P04-Masterplan-Coverage,
- historische Candidate-/Closure-Gates.

Für die vollständige Entwicklerprüfung, wenn die Entwicklungswerkzeuge bereits installiert sind:

```bash
./PROVOWARE_STARTEN.sh --vollpruefung
```

## Aktueller P04-Stand

Das qualifizierte `MASTERPLAN_COVERAGE_GATE` bindet die P04-Pflichtkerne fail-closed:

| Masterplan-Ursprung | Projektiteration | Zustand |
|---|---|---|
| P04/I015 — dauerhafte ID | I017 | QUALIFIZIERT |
| P04/I016 — Versions-/Manifestregistry | I018 | QUALIFIZIERT |
| P04/I017 — Auditjournal | I019 | EXPLIZIT_WEITERGEFUEHRT |
| P04/I018 — Audit/Debug/Evidence-Trennung | I020 | EXPLIZIT_WEITERGEFUEHRT |

Damit gilt aktuell:

```text
2 von 4 Pflichtkernen qualifiziert
P04-Fortschritt = 50 %
P04-Abschluss = NICHT ERLAUBT
Nächster Pflichtkern = I019
```

Unbekannte oder nicht ausgeführte Qualification wird niemals als PASS behandelt.

## I017 — dauerhafte Identität

Qualifiziert sind typisierte IDs, Persistenz-/Restart-Erhalt, Konfliktblockade und fail-closed Behandlung beschädigter Persistenz. UUID4-Kollisionsfreiheit ist nicht mathematisch bewiesen; Crash-Atomizität und Netzwerkdateisysteme bleiben außerhalb der Qualification.

## I018 — Versions-/Manifestregistry

Qualifiziert sind:

- read-only Single Source of Truth,
- Source-Fingerprint über kanonische Serialisierung und SHA-256,
- separater Contract-Fingerprint für den Interpretationsvertrag,
- gemeinsames Source+Contract Binding Receipt,
- fail-closed Pins und Evidence-Bindung.

Nicht vorgezogen werden Registry-Persistenz, automatische Quellensuche, Receipt-Persistenz, Mehrprojekt-Registry und GUI.

## I019 — nächster Pflichtkern

I019 definiert zunächst einen kleinen, read-only/in-memory Auditjournal-Vertrag mit mindestens:

```text
sequence
payload_hash
prev_hash
entry_hash
```

Abnahmekern: Manipulation an Payload, Reihenfolge oder Kettenlink muss fail-closed erkannt werden. Persistente Journal-Retention gehört erst in den nachfolgenden Pflichtkern I020.

## Lokale Basisprüfung

Voraussetzung: Python `>=3.13,<3.14`.

```bash
python3.13 WERKZEUGE/baseline_pruefen.py
python3.13 WERKZEUGE/projekt_start.py
python3.13 tools/historical_gate_linter.py
```

## Entwicklungsumgebung

```bash
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[entwicklung]'
```

Danach:

```bash
ruff check src tests WERKZEUGE tools
ruff format --check src tests WERKZEUGE tools
mypy src/provoware
pytest -q
```

## Projektidentität und Nachweise

Wichtige maschinenlesbare Dateien:

- `PROJEKTSTATUS.json` — aktueller Projektstand,
- `CURRENT_BASELINE.json` — Herkunftsbaseline plus aktuelle Lifecycle-Zeiger,
- `ITERATIONSUEBERGABE.json` — nächster technischer Pflichtschritt,
- `docs/MASTERPLAN_COVERAGE_P04.json` — P04-Abdeckung,
- `docs/HISTORISCHE_GATES.json` — eingefrorene historische Gates,
- `CHANGELOG.md` — nachvollziehbarer Entwicklungsverlauf.

Der ursprüngliche Masterplan bleibt unverändert referenziert: Version `2.0.0`, Stand `2026-08-09`, SHA-256 `e0aa1afe47a9cde2333d651fbf662c923382be00bd3af17a35f63d867dba3f8c`.

## Paketstruktur

Das vollständige Wissensspeicher-Paket enthält:

```text
PROVOWARE_WISSENSSPEICHER_AKTUELL/
├── START_HIER.sh
├── PAKETINFO.json
├── PROVOWARE/
│   └── PROVOWARE_STARTEN.sh
└── PROVOWARE_MASTER_BOOK_2026/
```

`START_HIER.sh` ist der direkte Einstieg im Gesamtpaket. Das Masterbuch wird im Paket an den qualifizierten kanonischen Stand gebunden.

## Dokumentationsregel

Alle sichtbaren Bezeichnungen sollen möglichst auf Deutsch geführt werden. Technische Fachbegriffe werden bei Bedarf ergänzend in Klammern genannt. Installations-, Build- und Prüfanleitungen enthalten vollständige, kopierbare Befehle in richtiger Reihenfolge.
