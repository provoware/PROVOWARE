# Teilplan 0.3.0-D3a – Resize-Griff + Tastatur-Vorschau

## Ziel in einfacher Sprache

D3a führt erstmals einen sichtbaren Größen-Griff pro Workspace-Panel ein und macht ihn vollständig mit der Tastatur bedienbar. Während Pfeiltasten gedrückt werden, wird nur eine Vorschau angezeigt. Erst wenn die Tastenserie abgeschlossen ist, wird höchstens ein validierter Endwert in den Workspace-Zustand übernommen.

Maus, Touch und Stift sind bewusst nicht Bestandteil dieses Patches. Sie folgen separat in D3b und müssen dieselbe Vorschau-/Commit-Mechanik wiederverwenden.

## Begriffe

- **Resize-Griff:** fokussierbarer Knopf unten rechts am Panel zum Ändern der Größe.
- **Transiente Vorschau:** nur im Arbeitsspeicher und DOM sichtbare Zwischenwerte; sie werden nicht gespeichert.
- **Commit (Übernahme):** eine dauerhafte Größenänderung nach Abschluss einer Eingabeserie.
- **Tastenserie:** ein oder mehrere `keydown`-Ereignisse, die erst nach Freigabe der letzten aktiven Resize-Pfeiltaste abgeschlossen sind.
- **Responsive Sperre:** bis einschließlich 980 px ist Resize weder sichtbar noch logisch aktiv.

---

# 1. Ausgangslage

- [x] Baseline `main`: `d5d7022816e3c164f641a39ccd9b05a5722d0db2`
- [x] Branch: `feature/0.3.0-d3a-keyboard-resize-preview`
- [x] D1-State-API vorhanden: `panelGroesseSetzen`, `panelGroesseZuruecksetzen`
- [x] D1-Größenberechnung vorhanden
- [x] D2-DOM-Anwendung über `--panel-spalten` und `--panel-hoehe` vorhanden
- [x] Desktopdarstellung ab 981 px vorhanden
- [x] Workspace-Vertrag bleibt Version `1`
- [x] Speicher-Schlüssel bleibt `provoware.allin.workspace.main.v1`
- [x] Produktversion bleibt bis Release-Gate `0.2.0`

---

# 2. Verbindliche Bedienkette

```text
Resize-Griff -> workspace-resize.js -> transiente Vorschau -> Workspace-State -> Workspace-UI
```

Abgenommen:

1. [x] `keydown` verändert nur die Vorschau.
2. [x] wiederholtes `keydown` speichert nichts.
3. [x] erst nach Freigabe der letzten aktiven Resize-Pfeiltaste erfolgt höchstens ein Commit.
4. [x] `Escape` verwirft eine laufende Vorschau vollständig.
5. [x] `Home` setzt nur die Größe des aktuellen Panels auf Standard zurück.
6. [x] Ansichten bis 980 px verändern keine gespeicherten Desktopwerte.

---

# 3. Umgesetzte Änderungsgrenze

## Enthalten und erledigt

- [x] `assets/workspace-resize.js` als entkoppelte Eingabeschicht
- [x] genau ein dynamisch erzeugter Resize-Griff pro Workspace-Panel
- [x] verständliche deutsche `aria-label`-Beschriftung
- [x] Tastaturhilfe über `aria-keyshortcuts` und kurze Beschreibung
- [x] Pfeiltasten links/rechts je 1 Rastereinheit
- [x] Pfeiltasten hoch/runter je 24 px
- [x] bei automatischer Höhe Start von der real gerenderten Panelhöhe
- [x] Vorschau ohne State-/Speicheränderung
- [x] Commit erst nach Ende der Tastenserie
- [x] `Escape` als Abbruch ohne Persistenz
- [x] `Home` als isolierter Einzel-Reset
- [x] sichtbares Nutzerfeedback über vorhandene Workspace-UI
- [x] zusammenfassendes WORKSPACE-Logging nur bei Abschluss/Fehler
- [x] Resize-Griffe nur ab 981 px sichtbar und bedienbar
- [x] automatische Tests für Griff, Tastatur, Wiederholung, Commit, Abbruch, Reset und Responsive-Sperre
- [x] D3a-Patchmanifest und Versionsmetadaten angelegt

## Weiterhin ausdrücklich nicht enthalten

- [x] keine Pointer-Ziehlogik
- [x] kein `pointerdown`, `pointermove`, `pointerup`, `pointercancel`
- [x] kein Pointer Capture
- [x] keine Maus-/Touch-/Stift-Ziehbewegung
- [x] kein Drag & Drop
- [x] keine neue persistente State-Struktur
- [x] kein neuer Browser-Speicherschlüssel
- [x] keine neue Bibliothek
- [x] keine Änderung am Modulvertrag

Die Abwesenheit der Pointer-Ziehlogik wird automatisiert geprüft.

---

# 4. Verantwortungstrennung

## `assets/workspace-state.js`

