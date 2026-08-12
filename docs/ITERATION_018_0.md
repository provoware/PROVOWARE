# I018.0 — Read-only Versions-/Manifestregistry-Vertrag

## Ziel

Kleinster P04-Schritt nach abgeschlossenem I017: genau eine autoritative Registryquelle read-only auflösen, bestehende `ProjektId` nur referenzieren und Widersprüche fail-closed blockieren.

## Umfang

- neue reine Vertragsschicht `src/provoware/vertraege/registry.py`
- keine Datei-I/O-, Persistenz-, GUI- oder Registry-Mutation
- bestehende I017-ID wird als typisierter Wert injiziert und niemals neu erzeugt
- `VERSIONSREGISTER.projektversion` muss `MANIFEST_PROJEKT.version` entsprechen
- `VERSIONSREGISTER.manifest_schema` muss `MANIFEST_PROJEKT.schema` entsprechen
- exakt eine Quelle ist erlaubt (`registry_source_count == 1`)

## Grenzen

- Registry-Persistenz: NICHT_IMPLEMENTIERT
- automatische Quellensuche: NICHT_IMPLEMENTIERT
- Manifest-Signatur/Hashbindung: NICHT_IMPLEMENTIERT
- Mehrprojekt-Registry: NICHT_IMPLEMENTIERT
- GUI: NICHT_IMPLEMENTIERT

## Risiko

Niedrig. Der Schritt liest nur bereits übergebene Mapping-Daten und liefert unveränderliche Ergebnisobjekte. Keine bestehende Persistenz oder Baseline wird verändert.

## Abnahme

PASS nur, wenn neue Contracttests, bestehende Regression, Ruff, Ruff-Format und mypy real erfolgreich laufen. Ein fehlender Workflow oder unbekannter Zustand ist NICHT_PASS.
