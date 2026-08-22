# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Interne Entwicklungsstufe: `0.4.2 – Data Studio PRO · Search, Categories, Template Library & Saved Views`

Verträge:

- Modulvertrag: `1`
- Workspace-Vertrag: `1`
- Project-Data-Produktionsschema: `1`
- Data-Studio-PRO-Metadatenvertrag: `1`
- Workspace-Schlüssel: `provoware.allin.workspace.main.v1`
- Recovery-Backup-Limit: `10`
- Browser-E2E primär: `chromium`
- Browser-E2E alternativ: `firefox`
- HTML-Mirror: `1366 × 900 @ 0,5`

Produktversion, Workspace-Vertrag und Project-Data-Produktionsschema ändern sich durch 0.4.2 nicht.

## Laufzeitstruktur

### Einstieg

- `index.html` – HTML-Einstieg
- `start.cmd` / `start.sh` – Plattform-Einstiege
- `scripts/start.mjs` – lokaler Server, Node-Prüfung, statische Auslieferung sowie Project-Data-/Recovery-/PRO-API-Routing

### Oberfläche und Kern

- `assets/styles.css` – Basisdarstellung
- `assets/workspace-layout.css` – Workspace-Größen-/Resize-Darstellung
- `assets/project-data.css` – gemeinsame container-responsive Darstellung für Data Studio, PRO und Recovery
- `assets/app.js` – App-Initialisierung
- `assets/module-registry.js` – Modulvertrag und Lifecycle
- `modules/registry.js` – kanonischer Modulkatalog

### Aktive Fachmodule

| Modul | Version | Slot | Aufgabe |
| --- | --- | --- | --- |
| `development-notes` | `0.4.0` | `quickbar` | zeitgestempelte Schnellnotiz |
| `data-studio` | `0.4.0` | `details` | stabiler Vorlagen-/Datensatz-CRUD-Editor |
| `data-studio-pro` | `0.4.2` | `details` | Suche, Filter, Kategorien, Vorlagenbibliothek, Vorlagenexport, gespeicherte Ansichten |
| `data-studio-pro-bridge` | `0.4.2` | – | Navigation zum bestehenden CRUD-Editor und Revisionssynchronisierung |
| `data-recovery` | `0.4.1` | `details` | Backup, Restore, Export/Import und Migrationsvertrag |

## Project Data – Produktionsdaten

Live-Datenbank:

`data/project-data.json`

Schema v1:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

Verantwortliche Schicht:

`scripts/project-data-service.mjs`

Schutz:

- serverseitige Vorlagen-/Datensatzvalidierung
- atomare Temp-Datei-zu-Rename-Persistenz
- zentrale serialisierte Mutationssperre
- Same-Origin-Schutz
- keine freie Serverpfadwahl aus Browserdaten
- Laufzeitdatenbank und Temp-Dateien aus Git ausgeschlossen
- statische Auslieferung der Datenbank blockiert
- beschädigte Live-Datei wird nicht still überschrieben

## Data Studio PRO – 0.4.2

### Ziel

Recherche und Organisation werden vom stabilen CRUD-Editor getrennt gehalten. `data-studio-pro` liest Project Data, speichert aber ausschließlich eigene Organisationsmetadaten.

### PRO-Runtime-Datei

`data/data-studio-pro.json`

Metadatenvertrag v1:

```text
schemaVersion
revision
categories[]
templateCategories[]
savedViews[]
```

Kategorie:

```text
id
name
createdAt
updatedAt
```

Vorlagenzuweisung:

```text
templateId
categoryId
```

Gespeicherte Ansicht:

```text
id
name
templateId | null
categoryId | null
query
sort
createdAt
updatedAt
```

Sortiermodi:

- `updated-desc`
- `updated-asc`
- `created-desc`
- `created-asc`

### PRO-Persistenzregeln

`scripts/data-studio-pro-service.mjs` verantwortet:

- Metadatenvertrag v1
- Kategorievalidierung und case-insensitive Eindeutigkeit
- Prüfung von Vorlagenreferenzen gegen die aktuelle Project-Data-Datenbank
- Prüfung von Kategorienreferenzen
- gespeicherte Ansichten
- Same-Origin-geschützte PRO-API
- atomare Persistenz

PRO verwendet dieselbe exportierte `withMutationLock()`-Sperre wie CRUD und Recovery. Dadurch schreibt keine zweite lokale Mutationsschiene parallel an den projektgebundenen Datenstrukturen vorbei.

Atomarer PRO-Pfad:

```text
validieren
-> Temp-Datei vollständig schreiben
-> optionaler Failure-Injection-Hook
-> atomarer Rename
```

Ein Fehler vor Rename entfernt die Temp-Datei und lässt den vorherigen PRO-Bestand bytegenau unverändert.

### PRO-Oberfläche

`modules/data-studio-pro/index.js` bietet:

