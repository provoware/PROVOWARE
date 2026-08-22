# Patchmanifest 0.3.0-C – Sichtbarkeit & kompakte Schnellstarterleiste

## Zweck

Dieses Manifest beschreibt ausschließlich `0.3.0-C`.

## Baseline

`247b584e87f4e041e6f405932328659e895bfbb7`

## Produktversion

Freigegebene Produktversion bleibt während dieser Teilstufe `0.2.0`.

Workspace-Vertragsversion: `1`.

## Laufzeitänderungen

### `index.html`

- feste Schnellstarter-/Menüleiste unter dem oberen Bereich
- permanenter `Layout`-Schalter außerhalb des Workspace
- Layout-Menü mit fünf Kernpanels
- `Alle anzeigen`
- `Standardlayout wiederherstellen`
- sichtbarer Live-Status
- stabile `data-workspace-panel`-Zuordnung
- Layout-Schalter verwenden dieselben IDs über `data-layout-panel`
- `assets/workspace-ui.js` wird zwischen Workspace-State und App geladen

### `assets/styles.css`

- kompakte, sticky Schnellstarterleiste
- fester Primärbereich für `Layout`
- horizontal scrollbarer sekundärer Statusbereich
- modernes Layout-Menü
- Fokusdarstellung für Kontrollfelder
- versteckte Panels werden sicher aus dem Grid entfernt
- mobile Option A ohne separate Zweitnavigation

### `assets/workspace-state.js`

Neue zentrale Methoden:

- `panelSichtbarkeitSetzen(id, sichtbar)`
- `allePanelsAnzeigen()`

Eigenschaften:

- unbekannte Panel-ID wird vor Zustandsänderung abgelehnt
- keine Änderung, wenn der Zielwert bereits gilt
- Reihenfolge, Breite und Höhe bleiben erhalten
- Speicherung läuft weiterhin ausschließlich über `zustandSetzen()`/`zustandSpeichern()`

### `assets/workspace-ui.js`

Neue entkoppelte Bedienlogik ohne eigene Persistenz:

- Workspace-Zustand auf DOM anwenden
- Kontrollfelder synchron halten
- Layout-Menü öffnen/schließen
- einzelne Panel-Sichtbarkeit ausführen
- `Alle anzeigen`
- Standardlayout wiederherstellen
- verständliches Nutzerfeedback
- `Escape` schließt Menü und setzt Fokus auf `Layout`
- Klick außerhalb schließt das Menü kontrolliert
- Fehler führen auf den letzten gültigen Workspace-Zustand zurück

### `assets/app.js`

- initialisiert zuerst Workspace-State
- verbindet danach Workspace-UI mit derselben Workspace-API und demselben Logger
- keine zweite Zustands- oder Log-Infrastruktur

## Qualitätssicherung

### `tests/workspace-state.test.mjs`

Zusätzlich geprüft:

- Aus-/Einblenden erhält Reihenfolge und Größenwerte
- alle fünf Panels dürfen gleichzeitig ausgeblendet werden
- `allePanelsAnzeigen()` stellt alle wieder sichtbar
- unbekannte Panel-ID verändert keinen gültigen Zustand

### `tests/workspace-ui.test.mjs`

Neu geprüft:

- gespeicherte Sichtbarkeit wird auf DOM und Kontrollfelder angewendet
- Sichtbarkeitsschalter aktualisiert Zustand, DOM und Nutzerfeedback
- `Alle anzeigen`
- Standardlayout wiederherstellen
- Layout-Menü öffnen
- `Escape` schließen und Fokus zurückführen

### `scripts/quality-check.mjs`

Zusätzlich geprüft:

- `assets/workspace-ui.js` ist Pflichtdatei
- `tests/workspace-ui.test.mjs` ist Pflichtdatei
- Script-Reihenfolge ist deterministisch
- `data-workspace-panel` enthält exakt die Vertrags-IDs
- `data-layout-panel` enthält exakt die Vertrags-IDs
- Layout-Pflichtelemente sind vorhanden
- `Layout` liegt statisch vor dem veränderbaren Workspace

`npm run verify` bleibt der einzige kanonische Prüfaufruf.

## Datenhaltung

Persistenter Schlüssel bleibt unverändert:

`provoware.allin.workspace.main.v1`

Die UI schreibt niemals direkt in `localStorage`.

## Bestätigte Bedienentscheidung

Mobile Option A:

- Schnellstarterleiste bleibt kompakt und einzeilig
- `Layout` bleibt immer sichtbar
- nur sekundäre Inhalte dürfen horizontal gescrollt werden
- keine zweite unnötige Navigation

## Dokumentation

Betroffen:

- `README.md`
- `TODO.md`
- `CHANGELOG.md`
- `MANIFEST.md`
- `LOGGING.md`
- `PRO_DEBUGGING.md`
- `VERSION.json`
- `docs/PLAN_0.3.0_C.md`
- `docs/DECISIONS_0.3.0.md`
- `docs/STATUS_0.3.0.md`
- dieses Patchmanifest

## Nicht Bestandteil

- kein Resize
- kein Drag & Drop
- keine Fachmodule
- keine Netzwerkfunktion
- keine neue externe Bibliothek
- keine Änderung des Modulvertrags

## Änderungsvolumen

Einstufung: **mittel**.

Betroffen sind feste Bedienzone, Panel-Sichtbarkeit, Workspace-State-API, Workspace-UI-Anbindung, Tests, Quality Gate und Dokumentation.

## Validierung vor Merge

Noch ausstehend:

- vollständiger Diff gegen `main`
- Branch 0 Commits hinter `main`
- `npm run verify` erfolgreich
- alle Sichtbarkeits- und UI-Tests erfolgreich
- PR mergebar
- keine ungeplanten Dateien
- zentrale Dateien nach Merge auf `main` erneut lesen

## Rückweg

Revert des 0.3.0-C-Pull-Requests. Es existiert keine serverseitige Migration und kein Eingriff in andere lokale PROVOWARE-Schlüssel.
