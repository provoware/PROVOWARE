# Changelog

Alle wesentlichen Änderungen dieses Projekts werden hier dokumentiert.

## [Unreleased]

### Hinzugefügt
- modulare, datengetriebene Projektvorlagenverwaltung
- sechs Projektarten: Offline-HTML, Linux-Desktop, Medienverarbeitung, Dateiorganisation, Songwriting/Audio und Mobile PWA
- je drei geprüfte Profile pro Projektart; insgesamt 18 integrierte Profile
- vollständige Antwortsets für alle sechs Pflichtfragen
- verbindlicher Abgleich deklarierter und tatsächlich ausgelöster Regeln
- Vorschau aller Antwortunterschiede gegenüber dem aktuell geöffneten Projekt
- sichtbare Architekturvorschläge, Ordnerstrukturen, Berichtsvorgaben, Qualitätsgates, Meilensteine und Sonderfälle
- blockierte Projektanlage bis zur ausdrücklichen Prüfung der Vorschau
- zusätzliche Bestätigung bei kritischen Regelkonflikten
- unveränderliche integrierte Profile
- lokale eigene Profile im vorhandenen Metadaten-Store
- eigenes Profil aus einem vollständig beantworteten Projekt erstellen
- eigene Profile umbenennen, duplizieren, exportieren, importieren und löschen
- Profilpaket `1.0.0` mit Prüfsumme und Größenbegrenzung auf 512 KiB
- Vorlagenherkunft eines neuen Projekts als getrennte Metadaten
- modularer Vorlagenindex `data/templates.json` mit sechs getrennten Datenmodulen
- Unit-Vertrag für 6 Vorlagen, 18 Profile, 108 gültige Antwortzuordnungen und reale Regelauswertung
- Desktop-/Mobil-Smoke für Vorschau, Projektanlage und vollständigen eigenen Profillebenszyklus

### Sicherheitsverbesserungen
- kein Profil darf eine Pflichtfrage auslassen
- unbekannte Frage-IDs und ungültige Antwortwerte blockieren das Profil
- behauptete Regelauswirkungen müssen exakt mit dem realen Regelkern übereinstimmen
- integrierte Profile mit kritischem Konflikt werden im Katalogvertrag abgelehnt
- vor der Projektanlage wird der Profilfingerabdruck erneut verglichen
- Vorlagenprojekte erhalten immer eine neue unabhängige Projekt-ID
- Projekt- und Profilmetadaten bleiben voneinander getrennt
- manipulierte Profilpakete werden über die Prüfsumme blockiert
- Löschen eines eigenen Profils verändert keine bestehenden Projekte
- Profilimport ist auch vollständig per Tastatur erreichbar
- Theme-Farben verwenden die verbindlichen `--color-*`-Variablen

### Geändert
- `data/templates.json` von einer unvollständigen Beispielvorlage auf einen modularen Katalogindex `2.0.0` umgestellt
- `schemas/template.schema.json` auf den Modulindexvertrag umgestellt
- Releaseversion bleibt bis zur erneuten vollständigen Releaseabnahme bei `0.8.0`

### Geplant
- kryptografischer SHA-256-Fingerabdruck und optional signierbares Projektpaket-Manifest
- reale Kubuntu-Abnahme aller Browser- und IndexedDB-Gruppen
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
- Prüfung konsistenter Herkunfts-ID, Projektname, Projektschema und Katalogversion
- Prüfung bekannter Frage-IDs und zulässiger Antwortwerte
- Vergleich von Projektgrundfeldern und Antworten
- Erkennung identischer Projekte und bestehender Projekt-IDs
- Import mit freier Original-ID oder neuer unabhängiger ID
- bewusstes Ersetzen eines aktiven Projekts mit Vorher-Sicherung
- Revisionsabgleich unmittelbar vor dem Ersetzen
- `js/accessibility.js` als zentrale Dialog- und Tastaturschicht
- Fokusfalle, Escape-Hierarchie, Fokus-Rückkehr und Pfeiltastennavigation
- automatisierte Barrierefreiheits-Grundprüfung
- Unit-Tests für Transfer, Migration, Konflikte, Revisionsschutz und Zugänglichkeitsverträge
- automatischer Versionsabgleich zwischen Oberfläche, Build, Transferpaket und Release-ZIP

### Sicherheitsverbesserungen
- manipulierte oder beschädigte Paketprüfsummen blockieren den Import
- widersprüchliche Herkunfts- und Projektmetadaten blockieren den Import
- unbekannte Fragen und ungültige Antwortwerte blockieren den Import
- bei ID-Konflikten ist eine neue Projekt-ID die sichere Standardempfehlung
- Archiv- und Papierkorbprojekte dürfen nicht ersetzt werden
- Ersetzen verlangt exakten Projektnamen und separate Bestätigung
- hat sich die lokale Revision seit der Vorschau verändert, wird das Ersetzen blockiert
- vor dem Ersetzen wird `pre-import-backup` angelegt

### Einschränkungen
- die Paketprüfsumme ist keine kryptografische Signatur oder Herkunftsbestätigung
- die automatisierte Barrierefreiheitsprüfung ersetzt keine reale Screenreader-Abnahme

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
