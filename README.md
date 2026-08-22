# PROVOWARE ALL-IN 2026

Modulare Offline-First-Oberfläche mit versioniertem Workspace, lokalem Modulvertrag, projektgebundener Datenhaltung, Recovery und realer Chromium-Browserprüfung.

- Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`
- Interne Entwicklungsstufe: `0.4.2 – Data Studio PRO`
- Project-Data-Produktionsschema: `1`
- Data-Studio-PRO-Metadatenvertrag: `1`
- Modulvertrag: `1`
- Workspace-Vertrag: `1`

Die bestehenden Stufen `0.3.0-D3a – Keyboard Resize Preview`, `0.4.0 – Project Data Studio`, `0.4.1 – Recovery & Migration` und `0.4.1-E2E – Chromium Gate & HTML UI Mirror` bleiben unverändert Bestandteil der Basis.

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

`index.html` kann weiterhin direkt in **Chromium oder Firefox** geöffnet werden. Workspace und statische Oberfläche bleiben nutzbar. Schreibzugriffe auf Projektdateien benötigen aus Sicherheitsgründen den lokalen Klick-&-Start-Server; bei `file://` degradieren Schnellnotiz, Data Studio, Data Studio PRO und Recovery kontrolliert in einen nicht schreibfähigen Modus.

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

## Data Studio PRO – 0.4.2

`data-studio-pro` ist eine getrennte Recherche- und Organisationsschicht. Der stabile CRUD-Editor `data-studio` bleibt auf Version `0.4.0`; PRO dupliziert dessen Schreiblogik nicht.

### Suche und Filter

Datensätze können über alle sichtbaren Feldbezeichnungen und Werte durchsucht werden. Zusätzlich stehen bereit:

- Vorlagenfilter
- Kategorienfilter
- Trefferzahl
- Sortierung `Aktualisiert neu → alt`
- Sortierung `Aktualisiert alt → neu`
- Sortierung `Erstellt neu → alt`
- Sortierung `Erstellt alt → neu`
- verständliche Nulltrefferanzeige

Ein Treffer kann über die kleine `data-studio-pro-bridge` direkt im bestehenden CRUD-Editor geöffnet werden.

### Kategorien und Vorlagenbibliothek

Vorlagen können frei benannten Kategorien zugewiesen werden. Die Bibliothek zeigt pro Vorlage:

- Name
- Kategorie
- Feldanzahl
- Datensatzanzahl
- direkten Öffnen-Befehl
- Vorlagenexport

Bibliothekssuche und Kategorienfilter arbeiten unabhängig von der Datensatzsuche. Wird eine Kategorie gelöscht, bleiben Vorlagen erhalten und verlieren lediglich ihre Kategoriezuweisung.

### Gespeicherte Ansichten

Eine Ansicht speichert serverseitig:

- Namen
- gewählte Vorlage
- Kategorienfilter
- Suchtext
- Sortierung

Sie enthält **keine Kopie der Datensätze**. Ansichten können gespeichert, wieder angewendet und gelöscht werden. Namen sind case-insensitiv eindeutig.

### Vorlagenexport

Eine Vorlage kann als portable JSON-Datei exportiert werden.

Vertrag:

```text
format = provoware-data-studio-template
formatVersion = 1
```

Der Export enthält Exportzeitpunkt, optionale Kategorie, Vorlagenname/-beschreibung und Felddefinitionen. Datensätze werden bewusst **nicht** mit exportiert.

### Getrennte PRO-Metadaten

Runtime-Datei:

`data/data-studio-pro.json`

Metadatenvertrag Version 1:

- `schemaVersion`
- `revision`
- `categories[]`
- `templateCategories[]`
- `savedViews[]`

Die Datei ist absichtlich vom Project-Data-Produktionsschema getrennt. Dadurch bleibt `data/project-data.json` unverändert bei Schema 1.

Schutz:

- feste serverseitige Datei, keine freie Pfadwahl
- Same-Origin für Schreibzugriffe
- atomarer Temp-Datei-zu-Rename-Pfad
- dieselbe zentrale Mutationssperre wie Project Data und Recovery
- beschädigte PRO-Datei wird nicht still ersetzt
- Runtime-Datei und Temp-Dateien bleiben aus Git ausgeschlossen
- statische Direktauslieferung ist blockiert
- `npm run fix` ignoriert die Runtime-Datei
- `localStorage` und `sessionStorage` bleiben durch den Projekt-Linter verboten

