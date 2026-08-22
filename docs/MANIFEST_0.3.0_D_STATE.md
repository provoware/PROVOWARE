# Patchmanifest 0.3.0-D1 – State-API und reine Größenberechnung

## Zweck

Dieses Manifest beschreibt ausschließlich den ersten technischen Resize-Patch nach abgeschlossener Planungsphase.

Der Patch setzt **noch keine sichtbare Größenänderung** um. Er schafft nur die geprüfte Zustands- und Berechnungsbasis für den nächsten Schritt.

## Baseline

`a9b23b8d16e96142f35904a08315ca3f2f4495a0`

Diese Baseline enthält bereits PR #72 mit den separat gemergten Erscheinungsbildänderungen.

## Produkt- und Vertragsstand

- freigegebene Produktversion: `0.2.0`
- Workspace-Vertragsversion: `1`
- Speicher-Schlüssel: `provoware.allin.workspace.main.v1`
- interne Entwicklungsphase: `0.3.0-D Resize State & Calculation`

Es werden keine neuen persistenten Felder eingeführt.

## Laufzeitänderungen

### `assets/workspace-state.js`

Neu:

- `panelGroesseSetzen(id, groesse)`
- `panelGroesseZuruecksetzen(id)`
- zentrale `panelDefinitionLesen(id)`-Prüfung

Eigenschaften:

- nur Größenfelder werden verändert
- Sichtbarkeit und Reihenfolge bleiben erhalten
- bestehende Größen-Normalisierung wird wiederverwendet
- individuelle Min-/Max-Werte stammen weiterhin ausschließlich aus `PANEL_DEFINITIONEN`
- `heightPx: null` bleibt automatische Höhe
- unveränderte Zielgröße erzeugt keine unnötige erneute Zustandsmutation
- Speicherung bleibt in der vorhandenen Workspace-State-Schicht

### `assets/workspace-size.js`

Neue reine Berechnungsschicht ohne DOM, Speicherung oder Logging.

Öffentliche Funktionen:

- `rasterMetrikBerechnen`
- `breiteAusBewegung`
- `hoeheAusBewegung`
- `groesseAusBewegung`

Konstanten:

- `RASTER_SPALTEN = 12`
- `HOEHEN_SCHRITT_PX = 24`

Rastermetrik berücksichtigt den tatsächlichen Spaltenabstand. Eine Rastereinheit wird nicht als fester Pixelwert angenommen.

## Tests

### `tests/workspace-state.test.mjs`

Zusätzlich geprüft:

- Größenänderung wird gespeichert
- Sichtbarkeit bleibt erhalten
- Reihenfolge bleibt erhalten
- Breiten- und Höhenlimits
- automatische Höhe über `null`
- partielle Größenänderung
- Einzel-Reset
- unbekannte Panel-ID verändert den Zustand nicht

### `tests/workspace-size.test.mjs`

Neu geprüft:

- Rastermetrik inklusive `column-gap`
- symmetrische Rundung horizontaler Bewegung
- Breitenlimits
- 24-px-Höhenraster
- Höhenlimits
- deterministische kombinierte Berechnung
- frühe Ablehnung unmöglicher Rasterdaten
- Ablehnung nicht endlicher Bewegung

## Bewusst nicht verändert

- `index.html`
- `assets/styles.css`
- `assets/workspace-ui.js`
- sichtbare Panelgröße
- Resize-Griffe
- Pointer-/Touch-/Stiftbedienung
- Resize-Tastaturbedienung
- Modulvertrag
- Modul-Registry
- Netzwerk
- Browser-Speicherschlüssel
- Workspace-Vertragsversion

## Abhängigkeiten

Keine neue Bibliothek und kein neues npm-Laufzeitpaket.

Die neue Berechnungsschicht verwendet ausschließlich JavaScript-Bordmittel.

## Änderungsvolumen

Einstufung: **klein bis mittel**.

Hauptbetroffen:

- Workspace-State-API
- reine Größenberechnung
- automatische Tests
- Entwicklungsdokumentation

Nutzeroberfläche: **nicht betroffen**.

## Risiken und Schutzmaßnahmen

### Ungültige Größe wird gespeichert

Schutz: State-API nutzt dieselbe zentrale Normalisierung wie der übrige Workspace-Zustand.

### Breitenberechnung stimmt wegen Grid-Abständen nicht

Schutz: Rastermetrik berücksichtigt `column-gap` ausdrücklich.

### Positive und negative Bewegung runden unterschiedlich

Schutz: eigene symmetrische Rundung statt asymmetrischem Verhalten an negativen Halbwerten.

### Designänderungen werden überschrieben

Schutz: Patch basiert auf aktuellem `main` nach PR #72 und ändert weder HTML noch CSS.

## Validierung vor Merge

Noch ausstehend:

- Branch-Diff gegen `main`
- Branch 0 Commits hinter `main`
- `npm run verify` im PR
- alle Tests grün
- PR mergebar
- keine ungeplanten UI-Dateien
- Main-Stichprobe nach Merge

## Rückweg

Revert dieses Pull Requests.

Keine Migration und kein neuer Daten-Schlüssel müssen zurückgerollt werden.

## Nächste zwei Schritte

1. gespeicherte Breite/Höhe zentral auf DOM anwenden, weiterhin ohne Resize-Griff
2. danach Resize-Griff plus Pointer-/Tastatur-Controller auf die geprüfte Basis setzen

Drag & Drop bleibt bis `0.3.0-E` gesperrt.