- Datensatz-Volltextsuche über Feldbezeichnungen und sichtbare Werte
- Vorlagenfilter
- Kategorienfilter
- vier Sortiermodi
- Trefferzahl / Nulltrefferanzeige
- Vorlagenbibliothek
- Bibliothekssuche
- Bibliotheks-Kategorienfilter
- Kategorien anlegen/löschen
- Vorlage einer Kategorie zuweisen oder lösen
- gespeicherte Ansicht anlegen/anwenden/löschen
- Vorlagenexport

`modules/data-studio-pro-bridge/index.js` bietet bewusst nur Integration:

- PRO-Treffer im bestehenden CRUD-Editor öffnen
- PRO-Vorlagen im bestehenden Editor auswählen
- gerenderte Data-Studio-Revision beobachten
- nach einer echten CRUD-Revision `provoware:data-studio-refreshed` auslösen

Die Bridge enthält keine eigene API-/CRUD-Persistenz.

### Vorlagenexport-Vertrag

Formatkennung:

`provoware-data-studio-template`

Formatversion:

`1`

Enthalten:

- `exportedAt`
- optionale Kategoriebezeichnung
- Vorlagen-Schemaversion
- Name
- Beschreibung
- Felddefinitionen mit IDs, Labels, Typ, Pflichtstatus und Auswahlwerten

Nicht enthalten:

- keine Datensätze
- keine PRO-Ansichten
- keine frei wählbaren Serverpfade

### PRO-API

- `GET /api/provoware/data-studio-pro`
- `POST /api/provoware/data-studio-pro/categories`
- `DELETE /api/provoware/data-studio-pro/categories/:id`
- `PUT /api/provoware/data-studio-pro/template-categories/:templateId`
- `POST /api/provoware/data-studio-pro/saved-views`
- `DELETE /api/provoware/data-studio-pro/saved-views/:id`

Schreibzugriffe sind Same-Origin-gebunden und besitzen eine feste Payload-Obergrenze.

### Runtime-Schutz

- `data/data-studio-pro.json` aus Git ausgeschlossen
- `data/data-studio-pro.json.tmp-*` aus Git ausgeschlossen
- statische Auslieferung beider Pfade blockiert
- beide Pfade aus `npm run fix` / Quellcode-Walk ausgeschlossen
- `localStorage` und `sessionStorage` für PRO durch Projekt-Linter verboten
- direkter `file://`-Start deaktiviert PRO-Schreib-/Suchbedienung kontrolliert

## Recovery & Migration – 0.4.1

Recovery-Backups:

`data/backups/project-data/*.pwbak`

`scripts/project-data-recovery.mjs` verantwortet:

- Backup und Rotation
- Backup-Liste und Restore-Vorschau
- SHA-256-Fingerprints
- Sicherheitsbackup vor Restore/Import
- Restore
- JSON-Export/-Import
- Erhalt beschädigter Live-Rohbytes
- deterministische Migrationsplanung

Restore-/Import-Vertrag:

```text
Vorschau
-> SHA-256-Bindung
-> explizite Bestätigung
-> Sicherheitsbackup
-> atomarer Ersatz
```

Produktionsziel bleibt Project-Data-Schema `1`. `v1 -> v2` existiert weiterhin nur als isolierte Testfixture.

### Bewusste 0.4.2-Recovery-Grenze

Das bestehende `.pwbak`-Format aus 0.4.1 sichert **nur** `data/project-data.json`.

`data/data-studio-pro.json` wird in 0.4.2 nicht still in dieses bestehende Format eingebaut. Eine gemeinsame Sicherung von Produktionsdaten + PRO-Metadaten erfordert einen eigenen versionierten Recovery-Envelope-Vertrag, damit alte `.pwbak`-Dateien und Restore-Semantik eindeutig bleiben.

## Bestehende Project-Data-API

- `POST /api/provoware/development-notes`
- `GET /api/provoware/project-data`
- `POST /api/provoware/project-data/templates`
- `PUT /api/provoware/project-data/templates/:id`
- `POST /api/provoware/project-data/records`
- `PUT /api/provoware/project-data/records/:id`
- `DELETE /api/provoware/project-data/records/:id`

Recovery:

- `GET /api/provoware/project-data/recovery/backups`
- `POST /api/provoware/project-data/recovery/backups`
- `POST /api/provoware/project-data/recovery/preview-backup`
- `POST /api/provoware/project-data/recovery/restore`
- `GET /api/provoware/project-data/recovery/export`
- `POST /api/provoware/project-data/recovery/preview-import`
- `POST /api/provoware/project-data/recovery/import`

## `file://`-Vertrag

Direkter Start über `index.html` bleibt möglich.

Verfügbar:

- Workspace
- statische Oberfläche
- Modulinitialisierung

Kontrolliert deaktiviert:

- Entwicklungsnotiz schreiben
- Data-Studio-Mutationen
- Data-Studio-PRO-API-Funktionen
- Recovery-Aktionen

Nutzerhinweise verweisen auf den lokalen Klick-&-Start-Server.

## Container-responsive UI-Vertrag

`.data-studio` ist ein Inline-Size-Container.

Regeln:

- Standard: einspaltig
- Feldzeilen/PRO-Filter ab `520px` Containerbreite verdichtet
- Hauptkarten ab `760px` Containerbreite zweispaltig
- Controls besitzen `scroll-margin-top: 84px`

Damit reagieren Data Studio, Data Studio PRO und Recovery auf ihre reale Fachmodulbreite und nicht nur auf den Browserviewport.

## Chromium-first Browser-E2E

Primärprojekt:

`chromium`

Optional:

`firefox`

Playwright:

`1.62.1` exakt als Dev-Abhängigkeit gepinnt.

Browser-Testserver:

`scripts/browser-e2e-server.mjs`

Der Testserver kopiert das Repository in ein temporäres Verzeichnis und startet den lokalen Server dort. Echte Arbeitsdaten werden dadurch nicht verändert.

### Chromium-Test 1 – CRUD / Recovery

```text
Notiz
-> Datei
-> Vorlage
-> Datensatz
-> Reload
-> Edit
-> Backup
-> Änderung
-> Restore
-> Export
-> Delete
-> Import
```

### Chromium-Test 2 – Data Studio PRO

```text
Vorlage
-> zwei Datensätze
-> Kategorie
-> Kategoriezuweisung
-> Bibliotheksfilter
-> Volltextsuche
-> gespeicherte Ansicht
-> Filter ändern
-> Ansicht anwenden
-> Vorlagenexport
-> Reload
-> gespeicherte Ansicht erneut anwenden
```

### Chromium-Test 3 – HTML Mirror

- Referenz lädt echte `/index.html`
- Spiegel lädt dieselbe echte `/index.html`
- intern jeweils `1366 × 900`
- Spiegel außen `scale(0.5)`
- sichtbar `683 × 450`
- Schlüsselgeometrie muss identisch sein
- `.data-studio-pro` ist Teil des Geometrievergleichs

## Evidenzartefakte

Aktuelle Chromium-Evidenz enthält:

- `01-start.png`
- `02-record-created.png`
- `03-restored.png`
- `04-import-restored.png`
- `05-ui-mirror-pipeline.png`
- `06-ui-mirror-scaled.png`
- `07-data-studio-pro.png`
- `project-data-export.json`
- `data-studio-template-export.json`
- Playwright-Report

Erster vollständig grüner 0.4.2-Artefaktlauf:

- Artifact ID `9476750307`
- SHA-256 `f2eee6beb9baec81126885ce23c8543070afec0fae088045d104cd68a8628f99`

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

GitHub Actions führt den Core-Gate auf Node 20 und Node 24 aus.

Browser-E2E ist ein getrennter, teurerer Chromium-Gate.

### 0.4.2-Testgruppen

- `tests/data-studio-pro-service.test.mjs`
- `tests/data-studio-pro-api.test.mjs`
- `tests/data-studio-pro-ui.test.mjs`
- erweiterte `tests/project-lint.test.mjs`
- erweiterte `tests/browser-e2e-contract.test.mjs`
- erweiterte `tests/browser/project-data.e2e.spec.mjs`

Zusätzlich bleiben sämtliche bestehenden Project-Data-, Recovery-, Workspace-, Registry-, Start-, Lint- und E2E-Regressionen aktiv.

### Erster vollständig grüner 0.4.2-Gate-Stand

- Node 20: PASS
- Node 24: PASS
- Project Lint: `41` JavaScript-Dateien
- Quality Gate: `103` Projektdateien
- Node-Test-Suite: `101/101` PASS
- Chromium: `3/3` PASS
- Firefox automatisch: SKIPPED wie vorgesehen
- HTML-Mirror: PASS

## Entwicklungsdokumente

Project Data / Recovery:

- `docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/PLAN_0.4.1_RECOVERY_MIGRATION.md`
- `docs/CHECKPOINT_0.4.1_RECOVERY_MIGRATION.md`
- `docs/CHECKLIST_0.4.1_RECOVERY_MIGRATION.md`

Browser E2E:

- `docs/PLAN_0.4.1_BROWSER_E2E_HTML_MIRROR.md`
- `docs/CHECKPOINT_0.4.1_BROWSER_E2E_HTML_MIRROR.md`
- `docs/CHECKLIST_0.4.1_BROWSER_E2E_HTML_MIRROR.md`

Data Studio PRO:

- `docs/PLAN_0.4.2_DATA_STUDIO_PRO.md`
- `docs/CHECKPOINT_0.4.2_DATA_STUDIO_PRO.md`
- `docs/CHECKLIST_0.4.2_DATA_STUDIO_PRO.md`

## Bewusst offen nach 0.4.2

- Cross-OS-/Windows-Dateisperren, Pfadseparatoren, Temp-/Rename-Unterschiede und Recovery auf realen Plattformen
- gemeinsamer versionierter Recovery Envelope für Project Data + PRO-Metadaten
- relationale Feldtypen
- Template-Import mit Konflikt-/ID-Vertrag
- SQLite nur bei nachgewiesenem Bedarf
- Pointer-/Touch-Workspace D3b
- reale Project-Data-Schema-v2-Migration erst bei fachlichem Bedarf