**Recovery-Grenze:** Die 0.4.1-Project-Data-Backups sichern weiterhin ausschließlich `data/project-data.json`. Kategorien und gespeicherte Ansichten aus `data/data-studio-pro.json` sind in 0.4.2 noch kein Bestandteil dieses Backupformats. Eine gemeinsame Recovery-Hülle wäre ein eigener, versionierter Vertrag und wird nicht still in 0.4.1 hineingemischt.

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

Der echte Chromium-E2E-Lauf deckte in 0.4.1-E2E einen Layoutfehler auf: In einem schmalen Detailpanel konnten sich interne Project-Data-Spalten überlagern und sichtbare Buttons gegenseitig abfangen.

Die Oberfläche reagiert deshalb auf die **tatsächliche Breite des Project-Data-Containers**, nicht nur auf die Browserbreite:

- schmaler Detailbereich → eine Spalte
- Feldzeilen werden ab 520 px Containerbreite verdichtet
- Zwei-Spalten-Modus erst ab 760 px Containerbreite
- Bedienelemente besitzen Scroll-Abstand zur sticky Schnellstarterleiste

Data Studio PRO verwendet denselben Container-Vertrag.

## Chromium-first Browser-E2E

Browserprüfungen sind bewusst vom schnellen Core-Gate getrennt.

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

### Reale E2E-Ketten

Chromium führt aktuell drei echte Prüfungen aus:

1. `Start -> Notiz -> Datei -> Vorlage -> Datensatz -> Reload -> Edit -> Backup -> Änderung -> Restore -> Export -> Delete -> Import`
2. `Vorlage -> Datensätze -> Kategorie -> Zuweisung -> Bibliotheksfilter -> Volltextsuche -> gespeicherte Ansicht -> Anwenden -> Vorlagenexport -> Reload -> Ansicht erneut anwenden`
3. proportionaler HTML-Mirror der echten Oberfläche

Die Testdaten werden in einer temporären Projektkopie erzeugt. Dadurch werden echte Entwicklungsnotizen, Datenbank, PRO-Metadaten und Backups der Arbeitskopie nicht verändert.

### Erster vollständig grüner 0.4.2-Stand

- Chromium: `3/3` echte Browserprüfungen erfolgreich
- CRUD-/Recovery-Kette: PASS
- Data-Studio-PRO-Kette: PASS
- HTML-Mirror: PASS
- Firefox im automatischen Lauf: wie vorgesehen übersprungen
- Browserartefakt: `9476750307`
- Artefakt-SHA-256: `f2eee6beb9baec81126885ce23c8543070afec0fae088045d104cd68a8628f99`

## HTML UI Mirror Pipeline

Datei:

`tests/browser/ui-mirror.html`

Bei laufendem lokalen Server:

`http://127.0.0.1:4173/tests/browser/ui-mirror.html`

Die Pipeline baut **keine Attrappe** der Oberfläche. Sie lädt zweimal dieselbe echte `/index.html`:

1. Referenz mit internem Layout-Viewport `1366 × 900` bei 100 %.
2. Spiegel mit demselben internen Layout-Viewport `1366 × 900`, ausschließlich außen per CSS auf Faktor `0,5` skaliert.

Automatisch verglichen werden unter anderem:

- `body`
- `.app-shell`
- `.sidebar`
- `.workspace`
- `.topbar`
- `#quickbar`
- `#arbeitsbereich`
- `#details`
- `.data-studio-pro`

PASS verlangt:

- identische interne Schlüsselgeometrie
- beide internen Viewports exakt `1366 × 900`
- gemessenen Skalierungsfaktor `0,5`
- visuellen Spiegel von `683 × 450`

Screenshots dienen als reproduzierbare Evidenz und Diagnose. Sie sind bewusst **kein betriebssystemabhängiger Pixel-Diff-Blocker**; das eigentliche Mirror-Gate basiert auf DOM- und Geometriemessung.

### Screenshot- und Export-Evidenz

Ein erfolgreicher Chromium-Lauf erzeugt aktuell:

- `01-start.png`
- `02-record-created.png`
- `03-restored.png`
- `04-import-restored.png`
- `05-ui-mirror-pipeline.png`
- `06-ui-mirror-scaled.png`
- `07-data-studio-pro.png`
- `project-data-export.json`
- `data-studio-template-export.json`

