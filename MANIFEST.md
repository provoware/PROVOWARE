# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Interne Entwicklungsstufe: `0.4.2-H1 – Persistence Portability Foundation`

## Kanonische Verträge

- Modulvertrag: `1`
- Workspace-Vertrag: `1`
- Project-Data-Produktionsschema: `1`
- Data-Studio-PRO-Metadatenvertrag: `1`
- Runtime-Persistence-Vertrag: `1`
- Runtime-Persistence-Writer: `scripts/runtime-persistence.mjs`
- Recovery-Backup-Limit: `10`
- Browser-E2E primär: `chromium`
- Browser-E2E alternativ: `firefox`
- HTML-Mirror: `1366 × 900 @ 0,5`

Produktversion, Project-Data-Schema und PRO-Metadatenformat werden durch H1 nicht verändert.

## Laufzeitstruktur

### Einstieg / Server

- `index.html` – HTML-Einstieg.
- `start.cmd` / `start.sh` – plattformnahe Starts.
- `scripts/start.mjs` – lokaler Server, API-Routing und statische Auslieferung.

### Runtime-Persistenz

- `scripts/runtime-persistence.mjs` – gemeinsamer fail-closed Writer.
- `scripts/project-data-service.mjs` – Project-Data-Fachlogik; delegiert Writes.
- `scripts/data-studio-pro-service.mjs` – PRO-Fachlogik; delegiert Writes.
- `scripts/project-data-recovery.mjs` – bestehende Project-Data-Recovery.

### Fachmodule

| Modul | Version | Slot | Aufgabe |
| --- | --- | --- | --- |
| `development-notes` | `0.4.0` | `quickbar` | zeitgestempelte Schnellnotiz |
| `data-studio` | `0.4.0` | `details` | Vorlagen und Datensätze |
| `data-studio-pro` | `0.4.2` | `details` | Suche, Filter, Kategorien, Bibliothek, Ansichten, Export |
| `data-studio-pro-bridge` | `0.4.2` | intern | Navigation/Revisionskopplung zum CRUD-Editor |
| `data-recovery` | `0.4.1` | `details` | Backup, Restore, Export/Import und Migration |

## Runtime-Datendateien

### Project Data

`data/project-data.json`

Schema v1:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

### Data Studio PRO

`data/data-studio-pro.json`

Schema v1:

- `schemaVersion`
- `revision`
- `categories[]`
- `templateCategories[]`
- `savedViews[]`

Beide Dateien bleiben aus Git, Quellcode-Auto-Fix und statischer Direktauslieferung ausgeschlossen.

## H1 Runtime-Persistence-Vertrag

Kanonischer Ablauf:

```text
prepare directory
-> create/write temp in target directory with wx
-> optional beforeReplace failure hook
-> bounded rename/replace
-> cleanup temp on failure
```

### Fail-closed-Regeln

- Temp-Datei muss im selben Zielverzeichnis liegen.
- Temp-Datei wird exklusiv mit `wx` erzeugt.
- Fachservices besitzen keinen eigenen `rename()`-Pfad mehr.
- ein `unlink(target) -> rename(temp)`-Fallback ist verboten.
- vorhandene Live-Datei wird bei nicht sicherem Replace nicht vorher entfernt.
- bestehender `beforeRename`-Failpoint bleibt kompatibel.
- teilweise erzeugte Temp-Dateien werden nach Schreibfehlern best-effort entfernt.
- `EEXIST` beim exklusiven Temp-Erzeugen führt nicht zum Löschen einer möglicherweise fremden Temp-Datei.

### Replace-Retry

Nur transiente Replace-Fehler werden begrenzt wiederholt:

- `EBUSY`
- `EPERM`

Standard: maximal 3 Replace-Versuche. Permanente Fehler werden fail-closed weitergereicht.

### Fehlerklassifikation

- `LOCKED`
- `PERMISSION`
- `READ_ONLY`
- `NO_SPACE`
- `TEMP_CREATE`
- `WRITE_FAILED`
- `REPLACE_FAILED`
- `UNKNOWN`

## Bestehende Recovery – 0.4.1

Altes Backupformat bleibt unverändert:

`data/backups/project-data/*.pwbak`

Es sichert ausschließlich Project Data. Bestehende Verträge bleiben:

- Rotation auf 10
- SHA-256
- Sicherheitsbackup vor Restore/Import
- Vorschau vor Bestätigung
- atomarer Project-Data-Ersatz
- Failure-Injection
- Migrationsengine `n -> n+1`

`data/data-studio-pro.json` wird **nicht** still in `.pwbak` hineingemischt.

## Geplanter 0.4.3 Recovery Envelope

Erst nach H1b wird ein neuer, explizit versionierter gemeinsamer Sicherungsvertrag eingeführt. Geplant:

- Project Data und PRO als getrennte Komponenten
- SHA-256 und Byte-Länge je Komponente
- Status `valid` / `invalid` / `missing`
- bestehende `.pwbak`-Kompatibilität
- Restore-Vorschau
- Safety-Envelope
- Transaktionsjournal
- Multi-Datei-Rollback
- Crash-/Failure-Injection zwischen Komponenten

## Quality Gates

### Core

`npm run verify`

Kette:

`PROJECT LINT -> QUALITY GATE -> NODE TEST RUNNER`

Erster vollständig grüner H1-Stand:

- Node 20: PASS
- Node 24: PASS
- 44 JavaScript-Dateien gelintet
- 109 Projektdateien geprüft
- 112/112 Node-Tests
- 0 Fehler

Der zentrale Quality Gate verlangt H1-Dateien und prüft statisch die gemeinsame Writer-Architektur.

### Browser

Chromium bleibt automatischer Primärbrowser. Firefox bleibt optional/manuell.

Aktuelle Browserpfade:

1. CRUD + Recovery + Export/Import.
2. Data Studio PRO + Reload + Vorlagenexport.
3. HTML-Geometrie-Mirror.

Der erste Chromium-Lauf nach H1-Writer-Migration ist vollständig grün.

## H1 Tests

- `tests/runtime-persistence.test.mjs`
- `tests/runtime-persistence-integration.test.mjs`

Abgedeckt werden:

- echter Replace-Erfolg
- gleiches Zielverzeichnis für Temp
- Failure-Injection vor Replace
- bytegenauer Live-Dateierhalt
- Cleanup
- teilweiser Temp-Schreibfehler / `ENOSPC`
- `EPERM`-Retry mit Obergrenze
- permanenter `EACCES`-Abbruch
- Verzeichnis-/Rechtefehler
- Fehlerklassifikation
- gemeinsame Nutzung durch beide Fachservices
- Verbot eigener Fach-`rename()`-Pfade
- Verbot destruktiver Target-Unlink-Fallbacks

## Entwicklungsnachweise H1

- `docs/PLAN_0.4.2_H1_PERSISTENCE_PORTABILITY.md`
- `docs/CHECKPOINT_0.4.2_H1_PERSISTENCE_PORTABILITY.md`
- `docs/CHECKLIST_0.4.2_H1_PERSISTENCE_PORTABILITY.md`

## Nächste Gates

1. `0.4.2-H1b Cross-OS Persistence Gate`: reale Ubuntu-/Windows-Dateisystemmatrix und Portability-Report.
2. `0.4.3 Recovery Envelope`: gemeinsames Backup + Journal + Multi-Datei-Rollback.
3. Windows-Chromium-E2E erst nach stabilem H1b-Dateisystem-Gate.
