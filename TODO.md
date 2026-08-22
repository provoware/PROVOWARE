# TODO

Kanonische Entwicklungsroadmap. Detailhistorie bleibt über Git, CHANGELOG und die versionsbezogenen Checklisten nachvollziehbar. Diese Datei zeigt den aktuellen Stand und die nächsten realen Gates.

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
- [ ] Chromium-first Browserprüfung des Workspace-Pfads ergänzen; Firefox optional gegenprüfen.

## Abgeschlossen – 0.4.0 Project Data Studio

- [x] Entwicklungsnotiz-Schnelleingabe mit Zeitstempel und fester Projekttextdatei.
- [x] zentrale lokale JSON-Datenbank mit atomarer Persistenz und serialisierten Mutationen.
- [x] Eingabemasken-Baukasten und wiederverwendbare Vorlagen.
- [x] Datensätze erstellen, bearbeiten und löschen.
- [x] serverseitige Typ-/Schema-/Same-Origin-Prüfung.
- [x] projektspezifischer Linter und Node-20/24-CI.

PR `#81` · Squash-Merge `20546306a0db98c25a003f4cf96f142aac851d6f`

## Abgeschlossen – 0.4.1 Recovery & Migration

- [x] lokale `.pwbak`-Backups und Rotation auf maximal 10 Sicherungen.
- [x] automatisches Sicherheitsbackup vor Restore und Import.
- [x] SHA-256-gebundene Restore-/Import-Vorschau.
- [x] atomarer Ersatz und Failure-Injection direkt vor Rename.
- [x] Recovery aus beschädigter Live-Datei mit Erhalt der Rohbytes.
- [x] validierter JSON-Export/-Import.
- [x] deterministische Migrationsengine `n -> n+1`; Produktionsschema bleibt v1.
- [x] `v1 -> v2` ausschließlich als isolierte Testfixture.
- [x] Recovery im Lint- und zentralen Quality Gate verankert.

PR `#82` · Squash-Merge `babdc49367a4fe6b07ce64599fedf23c552ab173`

## Abgeschlossen – 0.4.1-E2E Chromium Gate & HTML UI Mirror

- [x] Chromium als automatischen Primärbrowser festgelegt; Firefox bleibt optional.
- [x] echte CRUD-/Recovery-Kette automatisiert.
- [x] proportionalen Mirror `1366 × 900 @ 0,5` aufgebaut.
- [x] Screenshot-/Export-Evidenz eingeführt.
- [x] realen UI-Überlagerungsfehler gefunden und container-responsiv repariert.
- [x] finaler Core-Stand: 35 JavaScript-Dateien, 94 Projektdateien, 87/87 Node-Tests.
- [x] Chromium 2/2, Mirror PASS.

PR `#83` · Squash-Merge `4e0a8fca18e59ff832a79064a91cc3b222e5f4ab`

## Aktueller Funktionsstrang – 0.4.2 Data Studio PRO

Baseline: `acf36db29460b2ce25922aeaf065745c04c59176`

Arbeitsbranch: `feat/0.4.2-data-studio-pro`

Pull Request: `#84`

### A – Architektur / Persistenz

- [x] PRO als Companion-Modul statt CRUD-Monolith aufgebaut.
- [x] `data-studio` unverändert als stabilen CRUD-Editor auf 0.4.0 belassen.
- [x] `data-studio-pro` 0.4.2 für Recherche und Organisation ergänzt.
- [x] kleine `data-studio-pro-bridge` für Navigation und Revisionssynchronisierung ergänzt.
- [x] Project-Data-Produktionsschema ausdrücklich bei Version 1 belassen.
- [x] eigenen PRO-Metadatenvertrag Version 1 definiert.
- [x] feste Runtime-Datei `data/data-studio-pro.json` implementiert.
- [x] atomare PRO-Persistenz über Temp-Datei und Rename implementiert.
- [x] dieselbe zentrale Mutationssperre wie Project Data/Recovery wiederverwendet.
- [x] PRO-Datei und Temp-Dateien aus Git, Auto-Fix und statischer Auslieferung ausgeschlossen.
- [x] Same-Origin-geschützte PRO-API integriert.
- [x] beschädigte PRO-Datei wird nicht still überschrieben.

### B – Suche / Filter / Sortierung

- [x] Datensatz-Volltextsuche über Feldbezeichnungen und sichtbare Werte ergänzt.
- [x] Filter nach Vorlage ergänzt.
- [x] Filter nach Kategorie ergänzt.
- [x] Trefferzahl und Nulltrefferanzeige ergänzt.
- [x] Sortierung nach Aktualisierung neu→alt / alt→neu ergänzt.
- [x] Sortierung nach Erstellung neu→alt / alt→neu ergänzt.

### C – Kategorien / Vorlagenbibliothek

