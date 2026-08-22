# Entwicklungsplan 0.3.0-D – Resize

## Ziel in einfacher Sprache

Diese Teilstufe macht die fünf Workspace-Panels kontrolliert in der Größe veränderbar.

Der Nutzer erhält an jedem sichtbaren Panel einen klaren Resize-Griff. Derselbe Griff funktioniert mit Maus, Touch/Stift und Tastatur. Die Breite bleibt an das bestehende 12-Spalten-Raster gebunden; die Höhe verändert sich in festen 24-px-Schritten.

Wichtig: Während einer Bewegung wird nur eine Vorschau gezeigt. Erst der geprüfte Endwert wird gespeichert.

## Begriffe vorab

- **Resize:** Größe eines Panels ändern.
- **Resize-Griff:** fokussierbare Bedienfläche am Panelrand.
- **Pointer Events:** gemeinsame Browser-Ereignisse für Maus, Touch und Stift.
- **Rastereinheit:** eine von zwölf Spalten der Desktop-Arbeitsfläche.
- **Vorschauzustand:** temporäre Größe während der Bedienung; noch nicht gespeichert.
- **Commit/Übernahme:** geprüften Endwert einmal dauerhaft in den Workspace-Zustand schreiben.
- **Quality Gate (Qualitätsschranke):** automatische Prüfung vor dem Merge.
- **Regression:** eine neue Änderung beschädigt bereits funktionierendes Verhalten.

---

# 1. Baseline

- Produkt: `PROVOWARE ALL-IN 2026`
- freigegebene Produktversion: `0.2.0`
- Entwicklungsstufe: `0.3.0-D – Resize`
- Planungsbaseline: `e167226b7f2e1d80c2d16de9964a3a13d1efbfca`
- Workspace-Vertrag: Version `1`
- Resize-Vertrag: `docs/RESIZE_CONTRACT_0.3.0.md`
- bestehende Sichtbarkeitsstufe: `0.3.0-C` abgeschlossen
- Persistenzschlüssel bleibt `provoware.allin.workspace.main.v1`
- keine neue externe Laufzeitbibliothek

---

# 2. Bestätigte Produktentscheidung

## Option A – eine Bedienmechanik

- [x] ein klarer Resize-Griff pro sichtbarem Panel
- [x] Maus/Touch/Stift über gemeinsame Pointer-Events
- [x] derselbe Griff per Tastatur bedienbar
- [x] Breite rastet in ganzen 12er-Rastereinheiten
- [x] Höhe rastet in 24-px-Schritten
- [x] keine zweite vollständige Größensteuerung im Layout-Menü
- [x] keine Speicherung während jeder Pointerbewegung
- [x] Drag & Drop bleibt bis 0.3.0-E gesperrt

---

# 3. Änderungsgrenze

## Enthalten

- Resize-Vertrag und Testmatrix
- zentrale Größenmethoden in Workspace-State
- sichtbare Anwendung persistenter Breite/Höhe
- ein Resize-Griff pro Panel
- Pointer-Controller für Maus, Touch und Stift
- Tastaturmodell über denselben Griff
- transiente Vorschau
- Commit und Abbruch
- einzelne Panelgröße auf Standard zurücksetzen
- verständliches Nutzerfeedback
- Logging ohne Bewegungs-Spam
- automatische Tests
- Quality-Gate-Erweiterung
- Dokumentation und Manifest

## Nicht enthalten

- kein Reorder
- kein Drag & Drop
- keine neuen Fachmodule
- keine Cloud-/Netzwerkfunktion
- keine neuen Persistenzfelder
- keine Änderung der Workspace-Vertragsversion
- keine parallele Größenverwaltung im Layout-Menü
- keine freie Pixelbreite

---

# 4. Architektur

## 4.1 Daten und Persistenz

`assets/workspace-state.js` bleibt die einzige persistente Zustandsquelle.

Vorgesehene kleine API-Erweiterung:

