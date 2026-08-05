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

Mehrprojekt- und Transferfunktionen verändern dieses Schema nicht. Archiv, Papierkorb und Aufbewahrung liegen in getrennten IndexedDB-Metadaten.

## Projektpaket 1.0.0

Ein exportiertes Projekt wird in einem äußeren Paket gespeichert:

```text
package
├── packageSchemaVersion = 1.0.0
├── applicationVersion
├── exportedAt
├── source
│   ├── projectId
│   ├── projectName
│   ├── revision
│   ├── lifecycle
│   ├── projectSchemaVersion
│   └── questionCatalogVersion
├── project
│   └── vollständiger Projekt-Payload
└── checksum
```

Die Prüfsumme wird aus allen Paketfeldern außer `checksum` in stabil sortierter Form gebildet. Sie erkennt typische Beschädigungen und unbeabsichtigte Änderungen. Sie ist keine kryptografische Signatur.

Das JSON-Schema liegt unter `schemas/project-package.schema.json`.

## Importvorschau

Die Importvorschau ist ein temporäres Arbeitsspeichermodell und wird vor der Übernahme nicht in IndexedDB geschrieben.

```text
preview
├── packageSchemaVersion
├── checksumExpected
├── checksumCalculated
├── checksumValid
├── sourceSchemaVersion
├── targetSchemaVersion
├── migrationRequired
├── migrationSteps[]
├── payload
├── existingProject
├── answerInspection
│   ├── unknownQuestionIds[]
│   ├── invalidAnswerValues[]
│   └── validAnswers[]
├── comparison
│   ├── identical
│   ├── fields[]
│   ├── answers.same[]
│   ├── answers.changed[]
│   ├── answers.added[]
│   ├── answers.missing[]
│   └── conflictCount
├── errors[]
├── allowedModes[]
└── recommendation
```

Nur eine Vorschau mit gültiger Prüfsumme, unterstütztem Schema, gültigem Namen, bekannten Fragen und zulässigen Antwortwerten darf übernommen werden.

## Importmodi

### `preserve`

- nur bei freier Projekt-ID
- ursprüngliche ID bleibt erhalten
- erster lokaler Stand erhält Revision 1

### `new`

- neue eindeutige Projekt-ID
- Projektname erhält eine sichtbare Importkennzeichnung
- neue Erstellungs- und Validierungszeit
- vorhandenes Projekt bleibt unverändert

### `replace`

- nur für ein aktives vorhandenes Projekt
- exakter lokaler Projektname und separates Bestätigungsfeld erforderlich
- vorhandener Projektstand wird zunächst mit `pre-import-backup` als neue Revision gesichert
- importierter Stand wird danach als `project-import-replace` gespeichert

Archiv- und Papierkorbprojekte bieten den Ersetzungsmodus nicht an.

## Mehrprojektmodell

### Aktueller Projektstand

```text
projects
└── id = projectId
    ├── revision
    ├── payload
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

Zulässige Zustände sind `active`, `archive` und `trash`. Fehlt der Datensatz, wird das Projekt als aktiv interpretiert.

### Projektbezogene Aufbewahrung

```text
meta
└── key = retention:<projectId>
    ├── projectId
    ├── limit
    └── updatedAt
```

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

Mögliche transferbezogene Speichergründe:

- `before-project-export`
- `project-imported`
- `project-imported-new-id`
- `pre-import-backup`
- `project-import-replace`

## Barrierefreiheits-Prüfergebnis

Die automatisierte Grundprüfung erzeugt ausschließlich einen flüchtigen Prüfbericht:

```text
a11yAudit
├── errors[]
├── warnings[]
├── passed
└── checkedAt
```

Dieser Bericht wird nicht als Ersatz für eine reale Screenreader-Abnahme gewertet.

## Berichtsmodell

Das Berichtsmodell wird bei Vorschau oder Export ausschließlich aus dem aktuell geöffneten Projekt erzeugt. Sein Kopf enthält Projekt-ID, Name, Projektschema und Revision. Damit ist jede Ausgabedatei eindeutig einem Projektstand zugeordnet.
