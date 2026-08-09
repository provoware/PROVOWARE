# Offene Punkte

## P0
- I007: ID-, Status-, Fehler- und Ergebnistypen als strikt typisierte Kernverträge definieren.
- I007: Contracttests und `mypy --strict` für die neue Vertragsschicht einführen.
- I007: Qt-, SQLite- und Modulabhängigkeiten aus der Vertragsschicht technisch ausschließen.

## P1 vor dem I007-Hauptpatch
- `DELTA-0003`: I005-GitHub-Actions-Trigger verengen. Der aktuelle Filter `tests/**` erzeugt bei fachfremden Teständerungen unnötig einen kompletten rund 294-MB-Wheelhouse-Neubau.

## Danach
- I008-I010: Manifest-/Projektschemata, OperationRequest/OperationResult und Architekturgate.
- Anschließend P03 ff. streng nach `PLAN_MASTER.json`.

## Release-Blocker
- Keine Stable-Freigabe vor vollständigem PoA, Fault-/Recovery-Nachweis, Real-Target-Abnahme und Release-Gates G0-G15.

## Langfristige Artefaktaufbewahrung
Das I005-GitHub-Actions-Artefakt besitzt 90 Tage Retention. Vor produktiver Offline-Nutzung muss die validierte Wheelhouse-Baseline zusätzlich in eine dauerhafte Projekt-/Release-Ablage mit identischem SHA-256 überführt werden.
