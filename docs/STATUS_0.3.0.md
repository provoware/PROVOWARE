# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

Abgeschlossen sind:

- `0.3.0-A – Workspace-Vertrag`
- `0.3.0-B – State Foundation & Autosave/Reset`
- `0.3.0-C – Visibility Controls + kompakte Menüleiste`
- `0.3.0-D1 – State-API + reine Größenberechnung`
- `0.3.0-D2 – DOM-Anwendung gespeicherter Größen`
- **`0.3.0-D3a – Resize-Griff + Tastatur-Vorschau`**

Als Nächstes folgt ausschließlich **`0.3.0-D3b – Pointer/Maus/Touch/Stift`**. Drag & Drop bleibt bis zum vollständigen Abschluss von D3b gesperrt.

Die freigegebene Produktversion bleibt bis zur vollständigen Workspace-Abnahme korrekt bei `0.2.0`. `VERSION.json` weist die interne Entwicklungsphase als `0.3.0-D3a Keyboard Resize Preview` aus. Workspace-Vertragsversion und Speicher-Schlüssel bleiben unverändert.

## D3a – Ziel in einfacher Sprache

D3a führt erstmals eine sichtbare Größenbedienung ein, beschränkt sie aber bewusst auf die Tastatur. Dadurch konnte zuerst der kontrollierbare Vorschau-/Speicherpfad geprüft werden, bevor Maus, Touch und Stift hinzukommen.

Verbindliche Kette:

```text
Resize-Griff -> workspace-resize.js -> transiente Vorschau -> Workspace-State -> Workspace-UI
```

Während einer Tastenserie wird ausschließlich die Vorschau verändert. Erst nach der letzten passenden Tastenfreigabe wird höchstens ein validierter Endwert gespeichert.

## D3a – Implementiert

### Resize-Griffe

- genau ein dynamisch erzeugter Griff pro Workspace-Panel
- echte `button`-Elemente statt funktionsloser HTML-Platzhalter
- verständliche deutsche `aria-label`-Beschriftung
- `aria-keyshortcuts` für Pfeile, `Home` und `Escape`
- ungefähr 44 × 44 px Trefferfläche
- Griff nur ab 981 px sichtbar
- zusätzlicher unterer Panel-Innenabstand verhindert Überlagerung normaler Inhalte

### Tastaturmodell

- `ArrowLeft` → Breite um 1 Rastereinheit kleiner
- `ArrowRight` → Breite um 1 Rastereinheit größer
- `ArrowUp` → Höhe um 24 px kleiner
- `ArrowDown` → Höhe um 24 px größer
- `Home` → nur aktuelles Panel auf Standardbreite und automatische Höhe zurücksetzen
- `Escape` → laufende Vorschau verwerfen; gespeicherte Größe bleibt erhalten

Grenzen stammen weiterhin ausschließlich aus `PANEL_DEFINITIONEN`. Der Höhenschritt wird aus `PROVOWARE_WORKSPACE_SIZE.HOEHEN_SCHRITT_PX` übernommen und nicht parallel dupliziert.

### Vorschau und Persistenz

- `keydown` verändert nur den flüchtigen Vorschauzustand
- automatisch wiederholte `keydown`-Ereignisse speichern nichts
- mehrere gleichzeitig gehaltene Resize-Pfeiltasten werden als eine Tastenserie behandelt
- erst nach Freigabe der letzten aktiven Resize-Pfeiltaste erfolgt höchstens ein Größen-Commit
- eine Vorschau ohne tatsächliche Wertänderung erzeugt keinen unnötigen Commit
- `assets/workspace-ui.js` verwendet für Vorschau und gespeicherte Größe denselben CSS-Variablenvertrag
- erneutes Anwenden des gespeicherten Zustands entfernt den Vorschau-Marker reproduzierbar
- `assets/workspace-resize.js` schreibt niemals direkt in `localStorage`

### Automatische Höhe

Wenn `heightPx` noch `null` ist, wird für die erste Höhenaktion die tatsächlich gerenderte Panelhöhe gelesen. Danach greift wieder das feste 24-px-Raster und die vorhandene Min-/Max-Begrenzung.

### Responsive Schutz

Bis einschließlich 980 px:

- Resize-Griffe sind per CSS verborgen
- Tastaturaktionen werden zusätzlich logisch blockiert
- ein Wechsel von Desktop auf eine kleine Ansicht verwirft eine laufende Vorschau ohne Größen-Commit
- gespeicherte Desktopwerte bleiben unverändert

## Verantwortungstrennung

### Unverändert

