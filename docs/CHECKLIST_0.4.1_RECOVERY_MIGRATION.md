# CHECKLIST 0.4.1 – Recovery & Migration

## A – Backup

- [x] Backup-Verzeichnis mit festem Projektpfad definieren.
- [x] manuelles Backup implementieren.
- [x] automatisches Backup vor Restore implementieren.
- [x] automatisches Backup vor Import implementieren.
- [x] Backup-Dateinamen gegen Traversal und freie Pfade absichern.
- [x] Backup-Liste mit Zeit, Größe, Revision, Schema und Prüfsumme bereitstellen.
- [x] Rotation auf maximal 10 Backups begrenzen.
- [x] Rotation automatisiert testen.
- [x] beschädigte Live-Rohbytes vor Recovery als Backup erhalten.
- [x] Runtime-Backups aus Git und Auto-Fix ausschließen.

## B – Restore

- [x] Restore-Vorschau implementieren.
- [x] Backup vor Wiederherstellung erneut validieren.
- [x] Restore nur unter gemeinsamer Mutationssperre durchführen.
- [x] vor Restore aktuellen Zustand automatisch sichern.
- [x] atomaren Austausch verwenden.
- [x] Restore an die SHA-256-Prüfsumme der Vorschau binden.
- [x] simulierten Abbruch direkt vor Rename testen.
- [x] bei Abbruch alte Datenbank bytegenau unverändert nachweisen.
- [x] Sicherheitsbackup trotz fehlgeschlagenem Restore nachweisen.
- [x] beschädigtes Backup ablehnen.

## C – Export / Import

- [x] validierten Export erzeugen.
- [x] Import-Vorschau mit Zusammenfassung und Prüfsumme implementieren.
- [x] Import nur nach serverseitiger Validierung zulassen.
- [x] vor Import automatisches Backup erzeugen.
- [x] Import atomar ersetzen.
- [x] beschädigtes JSON ablehnen.
- [x] unbekannte/höhere Schemaversion ablehnen.
- [x] veraltete Vorschau-Prüfsumme ablehnen.
- [x] Recovery-Import aus beschädigter Live-Datei testen.
- [x] beschädigte Live-Rohbytes dabei im Sicherheitsbackup erhalten.

## D – Migration

- [x] deterministische Migrationskette `n -> n+1` implementieren.
- [x] fehlende Migrationsschritte ablehnen.
- [x] Rückwärtsmigration ablehnen.
- [x] Migrationsplan ohne Mutation beschreibbar machen.
- [x] isolierte v1→v2-Testfixture anlegen.
- [x] deterministisches Fixture-Ergebnis nachweisen.
- [x] Produktionsschema ausdrücklich bei v1 belassen.

## E – Recovery-UI

- [x] Modul `data-recovery` registrieren.
- [x] Backup-Button integrieren.
- [x] Backup-Liste und Vorschau integrieren.
- [x] Restore mit expliziter Bestätigung integrieren.
- [x] Export-Download integrieren.
- [x] JSON-Dateiauswahl für Import integrieren.
- [x] Import-Vorschau vor Ausführung integrieren.
- [x] Import mit expliziter Bestätigung integrieren.
- [x] `file://` kontrolliert als nicht schreibfähigen Modus behandeln.
- [x] bestehende Project-Data-Stile wiederverwenden.

## F – Regression / Qualität

- [x] Recovery-Service-Tests ergänzen.
- [x] Recovery-API-Tests ergänzen.
- [x] Recovery-UI-Vertrag testen.
- [x] Failure-Injection direkt im atomaren Schreibpfad testen.
- [x] bestehende 0.4.0-, Workspace-, Registry- und Starttests unverändert weiter ausführen.
- [x] Quality Gate um Recovery-Pflichtdateien erweitern.
- [x] Runtime-Backups explizit aus Quellcode-/Auto-Fix-Walk ausschließen.
- [x] `data-recovery` in das Verbot einer zweiten Browser-Persistenz aufnehmen.
- [x] Linter-Regel für Recovery-Zweitpersistenz automatisiert testen.
- [x] finaler Gate-Lauf auf Node 20 grün.
- [x] finaler Gate-Lauf auf Node 24 grün.
- [x] finaler Gate-Stand: 30 JavaScript-Dateien gelintet, 82 Projektdateien geprüft, 82/82 Tests erfolgreich, 0 fehlgeschlagen.

## G – Dokumentation / Merge

- [x] README aktualisieren.
- [x] TODO aktualisieren.
- [x] CHANGELOG aktualisieren.
- [x] MANIFEST aktualisieren.
- [x] VERSION-Entwicklungsphase aktualisieren; Produktversion bleibt `0.2.0`.
- [x] Plan, Checkpoint und Checkliste angelegt.
- [x] Draft-PR #82 erstellt.
- [x] finalen Diff gegen `main` geprüft: 21 Commits voraus, 0 hinter `main`, 19 begründete Dateien.
- [x] PR mergebar und finalen CI-Lauf vollständig grün bestätigt.
- [x] PR auf `ready for review` gesetzt.
- [x] Squash-Merge durchgeführt: `babdc49367a4fe6b07ce64599fedf23c552ab173`.
- [x] `main` nach Merge geprüft: Registry, VERSION und Recovery-Service vorhanden und konsistent.

## Bewusst nicht Teil von 0.4.1

- [ ] reale Produktionsmigration auf Schema v2 – erst bei echtem v2-Datenvertrag.
- [ ] Firefox-/Chrome-E2E-Gate.
- [ ] Cross-OS-CI für Windows/macOS.
- [ ] Suche/Filter/Vorlagenbibliothek und optionaler Storage-Adapter – 0.4.2.

## Definition of Done

0.4.1 ist für den definierten Iterationsscope abgeschlossen. Die bewusst ausgeschlossenen Punkte sind folgende Härtungs- beziehungsweise Funktionsstufen und keine versteckten Abnahmefehler.
