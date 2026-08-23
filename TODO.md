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
- [x] 0.3.0-D3b – Pointer/Maus/Touch/Stift über denselben Resize-Griff mit 4-px-Bewegungsschwelle.
- [x] D3b – Pointer Capture, transiente Vorschau, genau ein Commit und sauberer Abbruch automatisiert geprüft.
- [x] D3b – Desktop-Proportionen, Vertrags-Mindesthöhen, adaptive Abstände und statische Lichtwirkung harmonisiert.

D3b: PR `#94` · Squash-Merge `bf833fe50acbecc8d7d8e22a2bf8d4434cc0dee4` · Quality Gate Node 20/24 PASS · `147/147` Node-Tests PASS.

### Offen – 0.3.0-E / F / G

- [ ] Reorder & Drag and Drop mit eigenem Drag-Griff entwickeln; Resize-Griff bleibt ausschließlich für Größenänderung zuständig.
- [ ] Nur die Panel-Reihenfolge persistieren; keine freien x/y-Pixelkoordinaten einführen.
- [ ] Responsive/Accessibility-Hardening durchführen.
- [ ] Das bereits vorhandene manuelle Browser-E2E-Release-Gate erst zur gebündelten Abnahme ausführen; Chromium primär, Firefox optional.

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

- [x] Chromium als Primärbrowser festgelegt; Firefox bleibt optional.
- [x] echte CRUD-/Recovery-Kette automatisiert.
- [x] proportionalen Mirror `1366 × 900 @ 0,5` aufgebaut.
- [x] Screenshot-/Export-Evidenz eingeführt.
- [x] realen UI-Überlagerungsfehler gefunden und container-responsiv repariert.
- [x] finaler Core-Stand: 35 JavaScript-Dateien, 94 Projektdateien, 87/87 Node-Tests.
- [x] Chromium 2/2, Mirror PASS.
- [x] Browser-E2E später aus normalen PR-/main-Läufen in ein manuelles Release-/Abnahme-Gate verschoben.

PR `#83` · Squash-Merge `4e0a8fca18e59ff832a79064a91cc3b222e5f4ab`

## Abgeschlossen – 0.4.2 Data Studio PRO

PR `#84` · Squash-Merge `d22a4ba51a970966b8f0242186094fb894e14356`

- [x] PRO als Companion-Modul statt CRUD-Monolith aufgebaut.
- [x] Project-Data-Produktionsschema bei Version 1 belassen.
- [x] getrennten PRO-Metadatenvertrag Version 1 unter `data/data-studio-pro.json` eingeführt.
- [x] Volltextsuche, Vorlagen-/Kategorienfilter und vier Sortierungen ergänzt.
- [x] Kategorien und Vorlagenbibliothek ergänzt.
- [x] gespeicherte Ansichten mit Reload-Persistenz ergänzt.
- [x] Vorlagenexport als versioniertes JSON ohne Datensätze ergänzt.
- [x] PRO-Bridge für Navigation und Revisionssynchronisierung ergänzt.
- [x] Same-Origin, atomare Persistenz, Failure-Injection und Zweitpersistenz-Verbot getestet.
- [x] finaler Core-Gate: Node 20 + Node 24 PASS, 41 JavaScript-Dateien, 103 Projektdateien, 101/101 Node-Tests.
- [x] finaler Browser-Gate: Chromium 3/3 PASS.
- [x] finales Browserartefakt `9476846607`, SHA-256 `afb421a42d6e5a0d83a36940297a7598b49e9f35445ec56096604163a986a4e4`.

### Bewusst nicht Teil von 0.4.2

- [ ] relationale Feldtypen – eigener späterer Datenmodellvertrag.
- [ ] Template-Import – erst nach eigenem Konflikt-/ID-Vertrag.
- [ ] SQLite-Adapter – nur bei nachgewiesenem Bedarf.
- [x] gemeinsame Recovery-Hülle für `project-data.json` + `data-studio-pro.json` – in 0.4.3 als eigener versionierter Vertrag umgesetzt.

## Abgeschlossen – 0.4.2-H1 Persistence Portability Foundation

PR `#85` · Squash-Merge `b25b9e424b7445e1a8444aefde456744fcf42587`

Synchronisierte Baseline vor Merge: `9794828aa4dbe95d3a97bf6541fca008956c2056`

### Gemeinsamer Atomic-Replace-Vertrag

- [x] zentrale Schicht `scripts/atomic-file.mjs` eingeführt.
- [x] Temp-Datei immer im selben Verzeichnis wie das Ziel erzeugen.
- [x] Temp-Datei exklusiv mit `wx` anlegen.
- [x] Inhalt vor Rename über `FileHandle.sync()` synchronisieren.
- [x] keinen Datenverlust-Fallback `unlink(ziel) -> rename(temp,ziel)` verwenden.
- [x] Ersatz bei permanentem Fehler fail-closed abbrechen und Live-Datei erhalten.
- [x] Cleanup-Fehler dürfen den Primärfehler nicht verdecken.
- [x] fremde Temp-Dateien bei `EEXIST` nicht löschen.

### Windows-/Linux-Portabilität

