# Entwicklungsplan 0.3.0 – Flexible Workspace Engine

## Zweck

Dieser Masterplan zeigt Reihenfolge, Grenzen und Abnahmestand der gesamten Workspace-Engine. Detailchecklisten stehen in den Teilplänen, damit dieselbe Information nicht mehrfach gepflegt werden muss.

Detailpläne:

- `docs/PLAN_0.3.0_B.md` – Zustandsbasis, Autosave und Reset
- `docs/PLAN_0.3.0_C.md` – Sichtbarkeit und kompakte Schnellstarterleiste

## Ziel in einfacher Sprache

Die bisher feste Arbeitsfläche von **PROVOWARE ALL-IN 2026** wird kontrolliert flexibel. Die Reihenfolge bleibt bewusst:

`Zustand -> Sichtbarkeit -> Größe -> Neuordnung -> Härtung -> Release`

## 1. Feste Architekturregeln

- [x] Workspace-Vertragsversion `1` bleibt Datenbasis.
- [x] Modulvertrag bleibt getrennt.
- [x] feste Daten, Zustandslogik, Speicherung und DOM-Bedienung sind getrennt.
- [x] pro Subsystem genau eine verbindliche Zustandsquelle.
- [x] UI schreibt Workspace-Daten nicht direkt in `localStorage`.
- [x] keine freien x/y-Pixelkoordinaten speichern.
- [x] keine Cloud-Synchronisation oder Remote-Plugins.
- [x] keine neue Laufzeitbibliothek ohne nachgewiesenen Bedarf.
- [x] kleine Funktionen, zentrale Regeln und gezielte Kommentare.
- [x] doppelte Logik und doppelte Dokumentation vermeiden.
- [x] neue Workspace-Funktionen verständlich deutsch benennen.
- [x] Debugging & Logging bleibt außerhalb des Workspace.

## 2. Feste Daten- und Speichergrenzen

Workspace-ID: `main`

Speicher-Schlüssel: `provoware.allin.workspace.main.v1`

Kernpanels:

1. `overview`
2. `modules`
3. `work`
4. `details`
5. `system-status`

Gespeichert werden nur Reihenfolge, Sichtbarkeit, Rasterbreite und optionale Höhe.

Nicht gespeichert werden Fachinhalte, Debuglogs, Modul-Laufzeitstatus, Fokus, Scrollposition, Zeigerposition oder temporäre Drag-/Resize-Vorschau.

## 3. Teilstufen und Status

### 0.3.0-A – Workspace-Vertrag

**Status: 🟢 abgeschlossen**

Ergebnis:

- stabile Panel-IDs
- 12-Spalten-Raster
- Sichtbarkeits-, Größen- und Resetregeln
- persistente und temporäre Zustände getrennt
- responsive Rückfallregeln

Merge: `3998373876f087f90ddbf248c316986b85c20fe9`

### 0.3.0-B – State Foundation & Autosave/Reset

**Status: 🟢 abgeschlossen**

Detailplan: `docs/PLAN_0.3.0_B.md`

Ergebnis:

- zentrale Zustandsverwaltung
- Standardzustand
- Validierung und Normalisierung
- lokale Speicherung
- isolierter Reset
- kontrollierte Speicherfehler
- automatische Tests

Abnahme:

- 35 Dateien geprüft
- 11/11 Tests erfolgreich
- PR #66 gemergt

Merge: `069ad34f2b869fb91dc1c7726cb5903431863cfb`

### 0.3.0-C – Visibility Controls & Compact Menu

**Status: 🟢 abgeschlossen**

Detailplan: `docs/PLAN_0.3.0_C.md`

Ergebnis:

- kompakte feste Schnellstarter-/Menüleiste
- permanenter `Layout`-Schalter außerhalb des Workspace
- Mobile Option A: `Layout` bleibt fest sichtbar; nur sekundärer Inhalt scrollt horizontal
- fünf Panels einzeln ein-/ausblendbar
- alle fünf Panels gleichzeitig ausblendbar
- `Alle anzeigen`
- `Standardlayout wiederherstellen`
- Reihenfolge und Größenwerte bleiben erhalten
- entkoppelte `assets/workspace-ui.js`
- Live-Nutzerfeedback
- `Escape` und Fokus-Rückkehr
- statische Vertrags-/HTML-Zuordnung im Quality Gate

Abnahme:

- Branch 0 Commits hinter `main`
- technischer PR #68
- 20 geänderte Dateien
- Quality Gate `success`
- 39 Dateien statisch geprüft
- 18/18 Tests erfolgreich
- 0 Tests fehlgeschlagen
- Main-Stichprobe erfolgt

Merge: `dce166770cf589a8fb9720cb3c0a650c19151cd9`

### 0.3.0-D – Resize

