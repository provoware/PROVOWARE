# Teilplan 0.3.0-D2 – DOM-Anwendung gespeicherter Größen

## Ziel in einfacher Sprache

Dieser Patch macht bereits gespeicherte Panelgrößen sichtbar, ohne eine neue Bedienmöglichkeit einzuführen.

Die zentrale Zustandsverwaltung liefert weiterhin `widthUnits` und `heightPx`. `assets/workspace-ui.js` überträgt diese gültigen Werte ausschließlich in zwei CSS-Variablen. Die kleine Datei `assets/workspace-layout.css` entscheidet daraus über die Desktopdarstellung. Die bereits bewährten Tablet-/Mobilregeln in `assets/styles.css` bleiben unangetastet.

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
- [x] D1 mit State-API und reiner Größenberechnung vollständig gemergt
- [x] freigegebene Produktversion bei `0.2.0` belassen
- [x] Workspace-Vertrag Version `1` unverändert gelassen
- [x] Speicher-Schlüssel `provoware.allin.workspace.main.v1` unverändert gelassen
- [x] Option A bestätigt: CSS-Variablen statt direkter `grid-column`-/`height`-Logik in JavaScript
- [x] Precheck optimiert die Änderungsgrenze: isoliertes Desktop-Overlay statt Umbau der großen `assets/styles.css`

---

# 2. Hauptziel

Gespeicherte Größenwerte aus dem normalisierten Workspace-Zustand zentral und reproduzierbar darstellen.

Verbindliche Kette:

```text
Workspace-State -> workspace-ui.js -> CSS-Variablen -> workspace-layout.css -> sichtbares Panel
```

Ergebnis:

- [x] keine zweite Größenberechnung entstanden
- [x] keine zweite Persistenzschicht entstanden
- [x] JavaScript überträgt nur Werte
- [x] CSS entscheidet über die Darstellung

---

# 3. Änderungsgrenze

## Enthalten und umgesetzt

- [x] `workspace-ui.js` überträgt `widthUnits` in `--panel-spalten`
- [x] `workspace-ui.js` überträgt eine konkrete `heightPx` in `--panel-hoehe`
- [x] `heightPx: null` entfernt die Inline-Höhenvariable und stellt automatische Höhe wieder her
- [x] `assets/workspace-layout.css` verwendet die Variablen ausschließlich ab 981 px
- [x] vorhandene 4/8/12-Standardklassen aus `assets/styles.css` bleiben sichere Fallbacks ohne JavaScript
- [x] Tablet bis 980 px verwendet unverändert die bestehende responsive Basis-CSS
- [x] Mobil bis 680 px bleibt unverändert vollbreit und inhaltsgerecht hoch
- [x] `index.html` lädt das lokale Workspace-Overlay direkt nach der Basis-CSS
- [x] State wird durch die Darstellung nicht verändert
- [x] automatische Tests für Breite, Höhe, Rückkehr zu `auto`, Stylesheet-Vertrag und Ladeposition ergänzt
- [x] Dokumentation und Entwicklungsmetadaten auf den realen D2-Stand aktualisiert

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

Die eigentlichen Min-/Max-Grenzen bleiben ausschließlich in `PANEL_DEFINITIONEN` und der Workspace-Normalisierung.

Falls keine gültige Breite übertragen wurde, wird `data-workspace-size-ready` entfernt. Dadurch greift das Overlay nicht und die vorhandene Basisdarstellung bleibt zuständig.

## 4.2 Höhe

Bei einer gespeicherten Pixelhöhe setzt JavaScript:

```text
--panel-hoehe: <heightPx>px
```

Bei `heightPx: null` wird die Inline-Variable entfernt. Das Desktop-Overlay fällt über `var(--panel-hoehe, auto)` auf automatische Höhe zurück.

JavaScript setzt **nicht** direkt `height`, `min-height` oder `grid-column`.

## 4.3 Responsive Verhalten

### Desktop ab 981 px

