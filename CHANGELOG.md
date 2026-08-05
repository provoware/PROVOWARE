# Changelog

Alle wesentlichen Änderungen dieses Projekts werden hier dokumentiert.

## [Unreleased]

### Geplant
- Migrationsmatrix über mehrere Projektschemata
- vollständiger Berichtsgenerator
- Projekt- und Vorlagenverwaltung

## [0.4.0] – 2026-08-05

### Hinzugefügt
- `js/storage-manager.js` als getrennte grafische Speicherverwaltung
- Snapshot-Liste mit Revision, Zeitpunkt, Speichergrund und Prüfergebnis
- vollständige JSON-Vorschau des ausgewählten Projektstands
- ausdrückliche Bestätigung vor manueller Wiederherstellung
- Wiederherstellung als neue, nachvollziehbare Revision
- manueller Sicherheitsstand auf Knopfdruck
- Aufbewahrungsgrenze von 5 bis 200 Snapshots
- reine Planungslogik zum Schutz des letzten gültigen Sicherheitsstands
- erweiterte Unit-, Integrations- und Browser-Smoke-Prüfungen

### Geändert
- Buildversion auf `0.4.0` angehoben
- Autospeicherung führt nach erfolgreichem Speichern die sichere Aufbewahrungsprüfung aus
- Browser-Smoke prüft Speicherverwaltung auf Desktop und Mobil
- Dokumentation und Schwachstellenregister aktualisiert

## [0.3.0] – 2026-08-05

### Hinzugefügt
- `js/storage-engine.js` mit versionierter IndexedDB
- Stores für Projekte, Snapshots, Metadaten und Migrationsprotokolle
- transaktionale Speicherung und unveränderliche Snapshots
- Prüfsummenprüfung und automatischer Rückfall
- sichtbarer Speicherstatus und Revisionsanzeige
- automatisierter Desktop-/Mobil-Browser-Smoke-Test

## [0.2.0] – 2026-08-05

### Hinzugefügt
- minimale Zielstruktur und startbarer Offline-HTML-Prototyp
- sechs repräsentative Entwicklungsfragen in vier Phasen
- erste Regel-, Schema-, Build- und Testgrundlage

## [0.1.0] – 2026-08-05

### Geändert
- Repository vollständig neu aufgesetzt.
