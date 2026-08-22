# Teilplan 0.3.0-D3a – Resize-Griff + Tastatur-Vorschau

## Ziel in einfacher Sprache

Dieser Patch führt erstmals einen sichtbaren Größen-Griff pro Workspace-Panel ein und macht ihn vollständig mit der Tastatur bedienbar. Während Pfeiltasten gedrückt werden, wird nur eine Vorschau angezeigt. Erst wenn die Tastenserie abgeschlossen ist, wird genau ein validierter Endwert in den Workspace-Zustand übernommen.

Maus, Touch und Stift werden in diesem Patch ausdrücklich noch nicht aktiviert. Sie folgen separat in D3b und sollen dieselbe Vorschau-/Commit-Mechanik wiederverwenden.

## Begriffe

- **Resize-Griff:** fokussierbarer Knopf unten rechts am Panel zum Ändern der Größe.
- **Transiente Vorschau:** nur im Arbeitsspeicher und DOM sichtbare Zwischenwerte; sie werden nicht gespeichert.
- **Commit (Übernahme):** genau eine dauerhafte Größenänderung nach Abschluss einer Eingabeserie.
- **Tastenserie:** ein oder mehrere `keydown`-Ereignisse, die erst mit dem letzten passenden `keyup` abgeschlossen sind.
- **Responsive Sperre:** bis einschließlich 980 px ist Resize nicht bedienbar und verändert keine Desktopwerte.

---

# 1. Ausgangslage

- [x] Baseline `main`: `d5d7022816e3c164f641a39ccd9b05a5722d0db2`
- [x] eigener Branch: `feature/0.3.0-d3a-keyboard-resize-preview`
- [x] D1-State-API vorhanden: `panelGroesseSetzen`, `panelGroesseZuruecksetzen`
- [x] D1-Größenberechnung vorhanden
- [x] D2-DOM-Anwendung über `--panel-spalten` und `--panel-hoehe` vorhanden
- [x] Desktopdarstellung ab 981 px vorhanden
- [x] Workspace-Vertrag bleibt Version `1`
- [x] Speicher-Schlüssel bleibt `provoware.allin.workspace.main.v1`
- [x] Produktversion bleibt bis Release-Gate `0.2.0`

---

# 2. Hauptziel

Verbindliche Bedienkette:

```text
Resize-Griff -> Tastaturcontroller -> transiente Vorschau -> Workspace-State -> Workspace-UI
```

Dabei gilt:

1. `keydown` verändert nur die Vorschau.
2. wiederholtes `keydown` speichert nichts.
3. letzter zugehöriger `keyup` führt höchstens einen Commit aus.
4. `Escape` verwirft eine laufende Vorschau vollständig.
5. `Home` setzt nur die Größe des aktuellen Panels auf Standard zurück.
6. Responsive Ansichten bis 980 px verändern keine gespeicherten Desktopwerte.

---

# 3. Änderungsgrenze

## Enthalten

- [ ] `assets/workspace-resize.js` als neue entkoppelte Eingabeschicht
- [ ] genau ein dynamisch erzeugter Resize-Griff pro Workspace-Panel
- [ ] verständliche deutsche `aria-label`-Beschriftung
- [ ] Tastaturhilfe über `aria-keyshortcuts` und kurze Beschreibung
- [ ] Pfeiltasten: links/rechts je 1 Rastereinheit
- [ ] Pfeiltasten: hoch/runter je 24 px
- [ ] bei automatischer Höhe Start von der real gerenderten Panelhöhe
- [ ] Vorschau ohne State-/Speicheränderung
- [ ] Commit erst nach Ende der Tastenserie
- [ ] `Escape` als Abbruch ohne Persistenz
- [ ] `Home` als isolierter Einzel-Reset
- [ ] sichtbares Nutzerfeedback über vorhandene Workspace-UI
- [ ] zusammenfassendes WORKSPACE-Logging nur bei Abschluss/Fehler
- [ ] Resize-Griffe nur ab 981 px sichtbar und bedienbar
- [ ] automatische Tests für Griff, Tastatur, Wiederholung, Commit, Abbruch, Reset und Responsive-Sperre
- [ ] D3a-Patchmanifest, TODO, Status, Changelog, Manifest und Versionsmetadaten

## Ausdrücklich nicht enthalten

- [x] keine Pointer Events
- [x] kein `pointerdown`, `pointermove`, `pointerup`
- [x] kein Pointer Capture
- [x] keine Maus-/Touch-/Stift-Ziehbewegung
- [x] kein Drag & Drop
- [x] keine neue persistente State-Struktur
- [x] kein neuer Browser-Speicherschlüssel
- [x] keine neue Bibliothek
- [x] keine Änderung am Modulvertrag

---

# 4. Verantwortlichkeiten

## `assets/workspace-state.js`

