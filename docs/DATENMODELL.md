# Datenmodell

## Projektstand

Projektschema `1.2.0` enthält:

- `schemaVersion`
- Projekt-ID und Name
- Antworten
- aktuelle Frage
- Theme
- `questionCatalogVersion`
- Erstellungs- und Änderungszeitpunkt
- `lastValidatedAt`

`questionCatalogVersion` dokumentiert, gegen welchen Fragenkatalog der Projektstand zuletzt geprüft wurde. `lastValidatedAt` hält den Zeitpunkt dieser Prüfung fest.

## Unterstützte Legacy-Schemata

| Version | Fehlende Angaben | Migrationsziel |
|---|---|---|
| `1.0.0` | Theme und gegebenenfalls aktuelle Frage | `1.1.0` |
| `1.1.0` | Fragenkatalogversion und Validierungszeitpunkt | `1.2.0` |
| `1.2.0` | keine | keine Migration |

## Aktueller Projekt-Datensatz

```text
projects
└── id
    ├── revision
    ├── payload
    ├── checksum
    ├── savedAt
    └── reason
```

## Snapshot

```text
snapshots
└── snapshotId = projectId:revision
    ├── projectId
    ├── revision
    ├── payload
    ├── checksum
    ├── savedAt
    ├── reason
    └── sourceSnapshotId (optional)
```

Snapshots werden ausschließlich mit `add` erzeugt. Eine vorhandene Snapshot-ID kann dadurch nicht still überschrieben werden.

## Migrationsstände

Mögliche Speichergründe:

- `pre-migration-backup`: unveränderter Hauptstand vor der Migration
- `snapshot-migration`: migrierte Kopie eines Legacy-Snapshots
- `schema-migration`: neuer aktueller Projektstand im Zielschema

Legacy-Originale bleiben erhalten. Eine migrierte Kopie verweist über `sourceSnapshotId` auf ihre Quelle.

## Metadaten

Der Store `meta` enthält:

- `project:<projectId>` für letzte Revision, Schema und Speichergrund
- `retention:<projectId>` für Aufbewahrungsgrenze und Änderungszeitpunkt

## Migrations- und Ereignisprotokoll

`migrationLog` dokumentiert:

- Datenbank-Upgrades
- Speicherungen
- automatische und manuelle Wiederherstellungen
- `schema-migration-step` für jeden Einzelschritt
- `schema-migration-complete` für den atomaren Abschluss
- geänderte Aufbewahrungsgrenzen
- Snapshot-Bereinigungen

Jeder Migrationsschritt enthält Ausgangs- und Zielversion sowie Projekt, Revision und gegebenenfalls Quell-Snapshot.

## Prüfergebnis eines Snapshots

Die Oberfläche beziehungsweise Storage-API leitet ab:

- `checksumValid`
- `schemaValid`
- `valid`
- `sourceSchemaVersion`
- `targetSchemaVersion`
- `migrationRequired`
- `migrationSteps`
- Validierungsfehler
- Kennzeichnung als jüngster gültiger Sicherheitsstand

## Wiederherstellung

Ein historischer Snapshot wird nie verändert. Ein Legacy-Snapshot wird zuerst rein im Speicher schrittweise auf `1.2.0` migriert, anschließend validiert und danach als neue Revision mit dem Grund `manual-recovery` gespeichert.
