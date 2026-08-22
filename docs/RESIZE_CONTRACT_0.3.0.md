# Resize-Vertrag 0.3.0-D – Größenänderung der Workspace-Panels

## Zweck

Dieser Vertrag legt fest, **wie** die fünf Workspace-Panels später in ihrer Größe verändert werden dürfen. Er konkretisiert den bereits vorhandenen Größenabschnitt des Workspace-Vertrags, ohne dessen Schema-Version `1` zu ändern.

Die wichtigste Regel lautet:

> Während einer Bewegung entsteht nur eine Vorschau. Persistiert wird erst ein validierter Endwert.

Dadurch werden Browser-Speicher, Zustand und Oberfläche nicht bei jeder Zeigerbewegung unnötig beschrieben.

## Begriffe in einfacher Sprache

- **Resize-Griff:** sichtbarer Griff am Panel, über den dessen Größe verändert wird.
- **Pointer Events:** gemeinsame Browser-Schnittstelle für Maus, Touch und Stift. Dadurch braucht das Projekt nicht drei getrennte Eingabelogiken.
- **Rastereinheit:** eine von zwölf Spalten der Desktop-Arbeitsfläche.
- **Snap/Rasterung:** Größen springen kontrolliert auf feste Schritte statt beliebige Zwischenwerte zu speichern.
- **Vorschauzustand:** nur während der aktuellen Größenänderung sichtbar; wird nicht dauerhaft gespeichert.
- **Commit/Übernahme:** der geprüfte Endwert wird einmal in den echten Workspace-Zustand geschrieben.
- **Clamp/Begrenzung:** ein Wert wird auf sein erlaubtes Minimum oder Maximum begrenzt.
- **Pointer Capture:** der Browser liefert eine begonnene Ziehbewegung weiter an denselben Griff, auch wenn der Zeiger kurz außerhalb liegt.

---

# 1. Geltungsbereich

Der Vertrag gilt ausschließlich für die fünf Workspace-Panels:

1. `overview`
2. `modules`
3. `work`
4. `details`
5. `system-status`

Nicht verändert werden:

- Kopfbereich
- Seitenleiste
- Schnellstarter-/Menüleiste
- permanenter `Layout`-Schalter
- Debugging & Logging
- Fachmodule
- Panelreihenfolge

Drag & Drop bleibt ausdrücklich Teil von `0.3.0-E`.

---

# 2. Bestätigte Bedienentscheidung – Option A

Jedes sichtbare Workspace-Panel erhält **einen klaren Resize-Griff unten rechts**.

Derselbe Griff unterstützt:

- Maus
- Touch
- Stift
- Tastatur

Die technische Eingabelogik verwendet für Maus, Touch und Stift bevorzugt **Pointer Events**. Dadurch bleibt nur eine gemeinsame Zeigerlogik zu warten.

## Grundsatz

Eine Bedienmechanik soll alle Eingabearten abdecken. Parallele, fachlich gleichwertige Größensteuerungen im Layout-Menü werden in 0.3.0-D **nicht** eingeführt.

---

# 3. Größenmodell

Persistiert werden weiterhin nur die bereits vorhandenen Felder:

```text
widthUnits
heightPx
```

Es wird **kein neues persistentes Schemafeld** eingeführt. Deshalb bleibt die Workspace-Vertragsversion bei `1`.

## Breite

`widthUnits` ist eine ganze Zahl im 12-Spalten-Raster.

Verbindliche Grenzen aus der aktuellen Workspace-Definition:

| Panel | Standard | Minimum | Maximum |
| --- | ---: | ---: | ---: |
| `overview` | 12 | 6 | 12 |
| `modules` | 4 | 4 | 12 |
| `work` | 8 | 6 | 12 |
| `details` | 4 | 4 | 12 |
| `system-status` | 12 | 6 | 12 |

Breitenschritt:

**1 Rastereinheit**.

Es werden niemals Dezimalwerte gespeichert.

## Höhe