- [x] frei benennbare Kategorien ergänzt.
- [x] case-insensitive doppelte Kategorienamen serverseitig verhindert.
- [x] Vorlagen einer Kategorie zuweisbar und wieder lösbar gemacht.
- [x] Kategorie löschen ohne Vorlagenverlust implementiert.
- [x] Bibliothek mit Name, Kategorie, Feldanzahl und Datensatzanzahl ergänzt.
- [x] Bibliothek nach Text und Kategorie filterbar gemacht.
- [x] Vorlagen über die PRO-Brücke im bestehenden Editor öffnbar gemacht.

### D – Gespeicherte Ansichten

- [x] benannte Ansicht serverseitig speichern.
- [x] Vorlage, Kategorie, Suchtext und Sortierung speichern.
- [x] gespeicherte Ansicht anwenden.
- [x] gespeicherte Ansicht löschen.
- [x] doppelte Namen case-insensitiv verhindern.
- [x] Ansicht über Reload hinweg erhalten.
- [x] keine Datensatzkopien in Ansichten speichern.

### E – Vorlagenexport

- [x] gewählte Vorlage als JSON exportieren.
- [x] Formatkennung `provoware-data-studio-template` und Formatversion 1 verwenden.
- [x] Kategorie optional mitgeben.
- [x] Datensätze bewusst nicht in Vorlagenexport aufnehmen.
- [x] sicheren Dateinamen aus Vorlagenname ableiten.

### F – Regression / Browser

- [x] PRO-Service-Tests für Kategorien, Zuweisungen, Views und atomare Persistenz ergänzt.
- [x] Failure-Injection direkt vor PRO-Rename ergänzt und bytegenauen Erhalt nachgewiesen.
- [x] API-Tests für Routing, Same-Origin, Referenzen und Validierung ergänzt.
- [x] UI-/Registry-/Bridge-Vertragstests ergänzt.
- [x] Browser-Zweitpersistenz-Verbot explizit auf PRO erweitert und getestet.
- [x] PRO im zentralen Quality Gate als Pflichtbestandteil verankert.
- [x] Chromium-E2E um Kategorie, Bibliothek, Suche, View, Export und Reload erweitert.
- [x] HTML-Mirror wartet auf PRO und vergleicht dessen Geometrie mit.
- [x] erster kompletter Core-Gate: Node 20 + Node 24 PASS, 41 JavaScript-Dateien, 103 Projektdateien, 101/101 Node-Tests.
- [x] erster kompletter Browser-Gate: Chromium 3/3 PASS, Firefox wie vorgesehen übersprungen.
- [x] Browserartefakt `9476750307`, SHA-256 `f2eee6beb9baec81126885ce23c8543070afec0fae088045d104cd68a8628f99`.
- [x] Artefakt tatsächlich geprüft: sieben PNGs, Project-Data-Export, Vorlagenexport und Playwright-Report.

### G – Dokumentation / Abschluss

- [x] Plan, Baseline-Checkpoint und Checkliste angelegt.
- [x] VERSION auf 0.4.2-Entwicklungsstufe aktualisiert; Produktversion bleibt 0.2.0.
- [x] README auf Funktionen, Verträge, E2E und Recovery-Grenze synchronisiert.
- [ ] TODO, CHANGELOG, MANIFEST und Checkliste abschließend synchronisieren.
- [ ] finalen Dokumentationsstand erneut durch Node 20/24 und Chromium prüfen.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR #84 auf ready for review setzen und kontrolliert squash-mergen.
- [ ] `main` nach Merge prüfen.

### Bewusst nicht Teil von 0.4.2

- [ ] relationale Feldtypen – eigener späterer Datenmodellvertrag.
- [ ] Template-Import – erst nach eigenem Konflikt-/ID-Vertrag.
- [ ] SQLite-Adapter – nur bei nachgewiesenem Bedarf.
- [ ] gemeinsame Recovery-Hülle für `project-data.json` + `data-studio-pro.json` – eigener versionierter Folgeschritt.

## Nächster Qualitätsstrang – Cross-OS-/Release-Hardening

- [ ] Linux-Rechte, Temp-Verzeichnisse und Rename-/Lock-Fehler systematisch injizieren.
- [ ] Windows-CI für Pfadseparatoren, Dateisperren, atomaren Ersatz und Recovery ergänzen.
- [ ] Verhalten von Temp-Dateien und Cleanup auf realen Plattformen vergleichen.
- [ ] Chromium-E2E auf Windows erst nach stabilem Dateisystem-Gate aktivieren.
- [ ] Firefox bei Bedarf als manuellen Kompatibilitätslauf verwenden, nicht als primären Blocker.

## Optional danach – 0.4.3 Recovery Envelope

- [ ] gemeinsamen, versionierten Backup-/Restore-Vertrag für Project Data und PRO-Metadaten fachlich definieren.
- [ ] keine stillschweigende Änderung des bestehenden `.pwbak`-Formats vornehmen.

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
