# Changelog

Alle wesentlichen Änderungen dieses Projekts werden hier dokumentiert.

## [Unreleased]

### Geplant
- Mehrprojektverwaltung
- Projekt- und Vorlagenverwaltung
- reale Kubuntu-Abnahme der IndexedDB-Fehlerfälle

## [0.6.0] – 2026-08-05

### Hinzugefügt
- gemeinsames, formatneutrales Berichtsmodell `1.0.0`
- Anforderungen mit eindeutigen Kennungen und Quellenfragen
- Architekturprinzipien, Komponenten, Entscheidungen und Datenfluss
- Risiken aus Regelkonflikten und offenen Pflichtentscheidungen
- Normal- und Fehlerfalltests je Anforderung
- Abnahmekriterien, Meilensteine und offene Entscheidungen
- vollständige Rückverfolgbarkeit von Frage zu Anforderung, Test und Abnahme
- Exporte als Markdown, eigenständiges Offline-HTML, TXT und JSON
- grafische Berichtsvorschau mit Vorprüfung und Formatwechsel
- Unit-Vertragstest für Modell und alle vier Renderer
- Browser-Smoke für Berichtsvorschau, Konsistenz und Rückverfolgbarkeit
- `.github/workflows/ci.yml` für schnelle Push-, Pull-Request- und manuelle Prüfungen

### Geändert
- Buildversion auf `0.6.0` angehoben
- bestehende Markdown-Vorschau verwendet jetzt dasselbe Berichtsmodell wie die Exporte
- HTML-Ausgabe enthält ausschließlich eingebettetes CSS und keine externen Laufzeitressourcen
- Projektstruktur- und HTML-Smoke-Verträge um Bericht und CI erweitert

### Behoben
- Berichtsformate können keine voneinander abweichenden IDs oder Abschnittsstände mehr erzeugen
- ein fehlerhafter Dateileseraufruf im zwischenzeitlichen Buildskript wurde vor Abschluss korrigiert

## [0.5.0] – 2026-08-05

### Hinzugefügt
- `js/migration-engine.js` mit verbindlicher Matrix `1.0.0 → 1.1.0 → 1.2.0`
- transaktionale Migration von Hauptstand und Legacy-Snapshots
- unveränderte Vorher-Sicherung vor dem Ersetzen eines Legacy-Hauptstands
- migrierte Snapshot-Kopien ohne Überschreiben der Originale
- Protokolleinträge für jeden Migrationsschritt und den Abschluss
- Projektschema `1.2.0` mit Fragenkatalogversion und Validierungszeitpunkt
- Browser-Szenarien für Quota, Transaktionsabbruch und beschädigte Snapshot-Reihen

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
