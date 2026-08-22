# Patchmanifest 0.3.0-D2 – DOM-Anwendung gespeicherter Größen

## Zweck

Dieser Patch macht bereits im Workspace-State vorhandene Panelgrößen sichtbar. Er führt noch keine Resize-Bedienung ein.

## Baseline

`5542f90edb6b2079ef4e55f5e217f3b0e05422c4`

## Produkt- und Vertragsstand

- freigegebene Produktversion: `0.2.0`
- Workspace-Vertragsversion: `1`
- Speicher-Schlüssel: `provoware.allin.workspace.main.v1`
- interne Entwicklungsphase: `0.3.0-D Resize DOM Application`

Keine Datenmigration und keine neuen persistenten Felder.

## Laufzeitänderungen

### `assets/workspace-ui.js`

Neu:

- Übertragung von `widthUnits` auf `--panel-spalten`
- Übertragung konkreter `heightPx` auf `--panel-hoehe`
- Entfernen von `--panel-hoehe` bei `heightPx: null`
- nicht persistenter Bereitschaftsmarker `data-workspace-size-ready="true"` nur bei gültiger Breite

JavaScript setzt weder `grid-column` noch `height` direkt und schreibt keine zusätzlichen Layoutdaten in den Browser-Speicher.

### `assets/workspace-layout.css`

Neue kleine Darstellungsschicht:

```css
@media (min-width: 981px) {
  [data-workspace-panel][data-workspace-size-ready="true"] {
    grid-column: span var(--panel-spalten);
    height: var(--panel-hoehe, auto);
  }
}
```

Damit bleibt `assets/styles.css` unverändert. Tablet und Mobil verwenden ausschließlich die bereits vorhandenen responsive Regeln.

### `index.html`

Lädt `assets/workspace-layout.css` lokal direkt nach `assets/styles.css`. Script-Reihenfolge bleibt unverändert.

## Tests

`tests/workspace-ui.test.mjs` prüft zusätzlich:

- Breite als CSS-Variable
- feste Höhe als CSS-Variable
- Rückkehr von fester zu automatischer Höhe
- keine Mutation des übergebenen Zustands durch die Darstellung
- sicherer Fallback bei ungültiger Darstellungsbreite
- Desktop-Begrenzung auf mindestens 981 px
- Verwendung ausschließlich der vorgesehenen CSS-Variablen
- keine vorgezogene Pointer-/Resize-/Drag-Regel im Overlay
- lokale Stylesheet-Reihenfolge

## Bewusst nicht verändert

- `assets/styles.css`
- `assets/workspace-state.js`
- `assets/workspace-size.js`
- Workspace-Speicherschlüssel
- Workspace-Vertragsversion
- Modulvertrag und Modul-Registry
- Netzwerk

## Bewusst nicht enthalten

- Resize-Griff
- Pointer Events
- Touch-/Stiftsteuerung
- Resize-Tastatursteuerung
- transiente Resize-Vorschau
- Drag & Drop

## Abhängigkeiten

Keine neue Bibliothek und kein neues npm-Laufzeitpaket.

## Änderungsvolumen

Einstufung: **klein bis mittel**.

Direkt betroffen:

- DOM-Darstellung des Workspace
- kleine neue Desktop-CSS-Datei
- HTML-Asset-Verweis
- UI-Tests
- Entwicklungsdokumentation

Nicht betroffen:

- persistenter Workspace-State
- Größenberechnung
- Fachmodule
- Netzwerk

## Risiken und Schutzmaßnahmen

### Ungültige Breite aktiviert die neue Darstellung

Schutz: Der Bereitschaftsmarker wird nur bei einer positiven ganzzahligen Breite gesetzt. Andernfalls wird er entfernt und die Basisdarstellung bleibt zuständig.

### Automatische Höhe bleibt nach vorheriger fester Höhe hängen

Schutz: `heightPx: null` entfernt die Inline-CSS-Variable ausdrücklich; automatischer Test vorhanden.

### Desktopwerte beschädigen Tablet/Mobil

Schutz: Das neue Overlay ist ausschließlich innerhalb `@media (min-width: 981px)` aktiv.

### Basisdesign wird unbeabsichtigt verändert

Schutz: `assets/styles.css` wird in D2 nicht geändert.

## Validierung vor Merge

Noch ausstehend:

- vollständiger Branch-Diff gegen `main`
- Branch 0 Commits hinter `main`
- `npm run verify` im Pull Request
- alle Tests grün
- PR mergebar
- keine ungeplante Resize-Eingabelogik
- Main-Stichprobe nach Merge

## Rückweg

Revert dieses Pull Requests. Dadurch verschwinden ausschließlich das CSS-Overlay, die Größenübertragung und der lokale Stylesheet-Verweis. D1-State und D1-Berechnung bleiben erhalten.

## Nächste zwei Schritte

1. `0.3.0-D3 – Resize-Griff + Pointer/Tastatur` auf der geprüften D1-/D2-Basis.
2. Danach `0.3.0-E – Reorder & Drag and Drop` erst nach vollständiger D-Abnahme.
