# Changelog

Alle wesentlichen Änderungen dieses Projekts werden hier dokumentiert.

## [Unreleased]

### Geplant
- Projektvorlagen und Profile
- reale Kubuntu-Abnahme der IndexedDB-Fehlerfälle
- reale Screenreader-Abnahme
- Ein-Datei-Release

## [0.8.0] – 2026-08-05

### Hinzugefügt
- `js/project-transfer.js` als reiner Projektpaket-, Prüf- und Vergleichskern
- `js/project-transfer-manager.js` als grafischer Export- und Import-Assistent
- `schemas/project-package.schema.json` für Projektpakete `1.0.0`
- `css/project-transfer.css` für responsive Importvorschau und Konfliktdarstellung
- Projekt-JSON-Export mit Herkunft, Revision, Schema, Katalogversion und Prüfsumme
- Dateigrößenlimit von zwei MiB
- rein lesende Importvorschau vor jeder Speicherung
- schrittweise Migration importierter Projektschemata `1.0.0` und `1.1.0`
- Prüfung bekannter Frage-IDs und zulässiger Antwortwerte
- Vergleich von Projektgrundfeldern und Antworten
- Erkennung identischer Projekte und bestehender Projekt-IDs
- Import mit freier Original-ID oder neuer unabhängiger ID
- bewusstes Ersetzen eines aktiven Projekts mit Vorher-Sicherung
- `js/accessibility.js` als zentrale Dialog- und Tastaturschicht
- Fokusfalle im obersten Dialog
- Escape-Hierarchie für Unteraktionen und Dialoge
- Fokus-Rückkehr zum tatsächlichen Auslöser
- Pfeiltastennavigation mit Home und Ende
- automatisierte Barrierefreiheits-Grundprüfung
- Unit-Tests für Transfer, Prüfsumme, Migration, Konflikte und Zugänglichkeitsverträge
- eigener Desktop-/Mobil-Smoke für Transfer und Dialogbedienung

### Geändert
- Buildversion auf `0.8.0` angehoben
- alle eingebetteten Browser-Runner verwenden dieselbe Modul- und CSS-Reihenfolge wie die Anwendung
- Gesamtvalidator führt vier getrennte Browsergruppen aus
- Projekt-, Bericht- und Speicherlisten sind für Pfeiltastennavigation markiert
- TODO trennt automatisierte Grundprüfung und reale Screenreader-Abnahme

### Sicherheitsverbesserungen
- manipulierte oder beschädigte Paketprüfsummen blockieren den Import
- unbekannte Fragen und ungültige Antwortwerte blockieren den Import
- bei ID-Konflikten ist eine neue Projekt-ID die sichere Standardempfehlung
- Archiv- und Papierkorbprojekte dürfen nicht ersetzt werden
- Ersetzen verlangt exakten Projektnamen und separate Bestätigung
- vor dem Ersetzen wird `pre-import-backup` als unveränderte Sicherheitsrevision angelegt
- Importdateien werden ausschließlich nach ausdrücklicher lokaler Dateiauswahl gelesen

### Einschränkung
- die Paketprüfsumme dient der Erkennung unbeabsichtigter Änderungen; sie ist keine kryptografische Signatur oder Herkunftsbestätigung
- die automatisierte Barrierefreiheitsprüfung ersetzt keine reale Orca-, NVDA- oder VoiceOver-Abnahme

## [0.7.0] – 2026-08-05

### Hinzugefügt
- vollständige Mehrprojektverwaltung
- Projektlebenszyklus `active`, `archive` und `trash`
- Suche, Filter, Neuanlage, Umbenennen, Duplizieren, Archiv, Papierkorb und sicheres Löschen
- unabhängige Projekt-Revisionen, Snapshots und Berichte

## [0.6.0] – 2026-08-05

### Hinzugefügt
- gemeinsames, formatneutrales Berichtsmodell `1.0.0`
- Anforderungen, Architektur, Risiken, Tests, Abnahme und Rückverfolgbarkeit
- Exporte als Markdown, eigenständiges Offline-HTML, TXT und JSON
- grafische Berichtsvorschau
- schnelle GitHub-Actions-CI

## [0.5.0] – 2026-08-05

### Hinzugefügt
- Migrationsmatrix `1.0.0 → 1.1.0 → 1.2.0`
- transaktionale Migration von Hauptstand und Legacy-Snapshots
- Quota-, Transaktionsabbruch- und Korruptionsprüfungen

## [0.4.0] – 2026-08-05

### Hinzugefügt
- grafische Speicherverwaltung mit Snapshot-Liste und Vorschau
- kontrollierte Wiederherstellung als neue Revision
- sichere Aufbewahrungsgrenze

## [0.3.0] – 2026-08-05

### Hinzugefügt
- versionierte IndexedDB
- transaktionale Speicherung und unveränderliche Snapshots

## [0.2.0] – 2026-08-05

### Hinzugefügt
- minimale Zielstruktur und startbarer Offline-HTML-Prototyp
- sechs repräsentative Entwicklungsfragen in vier Phasen

## [0.1.0] – 2026-08-05

### Geändert
- Repository vollständig neu aufgesetzt.
