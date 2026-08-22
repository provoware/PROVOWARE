# CHANGELOG

## 0.4.3 – Recovery Envelope · abgeschlossen

### Hinzugefügt

- neuer versionierter Recovery-Envelope mit Kennung `provoware-recovery-envelope` und `formatVersion: 1`.
- gemeinsame Sicherung von `data/project-data.json` und `data/data-studio-pro.json` als getrennte Komponenten mit Rohbytes/Base64, SHA-256, Byte-Länge, Zustand und Validierungsmetadaten.
- eigene Gesamt-SHA-256-Bindung des kanonischen Envelope-Payloads.
- feste `.pwenvelope`-Ablage unter `data/backups/project-envelope/` mit Rotation auf maximal zehn Sicherungen.
- Safety-Envelope vor jedem gemeinsamen Restore.
- versioniertes Restore-Journal unter `data/recovery/recovery-envelope-journal.json`.
- deterministischer Multi-Datei-Restore mit verifizierter Zielprüfung und Rollback.
- automatischer Wiederanlauf aus liegengebliebenem Journal vor dem Öffnen des lokalen Serverports.
- Envelope-API unter dem bestehenden Recovery-Prefix und getrennte Envelope-Sektion im bestehenden Recovery-Modul.
- echter vierter Chromium-E2E-Pfad für gemeinsamen Project-Data-/PRO-Restore.
- Failure-Injection vor der ersten Komponente, zwischen den Komponenten, nach der zweiten Komponente, vor Abschlussverifikation sowie für einen separaten Rollbackfehler.

### Architektur und Rückwärtskompatibilität

- Legacy-`.pwbak` bleibt unverändert ein Project-Data-only-Format aus 0.4.1.
- alte `.pwbak`-Dateien werden weder umgedeutet noch automatisch umgeschrieben.
- Project-Data-Produktionsschema bleibt Version 1.
- Data-Studio-PRO-Metadatenvertrag bleibt Version 1.
- Multi-Datei-Restore verwendet ausschließlich die gemeinsame 0.4.2-H1-Schicht `scripts/atomic-file.mjs`.
- Envelope-Routen werden vor dem Legacy-Recovery-Router behandelt, damit Unterrouten nicht vom älteren Router abgefangen werden.
- Envelope-/Journalpfade sind aus Git, statischer Auslieferung und semantikneutralem Auto-Fix ausgeschlossen.
- ein gemischter, unjournalisierter Live-Zustand wird nach Fehlern nicht still akzeptiert.

### Durch echte Browserläufe gefunden und repariert

- zwei syntaktisch gültige, aber zur Laufzeit fehlerhafte Backtick-Verwendungen im großen Recovery-`innerHTML`-Template wurden durch Chromium gefunden und durch Regressionstests gegen rohe `.pwbak`-Backticks abgesichert.
- der bestehende HTML-Mirror konnte Recovery-/PRO-Frames zu früh als bereit werten und dadurch unterschiedliche asynchrone Zwischenzustände vergleichen.
- der Mirror wartet jetzt auf fertige Data-Studio-, PRO- und Recovery-Statuswerte, verlangt mehrere stabile Geometriemessungen und nimmt `.data-recovery` selbst in den Geometrievertrag auf.
- Fehlerberichte enthalten die konkret abweichenden Selektoren über `geometryDifferences`.

### Finale Evidenz

- Funktions-Head vor Merge: `5710a068dba7758b95aa8391c3abed7342e6eaee`.
- PR #87: gemergt.
- Merge-Commit: `b1bf3a24b30cb18df693b46a26953de8bc9aef18`.
- Node 20: PASS.
- Node 24: PASS.
- Project Lint: `49` JavaScript-Dateien.
- Quality Gate: `118` Projektdateien.
- Node-Test-Suite: `131/131` PASS, `0` Fehler.
- Ubuntu Persistence Portability: PASS.
- Windows Persistence Portability: PASS.
- Chromium: `4/4` PASS.
- Firefox im automatischen Lauf: wie vorgesehen SKIPPED.
- Browserartefakt: `9481363211`.
- Artefakt-SHA-256: `a4e897f6a594fd126d9c19f5a72bb2416a5b0f7de14ec1ab285afbb231839566`.
- Erfolgsartefakt tatsächlich geprüft: `11` Dateien inklusive `08-recovery-envelope-restored.png` und grünem HTML-Mirror.
- HTML-Mirror: beide internen Frames `1366 × 900`, Skalierung `0,5`, `keyGeometryIdentical: true`, keine Geometrieabweichungen.

