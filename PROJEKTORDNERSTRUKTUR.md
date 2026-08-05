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
│   ├── state-manager.js
│   ├── workflow-engine.js
│   ├── rule-engine.js
│   ├── validation-engine.js
│   ├── report-generator.js
│   └── ui/
│       └── app-ui.js
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
│   │   └── test_catalogs.py
│   ├── integration/
│   │   └── test_structure.py
│   ├── smoke/
│   │   └── test_index.py
│   └── fixtures/
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
└── dist/
    └── .gitkeep
```

## Verantwortlichkeiten

- `index.html`: semantische Grundoberfläche ohne externe Laufzeitabhängigkeiten
- `css/`: Design-Tokens, Layout, Komponenten und Themes
- `js/`: Fachlogik, Zustand, Regeln, Validierung und Oberfläche
- `data/`: versionierte Inhaltskataloge
- `schemas/`: maschinenlesbare Datenverträge
- `tests/`: kleine zielgerichtete Prüfungen und repräsentative Gesamtabnahmen
- `scripts/`: reproduzierbarer Build, Validierung und Release-Erzeugung
- `docs/`: technische und laiengerechte Dokumentation
- `dist/`: ausschließlich reproduzierbar erzeugte Release-Artefakte

## Regeln

1. Keine Fachlogik direkt in `index.html`, sofern sie als Modul testbar ist.
2. Generierte Dateien nie manuell pflegen.
3. Datenkataloge benötigen eindeutige IDs und Versionsnummern.
4. Tests spiegeln die Modulstruktur wider.
5. Temporäre Dateien, Browserprofile, Caches und Nutzerdaten gehören nicht ins Repository.
6. Neue Hauptordner müssen hier vor ihrer Anlage begründet werden.
