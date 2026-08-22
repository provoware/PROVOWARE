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

Sie verwendet denselben D2-CSS-Variablenvertrag wie persistente Größen. `zustandAnwenden(...)` entfernt den Vorschau-Marker wieder und stellt gespeicherte Werte reproduzierbar her.

### `assets/workspace-layout.css`

Ergänzt:

- Resize-Griff nur ab 981 px
- ungefähr 44 × 44 px Trefferfläche
- Aktiv-/Vorschauzustand über bestehende Designvariablen
- zusätzlichen unteren Innenabstand, damit der Griff normalen Panelinhalt nicht überlagert
- in D3a bewusst noch keinen Zieh-Cursor

### `index.html`

Lädt in definierter Reihenfolge:

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
- Freigabe der letzten aktiven Resize-Pfeiltaste: höchstens ein Commit

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
- mehrere gleichzeitig gehaltene Resize-Pfeile
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

Technischer PR #78:

- `11` geänderte Dateien
- `assets/workspace-state.js` unverändert
- eigentliche D1-Bewegungsberechnung in `assets/workspace-size.js` unverändert
- kein persistentes Schema geändert

Betroffen sind Eingabe-/DOM-Schicht, kleine CSS-Erweiterung, App-Initialisierung, lokale Script-Reihenfolge, Tests und Entwicklungsdokumentation.

Nicht betroffen sind Modulvertrag, Netzwerk und Fachmodule.

## Reale Validierung und Merge

- technischer Pull Request: `#78`
- Branch beim finalen Diff-Check: `0` Commits hinter `main`
- PR vor Merge: mergebar
- GitHub Quality Gate: `success`
- statische Projektprüfung: `56` Dateien erfolgreich geprüft
- automatische Tests: `48/48` erfolgreich
- fehlgeschlagene Tests: `0`
- Projektprüfung: Node `20.20.2`
- keine Pointer-Ziehlogik im D3a-Quelltext, automatisiert geprüft
- Squash-Merge: `5e1db3ff65d034b478f4aec032f36c0c3ffb2300`
- Main-Stichprobe erfolgreich: `assets/workspace-resize.js`, `index.html`, `VERSION.json`

Nicht durchgeführt wurde eine echte interaktive Firefox-/Chrome-Abnahme. Sie bleibt Bestandteil des Release Gates `0.3.0-G`.

Der bekannte GitHub-Actions-Hinweis zur auslaufenden internen Node-20-Laufzeit der verwendeten Actions ist nicht blockierend und bleibt getrennt für `0.3.0-G`.

## Rückweg

Revert des technischen PR #78. D1-State, D1-Berechnung und D2-DOM-Anwendung bleiben erhalten. Keine Datenmigration muss rückgängig gemacht werden.

## Nächste zwei Schritte

1. `0.3.0-D3b – Pointer/Maus/Touch/Stift` auf dieselbe Vorschau-/Commit-Architektur setzen.
2. Danach `0.3.0-E – Reorder & Drag and Drop` erst nach vollständiger Resize-Abnahme.