### Bewusst nicht enthalten

- kein portabler Envelope-Import/Export ohne eigenen Vorschau-, Konflikt- und Identitätsvertrag.
- kein verpflichtender Windows-Chromium-Browserlauf; Windows-Dateisystem-Persistenz ist bereits separat grün.
- keine Änderung der Produktversion `0.2.0`.
- keine Änderung des Project-Data- oder PRO-Produktionsschemas.
- kein SQLite-Adapter ohne nachgewiesenen Bedarf.

## In Entwicklung – 0.4.2 Data Studio PRO

### Hinzugefügt

- neues Companion-Modul `data-studio-pro` Version `0.4.2` für Suche, Filter, Kategorien, Vorlagenbibliothek, Vorlagenexport und gespeicherte Ansichten.
- kleine getrennte `data-studio-pro-bridge` für Navigation in den bestehenden CRUD-Editor und automatische Revisionssynchronisierung.
- eigener PRO-Metadatenvertrag Version 1 in `data/data-studio-pro.json` mit `categories[]`, `templateCategories[]` und `savedViews[]`.
- Datensatz-Volltextsuche über Feldbezeichnungen und sichtbare Werte.
- Filter nach Vorlage und Kategorie sowie vier reproduzierbare Sortiermodi nach Erstellung/Aktualisierung.
- Vorlagenbibliothek mit Name, Kategorie, Feldanzahl, Datensatzanzahl, Suche und Kategorie-Filter.
- serverseitig persistierte Kategorien mit case-insensitiver Eindeutigkeit.
- benannte gespeicherte Ansichten für Vorlage, Kategorie, Suchtext und Sortierung.
- portabler Vorlagenexport mit Kennung `provoware-data-studio-template`, Formatversion 1 und optionaler Kategorie; Datensätze werden bewusst nicht exportiert.
- PRO-Service-, API-, UI-, Bridge-, Failure-Injection- und Browser-Regressionen.
- Plan, Baseline-Checkpoint und Abnahmecheckliste für 0.4.2.

### Architektur und Sicherheit

- Project-Data-Produktionsschema bleibt unverändert Version 1.
- der stabile CRUD-Editor `data-studio` bleibt Version 0.4.0 und wird nicht mit Recherche-/Organisationslogik aufgebläht.
- PRO-Metadaten verwenden dieselbe zentrale Mutationssperre wie Project Data und Recovery.
- PRO-Persistenz verwendet vollständiges Temp-Schreiben und atomaren Rename.
- ein injizierter Fehler direkt vor Rename lässt die vorhandene PRO-Datei bytegenau unverändert.
- beschädigtes bestehendes PRO-JSON wird nicht still ersetzt.
- `data/data-studio-pro.json` und Temp-Dateien bleiben aus Git, statischer Auslieferung und semantikneutralem Auto-Fix ausgeschlossen.
- PRO-Schreibzugriffe sind Same-Origin-gebunden.
- `localStorage` und `sessionStorage` bleiben auch für PRO durch den Projekt-Linter verboten.
- die Revisionsbrücke beobachtet ausschließlich die gerenderte Data-Studio-Revision und löst einen erneuten PRO-Lesezugriff aus; CRUD wird nicht dupliziert.

### Chromium-E2E und Evidenz

- Chromium führt jetzt drei echte Browserprüfungen aus: bestehende CRUD-/Recovery-Kette, neue Data-Studio-PRO-Kette und HTML-Mirror.
- PRO-Browserpfad: `Vorlage -> Datensätze -> Kategorie -> Zuweisung -> Bibliotheksfilter -> Volltextsuche -> gespeicherte Ansicht -> Anwenden -> Vorlagenexport -> Reload -> Ansicht erneut anwenden`.
- HTML-Mirror wartet auf vollständig aktiviertes Data Studio PRO und vergleicht `.data-studio-pro` zusätzlich geometrisch.
- neue Screenshot-Evidenz `07-data-studio-pro.png`.
- neuer Evidenzexport `data-studio-template-export.json`.

### Erster vollständig grüner 0.4.2-Stand

