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
- `docs/PLAN_0.3.0.md`
- `docs/PLAN_0.3.0_B.md`
- `docs/DECISIONS_0.3.0.md`
- `docs/STATUS_0.3.0.md`
- `TODO.md`
- `README.md`
- `LOGGING.md`
- `PRO_DEBUGGING.md`
- `CHANGELOG.md`
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

Funktionen in 0.3.0-B:

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

PR #66 änderte `19` Dateien. Betroffen sind interne Workspace-Zustandsverwaltung, App-Start, Tests, Quality Gate und Entwicklungsdokumentation. Sichtbare Panelmechaniken bleiben unverändert.

## Reale Validierung

- vollständiger Diff gegen `main` geprüft
- Branch beim Diff-Check `0` Commits hinter `main`
- PR #66 mergebar
- GitHub Quality Gate: `success`
- `QUALITY GATE: OK (35 Dateien geprüft)`
- automatische Tests: `11/11` erfolgreich, `0` fehlgeschlagen
- PR #66 per Squash gemergt
- `assets/workspace-state.js` und `VERSION.json` danach auf `main` stichprobenartig gelesen

## Abschluss

- Pull Request: `#66`
- Merge-Commit: `069ad34f2b869fb91dc1c7726cb5903431863cfb`
- Workspace-Vertragsversion: `1`
- freigegebene Produktversion: weiterhin `0.2.0`
- nächster technischer Schritt: `0.3.0-C – Visibility Controls + kompakte Menüleiste`

## Nicht blockierender Workflow-Hinweis

GitHub Actions weist bei den derzeit verwendeten Actions der Generation `v4` auf die auslaufende interne Node-20-Laufzeit hin. Der Projektprüflauf selbst wurde erfolgreich mit Node `20.20.2` ausgeführt.

Die Workflow-Aktualisierung wird getrennt geplant, damit dieser Patch nicht nachträglich mit einem unabhängigen Infrastrukturumbau vermischt wird.

## Rückweg

Revert von PR #66. Es existiert keine serverseitige Migration und kein Eingriff in andere lokale PROVOWARE-Schlüssel.
