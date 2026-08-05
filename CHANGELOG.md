# Changelog

Alle wesentlichen Änderungen dieses Projekts werden hier dokumentiert.

## [Unreleased]

### Geplant
- manuelle Snapshot-Verwaltung
- vollständiger Berichtsgenerator
- Projekt- und Vorlagenverwaltung

## [0.3.0] – 2026-08-05

### Hinzugefügt
- `js/storage-engine.js` mit versionierter IndexedDB
- Stores für Projekte, Snapshots, Metadaten und Migrationsprotokolle
- transaktionale Speicherung und unveränderliche Snapshots
- Prüfsummenprüfung und automatischer Rückfall
- sichtbarer Speicherstatus und Revisionsanzeige
- automatisierter Desktop-/Mobil-Browser-Smoke-Test
- Speichervertrags-Unit-Tests

### Geändert
- Projektschema auf `1.1.0` erweitert
- Buildversion auf `0.3.0` angehoben
- Dokumentation, TODO und Schwachstellenregister aktualisiert

## [0.2.0] – 2026-08-05

### Hinzugefügt
- minimale Zielstruktur mit getrennten Laufzeit-, Daten-, Schema-, Test- und Dokumentationsbereichen
- startbarer Offline-HTML-Prototyp mit responsiver Dreispaltenansicht
- sechs repräsentative Entwicklungsfragen in vier Phasen
- erste Regel- und Konflikterkennung
- Projekt-, Fragen- und Vorlagenschema
- lokale Validierungs-, Build- und Release-Skripte
- Unit-, Integrations- und Smoke-Prüfungen

## [0.1.0] – 2026-08-05

### Geändert
- Repository vollständig neu aufgesetzt.
- Sämtliche alten Dateien aus dem aktiven `main`-Baum entfernt.
- Neue verbindliche Projektgrundlage angelegt.
