# PLAN 0.4.3 – Recovery Envelope

## Ziel

Project Data und Data-Studio-PRO-Metadaten als **einen versionierten Recovery-Zustand** sichern und wiederherstellen, ohne das bestehende `.pwbak`-Format zu verändern.

## Ausgangsbasis

- `scripts/atomic-file.mjs` ist der kanonische Cross-OS-Atomic-Replace-Vertrag.
- Ubuntu- und Windows-Portability-Gates sind grün.
- Project Data bleibt Schema v1.
- Data Studio PRO bleibt Metadatenvertrag v1.
- Legacy-Backups `data/backups/project-data/*.pwbak` bleiben vollständig erhalten.

## Envelope-Format v1

Dateiendung: `.pwenvelope`

Formatkennung: `provoware-recovery-envelope`

Komponenten:

1. `project-data` → `data/project-data.json`
2. `data-studio-pro` → `data/data-studio-pro.json`

Jede Komponente enthält:

- feste Komponenten-ID und erwarteten relativen Pfad
- Zustand `valid`, `invalid` oder `missing`
- Rohbytes als Base64
- SHA-256 der Rohbytes
- Byte-Länge
- Schemaversion, wenn ermittelbar
- kurze fachliche Zusammenfassung, wenn validierbar

Der Envelope enthält zusätzlich eine eigene SHA-256-Prüfsumme über den kanonischen Envelope-Payload ohne das Prüfsummenfeld selbst.

## Ablage

- Envelopes: `data/backups/project-envelope/*.pwenvelope`
- Journal: `data/recovery/recovery-envelope-journal.json`
- Rotation: maximal 10 Envelopes
- alle Pfade aus Git, Auto-Fix und statischer Auslieferung ausgeschlossen

## Restore-Vertrag

`Vorschau -> Envelope-SHA bestätigen -> Safety-Envelope -> Journal PREPARED -> Komponente A -> Journal -> Komponente B -> Journal -> Verifikation -> COMMITTED -> Journal entfernen`

## Rollback

Scheitert der Restore nach Beginn der Live-Ersetzung:

1. Journal hält Safety-Envelope und bereits ersetzte Komponenten fest.
2. beide Live-Komponenten werden aus dem Safety-Envelope zurückgeschrieben.
3. Safety-Zustand wird per SHA-256 erneut verifiziert.
4. Journal wird als `ROLLED_BACK` abgeschlossen und entfernt.
5. ursprünglicher Restore-Fehler wird kontrolliert weitergegeben.

## Wiederanlauf nach Prozessabbruch

Bleibt ein Journal liegen, wird es vor einer neuen Envelope-Operation geprüft. Ein nicht abgeschlossenes Journal wird anhand des gebundenen Safety-Envelopes deterministisch zurückgerollt, bevor neue Mutationen zugelassen werden.

## Failure Injection

Prüfpunkte:

- vor erster Komponente
- nach Project Data
- nach Data Studio PRO
- vor Abschlussverifikation
- während Rollback

Mindestens der kritische Fehler **zwischen beiden Komponenten** muss nachweisen, dass niemals ein gemischter Live-Zustand zurückbleibt.

## API

Unter `/api/provoware/project-data/recovery/envelopes`:

- `GET /` – Liste
- `POST /` – neues Envelope
- `POST /preview` – Vorschau
- `POST /restore` – SHA-gebundener Multi-Datei-Restore
- `GET /journal` – Recovery-/Wiederanlaufstatus

Legacy-Recovery-Routen bleiben unverändert.

## UI

Das bestehende Recovery-Modul erhält einen getrennten Abschnitt **Projekt-Envelope**. Legacy-Project-Data-Backups bleiben sichtbar und funktionsfähig.

## Nicht Teil von 0.4.3

- kein neues Datenbankschema
- kein SQLite
- kein Cloud-/Remote-Backup
- keine automatische Umschreibung alter `.pwbak`
- kein Windows-Browser-E2E als Pflichtgate