`heightPx` ist entweder:

- `null` = automatische Höhe
- eine positive ganze Zahl innerhalb der Panelgrenzen

Verbindliche Grenzen:

| Panel | Standard | Minimum | Maximum |
| --- | --- | ---: | ---: |
| `overview` | automatisch | 148 px | 1200 px |
| `modules` | automatisch | 220 px | 1200 px |
| `work` | automatisch | 360 px | 1200 px |
| `details` | automatisch | 220 px | 1200 px |
| `system-status` | automatisch | 148 px | 1200 px |

Höhenschritt:

**24 px**.

### Warum 24 px?

- klein genug für kontrollierte Feinanpassung
- groß genug, damit eine einzelne Aktion sichtbar bleibt
- vermeidet beliebige Pixelwerte
- gut reproduzierbar in Tests

---

# 4. Responsive Grenze

## Desktop ab 981 px

Resize ist aktiv.

- gespeicherte `widthUnits` werden sichtbar angewendet
- gespeicherte feste Höhe darf sichtbar angewendet werden
- Resize-Griff ist bedienbar

## Tablet bis 980 px

Resize wird in 0.3.0-D **nicht aktiv angeboten**.

Begründung: Die Tablet-Darstellung verwendet bewusst responsive Rückfallwerte. Eine dort ausgeführte Größenänderung könnte sonst einen Desktopwert verändern, obwohl der Nutzer die echte Desktopbreite nicht sieht.

Gespeicherte Desktopwerte bleiben unverändert.

## Mobil bis 680 px

Resize ist ebenfalls nicht aktiv.

- Panels bleiben effektiv vollbreit
- Höhe bleibt primär inhaltsgerecht
- gespeicherte Desktopwerte bleiben unverändert

## Touch-Unterstützung

Touch wird trotzdem vollständig unterstützt, sobald die verfügbare Ansicht die Desktop-Resize-Bedingung `>= 981 px` erfüllt, zum Beispiel auf großen Touch-Displays oder Tablets im passenden Modus.

---

# 5. Resize-Griff

## Sichtbar

- unten rechts im Panel
- klar vom Inhalt unterscheidbar
- darf normale Panelinhalte nicht verdecken
- darf keine zukünftigen Modulbuttons imitieren

## Bedienfläche

Die sichtbare Grafik darf kompakt sein. Die tatsächliche Trefferfläche soll jedoch mindestens ungefähr **44 × 44 px** betragen, damit Touch und Maus zuverlässig funktionieren.

## Fokus

Der Griff ist per Tabulator erreichbar.

Er benötigt eine verständliche Bezeichnung, zum Beispiel:

`Größe von Arbeitsbereich ändern`

Zusätzliche Bedienhilfe erklärt knapp:

`Pfeile ändern Breite oder Höhe. Pos1 stellt Standardgröße wieder her. Escape bricht eine laufende Änderung ab.`

---

# 6. Zeigerbedienung mit Maus, Touch und Stift

## 6.1 Start

Bei `pointerdown`:

1. Panel-ID bestimmen
2. aktuellen gültigen Workspace-Zustand lesen
3. Startbreite und Starthöhe merken
4. aktuelle gerenderte Panelgröße messen
5. `pointerId` merken
6. Pointer Capture aktivieren
7. transienten Resize-Vorschauzustand starten

Wichtig: Zu diesem Zeitpunkt wird **nichts persistent gespeichert**.

## 6.2 Breitenberechnung

Die Breite wird aus dem realen 12-Spalten-Grid berechnet.

Die Berechnung darf den CSS-Spaltenabstand nicht fest im JavaScript duplizieren. Spaltenbreite und `column-gap` werden aus der tatsächlich gerenderten Arbeitsfläche abgeleitet.

Aus der horizontalen Bewegung entsteht eine Zielbreite in ganzen Rastereinheiten.

Danach gilt:

`runden -> Panelminimum beachten -> Panelmaximum beachten`

