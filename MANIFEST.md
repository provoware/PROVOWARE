# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Aktuelle Entwicklungsstufe: `0.3.0-C – Visibility Controls & Compact Menu`

Modulvertragsversion: `1`

Workspace-Vertragsversion: `1`

## Laufzeitstruktur

### Einstieg

- `index.html` – lokale HTML-Einstiegsdatei

### Oberfläche und Kernlogik

- `assets/styles.css` – Dark-/Petrol-Layout, responsive Darstellung, Schnellstarterleiste und Layout-Menü
- `assets/app.js` – App-Start, Debug-UI und Initialisierung der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Modul-Lebenszyklus
- `assets/workspace-state.js` – Workspace-Zustand, Normalisierung, Sichtbarkeitsaktionen, lokale Speicherung und Reset
- `assets/workspace-ui.js` – entkoppelte DOM-/Bedienlogik für Sichtbarkeit, Layout-Menü, Fokus und Nutzerfeedback
- `modules/registry.js` – zentraler Modulkatalog, aktuell bewusst leer

### Versionsmetadaten

- `VERSION.json`

## Feste Bedienzone 0.3.0-C

Außerhalb des veränderbaren Workspace liegen:

- Seitenleiste
- Kopfbereich
- kompakte Schnellstarter-/Menüleiste
- permanenter `Layout`-Schalter
- Debugging & Logging

Der `Layout`-Schalter bleibt auch dann erreichbar, wenn alle fünf Workspace-Panels ausgeblendet wurden.

Mobile Regel Option A:

- `Layout` bleibt im festen Primärbereich sichtbar
- sekundäre Status-/Aktionsinhalte dürfen horizontal überlaufen
- keine separate mobile Zweitnavigation

## Workspace-Kernpanels

| Sichtbarer Bereich | stabile Panel-ID |
| --- | --- |
| Übersicht | `overview` |
| Module | `modules` |
| Arbeitsbereich | `work` |
| Detailbereich | `details` |
| Systemstatus | `system-status` |

Die HTML-Zuordnung erfolgt über `data-workspace-panel`. Die Layout-Schalter verwenden dieselben stabilen IDs über `data-layout-panel`.

## Workspace-Zustand

Eigener lokaler Schlüssel:

`provoware.allin.workspace.main.v1`

Gespeichert werden ausschließlich Layoutdaten:

- Panelreihenfolge
- Sichtbarkeit
- Rasterbreite
- optionale Höhe

Nicht gespeichert werden Fachinhalte, Debuglogs, Modul-Laufzeitstatus, Fokus, Scrollposition oder Zeigerbewegungen.

Sichtbarkeitsänderungen laufen ausschließlich über die zentrale Workspace-State-API. `assets/workspace-ui.js` schreibt nicht direkt in `localStorage`.

Der Reset entfernt ausschließlich den Workspace-Schlüssel. Andere lokale PROVOWARE-Daten bleiben unangetastet.

## Sichtbarkeitsfunktionen 0.3.0-C

- einzelne Panels ein-/ausblenden
- alle fünf Panels gleichzeitig ausblenden dürfen
- `Alle anzeigen`
- `Standardlayout wiederherstellen`
- gespeicherte Reihenfolge und Größenwerte beim Aus-/Einblenden erhalten
- Live-Nutzerfeedback
- Menü per `Escape` schließen und Fokus zum `Layout`-Schalter zurückführen

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
- `docs/PLAN_0.3.0_C.md`
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
- `docs/MANIFEST_0.3.0_C.md`

## Entwicklungs- und Qualitätssicherung

- `.editorconfig` – einheitliche Textgrundregeln
- `package.json` – kanonische Entwicklungsbefehle
- `scripts/quality-check.mjs` – Format-, Syntax-, Struktur-, Referenz- und Workspace-UI-Vertragsprüfung
- `tests/module-registry.test.mjs` – Modul-Lebenszyklus
- `tests/workspace-state.test.mjs` – Workspace-Zustand, Sichtbarkeit, Speicherfehler und Reset
- `tests/workspace-ui.test.mjs` – DOM-Anwendung, Sichtbarkeit, Wiederherstellung und Tastatur-Menüverhalten
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

## Noch nicht Bestandteil

- Resize
- Drag & Drop
- Fachmodule
- Cloud-Synchronisation
- Remote-Plugins

## Status

Die Oberfläche bleibt fachlich leer. Modulvertrag und Registry sind stabil vorhanden. 0.3.0-C ergänzt ausschließlich die sichtbare, sicher wiederherstellbare Panel-Sichtbarkeit und die kompakte feste Layoutsteuerung auf Basis der vorhandenen Workspace-Zustandsverwaltung.

Die Produktversion wird erst nach vollständiger Abnahme der Workspace Engine auf `0.3.0` erhöht.
