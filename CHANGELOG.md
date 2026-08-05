# Changelog

Alle wesentlichen Änderungen dieses Projekts werden hier dokumentiert.

## [Unreleased]

### Geplant
- sicherer Projekt-JSON-Export und Import-Assistent
- Projektvorlagen und Profile
- reale Kubuntu-Abnahme der IndexedDB-Fehlerfälle

## [0.7.0] – 2026-08-05

### Hinzugefügt
- `js/project-repository.js` als getrennte Mehrprojekt-Persistenzschicht
- `js/project-manager.js` als grafische Projektübersicht
- `css/project-manager.css` für responsive Desktop- und Mobilansicht
- Lebenszykluszustände `active`, `archive` und `trash`
- Suche und Statusfilter für gespeicherte Projekte
- Neuanlage leerer Projekte mit eindeutiger Projekt-ID
- Umbenennen als neue Projekt-Revision
- Duplizieren mit eigener ID, eigener Revision und unabhängigen Snapshots
- Archivieren und Wiederherstellen
- Papierkorb und kontrollierte Wiederherstellung
- endgültiges Löschen mit exakter Namenseingabe und separater Bestätigung
- transaktionales Entfernen von Projektstand, Snapshots, Metadaten und Protokollen
- automatischer Wechsel auf ein anderes aktives Projekt
- automatisches Ersatzprojekt, falls kein weiteres aktives Projekt vorhanden ist
- Unit-Vertragstest für Projektlebenszyklus und Löschumfang
- eigener Desktop-/Mobil-Browser-Smoke für den vollständigen Projektlebenszyklus

### Geändert
- Buildversion auf `0.7.0` angehoben
- aktueller Projektname wird im Header angezeigt
- Berichte verwenden stets Projekt-ID und Revision des geöffneten Projekts
- Autospeicherung wird vor Projektwechseln seriell abgeschlossen
- Gesamtvalidator führt drei getrennte Browsergruppen aus

### Sicherheitsverbesserungen
- archivierte Projekte und Papierkorbprojekte können nicht direkt bearbeitet werden
- endgültiges Löschen ist ausschließlich im Papierkorb erlaubt
- ein falscher Projektname oder fehlende Bestätigung blockiert die Löschung
- projektspezifische Daten werden ausschließlich nach Projekt-ID entfernt

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
