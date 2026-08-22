# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Aktuelle interne Entwicklungsstufe: `0.3.0-D – Resize Planning & Contract`

Modulvertragsversion: `1`

Workspace-Vertragsversion: `1`

## Laufzeitstruktur – unverändert gegenüber 0.3.0-C

### Einstieg

- `index.html` – lokale HTML-Einstiegsdatei

### Oberfläche und Kernlogik

- `assets/styles.css` – Dark-/Petrol-Layout, responsive Darstellung, Schnellstarterleiste und Layout-Menü
- `assets/app.js` – App-Start, Debug-UI und Initialisierung der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Modul-Lebenszyklus
- `assets/workspace-state.js` – Workspace-Zustand, Normalisierung, Sichtbarkeitsaktionen, lokale Speicherung und Reset
- `assets/workspace-ui.js` – DOM-/Bedienlogik für Sichtbarkeit, Layout-Menü, Fokus und Nutzerfeedback
- `modules/registry.js` – zentraler Modulkatalog, aktuell bewusst leer

### Versionsmetadaten

- `VERSION.json`

## Feste Bedienzone

Außerhalb des veränderbaren Workspace liegen:

- Seitenleiste
- Kopfbereich
- kompakte Schnellstarter-/Menüleiste
- permanenter `Layout`-Schalter
- Debugging & Logging

Der `Layout`-Schalter bleibt auch dann erreichbar, wenn alle fünf Workspace-Panels ausgeblendet wurden.

## Workspace-Kernpanels

| Sichtbarer Bereich | stabile Panel-ID |
| --- | --- |
| Übersicht | `overview` |
| Module | `modules` |
| Arbeitsbereich | `work` |
| Detailbereich | `details` |
| Systemstatus | `system-status` |

## Workspace-Zustand

Persistenter Schlüssel:

`provoware.allin.workspace.main.v1`

Gespeichert werden ausschließlich:

- Panelreihenfolge
- Sichtbarkeit
- Rasterbreite `widthUnits`
- optionale Höhe `heightPx`

Nicht gespeichert werden:

- Fachinhalte
- Debuglogs
- Modul-Laufzeitstatus
- Fokus
- Scrollposition
- Zeigerbewegungen
- Resize-/Drag-Vorschau

Die Resize-Planung führt **keine neuen persistenten Felder** ein. Workspace-Vertragsversion `1` bleibt deshalb unverändert.

## 0.3.0-C – freigegebene interne Funktionsbasis

Vorhanden:

- kompakte Schnellstarterleiste
- permanenter `Layout`-Schalter
- einzelne Panel-Sichtbarkeit
- alle Panels ausblendbar
- `Alle anzeigen`
- `Standardlayout wiederherstellen`
- gespeicherte Reihenfolge und Größenwerte bleiben beim Aus-/Einblenden erhalten
- Live-Nutzerfeedback
- Tastatur-/Fokus-Grundlage

## 0.3.0-D – aktueller Planungsstand

Bestätigte Resize-Option A:

- ein Resize-Griff pro sichtbarem Panel
- Maus/Touch/Stift über gemeinsame Pointer Events
- derselbe Griff per Tastatur bedienbar
- Breite: Schritt 1 Rastereinheit
- Höhe: Schritt 24 px
- Vorschau während Bewegung nur transient
- Persistenz erst nach validiertem Ende
- `Home/Pos1` setzt die einzelne Panelgröße auf Standard zurück
- Resize in 0.3.0-D aktiv ab 981 px
- Tablet/Mobil überschreiben keine gespeicherten Desktopgrößen
- keine zweite vollständige Größensteuerung im Layout-Menü
- Drag & Drop bleibt bis 0.3.0-E gesperrt

## Vorgesehene Verantwortungstrennung für die Resize-Implementierung

- `assets/workspace-state.js` – einzige persistente Größenquelle
- `assets/workspace-ui.js` – gültige gespeicherte Größe auf DOM anwenden
- neue `assets/workspace-resize.js` – Pointer/Tastatur, transiente Vorschau, Commit/Abbruch

Die geplante Resize-Eingabeschicht darf nicht direkt in `localStorage` schreiben.

## Hauptdokumente

- `README.md`
- `TODO.md`
- `CHANGELOG.md`
- `GLOBAL_STANDARDS.md`
- `LOGGING.md`
- `PRO_DEBUGGING.md`
- `AGENTS.md`

## Architektur- und Entwicklungsdokumentation

### 0.2.0

- `docs/PLAN_0.2.0.md`
- `docs/MODULE_CONTRACT.md`

### 0.3.0

- `docs/PLAN_0.3.0.md` – Masterplan
- `docs/PLAN_0.3.0_B.md` – State Foundation
- `docs/PLAN_0.3.0_C.md` – Visibility Controls
- `docs/PLAN_0.3.0_D.md` – detaillierter Resize-Implementierungsplan
- `docs/WORKSPACE_CONTRACT.md` – allgemeiner Workspace-Vertrag Version 1
- `docs/RESIZE_CONTRACT_0.3.0.md` – detaillierter Resize-Vertrag und 40-teilige Testmatrix
- `docs/DECISIONS_0.3.0.md`
- `docs/STATUS_0.3.0.md`
- `docs/MANIFEST_0.3.0_B.md`
- `docs/MANIFEST_0.3.0_C.md`
- `docs/MANIFEST_0.3.0_D_PLAN.md` – aktueller Planungs-Patch

## Entwicklungs- und Qualitätssicherung

Bestehend:

- `.editorconfig`
- `package.json`
- `scripts/quality-check.mjs`
- `tests/module-registry.test.mjs`
- `tests/workspace-state.test.mjs`
- `tests/workspace-ui.test.mjs`
- `.github/workflows/quality.yml`

Geplant für den technischen Resize-Patch:

- Resize-State-Tests
- reine Raster-/Höhenberechnungstests
- Pointer-Abbruch-/Commit-Tests
- Tastaturtests
- Responsive-Tests
- statische Resize-Vertragsprüfungen im Quality Gate

## Kanonische Befehle

Sichere Formatkorrektur:

```bash
npm run fix
```

Vollständige Prüfung:

```bash
npm run verify
```

## Aktueller Patchtyp

**Nur Dokumentation und Entwicklungsmetadaten.**

Keine Änderung an:

- HTML
- CSS
- JavaScript-Laufzeit
- Testcode
- Quality-Gate-Code
- Browser-Speicherung

## Nächste zwei technischen Schritte

1. State-API + reine Größenberechnung implementieren und testen.
2. Danach Resize-Griffe + Pointer-/Tastatur-Controller auf diese geprüfte Logik setzen.

Danach erst `0.3.0-E – Reorder & Drag and Drop`.

## Status

Die Produktversion bleibt bis zur vollständigen Abnahme der Workspace Engine bei `0.2.0`. Die aktuelle interne Entwicklungsphase ist transparent als `0.3.0-D Resize Planning & Contract` dokumentiert.