- [x] unverändert
- [x] einzige persistente Workspace-Quelle

## `assets/workspace-size.js`

- [x] eigentliche D1-Berechnungslogik unverändert
- [x] zentraler `HOEHEN_SCHRITT_PX` wird von D3a wiederverwendet

## `assets/workspace-ui.js`

Ergänzt:

```text
panelGroesseVorschauAnwenden(id, { widthUnits, heightPx })
```

- [x] verwendet dieselben CSS-Variablen wie D2
- [x] legt keine zweite Größenlogik an
- [x] verändert Workspace-State nicht
- [x] `zustandAnwenden(...)` entfernt den Vorschau-Marker und stellt gespeicherte Werte wieder her

## `assets/workspace-resize.js`

Verantwortlich für:

- [x] Griffe erzeugen und Tastaturereignisse binden
- [x] aktiven flüchtigen Vorschauzustand verwalten
- [x] Paneldefinitionen lesen
- [x] gerenderte Höhe bei `heightPx: null` messen
- [x] diskrete Tastaturschritte begrenzen
- [x] Commit/Abbruch koordinieren
- [x] Nutzerfeedback und Logging auslösen
- [x] Responsive-Sperre verwalten
- [x] niemals direkt `localStorage` beschreiben

---

# 5. Tastaturvertrag

## Pfeiltasten

- [x] `ArrowLeft`: Breite −1
- [x] `ArrowRight`: Breite +1
- [x] `ArrowUp`: Höhe −24 px
- [x] `ArrowDown`: Höhe +24 px

Grenzen stammen ausschließlich aus `workspace.PANEL_DEFINITIONEN`.

## Tastenwiederholung

Der flüchtige Sitzungsspeicher enthält nur Werte der laufenden Bedienaktion, unter anderem:

```text
panelId
vorschauBreite
vorschauHoehe
aktiveTasten
```

- [x] wiederholtes `keydown` verändert nur die Vorschau
- [x] mehrere gleichzeitig aktive Pfeiltasten werden als eine Tastenserie behandelt
- [x] erst nach Freigabe der letzten aktiven Resize-Pfeiltaste wird abgeschlossen
- [x] ohne tatsächliche Größenänderung wird kein unnötiger Commit erzeugt

## Escape

- [x] Vorschau löschen
- [x] gespeicherten Zustand erneut anwenden
- [x] keine Größen-State-API aufrufen
- [x] verständliches Feedback ausgeben

## Home

- [x] aktive Vorschau gegebenenfalls zuerst verwerfen
- [x] `panelGroesseZuruecksetzen(id)` genau für das gewählte Panel verwenden
- [x] Sichtbarkeit und Reihenfolge unverändert erhalten

---

# 6. Responsive Verhalten

Desktopbedingung:

```text
(min-width: 981px)
```

Bis 980 px:

- [x] Griff per CSS nicht sichtbar
- [x] Tastaturcontroller lehnt Resize-Aktionen logisch ab
- [x] laufende Tastaturvorschau wird bei Wechsel in kleine Ansicht verworfen
- [x] Workspace-State bleibt unverändert

Die doppelte CSS-/Logik-Sperre verhindert, dass eine versteckte Bedienung synthetisch Desktopwerte verändert.

---

# 7. Zugänglichkeit und UI

Jeder Griff:

- [x] ist ein echtes `button`-Element
- [x] ist per Tabulator erreichbar
- [x] besitzt ungefähr 44 × 44 px Trefferfläche
- [x] liegt unten rechts
- [x] trägt `data-workspace-resize-handle="<panel-id>"`
- [x] besitzt eine verständliche deutsche Beschriftung
- [x] besitzt `aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home Escape"`
- [x] wird dynamisch erzeugt, damit die HTML-Basis ohne JavaScript keine funktionslosen Resize-Elemente enthält

Der Griff verwendet in D3a bewusst keinen Zieh-Cursor, weil Pointer-Ziehen noch nicht implementiert ist.

---

# 8. Nutzerfeedback

Abgenommen sind verständliche Rückmeldungen für:

- [x] laufende Vorschau
- [x] erfolgreichen Commit
- [x] unveränderte Größe an erlaubter Grenze
- [x] `Home`-Reset
- [x] `Escape`-Abbruch
- [x] deaktiviertes Resize auf kleiner Ansicht
- [x] kontrollierte Fehlerfälle

Keine dauerhafte Logzeile wird pro Tastenwiederholung erzeugt.

---

# 9. Fehlerregeln

- [x] unbekannte Panel-ID → keine Größenänderung
- [x] fehlende Workspace-/UI-API → Controller initialisiert nicht unkontrolliert
- [x] ungültige gerenderte Höhe → Höhenaktion kontrolliert abbrechen
- [x] Commit-Fehler → gespeicherten Zustand erneut anwenden
- [x] Fehlerfeedback bleibt verständlich
- [x] keine zweite Fehlerkaskade beim Wiederherstellungsversuch erzeugen

---

