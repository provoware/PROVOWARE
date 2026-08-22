# Patchmanifest 0.3.0-D3a – Tastatur-Resize und Vorschau

## Zweck

Dieser Patch führt den sichtbaren Resize-Griff und den kontrollierten Tastaturpfad ein. Pointer/Maus/Touch/Stift bleiben bewusst für D3b getrennt.

## Baseline

`d5d7022816e3c164f641a39ccd9b05a5722d0db2`

## Produkt- und Vertragsstand

- freigegebene Produktversion: `0.2.0`
- interne Entwicklungsphase: `0.3.0-D3a Keyboard Resize Preview`
- Workspace-Vertragsversion: `1`
- Speicher-Schlüssel: `provoware.allin.workspace.main.v1`
- keine Datenmigration
- keine neuen persistenten Felder

## Laufzeitänderungen

### Neu: `assets/workspace-resize.js`

Verantwortlich für:

- genau einen dynamischen Resize-Griff pro Workspace-Panel
- Tastatursteuerung über Pfeile, `Home` und `Escape`
- flüchtigen Vorschauzustand im Arbeitsspeicher
- Commit erst nach Abschluss einer Tastenserie
- Responsive-Sperre bis 980 px
- verständliches Nutzerfeedback
- zusammenfassendes WORKSPACE-Logging

Die Datei schreibt niemals direkt in `localStorage`.

### `assets/workspace-ui.js`

Neue kleine Schnittstelle:

`panelGroesseVorschauAnwenden(id, groesse)`

Sie verwendet denselben D2-CSS-Variablenvertrag wie persistente Größen. `zustandAnwenden(...)` entfernt den Vorschau-Marker wieder und stellt damit gespeicherte Werte reproduzierbar her.

### `assets/workspace-layout.css`

Ergänzt:

- Resize-Griff nur ab 981 px
- ungefähr 44 × 44 px Trefferfläche
- klaren Fokus-/Aktivzustand über bestehende Designvariablen
- optischen Vorschauzustand
- zusätzlichen unteren Innenabstand, damit der Griff den normalen Inhalt nicht überlagert

### `index.html`

Lädt neu in definierter Reihenfolge:

1. `assets/workspace-state.js`
2. `assets/workspace-size.js`
3. `assets/workspace-ui.js`
4. `assets/workspace-resize.js`
5. `assets/app.js`

### `assets/app.js`

Initialisiert den Resize-Controller erst nach Workspace-State und Workspace-UI.

## Tastaturvertrag

- `ArrowLeft`: Breite −1 Rastereinheit
- `ArrowRight`: Breite +1 Rastereinheit
- `ArrowUp`: Höhe −24 px
- `ArrowDown`: Höhe +24 px
- `Home`: nur aktuelles Panel auf Standardgröße
- `Escape`: aktive Vorschau ohne Persistenz verwerfen
- wiederholtes `keydown`: nur Vorschau
- letzter zugehöriger `keyup`: höchstens ein Commit

Grenzen stammen aus `PANEL_DEFINITIONEN`. Der 24-px-Schritt wird aus `PROVOWARE_WORKSPACE_SIZE.HOEHEN_SCHRITT_PX` übernommen und nicht doppelt definiert.

## Responsive Vertrag

Bis 980 px:

- Griff nicht sichtbar
- Tastaturaktionen logisch blockiert
- aktive Vorschau bei Viewport-Wechsel verworfen
- gespeicherte Desktopwerte bleiben unverändert

## Tests

Neu:

- `tests/workspace-resize.test.mjs`
- `tests/workspace-resize-load.test.mjs`

Erweitert:

- `tests/workspace-ui.test.mjs`

Abgedeckt werden:

- fünf eindeutige zugängliche Griffe
- keine doppelten Griffe bei erneuter Initialisierung
- Breiten-/Höhenschritte und Grenzen
- automatische Höhe aus gerenderter Höhe
- Tastenwiederholung ohne Zwischen-Commit
- genau ein Commit nach letzter Tastenfreigabe
- `Escape` ohne Commit
- `Home` als Einzel-Reset
- Responsive-Sperre
- Abbruch bei Wechsel auf kleinen Viewport
- D2-CSS-Variablenvertrag
- sichere Script-Ladereihenfolge
- explizit noch keine Pointer-Ziehlogik

## Bewusst nicht enthalten

- `pointerdown`
- `pointermove`
- `pointerup`
- `pointercancel`
- Pointer Capture
- Mausziehen
- Touchziehen
- Stiftziehen
- Drag & Drop
- neue State-API
- neue Größenberechnung
- neue Bibliothek

## Änderungsvolumen

Einstufung: **mittel**.

Betroffen sind Eingabe-/DOM-Schicht, kleine CSS-Erweiterung, App-Initialisierung, lokale Script-Reihenfolge, Tests und Entwicklungsdokumentation.

Nicht betroffen sind persistentes Workspace-Schema, Modulvertrag, Netzwerk und Fachmodule.

## Validierung

Vor Merge zwingend:

- Branch-Diff gegen aktuellen `main`
- Branch 0 Commits hinter `main`
- GitHub Quality Gate `success`
- alle automatischen Tests grün
- keine Pointer-Ziehlogik im D3a-Patch
- PR mergebar
- Main-Stichprobe nach Merge

## Rückweg

Revert dieses Pull Requests. D1-State, D1-Berechnung und D2-DOM-Anwendung bleiben erhalten. Keine Datenmigration muss rückgängig gemacht werden.

## Nächste zwei Schritte

1. `0.3.0-D3b – Pointer/Maus/Touch/Stift` auf dieselbe Vorschau-/Commit-Architektur setzen.
2. Danach `0.3.0-E – Reorder & Drag and Drop` erst nach vollständiger Resize-Abnahme.