## 6.3 Höhenberechnung

Wenn `heightPx` bisher `null` ist, beginnt die Vorschau bei der tatsächlich gerenderten aktuellen Höhe des Panels.

Dann:

`Start-Höhe + vertikale Bewegung -> auf 24 px rastern -> Minimum/Maximum anwenden`

Die Vorschauhöhe ist eine ganze Zahl.

## 6.4 Vorschau

Während `pointermove`:

- nur CSS-/DOM-Vorschau aktualisieren
- keinen Workspace-State persistieren
- kein `localStorage` schreiben
- keine dauerhafte Logmeldung pro Pixelbewegung erzeugen

Die Vorschau darf Breite und Höhe gleichzeitig darstellen.

## 6.5 Abschluss

Bei gültigem `pointerup`:

1. Vorschauwerte final normalisieren
2. genau einen Größen-Commit an die Workspace-State-API senden
3. gespeicherten Zustand erneut auf DOM anwenden
4. transienten Vorschauzustand vollständig löschen
5. kurze Nutzerbestätigung anzeigen
6. genau ein zusammenfassendes Diagnoseereignis schreiben

Beispiel Nutzerfeedback:

`Arbeitsbereich: 9/12 breit, 456 px hoch.`

## 6.6 Abbruch

Folgende Fälle brechen die laufende Vorschau ohne Persistenz ab:

- `pointercancel`
- `Escape`
- Verlust eines notwendigen DOM-Elements
- ungültige Panel-ID
- interner Berechnungsfehler

Danach wird wieder der letzte gültige Workspace-Zustand dargestellt.

---

# 7. Tastaturmodell

Der fokussierte Resize-Griff verwendet dieselbe Größenlogik wie die Zeigerbedienung.

## Pfeiltasten

- `Pfeil links` → Breite um 1 Rastereinheit kleiner
- `Pfeil rechts` → Breite um 1 Rastereinheit größer
- `Pfeil hoch` → Höhe um 24 px kleiner
- `Pfeil runter` → Höhe um 24 px größer

Panelgrenzen werden immer eingehalten.

## Pos1 / Home

`Home` stellt **nur dieses Panel** auf seine Standardgröße zurück:

- Standardbreite aus `PANEL_DEFINITIONEN`
- `heightPx: null`

Sichtbarkeit und Reihenfolge bleiben unangetastet.

## Escape

Wenn eine noch nicht übernommene Tastaturvorschau aktiv ist, verwirft `Escape` diese Vorschau.

## Tastenwiederholung

Gedrückthalten einer Pfeiltaste darf die Vorschau mehrfach verändern. Persistiert wird nach Abschluss der Tastenserie gebündelt, nicht bei jedem automatisch wiederholten `keydown`.

Bevorzugter Ablauf:

`keydown -> Vorschau`

`weitere keydown-Wiederholungen -> Vorschau`

`keyup -> genau ein Commit`

---

# 8. Standardgröße eines einzelnen Panels

Die Standardgröße ist kein globaler Workspace-Reset.

Sie verändert ausschließlich das aktuelle Panel:

```text
widthUnits = standardBreite
heightPx = null
```

Nicht verändert werden:

- Sichtbarkeit
- Reihenfolge
- andere Panels
- Debug-Einstellungen
- Module

Der globale Befehl `Standardlayout wiederherstellen` bleibt davon getrennt.

---

# 9. Zustandsarchitektur

## Persistente Quelle

`assets/workspace-state.js` bleibt die einzige persistente Workspace-Zustandsquelle.

Vorgesehene kleine zentrale API-Erweiterung:

```text
panelGroesseSetzen(id, { widthUnits, heightPx })
panelGroesseZuruecksetzen(id)
```

Beide Funktionen:

- prüfen die Panel-ID
- verändern nur Größenwerte
- nutzen bestehende Normalisierung
- speichern erst den validierten Endzustand
- erhalten Reihenfolge und Sichtbarkeit

## Sichtbare Anwendung

