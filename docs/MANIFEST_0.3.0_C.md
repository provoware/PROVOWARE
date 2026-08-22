# Patchmanifest 0.3.0-C – Sichtbarkeit & kompakte Schnellstarterleiste

## Zweck

Dieses Manifest beschreibt ausschließlich `0.3.0-C`.

## Baseline

`247b584e87f4e041e6f405932328659e895bfbb7`

## Produktversion

Freigegebene Produktversion bleibt `0.2.0`.

Workspace-Vertragsversion: `1`.

## Laufzeitänderungen

### `index.html`

- feste Schnellstarter-/Menüleiste unter dem oberen Bereich
- permanenter `Layout`-Schalter außerhalb des Workspace
- Layout-Menü mit fünf Kernpanels
- `Alle anzeigen`
- `Standardlayout wiederherstellen`
- Live-Status
- stabile `data-workspace-panel`-Zuordnung
- Layout-Schalter mit denselben IDs über `data-layout-panel`
- `assets/workspace-ui.js` wird zwischen Workspace-State und App geladen

### `assets/styles.css`

- kompakte sticky Schnellstarterleiste
- fester Primärbereich für `Layout`
- horizontal scrollbarer sekundärer Statusbereich
- Layout-Menü und Fokusdarstellung
- versteckte Panels verlassen das Grid
- mobile Option A ohne separate Zweitnavigation

### `assets/workspace-state.js`

Neue zentrale Methoden:

- `panelSichtbarkeitSetzen(id, sichtbar)`
- `allePanelsAnzeigen()`

Eigenschaften:

- unbekannte Panel-ID wird vor Zustandsänderung abgelehnt
- unveränderter Zielwert erzeugt keinen unnötigen neuen Zustand
- Reihenfolge, Breite und Höhe bleiben erhalten
- Speicherung bleibt zentral über `zustandSetzen()`/`zustandSpeichern()`

### `assets/workspace-ui.js`

Entkoppelte Bedienlogik ohne eigene Persistenz:

- Workspace-Zustand auf DOM anwenden
- Kontrollfelder synchron halten
- Layout-Menü öffnen/schließen
- Panel-Sichtbarkeit ausführen
- `Alle anzeigen`
- Standardlayout wiederherstellen
- Nutzerfeedback
- `Escape` und Fokus-Rückkehr
- Klick außerhalb schließt Menü
- Fehler fallen auf letzten gültigen Workspace-Zustand zurück

### `assets/app.js`

- initialisiert Workspace-State
- bindet danach Workspace-UI an dieselbe API und denselben Logger
- keine zweite Zustands- oder Log-Infrastruktur

## Qualitätssicherung

### Tests

`tests/workspace-state.test.mjs` prüft zusätzlich:

- Aus-/Einblenden erhält Reihenfolge und Größenwerte
- alle fünf Panels dürfen gleichzeitig ausgeblendet werden
- `allePanelsAnzeigen()`
- unbekannte Panel-ID verändert keinen gültigen Zustand

`tests/workspace-ui.test.mjs` prüft:

- gespeicherte Sichtbarkeit auf DOM und Kontrollfelder
- Sichtbarkeitsschalter aktualisiert Zustand, DOM und Nutzerfeedback
- `Alle anzeigen`
- Standardlayout wiederherstellen
- Layout-Menü öffnen
- `Escape` schließen und Fokus zurückführen

### Quality Gate

`scripts/quality-check.mjs` prüft zusätzlich:

- `assets/workspace-ui.js` als Pflichtdatei
- `tests/workspace-ui.test.mjs` als Pflichtdatei
- deterministische Script-Reihenfolge
- `data-workspace-panel` entspricht exakt den realen Vertrags-IDs
- `data-layout-panel` entspricht exakt denselben IDs
- Layout-Pflichtelemente vorhanden
- `Layout` liegt statisch vor und außerhalb des veränderbaren Workspace

Kanonischer Prüfaufruf bleibt:

```bash
npm run verify
```

## Datenhaltung

Persistenter Schlüssel:

`provoware.allin.workspace.main.v1`

Die UI schreibt niemals direkt in `localStorage`.

## Bestätigte mobile Option A

- Schnellstarterleiste bleibt kompakt und einzeilig
- `Layout` bleibt immer sichtbar
- nur sekundäre Inhalte dürfen horizontal gescrollt werden
- keine zweite unnötige Navigation

## Nicht Bestandteil

- kein Resize
- kein Drag & Drop
- keine Fachmodule
- keine Netzwerkfunktion
- keine neue externe Bibliothek
- keine Änderung des Modulvertrags

## Änderungsvolumen

Einstufung: **mittel**.

Technischer PR #68:

- `20` geänderte Dateien
- `1823` Hinzufügungen
- `408` Löschungen

Der hohe Textanteil stammt wesentlich aus Plan-, Manifest-, README-, Debug- und Statusdokumentation sowie neuen Tests. Der eigentliche Laufzeitpatch bleibt auf Sichtbarkeit, feste Bedienzone und ihre Absicherung begrenzt.

## Reale Validierung

- Branch vor Merge: `0` Commits hinter `main`
- technischer PR: `#68`
- PR mergebar: ja
- Quality Gate: `success`
- statisch geprüft: `39` Dateien
- automatische Tests: `18/18` erfolgreich
- fehlgeschlagen: `0`
- Projekt-Node: `20.20.2`
- Squash-Merge: `dce166770cf589a8fb9720cb3c0a650c19151cd9`
- Main-Stichprobe erfolgreich:
  - `index.html`
  - `assets/workspace-ui.js`
  - `VERSION.json`

## Nicht blockierender Infrastrukturhinweis

GitHub Actions meldet weiterhin einen Hinweis zur auslaufenden internen Node-20-Laufzeit der verwendeten Actions `v4`. Das Projekt-Quality-Gate selbst war erfolgreich. Die Workflow-Hygiene wird getrennt und spätestens in 0.3.0-G geprüft.

## Rückweg

Revert des Squash-Merges `dce166770cf589a8fb9720cb3c0a650c19151cd9`. Es existiert keine serverseitige Migration und kein Eingriff in andere lokale PROVOWARE-Schlüssel.

## Abschluss

`0.3.0-C – Visibility Controls & Compact Menu` ist technisch abgeschlossen und validiert. Nächster Funktionspatch ist `0.3.0-D – Resize`.