```text
panelGroesseSetzen(id, { widthUnits, heightPx })
panelGroesseZuruecksetzen(id)
```

Regeln:

- nur Größenwerte ändern
- Panel-ID prüfen
- bestehende Normalisierung wiederverwenden
- Sichtbarkeit und Reihenfolge erhalten
- genau den validierten Endzustand speichern

## 4.2 DOM-Anwendung

`assets/workspace-ui.js` bleibt für die Darstellung des **gültigen Workspace-Zustands** verantwortlich.

Erweiterung:

- gespeicherte `widthUnits` anwenden
- gespeicherte `heightPx` anwenden
- `null` wieder als automatische Höhe behandeln
- keine Größenberechnung aus Pointerbewegungen übernehmen

## 4.3 Eingabesteuerung

Neue Datei:

`assets/workspace-resize.js`

Aufgabe ausschließlich:

- Resize-Griffe finden
- Pointer-/Tastaturereignisse verarbeiten
- Vorschau berechnen
- Vorschau anwenden
- finalen Commit an Workspace-State senden
- Abbruch durchführen
- Nutzerfeedback/Logging an bestehende Infrastruktur weiterreichen

Keine direkte `localStorage`-Nutzung.

## 4.4 CSS

Eine zentrale Style-Regel soll persistente Panelgrößen anwenden. Fünf parallele Sonderklassen mit jeweils eigener Größenlogik werden vermieden.

Bevorzugt werden CSS-Variablen oder eine gleichwertig zentrale Lösung.

---

# 5. Exakte Größenregeln

## 5.1 Breite

Schritt: `1` Rastereinheit.

| Panel | Standard | Minimum | Maximum |
| --- | ---: | ---: | ---: |
| Übersicht | 12 | 6 | 12 |
| Module | 4 | 4 | 12 |
| Arbeitsbereich | 8 | 6 | 12 |
| Detailbereich | 4 | 4 | 12 |
| Systemstatus | 12 | 6 | 12 |

Nur ganze Zahlen.

## 5.2 Höhe

Schritt: `24 px`.

| Panel | Standard | Minimum | Maximum |
| --- | --- | ---: | ---: |
| Übersicht | automatisch | 148 px | 1200 px |
| Module | automatisch | 220 px | 1200 px |
| Arbeitsbereich | automatisch | 360 px | 1200 px |
| Detailbereich | automatisch | 220 px | 1200 px |
| Systemstatus | automatisch | 148 px | 1200 px |

`heightPx: null` bleibt der Standard für automatische Höhe.

---

# 6. Tastaturmodell

Der Resize-Griff ist per Tab erreichbar.

- `Pfeil links` → Breite -1
- `Pfeil rechts` → Breite +1
- `Pfeil hoch` → Höhe -24 px
- `Pfeil runter` → Höhe +24 px
- `Home/Pos1` → nur dieses Panel auf Standardbreite + automatische Höhe
- `Escape` → aktive, noch nicht persistierte Vorschau abbrechen

Tastenwiederholung wird gebündelt:

`keydown = Vorschau`

`keyup = ein Commit`

So entsteht kein unnötiger Speicher-Schreibstrom.

---

# 7. Responsive Regeln

## Desktop `>= 981 px`

- Resize aktiv
- Resize-Griff bedienbar
- persistente Rasterbreite sichtbar
- persistente Höhe sichtbar

## Tablet `<= 980 px`

- Resize in 0.3.0-D nicht aktiv angeboten
- bestehende responsive Rückfallbreite verwenden
- gespeicherte Desktopwerte nicht verändern

## Mobil `<= 680 px`

- Resize nicht aktiv
- Panels effektiv vollbreit
- Höhe primär inhaltsgerecht
- Desktopwerte unverändert behalten

Diese bewusste Begrenzung verhindert, dass ein Nutzer auf einer Ansicht, die den echten Desktopwert gar nicht zeigt, diesen Desktopwert unbeabsichtigt überschreibt.

