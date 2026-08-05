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
│   ├── project-manager.css
│   └── project-transfer.css
├── js/
│   ├── app.js
│   ├── migration-engine.js
│   ├── storage-engine.js
│   ├── project-repository.js
│   ├── project-manager.js
│   ├── project-transfer.js
│   ├── project-transfer-manager.js
│   ├── accessibility.js
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
│   ├── project-package.schema.json
│   ├── template.schema.json
│   └── questions.schema.json
├── tests/
│   ├── unit/
│   │   ├── test_catalogs.py
│   │   ├── test_storage_contract.py
│   │   ├── test_migration_matrix.py
│   │   ├── test_storage_failures.py
│   │   ├── test_report_generator.py
│   │   ├── test_project_management.py
│   │   ├── test_project_transfer.py
│   │   ├── test_import_guard.py
│   │   ├── test_accessibility_contract.py
│   │   └── test_version_sync.py
│   ├── integration/test_structure.py
│   ├── smoke/
│   │   ├── test_index.py
│   │   ├── browser-smoke.js
│   │   ├── run_browser_smoke.py
│   │   ├── project-management-smoke.js
│   │   ├── run_project_management_smoke.py
│   │   ├── transfer-accessibility-smoke.js
│   │   ├── run_transfer_accessibility_smoke.py
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
- `project-transfer.js`: Paketbildung, Prüfsumme, Migration, fachliche Importprüfung und Vergleich
- `project-transfer-manager.js`: Dateiauswahl, reine Vorschau, Moduswahl, Revisionsschutz und Transferdialog
- `accessibility.js`: Dialogstapel, Fokusfalle, Escape-Hierarchie, Pfeiltasten und Grundprüfung
- `storage-manager.js`: Snapshot-Liste und kontrollierte Wiederherstellung
- `report-generator.js`: formatneutrales Berichtsmodell und Renderer
- `report-manager.js`: Vorschau, Prüfung und lokaler Download
- `state-manager.js`: ausschließlich der aktuell geöffnete Anwendungszustand
- `app.js`: serialisierte Speicherung, Projektwechsel und dauerhafte Importübernahme

## Regeln

1. Keine Fachlogik direkt in `index.html`, sofern sie als Modul testbar ist.
2. Die Storage-Engine bleibt allein für allgemeine IndexedDB-Speichervorgänge verantwortlich.
3. Projektbezogene Datensätze werden konsequent über `projectId` getrennt.
4. Importdateien werden vor der Vorschau ausschließlich gelesen und niemals unmittelbar gespeichert.
5. Paketschema, Prüfsumme, Projektschema, Herkunftsmetadaten, Fragen und Antworten müssen vor jeder Übernahme gültig sein.
6. Bei einer Projekt-ID-Kollision ist eine neue ID die sichere Standardoption.
7. Ersetzen ist nur für aktive Projekte, nach exakter Namenseingabe, separater Bestätigung und Vorher-Sicherung zulässig.
8. Hat sich die lokale Revision seit der Vorschau geändert, wird das Ersetzen blockiert und eine neue Vorschau verlangt.
9. Archivierte Projekte und Papierkorbprojekte müssen vor der Bearbeitung wiederhergestellt werden.
10. Ein Projektwechsel schließt ausstehende Speicherung des bisherigen Projekts zuerst ab.
11. Duplikate und neue Importe erhalten eine eigene Projekt-ID und eigene künftige Snapshots.
12. Endgültiges Löschen ist nur im Papierkorb und nach exakter Namensbestätigung zulässig.
13. Der oberste Dialog hält den Tastaturfokus und verarbeitet Escape zuerst.
14. Automatisierte Barrierefreiheitsprüfungen ergänzen, ersetzen aber keine reale Screenreader-Abnahme.
15. Anwendungs-, Build-, Transfer- und Releaseversion müssen durch einen automatischen Vertragstest übereinstimmen.
16. Browser- und echte IndexedDB-Tests bleiben getrennte Release-Gates.
17. Temporäre Browserprofile, Caches und Nutzerdaten gehören nicht ins Repository.
