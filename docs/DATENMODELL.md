# Datenmodell

## Projektstand

Projektschema `1.1.0` enthält:

- Schema-Version
- Projekt-ID und Name
- Antworten
- aktuelle Frage
- Theme
- Erstellungs- und Änderungszeitpunkt

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
    └── reason
```

Snapshots werden ausschließlich mit `add` erzeugt. Eine vorhandene Snapshot-ID kann dadurch nicht still überschrieben werden.

## Metadaten

Der Store `meta` enthält zwei getrennte Schlüsseltypen:

- `project:<projectId>` für letzte Revision, Schema und Speichergrund
- `retention:<projectId>` für Aufbewahrungsgrenze und Änderungszeitpunkt

## Migrations- und Ereignisprotokoll

`migrationLog` dokumentiert:

- Datenbank-Upgrades
- Speicherungen
- automatische und manuelle Wiederherstellungen
- geänderte Aufbewahrungsgrenzen
- Snapshot-Bereinigungen

## Prüfergebnis eines Snapshots

Die Oberfläche leitet für jeden Snapshot ab:

- `checksumValid`
- `schemaValid`
- `valid`
- Validierungsfehler
- Kennzeichnung als jüngster gültiger Sicherheitsstand

## Wiederherstellung

Ein historischer Snapshot wird nie verändert. Sein Payload wird erneut geprüft und als neue Revision mit dem Grund `manual-recovery` gespeichert.
