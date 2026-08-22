# PROVOWARE ALL-IN 2026

Modulare Offline-First-Oberfläche mit versioniertem Workspace, lokalem Modulvertrag und projektgebundener Datenhaltung. Die freigegebene Produktversion bleibt bewusst `0.2.0`; die aktuelle Entwicklungsstufe ist **`0.4.1 – Recovery & Migration`**. Die Workspace-Stufe `0.3.0-D3a – Keyboard Resize Preview` und `0.4.0 – Project Data Studio` bleiben unverändert Bestandteil der Basis.

## Start für normale Nutzung

### Automatischer Klick-&-Start

Voraussetzung ist Node.js 20 oder neuer. Danach:

- **Windows:** `start.cmd` doppelklicken.
- **Linux/macOS:** im Projektordner `./start.sh` ausführen.

Die Startroutine prüft die Node-Version und die in `package.json` deklarierten Laufzeitpakete. Im aktuellen Stand sind keine Laufzeitpakete nötig. Anschließend startet ein ausschließlich an `127.0.0.1` gebundener Server, weicht bei belegtem Standardport kontrolliert auf den nächsten freien Port aus und öffnet die Anwendung im Standardbrowser.

Alternativ:

```bash
npm start
```

Weitere Varianten:

```bash
npm start -- --no-browser
npm start -- --port=4200
```

### Direkter Offline-Start

`index.html` kann weiterhin direkt in Firefox oder Chrome geöffnet werden. Layout, Workspace und statische Oberfläche bleiben dabei nutzbar.

**Wichtig:** Echte Schreibzugriffe auf Projektdateien sind aus Sicherheitsgründen nur über den lokalen Klick-&-Start-Server möglich. Beim direkten `file://`-Start bleiben Schnellnotiz, Data Studio und Recovery sichtbar, erklären aber verständlich, dass Speichern, Bearbeiten, Backup, Restore und Import den lokalen Server benötigen.

## Entwicklungsnotiz – Schnellspeichern

In der Dashboard-Schnellstarterleiste befindet sich ein einzeiliges Feld für Entwicklungsnotizen.

- Text eingeben.
- `Enter` drücken **oder** `Speichern` wählen.
- PROVOWARE ergänzt automatisch einen lokalen Zeitstempel.
- Der Eintrag wird als genau eine Zeile an `data/ENTWICKLUNGSNOTIZEN.txt` angehängt.
- `Datei öffnen` öffnet die feste Projekttextdatei direkt.

Format eines Eintrags:

```text
[YYYY-MM-DD HH:mm:ss] Entwicklungsnotiz
```

Zeilenumbrüche in der Eingabe werden kontrolliert auf Leerzeichen reduziert. Der Browser kann keinen eigenen Zielpfad vorgeben.

## Project Data Studio

Das Modul **Project Data Studio** stellt eine zentrale lokale Projektdatenverwaltung im Detailbereich bereit.

### Eingabemasken-Baukasten

Vorlagen können erstellt und später bearbeitet werden. Unterstützte Feldtypen:

- Text
- mehrzeiliger Text
- Zahl
- Datum
- Checkbox
- Auswahlliste mit frei definierbaren Werten

Jedes Feld besitzt eine stabile interne ID, Bezeichnung, Typ und optional eine Pflichtfeld-Regel. Auswahlfelder speichern ihre erlaubten Werte im Vorlagenvertrag.

### Datensätze

Zu einer Vorlage lassen sich Datensätze:

- erstellen
- erneut laden
- bearbeiten
- löschen

Alle Werte werden serverseitig erneut gegen die Vorlage geprüft. Die Browseroberfläche ist damit nicht die alleinige Vertrauensgrenze.

### Zentrale Datenablage

Laufzeitdatei:

`data/project-data.json`

Die Datei verwendet einen versionierten JSON-Vertrag mit:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

Schreibvorgänge werden innerhalb der lokalen Serverinstanz serialisiert und die Datenbankdatei atomar über eine temporäre Datei ersetzt. Beschädigtes bestehendes JSON wird nicht still überschrieben. `data/project-data.json` und temporäre Austauschdateien sind aus Git ausgeschlossen.

Der statische Webserver liefert `data/project-data.json` nicht direkt aus; Datenaustausch erfolgt ausschließlich über die definierte lokale API.

### Schutz bei Vorlagenänderungen

Solange Datensätze existieren, blockiert die Datenebene unter anderem:

- das Entfernen bereits verwendeter Felder
- das Ändern des Typs bereits verwendeter Felder
- neue Pflichtfelder ohne Werte in bestehenden Datensätzen
- das Entfernen eines Auswahlwerts, der noch in einem Datensatz verwendet wird

Damit werden Schemaänderungen nicht still auf vorhandene Daten angewandt.