Bei Fehlern bleiben zusätzlich Playwright-Screenshot, Video und Trace erhalten.

## Qualität und Regression

### Schneller Core-Gate

```bash
npm run verify
```

Reihenfolge:

`PROJECT LINT -> QUALITY GATE -> NODE TEST RUNNER`

Dieser Pfad bleibt ohne Browserinstallation ausführbar.

Erster vollständig grüner 0.4.2-Core-Stand:

- 41 JavaScript-Dateien gelintet
- 103 Projektdateien geprüft
- 101/101 Node-Tests erfolgreich
- Node 20: PASS
- Node 24: PASS

Neue PRO-Regressionen prüfen unter anderem:

- Kategorien und case-insensitive Eindeutigkeit
- Vorlagenzuweisungen
- gespeicherte Ansichten
- Referenz- und Sortierprüfung
- Same-Origin
- beschädigte PRO-Datei
- atomaren Schreibabbruch direkt vor Rename
- bytegenau unveränderte Live-Metadaten nach Schreibabbruch
- Browser-Zweitpersistenz-Verbot
- automatische Revisionsbrücke zwischen CRUD und PRO
- Vorlagenexport ohne Datensätze
- Reload-Persistenz der PRO-Metadaten

### Lint

```bash
npm run lint
```

Der eigene abhängigkeitfreie Linter prüft unter anderem:

- dynamische Codeausführung
- `document.write`
- absolute externe `fetch`-Ziele
- unbeabsichtigte Serverbindung an `0.0.0.0`
- zweite Browser-Persistenz in allen Project-Data-/PRO-/Recovery-Modulen
- `use strict` in Browser-JavaScript

### Semantikneutraler Auto-Fix

```bash
npm run fix
```

Der Auto-Fix ist kein aggressiver Quellcode-Reformatter. Er normalisiert nur eindeutig semantikneutrale Text-/JSON-Eigenschaften. `data/project-data.json`, `data/data-studio-pro.json`, deren atomare Temp-Dateien, Recovery-Backups und Browserartefakte sind vom Quellcode-Walk ausgeschlossen.

## Regressionsschichten

1. versionierte Verträge
2. serverseitige Validierung
3. atomare und serialisierte Persistenz
4. automatische Backups vor Project-Data-Ersatz
5. SHA-gebundene Restore-/Import-Vorschau
6. Failure-Injection in Project Data und PRO-Metadaten
7. Migrationsvertrag
8. Projekt-Lint
9. zentraler Quality Gate
10. Node-Test-Suite auf Node 20 und 24
11. echter Chromium-Browser-E2E
12. proportionaler HTML-Geometrie-Mirror
13. Screenshot-/Export-Evidenz
14. PR-Diff-Gate und Main-Check

Das ist robust, aber nicht „perfekt“. Offen bleiben insbesondere Cross-OS-CI, reale Windows-Dateisperren/-Rename-Unterschiede, eine gemeinsame versionierte Recovery-Hülle für PRO-Metadaten, Pointer-/Touch-Workspace-Hardening und eine echte Schema-v2-Migration erst bei tatsächlichem fachlichem Bedarf.

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

Data Studio PRO:

- `docs/PLAN_0.4.2_DATA_STUDIO_PRO.md`
- `docs/CHECKPOINT_0.4.2_DATA_STUDIO_PRO.md`
- `docs/CHECKLIST_0.4.2_DATA_STUDIO_PRO.md`

Workspace:

- `docs/WORKSPACE_CONTRACT.md`
- `docs/RESIZE_CONTRACT_0.3.0.md`

Verbindliche Agenten-/Entwicklungsregeln: `AGENTS.md`.

## Nächste Stufen

1. **Cross-OS-/Release-Hardening:** Linux-Rechte/Temp/Rename und Windows-Dateisperren/Pfade/Recovery real prüfen.
2. **0.4.3 Recovery Envelope:** nur bei Priorisierung PRO-Metadaten in einen eigenen versionierten gemeinsamen Backup-/Restore-Vertrag aufnehmen.
3. **Workspace D3b:** Pointer/Maus/Touch/Stift über den bestehenden Resize-Vertrag.

SQLite bleibt optional und wird erst hinter derselben Service-Schnittstelle eingeführt, wenn ein realer Bedarf nachgewiesen ist.
