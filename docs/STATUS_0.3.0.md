# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

`0.3.0-A – Workspace-Vertrag`, `0.3.0-B – State Foundation & Autosave/Reset`, `0.3.0-C – Visibility Controls + kompakte Menüleiste`, `0.3.0-D1 – State-API + reine Größenberechnung` und **`0.3.0-D2 – DOM-Anwendung gespeicherter Größen`** sind abgeschlossen.

Es gibt weiterhin **keinen Resize-Griff und keine Pointer-/Tastaturbedienung**. Diese Eingabeschicht beginnt erst in D3.

Die freigegebene Produktversion bleibt bis zur vollständigen Workspace-Abnahme korrekt bei `0.2.0`. Die interne Entwicklungsphase lautet `0.3.0-D Resize DOM Application`.

## Abgeschlossene Grundlagen

### 0.3.0-A – Vertrag

- Workspace-Vertrag Version 1 definiert.
- automatische lokale Speicherung und vollständiger Reset festgelegt.
- stabile Panel-IDs, Größen- und Sichtbarkeitsregeln festgelegt.
- PR #64 erfolgreich geprüft und gemergt.

### 0.3.0-B – Zustandsgrundlage

- zentrale Workspace-Zustandsverwaltung angelegt.
- Normalisierung, lokale Speicherung und isolierter Reset implementiert.
- beschädigte oder gesperrte Speicherung robust behandelt.
- automatische Zustands- und Fehlertests ergänzt.
- PR #66 erfolgreich geprüft und gemergt.

### 0.3.0-C – Sichtbarkeit und Schnellstarterleiste

- kompakte Schnellstarter-/Menüleiste und permanenter `Layout`-Schalter integriert.
- alle fünf Kernpanels einzeln ein-/ausblendbar.
- `Alle anzeigen` und `Standardlayout wiederherstellen` bleiben jederzeit erreichbar.
- Reihenfolge und Größenwerte bleiben beim Aus-/Einblenden erhalten.
- PR #68 erfolgreich geprüft und gemergt.

## 0.3.0-D – Resize-Vertrag

Verbindlich festgelegt:

- ein Resize-Griff pro sichtbarem Panel
- Maus, Touch und Stift über Pointer Events
- derselbe Griff per Tastatur
- Breite in Schritten von 1 Rastereinheit
- Höhe in Schritten von 24 px
- Bewegung zunächst nur als transiente Vorschau
- Persistenz erst nach validiertem Abschluss
- `Home/Pos1` setzt nur die aktuelle Panelgröße zurück
- Resize nur ab 981 px
- Tablet/Mobil überschreiben gespeicherte Desktopwerte nicht
- Drag & Drop bleibt bis 0.3.0-E gesperrt

Planungs-PR #70 wurde mit grünem Quality Gate gemergt.

## 0.3.0-D1 – State & Calculation Foundation

Implementiert:

- `panelGroesseSetzen(id, groesse)`
- `panelGroesseZuruecksetzen(id)`
- Größenbegrenzung über `PANEL_DEFINITIONEN`
- `heightPx: null` als automatische Höhe
- `assets/workspace-size.js` als reine Größenberechnung
- Rastermetrik inklusive echtem `column-gap`
- symmetrische Rundung horizontaler Bewegung
- Höhenraster in 24-px-Schritten

Reale D1-Abnahme:

- PR #74
- final 0 Commits hinter `main`
- 48 Dateien geprüft
- 31/31 Tests erfolgreich
- 0 fehlgeschlagen
- Node 20.20.2
- Squash-Merge `1de0999cd570c612a80649cfe4975d8531947935`

## 0.3.0-D2 – DOM Application

### Ziel

Bereits gespeicherte Größen sichtbar machen, ohne eine neue Bedienmechanik einzuführen.

### Umgesetzte Architektur

Verbindliche Kette:

```text
Workspace-State -> workspace-ui.js -> CSS-Variablen -> workspace-layout.css -> Panel
```

JavaScript überträgt Werte. CSS entscheidet über die Darstellung.

### Implementiert

