# Testplan

## L0 – Struktur und Syntax

- erwartete Dateien vorhanden
- JSON parsebar
- IDs eindeutig
- Projektschema-Zielversion `1.2.0`
- Projekt-, Berichts- und Speichermodule in korrekter Reihenfolge geladen
- JavaScript syntaktisch gültig
- keine externen Laufzeitadressen

```bash
python3 scripts/validate.py
```

## L1 – Daten-, Speicher-, Berichts- und Mehrprojektvertrag

### Mehrprojektverwaltung

- alte Projekte ohne Lebenszyklusdatensatz gelten als aktiv
- Projektname besitzt 3 bis 80 Zeichen
- Projekt-ID ist eindeutig und schemafähig
- neues Projekt startet mit leerem Antwortobjekt
- Duplikat erhält neue ID und Revision 1
- Umbenennen erzeugt eine neue Revision
- Archiv und Papierkorb werden getrennt vom Projektschema gespeichert
- archivierte Projekte können nicht direkt geöffnet werden
- endgültiges Löschen ist nur im Papierkorb möglich
- exakter Projektname ist Pflicht
- alle vier IndexedDB-Stores werden bei endgültiger Löschung in einer Transaktion einbezogen
- Snapshots und Protokolle werden nur für die gewählte Projekt-ID entfernt
- Projektwechsel wartet auf ausstehende Speicherung
- nach Archivierung oder Papierkorb des aktuellen Projekts existiert ein aktives Ersatzprojekt

### Bestehende Verträge

- Migrationsmatrix `1.0.0 → 1.1.0 → 1.2.0`
- transaktionale Speicherung und unveränderliche Snapshots
- Quota- und Abbruchhaken nur im Testmodus
- gemeinsames Berichtsmodell für vier Renderer
- formatübergreifende Rückverfolgbarkeit

```bash
pytest -q tests/unit tests/integration tests/smoke/test_index.py
```

## L2 – Hauptworkflow

```bash
python3 tests/smoke/run_browser_smoke.py
```

Prüft Desktop und Mobil:

- Fragen und Phasen
- Empfehlung, Fortschritt, Theme und Konfliktampel
- Berichtsmodell und Formatvorschau
- Snapshot-Verwaltung und Wiederherstellung
- horizontales Überlaufen

## L2 – Mehrprojektverwaltung

```bash
python3 tests/smoke/run_project_management_smoke.py
```

Prüft Desktop und Mobil:

1. Projektübersicht öffnen.
2. aktuelles Projekt erkennen.
3. neues Projekt anlegen.
4. leeren Antwortstand bestätigen.
5. Projekt umbenennen und Revision 2 prüfen.
6. Projekt duplizieren.
7. neue ID und Revision 1 prüfen.
8. Bericht dem Duplikat zuordnen.
9. Projekt archivieren.
10. Archivprojekt wiederherstellen.
11. Projekt in Papierkorb verschieben.
12. falschen Löschname blockieren.
13. exakten Namen plus Bestätigung verlangen.
14. Projekt endgültig entfernen.
15. aktuelles Papierkorbprojekt sicher verlassen.
16. ursprüngliches unabhängiges Projekt erhalten.
17. horizontales Überlaufen ausschließen.

Jeder Lauf verwendet eindeutige Testprojekt-IDs und bereinigt seine Testprojekte abschließend.

## L2 – Speicherfehlerszenarien

```bash
python3 tests/smoke/run_storage_failure_smoke.py
```

Prüft Quota, Transaktionsabbruch, beschädigte Snapshots und Legacy-Migration.

## Gesamtlauf

```bash
python3 scripts/validate.py --browser
```

Der Gesamtvalidator führt die drei Browsergruppen in dieser Reihenfolge aus:

1. Workflow, Bericht und Snapshot-Oberfläche
2. Mehrprojektverwaltung
3. Speicherfehler und Migration

## GitHub Actions

Die schnelle CI führt L0 und L1 ohne Browserinstallation aus. Die drei Browsergruppen bleiben getrennte Release-Gates, damit kleine Änderungen nicht durch schwere GUI-Läufe verlangsamt werden.

## Besonderheit isolierter Prüfumgebungen

Blockiert eine Umgebung lokale Browsernavigation administrativ, verwenden die Runner einen ausdrücklich gemeldeten eingebetteten Adapter. Dieser prüft dieselbe Oberfläche und Lebenszykluslogik, ersetzt aber keine endgültige reale IndexedDB-Abnahme unter Kubuntu.

## Noch offen

- reale Kubuntu-Ausführung aller drei Browsergruppen
- reale Screenreader-Abnahme
- Projekt-JSON-Export und Import
- Ein-Datei-Release-Abnahme
