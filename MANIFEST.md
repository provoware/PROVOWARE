# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Interne Entwicklungsstufe: `0.4.1-E2E – Chromium Gate & HTML UI Mirror`

Verträge:

- Modulvertrag: `1`
- Workspace-Vertrag: `1`
- Project-Data-Produktionsschema: `1`
- Workspace-Schlüssel: `provoware.allin.workspace.main.v1`
- Recovery-Backup-Limit: `10`

Produktversion und Produktions-Datenschema ändern sich durch den E2E-Strang nicht.

## Laufzeitstruktur

### Einstieg

- `index.html` – HTML-Einstieg
- `start.cmd` / `start.sh` – Plattform-Einstiege
- `scripts/start.mjs` – lokaler Server, Node-Prüfung, statische Auslieferung und Project-Data-API-Routing

### Oberfläche

- `assets/styles.css` – Basisdarstellung
- `assets/workspace-layout.css` – Workspace-Größen-/Resize-Darstellung
- `assets/project-data.css` – Project-Data-/Recovery-Darstellung, jetzt container-responsive
- `assets/app.js` – App-Initialisierung
- `assets/module-registry.js` – Modulvertrag und Lifecycle
- `modules/registry.js` – kanonischer Modulkatalog

### Fachmodule

| Modul | Version | Slot | Aufgabe |
| --- | --- | --- | --- |
| `development-notes` | `0.4.0` | `quickbar` | zeitgestempelte Schnellnotiz |
| `data-studio` | `0.4.0` | `details` | Vorlagen und Datensätze |
| `data-recovery` | `0.4.1` | `details` | Backup, Restore, Export/Import und Migrationsvertrag |

## Project Data

Live-Datenbank:

`data/project-data.json`

Schema v1:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

Recovery-Backups:

`data/backups/project-data/*.pwbak`

Schutz:

- atomare Temp-Datei-zu-Rename-Persistenz
- gemeinsame Mutationssperre für CRUD und Recovery
- Same-Origin-Schutz
- keine freie Serverpfadwahl aus Browserdaten
- Laufzeitdatenbank, Temp-Dateien und Backups aus Git ausgeschlossen
- statische Auslieferung von Datenbank und Backupbereich blockiert
- automatische Sicherung vor Restore/Import
- SHA-256-Bindung zwischen Vorschau und Ausführung
- Backup-Rotation auf 10
- beschädigte Live-Rohbytes können vor Recovery erhalten werden

## Recovery- und Migrationsvertrag

`scripts/project-data-recovery.mjs` verantwortet:

- Backup und Rotation
- Backup-Liste und Vorschau
- SHA-256
- Restore
- Export
- Import-Vorschau und Import
- Sicherheitsbackup vor vollständigem Datenersatz
- Migrationsplanung und schrittweise Migration

Produktionsschema bleibt `1`. Eine `v1 -> v2`-Migration existiert nur als Testfixture. Produktionsmigrationen dürfen nur deterministisch `n -> n+1` erfolgen; fehlende Schritte und Rückwärtsmigrationen sind Fehler.

## Project-Data-UI-Vertrag

Der Detailbereich kann als Workspace-Panel schmal oder breit sein. Project Data reagiert deshalb auf die **eigene Containerbreite**:

- Standard: eine Spalte
- Feldzeilen werden erst ab ausreichender Containerbreite mehrspaltig
- Hauptkarten werden erst ab `760px` Containerbreite zweispaltig
- interaktive Controls besitzen Scroll-Abstand zur sticky Schnellleiste

Diese Regel wurde eingeführt, nachdem der erste echte Chromium-E2E-Lauf überlagerte Bedienelemente im schmalen Detailpanel reproduzierbar nachgewiesen hatte.

## Browser-E2E-Struktur

### Werkzeuge

- `@playwright/test` exakt `1.62.1` als Dev-Abhängigkeit
- `tests/browser/playwright.config.mjs`
- `scripts/browser-e2e-server.mjs`
- `tests/browser/project-data.e2e.spec.mjs`
- `.github/workflows/browser-e2e.yml`

Runtime-Abhängigkeiten bleiben unverändert leer.

### Browserpriorität

- Primär: `chromium`
- Alternativ: `firefox`
- Chromium läuft automatisch bei Pull Requests und `main`-Pushes.
- Firefox läuft nur optional über manuellen Workflow-Dispatch.

Kanonische Befehle:

```bash
npm run test:e2e
npm run test:e2e:chromium
npm run test:e2e:firefox
```

Browserinstallation:

```bash
npm run browser:install:chromium
npm run browser:install:firefox
```

## Isolierter Browser-Testserver

`scripts/browser-e2e-server.mjs` kopiert das Projekt vor jedem Browserlauf in ein temporäres OS-Verzeichnis und startet dort den normalen lokalen Server auf `127.0.0.1:4173`.

Nicht in die Testkopie übernommen beziehungsweise aus dem Test-Walk ausgeschlossen werden unter anderem:

- `.git`
- `node_modules`
- Playwright-Reports
- Browser-Evidenzartefakte

Dadurch kann der Test echte Entwicklungsnotizen, Datenbankdateien und Backups schreiben, ohne reale Nutzdaten der Arbeitskopie zu verändern.

## Funktionaler Chromium-Vertrag

Automatisierte UI-Kette:

```text
Start
-> Entwicklungsnotiz speichern
-> feste Notizdatei prüfen
-> Vorlage erzeugen
-> Datensatz speichern
-> Reload
-> Persistenz prüfen
-> Datensatz bearbeiten
-> Backup erzeugen
-> Daten verändern
-> Restore-Vorschau
-> Restore bestätigen
-> alten Datenstand nachweisen
-> JSON exportieren
-> Datensatz löschen
-> Export importieren
-> wiederhergestellten Datensatz nachweisen
```

Der erfolgreiche Lauf prüft die echte UI; Aktionen werden nicht mit erzwungenen Klicks an sichtbaren Überlagerungen vorbeigeführt.

## HTML UI Mirror

Dateien:

- `tests/browser/ui-mirror.html`
- `tests/browser/ui-mirror.css`
- `tests/browser/ui-mirror.js`

Vertrag:

- Referenz lädt echte `/index.html`.
- Spiegel lädt dieselbe echte `/index.html`.
- beide Frames: interner Viewport `1366 × 900`
- Spiegel: ausschließlich externe CSS-Skalierung `0.5`
- erwartete sichtbare Spiegelgröße: `683 × 450`
- zentrale Rechtecke beider Frames müssen intern identisch sein
- gemessener Skalierungsfaktor muss `0.5` sein

Geometrie-Selektoren:

- `body`
- `.app-shell`
- `.sidebar`
- `.workspace`
- `.topbar`
- `#quickbar`
- `#arbeitsbereich`
- `#details`

Screenshots sind Evidenz und Diagnose, aber kein OS-abhängiger Pixel-Diff-Blocker.

## Browser-Evidenz

Erfolgreicher Chromium-Run erzeugt:

- `01-start.png`
- `02-record-created.png`
- `03-restored.png`
- `04-import-restored.png`
- `05-ui-mirror-pipeline.png`
- `06-ui-mirror-scaled.png`
- `project-data-export.json`
- Playwright HTML-Report

Bei Fehlern werden zusätzlich Trace, Fehler-Screenshot und Video aufbewahrt.

Geprüfter Erfolgsrun #6:

- Chromium: `2/2` Browsertests PASS
- Mirror: PASS
- internes Mirror-Layout: `1366 × 900`
- Skalierung: `0.5`
- sichtbarer Spiegel: `683 × 450`
- Schlüsselgeometrie: identisch
- Browser-Evidenzartefakt: `9474583341`
- Artefakt-SHA-256: `f2009e5b8c1ae992a8894fcb1d3d4d5bc41bd5aaa4e24fad0dd4747a6c8eff27`

## Core-Qualitätskette

Kanonisch:

```bash
npm run lint
npm run fix
npm run verify
```

`verify` bleibt bewusst browserfrei:

```text
PROJECT LINT
-> QUALITY GATE
-> NODE TEST RUNNER
```

Aktuell geprüfter E2E-Strang vor finaler Doku-Synchronisierung:

- Node 20: PASS
- Node 24: PASS
- 35 JavaScript-Dateien gelintet
- 94 Projektdateien geprüft
- 85/85 Node-Tests PASS

Der zentrale Quality Gate prüft zusätzlich den Browser-E2E-Vertrag, Pflichtdateien, Chromium-Priorität, Firefox-Alternativstatus, Artifact-Workflow und echten Zwei-Frame-Mirror.

## Entwicklungsdokumente

Project Data / Recovery:

- `docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/PLAN_0.4.1_RECOVERY_MIGRATION.md`
- `docs/CHECKPOINT_0.4.1_RECOVERY_MIGRATION.md`
- `docs/CHECKLIST_0.4.1_RECOVERY_MIGRATION.md`

Browser-E2E / Mirror:

- `docs/PLAN_0.4.1_BROWSER_E2E_HTML_MIRROR.md`
- `docs/CHECKPOINT_0.4.1_BROWSER_E2E_HTML_MIRROR.md`
- `docs/CHECKLIST_0.4.1_BROWSER_E2E_HTML_MIRROR.md`

Workspace:

- `docs/WORKSPACE_CONTRACT.md`
- `docs/RESIZE_CONTRACT_0.3.0.md`

## Bewusst offen

- Cross-OS-CI für Windows und zusätzliche Linux-Dateirechte-/Lock-Fälle
- 0.4.2 Data Studio PRO mit Suche, Filtern, Vorlagenbibliothek und besserer Maskenorganisation
- optionaler SQLite-Adapter erst bei realem Bedarf
- Workspace D3b Pointer/Maus/Touch/Stift
- echte Produktionsmigration auf Schema v2 erst bei fachlich benötigtem v2-Vertrag