- Core Quality Gate auf Node 20: PASS.
- Core Quality Gate auf Node 24: PASS.
- Project Lint: `41` JavaScript-Dateien.
- Quality Gate: `103` Projektdateien.
- Node-Test-Suite: `101/101` PASS, `0` Fehler.
- Chromium: `3/3` echte Browserprüfungen PASS.
- Firefox im automatischen Lauf: wie vorgesehen übersprungen.
- Browserartefakt: `9476750307`.
- Artefakt-SHA-256: `f2eee6beb9baec81126885ce23c8543070afec0fae088045d104cd68a8628f99`.
- Artefakt tatsächlich geprüft: sieben PNG-Screenshots, Project-Data-Export, Vorlagenexport und Playwright-Report.

### Bewusst nicht enthalten

- keine Änderung des Project-Data-Schemas v1.
- keine relationalen Feldtypen.
- kein Template-Import ohne eigenen Konflikt-/ID-Vertrag.
- kein SQLite-Adapter ohne nachgewiesenen Bedarf.
- das bestehende 0.4.1-`.pwbak`-Format sichert weiterhin nur `data/project-data.json`; eine gemeinsame Recovery-Hülle für PRO-Metadaten benötigt einen eigenen versionierten Vertrag.
- Cross-OS-/Windows-Dateisperren und Rename-Unterschiede folgen als eigener Qualitätsstrang.

## In Entwicklung – 0.4.1-E2E Chromium Gate & HTML UI Mirror

### Hinzugefügt

- Chromium als primäres echtes Browser-E2E-Projekt über Playwright `1.62.1`.
- Firefox als separater optionaler Kompatibilitätslauf statt als automatischer Hauptblocker.
- isolierter Browser-Testserver `scripts/browser-e2e-server.mjs`, der jede E2E-Ausführung in einer temporären Projektkopie startet.
- vollständige Browserkette `Notiz -> Datei -> Vorlage -> Datensatz -> Reload -> Edit -> Backup -> Änderung -> Restore -> Export -> Delete -> Import`.
- automatische Screenshot-Evidenz für Start, Datensatzerstellung, Restore, Import und HTML-Mirror.
- proportionale HTML-Mirror-Pipeline, die zweimal dieselbe echte `index.html` mit identischem internem Viewport lädt.
- Geometrieprüfung zentraler UI-Rechtecke zwischen Referenz und Spiegel.
- separater GitHub-Actions-Workflow `Browser E2E Gate` mit automatischem Chromium-Lauf bei Pull Requests und `main`-Pushes.
- Artefakt-Upload für Screenshots, Exportdatei, Playwright-Report sowie Fehler-Trace/Video.
- statische Browser-E2E-Vertragstests im bestehenden paketfreien Node-Gate.
- Plan, Checkpoint und Abnahmecheckliste für Browser-E2E und HTML-Mirror.

### Geändert

- `assets/project-data.css` reagiert auf die tatsächliche Containerbreite statt nur auf die Browserbreite.
- Project-Data-Karten sind im schmalen Detailpanel einspaltig und wechseln erst bei ausreichender Fachmodulbreite in mehrspaltige Darstellung.
- Feldzeilen und Datensatzaktionen werden ebenfalls containerabhängig angeordnet.
- interaktive Project-Data-Controls besitzen Scroll-Abstand zur sticky Schnellstarterleiste.
- `package.json` enthält getrennte Chromium-/Firefox-Browserbefehle; normale Runtime-Abhängigkeiten bleiben unverändert leer.
- `scripts/quality-check.mjs` verankert Browserworkflow, Mirror-Dateien, Chromium-Priorität und Firefox-Alternativstatus als Pflichtvertrag.
- Browserartefakte, Reports, Testresultate und `node_modules` sind im Root-`.gitignore` ausgeschlossen.

### Durch echten Browserlauf gefunden und repariert

- der erste vollständig gestartete Chromium-Test zeigte, dass sich im schmalen Detailpanel die viewport-basierte Zwei-Spalten-Darstellung von Data Studio/Recovery überlagerte.
- der sichtbare Button `Neue Vorlage` konnte dadurch von `Neuer Datensatz` oder nach Scrollbewegung von der sticky Schnellleiste abgefangen werden.
- der Test wurde nicht mit erzwungenen Klicks abgeschwächt; stattdessen wurde die reale Layoutgeometrie container-responsiv repariert.
- derselbe unveränderte Browserpfad lief nach der Reparatur vollständig grün.

### Validiert