- `widthUnits` wird als `--panel-spalten` auf das zugehörige Panel übertragen.
- konkrete `heightPx` wird als `--panel-hoehe` mit Pixelwert übertragen.
- `heightPx: null` entfernt die Inline-Höhenvariable und stellt automatische Höhe wieder her.
- bei ungültiger Breite werden Breitenvariable und technischer Bereitschaftsmarker entfernt.
- der nicht persistente Marker `data-workspace-size-ready="true"` verhindert, dass das neue Overlay ohne gültige Größenübergabe die bisherige Basisdarstellung verdrängt.
- `assets/workspace-layout.css` enthält ausschließlich den Desktopvertrag ab 981 px.
- `assets/styles.css` blieb vollständig unverändert.
- Tablet- und Mobilansichten verwenden weiterhin ausschließlich die bereits vorhandenen responsive Regeln.
- `index.html` lädt das neue lokale Stylesheet direkt nach der Basis-CSS; Script-Reihenfolge blieb unverändert.
- `tests/workspace-ui.test.mjs` prüft Breite, Höhe, Auto-Höhe, Zustandsunveränderlichkeit, ungültigen Fallback, CSS-Vertrag und Stylesheet-Reihenfolge.

### Bewusst nicht enthalten

- kein Resize-Griff
- keine Pointer Events
- keine Touch-/Stiftsteuerung
- keine Resize-Tastatursteuerung
- keine transiente Resize-Vorschau
- kein Drag & Drop
- keine neue Workspace-State-API
- keine Datenmigration
- keine neue Bibliothek

## Reale D2-Abnahme

- technische Baseline: `5542f90edb6b2079ef4e55f5e217f3b0e05422c4`
- technischer Pull Request: `#76`
- geänderte Dateien im PR: `11`
- Branch beim finalen Diff-Check: `0` Commits hinter `main`
- PR vor Merge: mergebar
- GitHub Quality Gate: `success`
- statische Projektprüfung: `51` Dateien erfolgreich geprüft
- automatische Tests: `36/36` erfolgreich
- fehlgeschlagene Tests: `0`
- Projektprüfung: Node `20.20.2`
- Squash-Merge: `249df54ec13fa632f74400897dd3d83da3332bcb`
- Main-Stichprobe erfolgreich: `index.html`, `assets/workspace-ui.js`, `assets/workspace-layout.css`, `VERSION.json`

## D2-Änderungsvolumen

Einstufung: **klein bis mittel**.

Laufzeit direkt betroffen:

- `assets/workspace-ui.js`
- neue `assets/workspace-layout.css`
- `index.html`

Qualität/Dokumentation direkt betroffen:

- `tests/workspace-ui.test.mjs`
- `docs/PLAN_0.3.0_D_DOM.md`
- `docs/MANIFEST_0.3.0_D_DOM.md`
- `TODO.md`
- `CHANGELOG.md`
- `MANIFEST.md`
- `VERSION.json`
- diese Statusdatei

Nicht betroffen:

- `assets/styles.css`
- `assets/workspace-state.js`
- `assets/workspace-size.js`
- Fachmodule
- Netzwerk
- persistentes Workspace-Schema

## Offene technische Grenze

Die automatischen Prüfungen decken Struktur, Zustandslogik und DOM-/CSS-Vertrag ab. Eine echte interaktive Firefox-/Chrome-Abnahme wurde in D2 noch nicht durchgeführt und bleibt Bestandteil des späteren Release Gates 0.3.0-G.

Der bekannte nicht blockierende GitHub-Actions-Hinweis zur internen Node-20-Laufzeit der verwendeten Actions bleibt ebenfalls getrennt und wird spätestens in 0.3.0-G behandelt.

## Nächste zwei Schritte

1. **0.3.0-D3 – Resize-Griff + Eingabe:** genau einen Griff pro Panel und die Eingabeschicht auf der geprüften D1-/D2-Basis aufsetzen.
2. **0.3.0-E – Reorder & Drag and Drop:** erst nach vollständig grüner D-Abnahme; Resize- und Drag-Griff bleiben technisch getrennt.

## Empfehlung

D3 erneut in einen kleinen, klar rücknehmbaren Eingabe-Patch teilen und die vorhandene State-, Berechnungs- und Darstellungslogik unverändert wiederverwenden.
