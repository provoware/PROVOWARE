# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Aktuelle interne Entwicklungsstufe: `0.3.0-D – Resize State & Calculation`

Modulvertragsversion: `1`

Workspace-Vertragsversion: `1`

## Laufzeitstruktur

### Einstieg

- `index.html` – lokale HTML-Einstiegsdatei

### Oberfläche und Kernlogik

- `assets/styles.css` – Dark-/Petrol-Layout, responsive Darstellung, Schnellstarterleiste und Layout-Menü
- `assets/app.js` – App-Start, Debug-UI und Initialisierung der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Modul-Lebenszyklus
- `assets/workspace-state.js` – Workspace-Zustand, Normalisierung, Sichtbarkeits- und Größenaktionen, lokale Speicherung und Reset
- `assets/workspace-size.js` – reine, DOM-freie Raster-/Höhenberechnung für die spätere Resize-Bedienung
- `assets/workspace-ui.js` – DOM-/Bedienlogik für Sichtbarkeit, Layout-Menü, Fokus und Nutzerfeedback
- `modules/registry.js` – zentraler Modulkatalog, aktuell bewusst leer

### Versionsmetadaten

- `VERSION.json`

## Feste Bedienzone

Außerhalb des veränderbaren Workspace liegen:

- Seitenleiste
- Kopfbereich
- kompakte Schnellstarter-/Menüleiste
- permanenter `Layout`-Schalter
- Debugging & Logging

Der `Layout`-Schalter bleibt auch dann erreichbar, wenn alle fünf Workspace-Panels ausgeblendet wurden.

## Workspace-Kernpanels

| Sichtbarer Bereich | stabile Panel-ID |
| --- | --- |
| Übersicht | `overview` |
| Module | `modules` |
| Arbeitsbereich | `work` |
| Detailbereich | `details` |
| Systemstatus | `system-status` |

## Workspace-Zustand

Persistenter Schlüssel:

`provoware.allin.workspace.main.v1`

Gespeichert werden ausschließlich:

- Panelreihenfolge
- Sichtbarkeit
- Rasterbreite `widthUnits`
- optionale Höhe `heightPx`

Nicht gespeichert werden:

- Fachinhalte
- Debuglogs
- Modul-Laufzeitstatus
- Fokus
- Scrollposition
- Zeigerbewegungen
- Resize-/Drag-Vorschau

0.3.0-D führt keine neuen persistenten Felder ein. Workspace-Vertragsversion `1` bleibt deshalb unverändert.

## 0.3.0-C – vorhandene Funktionsbasis

Vorhanden:

- kompakte Schnellstarterleiste
- permanenter `Layout`-Schalter
- einzelne Panel-Sichtbarkeit
- alle Panels ausblendbar
- `Alle anzeigen`
- `Standardlayout wiederherstellen`
- gespeicherte Reihenfolge und Größenwerte bleiben beim Aus-/Einblenden erhalten
- Live-Nutzerfeedback
- Tastatur-/Fokus-Grundlage

## 0.3.0-D – aktueller technischer Stand

Bereits implementiert:

- `panelGroesseSetzen(id, groesse)` als zentrale State-API für Größenwerte
- `panelGroesseZuruecksetzen(id)` für den Einzel-Reset eines Panels
- Erhalt von Sichtbarkeit und Reihenfolge bei Größenänderungen
- Normalisierung auf individuelle Min-/Max-Grenzen der `PANEL_DEFINITIONEN`
- `heightPx: null` bleibt als automatische Höhe gültig
- `assets/workspace-size.js` mit reiner Raster- und Höhenberechnung
- tatsächlicher Spaltenabstand (`column-gap`) fließt in die Rastermetrik ein
- symmetrische Rundung horizontaler Bewegungen auf ganze Rastereinheiten
- Höhe wird in 24-px-Schritten berechnet
- deterministische Berechnung ohne DOM-, Speicher- oder Logging-Seiteneffekt
- automatische State- und Größenberechnungstests

Bewusst noch nicht implementiert:

- gespeicherte Größen auf DOM anwenden
- sichtbare Resize-Griffe
- Pointer-/Touch-/Stiftsteuerung
- Tastatursteuerung für Resize
- transiente Vorschau im Browser
- Resize-Nutzerfeedback
- Drag & Drop

## Verantwortungstrennung für Resize

- `assets/workspace-state.js` – einzige persistente Größenquelle
- `assets/workspace-size.js` – reine Berechnung ohne Seiteneffekt
- `assets/workspace-ui.js` – später gültige gespeicherte Größe auf DOM anwenden
- geplante `assets/workspace-resize.js` – Pointer/Tastatur, transiente Vorschau, Commit/Abbruch

Weder Größenberechnung noch spätere Resize-Eingabeschicht dürfen direkt in `localStorage` schreiben.

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

- `docs/PLAN_0.3.0.md` – Masterplan
- `docs/PLAN_0.3.0_B.md` – State Foundation
- `docs/PLAN_0.3.0_C.md` – Visibility Controls
- `docs/PLAN_0.3.0_D.md` – detaillierter Resize-Implementierungsplan
- `docs/PLAN_0.3.0_D_STATE.md` – kleiner Teilplan für State-API und reine Größenberechnung
- `docs/WORKSPACE_CONTRACT.md` – allgemeiner Workspace-Vertrag Version 1
- `docs/RESIZE_CONTRACT_0.3.0.md` – detaillierter Resize-Vertrag und 40-teilige Testmatrix
- `docs/DECISIONS_0.3.0.md`
- `docs/STATUS_0.3.0.md`
- `docs/MANIFEST_0.3.0_B.md`
- `docs/MANIFEST_0.3.0_C.md`
- `docs/MANIFEST_0.3.0_D_PLAN.md` – Planungs- und Vertrags-Patch
- `docs/MANIFEST_0.3.0_D_STATE.md` – State- und Berechnungs-Patch

## Entwicklungs- und Qualitätssicherung

Bestehend:

- `.editorconfig`
- `package.json`
- `scripts/quality-check.mjs`
- `tests/quality-check.test.mjs`
- `tests/module-registry.test.mjs`
- `tests/workspace-state.test.mjs`
- `tests/workspace-size.test.mjs`
- `tests/workspace-ui.test.mjs`
- `.github/workflows/quality.yml`

Bereits abgedeckt:

- verständlicher kontrollierter Fehlerpfad des Quality Gates
- Modul-Lebenszyklus
- Workspace-Normalisierung und Speicherung
- Sichtbarkeit
- Größen-State-API
- Rastermetrik inklusive Spaltenabstand
- Breiten- und Höhenbegrenzung
- reproduzierbare Größenberechnung

Noch für die sichtbare Resize-Stufe geplant:

- Pointer-Abbruch-/Commit-Tests
- Tastaturtests
- Responsive-Tests
- statische Resize-Griff-/Controller-Prüfungen im Quality Gate

## Kanonische Befehle

Sichere Formatkorrektur:

```bash
npm run fix
```

Vollständige Prüfung:

```bash
npm run verify
```

## Aktueller Patchtyp

**State-API + reine Größenberechnung + automatische Tests.**

Die bereits auf `main` vorhandene Quality-Gate-Härtung bleibt unverändert erhalten.

Keine Änderung an:

- HTML
- CSS
- sichtbarer Bedienung
- Modulvertrag
- Browser-Speicherschlüssel
- Workspace-Vertragsversion

## Nächste zwei technischen Schritte

1. Gespeicherte Breite/Höhe zentral auf das DOM anwenden und `heightPx: null` als automatische Höhe erhalten.
2. Danach genau einen Resize-Griff pro Panel plus entkoppelten Pointer-/Tastatur-Controller ergänzen.

Danach erst `0.3.0-E – Reorder & Drag and Drop`.

## Status

Die Produktversion bleibt bis zur vollständigen Abnahme der Workspace Engine bei `0.2.0`. Die interne Entwicklungsphase ist transparent als `0.3.0-D Resize State & Calculation` dokumentiert.
