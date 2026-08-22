# CHECKPOINT 0.4.2 – Data Studio PRO

## Baseline

- Repository: `provoware/PROVOWARE`
- Branch: `main`
- Baseline-Commit: `acf36db29460b2ce25922aeaf065745c04c59176`
- Arbeitsbranch: `feat/0.4.2-data-studio-pro`
- Produktversion: `0.2.0`
- Project-Data-Schema: `1`
- Modulvertrag: `1`
- Workspace-Vertrag: `1`

## Abgenommene Ausgangsbasis

- Project Data Studio 0.4.0: Vorlagenbaukasten und CRUD.
- Recovery & Migration 0.4.1: Backup, Restore, Export/Import und Failure Injection.
- 0.4.1-E2E: Chromium-first Browser-E2E und proportionaler HTML-Mirror.
- letzter dokumentierter Core-Gate: 35 JavaScript-Dateien, 94 Projektdateien, 87/87 Node-Tests.
- letzter dokumentierter Browser-Gate: 2/2 Chromium-E2E.

## Unveränderliche Grenzen dieses Strangs

- keine Erhöhung des Project-Data-Schemas.
- keine SQLite-Einführung.
- keine relationale Feldlogik.
- keine Änderung des Workspace-Keys oder Workspace-Schemas.
- keine Remote-Persistenz.
- keine Browser-Zweitpersistenz für Project Data oder PRO-Metadaten.

## Rückweg

Alle Änderungen entstehen isoliert auf `feat/0.4.2-data-studio-pro` und werden erst nach Core-Gate, Chromium-E2E und Diff-Gate per Squash gemergt. Dadurch bleibt die komplette Stufe als einzelner Revert-Punkt rücknehmbar.