---

# 8. Detaillierte Umsetzungsschritte

## 8.1 Vorprüfung

- [ ] aktuellen `main`-Commit bestätigen
- [ ] Branch direkt von aktuellem `main` erzeugen
- [ ] `assets/workspace-state.js` vollständig gegen Resize-Vertrag prüfen
- [ ] `assets/workspace-ui.js` auf Render-Verantwortung prüfen
- [ ] aktuelle CSS-Raster- und Breakpointregeln prüfen
- [ ] vorhandene Tests und Quality-Gate-Regeln lesen
- [ ] Diff-Grenze schriftlich festhalten

## 8.2 State-API

- [ ] `panelGroesseSetzen` als kleine zentrale Methode ergänzen
- [ ] `panelGroesseZuruecksetzen` ergänzen
- [ ] unbekannte Panel-ID vor Mutation ablehnen
- [ ] nur `widthUnits` und `heightPx` verändern
- [ ] bestehende Normalisierung wiederverwenden
- [ ] Sichtbarkeit und Reihenfolge unverändert lassen
- [ ] unveränderte Zielgröße ohne unnötige Mutation behandeln
- [ ] Logging nur für Ergebnis/Fehler, nicht für jeden Rechenschritt

## 8.3 Reine Größenberechnung

- [ ] Grid-Maße aus tatsächlichem DOM lesen
- [ ] `column-gap` aus berechnetem CSS lesen
- [ ] Rasterbreite reproduzierbar aus Horizontalbewegung ableiten
- [ ] Höhe auf 24-px-Schritte rastern
- [ ] Werte gegen Paneldefinition begrenzen
- [ ] reine Hilfsfunktionen möglichst ohne DOM-Seiteneffekt halten
- [ ] gleiche Eingabe muss immer gleichen Endwert ergeben

## 8.4 HTML-Resize-Griffe

- [ ] jedem Workspace-Panel genau einen Griff zuordnen
- [ ] technische Panel-ID aus bestehender stabiler Zuordnung verwenden
- [ ] Griff per Tastatur fokussierbar machen
- [ ] verständliche zugängliche Bezeichnung pro Panel
- [ ] kurze Bedienhilfe für Pfeile, Home und Escape
- [ ] Griff darf nicht als Drag-Griff für 0.3.0-E missbraucht werden

## 8.5 CSS

- [ ] klare Griffdarstellung unten rechts
- [ ] ungefähr 44 × 44 px sichere Trefferfläche
- [ ] sichtbarer Fokuszustand
- [ ] Vorschau ohne Layout-Flackern
- [ ] persistente Breite zentral anwenden
- [ ] persistente Höhe zentral anwenden
- [ ] `heightPx: null` sauber in automatische Höhe zurückführen
- [ ] Resize-Griff bis 980 px deaktivieren/verbergen
- [ ] `prefers-reduced-motion` unverändert respektieren

## 8.6 Pointer-Steuerung

- [ ] `pointerdown` startet transiente Vorschau
- [ ] Startzustand unverändert sichern
- [ ] Pointer Capture verwenden
- [ ] `pointermove` nur Vorschau
- [ ] keine Persistenz während `pointermove`
- [ ] Breite und Höhe gleichzeitig vorschauen
- [ ] `pointerup` genau einmal committen
- [ ] `pointercancel` vollständig zurückrollen
- [ ] `Escape` aktive Pointervorschau abbrechen
- [ ] Pointer Capture am Ende sauber freigeben

## 8.7 Tastatursteuerung

- [ ] links/rechts = 1 Rastereinheit
- [ ] hoch/runter = 24 px
- [ ] Grenzen berücksichtigen
- [ ] Tastenwiederholung nur als Vorschau behandeln
- [ ] auf `keyup` einmal committen
- [ ] `Home` setzt nur Panelgröße zurück
- [ ] `Escape` bricht nicht persistierte Vorschau ab
- [ ] Fokus bleibt am Resize-Griff

