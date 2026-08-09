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

## Qualifikationslauf

- Workflow: `I008 Schema-Qualifikation`
- Run: `31336525158`
- Job: `93303182647`
- Branch-Head: `385ed6c1a069c13ec2814de232d79bacc06f41da`
- PR-Merge-Ref: `9bf74319ff3588265a054664387549177a2a41f7`
- Artifact-ID: `9044499048`
- Artifact-Größe: **0,000618 MB**
- Artifact-SHA-256: `8115fb9326ad2f2daed44b6d2c0f65c016d824d1290bb09203a57a827fae75db`
- Receipt-SHA-256: `dfd73aaebd746f0f4bba511ed183afeef3a33349da0c880dcc2bf8ce810fbb8e`

## Prüfungen

- I007-Baseline: GRÜN / 17 Register
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

Nach finaler Promotion von I008 folgt I009 mit den typisierten `OperationRequest`-/`OperationResult`-Verträgen. I010 bleibt anschließend das P02-Architekturgate.
