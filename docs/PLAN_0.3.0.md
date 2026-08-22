# Entwicklungsplan 0.3.0 – Flexible Workspace Engine

## Zweck

Dieser Masterplan zeigt Reihenfolge, Grenzen und Abnahmestand der gesamten Workspace-Engine. Detailchecklisten liegen in eigenen Teilplänen, damit dieselbe technische Information nicht mehrfach gepflegt werden muss.

Detailpläne:

- `docs/PLAN_0.3.0_B.md` – Zustandsbasis, Autosave und Reset
- `docs/PLAN_0.3.0_C.md` – Sichtbarkeit und kompakte Schnellstarterleiste
- `docs/PLAN_0.3.0_D.md` – Resize

Spezialverträge:

- `docs/WORKSPACE_CONTRACT.md` – allgemeiner Workspace-Vertrag Version 1
- `docs/RESIZE_CONTRACT_0.3.0.md` – detaillierter Größenänderungsvertrag für 0.3.0-D

## Ziel in einfacher Sprache

Die feste Arbeitsfläche wird kontrolliert flexibel. Die Reihenfolge bleibt bewusst:

`Zustand -> Sichtbarkeit -> Größe -> Neuordnung -> Härtung -> Release`

Jede Mechanik muss zuerst einen klaren Nutzen, einen festen Datenvertrag, reproduzierbare Tests und einen Rückweg besitzen.

---

# 1. Feste Architekturregeln

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
- [x] transiente Bedienzustände werden niemals persistent gespeichert.

---

# 2. Feste Daten- und Speichergrenzen

Workspace-ID: `main`

Speicher-Schlüssel: `provoware.allin.workspace.main.v1`

Kernpanels:

1. `overview`
2. `modules`
3. `work`
4. `details`
5. `system-status`

Gespeichert werden nur Reihenfolge, Sichtbarkeit, Rasterbreite und optionale Höhe.

Nicht gespeichert werden Fachinhalte, Debuglogs, Modul-Laufzeitstatus, Fokus, Scrollposition, Zeigerposition, Resize-/Drag-Vorschau oder Browserfenstergröße.

---

# 3. Teilstufen und Status

## 0.3.0-A – Workspace-Vertrag

**Status: 🟢 abgeschlossen**

Merge: `3998373876f087f90ddbf248c316986b85c20fe9`

## 0.3.0-B – State Foundation & Autosave/Reset

**Status: 🟢 abgeschlossen**

Detailplan: `docs/PLAN_0.3.0_B.md`

Abnahme:

- 35 Dateien geprüft
- 11/11 Tests erfolgreich
- PR #66 gemergt

Merge: `069ad34f2b869fb91dc1c7726cb5903431863cfb`

## 0.3.0-C – Visibility Controls & Compact Menu

**Status: 🟢 abgeschlossen**

Detailplan: `docs/PLAN_0.3.0_C.md`

Abnahme:

- technischer PR #68
- 20 geänderte Dateien
- Quality Gate `success`
- 39 Dateien geprüft
- 18/18 Tests erfolgreich
- Main-Stichprobe erfolgt

Merge: `dce166770cf589a8fb9720cb3c0a650c19151cd9`

## 0.3.0-D – Resize

**Status: 🟡 Planungs-/Vertragsphase abgeschlossen; technische Implementierung ist nächster Schritt**

Detailplan: `docs/PLAN_0.3.0_D.md`

Resize-Vertrag: `docs/RESIZE_CONTRACT_0.3.0.md`

Planungsabnahme:

- Planungs-PR #70
- 9 geänderte Dokumentations-/Metadatendateien
- Branch 0 Commits hinter `main`
- Quality Gate `success`
- 42 Dateien statisch geprüft
- bestehende Tests 18/18 erfolgreich
- 0 fehlgeschlagen
- Main-Stichprobe erfolgt

Planungs-Merge:

`c41b958b6a1aa426cd427be4f633742b21e404d0`

Verbindliche Resize-Regeln:

- ein klarer Resize-Griff pro sichtbarem Panel
- Maus/Touch/Stift über gemeinsame Pointer Events
- derselbe Griff per Tastatur bedienbar
- Breite: Schritt 1 Rastereinheit
- Höhe: Schritt 24 px
- Pointer-/Tastaturbewegungen erzeugen nur Vorschau
- Persistenz erst nach validiertem Abschluss
- `Home` stellt die einzelne Panelgröße auf Standard zurück
- Resize in 0.3.0-D aktiv ab 981 px
- gespeicherte Desktopwerte bleiben auf Tablet/Mobil unverändert
- keine zweite vollständige Größensteuerung im Layout-Menü
- Drag & Drop bleibt bis 0.3.0-E gesperrt

Technische Reihenfolge:

1. State-API `panelGroesseSetzen` und `panelGroesseZuruecksetzen`
2. reine Raster-/Höhenberechnung
3. automatische Tests
4. gespeicherte Größen zentral auf DOM anwenden
5. Resize-Griffe
6. Pointer-Controller
7. Tastatursteuerung
8. Responsive-/Abbruchhärtung
9. Quality Gate und Dokumentationsabschluss

