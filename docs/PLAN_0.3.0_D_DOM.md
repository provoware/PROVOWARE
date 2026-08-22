# Teilplan 0.3.0-D2 – DOM-Anwendung gespeicherter Größen

## Ziel in einfacher Sprache

Dieser Patch macht bereits gespeicherte Panelgrößen erstmals sichtbar, ohne eine neue Bedienmöglichkeit einzuführen.

Die zentrale Zustandsverwaltung liefert weiterhin `widthUnits` und `heightPx`. `assets/workspace-ui.js` überträgt diese gültigen Werte ausschließlich in zwei CSS-Variablen. `assets/styles.css` entscheidet daraus über die tatsächliche Darstellung und über responsive Rückfallregeln.

Noch **nichts wird mit Maus, Touch, Stift oder Tastatur vergrößert oder verkleinert**. Die sichtbare Resize-Bedienung bleibt vollständig für D3 gesperrt.

## Begriffe vorab

- **CSS-Variable:** zentraler benannter Darstellungswert im Stylesheet, hier für Panelbreite und Panelhöhe.
- **DOM (Dokumentstruktur):** die im Browser vorhandenen HTML-Elemente.
- **Inline-CSS-Variable:** ein CSS-Wert, den JavaScript direkt am betreffenden Element hinterlegt, ohne dort die eigentliche Darstellungsregel zu definieren.
- **Responsive Rückfallregel:** Darstellung für kleinere Bildschirme, die Desktopwerte nur optisch übersteuert und nicht in den gespeicherten Zustand zurückschreibt.
- **Single Source of Truth (eine verbindliche Quelle):** Größenwerte bleiben ausschließlich im Workspace-State gespeichert; CSS und DOM speichern keine zweite fachliche Wahrheit.

---

# 1. Ausgangsstand

- [x] aktueller `main`-Commit vor Patch bestätigt: `5542f90edb6b2079ef4e55f5e217f3b0e05422c4`
- [x] eigener Branch direkt von diesem Stand erstellt: `feature/0.3.0-d2-dom-size-application`
- [x] D1 mit State-API und reiner Größenberechnung ist vollständig gemergt
- [x] freigegebene Produktversion bleibt `0.2.0`
- [x] Workspace-Vertrag bleibt Version `1`
- [x] Speicher-Schlüssel bleibt `provoware.allin.workspace.main.v1`
- [x] Option A bestätigt: CSS-Variablen statt direkter `grid-column`-/`height`-Logik in JavaScript

---

# 2. Hauptziel

Gespeicherte Größenwerte aus dem normalisierten Workspace-Zustand zentral und reproduzierbar darstellen.

Verbindliche Kette:

```text
Workspace-State -> workspace-ui.js -> CSS-Variablen -> styles.css -> sichtbares Panel
```

Es entsteht **keine zweite Größenberechnung** und **keine zweite Persistenzschicht**.

---

# 3. Änderungsgrenze

## Enthalten

- [ ] `workspace-ui.js` überträgt `widthUnits` in `--panel-spalten`
- [ ] `workspace-ui.js` überträgt eine konkrete `heightPx` in `--panel-hoehe`
- [ ] `heightPx: null` entfernt die Inline-Höhenvariable und stellt damit automatische Höhe wieder her
- [ ] `styles.css` verwendet die Variablen zentral für Desktopdarstellung
- [ ] vorhandene Standardklassen bleiben als sichere Fallbacks ohne JavaScript funktionsfähig
- [ ] Tablet bis 980 px ignoriert gespeicherte Desktopgröße nur visuell
- [ ] Mobil bis 680 px bleibt vollbreit und inhaltsgerecht hoch
- [ ] State wird durch die Darstellung niemals verändert
- [ ] automatische Tests für Breite, Höhe, Rückkehr zu `auto` und responsive CSS-Regeln
- [ ] Dokumentation und Entwicklungsmetadaten auf den realen D2-Stand aktualisieren

## Ausdrücklich nicht enthalten