- [x] begrenzte Windows-Retries ausschließlich für `EPERM`, `EACCES` und `EBUSY` implementieren.
- [x] Retry-Limit und nicht-transiente Fehler testen.
- [x] `Persistence Portability Gate` auf Ubuntu + Windows mit Node 20 einführen.
- [x] Ubuntu-Portability real: PASS.
- [x] Windows-Portability real: PASS.

### Integration

- [x] `writeProjectDatabaseAtomic()` auf dieselbe zentrale Schicht umstellen.
- [x] `writeDataStudioProAtomic()` auf dieselbe zentrale Schicht umstellen.
- [x] bestehende `beforeRename`-Failure-Hooks kompatibel halten.
- [x] Recovery-Service, APIs, Browser-UI und Workspace unverändert lassen.
- [x] Project-Data-Schema v1 unverändert lassen.
- [x] Data-Studio-PRO-Schema v1 unverändert lassen.
- [x] bestehendes `.pwbak`-Format unverändert lassen.

### Finale Evidenz

- [x] Node 20: PASS.
- [x] Node 24: PASS.
- [x] Project Lint: 44 JavaScript-Dateien.
- [x] Quality Gate: 110 Projektdateien.
- [x] Node Tests: 114/114 PASS, 0 Fehler.
- [x] Ubuntu Portability: PASS.
- [x] Windows Portability: PASS.
- [x] Chromium: 3/3 PASS.
- [x] Firefox im automatischen Lauf wie vorgesehen übersprungen.
- [x] Browser-Evidenzartefakt `9477830587`.
- [x] Artefakt-SHA-256 `fed02b407da6e9916d4423aed94da8d03e581f3d8e99f5db7e049355f6c84d52`.
- [x] finaler Diff vor Merge: 1 Commit voraus, 0 hinter `main`, 10 begründete Dateien.

## Abgeschlossen – 0.4.3 Recovery Envelope

PR `#87` · Merge `b1bf3a24b30cb18df693b46a26953de8bc9aef18`

Ziel: Project Data und PRO-Metadaten gemeinsam sichern und wiederherstellen, **ohne** das bestehende `.pwbak`-Format still umzudeuten.

### A – Neues Envelope-Format

- [x] explizite Formatkennung `provoware-recovery-envelope` und `formatVersion: 1` definiert.
- [x] Project Data und PRO-Metadaten als getrennte Komponenten aufgenommen.
- [x] pro Komponente Rohbytes/Base64, SHA-256, Byte-Länge, Gültigkeitsstatus und Schema-Metadaten erfasst.
- [x] fehlende oder beschädigte Komponenten als Zustand dokumentiert statt still normalisiert.
- [x] Gesamt-Envelope mit eigener SHA-256-Prüfsumme gebunden.
- [x] Rotation auf maximal zehn `.pwenvelope`-Sicherungen umgesetzt.

### B – Rückwärtskompatibilität

- [x] bestehende `.pwbak`-Backups vollständig lesbar gehalten.
- [x] Legacy-`.pwbak` bleibt Ein-Komponenten-Recovery für Project Data.
- [x] bestehende 0.4.1-Backups werden niemals automatisch umgeschrieben.

### C – Restore-Vorschau / Journal

- [x] Restore-Vorschau auf Envelope-Ebene mit Komponentenstatus und Prüfsummen aufgebaut.
- [x] Vorschau per SHA-256 an die spätere Ausführung gebunden.
- [x] Restore-Journal mit eindeutigen Stufen und Wiederanlaufzuständen eingeführt.
- [x] Multi-Datei-Restore ausschließlich über die 0.4.2-H1-Atomic-Schicht ausgeführt.
- [x] Safety-Envelope vor jedem gemeinsamen Restore erzeugt.
- [x] beide Live-Komponenten nach Restore erneut verifiziert.

### D – Rollback / Failure Injection

- [x] Fehler vor erster Komponente simuliert.
- [x] Fehler zwischen Project Data und PRO simuliert.
- [x] Fehler nach zweiter Komponente vor Verifikation simuliert.
- [x] Rollback-Fehler separat simuliert.
- [x] deterministischen Wiederanlauf aus liegengebliebenem Journal nachgewiesen.
- [x] gemischten, unjournalisierten Live-Zustand ausgeschlossen.

### E – Abnahme

- [x] Node 20 + Node 24: PASS.
- [x] Project Lint: 49 JavaScript-Dateien.
- [x] Quality Gate: 118 Projektdateien.
- [x] Node Tests: 131/131 PASS, 0 Fehler.
- [x] Ubuntu Persistence Portability: PASS.
- [x] Windows Persistence Portability: PASS.
- [x] Chromium auf 4/4 erweitert: PASS.
- [x] Firefox im automatischen Lauf wie vorgesehen übersprungen.
- [x] Browser-Evidenzartefakt `9481363211`.
- [x] Artefakt-SHA-256 `a4e897f6a594fd126d9c19f5a72bb2416a5b0f7de14ec1ab285afbb231839566`.
- [x] HTML-Mirror nach asynchroner Stabilisierung: PASS, intern 1366 × 900, Skalierung 0,5, keine Geometrieabweichungen.

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
