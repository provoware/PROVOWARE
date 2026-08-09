# I009 — Voranalyse, Schwachstellen und Inkonsistenzen

## Ausgangslage

I007 und I008 sind qualifiziert. I009 darf deshalb keine zweite ID-, Fehler-, Ergebnis- oder Schemarealität einführen, sondern muss die vorhandenen Verträge wiederverwenden.

## Gefundene Schwachstellen vor I009

### 1. Obsoleter paralleler I008-Pull-Request
PR #7 blieb nach der erfolgreichen Promotion über PR #8 offen und war nicht mehr mergebar. Das erzeugte eine widersprüchliche sichtbare Entwicklungsspur. **Korrektur:** PR #7 wurde geschlossen und explizit als durch PR #8 ersetzt dokumentiert.

### 2. I008-Workflow war nach eigener Promotion selbstblockierend
`i008-schemata.yml` erwartete fest `BASELINE-2026-08-09-I007`. Nach erfolgreicher I008-Promotion ist die aktuelle Baseline jedoch I008. Jede spätere PR-Änderung an der Vertragsschicht hätte dadurch den I008-Regressionsworkflow rot gemacht, obwohl I008 selbst unverändert gültig ist. **Korrektur:** Die Revalidierung prüft jetzt die jeweils aktuelle validierte Baseline und bindet die historische I008-Evidence separat an Artifact-ID und SHA-256.

### 3. Gefahr einer zweiten Ergebnissemantik
Ein eigenes Result-Modell neben `OperationErgebnis` würde die in I007 eingefrorenen Invarianten umgehen. **Entscheidung:** `OperationResult` kapselt ausschließlich `OperationErgebnis[OperationPayload]` und `FehlerInfo`.

### 4. Gefahr beliebiger, veränderlicher Payload-Dictionaries
Ein öffentliches `dict[str, Any]` wäre typseitig und deterministisch zu schwach und würde spätere Audit-, Replay-, Undo- und Persistenzpfade destabilisieren. **Entscheidung:** `OperationPayload` normalisiert tief in kanonisches JSON, ist unveränderlich, lehnt nicht unterstützte Typen und Fließkommazahlen ab und begrenzt Größe sowie Verschachtelung.

### 5. Fehlende kanonische Identität serialisierter Operationen
Ohne reproduzierbare Serialisierung wäre später nicht eindeutig belegbar, ob zwei Requests oder Results identisch sind. **Entscheidung:** Request, Result und Payload erhalten deterministische JSON-Darstellung sowie SHA-256-Fingerprint.

### 6. Gefahr vorgezogener Fach- und Handlersemantik
Eine feste Enum aller künftigen Fachoperationen wäre zum jetzigen Zeitpunkt eine unnötige öffentliche API-Fessel. **Entscheidung:** `OperationArt` ist ein strikt validierter Werttyp mit kanonischem Codeformat, aber ohne vorgezogene Handlerregistrierung oder Fachoperationen.

## Bewusst nicht in I009

- keine Handler oder Dispatcher,
- keine Command-Ausführung,
- keine SQLite- oder Dateischreiblogik,
- keine Qt-/GUI-Integration,
- keine Zeitstempel oder Laufzeitmessung im Vertrag,
- keine Revision-/Transaktionslogik,
- keine Moduloperationen.

## Sicherheits- und Robustheitsgrenzen

- Payload-Wurzel muss ein Objekt sein.
- keine Fließkommazahlen; damit keine NaN-/Infinity-/Binär-Rundungsmehrdeutigkeit.
- maximale Verschachtelungstiefe: 16.
- maximale Containergröße: 1024 Einträge.
- maximale kanonische Payload-Größe: 65.536 Byte.
- unbekannte Request-/Result-Felder werden fail-closed abgewiesen.
- Korrelation erfolgt ausschließlich über `OperationId`.

## Abbruchkriterien

I009 darf nicht promoviert werden, wenn I008-Evidence, I007/I008-Regressionsworkflows, Ruff, Ruff Format, mypy strict, Golden-Fixtures, Architekturgrenze, Contracttests oder Gesamtregression nicht vollständig grün sind.
