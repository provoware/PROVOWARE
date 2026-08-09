# I008 — Manifest- und Projektschemata qualifiziert

## Ergebnis

I008 erweitert die in I007 qualifizierte Kernvertragsschicht um kleine, versionierte und strikt validierbare Manifest- und Projektschemata.

Qualifiziert wurden:

- `SchemaVersion` als eigener numerischer `MAJOR.MINOR.PATCH`-Typ,
- `ProduktVersion` als technisch getrennter Typ mit optionalem Vorab-Suffix,
- `ManifestSchema` mit minimaler Identitätshülle,
- `ProjektSchema` mit minimaler Projektidentität und qualifiziertem `Status`,
- `SchemaValidierungsfehler` mit stabilem Code, Feldbezug und Nachricht,
- deterministische JSON-Serialisierung,
- strikte Ablehnung unbekannter Felder,
- strikte Ablehnung fehlender Pflichtfelder und inkompatibler Schema-Versionen,
- kanonische gültige und ungültige Golden-Fixtures,
- I007-API-Freeze für ID-Präfixe, Statuswerte, Fehlerklassen und OperationErgebnis-Invarianten,
- AST-basierte Architekturgrenze gegen Qt-, SQLite-, Datei- und Modulabhängigkeiten.

## Finale Qualifikation und Promotion

- Workflow: `I008 Schema-Qualifikation`
- Run: `31336626886`
- Job: `93303450280`
- Branch-Head: `416b50175bb5ebdd420588ed05f31cd226b5e727`
- PR-Merge-Ref: `20dc7ee6813082ad00deb27586371c03754aa6a1`
- Main-Merge-Commit: `acfc4ed85c5bea8595e31313d6922375f9f16010`
- Rückfallzweig: `backup/vor-i008-promotion-2026-08-09`
- Artifact-ID: `9044527742`
- Artifact-Größe: **0,000618 MB**
- Artifact-SHA-256: `f58529730ac88675ab1b002130abca1f33e8ceffc4df8727c7a09e7ebf194e61`
- Receipt-SHA-256: `60d5db55ab1b95e77ad92cd7ae99781bd5b665c071ca95648f30cada5138f7ea`

## Prüfungen

- I007-Baseline: GRÜN / 17 Register
- I007-Regressionsworkflow auf finalem I008-Head: GRÜN
- Ruff Check: GRÜN
- Ruff Format: GRÜN / 15 Dateien
- mypy strict: GRÜN / 7 Quelldateien
- Contracttests: **30 bestanden**
- Gesamtregression: **48 bestanden**
- Golden-Fixtures: GRÜN
- I007-API-Freeze: GRÜN
- Schema-/Produktversions-Trennung: GRÜN
- Architekturimportgrenze: GRÜN

## Wichtige Korrekturen während der Qualifikation

Drei Vorvalidierungsfehler wurden nicht übergangen, sondern ursächlich korrigiert: Ruff-Abweichungen wurden auf das festgelegte Tooling ausgerichtet; der statisch unzulässige Vergleich zweier bewusst getrennter Versionstypen wurde durch einen Parser-Vertrag ersetzt; der Architekturwächter wurde von einer anfälligen Textsuche auf eine AST-basierte Import- und Dateizugriffsprüfung umgestellt.

## Scope

Keine Datenbank, keine GUI, keine Module, keine OperationRequest-/OperationResult-Implementierung und keine zusätzlichen Fachfelder wurden vorgezogen.

## Folgeschritt

I009 führt als nächsten P02-Schritt die typisierten `OperationRequest`-/`OperationResult`-Verträge ein. I010 bleibt anschließend das P02-Architekturgate.