Abnahmekriterium:

Kein Panel darf einen ungültigen Größenwert persistieren. Eine laufende Größenänderung muss ohne Zustandsverlust abgebrochen werden können.

## 0.3.0-E – Reorder & Drag and Drop

**Status: ⚪ geplant und bis vollständiger D-Abnahme gesperrt**

- [ ] Ziehen nur über dedizierten Drag-Griff.
- [ ] Resize-Griff darf keinen Drag starten.
- [ ] nur Reihenfolge speichern.
- [ ] keine freien Zeigerkoordinaten speichern.
- [ ] Zielposition klar anzeigen.
- [ ] Drag-Abbruch ohne Zustandsverlust.
- [ ] vollständige Tastaturalternative.
- [ ] nach Abschluss genau einmal speichern.

## 0.3.0-F – Responsive & Accessibility Hardening

**Status: ⚪ geplant**

- [ ] Desktop-, Tablet- und Mobilregeln vollständig prüfen.
- [ ] gespeicherte Desktopwerte bei kleineren Viewports erhalten.
- [ ] vollständige Tastaturnavigation und Fokusführung prüfen.
- [ ] Live-Status, Touch-Ziele und `prefers-reduced-motion` prüfen.
- [ ] versteckte Panels aus Fokusreihenfolge entfernen.

## 0.3.0-G – Release Gate

**Status: ⚪ geplant**

- [ ] `npm run verify` vollständig grün.
- [ ] alle Workspace-Tests grün.
- [ ] keine unbeabsichtigten externen Laufzeitverweise.
- [ ] Versionen und Manifeste konsistent.
- [ ] GitHub-Actions-Workflow-Hygiene prüfen.
- [ ] Firefox komplett prüfen.
- [ ] Chrome stichprobenartig prüfen.
- [ ] Desktop, Tablet, Mobil prüfen.
- [ ] Sichtbarkeit, Resize, Neuordnung, Tastatur und Reset komplett prüfen.
- [ ] README, TODO, CHANGELOG und MANIFEST finalisieren.
- [ ] VERSION erst nach vollständiger Abnahme auf `0.3.0` erhöhen.
- [ ] Release-PR mergen und `main` erneut stichproartig prüfen.

---

# 4. Änderungsvolumen nach Teilstufe

| Teilstufe | Volumen | Hauptbetroffene Bereiche |
| --- | --- | --- |
| A | klein | Vertrag, Planung |
| B | mittel | Zustand, lokaler Speicher, Tests |
| C | mittel | Schnellstarterleiste, Sichtbarkeit, Fokus |
| D Planung | klein bis mittel | Vertrag, Testmatrix, Dokumentation |
| D Implementierung | mittel | State, Größenberechnung, Resize-Eingabe, Tests |
| E | mittel bis groß | Neuordnung, Drag, Tastatur |
| F | mittel | Responsive, Barrierefreiheit |
| G | klein bis mittel | Releaseprüfung, Dokumentation |

Wenn eine Teilstufe deutlich größer wird, wird sie **vor** der Implementierung weiter aufgeteilt.

---

# 5. Nutzerfeedback

Sichtbare Layoutaktionen folgen dem Muster:

`Aktion -> Ergebnis -> sicherer Zustand`

Resize ergänzt eine kompakte Vorschau der aktuellen Zielgröße, ohne pro Bewegung technische Logmeldungen zu erzeugen.

Technisches Logging und sichtbares Nutzerfeedback bleiben getrennt.

---

# 6. Rückweg

Jede Teilstufe erhält einen eigenen Pull Request. Resize-Planung und Resize-Laufzeit bleiben getrennte PRs. Dadurch kann fehlerhafte Laufzeitlogik zurückgenommen werden, ohne den stabilen Stand 0.3.0-C oder den freigegebenen Resize-Vertrag zu beschädigen.

Workspace-Reset darf niemals `localStorage.clear()` verwenden.

---

# 7. Infrastrukturhinweis

GitHub Actions meldet bei den derzeit verwendeten Actions `v4` weiterhin einen Hinweis zur auslaufenden internen Node-20-Laufzeit. Das Projekt-Quality-Gate läuft erfolgreich mit Node `20.20.2`.

Die Workflow-Hygiene bleibt getrennt und wird spätestens in 0.3.0-G geprüft.

---

# 8. Nächste zwei Schritte

1. **0.3.0-D State-API + Größenberechnung:** zuerst die persistenten Größenmethoden und reine Berechnung implementieren und testen.
2. **0.3.0-D Resize-Griffe + Eingabe:** danach Pointer-/Tastaturbedienung auf die geprüfte Logik setzen.

Anschließend erst `0.3.0-E – Reorder & Drag and Drop`.

## Empfehlung

Den technischen Resize-Patch jetzt ausschließlich mit State-API, Rasterberechnung und Tests beginnen. Sichtbare Ziehlogik erst anschließen, wenn diese Basis grün ist.
