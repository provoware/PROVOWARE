# Offene Punkte

## P0
- I006: Clean-Bootstrap vollständig offline aus dem verifizierten I005-Wheelhouse nachweisen; zwei saubere Aufbauten müssen dieselbe installierte Paketliste und grüne Projektprüfungen liefern.
- I006: I005-Actions-Artefakt vor Nutzung per SHA-256 und interner Wheel-Hashliste prüfen.

## Danach
- P01-Gesamtcheckpoint abschließen.
- I007-I010: Verträge, Schemata und Architekturgate.
- Anschließend P03 ff. streng nach `PLAN_MASTER.json`.

## Release-Blocker
- Keine Stable-Freigabe vor vollständigem PoA, Fault-/Recovery-Nachweis, Real-Target-Abnahme und Release-Gates G0-G15.

## Langfristige Artefaktaufbewahrung
Das I005-GitHub-Actions-Artefakt besitzt 90 Tage Retention. Vor produktiver Offline-Nutzung muss die validierte Wheelhouse-Baseline zusätzlich in eine dauerhafte Projekt-/Release-Ablage mit identischem SHA-256 überführt werden.
