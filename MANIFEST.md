# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Aktuelle interne Entwicklungsstufe: `0.4.0 – Project Data Studio · Integration & Regression Hardening`

Modulvertragsversion: `1`

Workspace-Vertragsversion: `1`

Project-Data-Schemaversion: `1`

Persistenter Workspace-Schlüssel:

`provoware.allin.workspace.main.v1`

Die Produktversion bleibt bis zu einem ausdrücklich freigegebenen Release unverändert `0.2.0`.

## Laufzeitstruktur

### Einstieg

- `index.html` – lokale HTML-Einstiegsdatei und deterministische Asset-Reihenfolge
- `start.cmd` / `start.sh` – Plattform-Einstiege für die automatische lokale Startroutine
- `scripts/start.mjs` – Node-Prüfung, lokaler Webserver, statische Auslieferung und Project-Data-API-Routing

### Oberfläche und Kernlogik

- `assets/styles.css` – Dark-/Petrol-Basisdarstellung
- `assets/workspace-layout.css` – Desktop-Größen- und Resize-Darstellung
- `assets/project-data.css` – isolierte Darstellung für Schnellnotiz und Data Studio
- `assets/app.js` – App-Start, Debug-UI und Initialisierung der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Modul-Lebenszyklus
- `assets/workspace-state.js` – persistenter Workspace-Zustand
- `assets/workspace-size.js` – reine Raster-/Höhenberechnung
- `assets/workspace-ui.js` – Workspace-DOM-/Bedienlogik
- `assets/workspace-resize.js` – D3a-Tastatur-Resize
- `modules/registry.js` – kanonischer Modulkatalog

### Aktive Fachmodule

| Modul | Version | Slot | Aufgabe |
| --- | --- | --- | --- |
| `development-notes` | `0.4.0` | `quickbar` | zeitgestempelte Schnellnotiz in feste Projekttextdatei |
| `data-studio` | `0.4.0` | `details` | Vorlagenbaukasten und zentrale Datensatzverwaltung |

## Project-Data-Persistenz

### Entwicklungsnotizen

Feste Datei:

`data/ENTWICKLUNGSNOTIZEN.txt`

Vertrag:

```text
[YYYY-MM-DD HH:mm:ss] Text
```

Eigenschaften:

- Zielpfad ist fest verdrahtet.
- Browser kann keinen eigenen Dateipfad vorgeben.
- Zeilenumbrüche werden vor dem Speichern normalisiert.
- Eintrag kann über Button oder Formular-Submit per Enter ausgelöst werden.
- Datei bleibt direkt über `Datei öffnen` erreichbar.

### Zentrale Laufzeitdatenbank

Feste lokale Datei:

`data/project-data.json`

Schema Version 1:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

Die Datei wird nicht in Git aufgenommen und wird vom Auto-Fix nicht verändert.

Temporäre atomare Austauschdateien:

`data/project-data.json.tmp-*`

Auch diese bleiben aus Git ausgeschlossen.

## Project-Data-Service

`scripts/project-data-service.mjs` besitzt die zentrale Verantwortung für:

- Datenvertrag und Schemaversion
- serverseitige Eingabevalidierung
- feste Dateipfade
- atomare JSON-Persistenz
- serialisierte Mutationen
- beschädigte Datenbankerkennung
- Vorlagenkompatibilität bei vorhandenen Datensätzen
- Same-Origin-Prüfung für Browserzugriffe
- Payload-Obergrenze
- API-Antworten

Der Browser schreibt nie direkt in `data/project-data.json`.

Der statische Server verweigert direkten Zugriff auf die Laufzeitdatenbank.

## Unterstützte Vorlagenfelder

- `text`
- `textarea`
- `number`
- `date`
- `checkbox`
- `select`

Felder besitzen stabile IDs, Bezeichnung, Typ, Pflichtfeldstatus und bei `select` eine eindeutige Optionsliste.

Bei bestehenden Datensätzen werden inkompatible Schemaänderungen blockiert, insbesondere:

- Entfernen benutzter Felder
- Typwechsel bestehender Felder
- neue Pflichtfelder ohne Altwerte
- Entfernen noch verwendeter Auswahlwerte

## API-Routen

- `POST /api/provoware/development-notes`
- `GET /api/provoware/project-data`
- `POST /api/provoware/project-data/templates`
- `PUT /api/provoware/project-data/templates/:id`
- `POST /api/provoware/project-data/records`
- `PUT /api/provoware/project-data/records/:id`
- `DELETE /api/provoware/project-data/records/:id`

API-Schreibzugriffe erwarten JSON und werden auf eine begrenzte Payload-Größe beschränkt.

## Direkter `file://`-Start

Der bestehende direkte Start über `index.html` bleibt erhalten.

Dabei gilt:

- Workspace und statische Oberfläche funktionieren weiter.
- Project-Data-Module laden kontrolliert.
- Datei-Schreibfunktionen sind deaktiviert.
- Nutzerhinweis verweist auf den lokalen Klick-&-Start-Server.

Damit ersetzt 0.4.0 den bisherigen Startvertrag nicht.

## Workspace-Vertrag

Die vorhandene Workspace-Struktur bleibt Version `1` und wird durch 0.4.0 nicht erweitert.

Persistiert werden weiterhin nur:

- Panelreihenfolge
- Sichtbarkeit
- Rasterbreite `widthUnits`
- optionale Höhe `heightPx`

D3a-Tastatur-Resize und bestehende responsive Grenzen bleiben unverändert.

Script-Reihenfolge:

```text
workspace-state.js
-> workspace-size.js
-> workspace-ui.js
-> workspace-resize.js
-> app.js
```

## Qualitäts- und Regressionskette

### Kanonische Befehle

Projekt-Lint:

```bash
npm run lint
```

Semantikneutraler Auto-Fix:

```bash
npm run fix
```

Vollständiges Gate:

```bash
npm run verify
```

Reihenfolge von `verify`:

```text
PROJECT LINT
-> QUALITY GATE
-> NODE TEST RUNNER
```

### Projekt-Linter

`scripts/project-lint.mjs` prüft unter anderem:

- verbotene dynamische Codeausführung
- `document.write`
- absolute externe `fetch`-Ziele
- unkontrolliertes `localStorage.clear()`
- Browser-Zweitpersistenz in Project-Data-Modulen
- unbeabsichtigte Serverbindung an `0.0.0.0`
- `use strict` in Browser-JavaScript

Der Linter bleibt ohne externe npm-Pakete.

### Quality Gate

`scripts/quality-check.mjs` prüft unter anderem:

- JavaScript-Syntax
- Text-/JSON-Format
- Pflichtdateien
- lokale HTML-Referenzen
- Versionskonsistenz
- Workspace-Vertrag
- Modulregistry
- beide 0.4.0-Pflichtmodule
- Project-Data-Styles
- Git-Ausschluss der Laufzeitdatenbank
- Einbindung des Lint-Gates in `npm run verify`

`data/project-data.json` und temporäre Austauschdateien werden ausdrücklich nicht vom Auto-Fix oder statischen Quellcode-Walk verändert.

### Testgruppen

Bestehende Tests bleiben aktiv:

- Modul-Lifecycle
- Workspace-State
- Workspace-Größenberechnung
- Workspace-UI
- Tastatur-Resize
- Startserver
- Quality-Gate-Fehlerbehandlung

Neu in 0.4.0:

- `tests/project-data-service.test.mjs`
- `tests/project-data-api.test.mjs`
- `tests/project-data-ui-contract.test.mjs`
- `tests/project-lint.test.mjs`

Zusätzliche Regressionen prüfen:

- Zeitstempel und Einzeilen-Normalisierung
- beschädigte Datenbank ohne stilles Überschreiben
- unzulässige Vorlagenänderungen
- ungültige Auswahlwerte
- Datenbearbeitung und Löschung
- Same-Origin-Schutz
- geschützte direkte Datenbankauslieferung
- parallele Mutationen ohne verlorene Datensätze
- Linter-Fehlerprobe

## GitHub Actions

Workflow:

`.github/workflows/quality.yml`

Aktuelle Actions:

- `actions/checkout@v7`
- `actions/setup-node@v7`

CI-Matrix:

- Node 20
- Node 24

Beide Matrixläufe führen vollständig `npm run verify` aus.

## Checkpoint und Abnahme

- `docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md`

Baseline für 0.4.0:

`6fd1123122cca0c69fd50bdbf69ef2186cc930d0`

Arbeitsbranch:

`feat/0.4.0-project-data-studio`

Pull Request:

`#81`

## Bewusst noch nicht implementiert

### Project Data

- Backup/Restore
- Export/Import
- Schema-Migrationsengine
- relationale Feldtypen
- Volltextsuche/Filter
- SQLite-Adapter
- Mehrbenutzerbetrieb
- Cloud-Synchronisation

### Regression/Release

- echte Firefox-/Chrome-E2E-Tests
- Cross-OS-CI auf Windows/macOS
- Recovery-/Write-Abbruch-Failure-Injection

### Workspace

- Pointer-/Maus-/Touch-/Stift-Resize D3b
- Drag & Drop / Reorder

## Nächste technische Schritte

1. `0.4.1 – Recovery & Migration`: Backup/Restore, Export/Import, Write-Failure-Injection und Schemamigrationen.
2. `0.4.2 – Data Studio PRO`: Suche/Filter, Vorlagenbibliothek und optionaler Storage-Adapter.
3. Workspace-Strang unabhängig mit `0.3.0-D3b` fortsetzen, ohne Project-Data-Verträge zu vermischen.
