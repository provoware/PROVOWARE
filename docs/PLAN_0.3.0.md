# Entwicklungsplan 0.3.0 – Flexible Workspace Engine

## Ziel in einfacher Sprache

Die bisher feste Arbeitsfläche von **PROVOWARE ALL-IN 2026** soll schrittweise zu einer flexiblen Arbeitsfläche werden. Panels sollen später verschoben, ein- und ausgeblendet sowie in ihrer Größe verändert werden können. Die gewählte Anordnung wird automatisch nur im lokalen Browser gespeichert und kann jederzeit vollständig auf das Standardlayout zurückgesetzt werden.

Wichtig: In der ersten Teilstufe wird **noch kein Drag & Drop programmiert**. Zuerst wird der Workspace-Vertrag festgelegt und geprüft. Dadurch werden spätere Sonderfälle bei Position, Größe, Sichtbarkeit und Speicherung vermieden.

## Begriffe vorab

- **Workspace (Arbeitsfläche):** der Bereich, in dem die einzelnen Panels angeordnet werden.
- **Panel:** eine einzelne Arbeitskarte wie `Übersicht`, `Module` oder `Systemstatus`.
- **Workspace-Vertrag (Contract):** feste Regeln, welche Eigenschaften ein Panel besitzen darf und wie Layoutzustände gespeichert werden.
- **Schema:** festgelegte Datenstruktur für gespeicherte Einstellungen.
- **Validierung:** automatische Prüfung, ob gespeicherte oder neue Daten den Regeln entsprechen.
- **Fallback (Rückfallregel):** sichere Standardlösung, wenn gespeicherte Daten fehlen oder ungültig sind.
- **Responsive:** die Oberfläche passt sich an unterschiedliche Fenster- und Bildschirmgrößen an.
- **Grid (Raster):** unsichtbares Spaltenraster, auf dem Panelbreiten ausgerichtet werden.
- **Clamp (Begrenzung):** ein Wert wird automatisch innerhalb erlaubter Mindest- und Höchstgrenzen gehalten.
- **Debounce (Verzögerte Sammelspeicherung):** viele schnelle Änderungen werden gebündelt statt bei jeder Mausbewegung sofort gespeichert.
- **Quality Gate (Qualitätsschranke):** automatische Prüfung, die fehlerhafte Änderungen vor dem Merge stoppt.
- **Rollback (Rückweg):** dokumentierte Möglichkeit, eine Änderung vollständig zurückzunehmen.

## Ausgangsstand

- Produkt: `PROVOWARE ALL-IN 2026`
- aktuelle freigegebene Version: `0.2.0 – Module Contract & Registry`
- Baseline-Commit für 0.3.0: `0a2240f89fa11dd0759af0b4cfa96c79e35714b4`
- vorhandenes Layout: 12-Spalten-CSS-Grid mit fünf Kernpanels
- vorhandene Breakpoints: Desktop, Tablet und Mobil
- bestehendes Debugging/Logging bleibt getrennt vom Workspace
- Modulvertrag Version `1` bleibt unverändert
- Entscheidung des Projekts: Layoutänderungen werden automatisch lokal gespeichert und können über `Standardlayout wiederherstellen` vollständig zurückgesetzt werden

## Änderungsgrenze für 0.3.0

### Enthalten

- stabiler Workspace-Vertrag
- validierbarer Layoutzustand
- lokale automatische Speicherung
- vollständiger Reset auf Standardlayout
- Panels ein-/ausblendbar
- Panels größenveränderbar
- Panels neu anordenbar
- Tastaturbedienung für alle wesentlichen Layoutaktionen
- responsive Rückfallregeln
- automatisierte Prüfungen und reproduzierbare Tests

### Nicht enthalten

- keine fachlichen Toolmodule
- keine Remote-Plugins
- keine Cloud-Synchronisation
- keine serverseitige Speicherung
- keine freie Pixelpositionierung außerhalb des Rasters
- keine Speicherung von Debug- oder Modulinhalten im Workspace-Zustand
- keine automatische Änderung von Fachinhalten
- keine Veränderung des Modulvertrags ohne eigenen begründeten Patch

---

# Nummerierte Schrittfolge und Checklisten