**Status: 🟡 nächster technischer Schritt**

Ziel:

- [ ] Breite nur in ganzen Rastereinheiten ändern.
- [ ] Mindest-/Höchstbreite erzwingen.
- [ ] Höhe innerhalb gültiger Panelgrenzen ändern.
- [ ] Vorschauzustand nicht persistent speichern.
- [ ] erst validierten Endwert speichern.
- [ ] Maus unterstützen.
- [ ] Touch unterstützen.
- [ ] vollständige Tastaturalternative anbieten.
- [ ] Desktopwerte bei Tablet/Mobil nicht überschreiben.

Abnahmekriterium: Kein Panel kann einen ungültigen oder unbrauchbaren Größenwert speichern.

### 0.3.0-E – Reorder & Drag and Drop

**Status: ⚪ geplant**

Erst nach A bis D.

- [ ] Ziehen nur über dedizierten Griff.
- [ ] Buttons/Formulare lösen kein Drag aus.
- [ ] nur Reihenfolge speichern.
- [ ] keine freien Zeigerkoordinaten speichern.
- [ ] Zielposition klar anzeigen.
- [ ] Drag-Abbruch ohne Zustandsverlust.
- [ ] vollständige Tastaturalternative.
- [ ] nach Abschluss genau einmal speichern.

### 0.3.0-F – Responsive & Accessibility Hardening

**Status: ⚪ geplant**

- [ ] Desktop-, Tablet- und Mobilregeln vollständig prüfen.
- [ ] gespeicherte Desktopwerte bei kleineren Viewports erhalten.
- [ ] vollständige Tastaturnavigation und Fokusführung prüfen.
- [ ] Live-Status, Touch-Ziele und `prefers-reduced-motion` prüfen.
- [ ] versteckte Panels aus Fokusreihenfolge entfernen.

### 0.3.0-G – Release Gate

**Status: ⚪ geplant**

Automatisch:

- [ ] `npm run verify` vollständig grün.
- [ ] alle Workspace-Tests grün.
- [ ] keine unbeabsichtigten externen Laufzeitverweise.
- [ ] Versionen und Manifeste konsistent.
- [ ] GitHub-Actions-Workflow-Hygiene prüfen.

Manuell:

- [ ] Firefox komplett.
- [ ] Chrome stichprobenartig.
- [ ] Desktop, Tablet, Mobil.
- [ ] Sichtbarkeit, Resize, Neuordnung, Tastatur und Reset komplett prüfen.

Release:

- [ ] README, TODO, CHANGELOG und MANIFEST finalisieren.
- [ ] VERSION erst nach vollständiger Abnahme auf `0.3.0` erhöhen.
- [ ] Release-PR mergen.
- [ ] `main` erneut stichproartig prüfen.

## 4. Änderungsvolumen nach Teilstufe

| Teilstufe | Volumen | Hauptbetroffene Bereiche |
| --- | --- | --- |
| A | klein | Vertrag, Planung |
| B | mittel | Zustand, lokaler Speicher, Tests |
| C | mittel | Schnellstarterleiste, Sichtbarkeit, Fokus |
| D | mittel | Größenlogik, Eingabegeräte |
| E | mittel bis groß | Neuordnung, Drag, Tastatur |
| F | mittel | Responsive, Barrierefreiheit |
| G | klein bis mittel | Releaseprüfung, Dokumentation |

Wenn eine Teilstufe deutlich größer wird, wird sie vor der Implementierung weiter aufgeteilt.

## 5. Nutzerfeedback

Sichtbare Layoutaktionen folgen dem Muster:

`Aktion -> Ergebnis -> sicherer Zustand`

Technisches Logging und sichtbares Nutzerfeedback bleiben getrennt.

## 6. Rückweg

Jede Teilstufe erhält einen eigenen Pull Request. Workspace-Reset darf niemals `localStorage.clear()` verwenden. Keine Teilstufe führt eine serverseitige Datenmigration ein.

## 7. Infrastrukturhinweis

GitHub Actions meldet bei den derzeit verwendeten Actions `v4` weiterhin einen Hinweis zur auslaufenden internen Node-20-Laufzeit. Das Projekt-Quality-Gate von 0.3.0-C lief erfolgreich mit Node `20.20.2`.

Die Workflow-Hygiene wird getrennt und spätestens in 0.3.0-G geprüft.

## 8. Nächste zwei Schritte

1. **0.3.0-D – Resize:** Größenänderungen als eigene, validierte Mechanik implementieren.
2. **0.3.0-E – Reorder & Drag and Drop:** erst danach Neuordnung zulassen.

## Empfehlung

Die Reihenfolge `State -> Sichtbarkeit -> Größe -> Neuordnung` beibehalten. Als Nächstes ausschließlich 0.3.0-D umsetzen.
