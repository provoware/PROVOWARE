# Projektordnerstruktur

## Zielstruktur

```text
PROVOWARE/
├── .github/
│   └── workflows/
│       └── ci.yml
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
│   │   └── test_report_generator.py
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

- `migration-engine.js`: reine Projektschema-Matrix ohne IndexedDB-Zugriffe
- `storage-engine.js`: einzige Schicht für IndexedDB, Transaktionen, Migration und Wiederherstellung
- `storage-manager.js`: grafische Snapshot-Liste und kontrollierte Benutzeraktionen
- `report-generator.js`: formatneutrales Modell und Renderer für Markdown, HTML, TXT und JSON
- `report-manager.js`: Vorprüfung, Vorschau, Formatwahl und lokaler Download
- `state-manager.js`: laufender Anwendungszustand ohne direkte Datenbankzugriffe
- `app.js`: koordiniert Modulstart, Autospeicherung und Übergaben
- `ci.yml`: schnelle L0-/L1-Prüfung ohne Browserinstallation

## Regeln

1. Keine Fachlogik direkt in `index.html`, sofern sie als Modul testbar ist.
2. Jede Projektschema-Version benötigt einen expliziten Einzelschritt zur direkt folgenden Version.
3. Die Storage-Engine ist allein für IndexedDB-Transaktionen verantwortlich.
4. Legacy-Originale werden nicht überschrieben.
5. Snapshots werden unveränderlich mit `add` angelegt.
6. Alle Berichtsformate werden ausschließlich aus demselben validierten Modell erzeugt.
7. Renderer dürfen Kennungen und Rückverfolgbarkeit nicht neu berechnen.
8. Offline-HTML darf keine externen Ressourcen enthalten.
9. Fehlerinjektion ist nur mit `window.__PROVOWARE_TESTING__ === true` zulässig.
10. Browser- und echte IndexedDB-Tests bleiben getrennte Release-Gates.
11. Temporäre Browserprofile, Caches und Nutzerdaten gehören nicht ins Repository.
