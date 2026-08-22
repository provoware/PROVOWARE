# TODO

Kanonische Entwicklungsroadmap. Abgeschlossene Detailhistorie bleibt über Git/CHANGELOG nachvollziehbar; diese Datei zeigt den aktuellen Arbeitsstand und die nächsten realen Gates.

## Freigegebene Basis

### 0.1.0 – UI Foundation

- [x] modulare HTML-Oberfläche, responsives Dark-/Petrol-Layout und Debugging/Logging aufbauen.
- [x] Versionsmetadaten und stabile UI-Basis anlegen.

### 0.2.0 – Module Contract & Registry

- [x] Modulvertrag Version 1 definieren.
- [x] Registry-Lifecycle implementieren.
- [x] reproduzierbares Quality Gate und GitHub Actions einführen.
- [x] semantikneutralen Auto-Fix einführen.
- [x] PR #62 mergen und `main` prüfen.

Release-Merge: `64b7f232acd13535133ee5f0a5e3322cbae7e0ba`

## Paralleler Workspace-Strang – 0.3.0 Flexible Workspace Engine

Die Workspace-Basis bleibt aktiv. 0.4.0 Project Data Studio verändert deren persistente Verträge nicht.

### Abgeschlossen

- [x] 0.3.0-A – Workspace-Vertrag.
- [x] 0.3.0-B – State Foundation & Autosave/Reset.
- [x] 0.3.0-C – Visibility Controls und kompakte Layoutsteuerung.
- [x] 0.3.0-D1 – State-API und reine Größenberechnung.
- [x] 0.3.0-D2 – DOM-Anwendung über CSS-Variablen.
- [x] 0.3.0-D3a – Resize-Griff und Tastatur-Vorschau.

Wichtige Merges:

- 0.3.0-B: `069ad34f2b869fb91dc1c7726cb5903431863cfb`
- 0.3.0-C: `dce166770cf589a8fb9720cb3c0a650c19151cd9`
- 0.3.0-D1: `1de0999cd570c612a80649cfe4975d8531947935`
- 0.3.0-D2: `249df54ec13fa632f74400897dd3d83da3332bcb`
- 0.3.0-D3a: `5e1db3ff65d034b478f4aec032f36c0c3ffb2300`

### Offen – 0.3.0-D3b Pointer/Maus/Touch/Stift

- [ ] vorhandenen Resize-Griff für Pointer Events wiederverwenden.
- [ ] `pointerdown` kontrolliert starten und Pointer Capture robust verwalten.
- [ ] `pointermove` ausschließlich als transiente Vorschau verarbeiten.
- [ ] Rastermetrik und bestehende D1-Größenberechnung wiederverwenden.
- [ ] während der Bewegung weder speichern noch pro Bewegung loggen.
- [ ] `pointerup` auf höchstens einen validierten Commit begrenzen.
- [ ] `pointercancel` und `Escape` ohne Persistenz behandeln.
- [ ] Maus, Touch und Stift über dieselbe Pointer-Logik abdecken.
- [ ] Resize bis 980 px weiter deaktiviert halten.
- [ ] Pointer-/Capture-/Commit-/Abbruchtests ergänzen.

### Danach – 0.3.0-E/F/G

- [ ] Reorder & Drag and Drop erst nach grünem D3b beginnen.
- [ ] Tastaturalternative und Drag-Abbruch ohne Zustandsverlust sicherstellen.
- [ ] Responsive/Accessibility-Hardening durchführen.
- [ ] Firefox-Endabnahme und Chrome-Kompatibilitätsprobe durchführen.
- [ ] Workspace-Release-Gate vollständig grün abschließen.

## Aktuelle Iteration – 0.4.0 Project Data Studio

Baseline: `6fd1123122cca0c69fd50bdbf69ef2186cc930d0`

Arbeitsbranch: `feat/0.4.0-project-data-studio`

Pull Request: `#81`

### A – Entwicklungsnotizen

- [x] feste Projektdatei `data/ENTWICKLUNGSNOTIZEN.txt` anlegen.
- [x] einzeiliges Eingabefeld in die Dashboard-Schnellstarterleiste integrieren.
- [x] Speichern über `Enter` und Button auf denselben Submit-Pfad legen.
- [x] lokalen Zeitstempel `YYYY-MM-DD HH:mm:ss` serverseitig erzeugen.
- [x] Eingabe trimmen, Zeilenumbrüche normalisieren und Länge begrenzen.
- [x] Link `Datei öffnen` integrieren.
- [x] `file://`-Start erhalten und Schreibfunktion dort kontrolliert deaktivieren.

### B – Zentrale Projektdatenbank

- [x] versionierten JSON-Vertrag mit `schemaVersion`, `revision`, `templates[]` und `records[]` implementieren.
- [x] feste Laufzeitdatei `data/project-data.json` definieren.
- [x] Laufzeitdatenbank und temporäre Austauschdateien aus Git ausschließen.
- [x] direkte statische Auslieferung der Datenbank blockieren.
- [x] atomaren Dateiaustausch implementieren.
- [x] Mutationen innerhalb des lokalen Servers serialisieren.
- [x] beschädigtes JSON erkennen und nicht still überschreiben.
- [x] serverseitige Payload-, Typ- und Schema-Prüfung implementieren.
- [x] Same-Origin-Schutz für Browser-API-Aufrufe implementieren.