`assets/workspace-ui.js` bleibt für das Anwenden eines **gültigen gespeicherten Zustands** auf das DOM zuständig.

## Eingabesteuerung

Vorgesehene neue Datei:

`assets/workspace-resize.js`

Sie enthält ausschließlich:

- Pointer-/Tastaturereignisse
- transiente Resize-Vorschau
- Größenberechnung aus DOM-Maßen
- Commit/Abbruch
- verständliches Nutzerfeedback über die vorhandene UI-/Logging-Anbindung

Sie schreibt niemals selbst in `localStorage`.

---

# 10. Transienter Resize-Zustand

Während einer Aktion dürfen beispielsweise folgende Werte nur im Arbeitsspeicher existieren:

```text
panelId
pointerId
startWidthUnits
startHeightPx
startRenderedWidthPx
startRenderedHeightPx
previewWidthUnits
previewHeightPx
inputMode
active
```

Diese Daten werden niemals gespeichert.

Nach Commit oder Abbruch müssen sie vollständig verworfen werden.

---

# 11. CSS-Vertrag

Persistente Größen sollen über zentrale CSS-Eigenschaften angewendet werden, nicht über pro Panel vervielfachte Klassenlogik.

Vorgesehene Richtung:

```text
--panel-width-units
--panel-height-px
```

Die konkrete Implementierung darf technisch abweichen, wenn sie:

- dieselbe zentrale Größenquelle nutzt
- keine fünf parallelen Sonderimplementierungen erzeugt
- responsive Fallbacks nicht überschreibt
- keine ungültigen Werte in Styles schreibt

---

# 12. Logging und Nutzerfeedback

## Sichtbares Feedback

Während des Ziehens darf eine kompakte Vorschau angezeigt werden, zum Beispiel:

`9/12 · 456 px`

Nach Abschluss:

`Arbeitsbereich auf 9/12 und 456 px gesetzt.`

Bei Abbruch:

`Größenänderung abgebrochen. Vorherige Größe bleibt erhalten.`

## Technisches Logging

Bereich:

`WORKSPACE`

### Stufe 1

- Größenänderung konnte nicht übernommen werden
- ungültige Panel-ID
- schwerer DOM-/Berechnungsfehler

### Stufe 2

- Größenänderung abgeschlossen
- Standardgröße eines Panels wiederhergestellt
- Resize wegen kleinem Viewport nicht angeboten

### Stufe 3

Nur bei echtem Diagnosebedarf:

- Start-/Endwerte
- gerenderte Grid-Maße
- berechnete Rastereinheit

Keine Logzeile pro Pointer-Bewegung.

---

# 13. Fehlerregeln

## Ungültige Panel-ID

- keine Zustandsänderung
- verständliches Fehlerlogging
- bisherige Darstellung bleibt erhalten

## Nicht verfügbare Workspace-API

- Resize nicht initialisieren
- Oberfläche bleibt ansonsten funktionsfähig
- Fehler wird einmal geloggt

## Ungültige DOM-Maße

Beispiel: Gridbreite `0`.

- Aktion abbrechen
- keinen Zustand persistieren
- letzten gültigen Zustand wieder anwenden

## Speicherung nicht verfügbar

Die bereits bestehende Workspace-Regel gilt weiter:

- Sitzung funktioniert weiter
- In-Memory-Zustand darf gültig bleiben
- Fehler wird kontrolliert geloggt
- keine Endlosschleife

---

# 14. Testmatrix

## A. Reine State-Tests

1. gültige Breite/Höhe wird übernommen
2. Breite unter Minimum wird begrenzt
3. Breite über Maximum wird begrenzt
4. Höhe unter Minimum wird begrenzt
5. Höhe über Maximum wird begrenzt
6. `heightPx: null` bleibt gültig
7. unbekannte Panel-ID verändert keinen Zustand
8. Größenänderung erhält Sichtbarkeit und Reihenfolge
9. Größenreset betrifft nur das gewählte Panel

