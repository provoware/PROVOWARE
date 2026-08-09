# Offene Punkte

## P0 — nächster Pflichtschritt I009
- `OperationRequest` und `OperationResult` als strikt typisierte, serialisierbare und handlerunabhängige Operationsverträge definieren.
- Request/Result über die bestehende `OperationId` korrelieren; keine parallele Identität einführen.
- Fehler- und Erfolgssemantik auf den I007-Verträgen `FehlerInfo` und `OperationErgebnis` aufbauen statt eine zweite Ergebnislogik zu erzeugen.
- Payload-Grenze, Pflichtfelder, unbekannte Felder und deterministische Serialisierung vor Implementierung als Contract festlegen.
- Kanonische gültige und ungültige Golden-Fixtures für Request und Result ergänzen.
- Qt-, SQLite-, Handler-, Ausführungs- und Dateischreibabhängigkeiten technisch ausschließen.
- `mypy --strict`, Contracttests, Ruff und vollständige schnelle Regression als Pflichtgates ausführen.

## P02 danach
- I010: P02-Architekturgate und Gesamtqualifikation der I007-I009-Verträge.
- Erst nach grünem I010 P03 gemäß `PLAN_MASTER.json` beginnen.

## Erledigt in I008
- Schema- und Produktversion technisch getrennt.
- `ManifestSchema`, `ProjektSchema` und strukturierte Schemafehler qualifiziert.
- unbekannte Felder und fehlende Pflichtfelder strikt abgesichert.
- deterministische JSON-Serialisierung qualifiziert.
- gültige und ungültige Golden-Fixtures eingeführt.
- I007-ID-Präfixe, Statuswerte, Fehlerklassen und `OperationErgebnis`-Invarianten als öffentliche API eingefroren.
- Architekturwächter auf AST-basierte Import-/Dateizugriffsprüfung gehärtet.
- **30 Contracttests** und **48 Regressionstests** grün; mypy strict und Ruff grün.
- I007-Regressionsworkflow auf finalem I008-Head erneut grün.
- I007-Rückfallbasis auf `backup/vor-i008-promotion-2026-08-09` gesichert.

## Release-Blocker
- Keine Stable-Freigabe vor vollständigem PoA, Fault-/Recovery-Nachweis, Real-Target-Abnahme und Release-Gates G0-G15.

## Langfristige Artefaktaufbewahrung
Das I005-GitHub-Actions-Artefakt besitzt zeitlich begrenzte Retention. Vor produktiver Offline-Nutzung muss die validierte Wheelhouse-Baseline zusätzlich in eine dauerhafte Projekt-/Release-Ablage mit identischem SHA-256 überführt werden.
