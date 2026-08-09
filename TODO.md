# Offene Punkte

## P0 — nächster Pflichtschritt
- I008: Manifest- und Projektschemata als versionierte, strikt validierbare Verträge definieren.
- I008: Pflichtfelder, unbekannte Felder und Schema-Versionierungsregeln vor Implementierung als Contract festlegen.
- I008: Schemafehler strukturiert abbilden und Qt-, SQLite-, Datei-I/O- sowie Modulabhängigkeiten technisch ausschließen.
- I008: `mypy --strict`, Contracttests, Ruff und vollständige schnelle Regression als Pflichtgates ausführen.

## P02 danach
- I009: OperationRequest/OperationResult-Verträge.
- I010: P02-Architekturgate und Gesamtqualifikation.
- Erst danach P03 gemäß `PLAN_MASTER.json`.

## Erledigt in I007
- ID-, Status-, Fehler- und Ergebnistypen qualifiziert.
- DELTA-0003 geschlossen: I005-Workflowfilter verengt.
- DELTA-0005 geschlossen: Transfer-V1-Autotrigger auf Transferänderungen begrenzt.
- DELTA-0006 geschlossen: I006-Workflowfilter verengt.
- 16 Contracttests und 33 Regressionstests grün; mypy strict und Ruff grün.

## Release-Blocker
- Keine Stable-Freigabe vor vollständigem PoA, Fault-/Recovery-Nachweis, Real-Target-Abnahme und Release-Gates G0-G15.

## Langfristige Artefaktaufbewahrung
Das I005-GitHub-Actions-Artefakt besitzt zeitlich begrenzte Retention. Vor produktiver Offline-Nutzung muss die validierte Wheelhouse-Baseline zusätzlich in eine dauerhafte Projekt-/Release-Ablage mit identischem SHA-256 überführt werden.