Bleibt unverändert und alleinige persistente Quelle.

## `assets/workspace-size.js`

Bleibt unverändert. D3a benötigt für die diskreten Tastaturschritte keine neue Pixelbewegungslogik. D3b verwendet später die vorhandene Bewegungsberechnung.

## `assets/workspace-ui.js`

Erhält nur eine kleine wiederverwendbare DOM-Hilfe für transiente Größenwerte, damit der Resize-Controller die CSS-Variablen nicht selbst dupliziert.

Vorgesehene Schnittstelle:

```text
panelGroesseVorschauAnwenden(id, { widthUnits, heightPx })
```

Ein Rückweg erfolgt durch erneutes `zustandAnwenden(workspace.statusLesen())`.

## `assets/workspace-resize.js`

Verantwortlich für:

- Griffe erzeugen und Ereignisse binden
- aktiven Tastatur-Vorschauzustand verwalten
- Paneldefinition lesen
- gerenderte Höhe bei `heightPx: null` messen
- diskrete Tastaturschritte begrenzen
- Commit/Abbruch koordinieren
- Nutzerfeedback und Logging auslösen

Die Datei schreibt niemals direkt in `localStorage`.

---

# 5. Tastaturvertrag

## Pfeile

- `ArrowLeft`: Breite −1
- `ArrowRight`: Breite +1
- `ArrowUp`: Höhe −24 px
- `ArrowDown`: Höhe +24 px

Grenzen stammen ausschließlich aus `workspace.PANEL_DEFINITIONEN`.

## Tastenwiederholung

Der Controller führt einen flüchtigen Sitzungsspeicher:

```text
panelId
previewWidthUnits
previewHeightPx
aktiveTasten
active
```

Wiederholte `keydown`-Ereignisse verändern nur diese Vorschau.

Erst wenn nach `keyup` keine Resize-Pfeiltaste mehr aktiv ist:

1. genau ein Aufruf `panelGroesseSetzen`
2. gespeicherten Zustand via UI anwenden
3. Vorschauzustand löschen
4. Nutzerfeedback anzeigen
5. eine Diagnosemeldung schreiben

## Escape

- aktive Vorschau löschen
- gespeicherten Zustand wieder anwenden
- keine State-API zur Größenänderung aufrufen
- Nutzerfeedback: vorherige Größe bleibt erhalten

## Home

- aktive Vorschau zuerst verwerfen
- `panelGroesseZuruecksetzen(id)` genau einmal aufrufen
- gespeicherten Zustand anwenden
- verständliches Feedback anzeigen

---

# 6. Responsive Verhalten

Desktopbedingung:

```text
(min-width: 981px)
```

Bis 980 px:

- Griff per CSS nicht sichtbar
- Tastaturcontroller lehnt Resize-Aktionen zusätzlich logisch ab
- laufende Tastaturvorschau wird bei Wechsel in kleine Ansicht verworfen
- Workspace-State bleibt unverändert

Die logische Sperre verhindert, dass eine nur per CSS versteckte Bedienung durch synthetische Ereignisse versehentlich Desktopwerte verändert.

---

# 7. Sichtbarkeit und Zugänglichkeit

Jeder sichtbare Griff:

- ist ein echtes `button`-Element
- ist per Tabulator erreichbar
- besitzt ungefähr 44 × 44 px Trefferfläche
- liegt unten rechts
- trägt `data-workspace-resize-handle="<panel-id>"`
- hat eine verständliche deutsche Beschriftung
- erhält `aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home Escape"`
- darf keine zukünftige Drag-Funktion imitieren

Der Griff wird dynamisch erzeugt. Dadurch bleibt die HTML-Basis ohne JavaScript frei von funktionslosen Resize-Schaltern.

---

# 8. Nutzerfeedback

Während Vorschau:

```text
Arbeitsbereich Vorschau: 9/12 breit, 456 px hoch.
```

Nach Commit:

```text
Arbeitsbereich auf 9/12 und 456 px gesetzt.
```

Bei automatischer Höhe nach Reset:

```text
Arbeitsbereich auf Standardgröße zurückgesetzt.
```

Bei Escape:

```text
Größenänderung abgebrochen. Vorherige Größe bleibt erhalten.
```

Keine Statusmeldung pro internem Nebenschritt außerhalb einer echten Nutzeraktion.

---

# 9. Fehlerregeln

- unbekannte Panel-ID → keine Änderung, Stufe-1-Log
- fehlende Workspace-/UI-API → Controller nicht initialisieren
- ungültige gerenderte Höhe → Höhenaktion abbrechen, bisherigen Zustand anwenden
- Fehler beim Commit → gespeicherten Zustand erneut anwenden und verständlich melden
- keine Endlosschleife und kein stilles Verschlucken von Fehlern

---

# 10. Automatische Testmatrix D3a

