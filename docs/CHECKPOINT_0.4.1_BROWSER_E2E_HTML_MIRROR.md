# CHECKPOINT 0.4.1-E2E – Chromium Gate & HTML UI Mirror

## Baseline

`main` vor diesem Strang:

`7f59c727bcef6b959e3fcc49d7c796b088bc197a`

## Unveränderte Verträge

- Produktversion bleibt `0.2.0`.
- Modulvertrag bleibt Version `1`.
- Workspace-Vertrag bleibt Version `1`.
- Project-Data-Produktionsschema bleibt Version `1`.
- Backup-Limit bleibt 10.
- lokale Runtime bleibt ohne npm-Laufzeitabhängigkeit.
- `npm run verify` bleibt der schnelle paketfreie Core-Gate.

## Neuer Prüfvertrag

- Chromium ist der automatische Browser-E2E-Primärlauf.
- Firefox ist ein separater optionaler Alternativlauf.
- Browser-E2E arbeitet in einer temporären Projektkopie.
- echte Nutzdaten der Arbeitskopie dürfen nicht verändert werden.
- HTML-Mirror lädt die reale Anwendung zweimal statt eine Attrappe nachzubauen.
- Mirror-PASS basiert auf identischem internem Layout und nachgewiesenem Skalierungsfaktor.
- Screenshots dienen als Evidenz und Diagnose.

## Rückweg

Der gesamte Strang liegt auf `feat/0.4.1-browser-e2e-html-mirror` und soll per Squash gemergt werden. Dadurch bleibt ein einzelner Revert-Punkt erhalten.
