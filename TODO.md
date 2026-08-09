# Offene Punkte

## P0 — nächster Pflichtschritt I010
- P02 als gemeinsames Architektur- und Vertragsgate über I007-I009 qualifizieren.
- Öffentlich exportierte I007-I009-Symbole als maschinenlesbaren API-Snapshot erfassen und gegen unbeabsichtigte Drift sichern.
- Exaktes Produktquellinventar prüfen, damit neue unregistrierte Produktdateien nicht unbemerkt die Architekturgrenze umgehen.
- ID-Präfixe, Statuswerte, Fehlerklassen und `OperationErgebnis`-Invarianten gemeinsam revalidieren.
- Manifest-, Projekt- und Operationsschema samt getrennter Versionsnamensräume revalidieren.
- AST-Abhängigkeitsmatrix über die gesamte P02-Produktvertragsschicht ausführen: keine Qt-, SQLite-, Datei-I/O-, Handler-, Persistenz- oder Modulabhängigkeit.
- Deterministische Serialisierung und Golden-Fixtures aus I008/I009 vollständig wiederverwenden.
- Traceability Architektur -> Komponente -> Implementierung -> Test -> Evidence für P02 schließen.
- Ruff, Ruff Format, mypy strict, Contracttests und vollständige Regression als ein reproduzierbares I010-Gesamtgate aus dem I005-Wheelhouse ausführen.
- `PLAN_MASTER.json` P02 erst nach erfolgreicher I010-Promotion auf `VALIDIERT` setzen.
- Keine P03-Funktion in I010 vorziehen.

## Danach
- I011 startet P03 ausschließlich nach grünem I010 und validierter P02-Baseline.

## Erledigt in I009
- `OperationArt`, `OperationPayload`, `OperationRequest` und `OperationResult` qualifiziert.
- Request-/Result-Korrelation ausschließlich über `OperationId` festgelegt.
- Payload tief validiert, kanonisiert und begrenzt; Fließkommazahlen ausgeschlossen.
- `OperationResult` verwendet ausschließlich `OperationErgebnis` und `FehlerInfo`.
- deterministische JSON-Serialisierung und SHA-256-Fingerprints qualifiziert.
- gültige und ungültige Golden-Fixtures ergänzt.
- I008-Regressionsworkflow promotionsfest korrigiert.
- obsoleten PR #7 geschlossen.
- 49 Contracttests und 68 Gesamtregressionstests grün; Ruff und mypy strict grün.
- I007- und I008-Regressionsworkflows auf finalem I009-Head grün.
- I008-Rückfallbasis auf `backup/vor-i009-promotion-2026-08-09` gesichert.

## Release-Blocker
- Keine Stable-Freigabe vor vollständigem PoA, Fault-/Recovery-Nachweis, Real-Target-Abnahme und Release-Gates G0-G15.

## Langfristige Artefaktaufbewahrung
Das I005-GitHub-Actions-Artefakt besitzt zeitlich begrenzte Retention. Vor produktiver Offline-Nutzung muss die validierte Wheelhouse-Baseline zusätzlich in eine dauerhafte Projekt-/Release-Ablage mit identischem SHA-256 überführt werden.
