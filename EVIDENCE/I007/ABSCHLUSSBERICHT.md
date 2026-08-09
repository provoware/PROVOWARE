# I007 — Kernverträge abgeschlossen

## Ergebnis

I007 führt die erste produktive P02-Vertragsschicht ein, ohne GUI-, SQLite-, Datei- oder Modulabhängigkeit.

Validiert wurden:

- `ProjektId`, `ObjektId`, `RevisionId`, `ChangeId`, `OperationId`
- kanonische Präfix-UUID-Formate
- `Status` als stabiler Maschinenzustand
- `Fehlerklasse` und `FehlerInfo`
- `OperationErgebnis[T]` mit widerspruchsfreien Erfolgs-/Fehlerinvarianten
- Architekturgrenze gegen Qt/SQLite
- Ruff Check und Format
- mypy strict
- 16 Contracttests
- 33 Tests Gesamtregression

## Finale Qualifikation

- Workflow: `I007 Kernverträge Qualifikation`
- Run: `31335066204`
- Job: `93299485576`
- qualifizierter Branch-Head: `fa2a4751c6a5c3baf0b3b2e78485fb3142de04ef`
- PR-Merge-Ref: `b40666adcabba585ecd9fd150150469b9857f447`
- Main-Merge-Commit: `9b8c18a99f2433e3f7ded5f09dd1f5a5804041ae`
- Artifact-ID: `9044073684`
- Artifact-Größe: `575 Byte` = **0,000575 MB**
- Artifact-SHA-256: `007a7f0412274a1dcf72379202f87f3fa7629be4de6dd500534ed4a88373a909`
- Receipt-SHA-256: `11cb28d66188298496c65059918d707b17a1cb4e95087c8368e6c9aa49221d33`

## Postcheck

Nach der letzten Workflow-/Evidence-Fassung wurden zusätzlich erneut vollständig grün ausgeführt:

- I005 Wheelhouse: Run `31335066186`
- I006 Clean-Bootstrap: Run `31335066190`
- Transfer V1 End-to-End: Run `31335066203`
- I007 Kernverträge: Run `31335066204`

## Korrigierter Fehlversuch

Der erste I007-Lauf setzte `PIP_NO_INDEX=1` zu früh global. Dadurch konnte `actions/setup-python` seine eigene pip-Bereitstellung nicht abschließen. Die Offline-Sperre wurde anschließend korrekt auf den eigentlichen Toolchain-Installationsschritt begrenzt. Die folgenden Läufe waren vollständig grün.

## CI-Sparsamkeit

DELTA-0003, DELTA-0005 und DELTA-0006 wurden geschlossen. I005 und I006 reagieren nicht mehr auf beliebige fachfremde Teständerungen; Transfer V1 wird nicht mehr durch allgemeine Produktstatusänderungen automatisch als veraltete I006-Baseline neu gebaut.

## Rückfall

Der I006-main-Stand vor I007 bleibt auf `backup/vor-i007-promotion-2026-08-09` erhalten.

## Scope

Keine Fachlogik, keine Persistenz, keine GUI und keine Module wurden vorgezogen.
