# Manifest 0.3.0-D3b – Pointer Resize & Visual Balance

## Identität

- Produkt: `PROVOWARE ALL-IN 2026`
- freigegebene Produktversion: `0.2.0`
- interne Entwicklungsphase: `0.3.0-D3b Pointer Resize & Visual Balance`
- technische Baseline: `5ed92c6f749818977d7a90f2e9958df9bdc08868`
- technischer Pull Request: `#94`
- technischer Squash-Merge: `bf833fe50acbecc8d7d8e22a2bf8d4434cc0dee4`
- Workspace-Vertrag: Version `1`
- persistiertes Workspace-Schema: unverändert Version `1`

## Laufzeitdateien des D3b-Patches

### `assets/workspace-resize.js`

Zweck:

- gemeinsame Pointer-Eingabeschicht für Maus, Touch und Stift,
- 4-px-Bewegungsschwelle,
- Pointer Capture,
- flüchtige Vorschau,
- genau ein validierter Commit bei Abschluss,
- Abbruch über `pointercancel`, Escape, Capture-Verlust und Responsive-Wechsel,
- Schutz gegen Vermischung von Tastatur- und Pointer-Sitzung.

Direkte Browser-Persistenz: **keine**.

### `assets/workspace-layout.css`

Zweck:

- klare Resize-Trefferfläche 44 × 44 px,
- `nwse-resize`-Cursor,
- `touch-action: none`,
- deutlicher Fokus/Aktiv-/Vorschauzustand,
- adaptive Desktop-Abstände 12–18 px,
- `align-items: start` gegen künstliches Grid-Stretching,
- Vertrags-Mindesthöhen 220 / 148 / 360 px.

### `assets/headquarter-dashboard.css`

Zweck:

- moderat hellere statische Cyan-/Blau-Lichtwirkung,
- klarere Panelkanten,
- stärkere Titelhierarchie,
- keine Daueranimation.

### `VERSION.json`

Nur interne Entwicklungsmetadaten geändert. Produktversion, Workspace-Schema, Project Data, Data Studio PRO und Recovery-Verträge bleiben unverändert.

## Testdatei

### `tests/workspace-resize.test.mjs`

Prüft zusätzlich:

- 4-px-Schwelle,
- Pointer Capture,
- Klick ohne Größenänderung,
- gemeinsame Touch-/Stiftlogik,
- real gemessenen CSS-Spaltenabstand,
- transiente Vorschau ohne Persistenz,
- höchstens einen Commit auf `pointerup`,
- `pointercancel`,
- Escape,
- kleinen Viewport,
- rechte Maustaste / nicht primären Pointer,
- Speichertrennung,
- Visual-Balance-CSS-Vertrag.

## Qualitätsnachweis

GitHub Quality Gate Run `32611892780`:

- Node `20.20.2`: PASS
- Node `24`: PASS
- Project Lint: `53` JavaScript-Dateien PASS
- Quality Gate: `134` Projektdateien PASS
- Node-Test-Suite: `147/147` PASS
- Fehler: `0`

Browser-E2E wurde entsprechend `docs/BROWSER_TEST_POLICY.md` in dieser Iteration nicht automatisch ausgeführt.

## Bewusst unverändert

- `assets/workspace-state.js`
- persistierter Workspace-Schlüssel `provoware.allin.workspace.main.v1`
- Workspace-Schema Version 1
- D1-Größenberechnung als einzige Größenmathematik
- D2-CSS-Variablenvertrag
- Modulvertrag
- Project-Data-Schema
- Data-Studio-PRO-Schema
- Recovery-Envelope-Format
- Medienlogik
- Netzwerk-/Serververhalten

## Rückweg

Revert von PR `#94` entfernt D3b-Pointersteuerung und Visual-Balance-Anpassungen. Vorhandene D3a-Tastatursteuerung, D2-Darstellung und gespeicherte Workspace-Daten benötigen keine Migration.

## Offene Abnahmegrenze

Noch nicht praktisch im manuellen Browser-Gate nachgewiesen:

- reale Mausbedienung im Browser,
- reale Touch-Hardware,
- realer Stift,
- endgültige optische Wirkung und Größenverhältnisse auf verschiedenen Browser-/Displaygrößen.

Diese Nachweise bleiben bewusst für `0.3.0-G` gebündelt.