- Core Quality Gate auf Node 20: PASS.
- Core Quality Gate auf Node 24: PASS.
- finaler Core-Stand: `35` JavaScript-Dateien gelintet, `94` Projektdateien geprüft, `87/87` Node-Tests erfolgreich.
- Chromium: `2/2` echte Browserprüfungen erfolgreich.
- HTML-Mirror: PASS mit intern `1366 × 900`, Skalierungsfaktor `0,5`, sichtbarer Spiegelgröße `683 × 450` und identischer Schlüsselgeometrie.
- finales Browserartefakt `9474686971`, SHA-256 `0ed384715c715ec78c9bfbabfc283e26f490fc7c83fa66f0355a60340118a8fe`.
- Erfolgsartefakt enthält tatsächlich sechs PNG-Screenshots und einen validierten Project-Data-JSON-Export.
- Firefox wurde im automatischen Lauf wie vorgesehen übersprungen.

### Bewusst nicht enthalten

- Firefox bleibt alternativ/manuell und ist kein automatischer Chromium-Ersatz.
- keine OS-abhängigen Pixel-Diff-Screenshot-Baselines.
- noch keine Windows-/macOS-CI-Matrix.
- keine Änderungen am Project-Data-Produktionsschema v1.
- keine Änderungen an Produktversion `0.2.0`.
- keine 0.4.2-Suche/Filter/Vorlagenbibliothek in diesem Strang.

## In Entwicklung – 0.4.1 Recovery & Migration

### Hinzugefügt

- neues Modul `data-recovery` Version `0.4.1` für lokale Backups, Restore-Vorschau, JSON-Export/-Import und Migrationsvorbereitung.
- neue Recovery-Schicht `scripts/project-data-recovery.mjs`, getrennt von der normalen CRUD-Datenlogik.
- feste Backup-Ablage `data/backups/project-data/` mit streng validierten Backup-IDs und Dateiendung `.pwbak`.
- automatische Sicherung des aktuellen Rohzustands vor Restore und Import.
- Backup-Rotation mit fester Obergrenze von zehn Sicherungen.
- SHA-256-Prüfsummen und Inhaltszusammenfassung für Backups, Restore- und Import-Vorschauen.
- zweistufiger Restore: Vorschau und Prüfsumme vor expliziter Bestätigung und atomarem Ersatz.
- zweistufiger Import: serverseitige Vorschau, Schema-/Inhaltsprüfung, Prüfsumme und explizite Bestätigung.
- validierter JSON-Export des aktuellen Project-Data-Bestands.
- Recovery einer beschädigten Live-Datei, wobei deren ursprüngliche Rohbytes vor dem Ersatz als Sicherheitsbackup erhalten bleiben.
- deterministische Migrationsengine mit ausschließlich aufeinanderfolgenden Schritten `n -> n+1`.
- isolierte `v1 -> v2`-Migrationsfixture zur Prüfung der Engine; Produktionsschema bleibt Version 1.
- Plan, Checkpoint und Abnahmecheckliste für 0.4.1.
- Recovery-Service-, Recovery-API-, Recovery-UI- und Failure-Injection-Tests.

### Geändert

- `scripts/project-data-service.mjs` stellt atomaren Writer und gemeinsame Mutationssperre kontrolliert für Recovery bereit.
- der atomare Writer besitzt einen injizierbaren Prüfhaken direkt vor `rename`, damit Schreibabbrüche reproduzierbar getestet werden können.
- Recovery-Routen werden über den bestehenden lokalen Project-Data-Router delegiert.
- direkte statische Auslieferung schützt nun zusätzlich `data/backups/project-data/`.
- `data/.gitignore` schließt das gesamte Recovery-Backupverzeichnis aus.
- `modules/registry.js` enthält `data-recovery` als drittes Fachmodul; Modulvertragsversion bleibt `1`.
- README, TODO und VERSION-Entwicklungsmetadaten auf 0.4.1 synchronisiert.

### Failure Injection und Datenintegrität

- ein simulierter Fehler nach vollständigem Temp-Schreiben, aber vor dem atomaren Rename, lässt die vorhandene Live-Datenbank bytegenau unverändert.
- das vor dem fehlgeschlagenen Restore erzeugte Sicherheitsbackup bleibt erhalten.
- beschädigte Live-Rohbytes werden vor einem Recovery-Import gesichert und nicht still vernichtet.
- eine veraltete SHA-256-Bestätigung zwischen Vorschau und Ausführung bricht Restore/Import kontrolliert ab.
- unbekannte beziehungsweise höhere Schemaversionen werden nicht still auf das aktuelle Produktionsschema zurückgeschrieben.
- Rückwärtsmigrationen und fehlende Migrationsschritte werden ausdrücklich abgelehnt.
- normale CRUD-Mutationen und Recovery-Aktionen verwenden dieselbe serialisierte Mutationssperre.

