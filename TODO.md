# TODO

## PLAN_DELTA

### 0.1.0 – UI Foundation

- [x] Repository als leeres Projektgerüst neu anlegen.
- [x] PROVOWARE ALL-IN 2026 als leere modulare HTML-Oberfläche anlegen.
- [x] Responsive Dark-/Petrol-UI mit Seitenleiste, Kopfbereich und flexiblen Kartenbereichen aufbauen.
- [x] Versteckbaren Debugging-/Logging-Bereich mit drei Stufen integrieren.
- [x] Fehler- und Promise-Erfassung sowie begrenzten In-Memory-Logpuffer vorbereiten.
- [x] Versionsmetadaten für `0.1.0 – UI Foundation` anlegen.

### 0.2.0 – Module Contract & Registry

- [x] Detaillierten, nummerierten Entwicklungsplan mit Abnahmekriterien anlegen.
- [x] `AGENTS.md` auf kleine, begründete und reproduzierbare Patches ausrichten.
- [x] Minimalen Modulvertrag mit Vertragsversion `1` definieren.
- [x] Leeren kanonischen Modulkatalog anlegen.
- [x] Registry-Zustände und kontrollierten Modul-Lebenszyklus implementieren.
- [x] Laden, Aktivieren, Deaktivieren und Entfernen über eine kleine öffentliche API bereitstellen.
- [x] Registry an das vorhandene dreistufige Logging anbinden.
- [x] Direkten Browserstart ohne Server oder Laufzeitpakete erhalten.
- [x] Abhängigkeitsfreies Node-20-Quality-Gate anlegen.
- [x] Sicheren Auto-Fix für Format-/Textnormalisierung ergänzen.
- [x] Automatischen Modul-Lebenszyklustest mit Node-Bordmitteln ergänzen.
- [x] GitHub-Actions-Prüfung für Pull Requests und `main` einrichten.
- [x] Pull-Request-Quality-Gate erfolgreich durchlaufen lassen (PR #62).
- [x] Branch-Diff gegen aktuellen `main` abschließend kontrollieren; Branch war 0 Commits hinter `main`.
- [x] 0.2.0 über PR #62 mergen und `main` stichproartig nachprüfen.

Release-Merge: `64b7f232acd13535133ee5f0a5e3322cbae7e0ba`

## Nächste Iteration

### 0.3.0 – Flexible Workspace Engine

#### 0.3.0-A – Workspace-Vertrag

- [x] Option A festlegen: Layout automatisch lokal speichern und vollständig rücksetzbar machen.
- [x] Detaillierten Entwicklungsplan in `docs/PLAN_0.3.0.md` anlegen.
- [x] Workspace-Vertrag Version 1 in `docs/WORKSPACE_CONTRACT.md` definieren.
- [x] Stabile Panel-IDs, Reihenfolge, Sichtbarkeit, Breite, Höhe und erlaubten Bereich festlegen.
- [x] Persistente Layoutdaten von temporären Drag-/Resize-Zuständen trennen.
- [x] Responsive Regeln definieren, ohne gespeicherte Desktopwerte auf Mobilgeräten zu überschreiben.
- [x] Versionierten lokalen Speicher-Schlüssel und sicheren Reset-Vertrag festlegen.
- [x] Drag & Drop bis nach stabiler State-/Visibility-/Resize-Basis ausdrücklich zurückstellen.
- [x] Option A für vollständig ausgeblendeten Workspace festlegen: permanenter `Layout`-Schalter außerhalb des Workspace.
- [x] Kompakte Schnellstarter-/Menüleiste unter dem festen oberen Bereich für 0.3.0-C festlegen.
- [x] Planungs-PR #64 erfolgreich durch Quality Gate bringen und mergen.

Planungs-Merge: `3998373876f087f90ddbf248c316986b85c20fe9`

#### 0.3.0-B – State Foundation & Autosave/Reset

- [x] Detaillierten Teilplan `docs/PLAN_0.3.0_B.md` mit Änderungsvolumen und Abnahmekriterien anlegen.
- [x] Workspace-Vertrag als kleine validierbare Laufzeitbasis implementieren.
- [x] Standarddefinition und Standardzustand zentral abbilden.
- [x] Standardzustand und gespeicherten Zustand deterministisch normalisieren.
- [x] Daten, reine Logik, Browser-Speicherung und Logging klar trennen.
- [x] Automatische lokale Speicherung über `zustandSetzen`/`zustandSpeichern` vorbereiten.
- [x] `zuruecksetzen` isoliert auf den Workspace-Schlüssel begrenzen.
- [x] beschädigte oder gesperrte Browser-Speicherung robust behandeln.
- [x] Workspace-Fehler verständlich im Bereich `WORKSPACE` loggen.
- [x] automatische Tests für Zustand, Validierung, Speicherung und Reset ergänzen.
- [x] `npm run test` auf alle Testdateien erweitern.
- [x] Quality Gate um Workspace-Pflichtdateien und Script-Reihenfolge erweitern.
- [x] `AGENTS.md` um Wartbarkeits-, Zustands- und Transparenzregeln schärfen.
- [x] Hauptmanifest und Patchmanifest synchronisieren.
- [x] vollständigen Branch-Diff gegen `main` prüfen; Branch war 0 Commits hinter `main`.
- [x] GitHub Quality Gate erfolgreich durchlaufen lassen: 35 Dateien geprüft, 11/11 Tests erfolgreich.
- [x] PR #66 als mergebar prüfen und 0.3.0-B per Squash mergen.
- [x] `assets/workspace-state.js` und `VERSION.json` nach Merge auf `main` stichproartig nachprüfen.

0.3.0-B-Merge: `069ad34f2b869fb91dc1c7726cb5903431863cfb`

#### 0.3.0-C – Visibility Controls + kompakte Menüleiste

- [x] Detaillierten Teilplan `docs/PLAN_0.3.0_C.md` anlegen.
- [x] Mobile Option A festlegen: `Layout` fest sichtbar, sekundärer Bereich darf horizontal scrollen.
- [x] feste kompakte Schnellstarter-/Menüleiste direkt unter dem oberen Bereich anlegen.
- [x] permanenten `Layout`-Schalter außerhalb des veränderbaren Workspace integrieren.
- [x] stabile `data-workspace-panel`-Zuordnung für alle fünf Kernpanels ergänzen.
- [x] `assets/workspace-ui.js` als entkoppelte DOM-/Bedienlogik anlegen.
- [x] Panels zentral ein-/ausblendbar machen.
- [x] alle fünf Panels gleichzeitig ausblendbar lassen.
- [x] `Alle anzeigen` und `Standardlayout wiederherstellen` jederzeit erreichbar halten.
- [x] ausgeblendete Panels mit gespeicherter Position und Größe wiederherstellen.
- [x] Tastaturbedienung mit `Escape` und nachvollziehbarer Fokusführung ergänzen.
- [x] verständliches Live-Nutzerfeedback ergänzen.
- [x] Workspace-State-API um zentrale Sichtbarkeitsaktionen erweitern.
- [x] automatische Zustands- und UI-Tests ergänzen.
- [x] Quality Gate um UI-Pflichtdatei, Panel-Zuordnung und sicheren Layout-Schalter erweitern.
- [x] Patchmanifest `docs/MANIFEST_0.3.0_C.md` anlegen.
- [x] vollständigen Branch-Diff gegen `main` prüfen; Branch war 0 Commits hinter `main`.
- [x] GitHub Quality Gate erfolgreich: 39 Dateien geprüft, 18/18 Tests erfolgreich, 0 fehlgeschlagen.
- [x] PR #68 als mergebar prüfen und 0.3.0-C per Squash mergen.
- [x] `index.html`, `assets/workspace-ui.js` und `VERSION.json` nach Merge auf `main` stichproartig nachprüfen.

0.3.0-C-Merge: `dce166770cf589a8fb9720cb3c0a650c19151cd9`

#### 0.3.0-D – Resize

##### Planung & Vertrag

- [x] Option A bestätigen: ein Resize-Griff für Maus, Touch/Stift und Tastatur.
- [x] detaillierten Resize-Vertrag `docs/RESIZE_CONTRACT_0.3.0.md` anlegen.
- [x] detaillierten Teilplan `docs/PLAN_0.3.0_D.md` anlegen.
- [x] Planungsmanifest `docs/MANIFEST_0.3.0_D_PLAN.md` anlegen.
- [x] Breite auf Schritte von 1 Rastereinheit festlegen.
- [x] Höhe auf Schritte von 24 px festlegen.
- [x] individuelle Min-/Max-Grenzen aus `PANEL_DEFINITIONEN` als einzige Größenquelle bestätigen.
- [x] Pointerbewegungen ausschließlich als transiente Vorschau definieren.
- [x] Persistenz erst nach validiertem Abschluss definieren.
- [x] Tastaturmodell festlegen: Pfeile, `Home`, `Escape`.
- [x] Tastenwiederholung auf Vorschau + einen Commit bei `keyup` begrenzen.
- [x] Resize in 0.3.0-D nur ab 981 px aktiv festlegen.
- [x] Tablet-/Mobilansichten dürfen gespeicherte Desktopwerte nicht überschreiben.
- [x] 40-teilige Testmatrix definieren.
- [x] Drag & Drop weiterhin bis 0.3.0-E sperren.
- [x] Planungs-Diff gegen `main` prüfen; Branch war 0 Commits hinter `main`.
- [x] Planungs-Quality-Gate erfolgreich: 42 Dateien geprüft, 18/18 bestehende Tests erfolgreich.
- [x] Planungs-PR #70 als mergebar prüfen und per Squash mergen.
- [x] `docs/RESIZE_CONTRACT_0.3.0.md`, `docs/PLAN_0.3.0_D.md` und `VERSION.json` auf `main` stichproartig nachprüfen.

0.3.0-D-Planungs-Merge: `c41b958b6a1aa426cd427be4f633742b21e404d0`

##### Technische Implementierung nach Planungsmerge

- [x] State-API `panelGroesseSetzen` ergänzen.
- [x] State-API `panelGroesseZuruecksetzen` ergänzen.
- [x] reine Raster-/Höhenberechnung in `assets/workspace-size.js` implementieren.
- [x] Größenberechnung inklusive realem CSS-`column-gap` automatisiert testen.
- [x] automatische State- und Berechnungstests ergänzen.
- [ ] gespeicherte Breite/Höhe zentral auf DOM anwenden.
- [ ] `heightPx: null` als automatische Höhe in der DOM-Anwendung erhalten.
- [ ] genau einen Resize-Griff pro sichtbarem Panel integrieren.
- [ ] ungefähr 44 × 44 px sichere Trefferfläche gewährleisten.
- [ ] `assets/workspace-resize.js` als entkoppelte Eingabeschicht anlegen.
- [ ] Pointer Capture und Pointer-Abbruch robust behandeln.
- [ ] während Pointerbewegung niemals persistent speichern.
- [ ] `pointerup` auf genau einen Commit begrenzen.
- [ ] Tastatur-Pfeile, `Home`, `Escape` implementieren.
- [ ] Resize bis 980 px kontrolliert deaktivieren.
- [ ] Nutzerfeedback und WORKSPACE-Logging für die sichtbare Resize-Bedienung ergänzen.
- [ ] automatische Pointer-, Tastatur- und Responsive-Tests ergänzen.
- [ ] Quality Gate um Resize-Vertragsprüfungen für die sichtbare Bedienung erweitern.
- [ ] vollständigen technischen Diff gegen `main` prüfen.
- [ ] technisches Quality Gate erfolgreich abschließen.
- [ ] technischen PR mergebar prüfen und mergen.
- [ ] zentrale Laufzeitdateien nach Merge auf `main` stichproartig prüfen.

#### 0.3.0-E – Reorder & Drag and Drop

- [ ] Erst nach vollständig grünem 0.3.0-D beginnen.
- [ ] Ziehen nur über dedizierten Drag-Griff erlauben.
- [ ] Resize-Griff darf niemals Drag auslösen.
- [ ] Nur Reihenfolge, keine freien Pixelkoordinaten speichern.
- [ ] Drag-Abbruch ohne Zustandsverlust ermöglichen.
- [ ] vollständige Tastaturalternative anbieten.

#### 0.3.0-F – Responsive & Accessibility Hardening

- [ ] Desktop-, Tablet- und Mobilregeln vollständig prüfen.
- [ ] Fokus, Live-Status und `prefers-reduced-motion` absichern.
- [ ] Touch-Ziele und Tastaturnavigation prüfen.

#### 0.3.0-G – Release Gate

- [ ] `npm run verify` mit allen Workspace-Prüfungen grün abschließen.
- [ ] manuelle Firefox-Abnahme durchführen.
- [ ] Chrome-Kompatibilität stichprobenartig prüfen.
- [ ] README, CHANGELOG, MANIFEST und VERSION auf den realen Releasezustand synchronisieren.
- [ ] Version erst nach vollständiger Abnahme auf `0.3.0` setzen.
- [ ] Workflow-Hygiene inklusive GitHub-Actions-Node-Laufzeit prüfen.
- [ ] Release-PR nur bei grünem Quality Gate mergen.

## Danach

### 0.4.0 – Diagnose Foundation PRO

- [ ] Logging nach Bereichen und Stufen filterbar machen.
- [ ] Zeitmessung und Laufzeitkontext ergänzen.
- [ ] kontrollierten Fehlerkontext strukturieren.
- [ ] datensparsamen Diagnosebericht exportierbar machen.
- [ ] Export vor Speicherung auf sensible oder unnötige Daten begrenzen.

## Später

- [ ] Erst bei realem Bedarf UI-Slots für echte Fachmodule definieren.
- [ ] Modulzustände optional lokal speichern.
- [ ] Berechtigungsmodell erst mit einem echten privilegierten Modul entwerfen.
- [ ] Keine Remote-Plugin-Installation ohne eigenes Sicherheitskonzept einführen.
