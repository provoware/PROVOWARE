# Patchmanifest 0.3.0-C – Sichtbarkeit & kompakte Schnellstarterleiste

## Zweck

Dieses Manifest beschreibt ausschließlich `0.3.0-C`.

## Baseline

`247b584e87f4e041e6f405932328659e895bfbb7`

## Produktversion

Freigegebene Produktversion bleibt während dieser Teilstufe `0.2.0`.

Workspace-Vertragsversion: `1`.

## Geplante Laufzeitänderungen

- `index.html`
  - feste Schnellstarter-/Menüleiste unter dem oberen Bereich
  - permanenter `Layout`-Schalter außerhalb des Workspace
  - Layout-Menü mit fünf Panels
  - `Alle anzeigen`
  - `Standardlayout wiederherstellen`
  - Live-Status
  - stabile `data-workspace-panel`-Zuordnung
- `assets/styles.css`
  - kompakte Leiste
  - fester Primärbereich für `Layout`
  - sekundärer Bereich darf horizontal überlaufen
  - Layout-Menü und Fokuszustände
- `assets/workspace-state.js`
  - kleine zentrale Methoden für Panel-Sichtbarkeit und `Alle anzeigen`
- `assets/workspace-ui.js`
  - neue entkoppelte DOM-/Bedienlogik ohne eigene Persistenz
- `assets/app.js`
  - UI-Controller mit bestehendem Logger verbinden und initialisieren

## Qualitätssicherung

Geplant:

- Workspace-State-Tests um Sichtbarkeit erweitern
- eigener kleiner Workspace-UI-Test
- Quality Gate um neue Pflichtdatei, Script-Reihenfolge und statische Layout-Sicherheitsregeln erweitern
- `npm run verify` bleibt einziger kanonischer Prüfaufruf

## Datenhaltung

Persistenter Schlüssel bleibt unverändert:

`provoware.allin.workspace.main.v1`

Die UI schreibt niemals direkt in `localStorage`.

## Bestätigte Bedienentscheidung

Mobile Option A:

- Schnellstarterleiste bleibt kompakt und einzeilig
- `Layout` bleibt immer sichtbar
- nur sekundäre Inhalte dürfen bei Bedarf horizontal gescrollt werden
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

Betroffen sind feste Bedienzone, Panel-Sichtbarkeit, Workspace-UI-Anbindung, Tests und Dokumentation.

## Validierung vor Merge

- vollständiger Diff gegen `main`
- Branch 0 Commits hinter `main`
- `npm run verify` erfolgreich
- alle Sichtbarkeits- und UI-Tests erfolgreich
- PR mergebar
- keine ungeplanten Dateien
- zentrale Dateien nach Merge auf `main` erneut lesen

## Rückweg

Revert des 0.3.0-C-Pull-Requests. Es existiert keine serverseitige Migration und kein Eingriff in andere lokale PROVOWARE-Schlüssel.