### C – Eingabemasken-Baukasten

- [x] Vorlagen erstellen.
- [x] Vorlagen erneut laden und bearbeiten.
- [x] Felder hinzufügen und entfernen.
- [x] Feldtyp `Text` unterstützen.
- [x] Feldtyp `Mehrzeiliger Text` unterstützen.
- [x] Feldtyp `Zahl` unterstützen.
- [x] Feldtyp `Datum` unterstützen.
- [x] Feldtyp `Checkbox` unterstützen.
- [x] Feldtyp `Auswahlliste` mit frei definierbaren Optionen unterstützen.
- [x] Pflichtfelder unterstützen.
- [x] inkompatible Vorlagenänderungen bei bestehenden Datensätzen blockieren.

### D – Datensatzverwaltung

- [x] Datensätze erstellen.
- [x] Datensätze anzeigen.
- [x] Datensätze bearbeiten.
- [x] Datensätze löschen.
- [x] Werte bei jedem Schreibvorgang serverseitig gegen die Vorlage validieren.
- [x] parallele Mutationen automatisiert auf verlorene Schreibvorgänge testen.

### E – Lint, Format und Regression

- [x] `npm run lint` als eigenen projektspezifischen Lint-Gate ergänzen.
- [x] dynamische Codeausführung, externe absolute `fetch`-Ziele und unsichere Serverbindung prüfen.
- [x] zweite Browser-Persistenz in Project-Data-Modulen verbieten.
- [x] `npm run verify` auf `Lint -> Quality Gate -> Tests` erweitern.
- [x] bestehende Workspace-Regressionstests unverändert weiter ausführen.
- [x] API-, Daten-, UI- und Linter-Tests ergänzen.
- [x] beschädigte Datenbank als Failure-Probe testen.
- [x] parallele Datensatzmutationen als Failure-/Concurrency-Probe testen.
- [x] lokale Laufzeitdatenbank explizit vom Auto-Fix ausschließen.
- [x] GitHub Actions von v4 auf aktuelle v7-Actions aktualisieren.
- [x] CI-Matrix auf Node 20 und Node 24 erweitern.
- [ ] finalen CI-Lauf auf beiden Node-Versionen vollständig grün bestätigen.
- [ ] finalen PR-Diff gegen `main` auf ausschließlich begründete Änderungen prüfen.

### F – Dokumentation und Abschluss

- [x] `docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md` anlegen.
- [x] `docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md` anlegen.
- [x] `docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md` anlegen.
- [x] README auf 0.4.0-Funktion und Grenzen aktualisieren.
- [x] TODO auf die reale Roadmap aktualisieren und Versionskonflikt mit der früher geplanten Diagnose-Stufe beseitigen.
- [ ] CHANGELOG aktualisieren.
- [ ] MANIFEST aktualisieren.
- [x] VERSION-Entwicklungsmetadaten aktualisieren; Produktversion bleibt `0.2.0`.
- [ ] PR #81 nach grünem Gate auf „ready for review“ setzen.
- [ ] PR #81 kontrolliert mergen.
- [ ] `main` nach Merge erneut prüfen.

## Nächste Project-Data-Stufe – 0.4.1 Recovery & Migration

- [ ] Backup vor Datenbankersatz definieren und implementieren.
- [ ] Backup-Rotation mit klarer Obergrenze festlegen.
- [ ] Restore-Vorschau und kontrollierte Wiederherstellung implementieren.
- [ ] Export/Import mit Schema-Prüfung ergänzen.
- [ ] beschädigte Datei, Schreibabbruch und Recovery als Failure-Injection automatisieren.
- [ ] Schema-Migrationsvertrag für zukünftige Versionen definieren.
- [ ] Migration `v1 -> v2` zuerst als Testfixture entwickeln, bevor ein echtes v2-Schema eingeführt wird.

## Danach – 0.4.2 Data Studio PRO

- [ ] Filter- und Suchansicht ergänzen.
- [ ] relationale Feldtypen fachlich definieren.
- [ ] optionalen Storage-Adapter-Vertrag vorbereiten.
- [ ] SQLite nur bei nachgewiesenem Bedarf hinter demselben Datenservice einführen.
- [ ] Vorlagenexport und Vorlagenbibliothek ergänzen.

## Danach – 0.5.0 Diagnose Foundation PRO

Die früher als `0.4.0` geplante Diagnose-Stufe wird wegen des jetzt belegten Project-Data-Releases sauber auf `0.5.0` verschoben.

- [ ] Logging nach Bereichen und Stufen filterbar machen.
- [ ] Zeitmessung und Laufzeitkontext ergänzen.
- [ ] kontrollierten Fehlerkontext strukturieren.
- [ ] datensparsamen Diagnosebericht exportierbar machen.
- [ ] Export vor Speicherung auf sensible oder unnötige Daten begrenzen.

## Langfristig

- [ ] Modulzustände nur bei realem Bedarf lokal speichern.
- [ ] Berechtigungsmodell erst mit einem echten privilegierten Modul entwerfen.
- [ ] keine Remote-Plugin-Installation ohne eigenes Sicherheitskonzept einführen.
- [ ] Browser-E2E-Tests für Firefox und Chrome als Release-Gate etablieren.
- [ ] Cross-OS-CI erst nach Stabilisierung der lokalen Datenpfade auf Windows/macOS erweitern.