## 1. Baseline und Grenzen sichern

- [x] aktuellen `main`-Commit als Baseline festhalten
- [x] eigenen Feature-Branch für den Workspace-Vertrag anlegen
- [x] aktuelle HTML-Struktur und vorhandenes 12-Spalten-Raster prüfen
- [x] Debugbereich ausdrücklich aus dem Workspace-Vertrag ausschließen
- [x] automatische lokale Speicherung plus vollständigen Reset als feste Produktentscheidung dokumentieren
- [ ] vor jedem späteren Teilpatch prüfen, ob `main` neue relevante Änderungen enthält

**Abnahmekriterium:** Jede Änderung von 0.3.0 muss nachweisbar der flexiblen Arbeitsfläche, ihrer Absicherung oder ihrer Dokumentation dienen.

## 2. Workspace-Vertrag festlegen – aktuelle Teilstufe 0.3.0-A

- [x] stabile Panel-IDs definieren
- [x] unveränderliche Panel-Metadaten von veränderlichem Nutzerzustand trennen
- [x] Reihenfolge als eigene geordnete Liste definieren
- [x] Sichtbarkeit pro Panel definieren
- [x] Breite in Rastereinheiten statt freien Pixelkoordinaten definieren
- [x] optionale Höhe mit Mindest- und Höchstgrenzen definieren
- [x] erlaubten Arbeitsbereich pro Panel festlegen
- [x] responsive Regeln festlegen
- [x] Speicherformat versionieren
- [x] Reset- und Fehlerverhalten festlegen
- [x] unbekannte, fehlende oder beschädigte Layoutdaten eindeutig behandeln
- [x] Zustände festlegen, die ausdrücklich **nicht** gespeichert werden

**Abnahmekriterium:** Ein Entwickler kann allein anhand von `docs/WORKSPACE_CONTRACT.md` die spätere Engine implementieren, ohne neue Grundentscheidungen zu Position, Größe, Sichtbarkeit, Speicherung oder Reset treffen zu müssen.

## 3. Vertrag als kleine Laufzeitbasis implementieren – Teilstufe 0.3.0-B

Noch nicht umgesetzt.

- [ ] eine kleine Workspace-Laufzeitdatei anlegen
- [ ] Standarddefinition der fünf Kernpanels im Code abbilden
- [ ] Vertragsversion `1` festlegen
- [ ] gespeicherten Zustand strikt validieren
- [ ] fehlende Panels mit Standardwerten ergänzen
- [ ] unbekannte Panel-IDs ignorieren und protokollieren
- [ ] ungültige Werte auf sichere Grenzen zurücksetzen
- [ ] öffentliche Nur-Lese-Statusabfrage bereitstellen
- [ ] Workspace-Fehler an das vorhandene dreistufige Logging anbinden

**Abnahmekriterium:** Die Anwendung kann Standardlayout und gespeicherten Layoutzustand laden, validieren und als bereinigten Zustand ausgeben, ohne bereits Drag & Drop zu verwenden.

## 4. Automatische lokale Speicherung und Reset – Teilstufe 0.3.0-B

Noch nicht umgesetzt.

- [ ] versionierten `localStorage`-Schlüssel verwenden
- [ ] nur den notwendigen Layoutzustand speichern
- [ ] Speicherung nach abgeschlossenen Benutzeraktionen ausführen
- [ ] bei schnellen Größenänderungen Schreibvorgänge bündeln
- [ ] Speichern darf die Oberfläche bei Browserfehlern oder gesperrtem Speicher niemals blockieren
- [ ] `Standardlayout wiederherstellen` löscht ausschließlich den Workspace-Schlüssel
- [ ] Reset stellt Standardreihenfolge, Standardsichtbarkeit und Standardgrößen ohne Neuinstallation wieder her
- [ ] nach Reset den gültigen Zustand sofort neu anwenden

**Abnahmekriterium:** Layoutänderungen bleiben nach Neuladen erhalten; ein Reset stellt reproduzierbar exakt den definierten Standard wieder her.

## 5. Panel-Sichtbarkeit – Teilstufe 0.3.0-C

Noch nicht umgesetzt.

