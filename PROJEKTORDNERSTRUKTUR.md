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
│   ├── storage-engine.js
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
│   │   └── test_storage_contract.py
│   ├── integration/test_structure.py
│   ├── smoke/
│   │   ├── test_index.py
│   │   ├── browser-smoke.js
│   │   └── run_browser_smoke.py
│   └── fixtures/project-valid.json
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

- `storage-engine.js`: IndexedDB, Revisionen, Prüfsummen, Snapshots und Wiederherstellung
- `state-manager.js`: laufender Anwendungszustand ohne direkte Datenbankzugriffe
- `browser-smoke.js`: praktische Oberflächenabnahme im Browser
- `run_browser_smoke.py`: Desktop-/Mobil-Runner mit realem Modus und klar gemeldetem Fallback

## Regeln

1. Keine Fachlogik direkt in `index.html`, sofern sie als Modul testbar ist.
2. Die Storage-Engine ist allein für IndexedDB-Transaktionen verantwortlich.
3. Snapshots werden unveränderlich mit `add` angelegt.
4. Generierte Dateien nie manuell pflegen.
5. Datenkataloge und Schemata benötigen eindeutige IDs und Versionsnummern.
6. Browser-Smoke-Tests verwenden eindeutige Testprojekt-IDs.
7. Temporäre Browserprofile, Caches und Nutzerdaten gehören nicht ins Repository.
