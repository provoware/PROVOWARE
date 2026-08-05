# Projektordnerstruktur

## Zielstruktur

```text
PROVOWARE/
├── .github/workflows/ci.yml
├── README.md
├── TODO.md
├── CHANGELOG.md
├── SCHWACHSTELLEN.md
├── AGENTS.md
├── UPGRADEPOOL.md
├── PROJEKTORDNERSTRUKTUR.md
├── requirements.txt
├── index.html
├── css/
│   ├── variables.css
│   ├── layout.css
│   ├── components.css
│   ├── themes.css
│   └── project-manager.css
├── js/
│   ├── app.js
│   ├── migration-engine.js
│   ├── storage-engine.js
│   ├── project-repository.js
│   ├── project-manager.js
│   ├── storage-manager.js
│   ├── state-manager.js
│   ├── workflow-engine.js
│   ├── rule-engine.js
│   ├── validation-engine.js
│   ├── report-generator.js
│   ├── report-manager.js
│   └── ui/app-ui.js
├── data/
│   ├── questions.json
│   ├── rules.json
│   ├── templates.json
│   └── prompts.json
├── schemas/
│   ├── project.schema.json
│   ├── template.schema.json
│   └── questions.schema.json
├── tests/
│   ├── unit/
│   │   ├── test_catalogs.py
│   │   ├── test_storage_contract.py
│   │   ├── test_migration_matrix.py
│   │   ├── test_storage_failures.py
│   │   ├── test_report_generator.py
│   │   └── test_project_management.py
│   ├── integration/test_structure.py
│   ├── smoke/
│   │   ├── test_index.py
│   │   ├── browser-smoke.js
│   │   ├── run_browser_smoke.py
│   │   ├── project-management-smoke.js
│   │   ├── run_project_management_smoke.py
│   │   ├── failure-harness.html
│   │   ├── storage-failure-smoke.js
│   │   └── run_storage_failure_smoke.py
│   └── fixtures/
│       ├── project-v1.0.0.json
│       ├── project-v1.1.0.json
│       └── project-valid.json
├── scripts/
│   ├── build.py
│   ├── validate.py
│   └── release.py
├── docs/
│   ├── ARCHITEKTUR.md
│   ├── DATENMODELL.md
│   ├── TESTPLAN.md
│   └── BEDIENHILFE.md
└── dist/.gitkeep
```

## Verantwortlichkeiten

- `storage-engine.js`: IndexedDB, Revisionen, Snapshots, Migration und Wiederherstellung
- `project-repository.js`: Projektübersicht, Projektanlage, Duplikate, Lebenszyklus und vollständige Löschung
- `project-manager.js`: grafische Suche, Filter, Projektaktionen und sichere Bestätigungen
- `storage-manager.js`: Snapshot-Liste und kontrollierte Wiederherstellung
- `report-generator.js`: formatneutrales Berichtsmodell und Renderer
- `report-manager.js`: Vorschau, Prüfung und lokaler Download
- `state-manager.js`: ausschließlich der aktuell geöffnete Anwendungszustand
- `app.js`: serialisierte Speicherung und sicherer Wechsel zwischen Projekten

## Regeln

1. Keine Fachlogik direkt in `index.html`, sofern sie als Modul testbar ist.
2. Die Storage-Engine bleibt allein für allgemeine IndexedDB-Speichervorgänge verantwortlich.
3. Die Projekt-Persistenz verwendet dieselben Stores und trennt Datensätze konsequent über `projectId`.
4. Projektlebenszyklusdaten liegen getrennt vom Projektschema unter `lifecycle:<projectId>`.
5. Archivierte Projekte und Papierkorbprojekte müssen vor der Bearbeitung wiederhergestellt werden.
6. Ein Projektwechsel schließt ausstehende Speicherung des bisherigen Projekts zuerst ab.
7. Duplikate erhalten eine neue Projekt-ID, Revision 1 und eigene künftige Snapshots.
8. Endgültiges Löschen ist nur im Papierkorb und nach exakter Namensbestätigung zulässig.
9. Projektstand, Snapshots, Metadaten und Protokolle werden beim endgültigen Löschen in einer gemeinsamen Transaktion entfernt.
10. Alle Berichtsformate werden ausschließlich aus dem aktuell geöffneten Projekt erzeugt.
11. Browser- und echte IndexedDB-Tests bleiben getrennte Release-Gates.
12. Temporäre Browserprofile, Caches und Nutzerdaten gehören nicht ins Repository.
