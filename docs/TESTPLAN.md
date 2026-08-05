# Testplan

## L0 – Struktur und Syntax

- erwartete Dateien vorhanden
- JSON parsebar
- IDs eindeutig
- Projektschema-Zielversion ist `1.2.0`
- Migrationsmatrix enthält `1.0.0 → 1.1.0 → 1.2.0`
- Berichtsgenerator wird vor Berichtsverwaltung geladen
- JavaScript syntaktisch gültig
- keine externen Laufzeitadressen

```bash
python3 scripts/validate.py
```

## L1 – Daten-, Migrations-, Speicher- und Berichtsvertrag

- Stores `projects`, `snapshots`, `meta` und `migrationLog` vorhanden
- Hauptstand, Snapshot, Metadaten und Protokoll werden gemeinsam geschrieben
- Legacy-Originale werden nicht überschrieben
- `1.0.0` benötigt zwei Migrationsschritte
- `1.1.0` benötigt einen Migrationsschritt
- `1.2.0` ist idempotent
- Quota- und Abbruchhaken sind nur im Testmodus aktivierbar
- beschädigte Snapshot-Reihen werden korrekt durchsucht
- Berichtsmodell besitzt alle verbindlichen Hauptbereiche
- jede Anforderung verweist auf eine Quellenfrage
- Testfälle und Abnahmekriterien verweisen auf bekannte Anforderungen
- Markdown, HTML, TXT und JSON verwenden identische Anforderungskennungen
- Offline-HTML enthält keine externen Ressourcen

```bash
pytest -q tests/unit tests/integration tests/smoke/test_index.py
```

## L2 – Workflow-, Bericht- und Speicherverwaltungs-Smoke

Der Haupttest läuft mit 1440×1000 und 390×844 und prüft:

- sechs Fragen und vier Phasen
- Empfehlung, Fortschritt, Theme und Konfliktampel
- sechs abgeleitete Anforderungen
- zwölf Testfälle
- Konflikt als kritisches Risiko
- Rückverfolgbarkeit
- Markdown-, Offline-HTML- und JSON-Vorschau
- vier sichtbare Exportformate
- Snapshot-Liste und Speicherstatistik
- Bestätigung vor Wiederherstellung
- Wiederherstellung als neue Revision
- Aufbewahrungsgrenze
- kein horizontales Überlaufen

```bash
python3 tests/smoke/run_browser_smoke.py
```

## L2 – Speicherfehlerszenarien

Der zweite Browserlauf simuliert:

1. `QuotaExceededError` vor dem ersten Schreibvorgang,
2. vollständigen Transaktionsabbruch,
3. beschädigte neuere Snapshots,
4. Legacy-Hauptstand mit Legacy-Snapshots.

```bash
python3 tests/smoke/run_storage_failure_smoke.py
```

Kompletter lokaler Lauf:

```bash
python3 scripts/validate.py --browser
```

## Schnelle GitHub Actions-CI

`.github/workflows/ci.yml` läuft bei Push, Pull Request und manueller Ausführung.

Enthalten:

1. Python 3.12 und Node.js 20 einrichten,
2. Entwicklungsabhängigkeiten installieren,
3. `scripts/validate.py` ausführen,
4. Unit-, Integrations- und statischen Smoke-Test ausführen,
5. JavaScript-Syntax separat bestätigen,
6. Ergebnis in `GITHUB_STEP_SUMMARY` dokumentieren.

Die CI installiert keinen Browser und führt keine echte IndexedDB-Abnahme aus. Diese Trennung hält die schnelle Prüfung stabil und verhindert unnötige Laufzeit bei kleinen Patches.

## Besonderheit isolierter Prüfumgebungen

Blockiert die Prüfumgebung lokale Browsernavigation administrativ, melden die Runner dies ausdrücklich und verwenden klar gekennzeichnete eingebettete Fallbacks. Diese ersetzen keine echte IndexedDB-Abnahme auf einem normalen Kubuntu-System.

## Noch offen

- reale Kubuntu-Ausführung beider Browsergruppen
- reale Screenreader-Abnahme
- geprüfter Projekt-JSON-Import und Wiederimport
- Ein-Datei-Release-Abnahme
