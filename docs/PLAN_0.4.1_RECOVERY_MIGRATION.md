# PLAN 0.4.1 – Recovery & Migration

## Ziel

Die lokale Project-Data-Persistenz gegen beschädigte Dateien, fehlgeschlagene Ersetzungen und zukünftige Schemawechsel härten, ohne den bestehenden Schema-v1-Vertrag künstlich zu verändern.

## Scope

1. Backup vor jeder vollständigen Datenbankersetzung.
2. Begrenzte Backup-Rotation mit fester Obergrenze.
3. Backup-Liste und Restore-Vorschau mit Prüfsumme und Inhaltszusammenfassung.
4. Kontrollierter Restore erst nach erneuter serverseitiger Validierung.
5. Export des aktuellen Datenbestands als validiertes JSON.
6. Import-Vorschau vor jedem Import und Import erst nach Schema-/Inhaltsprüfung.
7. Atomarer Austausch: bei Fehler vor Rename bleibt die vorherige Datenbank unverändert.
8. Failure-Injection für unterbrochene Ersetzung, beschädigten Import und ungültiges Backup.
9. Migrationsengine als deterministische Schrittfolge mit Dry-Run-/Planfunktion.
10. v1→v2 nur als Testfixture; Produktionsschema bleibt v1.
11. Eigene Recovery-UI als Modul, getrennt vom CRUD-Modul `data-studio`.
12. Quality Gate, Regression, Checkpoint, Checkliste und Roadmap synchronisieren.

## Architektur

### `scripts/project-data-service.mjs`

Bestehende atomare Schreibfunktion und Mutationssperre werden als interne Plattformfunktionen exportierbar gemacht. Normale CRUD-Pfade bleiben semantisch unverändert.

### `scripts/project-data-recovery.mjs`

Neue Recovery-Schicht mit:

- `createProjectDataBackup`
- `listProjectDataBackups`
- `previewProjectDataBackup`
- `restoreProjectDataBackup`
- `exportProjectDataSnapshot`
- `previewProjectDataImport`
- `importProjectDataSnapshot`
- `runMigrationChain`
- `describeMigrationPlan`

Backup-Verzeichnis:

`data/backups/project-data/`

Maximale Rotation:

`10` Backups.

### `modules/data-recovery/index.js`

Eigene Oberfläche im Detailbereich für:

- Backup jetzt erstellen
- vorhandene Backups anzeigen
- Restore-Vorschau
- Restore nach Bestätigung
- JSON exportieren
- JSON-Datei einlesen
- Import-Vorschau
- Import nach Bestätigung

## Sicherheitsvertrag

- Browser übergibt niemals freie Server-Dateipfade.
- Backup-IDs müssen einem festen Dateinamensmuster entsprechen.
- Restore/Import validieren den Kandidaten vor jeder Ersetzung erneut.
- Vor Restore/Import wird der aktuelle Bestand automatisch gesichert.
- Backup-Dateien werden nicht statisch ausgeliefert und nicht durch Auto-Fix verändert.
- Fehlgeschlagene atomare Ersetzung darf die alte Datenbank nicht beschädigen.
- Keine Remote-Speicherung, keine neue npm-Abhängigkeit, kein SQLite in 0.4.1.

## Migrationsvertrag

Produktionsziel bleibt Schema 1. Die Engine verarbeitet Migrationen ausschließlich als aufeinanderfolgende `n -> n+1`-Schritte. Fehlende Schritte, rückwärts gerichtete Migration und Zielversionen unterhalb der Quelle werden abgelehnt.

Eine künstliche Schema-v2-Datei wird nicht in die Anwendung eingeführt. Stattdessen beweist ein isolierter Testmigrator `v1 -> v2`, dass Planung, Reihenfolge und Ergebnisdeterminismus funktionieren.

## Definition of Done

0.4.1 ist erst abgeschlossen, wenn:

- Recovery-Funktionen und UI implementiert sind,
- Originaldaten bei simuliertem Schreibabbruch unverändert bleiben,
- Backup vor Restore/Import nachweisbar ist,
- Rotation getestet ist,
- Import/Restore beschädigte oder inkompatible Daten ablehnen,
- Migrationsfixture grün ist,
- bestehende 0.4.0-Regression vollständig grün bleibt,
- Node-20/24-CI erfolgreich ist,
- Diff gegen `main` ausschließlich begründete Dateien enthält.