## B. Berechnungs-/Rastertests

10. horizontale Bewegung ergibt ganze Rastereinheiten
11. CSS-Spaltenabstand wird in der Gridberechnung berücksichtigt
12. vertikale Bewegung rastet auf 24-px-Schritte
13. Start aus automatischer Höhe verwendet gerenderte Höhe
14. gleiche Startdaten + gleiche Bewegung ergeben reproduzierbar denselben Endwert

## C. Pointer-Tests

15. `pointerdown` startet Vorschau ohne Persistenz
16. mehrere `pointermove` verändern nur Vorschau
17. `pointerup` erzeugt genau einen Commit
18. `pointercancel` verwirft Vorschau vollständig
19. `Escape` verwirft aktive Vorschau
20. Pointer Capture wird für aktive Ziehbewegung verwendet

## D. Tastaturtests

21. links/rechts ändern Breite um genau 1 Einheit
22. hoch/runter ändern Höhe um genau 24 px
23. Grenzen können per Tastatur nicht überschritten werden
24. wiederholte `keydown` erzeugen Vorschau, `keyup` genau einen Commit
25. `Home` stellt Standardbreite und automatische Höhe wieder her
26. `Escape` verwirft eine aktive Tastaturvorschau

## E. Responsive Tests

27. ab 981 px ist Resize verfügbar
28. bis 980 px wird keine persistente Resize-Aktion angeboten
29. kleiner Viewport überschreibt gespeicherte Desktopwerte nicht
30. nach Rückkehr auf Desktop gelten die zuletzt gespeicherten Desktopwerte

## F. UI-/Zugänglichkeitstests

31. jedes sichtbare Kernpanel besitzt genau einen Resize-Griff
32. Griff ist per Tabulator erreichbar
33. Griff besitzt verständliche Panelbezeichnung
34. ausgeblendetes Panel erzeugt keinen erreichbaren Resize-Griff
35. Layout-Menü und Resize-Griff behindern sich nicht
36. Nutzerfeedback meldet Endgröße oder Abbruch verständlich

## G. Quality-Gate-Prüfungen

37. keine direkte `localStorage`-Nutzung in `workspace-resize.js`
38. keine externe Laufzeitabhängigkeit
39. deterministische Script-Reihenfolge
40. Resize-Griffe entsprechen exakt den fünf Workspace-Panel-IDs

---

# 15. Abnahmekriterien

0.3.0-D darf erst als technisch abgeschlossen gelten, wenn:

- alle fünf Panels auf Desktop größenveränderbar sind
- Maus, Touch/Stift über Pointer Events und Tastatur denselben Größenvertrag nutzen
- Breiten nur als gültige ganze Rastereinheiten persistiert werden
- Höhen nur als `null` oder gültige ganze Pixelwerte persistiert werden
- Pointerbewegungen keinen Speicher-Schreibsturm erzeugen
- Pointer-Abbruch den vorherigen Zustand erhält
- Tastaturbedienung ohne Maus vollständig möglich ist
- kleine Viewports gespeicherte Desktopwerte nicht überschreiben
- Standardgröße eines einzelnen Panels wiederherstellbar ist
- alle automatischen Tests grün sind
- `npm run verify` grün ist
- Branch-Diff kontrolliert und PR mergebar ist
- Main-Stichprobe nach Merge erfolgt

---

# 16. Rückweg

Der spätere Implementierungs-Patch für 0.3.0-D wird als eigener Pull Request umgesetzt.

Ein Revert dieses Pull Requests muss die Resize-Mechanik vollständig entfernen können, ohne:

- bestehende Sichtbarkeit
- gespeicherte Reihenfolge
- Debug-Einstellungen
- Modulvertrag
- Fachmoduldaten

zu beschädigen.

Die gespeicherten Felder `widthUnits` und `heightPx` existieren bereits seit Workspace-Vertrag Version 1. Es ist deshalb keine neue Datenmigration erforderlich.