### Validiert

- erster vollständiger GitHub-Actions-Lauf auf Node 20 und Node 24 erfolgreich.
- Projekt-Linter: `30` JavaScript-Dateien geprüft.
- Quality Gate: `82` Projektdateien geprüft.
- finale Testsuite: `82/82` Tests erfolgreich, `0` fehlgeschlagen.
- bestehende Workspace-, Registry-, Start- und 0.4.0-Regressionen bleiben Bestandteil derselben Testsuite.

### Bewusst noch nicht enthalten

- keine reale Produktionsmigration auf Schema v2; diese wird erst bei einem tatsächlich benötigten neuen Datenvertrag entwickelt.
- keine relationale Datenbank oder SQLite-Umschaltung.
- Browser-E2E wurde im nachfolgenden 0.4.1-E2E-Strang ergänzt.
- keine Cross-OS-CI-Matrix für Windows/macOS.
- keine Änderungen am parallelen Pointer-/Drag-and-Drop-Workspace-Strang.

## In Entwicklung – 0.4.0 Project Data Studio

### Hinzugefügt

- Modul `development-notes` mit einzeiliger Dashboard-Schnelleingabe, Speichern per Enter oder Button und direktem Link zur festen Datei `data/ENTWICKLUNGSNOTIZEN.txt`.
- serverseitiger lokaler Zeitstempel im Format `YYYY-MM-DD HH:mm:ss` sowie Einzeilen-Normalisierung für Entwicklungsnotizen.
- Modul `data-studio` als zentrale lokale Projektdatenverwaltung im Detailbereich.
- flexibler Eingabemasken-Baukasten mit Text, Mehrzeiler, Zahl, Datum, Checkbox und frei definierbarer Auswahlliste.
- Vorlagen erstellen und bearbeiten sowie Datensätze erstellen, anzeigen, bearbeiten und löschen.
- versionierter Project-Data-Vertrag Version 1 mit `schemaVersion`, `revision`, `templates[]` und `records[]`.
- lokale API-Schicht in `scripts/project-data-service.mjs` mit festen Dateipfaden, JSON-Payload-Limit, Same-Origin-Prüfung und serverseitiger Datenvalidierung.
- atomare JSON-Persistenz und serialisierte Datenmutationen für `data/project-data.json`.
- Schutz vor inkompatiblen Vorlagenänderungen, solange bestehende Datensätze davon betroffen wären.
- eigener abhängigkeitfreier Projekt-Linter `scripts/project-lint.mjs` und Befehl `npm run lint`.
- automatische Project-Data-Service-, API-, UI-Vertrags-, Linter- und Parallelmutations-Tests.
- Plan, Checkpoint und Abnahmecheckliste für 0.4.0.

### Geändert

- `scripts/start.mjs` routet definierte lokale Project-Data-API-Endpunkte vor der statischen Dateiauslieferung.
- direkte statische Auslieferung von `data/project-data.json` wird blockiert.
- `npm run verify` führt jetzt `Lint -> Quality Gate -> Tests` aus.
- Quality Gate kennt die neuen Pflichtmodule und schützt `data/project-data.json` sowie atomare Temp-Dateien vor Auto-Fix/Quellcode-Walk.
- GitHub Actions von `actions/checkout@v4` / `actions/setup-node@v4` auf die aktuellen v7-Actions aktualisiert.
- CI auf Matrixprüfung mit Node 20 und Node 24 erweitert.
- `modules/registry.js` enthält erstmals echte Fachmodule; Modulvertrag bleibt Version 1.
- README, TODO, MANIFEST und VERSION-Entwicklungsmetadaten auf den neuen Funktionsstand synchronisiert.
- die früher vorgesehene `0.4.0 Diagnose Foundation PRO` wird wegen der jetzt belegten Project-Data-Version sauber auf `0.5.0` verschoben.

### Sicherheits- und Datenintegritätsgrenzen

- der Browser kann keine frei wählbaren Dateipfade an die Schreib-API übergeben.
- `data/project-data.json` und `data/project-data.json.tmp-*` bleiben aus Git ausgeschlossen.
- beschädigte bestehende JSON-Daten werden nicht still überschrieben.
- Project-Data-Module dürfen keine zweite Persistenz über `localStorage` oder `sessionStorage` anlegen.
- direkte `file://`-Nutzung bleibt möglich; Schreibfunktionen degradieren dort kontrolliert statt einen Serverzugriff vorzutäuschen.
- parallele Datensatzmutationen werden automatisiert auf verlorene Schreibvorgänge geprüft.