- [ ] Panels über einen zentralen Layoutbereich ein-/ausblendbar machen
- [ ] ausgeblendete Panels bleiben im Vertrag registriert
- [ ] ausgeblendete Panels behalten ihre gespeicherte Größe und Position
- [ ] Wiederanzeigen setzt das Panel an seine gespeicherte Position zurück
- [ ] Bedienung vollständig per Tastatur ermöglichen
- [ ] eine sichere Wiederherstellungsmöglichkeit außerhalb der veränderbaren Panels vorsehen

**Abnahmekriterium:** Kein Nutzer kann sich durch Ausblenden dauerhaft aus der Arbeitsfläche aussperren.

## 6. Größenänderung – Teilstufe 0.3.0-D

Noch nicht umgesetzt.

- [ ] Breite nur in erlaubten Rastereinheiten verändern
- [ ] Mindestbreite und Höchstbreite erzwingen
- [ ] Höhe nur innerhalb definierter Pixelgrenzen verändern
- [ ] Größenänderung über Maus/Zeiger und Tastatur anbieten
- [ ] gespeicherte Desktopgröße auf kleinen Viewports nur temporär begrenzen, nicht überschreiben
- [ ] Mobilansicht verwendet sichere Vollbreite und inhaltsgerechte Höhe
- [ ] keine negativen, `NaN`- oder extremen Größenwerte akzeptieren

**Abnahmekriterium:** Kein Panel kann außerhalb sinnvoller Layoutgrenzen verkleinert oder vergrößert werden.

## 7. Neuordnung und Drag & Drop – Teilstufe 0.3.0-E

Erst nach erfolgreichem Abschluss der Schritte 2 bis 6 programmieren.

- [ ] Bewegung nur über einen klaren Panel-Griff starten
- [ ] Klicks und Interaktionen innerhalb eines Panels dürfen kein Ziehen auslösen
- [ ] Zielposition ausschließlich aus der geordneten Panelliste ableiten
- [ ] keine freien `x/y`-Pixelpositionen speichern
- [ ] visuelle Zielmarkierung während des Verschiebens anzeigen
- [ ] nach Loslassen genau eine stabile neue Reihenfolge speichern
- [ ] Neuordnung alternativ vollständig per Tastatur ermöglichen
- [ ] Drag-Abbruch stellt den vorherigen Zustand wieder her

**Abnahmekriterium:** Nach identischer Panelreihenfolge entsteht bei jedem Laden dasselbe Layout.

## 8. Responsive Rückfallregeln – Teilstufe 0.3.0-F

Noch nicht umgesetzt.

- [ ] Desktop ab `981 px`: gespeicherte Rasterbreite anwenden
- [ ] Tablet `681–980 px`: Breiten auf sichere 6- oder 12-Spalten-Darstellung begrenzen
- [ ] Mobil bis `680 px`: sichtbare Panels immer auf volle Breite setzen
- [ ] gespeicherte Desktopbreite bei Tablet/Mobil nicht überschreiben
- [ ] gespeicherte Reihenfolge auf allen Größen beibehalten
- [ ] Höhe auf Mobilgeräten primär vom Inhalt bestimmen lassen
- [ ] Fenstergrößenwechsel darf keine gespeicherten Desktopwerte zerstören

**Abnahmekriterium:** Ein auf Desktop angepasstes Layout bleibt nach zwischenzeitlicher Mobilnutzung unverändert erhalten.

## 9. Barrierefreiheit und Fehlervermeidung – Teilstufe 0.3.0-F

Noch nicht umgesetzt.

- [ ] jede Mausaktion besitzt eine Tastaturalternative
- [ ] Fokus bleibt nach Verschieben, Größenänderung und Ausblenden nachvollziehbar
- [ ] Statusänderungen kurz über eine Live-Region ankündigen
- [ ] `prefers-reduced-motion` respektieren
- [ ] Touch-Bedienung berücksichtigen
- [ ] Drag- und Resize-Griffe ausreichend groß gestalten
- [ ] versteckte Panels aus der Tastaturreihenfolge entfernen
- [ ] Reset klar benennen und nicht mit Datenlöschung anderer Bereiche vermischen

