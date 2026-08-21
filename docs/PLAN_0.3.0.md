# Entwicklungsplan 0.3.0 – Flexible Workspace Engine

## Ziel in einfacher Sprache

Die bisher feste Arbeitsfläche von **PROVOWARE ALL-IN 2026** wird schrittweise flexibel. Panels sollen später ein- und ausgeblendet, in der Größe verändert und neu angeordnet werden können. Layoutänderungen werden automatisch nur im lokalen Browser gespeichert und können jederzeit vollständig auf das Standardlayout zurückgesetzt werden.

Die Entwicklung bleibt bewusst in kleine Teilstufen getrennt. Jede Teilstufe muss für sich prüfbar und rückgängig zu machen sein.

## Begriffe vorab

- **Workspace (Arbeitsfläche):** Bereich mit den veränderbaren Panels.
- **Panel:** einzelne Arbeitskarte wie `Übersicht` oder `Systemstatus`.
- **Vertrag (Contract):** feste Regeln für Daten und erlaubte Zustände.
- **Zustand (State):** aktuell gültige Layoutdaten.
- **Persistenz:** dauerhaftes lokales Speichern.
- **Normalisierung:** fehlerhafte oder fehlende Werte werden kontrolliert auf sichere Werte gebracht.
- **Responsive:** Darstellung passt sich an Bildschirm- und Fenstergröße an.
- **Quality Gate (Qualitätsschranke):** automatische Prüfung vor dem Merge.
- **Rollback (Rückweg):** komplette Änderung kann gezielt zurückgenommen werden.

## 1. Ausgangsstand und feste Grenzen

- Produkt: `PROVOWARE ALL-IN 2026`
- freigegebene Produktversion: `0.2.0`
- Modulvertragsversion: `1`
- Workspace-Vertragsversion: `1`
- aktuelles Layout: 12-Spalten-Raster
- fünf Kernpanels: `overview`, `modules`, `work`, `details`, `system-status`
- Debugging & Logging bleibt außerhalb des Workspace
- keine Cloud-Synchronisation
- keine Remote-Plugins
- keine freie Pixelpositionierung
- keine neue Laufzeitbibliothek ohne nachgewiesenen Bedarf

**Abnahmeregel:** Jede Änderung von 0.3.0 muss direkt der flexiblen Arbeitsfläche, ihrer Sicherheit, Bedienbarkeit, Prüfung oder Dokumentation dienen.

## 2. Verbindliche Architekturregeln

### 2.1 Wartbarkeit

- [x] kleine Funktionen mit klarer Aufgabe als Standard
- [x] doppelte Logik vermeiden
- [x] wiederverwendbare Regeln zentral halten
- [x] Kommentare nur für Gründe und ungewöhnliche Entscheidungen verwenden
- [x] bestehende öffentliche Schnittstellen nicht aus reinem Stilgrund umbauen

### 2.2 Trennung der Verantwortungen

- [x] feste Daten und Verträge getrennt von veränderlichem Zustand behandeln
- [x] reine Validierung/Normalisierung von Browser-Speicherung und DOM trennen
- [x] Logging darf keine Geschäftslogik steuern
- [x] Browser-Speicherfehler dürfen die Oberfläche nicht blockieren
- [x] pro Subsystem genau eine verbindliche Zustandsquelle verwenden

### 2.3 Benennung

- [x] sichtbare UI-Texte und Projektdokumentation verständlich auf Deutsch
- [x] neue Workspace-Funktionen konsistent deutsch benennen
- [x] stabile technische IDs nicht aus sichtbaren Überschriften ableiten

### 2.4 Nutzerfeedback

Spätere sichtbare Aktionen folgen möglichst dem Muster:

`Aktion -> Ergebnis -> nächster sinnvoller Schritt`

Fehlertexte sollen kurz erklären:

1. was passiert ist
2. welcher Bereich betroffen ist
3. welche sichere Reaktion bereits erfolgt ist

## 3. Teilstufe 0.3.0-A – Workspace-Vertrag

**Status: 🟢 abgeschlossen**

- [x] stabile Panel-IDs festlegen
- [x] Standardreihenfolge festlegen
- [x] Sichtbarkeit, Breite und Höhe definieren
- [x] 12-Spalten-Raster als Positionsmodell festlegen
- [x] keine freien x/y-Pixelkoordinaten speichern
- [x] Speicherformat versionieren
- [x] responsive Rückfallregeln definieren
- [x] Reset-Vertrag definieren
- [x] unbekannte, fehlende und beschädigte Daten behandeln
- [x] persistente und temporäre Zustände trennen
- [x] Planungs-PR #64 erfolgreich prüfen und mergen

Planungs-Merge: `3998373876f087f90ddbf248c316986b85c20fe9`

## 4. Teilstufe 0.3.0-B – State Foundation & Autosave/Reset

**Status: 🟡 implementiert, Abschlussvalidierung läuft**

Detaillierter Teilplan: `docs/PLAN_0.3.0_B.md`

### 4.1 Zustandsbasis

