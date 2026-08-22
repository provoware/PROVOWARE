# CHECKPOINT 0.4.1 – Recovery & Migration

## Baseline

- Repository: `provoware/PROVOWARE`
- Baseline-Branch: `main`
- Baseline-Commit: `a3f6f17d3e9c50bb83392588b6eec17ba8fb9d8f`
- Feature-Branch: `feat/0.4.1-recovery-migration`
- Produktversion bleibt: `0.2.0`
- Project-Data-Schema bleibt: `1`

## Ausgangslage

0.4.0 besitzt bereits:

- feste lokale Project-Data-Datei,
- atomaren Austausch über Temp-Datei + Rename,
- serialisierte Mutationen,
- serverseitige Schema-/Typprüfung,
- Same-Origin-Schutz,
- beschädigte-Datei-Erkennung,
- Node-20/24-CI,
- 66/66 grüne Tests im finalen 0.4.0-Branch-Gate.

## 0.4.1 ergänzt

- Recovery-Schicht statt Vermischung mit CRUD,
- Backups und Rotation,
- Restore-Vorschau,
- Export/Import mit Vorschau,
- Failure-Injection für Ersatzschreibvorgänge,
- Migrationsvertrag und isolierte v1→v2-Testfixture,
- eigene Recovery-Oberfläche.

## Nicht verändern

- Workspace-Vertrag Version 1,
- Workspace-Storage-Key,
- bestehende CRUD-Semantik,
- statischer `file://`-Fallback,
- freigegebene Produktversion,
- bestehende Modulvertragsversion.

## Rückweg

Alle 0.4.1-Änderungen bleiben bis zum grünen Gate auf dem isolierten Feature-Branch. Der spätere Merge erfolgt als Squash und ist dadurch als einzelner Revert rücknehmbar.
