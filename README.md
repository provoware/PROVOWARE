# PROVOWARE Entwicklungsplan-Assistent

## Projektstatus

Das Repository enthält einen startbaren, vollständig lokalen HTML-Prototyp mit datengetriebenem Fragenworkflow, versionierter IndexedDB, grafischer Speicherverwaltung und schrittweiser Projektschema-Migration.

**Version:** 0.5.0  
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
- unveränderliche Snapshots mit fortlaufender Revision und Prüfsumme
- automatischer Rückfall auf den jüngsten gültigen Snapshot
- grafische Snapshot-Liste, JSON-Vorschau und kontrollierte Wiederherstellung
- konfigurierbare Aufbewahrungsgrenze von 5 bis 200 Snapshots
- Schutz des letzten gültigen Sicherheitsstands
- schrittweise Migration von Projektschema `1.0.0` und `1.1.0` auf `1.2.0`
- Vorher-Sicherung und Migrationsprotokoll innerhalb derselben Transaktion
- reproduzierbare Quota-, Abbruch- und beschädigte-Snapshot-Szenarien

## Migrationsmatrix

| Ausgang | Schritt | Ergebnis |
|---|---|---|
| `1.0.0` | Standardtheme, aktuelle Frage und Zeitstempel normalisieren | `1.1.0` |
| `1.1.0` | Fragenkatalogversion und Validierungszeitpunkt ergänzen | `1.2.0` |
| `1.2.0` | keine Änderung | `1.2.0` |

Direktsprünge werden nicht verwendet. Jeder Schritt wird einzeln ausgeführt und protokolliert.

Vor der Nutzung eines älteren Hauptstands geschieht innerhalb einer einzigen IndexedDB-Transaktion:

1. unveränderte Vorher-Sicherung anlegen,
2. vorhandene Legacy-Snapshots als Original erhalten,
3. migrierte Snapshot-Kopien erzeugen,
4. neuen Hauptstand mit Schema `1.2.0` schreiben,
5. Metadaten und jeden Migrationsschritt protokollieren.

Scheitert ein Teil, wird die gesamte Transaktion zurückgerollt.

## Projektschema 1.2.0

Neu verbindlich sind:

- `questionCatalogVersion`
- `lastValidatedAt`

Damit bleibt nachvollziehbar, gegen welchen Fragenkatalog ein Projekt zuletzt geprüft wurde.

## Fehler- und Rückfalltests

Der separate Speicherfehlertest simuliert auf normalen Browsern:

- `QuotaExceededError` vor dem Schreiben,
- Transaktionsabbruch nach dem Schreiben des Hauptstands,
- mehrere beschädigte neuere Snapshots,
- Migration eines `1.1.0`-Hauptstands mit `1.0.0`- und `1.1.0`-Snapshots.

Bei Quota und Abbruch müssen Revision und Snapshotanzahl unverändert bleiben. Originale Legacy-Snapshots dürfen durch Migrationen nicht überschrieben werden.

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

Blockiert eine isolierte Umgebung lokale Navigation administrativ, melden die Runner dies ausdrücklich und führen einen eingebetteten Logik-/UI-Fallback aus. Dieser ersetzt keine spätere reale IndexedDB-Abnahme auf einem normalen Kubuntu-System.

## Datenschutz und Offline-Betrieb

Der Anwendungskern enthält keine CDN-, Cloud- oder Netzpflicht. Projektstände bleiben lokal im Browser. Browserdaten können durch manuelle Browserbereinigung verloren gehen; ein geprüfter JSON-Export folgt in einer späteren Iteration.

## Nächster Schritt

Den Berichtsgenerator auf ein gemeinsames Berichtsmodell umstellen und vollständige Ausgaben als Markdown, eigenständiges HTML, TXT und JSON erzeugen.
