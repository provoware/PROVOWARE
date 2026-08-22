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

## Aktueller Qualitätsstrang – 0.4.1-E2E Chromium Gate & HTML UI Mirror

Baseline: `7f59c727bcef6b959e3fcc49d7c796b088bc197a`

Arbeitsbranch: `feat/0.4.1-browser-e2e-html-mirror`

Pull Request: `#83`

### A – Chromium-first Browser-E2E

- [x] Playwright als exakt gepinnte Dev-Abhängigkeit einführen.
- [x] Chromium als primäres automatisches Browserprojekt festlegen.
- [x] Firefox ausschließlich als optionalen manuellen Alternativlauf behalten.
- [x] Testserver aus temporärer Projektkopie starten, damit echte Nutzdaten unangetastet bleiben.
- [x] Browserpfad `Start -> Notiz -> Datei -> Vorlage -> Datensatz -> Reload -> Edit -> Backup -> Änderung -> Restore -> Export -> Delete -> Import` automatisieren.
- [x] Browserartefakte, Reports und Fehler-Traces aus Git ausschließen.
- [x] Chromium-Gate bei Pull Requests und `main`-Pushes automatisch ausführen.

### B – HTML-Mirror & Screenshot-Evidenz

- [x] reale `index.html` zweimal laden statt eine Testattrappe nachzubauen.
- [x] Referenz und Spiegel intern exakt auf 1366 × 900 festlegen.
- [x] Spiegel ausschließlich visuell auf Faktor 0,5 skalieren.
- [x] zentrale DOM-Rechtecke zwischen Referenz und Spiegel vergleichen.
- [x] gemessenen Skalierungsfaktor validieren.
- [x] vollständigen Mirror-Screenshot und separaten 683 × 450-Spiegel erzeugen.
- [x] Start-, Datensatz-, Restore- und Import-Screenshots erzeugen.
- [x] Erfolgsartefakt mit sechs PNGs und JSON-Export tatsächlich entpacken und prüfen.

### C – real gefundener UI-Fehler

- [x] erster echter Chromium-Lauf deckte überlappende Data-Studio-/Recovery-Bedienelemente im schmalen Detailpanel auf.
- [x] Project-Data-UI von viewport-basiertem Zwei-Spalten-Verhalten auf container-responsive Darstellung umstellen.
- [x] schmale Modulbreite auf eine Spalte begrenzen; Zwei-Spalten-Modus erst bei ausreichend echter Containerbreite aktivieren.
- [x] Bedienelemente mit Scroll-Abstand zur sticky Schnellleiste härten.
- [x] denselben unveränderten Chromium-E2E-Pfad danach vollständig grün ausführen.

### D – aktuelle Evidenz

- [x] Node 20 Core Quality Gate grün.
- [x] Node 24 Core Quality Gate grün.
- [x] paketfreier Core-Stand: 35 JavaScript-Dateien gelintet, 94 Projektdateien geprüft, 85/85 Node-Tests erfolgreich.
- [x] Chromium: 2/2 echte Browserprüfungen erfolgreich.
- [x] HTML-Mirror: PASS, 1366 × 900 intern, Faktor 0,5, Schlüsselgeometrie identisch.
- [x] Firefox im automatischen Lauf wie vorgesehen übersprungen.
- [ ] finalen Dokumentationsstand erneut durch Core- und Chromium-Gate prüfen.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR #83 auf ready for review setzen und kontrolliert squash-mergen.
- [ ] `main` nach Merge erneut prüfen.

## Nächste Funktionsstufe – 0.4.2 Data Studio PRO

- [ ] Filter- und Suchansicht ergänzen.
- [ ] Vorlagenbibliothek und Vorlagenexport verbessern.
- [ ] bessere Maskenorganisation und Kategorien ergänzen.
- [ ] relationale Feldtypen fachlich definieren.
- [ ] optionalen Storage-Adapter-Vertrag vorbereiten.
- [ ] SQLite nur bei nachgewiesenem Bedarf hinter demselben Datenservice einführen.

## Danach – Cross-OS-/Release-Hardening

- [ ] Linux-Pfade zusätzlich mit expliziten Rechte-/Temp-/Rename-Fällen härten.
- [ ] Windows-CI für Pfadseparatoren, Dateisperren, Rename und Recovery ergänzen.
- [ ] Browser-E2E auf Windows erst nach stabilem Dateisystem-Gate aktivieren.
- [ ] Firefox bei Bedarf als manuellen Kompatibilitätslauf verwenden, nicht als primären Blocker.

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