### Bewusst noch nicht enthalten

- Backup/Restore, Export/Import und Schemamigrationen; vorgesehen für 0.4.1.
- relationale Feldtypen, Suche/Filter und optionaler SQLite-Adapter.
- echte Browser-E2E-Tests wurden in 0.4.1-E2E ergänzt.
- Cross-OS-CI für Windows/macOS.
- Pointer-/Touch-Resize und Drag & Drop aus dem separaten Workspace-Strang.

## In Entwicklung – 0.3.0 Flexible Workspace Engine

### Vollautomatischer lokaler Start

#### Hinzugefügt

- plattformnahe Einstiege `start.cmd` und `start.sh` für einen Start ohne manuelle Befehlsfolge.
- zentrale Startroutine mit Node-20-Prüfung, bedarfsgesteuerter Auflösung deklarierter Laufzeitpakete, lokal gebundenem Webserver, Portausweichlogik und automatischem Browserstart.
- verständliche Status- und Fehlermeldungen sowie Optionen für einen festen Port und den Start ohne Browser.
- automatische Tests für Optionen, Laufzeitprüfung, Abhängigkeitsentscheidung, sichere Projektpfade und Inhaltstypen.

#### Sicherheits- und Seiteneffektgrenzen

- der Server bindet ausschließlich an `127.0.0.1` und liefert keine Dateien außerhalb des Projektordners aus.
- npm wird nur aufgerufen, wenn `package.json` Laufzeitpakete deklariert und diese lokal fehlen; im aktuellen Stand erfolgen weder Installation noch Download.
- der weiterhin unterstützte direkte Start über `index.html` bleibt unverändert.

### 0.3.0-D3a – Keyboard Resize Preview

#### Hinzugefügt

- `assets/workspace-resize.js` als entkoppelte Eingabeschicht für sichtbaren Resize-Griff und Tastaturbedienung.
- genau ein dynamisch erzeugter Resize-Griff pro Workspace-Panel mit ungefähr 44 × 44 px Trefferfläche.
- zugängliche deutsche Griffbeschriftung und `aria-keyshortcuts` für Pfeile, `Home` und `Escape`.
- flüchtiger Tastatur-Vorschauzustand ohne Zwischen-Speicherung.
- gebündelter Größen-Commit erst nach Freigabe der letzten aktiven Resize-Pfeiltaste.
- `Escape` zum Verwerfen der laufenden Vorschau ohne Persistenz.
- `Home` zum Zurücksetzen ausschließlich der aktuellen Panelgröße.
- logische Responsive-Sperre bis einschließlich 980 px zusätzlich zur visuellen CSS-Sperre.
- neue Tests `tests/workspace-resize.test.mjs` und `tests/workspace-resize-load.test.mjs`.

#### Geändert

- `assets/workspace-ui.js` stellt mit `panelGroesseVorschauAnwenden` dieselbe CSS-Variablen-Darstellung nun auch für nicht persistente Vorschauwerte bereit.
- `assets/workspace-layout.css` ergänzt Griff-, Aktiv- und Vorschau-Darstellung ausschließlich ab 981 px.
- `assets/app.js` initialisiert die Resize-Eingabeschicht erst nach Workspace-State und Workspace-UI.
- `index.html` lädt `workspace-size.js` und `workspace-resize.js` in deterministischer Reihenfolge vor `app.js`.
- interne Entwicklungsphase auf `0.3.0-D3a Keyboard Resize Preview` fortgeschrieben; Produktversion und Workspace-Vertragsversion bleiben unverändert.

#### Validiert

- technischer PR #78 war beim finalen Diff-Check 0 Commits hinter `main` und mergebar.
- GitHub Quality Gate erfolgreich: 56 Dateien geprüft, 48/48 Tests erfolgreich, 0 fehlgeschlagen.
- Squash-Merge: `5e1db3ff65d034b478f4aec032f36c0c3ffb2300`.

#### Bewusst noch nicht enthalten

- keine Pointer-/Maus-/Touch-/Stift-Ziehbedienung
- kein Pointer Capture
- kein Drag & Drop
- keine neue persistente State-Struktur
- keine neue Bibliothek

### Entwicklungsqualität

#### Geändert

- Unerwartete interne Fehler der Qualitätsschranke enden kontrolliert mit Ursache und nächstem Prüfschritt statt mit einem technischen Stapelabdruck.
- Ein automatischer Fehlerfall sichert verständliche Diagnoseausgabe und den Fehler-Exitcode ab.

