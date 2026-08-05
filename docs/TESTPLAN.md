# Testplan

## L0 – Struktur und Syntax

- erwartete Dateien vorhanden
- JSON parsebar
- IDs eindeutig
- Projektschema-Zielversion ist `1.2.0`
- Migrationsmatrix enthält `1.0.0 → 1.1.0 → 1.2.0`
- Migration-Engine wird vor Storage-Engine geladen
- JavaScript syntaktisch gültig
- keine externen Laufzeitadressen

```bash
python3 scripts/validate.py
```

## L1 – Daten-, Migrations- und Speichervertrag

- Stores `projects`, `snapshots`, `meta` und `migrationLog` vorhanden
- Hauptstand, Snapshot, Metadaten und Protokoll werden gemeinsam geschrieben
- Snapshots werden ausschließlich per `add` angelegt
- Legacy-Originale werden nicht überschrieben
- Vorher-Sicherung des Legacy-Hauptstands ist vorhanden
- jeder Migrationsschritt wird einzeln protokolliert
- `1.0.0` benötigt genau zwei Schritte
- `1.1.0` benötigt genau einen Schritt
- `1.2.0` ist idempotent
- Quota- und Abbruchhaken sind nur im Testmodus aktivierbar
- beschädigte Snapshot-Reihen werden absteigend nach dem jüngsten nutzbaren Stand durchsucht

```bash
pytest -q tests/unit tests/integration
```

## L2 – Workflow- und Speicherverwaltungs-Smoke

Der Haupttest läuft mit 1440×1000 und 390×844 und prüft:

- sechs Fragen und vier Phasen
- Empfehlung, Fortschritt, Theme und Konfliktampel
- Snapshot-Liste und Speicherstatistik
- Vorschau mit Prüfergebnis
- Bestätigung vor Wiederherstellung
- Wiederherstellung als neue Revision
- Aufbewahrungsgrenze
- kein horizontales Überlaufen

```bash
python3 tests/smoke/run_browser_smoke.py
```

## L2 – Speicherfehlerszenarien

Der zweite Browserlauf verwendet ausschließlich eindeutige Testprojekt-IDs und simuliert:

1. `QuotaExceededError` vor dem ersten Schreibvorgang,
2. Transaktionsabbruch nach vorgemerktes Schreiben des Hauptstands,
3. zwei beschädigte neuere Snapshots vor einem gültigen älteren Stand,
4. Legacy-Hauptstand `1.1.0` mit Snapshots aus `1.0.0` und `1.1.0`.

Abnahmekriterien:

- Quota und Abbruch verändern weder Revision noch Snapshotanzahl,
- beschädigte Snapshots werden übersprungen,
- Legacy-Hauptstand endet im Zielschema `1.2.0`,
- Original-Snapshots bleiben vorhanden,
- Migrationsabschluss und Einzelschritte stehen im Protokoll.

```bash
python3 tests/smoke/run_storage_failure_smoke.py
```

Kompletter Lauf:

```bash
python3 scripts/validate.py --browser
```

## Besonderheit isolierter Prüfumgebungen

Blockiert die Prüfumgebung lokale Browsernavigation administrativ, melden beide Runner dies ausdrücklich. Der Haupttest verwendet dann synthetische UI-Daten; der Speicherfehlertest prüft Migrationsmatrix, Fehlerklassifizierung und beschädigte Reihen rein eingebettet. Diese Fallbacks ersetzen keine echte IndexedDB-Abnahme auf einem normalen Kubuntu-System.

## Noch offen

- reale Kubuntu-Ausführung beider Browsergruppen
- reale Screenreader-Abnahme
- geprüfter JSON-Export und Wiederimport
- Ein-Datei-Release-Abnahme
