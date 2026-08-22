# PROVOWARE ALL-IN 2026

Modulare Offline-First-Oberfläche mit versioniertem Workspace, lokalem Modulvertrag, projektgebundener Datenhaltung, Recovery und realer Chromium-Browserprüfung.

- Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`
- Interne Entwicklungsstufe: `0.4.2-H1 – Persistence Portability Foundation`
- Project-Data-Produktionsschema: `1`
- Data-Studio-PRO-Metadatenvertrag: `1`
- Runtime-Persistence-Vertrag: `1`
- Modulvertrag: `1`
- Workspace-Vertrag: `1`

Die Produkt- und Datenformate werden durch H1 nicht geändert. H1 vereinheitlicht ausschließlich die interne Schreibsemantik für Runtime-Datendateien.

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

Der lokale Server bindet ausschließlich an `127.0.0.1`. `index.html` kann weiterhin direkt in Chromium oder Firefox geöffnet werden; dateibasierte Schreibfunktionen degradieren unter `file://` kontrolliert in einen nicht schreibfähigen Modus.

## Entwicklungsnotiz – Schnellspeichern

Die Schnellstarterleiste schreibt einzeilige, serverseitig zeitgestempelte Notizen nach:

`data/ENTWICKLUNGSNOTIZEN.txt`

Speichern funktioniert per `Enter` oder Button. Der Browser kann keinen frei wählbaren Zielpfad an die Schreib-API übergeben.

## Project Data Studio – 0.4.0

Live-Datei:

`data/project-data.json`

Produktionsschema v1:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

Feldtypen:

- Text
- Mehrzeiler
- Zahl
- Datum
- Checkbox
- Auswahlliste

Vorlagen und Datensätze können erstellt, geladen, bearbeitet und gelöscht werden. Fachwerte werden serverseitig gegen die jeweilige Vorlage validiert.

## Data Studio PRO – 0.4.2

PRO ist als Companion-Modul vom stabilen CRUD-Editor getrennt. Es ergänzt:

- Datensatz-Volltextsuche
- Vorlagen- und Kategorienfilter
- Sortierung nach Erstell-/Änderungszeit
- Kategorien
- Vorlagenbibliothek
- gespeicherte Ansichten
- Vorlagenexport ohne Datensätze
- direkte Navigation zurück in den bestehenden CRUD-Editor

PRO-Metadaten liegen getrennt in:

`data/data-studio-pro.json`

Metadatenvertrag v1:

- `schemaVersion`
- `revision`
- `categories[]`
- `templateCategories[]`
- `savedViews[]`

Project Data bleibt dadurch unverändert bei Produktionsschema v1.

## 0.4.2-H1 – Persistence Portability Foundation

### Warum H1 existiert

Vor H1 besaßen Project Data und Data Studio PRO zwei fast identische eigene Writer:

`Temp-Datei -> Schreiben -> Failpoint -> Rename -> Cleanup`

Das war funktional stabil, hätte aber Cross-OS-Hardening und den geplanten Multi-Datei-Recovery-Envelope unnötig verdoppelt. H1 ersetzt beide internen Implementierungen durch **einen** kanonischen Vertrag:

`scripts/runtime-persistence.mjs`

`VERSION.json` bindet diesen Vertrag als `runtime_persistence_contract_version = 1` und `runtime_persistence_writer = scripts/runtime-persistence.mjs`.

### Kanonischer Schreibpfad

```text
Zielverzeichnis vorbereiten
  -> Temp-Datei im selben Verzeichnis erzeugen
  -> exklusiv mit wx schreiben
  -> optionaler Failure-Injection-Hook
  -> atomarer Rename/Replace
  -> bei Erfolg fertig
  -> bei Fehler Temp best-effort bereinigen
```

Eigenschaften:

- Temp-Datei liegt immer im selben Zielverzeichnis wie die Live-Datei.
- Temp-Erzeugung verwendet exklusives `wx`.
- Project Data und PRO delegieren beide an `atomicReplaceFile()`.
- Fachvalidierung bleibt in den jeweiligen Services.
- vorhandener `beforeRename`-Failpoint bleibt kompatibel.
- Dateiformate bleiben unverändert.
- keine zweite Persistenzquelle.