**Abnahmekriterium:** Die flexible Arbeitsfläche bleibt ohne Maus vollständig bedienbar.

## 10. Automatisierte Prüfungen erweitern – Teilstufe 0.3.0-G

Noch nicht umgesetzt.

- [ ] Workspace-Vertrag automatisch gegen ungültige Panel-IDs prüfen
- [ ] doppelte Panel-IDs verhindern
- [ ] Standardreihenfolge auf Vollständigkeit und Eindeutigkeit prüfen
- [ ] Mindest-/Höchstgrößen logisch prüfen
- [ ] gespeicherten Beispielzustand gegen Schema testen
- [ ] beschädigte Speicherung testen
- [ ] unbekannte alte Panels testen
- [ ] fehlende neue Panels testen
- [ ] Reset testen
- [ ] responsive Berechnung als reine Funktionen testen, wo möglich
- [ ] vorhandenes `npm run verify` als einzigen kanonischen Prüfaufruf beibehalten

**Abnahmekriterium:** Typische Workspace-Datenfehler werden automatisch erkannt, bevor der Pull Request gemergt werden kann.

## 11. Dokumentation und Status synchronisieren

- [x] detaillierten 0.3.0-Plan anlegen
- [x] separaten Workspace-Vertrag anlegen
- [ ] README nach tatsächlicher Implementierung ergänzen
- [ ] TODO nach jeder abgeschlossenen Teilstufe aktualisieren
- [ ] CHANGELOG nur mit real implementierten Funktionen ergänzen
- [ ] MANIFEST erst bei neuen Laufzeitdateien erweitern
- [ ] VERSION erst auf `0.3.0` erhöhen, wenn die funktionsfähige Workspace Engine geprüft ist

**Abnahmekriterium:** Planungsstand und Releaseversion werden nicht miteinander verwechselt. Während der Vertragsphase bleibt die reale Produktversion `0.2.0`.

## 12. Abschlussprüfung und Release

Noch nicht umgesetzt.

- [ ] vollständigen Branch-Diff gegen aktuellen `main` prüfen
- [ ] nur begründete Dateien akzeptieren
- [ ] alle automatischen Quality Gates grün
- [ ] manuelle Firefox-Prüfung durchführen
- [ ] Chrome-Kompatibilität stichprobenartig prüfen
- [ ] Reset aus verändertem Layout testen
- [ ] Mobil-/Tablet-Fallback testen
- [ ] PR mit Risiken, Prüfungen und Rückweg dokumentieren
- [ ] erst danach `0.3.0` mergen
- [ ] `main` nach Merge stichprobenartig nachprüfen

**Rollback:** Die gesamte 0.3.0-Engine muss über ihren Release-PR zurücknehmbar bleiben. Gespeicherte Layoutdaten sind lokal, versionsgebunden und dürfen keine anderen Tooldaten verändern.

---

# Status der Iteration

## Erledigt

- Baseline festgelegt
- Option A bestätigt: automatische lokale Speicherung plus vollständiger Reset
- HTML- und Grid-Ausgangsstruktur geprüft
- Workspace-Vertrag fachlich definiert
- 0.3.0 in reproduzierbare Teilstufen zerlegt

## In Arbeit

- Vertragsprüfung und Freigabe der letzten offenen Bedienentscheidung vor Laufzeitcode

## Blockiert

- nichts technisch blockiert
- vor der Sichtbarkeitsimplementierung ist nur noch festzulegen, wie ein vollständig leer ausgeblendeter Workspace sicher wiederhergestellt wird

## Nächste zwei Schritte

1. **0.3.0-B – State Foundation:** Workspace-Vertrag als kleine validierbare Laufzeitbasis plus Autosave/Reset implementieren, weiterhin ohne Drag & Drop.
2. **0.3.0-C – Visibility Controls:** zentrale Panel-Sichtbarkeit und sichere Wiederherstellung umsetzen.

## Empfehlung

Zuerst 0.3.0-B vollständig mit Tests abschließen. Drag & Drop bleibt bewusst bis 0.3.0-E gesperrt. Dadurch sind Datenmodell, Speicherung, Reset und Größenregeln bereits stabil, bevor Zeigerbewegungen den Zustand verändern können.
