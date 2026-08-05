# Testplan

## L0 – Struktur und Syntax

- erwartete Dateien vorhanden
- JSON parsebar
- IDs eindeutig
- Regelverweise gültig
- HTML-Verweise vorhanden
- Storage-Engine wird vor dem State-Manager geladen
- JavaScript syntaktisch gültig
- keine externen Laufzeitadressen

```bash
python3 scripts/validate.py
```

## L1 – Daten- und Speichervertrag

- Projektschema `1.1.0` akzeptiert gültige Prüfdaten
- Stores `projects`, `snapshots`, `meta` und `migrationLog` vorhanden
- Hauptstand, Snapshot, Metadaten und Protokoll werden gemeinsam geschrieben
- Snapshots werden ausschließlich per `add` angelegt
- Prüfsumme und Recovery-Auswahl sind vorhanden

```bash
pytest -q tests/unit tests/integration
```

## L2 – automatisierter Browser-Smoke

Der Test läuft mit 1440×1000 und 390×844 und prüft praktisch:

- sechs Fragen und vier Phasen
- Phasennavigation
- Empfehlungsschaltfläche
- Fortschritt bis 100 Prozent
- Themewechsel
- Konfliktampel
- horizontales Überlaufen
- auf normalen Systemen: echte IndexedDB-Speicherung und automatische Wiederherstellung

```bash
python3 tests/smoke/run_browser_smoke.py
```

Kompletter Lauf:

```bash
python3 scripts/validate.py --browser
```

## Besonderheit isolierter Prüfumgebungen

Die OpenAI-Prüfumgebung kann lokale HTTP- und `file://`-Navigation administrativ blockieren. Der Runner meldet das ausdrücklich und führt dann einen eingebetteten UI-Fallback aus. Dieser prüft Oberfläche, Workflow und die reine Recovery-Auswahl, ersetzt aber keine spätere echte IndexedDB-Abnahme auf einem normalen Linux-System.

## Noch offen

- reale Screenreader-Abnahme
- Migrationsmatrix über mehrere Projektschemata
- Speicherquota- und Abbruchtests
- Snapshot-Aufbewahrung und manuelle Wiederherstellung
