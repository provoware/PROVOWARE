# PROVOWARE Entwicklungsplan-Assistent

## Projektstatus

Das Repository enthält einen startbaren, vollständig lokalen HTML-Prototyp mit datengetriebenem Fragenworkflow, versionierter IndexedDB und grafischer Speicherverwaltung.

**Version:** 0.4.0  
**Phase:** belastbarer P1-Prototyp  
**Zielplattform:** aktuelle Chromium- und Firefox-Browser unter Linux

## Start

### Empfohlener lokaler Start

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen. Dieser Modus lädt die getrennten JSON-Kataloge und erlaubt reguläre IndexedDB-Speicherung.

### Direkt öffnen

`index.html` kann per Doppelklick geöffnet werden. Blockiert der Browser getrennte JSON-Dateien unter `file://`, verwendet die Oberfläche sichtbar den eingebauten Beispieldatensatz. Es werden keine Daten ins Internet übertragen.

## Aktueller Funktionsumfang

- sechs mehrschichtig erklärte Entwicklungsfragen in vier Phasen
- Empfehlungsschaltfläche, Fortschritt und Live-Zusammenfassung
- Konflikterkennung für widersprüchliche Offline-/Cloud-Entscheidungen
- helles und dunkles Theme
- versionierte IndexedDB mit vier getrennten Stores
- transaktionales Speichern von Hauptstand, Snapshot, Metadaten und Protokolleintrag
- unveränderliche Snapshots mit fortlaufender Revision und Prüfsumme
- automatischer Rückfall auf den jüngsten gültigen Snapshot
- grafische Liste aller Snapshots mit Revision, Zeitpunkt, Speichergrund und Prüfergebnis
- JSON-Vorschau vor jeder manuellen Wiederherstellung
- Wiederherstellung erst nach ausdrücklicher Bestätigung und immer als neue Revision
- manueller Sicherheitsstand auf Knopfdruck
- konfigurierbare Aufbewahrungsgrenze von 5 bis 200 Snapshots
- Schutz des letzten gültigen Sicherheitsstands bei der Bereinigung

## Speicherverwaltung

Über **„Speicherstände verwalten“** öffnet sich ein modaler Arbeitsbereich.

1. Snapshot auswählen.
2. Revision, Zeitpunkt, Speichergrund und Gültigkeit prüfen.
3. Gespeicherte Antworten und Einstellungen in der Vorschau kontrollieren.
4. Bestätigungsfeld aktivieren.
5. Snapshot als neue Revision wiederherstellen.

Die ursprüngliche Revision bleibt unverändert erhalten. Eine Wiederherstellung überschreibt keinen historischen Snapshot.

## Aufbewahrungsregel

Die Standardgrenze beträgt 30 Snapshots. Zulässig sind 5 bis 200.

Beim Aufräumen bleiben erhalten:

- die neuesten Revisionen innerhalb der Grenze,
- zusätzlich zwingend der jüngste gültige Sicherheitsstand.

Ist dieser Sicherheitsstand älter als die normale Grenze, ersetzt er den ältesten regulären Platz. Die Grenze wird dadurch nicht überschritten.

## IndexedDB-Struktur

| Store | Zweck |
|---|---|
| `projects` | aktueller Projektstand |
| `snapshots` | unveränderliche Revisionsstände |
| `meta` | Schema-, Revisions-, Aufbewahrungs- und Speicherinformationen |
| `migrationLog` | Upgrades, Speicherungen, Wiederherstellungen und Bereinigungen |

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

Der Browser-Smoke prüft zusätzlich Snapshot-Liste, Vorschau, Bestätigung, Wiederherstellung und Aufbewahrungsgrenze auf Desktop und Mobil. Blockiert eine isolierte Umgebung lokale Navigation administrativ, wird ein ausdrücklich gemeldeter eingebetteter UI-Fallback ausgeführt.

## Datenschutz und Offline-Betrieb

Der Anwendungskern enthält keine CDN-, Cloud- oder Netzpflicht. Projektstände bleiben lokal im Browser. Browserdaten können durch manuelle Browserbereinigung verloren gehen; ein geprüfter JSON-Export folgt in einer späteren Iteration.

## Nächster Schritt

Eine echte Migrationsmatrix für mehrere Projektschemata und reproduzierbare Fehlerfälle ergänzen. Danach folgt der vollständige Berichtsgenerator für Markdown, HTML, TXT und JSON.
