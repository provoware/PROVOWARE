# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

Abgeschlossen sind:

- `0.3.0-A – Workspace-Vertrag`
- `0.3.0-B – State Foundation & Autosave/Reset`
- `0.3.0-C – Visibility Controls + kompakte Menüleiste`
- `0.3.0-D1 – State-API + reine Größenberechnung`
- `0.3.0-D2 – DOM-Anwendung gespeicherter Größen`
- `0.3.0-D3a – Resize-Griff + Tastatur-Vorschau`
- **`0.3.0-D3b – Pointer Resize & Visual Balance`**

Die freigegebene Produktversion bleibt `0.2.0`. `VERSION.json` weist intern `0.3.0-D3b Pointer Resize & Visual Balance` aus. Workspace-Vertragsversion und Speicher-Schlüssel bleiben unverändert bei Version 1.

## D3b – Bedienung

Der bereits vorhandene Resize-Griff unterstützt jetzt denselben Größenpfad für:

- Maus,
- Touch,
- Stift,
- Tastatur.

Maus, Touch und Stift verwenden gemeinsame **Pointer Events**. Dadurch gibt es keine getrennte Maus-, Touch- und Stiftlogik.

### Schutz vor versehentlichem Ziehen

`pointerdown` erfasst den primären Zeiger, verändert aber noch keine Panelgröße. Erst wenn sich der Zeiger mindestens **4 px** vom Startpunkt entfernt, wird eine transiente Vorschau aktiviert.

Damit gilt:

```text
Klick / minimales Zittern < 4 px -> keine Größenänderung
ab 4 px Bewegung -> Vorschau
pointerup -> höchstens ein validierter Commit
```

Rechte Maustaste und nicht primäre Pointer starten keinen Resize-Vorgang.

## Pointer Capture und Abbruch

Während einer aktiven Pointer-Sitzung hält der Griff den Zeiger über **Pointer Capture** fest. Die Bedienung bleibt dadurch stabil, auch wenn der Zeiger beim Ziehen kurz außerhalb des Griffs liegt.

Ohne Persistenz abgebrochen wird bei:

- `pointercancel`,
- `Escape`,
- verlorenem Pointer Capture,
- Wechsel auf eine Fensterbreite bis einschließlich 980 px.

Pointer Capture wird beim Aufräumen freigegeben. Eine aktive Pointer-Sitzung blockiert gleichzeitig den Tastatur-Resize-Pfad, damit beide Eingabearten keinen gemeinsamen Zwischenzustand verändern.

## Größenberechnung

D3b erfindet keine zweite Mathematik. Es verwendet weiterhin `assets/workspace-size.js`.

Für die Breite werden zur Laufzeit gelesen:

- tatsächlich gerenderte Breite des 12-Spalten-Rasters,
- tatsächlich berechneter CSS-`column-gap`.

Der CSS-Abstand ist deshalb **nicht als zweite Konstante in JavaScript kopiert**.

Für die Höhe gilt weiterhin:

- Raster: 24 px,
- individuelle Mindest-/Höchstgrenzen aus `PANEL_DEFINITIONEN`,
- bei `heightPx: null` wird als Startwert die tatsächlich gerenderte Höhe verwendet.

## Persistenz

Die Verantwortung bleibt unverändert getrennt:

- `assets/workspace-state.js` – einzige persistente Workspace-Quelle,
- `assets/workspace-size.js` – reine Größenberechnung,
- `assets/workspace-ui.js` – Anwendung von CSS-Variablen und Vorschau,
- `assets/workspace-resize.js` – Eingabe, flüchtige Sitzung, Commit/Abbruch.

`workspace-resize.js` verwendet weder `localStorage` noch `sessionStorage` direkt. `pointermove` verändert ausschließlich die Vorschau. Erst ein gültiger Abschluss kann über die bestehende State-API einen Endwert speichern.

## Erscheinungsbild und Größenverhältnisse

D3b enthält zusätzlich eine bewusst begrenzte **Visual-Balance-Anpassung**:

- Desktop-Rasterabstände passen sich zwischen 12 und 18 px an,
- Grid-Elemente werden nicht mehr künstlich auf die Höhe anderer Elemente derselben Zeile gestreckt,
- Mindesthöhen entsprechen wieder direkt dem Workspace-Vertrag:
  - Standardpanel: 220 px,
  - breites Panel: 148 px,
  - Arbeitsbereich: 360 px,
- Resize-Griff bleibt 44 × 44 px, erhält aber klareren `nwse-resize`-Cursor und `touch-action: none`,
- Fokus, aktive Vorschau und Panelkante sind deutlicher erkennbar,
- Workspace, Schnellleiste und Panels erhalten etwas stärkere statische Cyan-Lichtwirkung,
- keine neue Daueranimation wurde eingeführt.

Die Änderungen liegen weiterhin in den bestehenden CSS-Schichten und erzeugen keine neue UI-Zustandslogik.

## Reale D3b-Abnahme

- Ausgangsbaseline: `5ed92c6f749818977d7a90f2e9958df9bdc08868`
- technischer Pull Request: `#94`
- technischer Squash-Merge: `bf833fe50acbecc8d7d8e22a2bf8d4434cc0dee4`
- Branch vor Merge: `0` Commits hinter `main`
- GitHub Quality Gate: `success`
- Workflow Run: `32611892780`
- Node 20.20.2: PASS
- Node 24: PASS
- Project Lint: `53` JavaScript-Dateien PASS
- Quality Gate: `134` Projektdateien PASS
- Node-Test-Suite: **`147/147` PASS**, `0` Fehler

Die D3b-Tests prüfen unter anderem 4-px-Schwelle, Pointer Capture, Klick ohne Resize, Touch-/Stiftpfad, reale CSS-Gap-Messung, genau einen Commit, Cancel, Escape, Responsive-Abbruch, Eingabetrennung und Visual-Balance-Regeln.

## Browser-Abnahme

In D3b wurde **bewusst kein Browser-E2E ausgeführt**. Die Browser-Suite wurde zuvor aus normalen Pull Requests und `main`-Pushes herausgenommen und steht als manuell gestartetes Release-/Abnahme-Gate bereit.

Damit ist die Aussage sauber getrennt:

- schnelle Logik-/Vertragsabnahme D3b: grün,
- reale interaktive Chromium-/Firefox-Endabnahme: noch offen und für das spätere Gate vorgesehen.

Insbesondere reales Touch-/Stift-Verhalten und der endgültige visuelle Eindruck auf echten Browsern werden deshalb noch nicht als praktisch abgenommen bezeichnet.

## Bewusst nicht enthalten

D3b enthält weiterhin nicht:

- Drag & Drop,
- Reorder,
- eigenen Drag-Griff,
- freie x/y-Pixelpositionen,
- neue persistente Felder,
- neuen Browser-Speicherschlüssel,
- neue Abhängigkeit,
- Medien-/Datenbank-/Recovery-Änderungen.

## Nächste zwei Schritte

1. **0.3.0-E – Reorder & Drag and Drop:** eigener Drag-Griff, Resize-Griff bleibt getrennt; persistiert wird ausschließlich die Panel-Reihenfolge.
2. **0.3.0-G – manuelles Browser-/Accessibility-Release-Gate:** Chromium gebündelt gegen Resize, Reorder, responsive Ansichten, Fokus und Accessibility prüfen; Firefox optional gegenprüfen.

## Stabilitätsprognose

Für die automatisiert geprüfte D3b-Logik ist die Stabilität **hoch**: vorhandene State-, Größen- und UI-Schichten wurden wiederverwendet und die neue Eingabelogik ist durch gezielte Regressionstests abgedeckt.

Für reale Pointer-Hardware und die endgültige Optik bleibt die Prognose bis zum manuellen Browser-Gate **mittel bis hoch**, weil diese Ebene absichtlich noch nicht praktisch im Browser abgenommen wurde.
