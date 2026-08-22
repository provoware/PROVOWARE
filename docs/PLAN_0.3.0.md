# Entwicklungsplan 0.3.0 – Flexible Workspace Engine

## Zweck

Dieser Masterplan zeigt Reihenfolge, Grenzen und Abnahmestand der gesamten Workspace-Engine. Detailchecklisten stehen bewusst in den Teilplänen, damit dieselbe technische Information nicht an mehreren Stellen gepflegt werden muss.

Detailpläne:

- `docs/PLAN_0.3.0_B.md` – Zustandsbasis, Autosave und Reset
- `docs/PLAN_0.3.0_C.md` – Sichtbarkeit und kompakte Schnellstarterleiste

## Ziel in einfacher Sprache

Die bisher feste Arbeitsfläche von **PROVOWARE ALL-IN 2026** wird kontrolliert flexibel. Panels sollen:

1. sicher ein-/ausblendbar sein
2. später in der Größe verändert werden können
3. danach neu angeordnet werden können
4. ihre Einstellungen lokal behalten
5. jederzeit vollständig auf den Standard zurückgesetzt werden können

Die Entwicklung bleibt in kleine, einzeln testbare und rückgängig machbare Teilstufen getrennt.

## Begriffe vorab

- **Workspace (Arbeitsfläche):** Bereich mit den veränderbaren Panels.
- **Vertrag (Contract):** feste Regeln für erlaubte Daten und Zustände.
- **Zustand (State):** aktuell gültige Layoutdaten.
- **Persistenz:** lokales Speichern über einen Browser-Neustart hinweg.
- **Normalisierung:** beschädigte oder unvollständige Daten werden kontrolliert auf sichere Werte gebracht.
- **Quality Gate (Qualitätsschranke):** automatische Prüfung vor dem Merge.
- **Rollback (Rückweg):** eine Teilstufe kann gezielt zurückgenommen werden.

## 1. Feste Architekturregeln

Diese Regeln gelten für alle Teilstufen 0.3.0:

- [x] Workspace-Vertragsversion `1` bleibt die Datenbasis.
- [x] Modulvertrag bleibt davon getrennt.
- [x] feste Daten, Zustandslogik, Browser-Speicherung und DOM-Bedienung werden getrennt.
- [x] pro Subsystem existiert genau eine verbindliche Zustandsquelle.
- [x] UI-Code schreibt Workspace-Daten nicht direkt in `localStorage`.
- [x] keine freien x/y-Pixelkoordinaten speichern.
- [x] keine Cloud-Synchronisation.
- [x] keine Remote-Plugins.
- [x] keine neue Laufzeitbibliothek ohne nachgewiesenen Bedarf.
- [x] kleine Funktionen mit klarer Aufgabe bevorzugen.
- [x] doppelte Logik und doppelte Dokumentation vermeiden.
- [x] neue Workspace-Funktionen verständlich und konsistent deutsch benennen.
- [x] Kommentare erklären Gründe oder Sonderfälle statt offensichtlichen Code.
- [x] Debugging & Logging bleibt außerhalb des veränderbaren Workspace.

## 2. Feste Daten- und Speichergrenzen

Workspace-ID:

`main`

Speicher-Schlüssel:

`provoware.allin.workspace.main.v1`

Kernpanels:

1. `overview`
2. `modules`
3. `work`
4. `details`
5. `system-status`

Gespeichert werden nur:

- Reihenfolge
- Sichtbarkeit
- Rasterbreite
- optionale Höhe

Nicht gespeichert werden:

- Fachinhalte
- Debuglogs
- Modul-Laufzeitstatus
- Fokus
- Scrollposition
- Zeigerposition
- temporäre Drag-/Resize-Vorschau

## 3. Teilstufen und Status

### 0.3.0-A – Workspace-Vertrag

**Status: 🟢 abgeschlossen**

Ergebnis:

- stabile Panel-IDs
- 12-Spalten-Raster
- Sichtbarkeits-, Größen- und Resetregeln
- persistente und temporäre Zustände getrennt
- responsive Rückfallregeln
- Planungs-PR #64 gemergt

Merge:

`3998373876f087f90ddbf248c316986b85c20fe9`

### 0.3.0-B – State Foundation & Autosave/Reset

**Status: 🟢 abgeschlossen**

Detailplan: `docs/PLAN_0.3.0_B.md`

Ergebnis:

- `assets/workspace-state.js`
- reproduzierbarer Standardzustand
- Validierung und Normalisierung
- sichere lokale Speicherung
- isolierter Reset
- kontrollierte Speicherfehler
- Workspace-Logging
- automatische Tests

Abnahme:

- 35 Dateien statisch geprüft
- 11/11 Tests erfolgreich
- PR #66 gemergt
- Main-Stichprobe erfolgt

Merge:

`069ad34f2b869fb91dc1c7726cb5903431863cfb`

### 0.3.0-C – Visibility Controls & Compact Menu

**Status: 🟡 implementiert, Abschlussvalidierung läuft**

Detailplan: `docs/PLAN_0.3.0_C.md`

Bestätigte mobile Option A:

- `Layout` bleibt im festen Primärbereich sichtbar
- sekundärer Leisteninhalt darf horizontal überlaufen
- keine separate mobile Zweitnavigation

Implementiert:

- [x] kompakte feste Schnellstarter-/Menüleiste
- [x] permanenter `Layout`-Schalter außerhalb des Workspace
- [x] Layout-Menü für fünf Kernpanels
- [x] jedes Panel einzeln ein-/ausblendbar
- [x] alle fünf Panels gleichzeitig ausblendbar
- [x] `Alle anzeigen`
- [x] `Standardlayout wiederherstellen`
- [x] Reihenfolge und Größe bleiben beim Aus-/Einblenden erhalten
- [x] entkoppelte `assets/workspace-ui.js`
- [x] sichtbares Live-Nutzerfeedback
- [x] `Escape` schließt Layout-Menü und führt Fokus zurück
- [x] automatische State- und UI-Tests
- [x] Quality Gate prüft Panel-Zuordnung und permanenten Layout-Schalter

Noch für Abschluss nötig:

- [ ] vollständiger Diff gegen `main`
- [ ] Branch 0 Commits hinter `main`
- [ ] `npm run verify` im PR erfolgreich
- [ ] PR mergebar
- [ ] Merge
- [ ] Main-Stichprobe

### 0.3.0-D – Resize

**Status: ⚪ nächster technischer Schritt nach C**

Ziel:

- [ ] Breite nur in ganzen Rastereinheiten ändern
- [ ] Mindest-/Höchstbreite erzwingen
- [ ] Höhe nur innerhalb gültiger Panelgrenzen ändern
- [ ] Vorschauzustand nicht persistent speichern
- [ ] erst validierten Endwert speichern
- [ ] Maus unterstützen
- [ ] Touch unterstützen
- [ ] Tastaturalternative anbieten
- [ ] Desktopwerte bei Tablet/Mobil nicht überschreiben

Abnahmekriterium:

Kein Panel kann einen ungültigen oder unbrauchbaren Größenwert speichern.

### 0.3.0-E – Reorder & Drag and Drop

**Status: ⚪ geplant**

Erst nach A bis D.

Ziel:

- [ ] Ziehen nur über dedizierten Griff starten
- [ ] Buttons/Formulare lösen kein Drag aus
- [ ] nur Reihenfolge speichern
- [ ] keine freien Zeigerkoordinaten speichern
- [ ] Zielposition klar anzeigen
- [ ] Drag-Abbruch ohne Zustandsverlust
- [ ] vollständige Tastaturalternative
- [ ] nach Abschluss genau einmal speichern

Abnahmekriterium:

Gleiche gespeicherte Reihenfolge erzeugt reproduzierbar dasselbe Layout.

### 0.3.0-F – Responsive & Accessibility Hardening

**Status: ⚪ geplant**

Responsive:

- [ ] Desktop ab 981 px: gespeicherte Rasterbreite anwenden
- [ ] Tablet 681–980 px: sichere 6-/12-Spalten-Darstellung
- [ ] Mobil bis 680 px: sichtbare Panels Vollbreite
- [ ] Desktopwerte nicht durch kleinere Viewports überschreiben

Bedienbarkeit:

- [ ] vollständige Tastaturnavigation
- [ ] klare Fokusführung
- [ ] Live-Status für Layoutaktionen
- [ ] `prefers-reduced-motion` prüfen
- [ ] Touch-Ziele prüfen
- [ ] versteckte Panels aus Fokusreihenfolge entfernen

### 0.3.0-G – Release Gate

**Status: ⚪ geplant**

Automatisch:

- [ ] `npm run verify` vollständig grün
- [ ] alle Workspace-Tests grün
- [ ] keine unbeabsichtigten externen Laufzeitverweise
- [ ] Versionen und Manifeste konsistent
- [ ] GitHub-Actions-Workflow-Hygiene prüfen

Manuell:

- [ ] Firefox komplett
- [ ] Chrome stichprobenartig
- [ ] Desktop, Tablet, Mobil
- [ ] alle Panels ausblenden und wiederherstellen
- [ ] Resize
- [ ] Reorder/Drag
- [ ] Tastaturablauf
- [ ] Reset aus verändertem Layout

Release:

- [ ] README final
- [ ] TODO final
- [ ] CHANGELOG final
- [ ] MANIFEST final
- [ ] VERSION erst jetzt auf `0.3.0`
- [ ] Release-PR mergen
- [ ] `main` stichprobenartig nachprüfen

## 4. Änderungsvolumen

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

Fehlertexte sollen beantworten:

1. Was ist passiert?
2. Welcher Bereich ist betroffen?
3. Welcher sichere Zustand bleibt bestehen?

Technisches Logging und sichtbares Nutzerfeedback bleiben getrennt.

## 6. Rückweg

Jede Teilstufe erhält einen eigenen Pull Request.

Workspace-Reset darf niemals `localStorage.clear()` verwenden.

Keine Teilstufe führt eine serverseitige Datenmigration ein.

## 7. Nicht blockierender Infrastrukturhinweis

GitHub Actions weist bei den derzeit verwendeten Actions der Generation `v4` auf eine auslaufende interne Node-20-Laufzeit hin. Das Projekt-Quality-Gate selbst lief in 0.3.0-B erfolgreich mit Node `20.20.2`.

Diese Workflow-Hygiene wird getrennt und spätestens in 0.3.0-G geprüft, damit Funktionsänderungen und Infrastrukturänderungen nicht unnötig vermischt werden.

## 8. Nächste zwei Schritte

### Nächster Schritt nach erfolgreichem C-Merge

**0.3.0-D – Resize**

Zuerst Größenänderungen als eigene Mechanik implementieren und vollständig validieren.

### Danach

**0.3.0-E – Reorder & Drag and Drop**

Erst wenn Zustand, Sichtbarkeit und Größe stabil sind, darf Neuordnung den Workspace-Zustand verändern.

## Empfehlung

Die Reihenfolge `State -> Sichtbarkeit -> Größe -> Neuordnung` beibehalten. Sie reduziert Seiteneffekte, verhindert Misch-Patches und macht Fehler deutlich leichter reproduzierbar.
