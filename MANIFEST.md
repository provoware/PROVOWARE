# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Aktuelle Entwicklungsstufe: `0.3.0-B – State Foundation & Autosave/Reset`

Modulvertragsversion: `1`

Workspace-Vertragsversion: `1`

## Laufzeitstruktur

### Einstieg

- `index.html` – lokale HTML-Einstiegsdatei

### Oberfläche und Kernlogik

- `assets/styles.css` – Dark-/Petrol-Layout und responsive Darstellung
- `assets/app.js` – App-Start, Debug-UI und Initialisierung der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Modul-Lebenszyklus
- `assets/workspace-state.js` – Workspace-Zustand, Normalisierung, lokale Speicherung und Reset
- `modules/registry.js` – zentraler Modulkatalog, aktuell bewusst leer

### Versionsmetadaten

- `VERSION.json`

## Workspace-Zustand 0.3.0-B

Eigener lokaler Schlüssel:

`provoware.allin.workspace.main.v1`

Gespeichert werden ausschließlich Layoutdaten:

- Panelreihenfolge
- Sichtbarkeit
- Rasterbreite
- optionale Höhe

Nicht gespeichert werden Fachinhalte, Debuglogs, Modul-Laufzeitstatus, Fokus, Scrollposition oder Zeigerbewegungen.

Der Reset entfernt ausschließlich den Workspace-Schlüssel. Andere lokale PROVOWARE-Daten bleiben unangetastet.

## Bereiche der Oberfläche

Nicht veränderbar durch den Workspace:

- Seitenleiste
- Kopfbereich
- Debugging & Logging
- ab 0.3.0-C vorgesehene kompakte Schnellstarter-/Menüleiste mit permanentem `Layout`-Schalter

Workspace-Kernpanels:

- Übersicht – `overview`
- Module – `modules`
- Arbeitsbereich – `work`
- Detailbereich – `details`
- Systemstatus – `system-status`

## Hauptdokumente

- `README.md`
- `TODO.md`
- `CHANGELOG.md`
- `GLOBAL_STANDARDS.md`
- `LOGGING.md`
- `PRO_DEBUGGING.md`
- `AGENTS.md`

## Architektur- und Entwicklungsdokumentation

### 0.2.0

- `docs/PLAN_0.2.0.md`
- `docs/MODULE_CONTRACT.md`

### 0.3.0

- `docs/PLAN_0.3.0.md`
- `docs/PLAN_0.3.0_B.md`
- `docs/WORKSPACE_CONTRACT.md`
- `docs/DECISIONS_0.3.0.md`
- `docs/STATUS_0.3.0.md`
- `docs/IMPLEMENTATION_ORDER_0.3.0.md`
- `docs/README_WORKSPACE_0.3.0.md`
- `docs/QA_0.3.0_A.md`
- `docs/PR_0.3.0_A.md`
- `docs/ROLLBACK_0.3.0_A.md`
- `docs/SCOPE_0.3.0_A.md`
- `docs/MANIFEST_0.3.0_B.md`

## Entwicklungs- und Qualitätssicherung

- `.editorconfig` – einheitliche Textgrundregeln
- `package.json` – kanonische Entwicklungsbefehle
- `scripts/quality-check.mjs` – Format-, Syntax-, Struktur- und Referenzprüfung
- `tests/module-registry.test.mjs` – Modul-Lebenszyklus
- `tests/workspace-state.test.mjs` – Workspace-Zustand, Speicherfehler und Reset
- `.github/workflows/quality.yml` – automatisches Quality Gate

## Kanonische Befehle

Sichere Formatkorrektur:

```bash
npm run fix
```

Vollständige Prüfung:

```bash
npm run verify
```

## Status

Die Oberfläche bleibt fachlich leer. Modulvertrag und Modul-Registry sind stabil vorhanden. In 0.3.0-B kommt ausschließlich die interne, versionierte Workspace-Zustandsgrundlage hinzu. Sichtbarkeit, Resize und Drag & Drop sind bewusst noch nicht Teil dieser Entwicklungsstufe.

Die Produktversion wird erst nach vollständiger Abnahme der Workspace Engine auf `0.3.0` erhöht.
