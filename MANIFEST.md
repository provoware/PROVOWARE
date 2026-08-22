# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Aktuelle interne Entwicklungsstufe: `0.3.0-D3a – Keyboard Resize Preview`

Modulvertragsversion: `1`

Workspace-Vertragsversion: `1`

Persistenter Workspace-Schlüssel:

`provoware.allin.workspace.main.v1`

Die Produktversion bleibt bis zur vollständigen Abnahme der Workspace Engine bei `0.2.0`.

## Laufzeitstruktur

### Einstieg

- `index.html` – lokale HTML-Einstiegsdatei und deterministische Asset-Reihenfolge
- `start.cmd` / `start.sh` – Plattform-Einstiege für die automatische lokale Startroutine
- `scripts/start.mjs` – Node-20-Prüfung, bedarfsgesteuerte Paketauflösung, lokaler Webserver und Browserstart

### Oberfläche und Kernlogik

- `assets/styles.css` – Dark-/Petrol-Basisdarstellung inklusive Tablet-/Mobilregeln
- `assets/workspace-layout.css` – Desktop-Größendarstellung, Resize-Griff sowie Aktiv-/Vorschauzustand ab 981 px
- `assets/app.js` – App-Start, Debug-UI und Initialisierung der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Modul-Lebenszyklus
- `assets/workspace-state.js` – einzige persistente Workspace-Zustandsquelle; Normalisierung, Sichtbarkeit, Größenaktionen, Speicherung und Reset
- `assets/workspace-size.js` – reine Raster-/Höhenberechnung und kanonischer 24-px-Höhenschritt
- `assets/workspace-ui.js` – DOM-/Bedienlogik für Sichtbarkeit, Layout-Menü, Fokus, Feedback sowie gespeicherte und transiente Größenwerte
- `assets/workspace-resize.js` – Resize-Griffe, Tastatur-Vorschau, Commit/Abbruch und Responsive-Sperre; noch ohne Pointer-Ziehen
- `modules/registry.js` – zentraler Modulkatalog, aktuell bewusst leer

### Versionsmetadaten

- `VERSION.json`

## Script-Reihenfolge des Workspace

Verbindlich:

```text
workspace-state.js
-> workspace-size.js
-> workspace-ui.js
-> workspace-resize.js
-> app.js
```

Damit sind Zustand und Größenregeln vor Darstellung und Eingabe verfügbar. Die Reihenfolge wird automatisiert geprüft.

## Feste Bedienzone

Außerhalb des veränderbaren Workspace liegen:

- Seitenleiste
- Kopfbereich
- kompakte Schnellstarter-/Menüleiste
- permanenter `Layout`-Schalter
- Debugging & Logging

Der `Layout`-Schalter bleibt erreichbar, auch wenn alle fünf Workspace-Panels ausgeblendet wurden.

## Workspace-Kernpanels

| Sichtbarer Bereich | stabile Panel-ID |
| --- | --- |
| Übersicht | `overview` |
| Module | `modules` |
| Arbeitsbereich | `work` |
| Detailbereich | `details` |
| Systemstatus | `system-status` |

## Persistenter Workspace-Zustand

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
- Tastatur-/Zeigerbewegungen
- Resize-/Drag-Vorschau
- CSS-Variablen
- Darstellungsmarker
- aktive Resize-Tasten

D3a führt keine neuen persistenten Felder ein. Workspace-Vertragsversion `1` bleibt deshalb unverändert.

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

Implementiert:

- `panelGroesseSetzen(id, groesse)` als zentrale State-API
- `panelGroesseZuruecksetzen(id)` als Einzel-Reset
- Erhalt von Sichtbarkeit und Reihenfolge bei Größenänderungen
- individuelle Min-/Max-Grenzen aus `PANEL_DEFINITIONEN`
- `heightPx: null` als automatische Höhe
- `assets/workspace-size.js` mit reiner Raster-/Höhenberechnung
- tatsächlicher `column-gap` in der Rastermetrik
- symmetrische Rundung horizontaler Bewegung
- kanonischer 24-px-Höhenschritt

## 0.3.0-D2 – DOM Application

Implementiert:

- `widthUnits` -> CSS-Variable `--panel-spalten`
- konkrete `heightPx` -> CSS-Variable `--panel-hoehe`
- `heightPx: null` entfernt die Inline-Höhenvariable
- ungültige Darstellungsbreite fällt sicher auf die Basisdarstellung zurück
- `assets/workspace-layout.css` wendet Größen ausschließlich ab 981 px an
- Tablet-/Mobilbasis in `assets/styles.css` blieb unverändert

## 0.3.0-D3a – aktueller technischer Stand

### Resize-Griff

Implementiert:

- genau ein dynamischer Griff pro Workspace-Panel
- echtes `button`-Element
- ungefähr 44 × 44 px Trefferfläche
- verständliche deutsche `aria-label`-Beschriftung
- `aria-keyshortcuts` für Pfeile, `Home`, `Escape`
- Griff ausschließlich ab 981 px sichtbar
- kein funktionsloser Griff statisch im HTML

### Tastatursteuerung

- `ArrowLeft` → Breite −1 Rastereinheit
- `ArrowRight` → Breite +1 Rastereinheit
- `ArrowUp` → Höhe −24 px
- `ArrowDown` → Höhe +24 px
- `Home` → nur aktuelles Panel auf Standardgröße
- `Escape` → laufende Vorschau ohne Persistenz verwerfen

### Vorschau-/Commit-Vertrag