## Recovery & Migration – 0.4.1

Das neue Modul **Project Data Recovery** ist bewusst vom normalen CRUD-Modul getrennt. Recovery und normale Datenmutationen verwenden jedoch dieselbe zentrale Mutationssperre, damit Restore oder Import nicht mit einem parallelen Datensatz-Schreibvorgang kollidieren.

### Backup

Backups liegen ausschließlich lokal unter:

`data/backups/project-data/`

Eigenschaften:

- manuelles Backup über `Backup jetzt`
- automatisches Sicherheitsbackup vor jedem Restore
- automatisches Sicherheitsbackup vor jedem Import
- maximal `10` Sicherungen; ältere Sicherungen werden kontrolliert rotiert
- SHA-256-Prüfsumme pro Backup
- Zusammenfassung mit Schema, Revision, Vorlagen- und Datensatzanzahl
- feste Backup-IDs; der Browser kann keinen Serverpfad wählen
- Dateiendung `.pwbak`, damit der semantikneutrale Auto-Fix Recovery-Artefakte nicht als Quellcode-JSON verändert
- Backup-Verzeichnis bleibt aus Git ausgeschlossen
- Backup-Verzeichnis wird vom statischen Webserver geschützt

Auch eine bereits beschädigte Live-Datei wird vor einem Recovery-Import als **Rohbytes** gesichert. Dadurch kann Recovery eine defekte Datenbank ersetzen, ohne den defekten Ausgangszustand still zu vernichten.

### Restore

Restore ist zweistufig:

1. Backup auswählen und serverseitige Vorschau laden.
2. Erst nach Vorschau, SHA-256-Abgleich und expliziter Bestätigung wiederherstellen.

Die Prüfsumme bindet die Ausführung an genau den Stand, der vorher angezeigt wurde. Hat sich die Quelle zwischen Vorschau und Ausführung verändert, wird der Vorgang mit Konfliktstatus abgebrochen.

Der eigentliche Ersatz verwendet weiterhin:

`Temp-Datei -> vollständiges Schreiben -> optionaler Prüfhaken -> atomarer Rename`

Ein Fehler direkt vor dem Rename lässt die bisherige Live-Datenbank unverändert. Diese Situation wird automatisiert per Failure-Injection getestet.

### Export / Import

Der Recovery-Bereich kann den aktuellen validierten Datenbestand als JSON exportieren.

Import läuft ebenfalls zweistufig:

1. JSON-Datei auswählen und serverseitig prüfen.
2. Zusammenfassung, Schemastand und Prüfsumme anzeigen.
3. Erst nach expliziter Bestätigung importieren.
4. Aktuellen Zustand vorher automatisch sichern.
5. Kandidat erneut gegen die Vorschau-Prüfsumme prüfen und atomar ersetzen.

Ungültiges JSON, unbekannte Schemaversionen und veraltete Vorschau-Prüfsummen werden abgelehnt.

### Migrationsvertrag

Das Produktionsschema bleibt ausdrücklich **Version 1**.

Die Migrationsengine definiert zukünftige Schritte ausschließlich als deterministische Folge:

`n -> n+1 -> n+2 -> ...`

Regeln:

- kein stilles Überspringen fehlender Schritte
- keine Rückwärtsmigration
- jeder Schritt muss exakt die erwartete nächste `schemaVersion` liefern
- Quelle wird nicht mutiert
- Migrationsplan kann vor Ausführung beschrieben werden

Eine `v1 -> v2`-Migration existiert derzeit **nur als isolierte Testfixture**. Damit ist die Engine bewiesen, ohne ein künstliches Schema v2 in Produktionsdaten einzuführen.

## Oberfläche und Workspace

Die Kernbereiche sind:

- Seitenleiste
- Kopfbereich
- Schnellstarterleiste mit Entwicklungsnotiz
- Übersicht
- Module
- Arbeitsbereich
- Detailbereich mit Project Data Studio und Recovery
- Systemstatus
- versteckbarer Bereich `Debugging & Logging`

### Layout bedienen

Der Schalter `Layout` bleibt außerhalb der veränderbaren Arbeitsfläche. Einzelne Panels können ein-/ausgeblendet, alle wieder angezeigt oder über `Standardlayout wiederherstellen` auf den Ausgangszustand gesetzt werden.

Der Workspace-Schlüssel bleibt unverändert:

`provoware.allin.workspace.main.v1`

Debug-Einstellungen und Project-Data-Daten werden durch den Workspace-Reset nicht gelöscht.

## Panelgröße per Tastatur – 0.3.0-D3a

Ab 981 px besitzt jedes Workspace-Panel unten rechts einen fokussierbaren Größen-Griff.

