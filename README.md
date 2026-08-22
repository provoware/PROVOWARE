# PROVOWARE ALL-IN 2026

Modulare Offline-First-Oberfläche mit versioniertem Workspace, lokalem Modulvertrag, projektgebundener Datenhaltung und automatisierter Recovery-Prüfung.

- Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`
- Interne Entwicklungsstufe: `0.4.1-E2E – Chromium Gate & HTML UI Mirror`
- Project-Data-Produktionsschema: `1`
- Modulvertrag: `1`
- Workspace-Vertrag: `1`

Die bestehenden Stufen `0.3.0-D3a – Keyboard Resize Preview`, `0.4.0 – Project Data Studio` und `0.4.1 – Recovery & Migration` bleiben Bestandteil der Basis.

## Start für normale Nutzung

Voraussetzung ist Node.js 20 oder neuer.

- **Windows:** `start.cmd` doppelklicken.
- **Linux/macOS:** `./start.sh` im Projektordner ausführen.
- Alternativ: `npm start`.

Optionen:

```bash
npm start -- --no-browser
npm start -- --port=4200
```

Der lokale Server bindet ausschließlich an `127.0.0.1`, prüft die Node-Version und verwendet bei belegtem Port kontrolliert den nächsten freien Port.

### Direkter Offline-Start

`index.html` kann weiterhin direkt in **Chromium oder Firefox** geöffnet werden. Workspace und statische Oberfläche bleiben nutzbar. Schreibzugriffe auf Projektdateien benötigen aus Sicherheitsgründen den lokalen Klick-&-Start-Server; bei `file://` degradieren Schnellnotiz, Data Studio und Recovery kontrolliert in einen nicht schreibfähigen Modus.

## Entwicklungsnotiz – Schnellspeichern

Die Schnellstarterleiste enthält ein einzeiliges Feld.

- Text eingeben.
- `Enter` oder `Speichern` verwenden.
- Server ergänzt `YYYY-MM-DD HH:mm:ss`.
- Eintrag wird an `data/ENTWICKLUNGSNOTIZEN.txt` angehängt.
- `Datei öffnen` führt zur festen Projekttextdatei.

Der Browser kann keinen eigenen Zielpfad an die Schreib-API übergeben.

## Project Data Studio – 0.4.0

Lokale Laufzeitdatenbank:

`data/project-data.json`

Vertrag:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

Unterstützte Maskenfelder:

- Text
- mehrzeiliger Text
- Zahl
- Datum
- Checkbox
- Auswahlliste

Vorlagen und Datensätze können erstellt, erneut geladen, bearbeitet und gelöscht werden. Werte werden bei jedem Schreibvorgang serverseitig gegen die Vorlage validiert.

### Persistenzschutz

- atomarer Ersatz über temporäre Datei und Rename
- serialisierte Mutationen
- beschädigtes JSON wird nicht still überschrieben
- Datenbank und Temp-Dateien bleiben aus Git ausgeschlossen
- direkte statische Auslieferung der Datenbank ist blockiert
- Same-Origin-Prüfung der lokalen Browser-API
- inkompatible Vorlagenänderungen werden bei vorhandenen Datensätzen abgelehnt

## Recovery & Migration – 0.4.1

Recovery ist als eigenes Modul `data-recovery` vom normalen CRUD-Bereich getrennt, verwendet aber dieselbe zentrale Mutationssperre.

### Backup

Ablage:

`data/backups/project-data/*.pwbak`

Eigenschaften:

- manuelles Backup
- automatisches Sicherheitsbackup vor Restore
- automatisches Sicherheitsbackup vor Import
- Rotation auf maximal 10 Sicherungen
- SHA-256-Prüfsumme
- feste Backup-IDs statt frei wählbarer Serverpfade
- `.pwbak` schützt Recovery-Artefakte vor JSON-Autoformatierung
- Backup-Verzeichnis bleibt aus Git und statischer Auslieferung ausgeschlossen

Auch beschädigte Live-Daten können vor Recovery als Rohbytes gesichert werden.

