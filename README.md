# PROVOWARE Entwicklungsplan-Assistent

## Projektstatus

Das Repository enthält einen startbaren, vollständig lokalen HTML-Prototyp mit datengetriebenem Fragenworkflow, versionierter IndexedDB, grafischer Speicherverwaltung, schrittweiser Projektschema-Migration und einem formatneutralen Berichtsgenerator.

**Version:** 0.6.0  
**Phase:** belastbarer P1-Prototyp  
**Zielplattform:** aktuelle Chromium- und Firefox-Browser unter Linux

## Start

### Empfohlener lokaler Start

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen. Dieser Modus lädt die getrennten JSON-Kataloge und erlaubt reguläre IndexedDB-Speicherung.

### Direkter Start

`index.html` kann per Doppelklick geöffnet werden. Blockiert der Browser getrennte JSON-Dateien unter `file://`, verwendet die Oberfläche sichtbar den eingebauten Beispieldatensatz. Es werden keine Daten ins Internet übertragen.

## Aktueller Funktionsumfang

- sechs mehrschichtig erklärte Entwicklungsfragen in vier Phasen
- Empfehlungsschaltfläche, Fortschritt und Live-Zusammenfassung
- Konflikterkennung für widersprüchliche Offline-/Cloud-Entscheidungen
- helles und dunkles Theme
- versionierte IndexedDB mit vier getrennten Stores
- transaktionales Speichern von Hauptstand, Snapshot, Metadaten und Protokolleintrag
- unveränderliche Snapshots mit Prüfsumme und automatischem Rückfall
- grafische Snapshot-Liste, Vorschau und kontrollierte Wiederherstellung
- Aufbewahrungsgrenze von 5 bis 200 Snapshots mit Schutz des letzten gültigen Sicherheitsstands
- schrittweise Migration `1.0.0 → 1.1.0 → 1.2.0`
- Vorher-Sicherung und Migrationsprotokoll in derselben Transaktion
- reproduzierbare Quota-, Abbruch- und beschädigte-Snapshot-Szenarien
- gemeinsames Berichtsmodell mit Anforderungen, Architektur, Risiken, Tests, Abnahme, Meilensteinen und offenen Entscheidungen
- Berichtexport als Markdown, eigenständiges Offline-HTML, TXT und JSON
- schnelle GitHub-Actions-CI für Struktur, Schemata, Unit-Tests und JavaScript-Syntax

## Berichtsmodell

Über **„Bericht prüfen und exportieren“** wird aus dem aktuellen Projektstand ein einziges formatneutrales Modell erzeugt.

Enthalten sind:

- Projektbeschreibung und Status
- bestätigte Entscheidungen
- Anforderungen mit eindeutigen IDs
- Architekturprinzipien, Komponenten und Datenfluss
- Konflikte und offene Pflichtentscheidungen als Risiken
- Normal- und Fehlerfalltests je Anforderung
- Abnahmekriterien
- Meilensteine
- offene Entscheidungen
- Rückverfolgbarkeit von Frage zu Anforderung, Test und Abnahme

Alle vier Ausgabeformate verwenden exakt dieses Modell. Dadurch können Kennungen und Inhalte nicht unabhängig voneinander auseinanderlaufen.

### Exportformate

| Format | Zweck |
|---|---|
| Markdown | Weiterbearbeitung in GitHub, Typora oder Dokumentationen |
| Offline-HTML | eigenständig öffnbarer, druckbarer Bericht ohne externe Ressourcen |
| TXT | kompakte universelle Textfassung |
| JSON | maschinenlesbares Berichtsmodell für spätere Werkzeuge |

Vor jedem Export wird das Modell neu erzeugt und validiert. Unvollständige Projekte dürfen exportiert werden, bleiben aber eindeutig als `incomplete` oder bei kritischem Konflikt als `blocked` markiert.

## Migrationsmatrix

| Ausgang | Schritt | Ergebnis |
|---|---|---|
| `1.0.0` | Standardtheme, aktuelle Frage und Zeitstempel normalisieren | `1.1.0` |
| `1.1.0` | Fragenkatalogversion und Validierungszeitpunkt ergänzen | `1.2.0` |
| `1.2.0` | keine Änderung | `1.2.0` |

Direktsprünge werden nicht verwendet. Legacy-Originale bleiben erhalten; migrierte Kopien, Hauptstand, Metadaten und Protokolle werden transaktional geschrieben.

## Prüfungen

```bash
python3 -m pip install -r requirements.txt
python3 scripts/validate.py
pytest -q
python3 tests/smoke/run_browser_smoke.py
python3 tests/smoke/run_storage_failure_smoke.py
```

Komplett einschließlich beider Browser-Smoke-Gruppen:

```bash
python3 scripts/validate.py --browser
```

Der Haupt-Smoke prüft zusätzlich Berichtsmodell, sechs abgeleitete Anforderungen, zwölf Testfälle, Konfliktrisiko, Rückverfolgbarkeit sowie Markdown-, HTML- und JSON-Vorschau auf Desktop und Mobil.

## GitHub Actions

`.github/workflows/ci.yml` läuft bei Pushes und Pull Requests auf `main` sowie manuell.

Automatisch geprüft werden:

- Projektstruktur und Dateipfade
- JSON-Schemata
- Migrationsmatrix
- Speicher- und Berichtsverträge
- Unit- und Integrationsprüfungen
- JavaScript-Syntax

Browser-, Quota- und echte IndexedDB-Tests bleiben bewusst getrennte Release-Gates, damit die schnelle CI konstruktiv und zuverlässig bleibt.

## Datenschutz und Offline-Betrieb

Der Anwendungskern enthält keine CDN-, Cloud- oder Netzpflicht. Projektstände und erzeugte Berichte bleiben lokal im Browser. Das exportierte HTML enthält ausschließlich eingebettetes CSS und keine externen Laufzeitressourcen.

## Nächster Schritt

Eine echte Projektverwaltung mit mehreren Projekten, Projektübersicht, Umbenennen, Duplizieren, Archiv, Papierkorb und sicherem JSON-Import entwickeln.