- [x] keine neue State-API
- [x] keine Änderung des Persistenzschemas
- [x] keine Änderung des Speicher-Schlüssels
- [x] keine Resize-Griffe
- [x] keine Pointer Events
- [x] keine Touch-/Stiftlogik
- [x] keine Resize-Tastatursteuerung
- [x] keine transiente Vorschau
- [x] kein Drag & Drop
- [x] keine neue Bibliothek
- [x] keine Änderung an Modulvertrag oder Modul-Registry

---

# 4. Technischer Vertrag

## 4.1 Breite

JavaScript setzt ausschließlich:

```text
--panel-spalten: <gültige widthUnits>
```

CSS entscheidet:

```text
grid-column: span var(--panel-spalten, <sicherer Standard>)
```

Die eigentlichen Min-/Max-Grenzen bleiben weiterhin ausschließlich in `PANEL_DEFINITIONEN` und der Workspace-Normalisierung.

## 4.2 Höhe

Bei einer gespeicherten Pixelhöhe setzt JavaScript:

```text
--panel-hoehe: <heightPx>px
```

Bei `heightPx: null` wird die Inline-Variable entfernt. CSS fällt dadurch auf automatische Höhe zurück.

JavaScript setzt **nicht** direkt `height`, `min-height` oder `grid-column`.

## 4.3 Responsive Verhalten

### Desktop ab 981 px

- gespeicherte `--panel-spalten` werden sichtbar verwendet
- gespeicherte `--panel-hoehe` wird sichtbar verwendet
- `null` bleibt automatische Höhe

### Tablet bis 980 px

- bestehende 6-/12-Spalten-Rückfallregeln bleiben maßgeblich
- Höhe wird visuell auf `auto` zurückgeführt
- gespeicherte Desktopwerte bleiben unverändert im State

### Mobil bis 680 px

- alle Panels bleiben vollbreit
- Höhe bleibt `auto`
- Desktopwerte bleiben unverändert gespeichert

---

# 5. Implementierungsreihenfolge

## 5.1 `assets/workspace-ui.js`

- [ ] kleine Hilfsfunktion für die Größenübertragung ergänzen
- [ ] nur ganzzahlige positive Breitenwerte auf CSS übertragen
- [ ] nur ganzzahlige positive Höhenwerte auf CSS übertragen
- [ ] ungültige Darstellungswerte defensiv durch Entfernen der betreffenden CSS-Variable behandeln
- [ ] `heightPx: null` ausdrücklich als automatische Höhe behandeln
- [ ] Größenübertragung in den bestehenden zentralen `zustandAnwenden`-Pfad integrieren
- [ ] Sichtbarkeitslogik unverändert erhalten
- [ ] keine Speicherung aus `workspace-ui.js` hinzufügen

## 5.2 `assets/styles.css`

- [ ] `.panel` auf zentrale CSS-Variablen umstellen
- [ ] Standardbreite 4 Spalten ohne JavaScript erhalten
- [ ] `.panel-wide` mit Fallback 12 Spalten erhalten
- [ ] `.panel-feature` mit Fallback 8 Spalten erhalten
- [ ] Standardhöhe über CSS weiterhin automatisch lassen
- [ ] bestehende `min-height`-Regeln erhalten
- [ ] Tablet-Regeln mit `height: auto` absichern
- [ ] Mobilregeln mit `height: auto` absichern
- [ ] keine neue visuelle Resize-Bedienung ergänzen

---

# 6. Automatische Tests

## 6.1 DOM-Anwendung

- [ ] gespeicherte Breite wird als `--panel-spalten` gesetzt
- [ ] gespeicherte Höhe wird als `--panel-hoehe` mit `px` gesetzt
- [ ] `heightPx: null` hinterlässt keine Inline-Höhenvariable
- [ ] Wechsel von konkreter Höhe zurück zu `null` entfernt einen alten Inline-Wert
- [ ] Größenübertragung verändert Sichtbarkeit nicht
- [ ] Größenübertragung verändert Workspace-State nicht

## 6.2 CSS-Vertrag

- [ ] zentrale Desktopregel verwendet `--panel-spalten`
- [ ] zentrale Desktopregel verwendet `--panel-hoehe`
- [ ] Fallbackbreiten 4/8/12 bleiben vorhanden
- [ ] Tabletregel übersteuert Höhe mit `auto`
- [ ] Mobilregel bleibt vollbreit und Höhe `auto`
- [ ] keine Resize-Griff- oder Pointer-Regel wird vorgezogen