- `keydown` ändert nur den flüchtigen Vorschauzustand
- wiederholtes `keydown` speichert nichts
- mehrere gleichzeitig gehaltene Resize-Pfeile werden als eine Tastenserie behandelt
- erst nach Freigabe der letzten aktiven Resize-Pfeiltaste erfolgt höchstens ein Commit
- ohne tatsächliche Größenänderung erfolgt kein unnötiger Commit
- transiente Vorschau verwendet dieselben CSS-Variablen wie D2
- gespeicherter Workspace-State kann die Vorschau jederzeit reproduzierbar überschreiben
- Resize-Controller schreibt niemals direkt in `localStorage`

### Automatische Höhe

Bei `heightPx: null` dient die tatsächlich gerenderte Panelhöhe als Ausgangswert für die erste Höhenänderung. Danach greifen 24-px-Raster und Panelgrenzen.

### Responsive Schutz

Bis 980 px:

- Griff per CSS verborgen
- Tastaturaktionen logisch blockiert
- laufende Vorschau bei Viewport-Wechsel verworfen
- gespeicherte Desktopwerte unverändert

## Verantwortungstrennung für Resize

- `assets/workspace-state.js` – persistente Wahrheit und normalisierte Endwerte
- `assets/workspace-size.js` – reine Größenregeln/Berechnung
- `assets/workspace-ui.js` – DOM-Anwendung gespeicherter und transienter Größenwerte
- `assets/workspace-layout.css` – visuelle Desktopdarstellung
- `assets/workspace-resize.js` – Eingabesitzung, Tastatur, Vorschau, Commit/Abbruch

Keiner der Darstellungs-/Eingabeteile legt eine zweite persistente Größenquelle an.

## Bewusst noch nicht implementiert

D3b bleibt offen für:

- `pointerdown`
- `pointermove`
- `pointerup`
- `pointercancel`
- Pointer Capture
- Mausziehen
- Touchziehen
- Stiftziehen

Ebenfalls noch nicht implementiert:

- Drag & Drop / Reorder
- reale interaktive Browser-Endabnahme

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
- `docs/PLAN_0.3.0_D.md` – Resize-Gesamtplan
- `docs/PLAN_0.3.0_D_STATE.md` – D1 State/Berechnung
- `docs/PLAN_0.3.0_D_DOM.md` – D2 DOM/CSS
- `docs/PLAN_0.3.0_D3A_KEYBOARD.md` – D3a Tastatur/Vorschau
- `docs/WORKSPACE_CONTRACT.md` – Workspace-Vertrag Version 1
- `docs/RESIZE_CONTRACT_0.3.0.md` – Resize-Vertrag und Testmatrix
- `docs/DECISIONS_0.3.0.md`
- `docs/STATUS_0.3.0.md`
- `docs/MANIFEST_0.3.0_B.md`
- `docs/MANIFEST_0.3.0_C.md`
- `docs/MANIFEST_0.3.0_D_PLAN.md`
- `docs/MANIFEST_0.3.0_D_STATE.md`
- `docs/MANIFEST_0.3.0_D_DOM.md`
- `docs/MANIFEST_0.3.0_D3A_KEYBOARD.md`

## Entwicklungs- und Qualitätssicherung

Bestehend:

- `.editorconfig`
- `package.json`
- `scripts/quality-check.mjs`
- `scripts/start.mjs`
- `start.cmd`
- `start.sh`
- `tests/quality-check.test.mjs`
- `tests/start.test.mjs`
- `tests/module-registry.test.mjs`
- `tests/workspace-state.test.mjs`
- `tests/workspace-size.test.mjs`
- `tests/workspace-ui.test.mjs`
- `tests/workspace-resize.test.mjs`
- `tests/workspace-resize-load.test.mjs`
- `.github/workflows/quality.yml`

Bereits abgedeckt:

- Modul-Lebenszyklus
- Workspace-Normalisierung und Speicherung
- Sichtbarkeit
- Größen-State-API
- Rastermetrik und Grenzen
- DOM-Übertragung über CSS-Variablen
- Rückkehr zu automatischer Höhe
- transiente Größenvorschau ohne State-Mutation
- eindeutige zugängliche Resize-Griffe
- Tastatur-Schritte und Tastenwiederholung
- höchstens ein Commit nach einer Tastenserie
- `Escape`-Abbruch und `Home`-Einzelreset
- Responsive-Sperre bis 980 px
- Abbruch bei Viewport-Wechsel
- sichere Workspace-Script-Reihenfolge
- automatischer Nachweis, dass D3a noch keine Pointer-Ziehlogik enthält

## Reale D3a-Qualität

Technischer PR #78:

- Branch final `0` Commits hinter `main`
- `11` geänderte Dateien
- GitHub Quality Gate: `success`
- `56` Dateien statisch geprüft
- `48/48` Tests erfolgreich
- `0` fehlgeschlagen
- Projektprüfung Node `20.20.2`
- Squash-Merge `5e1db3ff65d034b478f4aec032f36c0c3ffb2300`

Eine echte interaktive Firefox-/Chrome-Abnahme steht weiterhin für `0.3.0-G` aus.

## Kanonische Befehle

Sichere Formatkorrektur:

```bash
npm run fix
```

Vollständige Prüfung:

```bash
npm run verify
```

## Nächste zwei technischen Schritte

1. `0.3.0-D3b – Pointer/Maus/Touch/Stift`: vorhandenen Griff und Vorschau-/Commit-Architektur mit Pointer Events ergänzen; Bewegung bleibt transient, Abschluss höchstens ein Commit.
2. `0.3.0-E – Reorder & Drag and Drop`: erst nach vollständig grüner D3b-Abnahme; eigener Drag-Griff und Tastaturalternative.

## Status

D3a ist technisch abgeschlossen und gemergt. Die Produktversion bleibt `0.2.0`; der nächste Funktionspatch ist ausschließlich D3b.
