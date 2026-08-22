# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Aktuelle interne Entwicklungsstufe: `0.4.1 – Recovery & Migration · Backup, Restore, Import/Export & Failure Injection`

Modulvertragsversion: `1`

Workspace-Vertragsversion: `1`

Project-Data-Schemaversion: `1`

Persistenter Workspace-Schlüssel:

`provoware.allin.workspace.main.v1`

Die Produktversion und das Produktions-Datenschema bleiben unverändert, bis jeweils ein eigener Release- beziehungsweise Migrationsvertrag abgenommen wurde.

## Laufzeitstruktur

### Einstieg

- `index.html` – lokale HTML-Einstiegsdatei und deterministische Asset-Reihenfolge
- `start.cmd` / `start.sh` – Plattform-Einstiege
- `scripts/start.mjs` – Node-Prüfung, lokaler Webserver, statische Auslieferung und Project-Data-API-Routing

### Oberfläche und Kernlogik

- `assets/styles.css` – Dark-/Petrol-Basisdarstellung
- `assets/workspace-layout.css` – Desktop-Größen- und Resize-Darstellung
- `assets/project-data.css` – gemeinsame Darstellung für Project-Data-Module
- `assets/app.js` – App-Start und Subsysteminitialisierung
- `assets/module-registry.js` – Modulvertrag und Lifecycle
- `modules/registry.js` – kanonischer Modulkatalog

### Aktive Fachmodule

| Modul | Version | Slot | Aufgabe |
| --- | --- | --- | --- |
| `development-notes` | `0.4.0` | `quickbar` | zeitgestempelte Schnellnotiz in feste Projekttextdatei |
| `data-studio` | `0.4.0` | `details` | Vorlagenbaukasten und Datensatzverwaltung |
| `data-recovery` | `0.4.1` | `details` | Backup, Restore-Vorschau, Export/Import und Migrationsvertrag |

## Project-Data-Dateien

### Entwicklungsnotizen

`data/ENTWICKLUNGSNOTIZEN.txt`

Format:

```text
[YYYY-MM-DD HH:mm:ss] Text
```

### Live-Datenbank

`data/project-data.json`

Schema Version 1:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

Temporäre atomare Dateien:

`data/project-data.json.tmp-*`

Live-Datenbank und Temp-Dateien bleiben aus Git ausgeschlossen und werden vom Auto-Fix nicht verändert.

### Recovery-Backups

`data/backups/project-data/*.pwbak`

Vertrag:

- Inhalt sind die exakten Rohbytes des gesicherten Live-Zustands.
- valide JSON-Bestände erhalten zusätzlich eine Schema-/Inhaltszusammenfassung.
- beschädigte Live-Dateien dürfen als `valid: false` gesichert werden, damit Recovery keine Ausgangsdaten vernichtet.
- maximale Rotation: `10` Backups.
- Backup-ID besitzt ein festes serverseitiges Muster.
- keine freie Dateipfadwahl durch Browserdaten.
- Verzeichnis bleibt aus Git ausgeschlossen.
- Verzeichnis ist gegen statische Auslieferung geschützt.
- Dateiendung `.pwbak` verhindert eine Behandlung als Quellcode-JSON durch den semantikneutralen Auto-Fix.

## Verantwortungsgrenzen

### `scripts/project-data-service.mjs`

Verantwortet:

- Produktionsschema v1
- CRUD-Validierung
- feste Live-Dateipfade
- atomare Persistenz
- gemeinsame serialisierte Mutationssperre
- Vorlagenkompatibilität
- Basis-API und Same-Origin-Schutz

Zusätzlich für Recovery freigegeben:

- `writeProjectDatabaseAtomic`
- `withMutationLock`

Der atomare Writer besitzt einen optionalen `beforeRename`-Hook ausschließlich für deterministische Fehlerproben und kontrollierte Vorprüfungen. Standard-CRUD übergibt keinen Hook.

### `scripts/project-data-recovery.mjs`

Verantwortet:

- Backup-Erzeugung
- Rotation
- Backup-Liste und Vorschau
- SHA-256-Fingerprints
- Restore
- JSON-Export
- Import-Vorschau und Import
- Sicherheitsbackup vor Restore/Import
- Erhalt beschädigter Live-Rohbytes vor Recovery
- Migrationsplanung und Migrationskette
- Recovery-API

Recovery und CRUD schreiben niemals parallel an der gemeinsamen Mutationssperre vorbei.

## Recovery-Ablauf

### Restore

```text
Backup auswählen
-> Backup erneut lesen
-> JSON/Schemavertrag validieren
-> SHA-256-Vorschau erzeugen
-> Nutzer bestätigt
-> Backup erneut lesen
-> SHA-256 gegen Vorschau prüfen
-> aktuellen Live-Rohzustand sichern
-> Ziel in Temp-Datei vollständig schreiben
-> optionaler Failure-Injection-Hook
-> atomarer Rename
```

### Import

```text
JSON-Datei auswählen
-> Browser parst JSON
-> Server prüft Kandidat/Migrationsplan
-> SHA-256-Vorschau erzeugen
-> Nutzer bestätigt
-> Kandidat serverseitig erneut normalisieren
-> SHA-256 gegen Vorschau prüfen
-> aktuellen Live-Rohzustand sichern
-> Kandidat atomar ersetzen
```

