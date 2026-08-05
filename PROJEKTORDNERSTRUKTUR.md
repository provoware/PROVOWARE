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

- `storage-engine.js`: einzige Schicht für IndexedDB, Revisionen, Prüfsummen, Snapshots, Aufbewahrung und Wiederherstellung
- `storage-manager.js`: grafische Liste, Vorschau, Bestätigung und Benutzeraktionen ohne direkte Datenbanktransaktionen
- `state-manager.js`: laufender Anwendungszustand ohne direkte Datenbankzugriffe
- `app.js`: koordiniert Autospeicherung, Aufbewahrung und Übergabe zwischen Zustand und Speicher
- `browser-smoke.js`: praktische Oberflächenabnahme einschließlich Speicherverwaltung
- `run_browser_smoke.py`: Desktop-/Mobil-Runner mit realem Modus und klar gemeldetem Fallback

## Regeln

1. Keine Fachlogik direkt in `index.html`, sofern sie als Modul testbar ist.
2. Die Storage-Engine ist allein für IndexedDB-Transaktionen verantwortlich.
3. Snapshots werden unveränderlich mit `add` angelegt.
4. Eine Wiederherstellung erzeugt immer eine neue Revision.
5. Die Aufbewahrung darf den letzten gültigen Sicherheitsstand nicht löschen.
6. Generierte Dateien nie manuell pflegen.
7. Datenkataloge und Schemata benötigen eindeutige IDs und Versionsnummern.
8. Browser-Smoke-Tests verwenden eindeutige Testprojekt-IDs.
9. Temporäre Browserprofile, Caches und Nutzerdaten gehören nicht ins Repository.