- [x] `assets/workspace-layout.css` aktiv
- [x] gespeicherte `--panel-spalten` sichtbar verwendet
- [x] gespeicherte `--panel-hoehe` sichtbar verwendet
- [x] `heightPx: null` bleibt automatische Höhe

### Tablet bis 980 px

- [x] neues Overlay nicht aktiv
- [x] bestehende 6-/12-Spalten-Rückfallregeln aus `assets/styles.css` bleiben maßgeblich
- [x] gespeicherte Desktopwerte bleiben unverändert im State

### Mobil bis 680 px

- [x] bestehende Basis-CSS allein maßgeblich
- [x] Panels weiterhin vollbreit
- [x] Höhe weiterhin inhaltsgerecht
- [x] Desktopwerte bleiben unverändert gespeichert

---

# 5. Implementierung

## 5.1 `assets/workspace-ui.js`

- [x] kleine Hilfsfunktion `panelGroesseAnwenden` ergänzt
- [x] nur positive ganzzahlige Breitenwerte auf CSS übertragen
- [x] nur positive ganzzahlige Höhenwerte auf CSS übertragen
- [x] ungültige Darstellungswerte defensiv durch Entfernen der betreffenden CSS-Variable behandeln
- [x] `heightPx: null` ausdrücklich als automatische Höhe behandeln
- [x] Größenübertragung in den bestehenden zentralen `zustandAnwenden`-Pfad integriert
- [x] Sichtbarkeitslogik unverändert erhalten
- [x] keine Speicherung aus `workspace-ui.js` hinzugefügt

## 5.2 `assets/workspace-layout.css`

- [x] neue kleine CSS-Datei ausschließlich für den Größen-Darstellungsvertrag angelegt
- [x] Regel ausschließlich unter `@media (min-width: 981px)` aktiviert
- [x] Breite ausschließlich aus `--panel-spalten` bezogen
- [x] Höhe aus `--panel-hoehe` mit Fallback `auto` bezogen
- [x] keine Min-/Max-Regeln dupliziert
- [x] keine Resize-Griffdarstellung vorgezogen
- [x] keine vorhandene Tablet-/Mobilregel überschrieben

## 5.3 `index.html`

- [x] `assets/workspace-layout.css` direkt nach `assets/styles.css` lokal geladen
- [x] Script-Reihenfolge unverändert gelassen
- [x] keine externe Ressource eingeführt

---

# 6. Automatische Tests

## 6.1 DOM-Anwendung

- [x] gespeicherte Breite wird als `--panel-spalten` gesetzt
- [x] gespeicherte Höhe wird als `--panel-hoehe` mit `px` gesetzt
- [x] `heightPx: null` hinterlässt keine Inline-Höhenvariable
- [x] Wechsel von konkreter Höhe zurück zu `null` entfernt einen alten Inline-Wert
- [x] Größenübertragung verändert Sichtbarkeit nicht
- [x] Größenübertragung verändert den übergebenen Workspace-Zustand nicht
- [x] ungültige Darstellungsbreite entfernt Variable und Bereitschaftsmarker

## 6.2 CSS-/Ladevertrag

- [x] Overlay auf Desktop `min-width: 981px` begrenzt
- [x] Overlay verwendet `--panel-spalten`
- [x] Overlay verwendet `--panel-hoehe` mit `auto`-Fallback
- [x] Overlay dupliziert keine 4/8/12-Panelgrenzen
- [x] `index.html` lädt Basis-CSS vor Workspace-Overlay
- [x] keine Resize-Griff-, Pointer- oder Drag-Regel vorgezogen

## 6.3 Vollständiges Quality Gate

- [x] `QUALITY GATE: OK`
- [x] `51` Dateien statisch geprüft
- [x] `36/36` automatische Tests erfolgreich
- [x] `0` Tests fehlgeschlagen
- [x] Projektprüfung mit Node `20.20.2`
- [x] bestehende Modul-, State-, Größenberechnungs-, UI- und Quality-Gate-Regressionstests weiterhin grün

---

# 7. Risiken und Schutzmaßnahmen

## Risiko: CSS und JavaScript definieren dieselbe Größenlogik doppelt

