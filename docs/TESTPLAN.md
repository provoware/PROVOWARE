# Testplan

## L0 – Struktur und Syntax

- erwartete Dateien vorhanden
- JSON parsebar
- IDs eindeutig
- HTML-Verweise und Dialogelemente vorhanden
- Storage-Engine, UI und Storage-Manager in korrekter Reihenfolge geladen
- JavaScript syntaktisch gültig
- keine externen Laufzeitadressen

```bash
python3 scripts/validate.py
```

## L1 – Daten- und Speichervertrag

- Stores `projects`, `snapshots`, `meta` und `migrationLog` vorhanden
- Hauptstand, Snapshot, Metadaten und Protokoll werden gemeinsam geschrieben
- Snapshots werden ausschließlich per `add` angelegt
- Prüfsumme und automatische Recovery-Auswahl vorhanden
- manuelle Wiederherstellung schreibt eine neue Revision
- Aufbewahrungsgrenze liegt zwischen 5 und 200
- letzter gültiger Sicherheitsstand bleibt im Aufbewahrungsplan erhalten
- grafische Wiederherstellung verlangt Vorschau und Bestätigung

```bash
pytest -q tests/unit tests/integration
```

## L2 – automatisierter Browser-Smoke

Der Test läuft mit 1440×1000 und 390×844 und prüft praktisch:

- sechs Fragen und vier Phasen
- Empfehlung, Fortschritt, Theme und Konfliktampel
- Snapshot-Liste und Speicherstatistik
- Vorschau mit Prüfergebnis
- gesperrte Wiederherstellung vor Bestätigung
- freigegebene Wiederherstellung nach Bestätigung
- Wiederherstellung als neue Revision
- Änderung der Aufbewahrungsgrenze
- kein horizontales Überlaufen

```bash
python3 tests/smoke/run_browser_smoke.py
```

Kompletter Lauf:

```bash
python3 scripts/validate.py --browser
```

## Besonderheit isolierter Prüfumgebungen

Blockiert die Prüfumgebung lokale Browsernavigation administrativ, führt der Runner einen klar gekennzeichneten eingebetteten UI-Fallback aus. Dieser verwendet synthetische Snapshotdaten für die Dialogprüfung. Eine echte IndexedDB-Transaktionsabnahme muss zusätzlich auf einem normalen Linux-System erfolgen.

## Noch offen

- reale Screenreader-Abnahme
- Migrationsmatrix über mehrere Projektschemata
- Speicherquota- und Transaktionsabbruchtests
- geprüfter JSON-Export und Wiederimport