### 0.3.0-D2 – Resize DOM Application

#### Hinzugefügt

- `assets/workspace-layout.css` als kleine isolierte Desktop-Darstellungsschicht für gespeicherte Panelgrößen.
- CSS-Variablen `--panel-spalten` und `--panel-hoehe` als alleinige Übergabe von Workspace-State an die Darstellung.
- automatische DOM-Tests für gespeicherte Breite, feste Höhe, Rückkehr zu automatischer Höhe und ungültige Darstellungswerte.
- automatische Prüfung des Desktop-CSS-Vertrags und der lokalen Stylesheet-Ladereihenfolge.

#### Geändert

- `assets/workspace-ui.js` überträgt normalisierte Größenwerte auf CSS-Variablen, ohne `grid-column`, `height` oder Browser-Speicherung direkt zu steuern.
- ein nicht persistenter Bereitschaftsmarker aktiviert das Desktop-Overlay nur bei gültiger Breite; ohne gültige Größenübergabe bleibt die bewährte Basisdarstellung erhalten.
- `index.html` lädt das lokale Workspace-Größenstylesheet direkt nach `assets/styles.css`.
- Tablet- und Mobilregeln bleiben unangetastet, weil das neue Overlay ausschließlich ab 981 px aktiv ist.
- Entwicklungsmetadaten auf `0.3.0-D Resize DOM Application` fortgeschrieben.

#### Bewusst noch nicht enthalten

- kein Resize-Griff
- keine Pointer-/Touch-/Stiftsteuerung
- keine Resize-Tastatursteuerung
- keine transiente Resize-Vorschau
- kein Drag & Drop

### 0.3.0-D1 – Resize State & Calculation Foundation

#### Hinzugefügt

- `assets/workspace-size.js` als reine, DOM-freie Größenberechnung für Rasterbreite und Höhe.
- deterministische Rastermetrik mit Berücksichtigung des tatsächlichen Spaltenabstands (`column-gap`).
- symmetrische Rundung horizontaler Bewegungen auf ganze Rastereinheiten.
- Höhenberechnung in festen 24-px-Schritten.
- automatische Tests für Rastermetrik, Grenzen, Rundung und reproduzierbare Ergebnisse.
- zusätzliche State-Tests für Größenänderung, Einzel-Reset und Erhalt von Sichtbarkeit/Reihenfolge.

#### Geändert

- Workspace-State-API um `panelGroesseSetzen` und `panelGroesseZuruecksetzen` erweitert.
- Panel-ID-Prüfung zentralisiert und von Sichtbarkeits- sowie Größenaktionen gemeinsam verwendet.
- Entwicklungsmetadaten auf `0.3.0-D Resize State & Calculation` fortgeschrieben.

#### Bewusst noch nicht enthalten

- keine sichtbare Größenänderung
- kein Resize-Griff
- keine DOM-Anwendung gespeicherter Größen
- keine Pointer-/Touch-/Tastatursteuerung für Resize
- kein Drag & Drop

### Erscheinungsbild nach Referenz

#### Geändert

- Farbwirkung, Ebenen, Schatten und Abstände an eine kompakte Petrol-/Cyan-Kartenoberfläche angeglichen.
- Seitenleiste auf eine schmale, nummerierte Bereichsnavigation verdichtet.
- Kopf-, Schnellstarter-, Panel- und Debugbereiche visuell vereinheitlicht, ohne Funktionen oder Zustandsverträge zu ändern.
- Mobile Darstellung der verdichteten Navigation und Oberflächenrahmung abgesichert.

#### Bewusst nicht enthalten

- keine neuen Fachinhalte oder Module
- keine Änderung an Speicherung oder öffentlichen Schnittstellen
- kein Resize und kein Drag & Drop

### 0.3.0-C – Visibility Controls & Compact Menu

#### Hinzugefügt

- kompakte Schnellstarter-/Menüleiste direkt unter dem oberen Bereich.
- permanenter `Layout`-Schalter außerhalb des veränderbaren Workspace.
- Layout-Menü für alle fünf Kernpanels.
- einzelne Panel-Sichtbarkeit mit automatischer lokaler Speicherung.
- `Alle anzeigen`.
- dauerhaft erreichbarer Befehl `Standardlayout wiederherstellen`.
- Live-Nutzerfeedback für Layoutaktionen.
- `assets/workspace-ui.js` als getrennte DOM- und Bedienlogik ohne eigene Persistenz.
- stabile Zuordnung zwischen Workspace-Vertrag und HTML über `data-workspace-panel` und `data-layout-panel`.
- automatische Workspace-UI-Tests ohne externe Testbibliothek.
- Quality-Gate-Prüfung für Panel-Zuordnung und permanenten Layout-Schalter.
- Teilplan und Patchmanifest für 0.3.0-C.

