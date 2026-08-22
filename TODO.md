# TODO

Kanonische Entwicklungsroadmap. Abgeschlossene Detailhistorie bleibt über Git, CHANGELOG und die versionsbezogenen Checklisten nachvollziehbar; diese Datei zeigt den aktuellen Arbeitsstand und die nächsten realen Gates.

## Freigegebene Basis

### 0.1.0 – UI Foundation

- [x] modulare HTML-Oberfläche, responsives Dark-/Petrol-Layout und Debugging/Logging.

### 0.2.0 – Module Contract & Registry

- [x] Modulvertrag Version 1, Registry-Lifecycle, Quality Gate, GitHub Actions und semantikneutraler Auto-Fix.

Release-Merge: `64b7f232acd13535133ee5f0a5e3322cbae7e0ba`

## Paralleler Workspace-Strang – 0.3.0 Flexible Workspace Engine

### Abgeschlossen

- [x] 0.3.0-A – Workspace-Vertrag.
- [x] 0.3.0-B – State Foundation & Autosave/Reset.
- [x] 0.3.0-C – Visibility Controls.
- [x] 0.3.0-D1 – State-API und Größenberechnung.
- [x] 0.3.0-D2 – DOM-Anwendung über CSS-Variablen.
- [x] 0.3.0-D3a – Resize-Griff und Tastatur-Vorschau.

### Offen – 0.3.0-D3b / E / F / G

- [ ] Pointer/Maus/Touch/Stift über denselben Resize-Griff ergänzen.
- [ ] Pointer Capture, Preview, Commit und Abbruch automatisiert testen.
- [ ] Reorder & Drag and Drop erst nach grünem D3b beginnen.
- [ ] Responsive/Accessibility-Hardening durchführen.
- [ ] Firefox-Endabnahme und Chrome-Kompatibilitätsprobe durchführen.

## Abgeschlossen – 0.4.0 Project Data Studio

- [x] Entwicklungsnotiz-Schnelleingabe mit Zeitstempel und fester Projekttextdatei.
- [x] zentrale lokale JSON-Datenbank mit atomarer Persistenz und serialisierten Mutationen.
- [x] Eingabemasken-Baukasten und wiederverwendbare Vorlagen.
- [x] Datensätze erstellen, bearbeiten und löschen.
- [x] serverseitige Typ-/Schema-/Same-Origin-Prüfung.
- [x] projektspezifischer Linter und Node-20/24-CI.
- [x] 66/66 Tests im finalen 0.4.0-Branch-Gate.

PR: `#81`

Squash-Merge: `20546306a0db98c25a003f4cf96f142aac851d6f`

## Abgeschlossen – 0.4.1 Recovery & Migration

Baseline: `a3f6f17d3e9c50bb83392588b6eec17ba8fb9d8f`

Arbeitsbranch: `feat/0.4.1-recovery-migration`

Pull Request: `#82`

Squash-Merge: `babdc49367a4fe6b07ce64599fedf23c552ab173`

### A – Backup & Rotation

- [x] feste Backup-Ablage `data/backups/project-data/` definieren.
- [x] Recovery-Artefakte mit `.pwbak` vom Quellcode-/JSON-Auto-Fix entkoppeln.
- [x] manuelles Backup implementieren.
- [x] automatisches Sicherheitsbackup vor Restore implementieren.
- [x] automatisches Sicherheitsbackup vor Import implementieren.
- [x] Backup-IDs mit festem Muster statt frei wählbaren Pfaden absichern.
- [x] SHA-256, Größe, Schema, Revision sowie Vorlagen-/Datensatzanzahl erfassen.
- [x] Rotation auf maximal 10 Backups begrenzen und testen.
- [x] Backup-Verzeichnis gegen statische Auslieferung schützen und aus Git ausschließen.

### B – Restore / Failure Injection

- [x] Restore-Vorschau und SHA-256-Bindung implementieren.
- [x] Restore unter derselben Mutationssperre wie CRUD ausführen.
- [x] aktuellen Zustand vor Restore automatisch sichern.
- [x] atomaren Temp-Datei-zu-Rename-Pfad wiederverwenden.
- [x] Failpoint direkt vor Rename ergänzen.
- [x] simulierten Schreibabbruch testen.
- [x] bei Abbruch bytegenau unveränderte Live-Daten nachweisen.
- [x] Sicherheitsbackup trotz fehlgeschlagenem Restore nachweisen.

### C – Export / Import