Eine geänderte Quelle zwischen Vorschau und Ausführung führt zu `409 Conflict` statt zu einem stillen Ersatz.

## Migrationsvertrag

Produktionsziel bleibt Schema `1`.

Zukünftige Migrationen dürfen ausschließlich schrittweise erfolgen:

```text
1 -> 2 -> 3 -> ...
```

Regeln:

- jeder Schritt ist explizit registriert
- kein Überspringen fehlender Schritte
- keine Rückwärtsmigration
- jeder Migrator muss exakt `n+1` liefern
- Quellobjekt wird vor jedem Schritt geklont
- Plan kann vor Mutation beschrieben werden

Aktuell existiert **keine Produktionsmigration v1→v2**. Eine isolierte Testfixture beweist lediglich Engine, Schrittfolge und Determinismus.

## Recovery-API

- `GET /api/provoware/project-data/recovery/backups`
- `POST /api/provoware/project-data/recovery/backups`
- `POST /api/provoware/project-data/recovery/preview-backup`
- `POST /api/provoware/project-data/recovery/restore`
- `GET /api/provoware/project-data/recovery/export`
- `POST /api/provoware/project-data/recovery/preview-import`
- `POST /api/provoware/project-data/recovery/import`

Recovery-Schreibzugriffe sind Same-Origin-gebunden. Recovery-JSON-Anfragen besitzen eine feste Payload-Obergrenze.

## Bestehende Project-Data-API

- `POST /api/provoware/development-notes`
- `GET /api/provoware/project-data`
- `POST /api/provoware/project-data/templates`
- `PUT /api/provoware/project-data/templates/:id`
- `POST /api/provoware/project-data/records`
- `PUT /api/provoware/project-data/records/:id`
- `DELETE /api/provoware/project-data/records/:id`

## `file://`-Vertrag

Direkter Start über `index.html` bleibt möglich.

- Workspace und statische Oberfläche bleiben verfügbar.
- Project-Data-Module laden kontrolliert.
- Datei-Schreibzugriffe, Data-Studio-Mutationen und Recovery-Aktionen werden deaktiviert.
- Nutzerhinweis verweist auf den lokalen Klick-&-Start-Server.

## Workspace-Vertrag

Workspace-Version bleibt `1`.

Persistiert werden weiterhin nur:

- Panelreihenfolge
- Sichtbarkeit
- Rasterbreite `widthUnits`
- optionale Höhe `heightPx`

0.4.1 verändert weder Workspace-Key noch Workspace-Schema.

## Qualitätskette

Kanonische Befehle:

```bash
npm run lint
npm run fix
npm run verify
```

`verify`:

```text
PROJECT LINT
-> QUALITY GATE
-> NODE TEST RUNNER
```

GitHub Actions führt dasselbe Gate auf Node 20 und Node 24 aus.

### 0.4.1-Testgruppen

- `tests/project-data-recovery.test.mjs`
- `tests/project-data-recovery-api.test.mjs`
- `tests/project-data-recovery-ui.test.mjs`

Zusätzlich bleiben sämtliche bestehenden 0.4.0-, Workspace-, Registry-, Start- und Quality-Gate-Tests aktiv.

### Failure-Injection-Nachweise

Automatisiert geprüft:

- Fehler direkt vor dem atomaren Rename
- bytegenau unveränderte Live-Datei nach diesem Fehler
- erhaltenes Sicherheitsbackup trotz fehlgeschlagenem Restore
- beschädigte Live-Datei vor Import und Erhalt ihrer Rohbytes
- veraltete SHA-256-Bestätigung
- unbekannte/höhere Schemaversion
- Rückwärtsmigration
- fehlender Migrationsschritt
- deterministische isolierte v1→v2-Migrationsfixture
- Backup-Rotation auf zehn Dateien

## Erster technischer 0.4.1-Gate-Stand

- Node 20: `success`
- Node 24: `success`
- Project Lint: `30` JavaScript-Dateien
- Quality Gate: `82` Projektdateien
- Tests: `81/81` erfolgreich, `0` fehlgeschlagen

Ein finaler Gate-Lauf nach vollständiger Dokumentationssynchronisierung bleibt vor Merge verpflichtend.

## Entwicklungsdokumente

- `docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/PLAN_0.4.1_RECOVERY_MIGRATION.md`
- `docs/CHECKPOINT_0.4.1_RECOVERY_MIGRATION.md`
- `docs/CHECKLIST_0.4.1_RECOVERY_MIGRATION.md`
- `docs/WORKSPACE_CONTRACT.md`
- `docs/RESIZE_CONTRACT_0.3.0.md`

## Bewusst noch offen

- reale Schema-v2-Produktionsmigration erst bei realem Bedarf
- Firefox-/Chrome-E2E-Gate
- Cross-OS-CI Windows/macOS
- 0.4.2 Suche/Filter/Vorlagenbibliothek und optionaler Storage-Adapter
- paralleler Workspace-Strang D3b/E/F/G
