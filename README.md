# PROVOWARE ALL-IN 2026

Modulare, flexible und weiterhin fachlich leere HTML-Oberfläche. Die freigegebene Produktversion bleibt `0.2.0`. Parallel wird die Flexible Workspace Engine in kleinen, prüfbaren Teilstufen entwickelt. Aktuell ist **`0.3.0-D3a – Keyboard Resize Preview`** technisch abgeschlossen.

## Start für normale Nutzung

1. Projektordner öffnen.
2. `index.html` doppelklicken oder in Firefox/Chrome öffnen.
3. Es werden weder Server noch installierte npm-Pakete noch Netzwerkzugriff benötigt.

## Oberfläche

- Seitenleiste
- Kopfbereich
- kompakte Schnellstarter-/Menüleiste
- Übersicht
- Module
- Arbeitsbereich
- Detailbereich
- Systemstatus
- versteckbarer Bereich `Debugging & Logging`

Die Bereiche enthalten weiterhin keine erfundenen Fachfunktionen.

## Layout bedienen

Direkt unter dem oberen Bereich befindet sich die kompakte Schnellstarterleiste.

Der Schalter **`Layout`** bleibt bewusst außerhalb der veränderbaren Arbeitsfläche. Dadurch bleibt er auch erreichbar, wenn alle Panels ausgeblendet wurden.

### Ein Panel ausblenden

1. `Layout` öffnen.
2. Haken beim gewünschten Bereich entfernen.
3. Die Änderung wird automatisch lokal gespeichert.

### Ein Panel wieder anzeigen

1. `Layout` öffnen.
2. Haken beim gewünschten Bereich setzen.
3. Gespeicherte Reihenfolge und Größe des Panels bleiben erhalten.

### Alles wieder anzeigen

Im Layout-Menü `Alle anzeigen` wählen.

### Komplett auf Standard zurücksetzen

Im Layout-Menü `Standardlayout wiederherstellen` wählen.

Dieser Reset betrifft ausschließlich den Workspace-Schlüssel:

`provoware.allin.workspace.main.v1`

Debug-Einstellungen und andere PROVOWARE-Daten werden nicht gelöscht.

## Panelgröße per Tastatur ändern – 0.3.0-D3a

Ab einer Fensterbreite von **981 px** besitzt jedes Workspace-Panel unten rechts einen fokussierbaren Größen-Griff.

### Bedienung

1. Mit `Tab` zum Größen-Griff des gewünschten Panels wechseln.
2. Mit den Pfeiltasten die Vorschau ändern:
   - `←` eine Rastereinheit schmaler
   - `→` eine Rastereinheit breiter
   - `↑` 24 px niedriger
   - `↓` 24 px höher
3. Während eine Pfeiltaste gehalten oder wiederholt ausgelöst wird, bleibt die Änderung nur eine Vorschau.
4. Nach Freigabe der letzten aktiven Resize-Pfeiltaste wird höchstens einmal gespeichert.

Zusätzlich:

- `Home` / `Pos1` setzt nur die Größe des aktuellen Panels auf den Standard zurück.
- `Escape` verwirft eine laufende Größenvorschau; die vorher gespeicherte Größe bleibt erhalten.
- individuelle Mindest- und Höchstgrößen werden automatisch eingehalten.
- bei bisher automatischer Höhe beginnt die erste Höhenänderung von der tatsächlich sichtbaren Panelhöhe.

### Tablet und Mobil

Bis einschließlich **980 px** ist Resize in D3a absichtlich deaktiviert:

- der Griff wird nicht angezeigt
- Tastatur-Resize wird auch technisch blockiert
- gespeicherte Desktopgrößen werden nicht überschrieben

Maus-, Touch- und Stift-Ziehen folgen separat in `0.3.0-D3b`.

## Workspace-Grundlage

Die zentrale Workspace-Zustandsverwaltung kann:

- Standardzustand reproduzierbar erzeugen
- gespeicherte Layoutdaten prüfen und sicher bereinigen
- unbekannte oder fehlende Panels kontrolliert behandeln
- Sichtbarkeit zentral ändern
- Panelgrößen zentral normalisieren und speichern
- Layoutdaten lokal speichern und wieder laden
- bei beschädigtem oder gesperrtem Browser-Speicher sicher weiterarbeiten
- einzelne Panelgrößen oder den gesamten Workspace kontrolliert zurücksetzen

Die Verantwortung ist getrennt:

- `assets/workspace-state.js` – persistenter Zustand
- `assets/workspace-size.js` – reine Größenregeln und Berechnung
- `assets/workspace-ui.js` – DOM-Darstellung und Nutzerfeedback
- `assets/workspace-layout.css` – Desktopdarstellung
- `assets/workspace-resize.js` – Tastatur-Eingabe, Vorschau, Commit und Abbruch

Die Eingabeschicht schreibt niemals direkt in `localStorage`.

Die Vertragsdetails stehen in [`docs/WORKSPACE_CONTRACT.md`](docs/WORKSPACE_CONTRACT.md) und [`docs/RESIZE_CONTRACT_0.3.0.md`](docs/RESIZE_CONTRACT_0.3.0.md).

Aktuelle Pläne:

- [`docs/PLAN_0.3.0.md`](docs/PLAN_0.3.0.md) – Gesamtplan
- [`docs/PLAN_0.3.0_D.md`](docs/PLAN_0.3.0_D.md) – Resize-Gesamtplan
- [`docs/PLAN_0.3.0_D3A_KEYBOARD.md`](docs/PLAN_0.3.0_D3A_KEYBOARD.md) – abgeschlossene D3a-Teilstufe

## Modulprinzip

Ein **Modul-Steckbrief (Manifest)** beschreibt ein späteres Tool. Das zentrale **Modulverzeichnis (Registry)** prüft diesen Steckbrief, bevor JavaScript geladen wird.

Der feste **Lebenszyklus (Lifecycle)** lautet:

`registered -> loading -> loaded -> active -> inactive -> registered`

Aktuell ist `modules/registry.js` absichtlich leer. Es werden noch keine Fachmodule ausgeliefert.

## Debugging & Logging

Der Bereich ist über `Debug & Logging` ein-/ausblendbar.

- Stufe 1 · Ereignisse
- Stufe 2 · Diagnose
- Stufe 3 · Trace

Registry-Ereignisse erscheinen unter `MODULES`, Workspace-Ereignisse unter `WORKSPACE`.

Resize protokolliert zusammenfassende Abschlüsse und Fehler, nicht jede einzelne Tastenwiederholung.

## Entwicklung und automatische Prüfung

Für Entwickler wird Node.js 20 oder neuer benötigt. Es müssen keine npm-Pakete installiert werden.

### Alles prüfen

```bash
npm run verify
```

Geprüft werden unter anderem:

- JavaScript-Syntax
- JSON und Format
- Pflichtdateien
- lokale HTML-Verweise
- doppelte HTML-IDs
- keine unbeabsichtigten externen Laufzeitverweise
- Versionskonsistenz
- Modulvertrag und Registry
- Workspace-Zustand und Speicherfehler
- Sichtbarkeitsaktionen
- Größen-State und reine Größenberechnung
- CSS-Variablen-Darstellung
- transiente Größenvorschau ohne State-Mutation
- Resize-Griffe und Tastaturbedienung
- Tastenwiederholung mit höchstens einem Commit
- `Escape` und `Home`
- Responsive-Sperre bis 980 px
- sichere Workspace-Script-Reihenfolge
- automatischer Nachweis, dass D3a noch keine Pointer-Ziehlogik enthält

Technischer Stand D3a: **56 Dateien geprüft, 48/48 Tests erfolgreich, 0 fehlgeschlagen**.

### Sichere automatische Korrektur

```bash
npm run fix
```

Der Auto-Fix verändert nur eindeutig semantikneutrale Dinge wie JSON-Einrückung, Zeilenenden und überflüssige Leerzeichen am Zeilenende. Programmlogik wird nicht automatisch umgeschrieben.

## Entwicklungsworkflow

Die verbindlichen Regeln stehen in [`AGENTS.md`](AGENTS.md).

Kurzform:

`BASELINE -> ZIEL -> PLAN -> PRECHECK -> PATCH -> FORMAT/FIX -> TEST -> POSTCHECK -> DOKUMENTATION -> DIFF-GATE -> PR -> MERGE -> MAIN-CHECK`

## Struktur

- `index.html` – semantische UI-Hülle und Asset-Reihenfolge
- `assets/styles.css` – responsives Dark-/Petrol-Basislayout
- `assets/workspace-layout.css` – Desktop-Größen- und Resize-Darstellung
- `assets/app.js` – Logging und Start der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Laufzeit-Lebenszyklus
- `assets/workspace-state.js` – Workspace-Zustand, Validierung, Speicherung, Sichtbarkeit und Größenaktionen
- `assets/workspace-size.js` – reine Größenberechnung
- `assets/workspace-ui.js` – Layout-Menü, DOM-Anwendung, Fokus, Vorschau und Nutzerfeedback
- `assets/workspace-resize.js` – D3a-Tastatur-Resize; Pointer folgt in D3b
- `modules/registry.js` – kanonischer, derzeit leerer Modulkatalog
- `scripts/quality-check.mjs` – reproduzierbare Qualitätsprüfung und sicherer Auto-Fix
- `tests/module-registry.test.mjs` – Modul-Lebenszyklus
- `tests/workspace-state.test.mjs` – Workspace-Zustand
- `tests/workspace-size.test.mjs` – reine Größenberechnung
- `tests/workspace-ui.test.mjs` – Workspace-UI und Größenvorschau
- `tests/workspace-resize.test.mjs` – Tastatur-Resize, Abbruch, Grenzen und Responsive-Sperre
- `tests/workspace-resize-load.test.mjs` – sichere Script-Reihenfolge
- `.github/workflows/quality.yml` – automatisches Quality Gate
- `VERSION.json` – Release- und Entwicklungsmetadaten

## Noch nicht enthalten

- Pointer-/Maus-/Touch-/Stift-Resize – folgt in `0.3.0-D3b`
- Neuordnung/Drag & Drop – folgt erst danach in `0.3.0-E`
- Fachmodule

Eine echte interaktive Firefox-/Chrome-Endabnahme ist noch nicht erfolgt und bleibt Bestandteil des Release Gates `0.3.0-G`.

## Version

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`.

Aktuelle interne Entwicklungsstufe: `0.3.0-D3a – Keyboard Resize Preview`.