- [x] eigene kleine Workspace-Laufzeitdatei anlegen
- [x] fünf Paneldefinitionen zentral abbilden
- [x] reproduzierbaren Standardzustand erzeugen
- [x] öffentliche Nur-Lese-Statusabfrage bereitstellen

### 4.2 Validierung und Normalisierung

- [x] Schema-Version prüfen
- [x] Workspace-ID prüfen
- [x] unbekannte Panel-IDs entfernen
- [x] doppelte Panel-IDs entfernen
- [x] fehlende Panels ergänzen
- [x] Sichtbarkeit validieren
- [x] Breiten auf Panelgrenzen begrenzen
- [x] Höhen auf Panelgrenzen begrenzen
- [x] Eingabedaten nicht direkt verändern

### 4.3 Lokale Speicherung

- [x] Schlüssel `provoware.allin.workspace.main.v1` verwenden
- [x] Speichern über eine zentrale Funktion führen
- [x] Zustand vor dem Speichern normalisieren
- [x] beschädigtes JSON sicher auf Standard zurückführen
- [x] gesperrten Browser-Speicher kontrolliert behandeln
- [x] keine Netzwerkübertragung

### 4.4 Reset

- [x] nur Workspace-Schlüssel entfernen
- [x] In-Memory-Zustand auf Standard setzen
- [x] Debug-Einstellungen nicht verändern
- [x] andere Browserdaten nicht verändern
- [x] Reset verständlich loggen

### 4.5 Automatische Tests

- [x] Standardzustand
- [x] unbekannte und doppelte IDs
- [x] fehlende Panels
- [x] Größenbegrenzung
- [x] falsche Schema-Version
- [x] beschädigtes JSON
- [x] Speichern und Wiederladen
- [x] gesperrter Speicher
- [x] isolierter Reset

### 4.6 Abschlusskriterien

- [ ] vollständiger Diff gegen aktuellen `main`
- [ ] Branch 0 Commits hinter `main`
- [ ] `npm run verify` erfolgreich
- [ ] PR mergebar
- [ ] 0.3.0-B mergen
- [ ] zentrale Dateien auf `main` stichprobenartig erneut lesen

## 5. Teilstufe 0.3.0-C – Visibility Controls + Schnellstarterleiste

**Status: ⚪ geplant**

### 5.1 Feste kompakte Menüleiste

Direkt unter dem festen oberen Bereich wird eine kompakte Schnellstarter-/Menüleiste angelegt.

Sie bleibt außerhalb des veränderbaren Workspace und enthält nur Funktionen mit klarem Nutzen.

- [ ] kompakte feste Leiste anlegen
- [ ] responsive Darstellung definieren
- [ ] Tastaturfokus sauber führen
- [ ] keine zweite parallele Navigation erzeugen

### 5.2 Permanenter Layout-Schalter

Bestätigte Option A:

Alle Panels dürfen ausgeblendet werden. Ein permanenter `Layout`-Schalter bleibt trotzdem jederzeit erreichbar.

- [ ] `Layout`-Schalter in der festen Leiste integrieren
- [ ] Panel-Liste öffnen/schließen
- [ ] jedes Panel einzeln ein-/ausblendbar machen
- [ ] `Alle anzeigen` anbieten
- [ ] `Standardlayout wiederherstellen` anbieten
- [ ] keine Möglichkeit schaffen, den Layout-Schalter selbst auszublenden

### 5.3 Zustand und Nutzerfeedback

- [ ] Sichtbarkeitsänderung über die zentrale Workspace-API führen
- [ ] nach abgeschlossener Änderung automatisch speichern
- [ ] ausgeblendete Panels behalten Reihenfolge und Größe
- [ ] Wiederanzeigen nutzt gespeicherten Zustand
- [ ] Aktion kurz und verständlich bestätigen

**Abnahmekriterium:** Auch bei vollständig ausgeblendeter Arbeitsfläche kann der Nutzer jedes Panel ohne Konsole oder Neuinstallation wiederherstellen.

## 6. Teilstufe 0.3.0-D – Resize

**Status: ⚪ geplant**

- [ ] Breite nur in ganzen Rastereinheiten ändern
- [ ] Mindest- und Höchstbreite erzwingen
- [ ] Höhe nur in gültigen Grenzen ändern
- [ ] Vorschauzustand nicht persistent speichern
- [ ] erst validierten Endwert speichern
- [ ] Maus unterstützen
- [ ] Touch unterstützen
- [ ] Tastaturalternative anbieten
- [ ] Desktopwerte auf Tablet/Mobil nur temporär begrenzen

**Abnahmekriterium:** Kein Panel kann einen ungültigen oder unbrauchbaren Größenwert speichern.

## 7. Teilstufe 0.3.0-E – Reorder & Drag and Drop

**Status: ⚪ geplant**

Erst nach A bis D.