- [x] validierten JSON-Export implementieren.
- [x] Importdatei auswählen und serverseitig prüfen.
- [x] Schemastand, Inhaltszusammenfassung und SHA-256 vor Import anzeigen.
- [x] Import an die Vorschau-Prüfsumme binden.
- [x] aktuellen Rohzustand vor Import automatisch sichern.
- [x] beschädigte Live-Datei als Rohbytes sichern und danach Recovery-Import erlauben.
- [x] beschädigtes Import-JSON, unbekannte Schemaversion und veraltete Prüfsumme ablehnen.

### D – Migration

- [x] deterministische Migrationskette `n -> n+1` implementieren.
- [x] fehlende Migrationsschritte und Rückwärtsmigration ablehnen.
- [x] Migrationsplan ohne Mutation beschreibbar machen.
- [x] isolierte `v1 -> v2`-Testfixture implementieren und Determinismus nachweisen.
- [x] Produktionsschema ausdrücklich bei Version 1 belassen.

### E – Recovery-UI

- [x] Modul `data-recovery` Version `0.4.1` registrieren.
- [x] Backup-Liste, Backup-Erstellung und Restore-Vorschau integrieren.
- [x] Restore erst nach expliziter Bestätigung ausführen.
- [x] JSON-Export, Dateiauswahl und Import-Vorschau integrieren.
- [x] Import erst nach expliziter Bestätigung ausführen.
- [x] `file://` kontrolliert in nicht schreibfähigen Modus degradieren.

### F – Regression / Qualität

- [x] Recovery-Service-, API- und UI-Tests ergänzen.
- [x] Failure-Injection direkt im atomaren Schreibpfad testen.
- [x] bestehende 0.4.0-, Workspace-, Registry- und Starttests unverändert weiter ausführen.
- [x] Recovery als Pflichtbestandteil im zentralen Quality Gate verankern.
- [x] Runtime-Backups aus Quellcode-/Auto-Fix-Walk ausschließen.
- [x] `data-recovery` in das Verbot einer zweiten Browser-Persistenz aufnehmen und testen.
- [x] finaler GitHub-Actions-Lauf auf Node 20 und Node 24 vollständig grün.
- [x] finaler Gate-Stand: 30 JavaScript-Dateien gelintet, 82 Projektdateien geprüft, 82/82 Tests erfolgreich, 0 fehlgeschlagen.
- [x] finaler Diff: 21 Commits voraus, 0 hinter `main`, 19 begründete Dateien.

### G – Dokumentation / Abschluss

- [x] Plan, Checkpoint und Checkliste angelegt.
- [x] README, TODO, CHANGELOG, MANIFEST und VERSION synchronisiert.
- [x] PR #82 auf `ready for review` gesetzt.
- [x] PR #82 kontrolliert per Squash gemergt.
- [x] `main` nach Merge auf Registry, VERSION und Recovery-Service geprüft.

## Nächste Funktionsstufe – 0.4.2 Data Studio PRO

- [ ] Filter- und Suchansicht ergänzen.
- [ ] Vorlagenbibliothek und Vorlagenexport verbessern.
- [ ] bessere Maskenorganisation und Kategorien ergänzen.
- [ ] relationale Feldtypen fachlich definieren.
- [ ] optionalen Storage-Adapter-Vertrag vorbereiten.
- [ ] SQLite nur bei nachgewiesenem Bedarf hinter demselben Datenservice einführen.

## Parallel nächstes Qualitätsgate – Browser E2E

- [ ] Firefox-first: Start -> Notiz -> Vorlage -> Datensatz -> Reload -> Edit -> Delete -> Backup -> Restore -> Import automatisieren.
- [ ] danach Chrome-Kompatibilitätslauf.
- [ ] Cross-OS-CI für Windows/macOS nach Stabilisierung der Datenpfade ergänzen.

## Danach – 0.5.0 Diagnose Foundation PRO

- [ ] Logging nach Bereichen und Stufen filterbar machen.
- [ ] Zeitmessung und Laufzeitkontext ergänzen.
- [ ] kontrollierten Fehlerkontext strukturieren.
- [ ] datensparsamen Diagnosebericht exportierbar machen.

## Langfristig

- [ ] reale Schema-v2-Migration erst entwickeln, wenn ein tatsächlicher v2-Datenvertrag benötigt wird.
- [ ] Modulzustände nur bei realem Bedarf lokal speichern.
- [ ] Berechtigungsmodell erst mit einem echten privilegierten Modul entwerfen.
- [ ] keine Remote-Plugin-Installation ohne eigenes Sicherheitskonzept einführen.