## 8.8 Nutzerfeedback

- [ ] während Vorschau kompakte Größenanzeige
- [ ] nach Commit verständliche Endmeldung
- [ ] nach Abbruch klar melden, dass vorherige Größe erhalten bleibt
- [ ] Fehlerfeedback nennt betroffenen Bereich und sicheren Zustand
- [ ] technische Zusatzdaten ausschließlich im Debugbereich

## 8.9 Automatische Tests

State:

- [ ] gültige Größe
- [ ] Breiten-Minimum/-Maximum
- [ ] Höhen-Minimum/-Maximum
- [ ] `null`-Höhe
- [ ] unbekannte Panel-ID
- [ ] Sichtbarkeit/Reihenfolge bleiben erhalten
- [ ] Panel-Standardgröße

Berechnung:

- [ ] Rasterberechnung inklusive Gap
- [ ] 24-px-Höhenraster
- [ ] automatische Starthöhe aus gerendertem Wert
- [ ] deterministisches Ergebnis

Pointer:

- [ ] Start ohne Persistenz
- [ ] Moves nur Vorschau
- [ ] Up genau ein Commit
- [ ] Cancel ohne Commit
- [ ] Escape ohne Commit

Tastatur:

- [ ] vier Pfeilrichtungen
- [ ] Grenzen
- [ ] wiederholte keydown + ein keyup = ein Commit
- [ ] Home
- [ ] Escape

Responsive/UI:

- [ ] Resize ab 981 px
- [ ] kein persistenter Resize bis 980 px
- [ ] Desktopwerte bleiben erhalten
- [ ] genau ein Griff pro sichtbarem Panel
- [ ] Fokus und Bezeichnung

## 8.10 Quality Gate

Kanonischer Befehl bleibt:

```bash
npm run verify
```

Zusätzliche Prüfungen:

- [ ] `assets/workspace-resize.js` vorhanden
- [ ] Resize-Testdatei vorhanden
- [ ] deterministische Script-Reihenfolge
- [ ] Resize-Griff-Zuordnung entspricht Workspace-IDs
- [ ] keine direkte `localStorage`-Nutzung in Resize-Controller
- [ ] keine externe Laufzeitabhängigkeit
- [ ] keine Drag-/Reorder-Funktion vorgezogen

## 8.11 Dokumentation

- [ ] `README.md`
- [ ] `TODO.md`
- [ ] `CHANGELOG.md`
- [ ] `MANIFEST.md`
- [ ] `VERSION.json` nur Entwicklungsphase fortschreiben
- [ ] `LOGGING.md`
- [ ] `PRO_DEBUGGING.md`
- [ ] `docs/STATUS_0.3.0.md`
- [ ] `docs/DECISIONS_0.3.0.md`
- [ ] `docs/MANIFEST_0.3.0_D.md`

## 8.12 Abschlussvalidierung

- [ ] vollständiger Diff gegen aktuellen `main`
- [ ] Branch 0 Commits hinter `main`
- [ ] `npm run verify` erfolgreich
- [ ] alle Resize-Tests grün
- [ ] PR mergebar
- [ ] keine ungeplanten Dateien
- [ ] technischer PR mergen
- [ ] zentrale Laufzeitdateien auf `main` erneut lesen
- [ ] Abschlussstatus getrennt dokumentieren

---

# 9. Testmatrix

Die verbindliche Vollmatrix steht in:

`docs/RESIZE_CONTRACT_0.3.0.md`

Sie umfasst 40 Prüfziele aus sieben Gruppen:

1. State
2. Berechnung/Rasterung
3. Pointer
4. Tastatur
5. Responsive Verhalten
6. UI/Zugänglichkeit
7. Quality Gate

Die Matrix wird nicht hier dupliziert, damit nur eine kanonische Detailquelle gepflegt werden muss.

