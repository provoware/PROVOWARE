# CHECKPOINT 0.4.3 – Recovery Envelope

Baseline `main`: `38061dc7359240259c1d7a88cfb99e7325998434`

Feature-Branch: `feat/0.4.3-recovery-envelope`

## Bereits abgenommen

- H1/H1b über PR #85 gemergt.
- kanonische Atomic-Schicht: `scripts/atomic-file.mjs`.
- Ubuntu-Portability: PASS.
- Windows-Portability: PASS.
- Node 20 + Node 24: PASS.
- 114/114 Node-Tests: PASS.
- Chromium 3/3: PASS.
- Project-Data-Schema: v1.
- Data-Studio-PRO-Schema: v1.
- Legacy-`.pwbak` bleibt unverändert.

## Offene Lücke

`data/project-data.json` und `data/data-studio-pro.json` bilden fachlich gemeinsam den Projektzustand, werden aber bisher nicht gemeinsam gesichert oder transaktional wiederhergestellt.

0.4.3 schließt ausschließlich diese Lücke.
