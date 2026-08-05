# Changelog

Alle wesentlichen Änderungen dieses Projekts werden hier dokumentiert.

## [Unreleased]

### Geplant
- vollständiger Berichtsgenerator
- Projekt- und Vorlagenverwaltung
- reale Kubuntu-Abnahme der IndexedDB-Fehlerfälle

## [0.5.0] – 2026-08-05

### Hinzugefügt
- `js/migration-engine.js` mit verbindlicher Matrix `1.0.0 → 1.1.0 → 1.2.0`
- transaktionale Migration von Hauptstand und Legacy-Snapshots
- unveränderte Vorher-Sicherung vor dem Ersetzen eines Legacy-Hauptstands
- migrierte Snapshot-Kopien ohne Überschreiben der Originale
- Protokolleinträge für jeden Migrationsschritt und den Abschluss
- Projektschema `1.2.0` mit Fragenkatalogversion und Validierungszeitpunkt
- Legacy-Prüfdaten für Schema `1.0.0` und `1.1.0`
- Unit-Tests für Migrationspfade, Idempotenz und Fehlerverträge
- Browser-Szenarien für Quota, Transaktionsabbruch und beschädigte Snapshot-Reihen
- testexklusive Fehlerinjektion mit Schutz gegen Nutzung im normalen Betrieb

### Geändert
- IndexedDB-Version auf `2` angehoben
- Buildversion auf `0.5.0` angehoben
- Wiederherstellung migriert alte Snapshots vor ihrer erneuten Nutzung
- Aufbewahrung erkennt auch migrierbare Legacy-Sicherheitsstände
- Gesamtvalidator führt beide Browser-Smoke-Gruppen über `--browser` aus

### Behoben
- Quota- und Abbruchfehler können keinen halbfertigen Hauptstand hinterlassen
- beschädigte neuere Snapshots verdecken keinen älteren gültigen Stand

## [0.4.0] – 2026-08-05

### Hinzugefügt
- grafische Speicherverwaltung mit Snapshot-Liste und Vorschau
- kontrollierte Wiederherstellung als neue Revision
- sichere Aufbewahrungsgrenze mit geschütztem Sicherheitsstand

## [0.3.0] – 2026-08-05

### Hinzugefügt
- versionierte IndexedDB
- transaktionale Speicherung und unveränderliche Snapshots
- Prüfsummenprüfung und automatischer Rückfall

## [0.2.0] – 2026-08-05

### Hinzugefügt
- minimale Zielstruktur und startbarer Offline-HTML-Prototyp
- sechs repräsentative Entwicklungsfragen in vier Phasen

## [0.1.0] – 2026-08-05

### Geändert
- Repository vollständig neu aufgesetzt.