# 10. Automatische Testmatrix D3a

## Griff

- [x] genau fünf Griffe werden erzeugt
- [x] jeder Griff besitzt korrekte Panel-ID
- [x] jeder Griff ist ein Button
- [x] jeder Griff besitzt Tastaturhinweise
- [x] erneute Initialisierung erzeugt keine doppelten Griffe

## Breite

- [x] ArrowRight erzeugt Vorschau +1
- [x] ArrowLeft wird vom selben zentralen Breitenpfad verarbeitet
- [x] Mindestbreite wird eingehalten
- [x] Höchstbreite wird eingehalten
- [x] wiederholtes Keydown speichert nicht
- [x] letzter Keyup erzeugt höchstens einen Commit

## Höhe

- [x] ArrowDown erhöht um 24 px
- [x] ArrowUp verwendet denselben Höhenpfad mit negativer Richtung
- [x] bei `heightPx: null` wird gerenderte Höhe als Start verwendet
- [x] Mindesthöhe wird eingehalten
- [x] Höchsthöhe wird eingehalten

## Abbruch/Reset

- [x] Escape verwirft Vorschau ohne Commit
- [x] Home setzt nur aktuelles Panel zurück
- [x] Sichtbarkeit und Reihenfolge bleiben erhalten

## Responsive

- [x] bis 980 px werden Tastaturaktionen ignoriert
- [x] Wechsel auf kleinen Viewport bricht aktive Vorschau ab
- [x] gespeicherter Desktopzustand bleibt unverändert

## Regression

- [x] vorhandene Visibility-Steuerung bleibt grün
- [x] D1-Größen-State-Tests bleiben grün
- [x] D1-Größenberechnung bleibt grün
- [x] D2-CSS-Variablenvertrag bleibt grün
- [x] Script-Ladereihenfolge ist automatisiert geprüft
- [x] D3a enthält automatisiert nachgewiesen noch keine Pointer-Ziehlogik
- [x] `npm run verify` vollständig grün

---

# 11. Reales Änderungsvolumen

Einstufung: **mittel**.

Technischer PR #78 änderte `11` Dateien.

Direkt betroffen:

- `assets/workspace-resize.js` neu
- `assets/workspace-ui.js`
- `assets/workspace-layout.css`
- `assets/app.js`
- `index.html`
- `tests/workspace-resize.test.mjs` neu
- `tests/workspace-resize-load.test.mjs` neu
- `tests/workspace-ui.test.mjs`
- `VERSION.json`
- D3a-Plan und D3a-Patchmanifest

Nicht verändert:

- `assets/workspace-state.js`
- eigentliche D1-Bewegungsberechnung in `assets/workspace-size.js`
- Moduldateien
- Netzwerkcode
- persistentes Workspace-Schema

---

# 12. Reale Abnahme

- [x] Tastatur-Resize ab 981 px implementiert und automatisiert geprüft
- [x] Vorschau während `keydown` ohne persistente Änderung
- [x] Tastenserie mit höchstens einem Commit abgeschlossen
- [x] Escape ohne Persistenz
- [x] Home nur für aktuelles Panel
- [x] ungefähr 44 × 44 px Griff
- [x] kein Pointer-Ziehcode in D3a
- [x] keine neue Abhängigkeit
- [x] finaler Branch `0` Commits hinter `main`
- [x] PR #78 mergebar
- [x] GitHub Quality Gate `success`
- [x] `56` Dateien statisch geprüft
- [x] `48/48` automatische Tests erfolgreich
- [x] `0` Tests fehlgeschlagen
- [x] Projektprüfung mit Node `20.20.2`
- [x] Squash-Merge `5e1db3ff65d034b478f4aec032f36c0c3ffb2300`
- [x] Main-Stichprobe: `assets/workspace-resize.js`, `index.html`, `VERSION.json`

Nicht durchgeführt: echte interaktive Firefox-/Chrome-Abnahme. Diese bleibt Bestandteil von `0.3.0-G`.

---

# 13. Rückweg

Ein Revert des technischen PR #78 entfernt Griff, Tastaturcontroller, transiente Vorschau und zugehörige Tests/Dokumentation.

D1-State, D1-Berechnung und D2-Darstellung bleiben erhalten. Es existiert keine Datenmigration.

---

# 14. Nächste zwei Schritte

## Nächster Schritt

**0.3.0-D3b – Pointer/Maus/Touch/Stift**

Die bestehende D3a-Infrastruktur wird wiederverwendet:

- `pointerdown`
- Pointer Capture
- `pointermove` nur Vorschau
- D1-Grid-Metrik und echter `column-gap`
- `pointerup` höchstens ein Commit
- `pointercancel` ohne Persistenz
- `Escape` auch für Pointer-Abbruch

## Danach

**0.3.0-E – Reorder & Drag and Drop**

Erst nach vollständig grüner D3a-/D3b-Abnahme. Resize-Griff und Drag-Griff bleiben getrennte Mechaniken.
