# Datenmodell

## Projektschema

Das fachliche Projektschema bleibt bei `1.2.0` und enthält:

- `schemaVersion`
- `projectId`
- Projektname
- Antworten
- aktuelle Frage
- Theme
- `questionCatalogVersion`
- Erstellungs- und Änderungszeitpunkt
- `lastValidatedAt`

Mehrprojektfunktionen verändern dieses Schema nicht. Archiv und Papierkorb liegen bewusst in getrennten IndexedDB-Metadaten.

## Mehrprojektmodell

### Aktueller Projektstand

```text
projects
└── id = projectId
    ├── revision
    ├── payload
    │   ├── projectId
    │   ├── name
    │   ├── answers
    │   └── weitere Projektschemafelder
    ├── checksum
    ├── savedAt
    └── reason
```

Jede Projekt-ID besitzt maximal einen aktuellen Datensatz.

### Projektlebenszyklus

```text
meta
└── key = lifecycle:<projectId>
    ├── projectId
    ├── state
    ├── archivedAt
    ├── trashedAt
    ├── restoredAt
    └── updatedAt
```

Zulässige Zustände:

- `active`
- `archive`
- `trash`

Fehlt der Datensatz, wird das Projekt als `active` interpretiert. Dadurch bleiben ältere Projektstände ohne zusätzliche Migration nutzbar.

### Projektbezogene Aufbewahrung

```text
meta
└── key = retention:<projectId>
    ├── projectId
    ├── limit
    └── updatedAt
```

Jedes Projekt besitzt eine eigene Aufbewahrungsgrenze.

### Snapshots

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

Der Index `projectId` ermöglicht eine streng projektbezogene Liste und Löschung. Revisionen verschiedener Projekte dürfen dieselbe Nummer besitzen, da die Eindeutigkeit aus Projekt-ID und Revision entsteht.

### Ereignisprotokoll

`migrationLog` enthält zusätzlich zum bisherigen Speicher- und Migrationsprotokoll:

```text
type: project-lifecycle
projectId
fromState
toState
createdAt
```

## Projektanlage

Ein neues Projekt erhält:

- geprüften Namen
- eindeutige, lesbare Projekt-ID mit zufälligem Suffix
- Revision 1
- leeres Antwortobjekt
- erste Workflowfrage
- aktuelles Theme
- aktuelle Fragenkatalogversion
- eigene Snapshot-Folge

## Umbenennen

Der Name liegt im Projekt-Payload. Umbenennen erzeugt daher eine neue Projekt-Revision und einen neuen Snapshot. Frühere Snapshots behalten den damaligen Namen und bleiben historisch nachvollziehbar.

## Duplizieren

Ein Duplikat übernimmt die fachlichen Antworten und Einstellungen, setzt aber neu:

- `projectId`
- Name
- `createdAt`
- `updatedAt`
- `lastValidatedAt`
- Revision auf 1

Snapshots, Metadaten und Protokolle des Ausgangsprojekts werden nicht kopiert.

## Archiv und Papierkorb

Archivieren oder Verschieben in den Papierkorb verändert nur den Lebenszyklusdatensatz. Projektstand und Snapshots bleiben unverändert erhalten.

Wiederherstellen setzt den Zustand auf `active` und protokolliert `restoredAt`.

## Endgültige Löschung

Nach exakter Namensbestätigung werden in einer gemeinsamen Transaktion entfernt:

- `projects[projectId]`
- alle Snapshots mit passendem `projectId`
- `project:<projectId>`
- `retention:<projectId>`
- `lifecycle:<projectId>`
- weitere Metadaten mit passendem `projectId`
- alle Ereignis- und Migrationsprotokolle mit passendem `projectId`

Andere Projekte bleiben unberührt.

## Berichtsmodell

Das Berichtsmodell wird bei Vorschau oder Export ausschließlich aus dem aktuell geöffneten Projekt erzeugt. Sein Kopf enthält Projekt-ID, Name, Projektschema und Revision. Damit ist jede Ausgabedatei eindeutig einem Projektstand zugeordnet.
