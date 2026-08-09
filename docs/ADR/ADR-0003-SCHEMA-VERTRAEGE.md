# ADR-0003 — Manifest- und Projektschemata als strikte Kernverträge

**Status:** vorgeschlagen in I008; Promotion nur nach grüner Qualifikation  
**Datum:** 2026-08-09

## Kontext

I007 hat die primitive Vertragsschicht für Identitäten, Zustände, Fehler und Operationsergebnisse qualifiziert. I008 benötigt darauf aufbauend eine kleine, stabile Schemahülle, ohne bereits Fachmodell, Persistenz oder GUI vorwegzunehmen.

## Entscheidung

1. `SchemaVersion` und `ProduktVersion` sind unterschiedliche Werttypen.
2. Schema-Versionen verwenden ausschließlich numerisches `MAJOR.MINOR.PATCH`.
3. Produktversionen dürfen einen expliziten Vorab-Suffix tragen, etwa `0.1.0-dev`.
4. Manifest- und Projektschema akzeptieren in I008 ausschließlich ihre festgelegten Pflichtfelder.
5. Unbekannte Felder werden standardmäßig abgewiesen. Forward-Kompatibilität wird künftig über explizite Schema-Versionen und Migrationen gelöst, nicht über stilles Ignorieren.
6. `ManifestSchema` bleibt auf Schema-Art, Schema-Version, Projekt-ID und Produktversion begrenzt.
7. `ProjektSchema` ergänzt nur Projektname und den bereits qualifizierten `Status`.
8. Schemafehler besitzen stabile Codes, Feldbezug und Nachricht.
9. Die I007-API wird per Contracttest eingefroren; Änderungen benötigen künftig einen expliziten migrationsfähigen Vertragswechsel.
10. Deterministische JSON-Serialisierung ist Teil des Vertrags.

## Folgen

### Positiv

- Persistenz, Import, Audit, Undo und Module erhalten später dieselbe stabile Sprachgrenze.
- Produktrelease und Daten-/Manifestformat können unabhängig voneinander versioniert werden.
- Golden-Fixtures machen Vertragsdrift sofort sichtbar.
- unbekannte oder zu neue Daten werden nicht still fehlinterpretiert.

### Kosten

- Erweiterungen erfordern einen bewussten Schema-Versionsschritt.
- Die strikte unbekannte-Felder-Regel ist konservativer als tolerantes Einlesen.

## Nicht entschieden

- Migration zwischen Schema-Major-Versionen.
- OperationRequest/OperationResult — I009.
- Datenbankpersistenz.
- Modulmanifest-Fachfelder.
- GUI-Darstellung von Schemafehlern.
