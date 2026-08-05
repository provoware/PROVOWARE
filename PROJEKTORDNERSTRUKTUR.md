# Projektordnerstruktur

## Zielstruktur

```text
PROVOWARE/
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
│   └── themes.css
├── js/
│   ├── app.js
│   ├── migration-engine.js
│   ├── storage-engine.js
│   ├── storage-manager.js
│   ├── state-manager.js
│   ├── workflow-engine.js
│   ├── rule-engine.js
│   ├── validation-engine.js
│   ├── report-generator.js
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
│   │   └── test_storage_failures.py
│   ├── integration/test_structure.py
│   ├── smoke/
│   │   ├── test_index.py
│   │   ├── browser-smoke.js
│   │   ├── run_browser_smoke.py
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

- `migration-engine.js`: reine, schrittweise und testbare Projektschema-Matrix ohne IndexedDB-Zugriffe
- `storage-engine.js`: einzige Schicht für IndexedDB, Transaktionen, Revisionen, Prüfsummen, Migration, Aufbewahrung und Wiederherstellung
- `storage-manager.js`: grafische Liste, Vorschau, Bestätigung und Benutzeraktionen ohne direkte Datenbanktransaktionen
- `state-manager.js`: laufender Anwendungszustand ohne direkte Datenbankzugriffe
- `app.js`: koordiniert Autospeicherung, Migration, Aufbewahrung und Übergabe zwischen Zustand und Speicher
- `storage-failure-smoke.js`: reproduzierbare Quota-, Abbruch-, Korruptions- und Legacy-Szenarien

## Regeln

1. Keine Fachlogik direkt in `index.html`, sofern sie als Modul testbar ist.
2. Jede Projektschema-Version benötigt einen expliziten Einzelschritt zur direkt folgenden Version.
3. Migrationen dürfen keinen unkontrollierten Direktsprung verwenden.
4. Die Storage-Engine ist allein für IndexedDB-Transaktionen verantwortlich.
5. Legacy-Originale werden nicht überschrieben; migrierte Stände entstehen als neue Revisionen.
6. Hauptstand, Sicherung, migrierte Snapshots, Metadaten und Protokolle müssen atomar geschrieben werden.
7. Snapshots werden unveränderlich mit `add` angelegt.
8. Eine Wiederherstellung erzeugt immer eine neue Revision.
9. Fehlerinjektion ist nur mit `window.__PROVOWARE_TESTING__ === true` zulässig.
10. Temporäre Browserprofile, Caches und Nutzerdaten gehören nicht ins Repository.