### Fail-closed statt destruktiver Windows-Fallback

H1 enthält ausdrücklich **keinen** Ablauf:

```text
unlink(target) -> rename(temp)
```

Ein solcher Fallback würde ein Datenverlustfenster zwischen Löschen und Ersetzen erzeugen. Wenn ein sicherer Replace nicht möglich ist, bricht PROVOWARE ab und lässt die vorhandene Live-Datei unangetastet.

### Begrenzter Retry

Nur transiente Replace-Fehler werden wiederholt:

- `EBUSY`
- `EPERM`

Standardmäßig sind maximal drei Replace-Versuche vorgesehen. Permanente Fehler wie `EACCES`, `EROFS` oder `ENOSPC` werden nicht durch aggressive Endlosschleifen verdeckt.

### Fehlerklassen

Der gemeinsame Vertrag liefert stabile technische Kategorien:

- `LOCKED`
- `PERMISSION`
- `READ_ONLY`
- `NO_SPACE`
- `TEMP_CREATE`
- `WRITE_FAILED`
- `REPLACE_FAILED`
- `UNKNOWN`

Damit kann H1b dieselbe Semantik auf Linux und Windows prüfen, ohne Windows-Sonderlogik in die Fachservices einzubauen.

### Temp-Cleanup

Getestet sind unter anderem:

- Failure-Injection direkt vor Replace
- permanenter Replace-Fehler
- transiente Replace-Fehler mit begrenztem Retry
- teilweise erzeugte Temp-Datei mit anschließendem `ENOSPC`
- Fehler beim Vorbereiten des Zielverzeichnisses

Ein `EEXIST` beim exklusiven Temp-Erzeugen wird bewusst **nicht** durch Löschen dieser Datei beantwortet, weil sie von einem anderen Prozess stammen könnte.

### Architektur-Gate

Der zentrale Quality Gate erzwingt:

- `scripts/runtime-persistence.mjs` ist Pflichtdatei.
- beide Runtime-Tests sind Pflichtdateien.
- H1-Plan, Checkpoint und Checkliste sind Pflichtdateien.
- Project Data und PRO müssen `atomicReplaceFile()` importieren und verwenden.
- beide Fachservices dürfen keinen eigenen `rename()`-Pfad besitzen.
- ein destruktiver Target-Unlink-Fallback ist verboten.
- VERSION muss den Runtime-Persistence-Vertrag v1 benennen.

## Recovery & Migration – 0.4.1

Bestehende Project-Data-Backups bleiben unverändert:

`data/backups/project-data/*.pwbak`

Eigenschaften:

- manuelle und automatische Sicherheitsbackups
- Rotation auf maximal 10
- SHA-256
- Restore-/Import-Vorschau
- explizite Bestätigung
- atomarer Ersatz
- Failure-Injection
- Migrationsengine `n -> n+1`

Das Project-Data-Produktionsschema bleibt v1. Eine v1→v2-Migration existiert nur als Testfixture.

### Bewusste Recovery-Grenze

Die bestehenden `.pwbak`-Dateien sichern weiterhin nur `data/project-data.json`. `data/data-studio-pro.json` wird **nicht still** in dieses alte Format hineingemischt.

Die gemeinsame Sicherung folgt später als eigener versionierter **0.4.3 Recovery Envelope**.

## Chromium-first Browser-E2E

Browserprüfungen bleiben vom schnellen Core-Gate getrennt.

Installation nur für Entwicklung/CI:

```bash
npm install --ignore-scripts --no-audit --no-fund
npm run browser:install:chromium
```

Primärlauf:

```bash
npm run test:e2e:chromium
```

Firefox bleibt optional:

```bash
npm run browser:install:firefox
npm run test:e2e:firefox
```

Chromium prüft aktuell drei reale Pfade:

1. Notiz + Project-Data-CRUD + Recovery + Export/Import.
2. Data-Studio-PRO-Kategorie + Bibliothek + Suche + gespeicherte Ansicht + Export + Reload.
3. proportionaler HTML-Mirror der echten UI.

Die Testausführung arbeitet in einer temporären Projektkopie und verändert keine echten Arbeitsdaten.

## HTML UI Mirror

`tests/browser/ui-mirror.html` lädt zweimal dieselbe echte `index.html`.

- internes Layout: `1366 × 900`
- Spiegel-Skalierung: `0,5`
- sichtbarer Spiegel: `683 × 450`

Das Gate vergleicht zentrale DOM-Geometrie. Screenshots sind reproduzierbare Evidenz, aber bewusst kein betriebssystemabhängiger Pixel-Diff-Blocker.

## Qualität und Regression

Schneller Core-Gate:

```bash
npm run verify
```

Reihenfolge:

`PROJECT LINT -> QUALITY GATE -> NODE TEST RUNNER`

Erster vollständig grüner H1-Stand nach Writer-Migration:

- Node 20: PASS
- Node 24: PASS
- 44 JavaScript-Dateien gelintet
- 109 Projektdateien geprüft
- 112/112 Node-Tests erfolgreich
- Chromium-E2E: PASS
- Firefox im automatischen Lauf: wie vorgesehen übersprungen

H1-Tests prüfen insbesondere:

- echten Replace-Erfolg
- Temp-Datei im Zielverzeichnis
- exklusives `wx`
- bytegenau unveränderte Live-Datei bei Failpoint
- Temp-Cleanup
- teilweisen Temp-Schreibfehler
- begrenzten `EPERM`-Retry
- permanenten `EACCES`-Abbruch
- Rechtefehler beim Zielverzeichnis
- stabile Fehlerklassifikation
- gemeinsame Writer-Nutzung
- Verbot eigener `rename()`-Pfade
- Verbot eines Target-Unlink-Fallbacks

Die bestehenden Recovery-, PRO-, Workspace-, API-, Lint- und Chromium-Regressionen bleiben Bestandteil derselben Abnahme.

## Wichtige Entwicklungsdokumente

Project Data / Recovery:

- `docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/PLAN_0.4.1_RECOVERY_MIGRATION.md`
- `docs/CHECKLIST_0.4.1_RECOVERY_MIGRATION.md`

Browser-E2E / Mirror:

- `docs/PLAN_0.4.1_BROWSER_E2E_HTML_MIRROR.md`
- `docs/CHECKLIST_0.4.1_BROWSER_E2E_HTML_MIRROR.md`

Data Studio PRO:

- `docs/PLAN_0.4.2_DATA_STUDIO_PRO.md`
- `docs/CHECKLIST_0.4.2_DATA_STUDIO_PRO.md`

Persistence Portability:

- `docs/PLAN_0.4.2_H1_PERSISTENCE_PORTABILITY.md`
- `docs/CHECKPOINT_0.4.2_H1_PERSISTENCE_PORTABILITY.md`
- `docs/CHECKLIST_0.4.2_H1_PERSISTENCE_PORTABILITY.md`

Verbindliche Agenten-/Entwicklungsregeln: `AGENTS.md`.

## Nächste Stufen

1. **0.4.2-H1b Cross-OS Persistence Gate:** denselben H1-Vertrag auf realen Ubuntu- und Windows-Runnern prüfen und Portability-Evidence erzeugen.
2. **0.4.3 Recovery Envelope:** Project Data + PRO-Metadaten versioniert gemeinsam sichern und über Journal/Rollback wiederherstellen.
3. **Workspace D3b:** Pointer/Maus/Touch/Stift über den bestehenden Resize-Vertrag ergänzen.

Windows-Chromium-E2E wird erst verpflichtend, wenn H1b das Dateisystem-Gate stabil abgenommen hat. SQLite bleibt optional und wird nur bei nachgewiesenem fachlichem Bedarf eingeführt.
