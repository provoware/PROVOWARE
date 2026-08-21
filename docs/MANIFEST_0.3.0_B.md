# Patchmanifest 0.3.0-B – Workspace State Foundation

## Zweck

Dieses Manifest beschreibt ausschließlich die Teilstufe `0.3.0-B – State Foundation & Autosave/Reset`.

## Baseline

`59491ad1d5fa199402ddf4d72d71eddb525d43a8`

## Produktversion

Die freigegebene Produktversion bleibt `0.2.0`.

Die Workspace-Vertragsversion ist `1`.

## Neue Laufzeitdatei

- `assets/workspace-state.js`
  - zentrale Paneldefinitionen
  - Standardzustand
  - Validierung und Normalisierung
  - Laden und Speichern über den eigenen lokalen Schlüssel
  - isolierter Reset
  - Bereichslogging `WORKSPACE`
  - öffentliche Browser-Schnittstelle `window.PROVOWARE_WORKSPACE`

## Geänderte Laufzeitdateien

- `index.html`
  - lädt `assets/workspace-state.js` vor `assets/app.js`
- `assets/app.js`
  - verbindet die Workspace-Zustandsverwaltung mit dem bestehenden Logger
  - initialisiert den Workspace-Zustand beim Start

## Qualitätssicherung

- `tests/workspace-state.test.mjs`
  - Standardzustand
  - Normalisierung
  - Schema-Fehler
  - beschädigter Speicherinhalt
  - Speichern und Wiederladen
  - gesperrter Speicher
  - isolierter Reset
- `package.json`
  - `npm run test` führt alle `tests/*.test.mjs` aus
- `scripts/quality-check.mjs`
  - neue Pflichtdateien
  - korrekte Script-Reihenfolge
  - bestehende Syntax- und Strukturprüfungen bleiben erhalten

## Dokumentation

- `AGENTS.md`
- `docs/PLAN_0.3.0_B.md`
- `docs/DECISIONS_0.3.0.md`
- `docs/STATUS_0.3.0.md`
- `TODO.md`
- `MANIFEST.md`
- dieses Patchmanifest

## Nicht Bestandteil

- keine sichtbare Schnellstarterleiste
- kein sichtbarer `Layout`-Schalter
- keine Panel-Sichtbarkeitssteuerung
- kein Resize
- kein Drag & Drop
- keine Änderung am Modulvertrag
- keine neue externe Bibliothek
- keine Netzwerkfunktion

## Lokale Daten

Verwendeter Schlüssel:

`provoware.allin.workspace.main.v1`

Reset darf ausschließlich diesen Schlüssel entfernen.

## Öffentliche Workspace-Schnittstelle

```text
window.PROVOWARE_WORKSPACE
```

Vorgesehene Funktionen in 0.3.0-B:

```text
initialisieren
normalisieren
standardzustandErstellen
zustandSetzen
zustandSpeichern
zuruecksetzen
statusLesen
loggerSetzen
```

## Änderungsvolumen

Einstufung: **mittel**.

Betroffen sind interne Workspace-Zustandsverwaltung, App-Start, Tests und Entwicklungsdokumentation. Sichtbare Panelmechaniken bleiben unverändert.

## Validierung

Vor Merge erforderlich:

- `npm run verify` erfolgreich
- vollständiger Diff gegen `main`
- Branch nicht hinter `main`
- PR mergebar
- keine ungeplanten Dateien
- nach Merge zentrale Dateien auf `main` stichprobenartig erneut lesen

## Rückweg

Revert des 0.3.0-B-Pull-Requests. Es existiert keine serverseitige Migration und kein Eingriff in andere lokale PROVOWARE-Schlüssel.