---

# 10. Änderungsvolumen

## Planungs-Patch

Einstufung: **klein bis mittel, ausschließlich Dokumentation**.

Betroffen:

- Resize-Vertrag
- Detailplan
- Entscheidungen
- Status
- TODO
- Masterplan
- Manifest/Versionsmetadaten

Keine Laufzeitänderung.

## Späterer Implementierungs-Patch

Erwartete Einstufung: **mittel**.

Voraussichtlich betroffen:

- `assets/workspace-state.js`
- `assets/workspace-ui.js`
- neue `assets/workspace-resize.js`
- `assets/styles.css`
- `index.html`
- Tests
- Quality Gate
- Dokumentation

Wenn der technische Patch deutlich größer wird, muss er vor Implementierung weiter geteilt werden.

---

# 11. Risiken und Schutzmaßnahmen

## Risiko: Speicher wird bei jeder Bewegung beschrieben

Schutz: Pointerbewegungen ändern ausschließlich Vorschau; Persistenz erst bei Abschluss.

## Risiko: Tablet/Mobil überschreibt Desktopgröße

Schutz: Resize in 0.3.0-D nur ab 981 px aktiv.

## Risiko: Maus-, Touch- und Tastaturlogik driften auseinander

Schutz: gemeinsame Größenberechnung, Pointer Events und zentraler Commitpfad.

## Risiko: Resize und Drag & Drop geraten ineinander

Schutz: dedizierter Resize-Griff; Drag bleibt bis 0.3.0-E vollständig ausgeschlossen.

## Risiko: automatisches Höhenmodell geht verloren

Schutz: `Home` setzt `heightPx` wieder auf `null`.

## Risiko: CSS und State haben unterschiedliche Größenregeln

Schutz: Grenzen bleiben ausschließlich in `PANEL_DEFINITIONEN`; CSS erhält nur gültige angewandte Werte.

---

# 12. Wer ist betroffen?

## Nutzer

Nach Implementierung erstmals direkte Größenänderung der Panels auf Desktopansichten.

## Lokale Daten

Keine neuen Felder. Nur vorhandene `widthUnits` und `heightPx` werden tatsächlich genutzt.

## Entwickler

Neue Resize-Eingabeschicht, zusätzliche Tests und Quality-Gate-Regeln.

## Fachmodule

Nicht betroffen.

## Netzwerk

Nicht betroffen.

---

# 13. Abnahmekriterium

`0.3.0-D` ist erst fertig, wenn **kein Panel einen ungültigen Größenwert persistieren kann**, eine laufende Größenänderung jederzeit ohne Zustandsverlust abgebrochen werden kann und Maus/Touch/Stift/Tastatur denselben Größenvertrag verwenden.

---

# 14. Rückweg

Planungs-Patch und späterer Implementierungs-Patch bleiben getrennte Pull Requests.

Dadurch kann die Resize-Laufzeit vollständig zurückgenommen werden, ohne den bereits stabilen Stand 0.3.0-C zu verändern.

---

# 15. Nächste zwei Schritte

## Nächster Schritt nach Planungsfreigabe

**0.3.0-D Implementierung – State + Größenberechnung zuerst**

1. State-API ergänzen
2. reine Raster-/Höhenberechnung bauen
3. automatische Tests dafür schreiben
4. erst danach sichtbare Resize-Griffe anbinden

## Danach

**0.3.0-E – Reorder & Drag and Drop**

Neuordnung bleibt blockiert, bis Resize vollständig validiert und gemergt ist.

## Empfehlung

Nach Merge dieses Planungs-Patches den technischen Resize-Patch **nicht** mit HTML/CSS beginnen. Zuerst State-API und reine Größenberechnung implementieren und testen. Das senkt das Risiko deutlich, weil die spätere Pointer-/Tastaturbedienung dann nur noch auf bereits geprüfte Größenfunktionen zugreift.