- `←` / `→`: Rasterbreite ändern
- `↑` / `↓`: Höhe in 24-px-Schritten ändern
- `Home` / `Pos1`: nur aktuelle Panelgröße zurücksetzen
- `Escape`: laufende Vorschau verwerfen

Die Änderung bleibt während der Tastenwiederholung eine Vorschau und wird erst nach Freigabe der letzten Resize-Pfeiltaste gebündelt gespeichert. Bis einschließlich 980 px bleibt Resize technisch und visuell deaktiviert.

Pointer-/Maus-/Touch-/Stift-Resize bleibt eine getrennte spätere Workspace-Stufe.

## Modulprinzip

Ein Modul-Steckbrief beschreibt Version, Einstiegspunkt, Fähigkeiten und Ziel-Slot. Die zentrale Registry validiert den Steckbrief vor dem Laden.

Lebenszyklus:

`registered -> loading -> loaded -> active -> inactive -> registered`

Aktuell registrierte Fachmodule:

- `development-notes` – Version `0.4.0`
- `data-studio` – Version `0.4.0`
- `data-recovery` – Version `0.4.1`

Der Modulvertrag bleibt Version `1`.

## Debugging & Logging

Der Bereich ist über `Debug & Logging` ein-/ausblendbar.

- Stufe 1 · Ereignisse
- Stufe 2 · Diagnose
- Stufe 3 · Trace

Wichtige Bereiche:

- `MODULES` – Registry/Lifecycle
- `WORKSPACE` – Layoutzustand
- `DEV-NOTES` – Entwicklungsnotizen
- `DATA-STUDIO` – Projektdatenverwaltung
- `DATA-RECOVERY` – Backup, Restore, Export und Import

## Entwicklung und automatische Prüfung

Node.js 20 oder neuer wird benötigt. Es existieren weiterhin **keine Laufzeitabhängigkeiten**.

### Lint

```bash
npm run lint
```

Der abhängigkeitfreie Projekt-Linter prüft projektspezifische Sicherheits- und Architekturregeln, unter anderem verbotene dynamische Codeausführung, unbeabsichtigte externe `fetch`-Ziele, unsichere Serverbindung und eine zweite Browser-Persistenz in den Project-Data-Modulen.

### Vollständiges Gate

```bash
npm run verify
```

Reihenfolge:

`PROJECT LINT -> QUALITY GATE -> TESTS`

Das Quality Gate prüft unter anderem:

- JavaScript-Syntax
- JSON und semantikneutrales Textformat
- Pflichtdateien
- lokale HTML-Verweise und doppelte IDs
- Versionskonsistenz
- Modulvertrag und Registry
- Workspace-Verträge
- Project-Data-Module und Styles
- Schutz der lokalen Laufzeitdatenbank vor Git und Auto-Fix
- Startserver- und Pfadregeln

Die Tests decken zusätzlich unter anderem ab:

- bestehende Workspace-State-/Resize-Regressionen
- Modul-Lifecycle
- API-Routing und Same-Origin-Schutz
- Entwicklungsnotiz-Normalisierung und Zeitstempel
- beschädigte Datenbankdateien
- Vorlagen-/Datensatzvalidierung
- inkompatible Schemaänderungen
- parallele Datenmutationen ohne verlorene Datensätze
- Backup-Rotation
- Backup-Vorschau und SHA-256
- automatisches Sicherheitsbackup vor Restore und Import
- Restore-Abbruch direkt vor Rename ohne Verlust der Live-Datei
- Recovery aus einer beschädigten Live-Datei
- veraltete Import-Prüfsummen
- Exportvertrag
- Migrationsplan, fehlende Schritte und Rückwärtsmigrationsschutz
- isolierte deterministische `v1 -> v2`-Fixture
- statischen UI-Vertrag der Recovery-Oberfläche
- Fehlererkennung des Linters selbst

GitHub Actions führt dasselbe Gate auf **Node 20 und Node 24** aus.

Technischer erster 0.4.1-Gate-Stand:

- `30` JavaScript-Dateien gelintet
- `82` Projektdateien geprüft
- `81/81` Tests erfolgreich
- Node 20 erfolgreich
- Node 24 erfolgreich

### Sichere automatische Korrektur

```bash
npm run fix
```

Der Auto-Fix ist bewusst **kein aggressiver Quellcode-Reformatter**. Er verändert nur eindeutig semantikneutrale Dinge wie JSON-Einrückung, Zeilenenden und überflüssige Leerzeichen am Zeilenende. Die lokale Laufzeitdatenbank `data/project-data.json` wird ausdrücklich nicht angefasst. Recovery-Backups verwenden zusätzlich `.pwbak` und werden dadurch nicht als JSON-Quelldateien normalisiert.

## Regressionshandling

Der aktuelle Stand besitzt mehrere Ebenen:

1. isolierter Feature-Branch und dokumentierter Baseline-Checkpoint
2. kleine versionierte Datenverträge
3. serverseitige Validierung
4. atomare und serialisierte Datenmutationen
5. Backup vor vollständiger Datenbankersetzung
6. SHA-gebundene Vorschau vor Restore und Import
7. Failure-Injection direkt im atomaren Schreibpfad
8. Migrationsvertrag mit isolierter Fixture
9. Lint + Quality Gate + gesamte Testsuite
10. CI-Matrix auf Node 20 und Node 24
11. Pull-Request-Diff-Gate vor Merge
12. Main-Check nach Merge

Das ist deutlich robuster, aber weiterhin nicht als „perfekt“ zu bezeichnen. Noch offen bleiben echte Firefox-/Chrome-E2E-Tests, Cross-OS-CI auf Windows/macOS und reale Produktionsmigrationen erst dann, wenn tatsächlich ein neues Datenbankschema benötigt wird.

## Entwicklungsworkflow

Verbindliche Regeln: [`AGENTS.md`](AGENTS.md)

Kurzform:

`BASELINE -> ZIEL -> PLAN -> PRECHECK -> PATCH -> FORMAT/FIX -> LINT -> TEST -> FAILURE-INJECTION -> POSTCHECK -> DOKUMENTATION -> DIFF-GATE -> PR -> MERGE -> MAIN-CHECK`

Project-Data-Dokumente:

- [`docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md`](docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md)
- [`docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md`](docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md)
- [`docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md`](docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md)
- [`docs/PLAN_0.4.1_RECOVERY_MIGRATION.md`](docs/PLAN_0.4.1_RECOVERY_MIGRATION.md)
- [`docs/CHECKPOINT_0.4.1_RECOVERY_MIGRATION.md`](docs/CHECKPOINT_0.4.1_RECOVERY_MIGRATION.md)
- [`docs/CHECKLIST_0.4.1_RECOVERY_MIGRATION.md`](docs/CHECKLIST_0.4.1_RECOVERY_MIGRATION.md)

Workspace-Verträge:

- [`docs/WORKSPACE_CONTRACT.md`](docs/WORKSPACE_CONTRACT.md)
- [`docs/RESIZE_CONTRACT_0.3.0.md`](docs/RESIZE_CONTRACT_0.3.0.md)

## Struktur – Project Data

### 0.4.0

- `modules/development-notes/index.js` – Dashboard-Schnelleingabe und feste Notizdatei
- `modules/data-studio/index.js` – Vorlagenbaukasten und Datensatzeditor
- `scripts/project-data-service.mjs` – Datenvertrag, CRUD-Validierung, Basis-API und atomare Persistenz
- `assets/project-data.css` – isolierte Darstellung der Project-Data-Module
- `data/ENTWICKLUNGSNOTIZEN.txt` – feste Entwicklungsnotizdatei
- `data/project-data.json` – lokale Laufzeitdatenbank, nicht in Git
- `tests/project-data-service.test.mjs` – Daten- und Persistenzregression
- `tests/project-data-api.test.mjs` – API-/Herkunftsregression
- `tests/project-data-ui-contract.test.mjs` – UI-/Registry-Vertrag

### 0.4.1

- `scripts/project-data-recovery.mjs` – Backup, Rotation, Preview, Restore, Export/Import und Migrationsengine
- `modules/data-recovery/index.js` – Recovery-Oberfläche
- `data/backups/project-data/*.pwbak` – lokale Runtime-Sicherungen, nicht in Git
- `tests/project-data-recovery.test.mjs` – Recovery-, Rotation-, Migration- und Failure-Injection-Tests
- `tests/project-data-recovery-api.test.mjs` – Recovery-API-Vertrag
- `tests/project-data-recovery-ui.test.mjs` – Recovery-UI-/Pflichtdateivertrag

Weitere Qualität:

- `scripts/project-lint.mjs` – projektspezifischer Linter
- `tests/project-lint.test.mjs` – Linter-Fehlerprobe

Die bestehende Workspace- und Modularchitektur bleibt erhalten; 0.4.x erweitert sie, statt sie zu ersetzen.

## Noch nicht enthalten

- reale Schema-v2-Produktionsmigration – erst bei einem tatsächlich benötigten neuen Schema
- relationale Feldtypen, Suche/Filter und optionaler SQLite-Adapter – spätere Project-Data-Stufe
- echte Firefox-/Chrome-E2E-Abnahme
- Cross-OS-CI auf Windows/macOS
- Pointer-/Touch-Resize und Drag & Drop aus dem separaten Workspace-Strang

## Version

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`.

Aktuelle interne Entwicklungsstufe: `0.4.1 – Recovery & Migration · Backup, Restore, Import/Export & Failure Injection`.
