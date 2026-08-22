# CHECKLIST 0.4.1 – Recovery & Migration

## A – Backup

- [ ] Backup-Verzeichnis mit festem Projektpfad definieren.
- [ ] manuelles Backup implementieren.
- [ ] automatisches Backup vor Restore implementieren.
- [ ] automatisches Backup vor Import implementieren.
- [ ] Backup-Dateinamen gegen Traversal und freie Pfade absichern.
- [ ] Backup-Liste mit Zeit, Größe, Revision, Schema und Prüfsumme bereitstellen.
- [ ] Rotation auf maximal 10 Backups begrenzen.
- [ ] Rotation automatisiert testen.

## B – Restore

- [ ] Restore-Vorschau implementieren.
- [ ] Backup vor Wiederherstellung erneut validieren.
- [ ] Restore nur unter gemeinsamer Mutationssperre durchführen.
- [ ] vor Restore aktuellen Zustand automatisch sichern.
- [ ] atomaren Austausch verwenden.
- [ ] simulierten Abbruch vor Rename testen.
- [ ] bei Abbruch alte Datenbank unverändert nachweisen.
- [ ] beschädigtes Backup ablehnen.

## C – Export / Import

- [ ] validierten Export erzeugen.
- [ ] Import-Vorschau mit Zusammenfassung und Prüfsumme implementieren.
- [ ] Import nur nach serverseitiger Validierung zulassen.
- [ ] vor Import automatisches Backup erzeugen.
- [ ] Import atomar ersetzen.
- [ ] beschädigtes JSON ablehnen.
- [ ] unbekannte Schemaversion ablehnen.
- [ ] Import-Abbruch ohne Datenverlust testen.

## D – Migration

- [ ] deterministische Migrationskette `n -> n+1` implementieren.
- [ ] fehlende Migrationsschritte ablehnen.
- [ ] Rückwärtsmigration ablehnen.
- [ ] Migrationsplan ohne Mutation beschreibbar machen.
- [ ] isolierte v1→v2-Testfixture anlegen.
- [ ] Produktionsschema ausdrücklich bei v1 belassen.

## E – Recovery-UI

- [ ] Modul `data-recovery` registrieren.
- [ ] Backup-Button integrieren.
- [ ] Backup-Liste und Vorschau integrieren.
- [ ] Restore mit expliziter Bestätigung integrieren.
- [ ] Export-Download integrieren.
- [ ] JSON-Dateiauswahl für Import integrieren.
- [ ] Import-Vorschau vor Ausführung integrieren.
- [ ] Import mit expliziter Bestätigung integrieren.
- [ ] `file://` kontrolliert als nicht schreibfähigen Modus behandeln.

## F – Regression / Qualität

- [ ] Recovery-Service-Tests ergänzen.
- [ ] Recovery-API-Tests ergänzen.
- [ ] Recovery-UI-Vertrag testen.
- [ ] Failure-Injection testen.
- [ ] bestehende 0.4.0-Tests unverändert grün halten.
- [ ] Quality Gate um neue Pflichtdateien erweitern.
- [ ] Runtime-Backups vom Auto-Fix ausschließen.
- [ ] `npm run lint` grün.
- [ ] `npm run verify` auf Node 20 grün.
- [ ] `npm run verify` auf Node 24 grün.

## G – Dokumentation / Merge

- [ ] README aktualisieren.
- [ ] TODO aktualisieren.
- [ ] CHANGELOG aktualisieren.
- [ ] MANIFEST aktualisieren.
- [ ] VERSION-Entwicklungsphase aktualisieren.
- [ ] PR erstellen.
- [ ] Diff gegen `main` prüfen.
- [ ] PR mergebar und CI vollständig grün bestätigen.
- [ ] Squash-Merge durchführen.
- [ ] `main` nach Merge prüfen.
