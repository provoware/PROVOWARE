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

## Persistenz

### Aktueller Projekt-Datensatz

```text
projects
└── id
    ├── revision
    ├── payload
    ├── checksum
    ├── savedAt
    └── reason
```

### Snapshot

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

### Migrationsstände

- `pre-migration-backup`: unveränderter Hauptstand vor der Migration
- `snapshot-migration`: migrierte Kopie eines Legacy-Snapshots
- `schema-migration`: neuer aktueller Projektstand im Zielschema

Legacy-Originale bleiben erhalten. Eine migrierte Kopie verweist über `sourceSnapshotId` auf ihre Quelle.

## Berichtsmodell 1.0.0

Das Berichtsmodell wird nicht separat gepflegt. Es wird bei Vorschau oder Export aus dem aktuellen Projektzustand, dem Fragenkatalog und den aktiven Regeln neu erzeugt.

```text
report
├── modelVersion
├── generatedAt
├── project
│   ├── id
│   ├── name
│   ├── schemaVersion
│   ├── questionCatalogVersion
│   ├── revision
│   ├── progress
│   └── status
├── summary
├── decisions[]
├── requirements[]
├── architecture
│   ├── principles[]
│   ├── components[]
│   ├── decisions[]
│   └── dataFlow[]
├── risks[]
├── testCases[]
├── acceptanceCriteria[]
├── milestones[]
├── openDecisions[]
└── traceability[]
```

### Kennungen

- `DEC-###`: bestätigte Entscheidung
- `REQ-###`: abgeleitete Anforderung
- `ADR-###`: Architekturentscheidung
- `RISK-###`: Risiko oder offener Konflikt
- `TEST-###`: Normal- oder Fehlerfalltest
- `AC-###`: Abnahmekriterium
- `MS-##`: Meilenstein
- `OPEN-###`: offene Entscheidung

### Rückverfolgbarkeit

Jeder Eintrag verbindet:

```text
Frage-ID → Anforderungs-ID → Testfall-IDs → Abnahmekriterium-ID
```

Renderer dürfen diese Beziehungen nicht neu berechnen oder verändern. Markdown, HTML, TXT und JSON verwenden dieselben Modellobjekte.

## Metadaten und Ereignisse

Der Store `meta` enthält:

- `project:<projectId>` für letzte Revision, Schema und Speichergrund
- `retention:<projectId>` für Aufbewahrungsgrenze und Änderungszeitpunkt

`migrationLog` dokumentiert Datenbank-Upgrades, Speicherungen, Wiederherstellungen, Migrationsschritte, Aufbewahrungsänderungen und Bereinigungen.

## Wiederherstellung

Ein historischer Snapshot wird nie verändert. Ein Legacy-Snapshot wird zuerst rein im Speicher schrittweise auf `1.2.0` migriert, anschließend validiert und danach als neue Revision mit dem Grund `manual-recovery` gespeichert.