---

# 7. Risiken und Schutzmaßnahmen

## Risiko: CSS und JavaScript definieren dieselbe Größenlogik doppelt

Schutz: JavaScript überträgt nur Werte. CSS besitzt ausschließlich die Darstellungsregel. Grenzen bleiben im State.

## Risiko: `heightPx: null` hinterlässt eine alte feste Höhe

Schutz: Die Inline-CSS-Variable wird bei `null` ausdrücklich entfernt und automatisch getestet.

## Risiko: gespeicherte Desktopwerte verformen Tablet/Mobil

Schutz: Responsive CSS-Regeln setzen Darstellung auf die bereits festgelegten Tablet-/Mobil-Fallbacks zurück, ohne State zu schreiben.

## Risiko: bestehende Standardklassen funktionieren ohne JavaScript nicht mehr

Schutz: 4/8/12-Spalten-Fallbacks bleiben direkt im CSS erhalten.

## Risiko: D2 zieht bereits Eingabelogik aus D3 vor

Schutz: Keine neuen Event-Listener, Griffe, Pointer- oder Tastaturereignisse in diesem Patch.

---

# 8. Erwartetes Änderungsvolumen

Einstufung: **klein bis mittel**.

Voraussichtlich direkt betroffen:

- `assets/workspace-ui.js`
- `assets/styles.css`
- `tests/workspace-ui.test.mjs`
- eventuell eine kleine zusätzliche CSS-Vertragsprüfung innerhalb der bestehenden Tests
- `TODO.md`
- `CHANGELOG.md`
- `MANIFEST.md`
- `VERSION.json`
- `docs/STATUS_0.3.0.md`
- dieses Teilplandokument
- D2-Patchmanifest

Nicht vorgesehen:

- `index.html`
- `assets/workspace-state.js`
- `assets/workspace-size.js`
- Moduldateien
- Netzwerkcode

---

# 9. Abnahmekriterien

D2 ist erst abgeschlossen, wenn:

- [ ] gespeicherte Desktopbreiten sichtbar über CSS-Variablen angewendet werden
- [ ] gespeicherte Pixelhöhen sichtbar über CSS-Variablen angewendet werden
- [ ] `heightPx: null` zuverlässig automatische Höhe ergibt
- [ ] Tablet/Mobil gespeicherte Desktopwerte nicht zurückschreibt
- [ ] die bestehende Sichtbarkeitssteuerung unverändert funktioniert
- [ ] keine Resize-Eingabemechanik hinzugekommen ist
- [ ] `npm run verify` vollständig grün ist
- [ ] Branch beim finalen Diff-Check 0 Commits hinter `main` ist
- [ ] PR mergebar ist
- [ ] zentrale Dateien nach Merge erneut auf `main` gelesen wurden

---

# 10. Rückweg

D2 bleibt ein eigener Pull Request. Ein Revert entfernt ausschließlich die DOM-/CSS-Darstellung der gespeicherten Größen.

D1-State und D1-Berechnungslogik bleiben dabei vollständig erhalten. Es gibt keine Datenmigration und keinen neuen Speicher-Schlüssel.

---

# 11. Nächste zwei Schritte

## Nächster Schritt nach D2

**0.3.0-D3 – Resize-Griff + Eingabe**

Erst auf der geprüften D1-/D2-Basis:

- genau ein Griff pro sichtbarem Panel
- Pointer Events für Maus, Touch und Stift
- derselbe Griff per Tastatur
- transiente Vorschau ohne Speicherung während der Bewegung
- genau ein Commit am validierten Ende
- Abbruch ohne Zustandsverlust

## Danach

**0.3.0-E – Reorder & Drag and Drop**

Neuordnung bleibt gesperrt, bis die vollständige Resize-Stufe D grün abgenommen ist.

## Empfehlung

Option A konsequent beibehalten: JavaScript setzt nur `--panel-spalten` und `--panel-hoehe`; CSS bleibt allein für Darstellung und responsive Abweichungen zuständig. Dadurch kann D3 später Werte ändern, ohne Darstellungslogik zu duplizieren.
