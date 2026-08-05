# Testplan

## L0 – Struktur und Syntax

- erwartete Dateien vorhanden
- JSON und JSON-Schemata parsebar
- Projektschema-Zielversion `1.2.0`
- Projektpaketschema `1.0.0`
- Projekt-, Transfer-, A11y-, Berichts- und Speichermodule in korrekter Reihenfolge geladen
- JavaScript syntaktisch gültig
- keine externen Laufzeitadressen

```bash
python3 scripts/validate.py
```

## L1 – Reine Verträge

### Projekttransfer

- Exportpaket enthält Herkunft, Revision, Schema, Katalogversion und Projektstand
- Paketprüfsumme stimmt mit dem stabil serialisierten Kern überein
- Dateigröße über zwei MiB wird blockiert
- ungültiges JSON wird blockiert
- manipulierte Prüfsumme wird blockiert
- Legacy-Projekt `1.0.0` oder `1.1.0` wird ausschließlich über die Migrationsmatrix vorbereitet
- unbekannte Frage-IDs werden blockiert
- ungültige Antwortwerte werden blockiert
- vorhandene Projekt-ID wird erkannt
- Grundfelder sowie gleiche, geänderte, zusätzliche und fehlende Antworten werden verglichen
- identischer Projektstand bietet keine unnötige Übernahme an
- bei ID-Kollision ist neue ID die sichere Empfehlung
- Archiv- und Papierkorbprojekte besitzen keinen Ersetzungsmodus
- Ersetzen verlangt aktives Projekt, exakten Namen und separates Häkchen
- Vorher-Sicherung `pre-import-backup` ist im dauerhaften Ablauf vorhanden

### Zugänglichkeit

- alle Hauptdialoge besitzen gültiges `aria-labelledby`
- Schaltflächen und Formularfelder besitzen zugängliche Namen
- oberster Dialog wird als Fokusgrenze erkannt
- Tab und Umschalt+Tab bleiben im Dialog
- Escape wird zuerst über `cancel` an den obersten Dialog geleitet
- Auslöser je Dialog wird gespeichert
- Fokus kehrt nach Schließen zurück
- Pfeiltasten, Home und Ende werden für markierte Listen verarbeitet
- automatisierte Grundprüfung erkennt doppelte IDs, fehlende Beschriftungen und positive `tabindex`-Werte

### Bestehende Verträge

- Mehrprojekt-Lebenszyklus und projektbezogene Löschung
- Migrationsmatrix `1.0.0 → 1.1.0 → 1.2.0`
- transaktionale Speicherung und unveränderliche Snapshots
- Quota- und Abbruchhaken nur im Testmodus
- gemeinsames Berichtsmodell für vier Renderer

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

Prüft Desktop und Mobil den vollständigen Projektlebenszyklus von Neuanlage bis sicherer Löschung.

## L2 – Projekttransfer und Zugänglichkeit

```bash
python3 tests/smoke/run_transfer_accessibility_smoke.py
```

Prüft Desktop und Mobil:

1. automatisierte Barrierefreiheits-Grundprüfung ohne Fehler,
2. Fokus innerhalb des geöffneten Projektmanagers,
3. Pfeiltastennavigation zwischen Projektaktionen,
4. erstes Escape schließt eine Unteraktion,
5. zweites Escape schließt den Dialog,
6. Fokus kehrt zum tatsächlichen Auslöser zurück,
7. Umschalt+Tab bleibt im Transferdialog,
8. manipulierte Prüfsumme wird sichtbar blockiert,
9. gültige Projekt-ID-Kollision wird erkannt,
10. geänderte Antworten und Konfliktzahl werden angezeigt,
11. neue Projekt-ID ist sichere Standardoption,
12. Ersetzen bleibt bewusste Alternative,
13. falscher Bestätigungsname blockiert,
14. exakter Name plus Häkchen schaltet Ersetzen frei,
15. neue ID benötigt keine Ersetzungsbestätigung,
16. geprüfter Import wird als eigenes Projekt geöffnet,
17. horizontales Überlaufen ist ausgeschlossen.

Der reale Lauf verwendet eindeutige Projekt-IDs und bereinigt importierte Testprojekte. Der eingebettete Fallback verwendet einen funktionsgleichen flüchtigen Persistenzadapter.

## L2 – Speicherfehlerszenarien

```bash
python3 tests/smoke/run_storage_failure_smoke.py
```

Prüft Quota, Transaktionsabbruch, beschädigte Snapshots und Legacy-Migration.

## Gesamtlauf

```bash
python3 scripts/validate.py --browser
```

Der Gesamtvalidator führt vier Browsergruppen aus:

1. Workflow, Bericht und Snapshot-Oberfläche
2. Mehrprojektverwaltung
3. Projekttransfer und Zugänglichkeit
4. Speicherfehler und Migration

## GitHub Actions

Die schnelle CI führt L0 und L1 ohne Browserinstallation aus. Die vier Browsergruppen bleiben getrennte Release-Gates, damit kleine Änderungen nicht durch schwere GUI-Läufe verlangsamt werden.

## Besonderheit isolierter Prüfumgebungen

Blockiert eine Umgebung lokale Browsernavigation administrativ, verwenden die Runner einen ausdrücklich gemeldeten eingebetteten Adapter. Dieser prüft dieselbe Oberfläche und Fachlogik, ersetzt aber keine endgültige reale IndexedDB- oder Screenreader-Abnahme unter Kubuntu.

## Noch offen

- reale Kubuntu-Ausführung aller vier Browsergruppen
- reale Screenreader-Abnahme mit Orca und ergänzend NVDA oder VoiceOver
- Ein-Datei-Release-Abnahme
