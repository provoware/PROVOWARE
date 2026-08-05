# PROVOWARE Entwicklungsplan-Assistent

## Projektstatus

Das Repository enthält einen startbaren, vollständig lokalen HTML-Prototyp mit datengetriebenem Fragenworkflow, versionierter IndexedDB, mehreren unabhängig verwalteten Projekten, grafischer Speicherverwaltung, schrittweiser Projektschema-Migration und formatneutralem Berichtsgenerator.

**Version:** 0.7.0  
**Phase:** belastbarer P1-Prototyp  
**Zielplattform:** aktuelle Chromium- und Firefox-Browser unter Linux

## Start

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen. Dieser Modus lädt die getrennten JSON-Kataloge und erlaubt reguläre IndexedDB-Speicherung.

`index.html` kann alternativ direkt geöffnet werden. Blockiert der Browser getrennte JSON-Dateien unter `file://`, verwendet die Oberfläche sichtbar den eingebauten Beispieldatensatz. Es werden keine Daten ins Internet übertragen.

## Aktueller Funktionsumfang

- sechs mehrschichtig erklärte Entwicklungsfragen in vier Phasen
- Empfehlungsschaltfläche, Fortschritt und Live-Zusammenfassung
- Konflikterkennung für widersprüchliche Entscheidungen
- helles und dunkles Theme
- vollständige Mehrprojektverwaltung
- versionierte IndexedDB mit getrennten Projektständen und Snapshots
- grafische Snapshot-Liste, Vorschau und kontrollierte Wiederherstellung
- Aufbewahrungsgrenze mit Schutz des letzten gültigen Sicherheitsstands
- schrittweise Migration `1.0.0 → 1.1.0 → 1.2.0`
- Berichtsmodell mit Markdown-, Offline-HTML-, TXT- und JSON-Ausgabe
- reproduzierbare Quota-, Abbruch- und beschädigte-Snapshot-Szenarien
- schnelle GitHub-Actions-CI für Struktur, Schemata, Unit-Tests und JavaScript-Syntax

## Mehrprojektverwaltung

Über **„Projekte verwalten“** können mehrere Projekte parallel und vollständig getrennt geführt werden.

Unterstützt werden:

- Projektübersicht mit Suche und Statusfilter
- neues leeres Projekt
- bestehendes Projekt öffnen
- Projekt umbenennen
- Projekt mit neuer ID duplizieren
- Projekt archivieren
- Projekt in den Papierkorb verschieben
- Projekt aus Archiv oder Papierkorb wiederherstellen
- Projekt endgültig löschen

### Unabhängigkeit der Projekte

Jedes Projekt besitzt:

- eine eindeutige Projekt-ID
- einen eigenen aktuellen Projektstand
- eine eigene Revisionsfolge
- eigene unveränderliche Snapshots
- eine eigene Aufbewahrungsgrenze
- eigene Migrations- und Ereignisprotokolle
- Berichte mit der jeweiligen Projekt-ID und Revision

Beim Projektwechsel werden ausstehende Änderungen des bisherigen Projekts zuerst geordnet gespeichert. Danach wird ausschließlich der gewählte Projektstand geladen. Antworten, Revisionen und Berichte werden nicht vermischt.

### Projektstatus

| Status | Bedeutung |
|---|---|
| `active` | Projekt kann geöffnet und bearbeitet werden |
| `archive` | Projekt bleibt vollständig erhalten, ist aber nicht direkt bearbeitbar |
| `trash` | Projekt wartet auf Wiederherstellung oder endgültige Löschung |

Bestehende Projekte ohne Lebenszyklusmetadaten werden automatisch als aktiv behandelt. Der Projektstatus liegt getrennt vom Projektschema `1.2.0`; dadurch bleiben bestehende Projektdateien und Migrationen kompatibel.

### Sicheres endgültiges Löschen

Endgültiges Löschen ist ausschließlich im Papierkorb möglich. Vor der Freigabe müssen:

1. der vollständige Projektname exakt eingegeben werden,
2. eine separate Bestätigung aktiviert werden.

Danach werden in einer gemeinsamen IndexedDB-Transaktion entfernt:

- aktueller Projektstand
- sämtliche Snapshots
- Aufbewahrungs- und Lebenszyklusmetadaten
- Migrations- und Ereignisprotokolle dieses Projekts

Ein falscher Name, eine fehlende Bestätigung oder ein Projekt außerhalb des Papierkorbs blockiert die Aktion.

### Verhalten beim aktuellen Projekt

Wird das gerade geöffnete Projekt archiviert oder in den Papierkorb verschoben, öffnet die Anwendung automatisch ein anderes aktives Projekt. Existiert keines, wird ein neues leeres Ersatzprojekt angelegt. Dadurch bleibt die Oberfläche niemals an einem nicht bearbeitbaren Projekt hängen.

## Berichte

Über **„Bericht prüfen und exportieren“** wird aus dem aktuell geöffneten Projekt ein gemeinsames Berichtsmodell erzeugt. Projekt-ID, Revision, Anforderungen, Risiken, Tests und Abnahmekriterien gehören damit immer exakt zu diesem Projekt.

Ausgaben:

- Markdown
- eigenständiges Offline-HTML
- TXT
- JSON

## Prüfungen

```bash
python3 -m pip install -r requirements.txt
python3 scripts/validate.py
pytest -q
python3 tests/smoke/run_browser_smoke.py
python3 tests/smoke/run_project_management_smoke.py
python3 tests/smoke/run_storage_failure_smoke.py
```

Komplett einschließlich aller Browsergruppen:

```bash
python3 scripts/validate.py --browser
```

Der Mehrprojekt-Smoke prüft auf Desktop und Mobil praktisch:

- Projektübersicht
- Neuanlage mit leerem Antwortsatz
- Umbenennen als neue Revision
- Duplikat mit eigener ID und Revision 1
- projektbezogenen Bericht
- Archiv und Wiederherstellung
- Papierkorb
- blockierte Falschbestätigung
- endgültiges Löschen
- automatischen sicheren Projektwechsel
- Erhalt eines unabhängigen Ausgangsprojekts

## Datenschutz und Offline-Betrieb

Der Anwendungskern enthält keine CDN-, Cloud- oder Netzpflicht. Projektstände und Berichte bleiben lokal im Browser. Eine manuelle Browserdaten-Bereinigung kann lokale Projekte löschen; ein geprüfter Projekt-JSON-Export und Import-Assistent folgt in einer späteren Iteration.

## Nächster Schritt

Einen sicheren Projekt-JSON-Export und Import-Assistenten entwickeln. Vor der Übernahme sollen Schema-Version, Prüfsumme, Projekt-ID, Fragen-IDs, Antwortwerte, Änderungen und Konflikte verständlich geprüft und angezeigt werden.
