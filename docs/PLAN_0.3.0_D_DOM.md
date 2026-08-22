# Teilplan 0.3.0-D2 – DOM-Anwendung gespeicherter Größen

## Ziel in einfacher Sprache

Dieser Patch macht bereits gespeicherte Panelgrößen erstmals sichtbar, ohne eine neue Bedienmöglichkeit einzuführen.

Die zentrale Zustandsverwaltung liefert weiterhin `widthUnits` und `heightPx`. `assets/workspace-ui.js` überträgt diese gültigen Werte ausschließlich in zwei CSS-Variablen. Eine kleine neue Datei `assets/workspace-layout.css` entscheidet daraus über die Desktopdarstellung. Die bereits bewährten Tablet-/Mobilregeln in `assets/styles.css` bleiben dadurch unangetastet.

Noch **nichts wird mit Maus, Touch, Stift oder Tastatur vergrößert oder verkleinert**. Die sichtbare Resize-Bedienung bleibt vollständig für D3 gesperrt.

## Begriffe vorab

- **CSS-Variable:** zentraler benannter Darstellungswert im Stylesheet, hier für Panelbreite und Panelhöhe.
- **DOM (Dokumentstruktur):** die im Browser vorhandenen HTML-Elemente.
- **Inline-CSS-Variable:** ein CSS-Wert, den JavaScript direkt am betreffenden Element hinterlegt, ohne dort die eigentliche Darstellungsregel zu definieren.
- **CSS-Overlay:** eine kleine zusätzliche Stylesheet-Datei, die nur einen klar abgegrenzten Darstellungsvertrag ergänzt und die große Basisdatei nicht umbaut.
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
- [x] Precheck optimiert die Änderungsgrenze: statt die große `assets/styles.css` umzubauen, wird ein isoliertes Desktop-Overlay verwendet

---

# 2. Hauptziel

Gespeicherte Größenwerte aus dem normalisierten Workspace-Zustand zentral und reproduzierbar darstellen.

Verbindliche Kette:

```text
Workspace-State -> workspace-ui.js -> CSS-Variablen -> workspace-layout.css -> sichtbares Panel
```

Es entsteht **keine zweite Größenberechnung** und **keine zweite Persistenzschicht**.

---

# 3. Änderungsgrenze

## Enthalten

- [ ] `workspace-ui.js` überträgt `widthUnits` in `--panel-spalten`
- [ ] `workspace-ui.js` überträgt eine konkrete `heightPx` in `--panel-hoehe`
- [ ] `heightPx: null` entfernt die Inline-Höhenvariable und stellt damit automatische Höhe wieder her
- [ ] neue `assets/workspace-layout.css` verwendet die Variablen ausschließlich ab 981 px
- [ ] vorhandene 4/8/12-Standardklassen aus `assets/styles.css` bleiben sichere Fallbacks ohne JavaScript
- [ ] Tablet bis 980 px verwendet unverändert die bestehende responsive Basis-CSS
- [ ] Mobil bis 680 px bleibt unverändert vollbreit und inhaltsgerecht hoch
- [ ] `index.html` lädt das lokale Workspace-Overlay direkt nach der Basis-CSS
- [ ] State wird durch die Darstellung niemals verändert
- [ ] automatische Tests für Breite, Höhe, Rückkehr zu `auto`, Stylesheet-Vertrag und Ladeposition
- [ ] Dokumentation und Entwicklungsmetadaten auf den realen D2-Stand aktualisieren

## Ausdrücklich nicht enthalten

- [x] keine neue State-API
- [x] keine Änderung des Persistenzschemas
- [x] keine Änderung des Speicher-Schlüssels
- [x] keine Änderung der bestehenden Basis-Styles in `assets/styles.css`
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

Das Desktop-Overlay entscheidet:

```text
grid-column: span var(--panel-spalten)
```

Die eigentlichen Min-/Max-Grenzen bleiben weiterhin ausschließlich in `PANEL_DEFINITIONEN` und der Workspace-Normalisierung.

Wenn JavaScript ausfällt oder keine gültige Variable vorhanden ist, ist die Overlay-Deklaration ungültig und die bereits vorhandene 4/8/12-Basisregel bleibt wirksam. Es wird deshalb kein zweiter Standardwert im Overlay dupliziert.

## 4.2 Höhe

Bei einer gespeicherten Pixelhöhe setzt JavaScript:

```text
--panel-hoehe: <heightPx>px
```

Bei `heightPx: null` wird die Inline-Variable entfernt. Das Desktop-Overlay fällt durch `var(--panel-hoehe, auto)` auf automatische Höhe zurück.

JavaScript setzt **nicht** direkt `height`, `min-height` oder `grid-column`.

## 4.3 Responsive Verhalten

### Desktop ab 981 px

- `assets/workspace-layout.css` ist aktiv
- gespeicherte `--panel-spalten` werden sichtbar verwendet
- gespeicherte `--panel-hoehe` wird sichtbar verwendet
- `null` bleibt automatische Höhe

### Tablet bis 980 px

- das neue Overlay enthält absichtlich keine aktive Regel
- bestehende 6-/12-Spalten-Rückfallregeln aus `assets/styles.css` bleiben maßgeblich
- bestehende inhaltsgerechte Höhen bleiben maßgeblich
- gespeicherte Desktopwerte bleiben unverändert im State

### Mobil bis 680 px

- bestehende Basis-CSS bleibt allein maßgeblich
- alle Panels bleiben vollbreit
- Höhe bleibt inhaltsgerecht
- Desktopwerte bleiben unverändert gespeichert

---

# 5. Implementierungsreihenfolge

## 5.1 `assets/workspace-ui.js`