- [ ] Ziehen nur über dedizierten Griff starten
- [ ] Buttons/Formulare dürfen kein Drag auslösen
- [ ] nur Reihenfolge speichern
- [ ] keine freien Zeigerkoordinaten speichern
- [ ] Zielposition klar anzeigen
- [ ] Drag-Abbruch ohne Zustandsverlust
- [ ] Tastaturalternative vollständig anbieten
- [ ] nach Abschluss einmal speichern

**Abnahmekriterium:** Gleiche gespeicherte Reihenfolge erzeugt reproduzierbar dasselbe Layout.

## 8. Teilstufe 0.3.0-F – Responsive & Accessibility Hardening

**Status: ⚪ geplant**

### Responsive

- [ ] Desktop ab 981 px: gespeicherte Rasterbreite anwenden
- [ ] Tablet 681–980 px: sichere 6-/12-Spalten-Darstellung
- [ ] Mobil bis 680 px: sichtbare Panels Vollbreite
- [ ] Desktopwerte nicht durch kleinere Viewports überschreiben
- [ ] gespeicherte Reihenfolge beibehalten

### Bedienbarkeit

- [ ] vollständige Tastaturnavigation
- [ ] klare Fokusführung
- [ ] Live-Status für Layoutaktionen
- [ ] `prefers-reduced-motion` beachten
- [ ] ausreichende Touch-Ziele
- [ ] versteckte Panels aus Fokusreihenfolge entfernen

## 9. Teilstufe 0.3.0-G – Release Gate

**Status: ⚪ geplant**

### Automatisch

- [ ] `npm run verify` vollständig grün
- [ ] Workspace-Vertrags- und Zustandstests grün
- [ ] keine unbeabsichtigten externen Laufzeitverweise
- [ ] Versionen und Manifeste konsistent

### Manuell

- [ ] Firefox: kompletter Workspace-Ablauf
- [ ] Chrome: Kompatibilitätsstichprobe
- [ ] Desktop, Tablet, Mobil
- [ ] Alle Panels ausblenden und wiederherstellen
- [ ] Resize testen
- [ ] Reorder/Drag testen
- [ ] Tastaturablauf testen
- [ ] Reset aus verändertem Layout testen

### Dokumentation

- [ ] README auf finalen Funktionsstand bringen
- [ ] TODO abschließen
- [ ] CHANGELOG finalisieren
- [ ] MANIFEST finalisieren
- [ ] VERSION erst jetzt auf `0.3.0` erhöhen

### Merge

- [ ] vollständiger Diff geprüft
- [ ] Branch aktuell
- [ ] keine ungeklärten Release-TODOs
- [ ] Rückweg dokumentiert
- [ ] Release-PR mergen
- [ ] `main` stichprobenartig nachprüfen

## 10. Änderungsvolumen nach Teilstufe

| Teilstufe | erwartetes Volumen | Hauptbetroffene Bereiche |
| --- | --- | --- |
| A | klein, Dokumentation | Vertrag, Planung |
| B | mittel | Zustand, lokaler Speicher, Tests |
| C | mittel | UI-Leiste, Sichtbarkeit, Fokus |
| D | mittel | Größenlogik, Eingabegeräte |
| E | mittel bis groß | Neuordnung, Drag, Tastatur |
| F | mittel | Responsive, Barrierefreiheit |
| G | klein bis mittel | Releaseprüfung, Dokumentation |

Große Misch-Patches sind zu vermeiden. Wenn eine Teilstufe deutlich größer wird, wird sie vor der Implementierung weiter aufgeteilt.

## 11. Wer ist betroffen?

### Normale Nutzer

Ab 0.3.0-C sichtbar betroffen. 0.3.0-B verändert nur die interne Zustandsgrundlage.

### Lokale Daten

Nur Layoutdaten im versionsgebundenen Workspace-Schlüssel.

### Fachmodule

Nicht betroffen, solange keine eigene Integrationsstufe beschlossen wird.

### Netzwerk

Nicht betroffen.

### Entwickler

Betroffen durch neue Workspace-API, Tests, Dokumentation und strengere Wartbarkeitsregeln.

## 12. Rückweg

Jede Teilstufe erhält einen eigenen PR. Dadurch kann eine problematische Stufe einzeln zurückgenommen werden.

Workspace-Reset darf niemals `localStorage.clear()` verwenden.

## 13. Nächste zwei Schritte

### Nächster Schritt

**0.3.0-C – Visibility Controls + kompakte Schnellstarter-/Menüleiste**

Nach Abschluss von 0.3.0-B wird zuerst die sichere Sichtbarkeit umgesetzt: feste Leiste, permanenter `Layout`-Schalter, Panel-Liste, `Alle anzeigen`, Reset, Fokusführung und verständliches Nutzerfeedback.

### Danach

**0.3.0-D – Resize**

Erst danach werden Panelbreite und -höhe veränderbar. Drag & Drop bleibt weiterhin bis 0.3.0-E gesperrt.

## Empfehlung

Die Reihenfolge `State -> Sichtbarkeit -> Größe -> Neuordnung` beibehalten. Sie reduziert Fehler, hält Patches klein und macht jede Mechanik unabhängig testbar.
