# PROVOWARE ALL-IN 2026

Modulare Offline-First-Oberfläche mit versioniertem Workspace, lokalem Modulvertrag und projektgebundener Datenhaltung. Die freigegebene Produktversion bleibt bewusst `0.2.0`; die aktuelle Entwicklungsstufe ist **`0.4.0 – Project Data Studio`**. Die bereits abgeschlossene Workspace-Stufe `0.3.0-D3a – Keyboard Resize Preview` bleibt unverändert Bestandteil der Basis.

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

**Wichtig:** Echte Schreibzugriffe auf Projektdateien sind aus Sicherheitsgründen nur über den lokalen Klick-&-Start-Server möglich. Beim direkten `file://`-Start bleiben Schnellnotiz und Data Studio sichtbar, erklären aber verständlich, dass Speichern/Bearbeiten den lokalen Server benötigt.

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

## Oberfläche und Workspace

Die Kernbereiche sind:

- Seitenleiste
- Kopfbereich
- Schnellstarterleiste mit Entwicklungsnotiz
- Übersicht
- Module
- Arbeitsbereich
- Detailbereich mit Project Data Studio
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
- Project-Data-Pflichtmodule und Styles
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
- statischen UI-Vertrag der neuen Module
- Fehlererkennung des Linters selbst

GitHub Actions führt dasselbe Gate auf **Node 20 und Node 24** aus.

### Sichere automatische Korrektur

```bash
npm run fix
```

Der Auto-Fix ist bewusst **kein aggressiver Quellcode-Reformatter**. Er verändert nur eindeutig semantikneutrale Dinge wie JSON-Einrückung, Zeilenenden und überflüssige Leerzeichen am Zeilenende. Die lokale Laufzeitdatenbank `data/project-data.json` wird vom Auto-Fix ausdrücklich nicht angefasst.

Diese konservative Entscheidung hält das Projekt offline-first und verhindert, dass ein Formatter fachliche oder persistente Daten umschreibt.

## Regressionshandling

Der aktuelle Stand besitzt mehrere Ebenen:

1. isolierter Feature-Branch und dokumentierter Baseline-Checkpoint
2. kleine versionierte Datenverträge
3. serverseitige Validierung
4. atomare und serialisierte Datenmutationen
5. Lint + Quality Gate + gesamte Testsuite
6. CI-Matrix auf Node 20 und Node 24
7. Pull-Request-Diff-Gate vor Merge
8. Main-Check nach Merge

Das ist robust, aber nicht als „perfekt“ zu bezeichnen. Noch nicht Teil von 0.4.0 sind echte Browser-E2E-Tests, automatisches Backup/Restore, Datenmigrationstests zwischen zukünftigen Schemaversionen sowie Cross-OS-CI auf Windows/macOS. Diese Punkte sind bewusst als nächste Härtungsstufen getrennt.

## Entwicklungsworkflow

Verbindliche Regeln: [`AGENTS.md`](AGENTS.md)

Kurzform:

`BASELINE -> ZIEL -> PLAN -> PRECHECK -> PATCH -> FORMAT/FIX -> LINT -> TEST -> POSTCHECK -> DOKUMENTATION -> DIFF-GATE -> PR -> MERGE -> MAIN-CHECK`

Project-Data-Dokumente:

- [`docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md`](docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md)
- [`docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md`](docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md)
- [`docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md`](docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md)

Workspace-Verträge:

- [`docs/WORKSPACE_CONTRACT.md`](docs/WORKSPACE_CONTRACT.md)
- [`docs/RESIZE_CONTRACT_0.3.0.md`](docs/RESIZE_CONTRACT_0.3.0.md)

## Struktur – neue 0.4.0-Komponenten

- `modules/development-notes/index.js` – Dashboard-Schnelleingabe und feste Notizdatei
- `modules/data-studio/index.js` – Vorlagenbaukasten und Datensatzeditor
- `scripts/project-data-service.mjs` – Datenvertrag, Validierung, API und atomare Persistenz
- `assets/project-data.css` – isolierte Darstellung beider Module
- `data/ENTWICKLUNGSNOTIZEN.txt` – feste Entwicklungsnotizdatei
- `data/project-data.json` – lokale Laufzeitdatenbank, nicht in Git
- `scripts/project-lint.mjs` – projektspezifischer Linter
- `tests/project-data-service.test.mjs` – Daten- und Persistenzregression
- `tests/project-data-api.test.mjs` – API-/Herkunftsregression
- `tests/project-data-ui-contract.test.mjs` – UI-/Registry-Vertrag
- `tests/project-lint.test.mjs` – Linter-Fehlerprobe

Die bestehende Workspace- und Modularchitektur bleibt erhalten; `0.4.0` erweitert sie, statt sie zu ersetzen.

## Noch nicht enthalten

- Datenexport/-import und Backup/Restore – vorgesehen für `0.4.1`
- Datenmigrationen und Recovery-Proben – vorgesehen für `0.4.1`
- relationale Feldtypen, Suche/Filter und optionaler SQLite-Adapter – spätere Project-Data-Stufe
- echte Firefox-/Chrome-E2E-Abnahme
- Pointer-/Touch-Resize und Drag & Drop aus dem separaten Workspace-Strang

## Version

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`.

Aktuelle interne Entwicklungsstufe: `0.4.0 – Project Data Studio · Integration & Regression Hardening`.