- [x] kleine Hilfsfunktion für die Größenübertragung ergänzen
- [x] nur ganzzahlige positive Breitenwerte auf CSS übertragen
- [x] nur ganzzahlige positive Höhenwerte auf CSS übertragen
- [x] ungültige Darstellungswerte defensiv durch Entfernen der betreffenden CSS-Variable behandeln
- [x] `heightPx: null` ausdrücklich als automatische Höhe behandeln
- [x] Größenübertragung in den bestehenden zentralen `zustandAnwenden`-Pfad integrieren
- [x] Sichtbarkeitslogik unverändert erhalten
- [x] keine Speicherung aus `workspace-ui.js` hinzufügen

## 5.2 `assets/workspace-layout.css`

- [ ] neue kleine CSS-Datei ausschließlich für den Größen-Darstellungsvertrag anlegen
- [ ] Regel ausschließlich unter `@media (min-width: 981px)` aktivieren
- [ ] Breite ausschließlich aus `--panel-spalten` beziehen
- [ ] Höhe aus `--panel-hoehe` mit Fallback `auto` beziehen
- [ ] keine Min-/Max-Regeln duplizieren
- [ ] keine Resize-Griffdarstellung vorziehen
- [ ] keine vorhandene Tablet-/Mobilregel überschreiben

## 5.3 `index.html`

- [ ] `assets/workspace-layout.css` direkt nach `assets/styles.css` lokal laden
- [ ] keine Script-Reihenfolge ändern
- [ ] keine neue externe Ressource einführen

---

# 6. Automatische Tests

## 6.1 DOM-Anwendung

- [ ] gespeicherte Breite wird als `--panel-spalten` gesetzt
- [ ] gespeicherte Höhe wird als `--panel-hoehe` mit `px` gesetzt
- [ ] `heightPx: null` hinterlässt keine Inline-Höhenvariable
- [ ] Wechsel von konkreter Höhe zurück zu `null` entfernt einen alten Inline-Wert
- [ ] Größenübertragung verändert Sichtbarkeit nicht
- [ ] Größenübertragung verändert den übergebenen Workspace-Zustand nicht

## 6.2 CSS-/Ladevertrag

- [ ] Overlay ist auf Desktop `min-width: 981px` begrenzt
- [ ] Overlay verwendet `--panel-spalten`
- [ ] Overlay verwendet `--panel-hoehe` mit `auto`-Fallback
- [ ] Overlay enthält keine duplizierten 4/8/12-Panelgrenzen
- [ ] `index.html` lädt Basis-CSS vor Workspace-Overlay
- [ ] keine Resize-Griff- oder Pointer-Regel wird vorgezogen

---

# 7. Risiken und Schutzmaßnahmen

## Risiko: CSS und JavaScript definieren dieselbe Größenlogik doppelt

Schutz: JavaScript überträgt nur Werte. Das Overlay besitzt ausschließlich die Darstellungsregel. Grenzen bleiben im State.

## Risiko: `heightPx: null` hinterlässt eine alte feste Höhe

Schutz: Die Inline-CSS-Variable wird bei `null` ausdrücklich entfernt und automatisch getestet.

## Risiko: gespeicherte Desktopwerte verformen Tablet/Mobil

Schutz: Das neue Stylesheet ist ausschließlich ab 981 px aktiv. Unterhalb davon bleibt die bewährte Basis-CSS unverändert allein zuständig.

## Risiko: bestehende Standardklassen funktionieren ohne JavaScript nicht mehr

Schutz: `assets/styles.css` wird nicht verändert. Ohne gültige `--panel-spalten` bleibt die vorhandene 4/8/12-Basisdarstellung bestehen.

## Risiko: zusätzlicher CSS-Dateizugriff wird vergessen

Schutz: `index.html` und Tests prüfen die lokale Ladeposition; das bestehende Quality Gate kontrolliert lokale Asset-Verweise.

## Risiko: D2 zieht bereits Eingabelogik aus D3 vor

Schutz: Keine neuen Event-Listener, Griffe, Pointer- oder Tastaturereignisse in diesem Patch.

---

# 8. Erwartetes Änderungsvolumen

Einstufung: **klein bis mittel**.

Voraussichtlich direkt betroffen:

- `assets/workspace-ui.js`
- neue `assets/workspace-layout.css`
- `index.html`
- `tests/workspace-ui.test.mjs`
- `TODO.md`
- `CHANGELOG.md`
- `MANIFEST.md`
- `VERSION.json`
- `docs/STATUS_0.3.0.md`
- dieses Teilplandokument
- D2-Patchmanifest

Bewusst nicht betroffen:

- `assets/styles.css`
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
- [ ] Tablet/Mobil bleiben durch das Desktop-Overlay unverändert
- [ ] die bestehende Sichtbarkeitssteuerung unverändert funktioniert
- [ ] keine Resize-Eingabemechanik hinzugekommen ist
- [ ] `npm run verify` vollständig grün ist
- [ ] Branch beim finalen Diff-Check 0 Commits hinter `main` ist
- [ ] PR mergebar ist
- [ ] zentrale Dateien nach Merge erneut auf `main` gelesen wurden

---

# 10. Rückweg

D2 bleibt ein eigener Pull Request. Ein Revert entfernt ausschließlich die DOM-/CSS-Darstellung der gespeicherten Größen sowie den lokalen Overlay-Verweis.

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

Option A konsequent beibehalten: JavaScript setzt nur `--panel-spalten` und `--panel-hoehe`; das isolierte Desktop-CSS bleibt allein für die Darstellung zuständig. Die bereits getestete responsive Basis-CSS wird nicht umgebaut. Dadurch kann D3 später Werte ändern, ohne Darstellungslogik zu duplizieren.