#### Geändert

- Workspace-State-API um `panelSichtbarkeitSetzen` und `allePanelsAnzeigen` erweitert.
- `assets/app.js` initialisiert die Workspace-UI nach der Zustandsbasis.
- `assets/styles.css` enthält kompakte feste Layoutsteuerung und responsive mobile Option A.
- Sichtbarkeitstests prüfen Erhalt von Reihenfolge und Größenwerten.
- Dokumentation und Entwicklungsmetadaten auf 0.3.0-C fortgeschrieben.

#### Bewusst noch nicht enthalten

- kein Resize
- kein Drag & Drop
- keine Fachmodule

### 0.3.0-B – State Foundation & Autosave/Reset

#### Hinzugefügt

- `assets/workspace-state.js` als versionierte Workspace-Zustandsverwaltung.
- reproduzierbarer Standardzustand für fünf Kernpanels.
- Validierung und Normalisierung für Reihenfolge, Sichtbarkeit, Breite und Höhe.
- robuste lokale Speicherung über `provoware.allin.workspace.main.v1`.
- isolierter Reset auf das Standardlayout.
- Workspace-Logging im Bereich `WORKSPACE`.
- automatische Tests für Normalisierung, beschädigte Daten, Speicherfehler und Reset.
- detaillierter Teilplan und Patchmanifest für 0.3.0-B.

#### Geändert

- `index.html` lädt die Workspace-Zustandsverwaltung vor `assets/app.js`.
- `assets/app.js` initialisiert den Workspace-Zustand und bindet ihn an das vorhandene Logging an.
- `npm run test` führt alle Testdateien aus.
- das Quality Gate prüft die neuen Workspace-Pflichtdateien und die Script-Reihenfolge.
- `AGENTS.md` stärkt Wartbarkeit, Zustandsverwaltung, Entkopplung und Patchtransparenz.

Die freigegebene Produktversion bleibt bis zur vollständigen Abnahme der Workspace Engine bei `0.2.0`.

## 0.2.0 – Module Contract & Registry

### Hinzugefügt

- Modulvertrag mit Vertragsversion `1`.
- Leerer kanonischer Modulkatalog in `modules/registry.js`.
- Laufzeit-Registry mit kontrollierten Zuständen für Laden, Aktivieren, Deaktivieren und Entfernen.
- Registry-Anbindung an das bestehende dreistufige Debugging/Logging.
- Detaillierter Entwicklungsplan für 0.2.0.
- Reproduzierbares Node-20-Quality-Gate ohne installierte npm-Pakete.
- Sicherer Auto-Fix für JSON-Format, Zeilenenden und überflüssige Leerzeichen am Zeilenende.
- Automatischer Modul-Lebenszyklustest mit Node-Bordmitteln.
- GitHub-Actions-Workflow für Pull Requests und `main`.
- `.editorconfig` für einheitliche Textdateien.

### Geändert

- `AGENTS.md` auf kleine, begründete und reproduzierbare Patches mit festem Prüf- und Dokumentationsablauf erweitert.
- `index.html` lädt Modulkatalog und Registry vor der Hauptanwendung.
- `assets/app.js` initialisiert die Registry kontrolliert und leitet Registry-Ereignisse an den Logger weiter.
- README, TODO, Manifest, Logging-, Debugging- und Versionsdokumentation auf 0.2.0 aktualisiert.

### Entfernt

- Nichts.

## 0.1.0 – UI Foundation

### Hinzugefügt

- PROVOWARE ALL-IN 2026 als leere modulare HTML-Oberfläche.
- Responsive Seitenleiste, Kopfbereich und flexible Kartenbereiche.
- Versteckbarer Debugging- und Logging-Bereich.
- Drei Logging-Stufen: Ereignisse, Diagnose und Trace.
- Globale Fehler- und Promise-Erfassung mit begrenztem Speicherpuffer.
- Versionsmetadaten in `VERSION.json`.

### Geändert

- README und TODO auf die neue UI-Baseline aktualisiert.

### Entfernt

- Nichts.