### Restore / Import

Beide Pfade verwenden:

`Vorschau -> SHA-256-Bindung -> Bestätigung -> Sicherheitsbackup -> atomarer Ersatz`

Ein Failpoint direkt vor Rename wird automatisiert getestet. Bei simuliertem Schreibabbruch bleibt die vorherige Live-Datei bytegenau erhalten.

### Migration

Das Produktionsschema bleibt ausdrücklich **Version 1**. Die Migrationsengine unterstützt deterministische Schritte `n -> n+1`. Fehlende Schritte und Rückwärtsmigrationen werden abgelehnt. `v1 -> v2` existiert nur als isolierte Testfixture und führt kein künstliches Produktionsschema v2 ein.

## Project-Data-UI: Container-Responsive

Der echte Chromium-E2E-Lauf deckte einen Layoutfehler auf: In einem schmalen Detailpanel konnten sich die zwei internen Project-Data-Spalten überlagern und sichtbare Buttons gegenseitig abfangen.

Die Oberfläche reagiert deshalb jetzt auf die **tatsächliche Breite des Project-Data-Containers**, nicht nur auf die Browserbreite:

- schmaler Detailbereich → eine Spalte
- breitere Fachmodulfläche → Zwei-Spalten-Modus erst ab ausreichender Containerbreite
- Feldzeilen werden ebenfalls containerabhängig verdichtet
- Bedienelemente besitzen Scroll-Abstand zur sticky Schnellstarterleiste

Der unveränderte reale Browserpfad wurde nach dieser Reparatur vollständig grün ausgeführt.

## Chromium-first Browser-E2E

Browserprüfungen sind bewusst vom schnellen paketfreien Core-Gate getrennt.

### Testwerkzeuge installieren

Nur für Entwicklung/CI:

```bash
npm install --ignore-scripts --no-audit --no-fund
npm run browser:install:chromium
```

Playwright ist als **Dev-Abhängigkeit** exakt gepinnt und wird nicht für die normale Laufzeit benötigt.

### Primärer Browserlauf

```bash
npm run test:e2e
```

oder explizit:

```bash
npm run test:e2e:chromium
```

Chromium ist der automatische Primärlauf bei Pull Requests und `main`-Pushes.

### Firefox nur alternativ

```bash
npm run browser:install:firefox
npm run test:e2e:firefox
```

Firefox ist **kein automatischer Primärblocker**. Im GitHub-Workflow wird er nur über einen optionalen manuellen `workflow_dispatch` zugeschaltet.

### Reale E2E-Kette

Der Chromium-Test führt über die tatsächliche UI:

`Start -> Notiz -> Datei prüfen -> Vorlage -> Datensatz -> Reload -> Edit -> Backup -> Änderung -> Restore -> Export -> Delete -> Import`

Die Testdaten werden in einer temporären Projektkopie erzeugt. Dadurch werden echte Entwicklungsnotizen, Datenbank und Backups der Arbeitskopie nicht verändert.

### Aktuell validierter Stand

- Chromium: `2/2` echte Browserprüfungen erfolgreich
- funktionale CRUD-/Recovery-Kette: PASS
- HTML-Mirror: PASS
- Firefox im automatischen Lauf: wie vorgesehen übersprungen
- Erfolgsartefakt enthält sechs PNG-Screenshots plus Project-Data-JSON-Export

## HTML UI Mirror Pipeline

Datei:

`tests/browser/ui-mirror.html`

Bei laufendem lokalen Server:

`http://127.0.0.1:4173/tests/browser/ui-mirror.html`

Die Pipeline baut **keine Attrappe** der Oberfläche. Sie lädt zweimal dieselbe echte `/index.html`:

1. Referenz mit internem Layout-Viewport `1366 × 900` bei 100 %.
2. Spiegel mit demselben internen Layout-Viewport `1366 × 900`, ausschließlich außen per CSS auf Faktor `0,5` skaliert.

Dadurch bleibt die interne UI-Geometrie identisch. Automatisch verglichen werden unter anderem:

- `body`
- `.app-shell`
- `.sidebar`
- `.workspace`
- `.topbar`
- `#quickbar`
- `#arbeitsbereich`
- `#details`

PASS verlangt:

- identische interne Schlüsselgeometrie
- beide internen Viewports exakt `1366 × 900`
- gemessenen Skalierungsfaktor `0,5`
- visuellen Spiegel von `683 × 450`

Screenshots dienen als reproduzierbare Evidenz und Diagnose. Sie sind bewusst **kein betriebssystemabhängiger Pixel-Diff-Blocker**; das eigentliche Mirror-Gate basiert auf DOM- und Geometriemessung.

### Screenshot-Evidenz

Ein erfolgreicher Chromium-Lauf erzeugt:

- `01-start.png`
- `02-record-created.png`
- `03-restored.png`
- `04-import-restored.png`
- `05-ui-mirror-pipeline.png`
- `06-ui-mirror-scaled.png`
- `project-data-export.json`

Bei Fehlern bleiben zusätzlich Playwright-Screenshot, Video und Trace erhalten.

## Qualität und Regression

### Schneller Core-Gate

```bash
npm run verify
```

Reihenfolge:

`PROJECT LINT -> QUALITY GATE -> NODE TEST RUNNER`

Dieser Pfad bleibt ohne Browserinstallation ausführbar.

Aktueller geprüfter Core-Stand des E2E-Strangs:

- 35 JavaScript-Dateien gelintet
- 94 Projektdateien geprüft
- 85/85 Node-Tests erfolgreich
- Node 20: PASS
- Node 24: PASS

### Lint

```bash
npm run lint
```

Der eigene abhängigkeitfreie Linter prüft unter anderem:

- dynamische Codeausführung
- `document.write`
- absolute externe `fetch`-Ziele
- unbeabsichtigte Serverbindung an `0.0.0.0`
- zweite Browser-Persistenz in Project-Data-Modulen
- `use strict` in Browser-JavaScript

### Semantikneutraler Auto-Fix

```bash
npm run fix
```

Der Auto-Fix ist kein aggressiver Quellcode-Reformatter. Er normalisiert nur eindeutig semantikneutrale Text-/JSON-Eigenschaften. Laufzeitdatenbank, Recovery-Backups und Browserartefakte sind vom Quellcode-Walk ausgeschlossen.

## Regressionsschichten

1. versionierte Verträge
2. serverseitige Validierung
3. atomare und serialisierte Persistenz
4. automatische Backups vor Datenersatz
5. SHA-gebundene Restore-/Import-Vorschau
6. Failure-Injection im Schreibpfad
7. Migrationsvertrag
8. Projekt-Lint
9. zentraler Quality Gate
10. Node-Test-Suite auf Node 20 und 24
11. echter Chromium-Browser-E2E
12. proportionaler HTML-Geometrie-Mirror
13. Screenshot-/Export-Evidenz
14. PR-Diff-Gate und Main-Check

Das ist robust, aber nicht „perfekt“. Offen bleiben insbesondere Cross-OS-CI, reale Windows-Dateisperren/-Rename-Unterschiede, Pointer-/Touch-Workspace-Hardening und eine echte Schema-v2-Migration erst bei tatsächlichem fachlichem Bedarf.

## Wichtige Entwicklungsdokumente

Project Data:

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

Verbindliche Agenten-/Entwicklungsregeln: `AGENTS.md`.

## Nächste Stufen

1. `0.4.2 – Data Studio PRO`: Suche/Filter, Vorlagenbibliothek, Kategorien, bessere Maskenorganisation.
2. Cross-OS-/Release-Hardening: Linux-Rechte/Temp/Rename und danach Windows-Dateisperren/Pfade/Recovery.
3. Workspace D3b: Pointer/Maus/Touch/Stift über den bestehenden Resize-Vertrag.

SQLite bleibt optional und wird erst hinter derselben Service-Schnittstelle eingeführt, wenn ein realer Bedarf nachgewiesen ist.