Schutz umgesetzt: JavaScript überträgt nur Werte. Das Overlay besitzt ausschließlich die Darstellungsregel. Grenzen bleiben im State.

## Risiko: `heightPx: null` hinterlässt eine alte feste Höhe

Schutz umgesetzt: Die Inline-CSS-Variable wird bei `null` ausdrücklich entfernt und automatisch getestet.

## Risiko: gespeicherte Desktopwerte verformen Tablet/Mobil

Schutz umgesetzt: Das neue Stylesheet ist ausschließlich ab 981 px aktiv. Unterhalb davon bleibt die bewährte Basis-CSS allein zuständig.

## Risiko: bestehende Standardklassen funktionieren ohne JavaScript nicht mehr

Schutz umgesetzt: `assets/styles.css` wurde nicht verändert. Ohne gültigen Bereitschaftsmarker bleibt die vorhandene Basisdarstellung bestehen.

## Risiko: zusätzlicher CSS-Dateizugriff wird vergessen

Schutz umgesetzt: `index.html` und automatische Tests prüfen die lokale Ladeposition; das bestehende Quality Gate kontrolliert lokale Asset-Verweise.

## Risiko: D2 zieht Eingabelogik aus D3 vor

Schutz umgesetzt: Keine neuen Event-Listener, Griffe, Pointer- oder Resize-Tastaturereignisse in D2.

---

# 8. Änderungsvolumen

Einstufung: **klein bis mittel**.

Technischer PR #76 änderte `11` Dateien.

Direkte Laufzeitänderungen:

- `assets/workspace-ui.js`
- neue `assets/workspace-layout.css`
- `index.html`

Tests und Dokumentation:

- `tests/workspace-ui.test.mjs`
- `TODO.md`
- `CHANGELOG.md`
- `MANIFEST.md`
- `VERSION.json`
- `docs/STATUS_0.3.0.md`
- `docs/PLAN_0.3.0_D_DOM.md`
- `docs/MANIFEST_0.3.0_D_DOM.md`

Bewusst nicht betroffen:

- `assets/styles.css`
- `assets/workspace-state.js`
- `assets/workspace-size.js`
- Moduldateien
- Netzwerkcode

---

# 9. Abschlussvalidierung

- [x] vollständigen Diff gegen aktuellen `main` geprüft
- [x] exakt `11` geplante Dateien im technischen PR
- [x] Branch beim finalen Diff-Check `0` Commits hinter `main`
- [x] `npm run verify` über GitHub Quality Gate erfolgreich
- [x] alle bestehenden Tests weiterhin erfolgreich
- [x] alle neuen D2-Tests erfolgreich
- [x] PR #76 mergebar
- [x] keine ungeplante Resize-Eingabelogik
- [x] technischen PR #76 per Squash gemergt
- [x] Merge-Commit `249df54ec13fa632f74400897dd3d83da3332bcb`
- [x] `index.html`, `assets/workspace-ui.js`, `assets/workspace-layout.css` und `VERSION.json` auf `main` erneut gelesen

Eine echte interaktive Firefox-/Chrome-Abnahme gehört nicht zu D2 und wurde noch nicht durchgeführt. Sie bleibt Bestandteil des Release Gates 0.3.0-G.

---

# 10. Rückweg

D2 ist ein eigener Pull Request. Ein Revert von PR #76 entfernt ausschließlich die DOM-/CSS-Darstellung der gespeicherten Größen und den lokalen Overlay-Verweis.

D1-State und D1-Berechnungslogik bleiben dabei vollständig erhalten. Es gibt keine Datenmigration und keinen neuen Speicher-Schlüssel.

---

# 11. Nächste zwei Schritte

## Nächster Schritt

**0.3.0-D3 – Resize-Griff + Eingabe**

Auf der geprüften D1-/D2-Basis:

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

Die erfolgreiche Trennung beibehalten: D3 darf die vorhandenen State-, Berechnungs- und CSS-Darstellungsschichten nur ansteuern und soll keine dieser Regeln erneut implementieren.