## Griff

- [ ] genau fünf Griffe werden erzeugt
- [ ] jeder Griff besitzt korrekte Panel-ID
- [ ] jeder Griff ist ein Button
- [ ] jeder Griff besitzt Tastaturhinweise
- [ ] erneute Initialisierung erzeugt keine doppelten Griffe

## Breite

- [ ] ArrowRight erzeugt Vorschau +1
- [ ] ArrowLeft erzeugt Vorschau −1
- [ ] Mindestbreite wird eingehalten
- [ ] Höchstbreite wird eingehalten
- [ ] wiederholtes Keydown speichert nicht
- [ ] Keyup erzeugt genau einen Commit

## Höhe

- [ ] ArrowDown erhöht um 24 px
- [ ] ArrowUp verringert um 24 px
- [ ] bei `heightPx: null` wird gerenderte Höhe als Start verwendet
- [ ] Mindesthöhe wird eingehalten
- [ ] Höchsthöhe wird eingehalten

## Abbruch/Reset

- [ ] Escape verwirft Vorschau ohne Commit
- [ ] Home setzt nur aktuelles Panel zurück
- [ ] Sichtbarkeit und Reihenfolge bleiben erhalten

## Responsive

- [ ] bis 980 px werden Tastaturaktionen ignoriert
- [ ] Wechsel auf kleinen Viewport bricht aktive Vorschau ab
- [ ] gespeicherter Desktopzustand bleibt unverändert

## Regression

- [ ] vorhandene Visibility-Steuerung bleibt grün
- [ ] D1-Größen-State-Tests bleiben grün
- [ ] D1-Größenberechnung bleibt grün
- [ ] D2-CSS-Variablenvertrag bleibt grün
- [ ] `npm run verify` vollständig grün

---

# 11. Erwartetes Änderungsvolumen

Einstufung: **mittel**.

Voraussichtlich betroffen:

- `assets/workspace-resize.js` neu
- `assets/workspace-ui.js` kleine Vorschau-Schnittstelle
- `assets/workspace-layout.css` Griffdarstellung und aktiver Vorschauzustand
- `assets/app.js` Initialisierung
- `index.html` Script-Ladereihenfolge
- `tests/workspace-resize.test.mjs` neu
- `tests/workspace-ui.test.mjs` nur falls Vorschau-API separat geprüft werden muss
- `scripts/quality-check.mjs` nur falls die neue Pflichtdatei/Ladereihenfolge noch nicht automatisch abgedeckt ist
- `TODO.md`
- `CHANGELOG.md`
- `MANIFEST.md`
- `VERSION.json`
- `docs/STATUS_0.3.0.md`
- `docs/MANIFEST_0.3.0_D3A_KEYBOARD.md` neu

Nicht vorgesehen:

- `assets/workspace-state.js`
- `assets/workspace-size.js`
- Moduldateien
- Netzwerkcode

---

# 12. Abnahmekriterien

D3a ist erst abgeschlossen, wenn:

- [ ] Tastatur-Resize ab 981 px vollständig funktioniert
- [ ] Vorschau während `keydown` keine persistente Änderung auslöst
- [ ] `keyup` eine Tastenserie mit höchstens einem Commit abschließt
- [ ] Escape ohne Persistenz zurückkehrt
- [ ] Home nur das aktuelle Panel zurücksetzt
- [ ] Griffe zugänglich und ungefähr 44 × 44 px bedienbar sind
- [ ] kein Pointer-Code im Patch enthalten ist
- [ ] keine neue Abhängigkeit entstanden ist
- [ ] `npm run verify` vollständig grün ist
- [ ] Branch beim finalen Diff-Check 0 Commits hinter `main` ist
- [ ] PR mergebar ist
- [ ] zentrale Dateien nach Merge auf `main` erneut gelesen wurden

---

# 13. Rückweg

D3a bleibt ein eigener Pull Request. Ein Revert entfernt ausschließlich Griff, Tastaturcontroller, transiente Vorschau und zugehörige Tests/Dokumentation.

D1-State, D1-Berechnung und D2-Darstellung bleiben vollständig erhalten. Keine Datenmigration ist zurückzunehmen.

---

# 14. Nächste zwei Schritte

## Nächster Schritt

**0.3.0-D3b – Pointer/Maus/Touch/Stift**

Auf derselben Vorschau-/Commit-Architektur:

- `pointerdown`
- Pointer Capture
- `pointermove` nur Vorschau
- `pointerup` genau ein Commit
- `pointercancel` ohne Persistenz
- reale Grid-Metrik aus D1-Berechnung

## Danach

**0.3.0-E – Reorder & Drag and Drop**

Erst nach vollständiger grüner D3a-/D3b-Abnahme. Resize-Griff und Drag-Griff bleiben getrennte Mechaniken.
