# I009 — Operationsverträge qualifiziert

## Ergebnis

I009 schließt die öffentliche Request-/Result-Vertragsgrenze innerhalb P02. Die bereits qualifizierten I007-Identitäts-, Fehler- und Ergebnisverträge sowie die I008-Schemaregeln werden wiederverwendet statt parallel neu definiert.

Qualifiziert wurden:

- `OperationArt` als streng validierter Operationscode ohne vorgezogene Handler-Enum,
- `OperationPayload` als unveränderliche kanonische JSON-Objekthülle,
- tiefe Payload-Validierung mit Größen-, Tiefen- und Schlüsselgrenzen,
- explizite Ablehnung von Fließkommazahlen für eindeutige kanonische Semantik,
- `OperationRequest` mit Schema, `OperationId`, Art und Payload,
- `OperationResult` auf Basis von `OperationErgebnis[OperationPayload]` und `FehlerInfo`,
- Request-/Result-Korrelation ausschließlich über `OperationId`,
- deterministische JSON-Serialisierung und SHA-256-Fingerprints,
- fail-closed Ablehnung unbekannter Request-/Result-Felder,
- kanonische gültige und ungültige Golden-Fixtures,
- AST-basierte Architekturgrenze gegen Handler-, GUI-, SQLite-, Persistenz- und Dateizugriffe.

## Vorab behobene Inkonsistenzen

Der obsolete parallele I008-PR #7 wurde geschlossen. Zusätzlich wurde der I008-Regressionsworkflow promotionsfest gemacht: Statt nach I008 weiterhin hart die I007-Baseline zu verlangen, revalidiert er jetzt die aktuelle validierte Baseline und bindet die historische I008-Evidence separat an ihre Artifact-ID und SHA-256.

## Finale PR-Qualifikation

- Pull Request: `#9`
- Branch: `iteration/i009-operationen`
- Branch-Head: `b4ae4a4ef54dff3fabfa6b428f7e62af91100a3f`
- PR-Merge-Ref: `2b197fed99c2f3be7794f9bc1caa2afe0391a998`
- Main-Merge-Commit: `5f94bfc43c038530738d1a320ba6c9a050b39a17`
- Rückfallzweig: `backup/vor-i009-promotion-2026-08-09`
- Workflow-Run: `31337914639`
- Job: `93306696652`
- Artifact-ID: `9044902480`
- Artifact-Größe: **0,000663 MB** (`663 Byte`)
- Artifact-SHA-256: `962e8e45bb2df60a6ead6750bf9b737520ea30290eabf3df73510a10ef7ec5f9`
- Receipt-SHA-256: `46b8bb9f9f6fa215f70c7fb89fe7afaf884ece0918e02055daa11eb5e4a05e23`

## Prüfungen

- aktuelle Baseline: GRÜN / 17 Register,
- historische I008-Evidence: GRÜN / hashgebunden,
- I007-Regressionsworkflow: GRÜN / Run `31337914654`,
- I008-Regressionsworkflow: GRÜN / Run `31337914673`,
- Ruff Check: GRÜN,
- Ruff Format: GRÜN / 17 Dateien,
- mypy strict: GRÜN / 9 Quelldateien,
- Contracttests: **49 bestanden**,
- Gesamtregression: **68 bestanden**,
- Golden-Fixtures: GRÜN,
- Payload-Kanonisierung und Grenzen: GRÜN,
- Request-/Result-Korrelation: GRÜN,
- SHA-256-Fingerprints: GRÜN,
- Architekturimportgrenze: GRÜN.

## Scope

Keine Handler, keine Dispatcher, keine Ausführung, keine SQLite-/Dateischreiblogik, keine GUI, keine Revision-/Transaktionslogik und keine Module wurden vorgezogen.

## Folgeschritt

I010 schließt P02 durch ein Gesamt-Architekturgate über I007-I009. Erst wenn diese kombinierte Vertrags- und Importgrenze vollständig grün ist, darf P03 beginnen.