- `assets/workspace-state.js` – einzige persistente Workspace-Quelle
- `assets/workspace-size.js` – reine Größenberechnung und zentraler Höhenschritt

### Erweitert

- `assets/workspace-ui.js` – zusätzlich kleine wiederverwendbare Vorschau-Schnittstelle, weiterhin ohne eigene Persistenz
- `assets/workspace-layout.css` – Griff-, Aktiv- und Vorschau-Darstellung ab 981 px
- `assets/app.js` – initialisiert Resize erst nach State und UI
- `index.html` – deterministische Reihenfolge `state -> size -> ui -> resize -> app`

### Neu

- `assets/workspace-resize.js` – Tastatur-Eingabeschicht, flüchtige Sitzung, Commit/Abbruch, Feedback und Logging
- `tests/workspace-resize.test.mjs`
- `tests/workspace-resize-load.test.mjs`
- `docs/PLAN_0.3.0_D3A_KEYBOARD.md`
- `docs/MANIFEST_0.3.0_D3A_KEYBOARD.md`

## Bewusst nicht enthalten

D3a enthält ausdrücklich noch nicht:

- `pointerdown`
- `pointermove`
- `pointerup`
- `pointercancel`
- Pointer Capture
- Mausziehen
- Touchziehen
- Stiftziehen
- Drag & Drop
- neue State-API
- neue persistente Felder
- neuen Browser-Speicherschlüssel
- neue Bibliothek

Die Abwesenheit der Pointer-Ziehlogik wird automatisiert geprüft.

## Reale D3a-Abnahme

- technische Ausgangsbaseline: `d5d7022816e3c164f641a39ccd9b05a5722d0db2`
- technischer Pull Request: `#78`
- geänderte Dateien im technischen PR: `11`
- Branch beim finalen Diff-Check: `0` Commits hinter `main`
- PR vor Merge: mergebar
- GitHub Quality Gate: `success`
- statische Projektprüfung: `56` Dateien erfolgreich geprüft
- automatische Tests: `48/48` erfolgreich
- fehlgeschlagene Tests: `0`
- Projektprüfung: Node `20.20.2`
- Squash-Merge: `5e1db3ff65d034b478f4aec032f36c0c3ffb2300`
- Main-Stichprobe erfolgreich: `assets/workspace-resize.js`, `index.html`, `VERSION.json`

Die vorhandenen Modul-, Workspace-State-, Größenberechnungs-, Sichtbarkeits- und D2-Darstellungstests blieben ebenfalls grün.

## Änderungsvolumen D3a

Einstufung: **mittel**.

Direkt zur Laufzeit betroffen:

- `assets/workspace-resize.js`
- `assets/workspace-ui.js`
- `assets/workspace-layout.css`
- `assets/app.js`
- `index.html`

Qualität/Dokumentation betroffen:

- `tests/workspace-resize.test.mjs`
- `tests/workspace-resize-load.test.mjs`
- `tests/workspace-ui.test.mjs`
- `VERSION.json`
- D3a-Plan und Patchmanifest

Nicht betroffen:

- persistentes Workspace-Schema
- `assets/workspace-state.js`
- eigentliche D1-Bewegungsberechnung in `assets/workspace-size.js`
- Modulvertrag
- Fachmodule
- Netzwerk

## Offene technische Grenzen

Eine echte interaktive Firefox-/Chrome-Abnahme wurde in D3a noch nicht durchgeführt. Sie bleibt Teil des Release Gates `0.3.0-G`.

GitHub Actions meldet weiterhin den bekannten nicht blockierenden Hinweis zur auslaufenden internen Node-20-Laufzeit der verwendeten Actions. Das Projekt-Quality-Gate selbst lief erfolgreich mit Node `20.20.2`. Die Workflow-Hygiene bleibt separat für `0.3.0-G`.

## Nächste zwei Schritte

1. **0.3.0-D3b – Pointer/Maus/Touch/Stift:** vorhandenen Griff und dieselbe Vorschau-/Commit-Architektur wiederverwenden; `pointermove` darf nur Vorschau verändern, `pointerup` höchstens einmal persistieren und `pointercancel` muss ohne Zustandsverlust abbrechen.
2. **0.3.0-E – Reorder & Drag and Drop:** erst nach vollständig grüner D3b-Abnahme; Resize-Griff und späterer Drag-Griff bleiben getrennte Mechaniken.

## Empfehlung

D3b erneut als eigenständigen kleinen Patch behandeln. Keine neue Vorschau-, Größen- oder Persistenzlogik erfinden; stattdessen Pointer Events direkt auf die jetzt geprüfte D3a-Infrastruktur setzen.
