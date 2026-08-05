# PROVOWARE Entwicklungsplan-Assistent

## Projektstatus

Das Repository enthält einen startbaren, vollständig lokalen HTML-Prototyp mit datengetriebenem Fragenworkflow und versionierter IndexedDB-Speicherung.

**Version:** 0.3.0  
**Phase:** belastbarer P0-Prototyp und Beginn der P1-Kernfunktionen  
**Zielplattform:** aktuelle Chromium- und Firefox-Browser unter Linux

## Start

### Direkt öffnen

`index.html` im Browser öffnen. Falls der Browser getrennte JSON-Dateien unter `file://` blockiert, verwendet die Oberfläche sichtbar den eingebauten Beispieldatensatz.

### Empfohlener lokaler Start

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen. Dieser Modus lädt die getrennten JSON-Kataloge und erlaubt reguläre IndexedDB-Speicherung.

## Aktueller Funktionsumfang

- sechs mehrschichtig erklärte Entwicklungsfragen in vier Phasen
- Empfehlungsschaltfläche, Fortschritt und Live-Zusammenfassung
- Konflikterkennung für widersprüchliche Offline-/Cloud-Entscheidungen
- helles und dunkles Theme
- versionierte IndexedDB mit vier getrennten Stores
- transaktionales Speichern von Hauptstand, Snapshot, Metadaten und Protokolleintrag
- unveränderliche Snapshots mit fortlaufender Revision
- Prüfsumme für Hauptstand und Snapshots
- automatischer Rückfall auf den jüngsten gültigen Snapshot
- sichtbarer Speicherstatus mit Revision und Wiederherstellungshinweis

## IndexedDB-Struktur

| Store | Zweck |
|---|---|
| `projects` | aktueller Projektstand |
| `snapshots` | unveränderliche Revisionsstände |
| `meta` | Schema-, Revisions- und Speicherinformationen |
| `migrationLog` | Datenbank-Upgrades, Speicherungen und Wiederherstellungen |

## Prüfungen

```bash
python3 -m pip install -r requirements.txt
python3 scripts/validate.py
pytest -q
python3 tests/smoke/run_browser_smoke.py
```

Komplett einschließlich Browser-Smoke:

```bash
python3 scripts/validate.py --browser
```

Der Browser-Smoke prüft Desktop und Mobil, alle sechs Fragen, Phasennavigation, Empfehlung, Fortschritt, Theme, Konfliktampel und Überlauf. Auf normalen Systemen läuft er über einen lokalen HTTP-Server und prüft auch die echte IndexedDB-Wiederherstellung. Blockiert eine isolierte Umgebung lokale Navigation administrativ, wird ein ausdrücklich gemeldeter eingebetteter UI-Fallback ausgeführt.

## Datenschutz und Offline-Betrieb

Der Anwendungskern enthält keine CDN-, Cloud- oder Netzpflicht. Projektstände bleiben lokal im Browser. Ein späterer Export muss vor dem Schreiben validiert und in einer Vorschau angezeigt werden.

## Nächster Schritt

Autosave-Steuerung, Snapshot-Aufbewahrungsregeln und eine sichtbare Wiederherstellungsverwaltung mit manueller Auswahl älterer gültiger Stände entwickeln.
