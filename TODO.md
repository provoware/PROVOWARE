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

- [ ] Panels verschiebbar machen.
- [ ] Panels ein-/ausblendbar machen.
- [ ] Panelgrößen veränderbar machen.
- [ ] Layoutzustand lokal und rücksetzbar speichern.
- [ ] Tastaturbedienung und responsive Rückfallregeln von Anfang an berücksichtigen.

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
