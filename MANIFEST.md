# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Aktuelle interne Entwicklungsstufe: `0.3.0-D – Resize DOM Application`

Modulvertragsversion: `1`

Workspace-Vertragsversion: `1`

## Laufzeitstruktur

### Einstieg

- `index.html` – lokale HTML-Einstiegsdatei und deterministische Asset-Reihenfolge

### Oberfläche und Kernlogik

- `assets/styles.css` – unveränderte Dark-/Petrol-Basisdarstellung inklusive bestehender Tablet-/Mobilregeln
- `assets/workspace-layout.css` – isolierter Desktop-Darstellungsvertrag für gespeicherte Panelbreite und -höhe ab 981 px
- `assets/app.js` – App-Start, Debug-UI und Initialisierung der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Modul-Lebenszyklus
- `assets/workspace-state.js` – Workspace-Zustand, Normalisierung, Sichtbarkeits- und Größenaktionen, lokale Speicherung und Reset
- `assets/workspace-size.js` – reine, DOM-freie Raster-/Höhenberechnung für die spätere Resize-Bedienung
- `assets/workspace-ui.js` – DOM-/Bedienlogik für Sichtbarkeit, Layout-Menü, Fokus, Nutzerfeedback und Übertragung gültiger Größenwerte auf CSS-Variablen
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
- CSS-Variablen oder Darstellungsmarker

0.3.0-D2 führt keine neuen persistenten Felder ein. Workspace-Vertragsversion `1` bleibt unverändert.

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

## 0.3.0-D1 – State & Calculation

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

## 0.3.0-D2 – aktueller technischer Stand

Implementiert:

- `workspace-ui.js` setzt gültige `widthUnits` ausschließlich als CSS-Variable `--panel-spalten`
- konkrete `heightPx` wird ausschließlich als `--panel-hoehe` mit `px` übertragen
- `heightPx: null` entfernt die Inline-Höhenvariable und erhält automatische Höhe
- ungültige Darstellungsbreite entfernt die Breitenvariable und deaktiviert den nicht persistenten Bereitschaftsmarker
- `assets/workspace-layout.css` verwendet die Größenvariablen ausschließlich ab 981 px
- das Overlay setzt `grid-column` und `height`; JavaScript setzt diese Eigenschaften nicht direkt
- `assets/styles.css` bleibt unverändert und damit alleinige Tablet-/Mobilbasis
- `index.html` lädt das Overlay lokal direkt nach der Basis-CSS
- automatische DOM-, CSS-Vertrags- und Ladereihenfolge-Tests sind ergänzt

Bewusst noch nicht implementiert:

- sichtbare Resize-Griffe
- Pointer-/Touch-/Stiftsteuerung
- Tastatursteuerung für Resize
- transiente Resize-Vorschau
- Resize-Nutzerfeedback
- Drag & Drop

## Verantwortungstrennung für Resize

- `assets/workspace-state.js` – einzige persistente Größenquelle
- `assets/workspace-size.js` – reine Größenberechnung ohne Seiteneffekt
- `assets/workspace-ui.js` – gültige Größenwerte auf CSS-Variablen übertragen, keine eigene Persistenz
- `assets/workspace-layout.css` – ausschließlich Desktopdarstellung der übergebenen Größenwerte
- geplante `assets/workspace-resize.js` – Pointer/Tastatur, transiente Vorschau, Commit/Abbruch

Weder Größenberechnung, UI-Darstellung noch spätere Resize-Eingabeschicht dürfen direkt eine zweite Größenquelle in `localStorage` anlegen.

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
- `docs/PLAN_0.3.0_D_STATE.md` – D1 State-API und reine Größenberechnung
- `docs/PLAN_0.3.0_D_DOM.md` – D2 DOM-/CSS-Größenanwendung
- `docs/WORKSPACE_CONTRACT.md` – allgemeiner Workspace-Vertrag Version 1
- `docs/RESIZE_CONTRACT_0.3.0.md` – detaillierter Resize-Vertrag und 40-teilige Testmatrix
- `docs/DECISIONS_0.3.0.md`
- `docs/STATUS_0.3.0.md`
- `docs/MANIFEST_0.3.0_B.md`
- `docs/MANIFEST_0.3.0_C.md`
- `docs/MANIFEST_0.3.0_D_PLAN.md` – Planungs- und Vertrags-Patch
- `docs/MANIFEST_0.3.0_D_STATE.md` – D1 State- und Berechnungs-Patch
- `docs/MANIFEST_0.3.0_D_DOM.md` – D2 DOM-/CSS-Patch

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
- DOM-Übertragung von Breite und Höhe über CSS-Variablen
- Rückkehr von fester zu automatischer Höhe
- sicherer Fallback bei ungültiger Darstellungsbreite
- Desktop-Begrenzung des Workspace-Größenoverlays
- lokale Stylesheet-Ladereihenfolge

Noch für D3 geplant:

- Pointer-Abbruch-/Commit-Tests
- Tastaturtests
- Responsive-Interaktionstests
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

**D2 – Darstellung bereits gespeicherter Größen über CSS-Variablen.**

Keine Änderung an:

- persistentem Workspace-Schema
- Workspace-State-API
- reiner Größenberechnung
- Basis-CSS `assets/styles.css`
- Modulvertrag
- Browser-Speicherschlüssel
- Workspace-Vertragsversion
- Resize-Eingabemechanik

## Nächste zwei technischen Schritte

1. D3: genau einen Resize-Griff pro sichtbarem Panel und entkoppelten Pointer-/Tastatur-Controller auf D1/D2 aufsetzen.
2. Danach erst 0.3.0-E: Reorder & Drag and Drop mit eigener Tastaturalternative.

## Status

Die Produktversion bleibt bis zur vollständigen Abnahme der Workspace Engine bei `0.2.0`. Die interne Entwicklungsphase ist transparent als `0.3.0-D Resize DOM Application` dokumentiert.
