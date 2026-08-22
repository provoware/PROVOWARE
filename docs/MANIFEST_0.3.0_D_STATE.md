# Patchmanifest 0.3.0-D1 – State-API und reine Größenberechnung

## Zweck

Dieses Manifest beschreibt ausschließlich den ersten technischen Resize-Patch nach abgeschlossener Planungsphase.

Der Patch setzt **noch keine sichtbare Größenänderung** um. Er schafft nur die geprüfte Zustands- und Berechnungsbasis für den nächsten Schritt.

## Baseline

Ursprünglicher Branchstart:

`a9b23b8d16e96142f35904a08315ca3f2f4495a0`

Während der Umsetzung wurde PR #73 parallel auf `main` gemergt. Vor der finalen Abnahme wurde der Branch kontrolliert mit folgendem `main` synchronisiert:

`887ff10363662935c385e1f7e965e0eb75be5918`

Die Quality-Gate-Härtung aus PR #73 bleibt dadurch vollständig erhalten.

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

### Parallele Änderungen auf `main` gehen verloren

Schutz: Der Branch wurde vor der finalen Abnahme mit PR #73 synchronisiert. `CHANGELOG.md` und `MANIFEST.md` wurden bewusst zusammengeführt statt überschrieben.

## Reale Validierung

- Pull Request: `#74`
- geänderte Dateien: `11`
- finaler Branch: `0` Commits hinter `main`
- GitHub Quality Gate: `success`
- statische Projektprüfung: `48` Dateien erfolgreich geprüft
- automatische Tests: `31/31` erfolgreich
- fehlgeschlagene Tests: `0`
- Projektprüfung: Node `20.20.2`
- Regressionstest der parallel übernommenen Quality-Gate-Härtung: erfolgreich
- PR war mergebar
- Squash-Merge: `1de0999cd570c612a80649cfe4975d8531947935`
- Main-Stichprobe: `assets/workspace-state.js`, `assets/workspace-size.js`, `VERSION.json`

### Behobener Testfehler während der Entwicklung

Der erste vollständige Lauf zeigte einen einzelnen Fehlschlag beim strikten Vergleich eines Ergebnisobjekts aus einer separaten JavaScript-VM. Inhalt und berechnete Werte waren bereits korrekt. Der Test wurde so korrigiert, dass das VM-Objekt vor dem Vergleich in ein normales Datenobjekt umgewandelt wird.

Es war **keine Änderung der Produktlogik** erforderlich. Der anschließende vollständige Lauf war grün.

## Rückweg

Revert des Squash-Merges:

`1de0999cd570c612a80649cfe4975d8531947935`

Keine Migration und kein neuer Daten-Schlüssel müssen zurückgerollt werden.

## Nächste zwei Schritte

1. `0.3.0-D2`: gespeicherte Breite/Höhe zentral auf DOM anwenden, weiterhin ohne Resize-Griff
2. `0.3.0-D3`: danach Resize-Griff plus Pointer-/Tastatur-Controller auf die geprüfte Basis setzen

Drag & Drop bleibt bis `0.3.0-E` gesperrt.
