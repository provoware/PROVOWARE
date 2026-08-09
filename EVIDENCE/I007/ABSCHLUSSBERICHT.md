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

## Qualifikationslauf

- Workflow: `I007 Kernverträge Qualifikation`
- Run: `31334879927`
- Job: `93298988745`
- Artifact-ID: `9044019124`
- Artifact-SHA-256: `4f828ff1e15c26c0c755715c23a6fcd62a51aae63e73012fb4a7aa19ea4dcd82`
- Receipt-SHA-256: `c1b5c4afde2f65773a88f59808e6e36a0a323b5fe2fb14d077cd96b27a595e24`

## Korrigierter Fehlversuch

Der erste I007-Lauf setzte `PIP_NO_INDEX=1` zu früh global. Dadurch konnte `actions/setup-python` seine eigene pip-Bereitstellung nicht abschließen. Die Offline-Sperre wurde anschließend korrekt auf den eigentlichen Toolchain-Installationsschritt begrenzt. Der folgende Lauf war vollständig grün.

## Precheck

DELTA-0003 wurde geschlossen. Zusätzlich wurden I005, I006 und Transfer V1 nach den Workflowänderungen erneut vollständig grün ausgeführt.

## Scope

Keine Fachlogik, keine Persistenz, keine GUI und keine Module wurden vorgezogen.
