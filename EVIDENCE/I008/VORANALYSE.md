# I008 — Voranalyse

## Ziel

Manifest- und Projektschemata werden als versionierte, strikt validierbare, deterministisch serialisierbare und GUI-/Persistenz-unabhängige Kernverträge eingeführt.

## Verbindliche Grenzen

- Die in I007 qualifizierten ID-Präfixe, Statuswerte und Ergebnisinvarianten gelten ab I008 als öffentliche API und werden nicht geändert.
- Schema-Version und Produktversion sind technisch getrennte Typen.
- `SchemaVersion` akzeptiert ausschließlich stabile numerische `MAJOR.MINOR.PATCH`-Versionen.
- `ProduktVersion` ist ein eigener Typ und darf zusätzlich einen Vorab-Suffix wie `-dev` tragen.
- Manifest- und Projektschema akzeptieren nur explizit definierte Pflichtfelder; unbekannte Felder werden abgewiesen.
- Keine Qt-, SQLite-, Datei-I/O- oder Modulabhängigkeit in der Schemaschicht.
- Keine optionalen Fachfelder, Datenbanktabellen, GUI-Verträge oder Modulmanifeste vorziehen.

## Minimaler I008-Vertrag

`ManifestSchema` enthält ausschließlich die für die Identität notwendige Hülle: Schema-Art, Schema-Version, Projekt-ID und Produktversion.

`ProjektSchema` enthält Schema-Art, Schema-Version, Projekt-ID, kanonischen Projektnamen, Produktversion und Status.

Die geringe Feldzahl ist absichtlich: I008 stabilisiert die Schema- und Validierungsmechanik, nicht spätere Fachinhalte.

## Fehlerstrategie

Schemafehler werden als `SchemaValidierungsfehler` mit stabilem Code, optionalem Feldbezug und menschenlesbarer Nachricht dargestellt. Lose Magic Strings an öffentlichen Grenzen werden vermieden.

## Golden Fixtures

Kleine kanonische JSON-Beispiele werden für gültige und ungültige Manifest-/Projektfälle eingeführt. Sie sichern insbesondere:

- Minimalvertrag,
- unbekannte Felder,
- fehlende Pflichtfelder,
- falsche Schema-Art,
- inkompatible Schema-Version,
- technische Trennung von Schema- und Produktversion.

## Abbruchkriterien

I008 wird nicht promoviert, wenn Baseline, Ruff, mypy strict, Contracttests, Golden-Fixtures, Architekturgrenze oder Gesamtregression rot sind.
