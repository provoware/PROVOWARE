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
- [x] `AGENTS.md` auf kleine, reproduzierbare und begründete Patches ausrichten.
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
- [x] 0.2.0 über PR #62 mergen und `main` stichprobenartig nachprüfen.

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
- [ ] Entscheidung treffen, wie alle ausgeblendeten Panels sicher wieder sichtbar gemacht werden.
- [ ] Planungs-PR erfolgreich durch Quality Gate bringen und mergen.

#### 0.3.0-B – State Foundation & Autosave/Reset

- [ ] Workspace-Vertrag als kleine validierbare Laufzeitbasis implementieren.
- [ ] Standardzustand und gespeicherten Zustand deterministisch normalisieren.
- [ ] Automatische lokale Speicherung nach abgeschlossenen Änderungen implementieren.
- [ ] `Standardlayout wiederherstellen` isoliert und sicher implementieren.
- [ ] beschädigte oder gesperrte Browser-Speicherung robust behandeln.
- [ ] automatische Tests für Zustand, Validierung und Reset ergänzen.

#### 0.3.0-C – Visibility Controls

- [ ] Panels zentral ein-/ausblendbar machen.
- [ ] Wiederherstellung außerhalb der veränderbaren Panels bereitstellen.
- [ ] Tastaturbedienung und Fokusführung sicherstellen.

#### 0.3.0-D – Resize

- [ ] Panelbreiten in 12 Rastereinheiten veränderbar machen.
- [ ] Panelhöhen innerhalb sicherer Grenzen veränderbar machen.
- [ ] Desktopwerte bei Tablet-/Mobil-Fallback erhalten.
- [ ] Maus-, Touch- und Tastaturbedienung absichern.

#### 0.3.0-E – Reorder & Drag and Drop

- [ ] Panels erst jetzt verschiebbar machen.
- [ ] Ziehen nur über dedizierten Griff erlauben.
- [ ] Nur Reihenfolge, keine freien Pixelkoordinaten speichern.
- [ ] Drag-Abbruch ohne Zustandsverlust ermöglichen.
- [ ] vollständige Tastaturalternative anbieten.

#### 0.3.0-F – Responsive & Accessibility Hardening

- [ ] Desktop-, Tablet- und Mobilregeln vollständig prüfen.
- [ ] Fokus, Live-Status und `prefers-reduced-motion` absichern.
- [ ] Touch-Ziele und Tastaturnavigation prüfen.

#### 0.3.0-G – Release Gate

- [ ] `npm run verify` um Workspace-Vertrags- und Zustandsprüfungen erweitern.
- [ ] manuelle Firefox-Abnahme durchführen.
- [ ] Chrome-Kompatibilität stichprobenartig prüfen.
- [ ] README, CHANGELOG, MANIFEST und VERSION erst nach realer Implementierung synchronisieren.
- [ ] Version erst nach vollständiger Abnahme auf `0.3.0` setzen.
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
