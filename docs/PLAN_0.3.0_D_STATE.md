# Teilplan 0.3.0-D1 – State-API und reine Größenberechnung

## Ziel in einfacher Sprache

Dieser Patch baut ausschließlich die sichere technische Grundlage für spätere Größenänderungen.

Noch **nichts wird sichtbar ziehbar**. Stattdessen werden zuerst zwei Dinge zuverlässig gemacht:

1. der gespeicherte Workspace-Zustand kann eine Panelgröße kontrolliert setzen oder auf Standard zurückstellen,
2. eine reine Berechnung kann aus einer Bewegung eine gültige Rasterbreite und Höhe bestimmen.

Erst wenn diese Basis automatisch geprüft ist, darf ein späterer Patch sie an sichtbare Resize-Griffe anbinden.

## Begriffe vorab

- **State-API (Zustandsschnittstelle):** kleine, fest definierte Funktionen, über die Größenwerte im Workspace geändert werden.
- **Reine Funktion:** Berechnung ohne versteckte Nebenwirkung; sie verändert weder Oberfläche noch Speicher noch Logs.
- **Rastermetrik:** mathematische Beschreibung der 12 Spalten einschließlich Abstand zwischen den Spalten.
- **`column-gap`:** CSS-Abstand zwischen zwei Rasterspalten.
- **Normalisierung:** ein Wert außerhalb erlaubter Grenzen wird kontrolliert auf einen gültigen Wert gebracht.
- **Regression:** eine neue Änderung beschädigt bereits funktionierendes Verhalten.

---

# 1. Ausgangsstand

- [x] `main`-Commit vor Patch bestätigt: `a9b23b8d16e96142f35904a08315ca3f2f4495a0`
- [x] Branch direkt von diesem Stand erstellt: `feature/0.3.0-d-state-size-foundation`
- [x] die separat gemergte Designänderung PR #72 ist Teil der Baseline und wird nicht überschrieben
- [x] während der Umsetzung eingetroffenen PR #73 vor der finalen Abnahme kontrolliert übernommen
- [x] final mit `main` `887ff10363662935c385e1f7e965e0eb75be5918` synchronisiert
- [x] Workspace-Vertrag Version `1` bleibt unverändert
- [x] Persistenzschlüssel bleibt `provoware.allin.workspace.main.v1`
- [x] Resize-Vertrag `docs/RESIZE_CONTRACT_0.3.0.md` wurde als verbindliche Grundlage verwendet

---

# 2. Änderungsgrenze

## Enthalten

- [x] `panelGroesseSetzen`
- [x] `panelGroesseZuruecksetzen`
- [x] zentrale Panel-ID-Prüfung wiederverwenden
- [x] Größenwerte über bestehende Panelgrenzen normalisieren
- [x] Sichtbarkeit und Reihenfolge unverändert lassen
- [x] `heightPx: null` als automatische Höhe erhalten
- [x] reine Rastermetrik
- [x] reine Breitenberechnung
- [x] reine Höhenberechnung
- [x] kombinierte Größenberechnung
- [x] automatische State-Tests
- [x] automatische Berechnungstests
- [x] Dokumentation und Entwicklungsmetadaten

## Ausdrücklich nicht enthalten

- [x] keine Änderung an `index.html`
- [x] keine Änderung an `assets/styles.css`
- [x] keine DOM-Anwendung gespeicherter Größen
- [x] keine Resize-Griffe
- [x] keine Pointer Events
- [x] keine Touch-/Stiftlogik
- [x] keine Resize-Tastaturbedienung
- [x] keine transiente Browser-Vorschau
- [x] kein Drag & Drop
- [x] kein neues Persistenzfeld
- [x] keine neue externe Bibliothek

---

# 3. State-API

## 3.1 `panelGroesseSetzen(id, groesse)`

- [x] Panel-ID zuerst prüfen
- [x] Größenobjekt prüfen
- [x] nur übergebene Größenfelder verändern
- [x] Breite über vorhandene `mindestBreite`/`hoechstBreite` normalisieren
- [x] Höhe über vorhandene `mindestHoehe`/`hoechstHoehe` normalisieren
- [x] `null` als automatische Höhe zulassen
- [x] Sichtbarkeit unverändert lassen
- [x] Reihenfolge unverändert lassen
- [x] unveränderten Zielzustand ohne unnötige erneute Speicherung zurückgeben
- [x] Speicherung weiterhin ausschließlich über die vorhandene Workspace-State-Schicht durchführen

## 3.2 `panelGroesseZuruecksetzen(id)`

- [x] dieselbe Panel-ID-Prüfung verwenden
- [x] Standardbreite aus `PANEL_DEFINITIONEN` verwenden
- [x] Standardhöhe aus `PANEL_DEFINITIONEN` verwenden
- [x] nur das ausgewählte Panel zurücksetzen
- [x] keine anderen Panels verändern

---

# 4. Reine Größenberechnung

Neue Datei:

`assets/workspace-size.js`

## 4.1 Grundregeln

- [x] keine DOM-Abfrage
- [x] kein `localStorage`
- [x] kein Logging
- [x] keine globale Workspace-Mutation
- [x] gleiche Eingabe liefert dasselbe Ergebnis
- [x] nur übergebene Messwerte und Grenzen verwenden

## 4.2 Rastermetrik

Die Berechnung erhält später die bereits gemessenen Werte:

- Containerbreite
- tatsächlichen Spaltenabstand
- Anzahl der Spalten

Berechnung:

```text
nutzbare Breite = Containerbreite - Summe aller Zwischenabstände
Spaltenbreite = nutzbare Breite / 12
Raster-Schritt = Spaltenbreite + column-gap
```

Checkliste:

- [x] 12 Spalten als Standard
- [x] tatsächlichen Spaltenabstand berücksichtigen
- [x] ungültige oder unmögliche Maße früh ablehnen
- [x] keinen festen Pixelwert für die Spaltenbreite erfinden

## 4.3 Breite aus Bewegung

- [x] Ausgangsbreite in Rastereinheiten verwenden
- [x] horizontale Bewegung durch realen Raster-Schritt teilen
- [x] symmetrisch auf ganze Schritte runden
- [x] negative und positive Bewegungen gleich behandeln
- [x] individuelle Mindestbreite einhalten
- [x] individuelle Höchstbreite einhalten

## 4.4 Höhe aus Bewegung

- [x] gerenderte Ausgangshöhe als Eingabe erlauben
- [x] Bewegung auf Schritte von `24 px` runden
- [x] Mindesthöhe einhalten
- [x] Höchstgrenze einhalten
- [x] Ergebnis als gültige ganze Pixelhöhe zurückgeben

---

# 5. Automatische Tests

## 5.1 Workspace-State

- [x] gültige Größenänderung wird gespeichert
- [x] Reihenfolge bleibt erhalten
- [x] Sichtbarkeit bleibt erhalten
- [x] Breiten-Minimum wird eingehalten
- [x] Breiten-Maximum wird eingehalten
- [x] Höhen-Minimum wird eingehalten
- [x] Höhen-Maximum wird eingehalten
- [x] `heightPx: null` bleibt gültig
- [x] nur Breite kann separat geändert werden
- [x] nur Höhe kann separat geändert werden
- [x] Einzel-Reset verändert nur das gewählte Panel
- [x] unbekannte Panel-ID verändert keinen gültigen Zustand

## 5.2 Größenberechnung

- [x] Rastermetrik berücksichtigt `column-gap`
- [x] positive halbe Rasterbewegung rundet kontrolliert auf
- [x] negative halbe Rasterbewegung rundet kontrolliert ab
- [x] Breitenminimum wird eingehalten
- [x] Breitenmaximum wird eingehalten
- [x] Höhe rastet in 24-px-Schritten
- [x] Höhenminimum wird eingehalten
- [x] Höhenmaximum wird eingehalten
- [x] kombinierte Berechnung ist deterministisch
- [x] ungültige Rastermetrik wird früh abgelehnt
- [x] nicht endliche Bewegung wird abgelehnt

---

# 6. Risiken und Schutz

## Risiko: Größenlogik wird doppelt implementiert

Schutz: Grenzen bleiben in `PANEL_DEFINITIONEN`; `workspace-size.js` erhält Grenzen nur als Eingabe und erfindet keine Panelregeln.

## Risiko: Berechnung greift zu früh auf DOM oder Speicher zu

Schutz: `workspace-size.js` ist absichtlich rein. DOM-Messung folgt erst im nächsten Patch.

## Risiko: aktuelles Erscheinungsbild wird überschrieben

Schutz: Der Branch startete nach PR #72; HTML und CSS wurden in diesem Patch nicht verändert.

## Risiko: paralleler `main`-Patch geht verloren

Schutz: PR #73 wurde vor Abschluss explizit in den Branch übernommen. Seine Quality-Gate-Härtung und Regressionstests liefen im finalen D1-Gate mit.

## Risiko: falscher Wert wird dauerhaft gespeichert

Schutz: die State-API führt Größenwerte erneut durch die vorhandene Normalisierung.

---

# 7. Änderungsvolumen

Einstufung: **klein bis mittel**.

Direkt betroffen:

- `assets/workspace-state.js`
- neue `assets/workspace-size.js`
- `tests/workspace-state.test.mjs`
- neue `tests/workspace-size.test.mjs`
- Entwicklungsdokumentation und Metadaten

Nicht betroffen:

- sichtbare UI
- CSS
- Fachmodule
- Netzwerk
- Modulvertrag
- Browser-Speicherschlüssel

---

# 8. Abschlussvalidierung

- [x] vollständigen Diff gegen aktuellen `main` geprüft: 11 geplante Dateien
- [x] Branch final 0 Commits hinter `main`
- [x] `npm run verify` im Pull Request erfolgreich
- [x] alle bestehenden Tests weiterhin erfolgreich
- [x] alle neuen State-/Berechnungstests erfolgreich
- [x] final `48` Dateien statisch geprüft
- [x] final `31/31` Tests erfolgreich, `0` fehlgeschlagen
- [x] PR #74 mergebar
- [x] keine ungeplanten HTML-/CSS-Änderungen
- [x] PR #74 per Squash gemergt
- [x] `assets/workspace-state.js`, `assets/workspace-size.js` und `VERSION.json` auf `main` erneut gelesen

Merge:

`1de0999cd570c612a80649cfe4975d8531947935`

### Behobener Testfehler

Der erste Lauf erkannte einen Fehlschlag beim strikten Objektvergleich über eine separate JavaScript-VM-Grenze. Die berechneten Inhalte waren korrekt. Nur der Testvergleich wurde normalisiert; die Produktlogik blieb unverändert. Der anschließende komplette Lauf war grün.

---

# 9. Rückweg

Bei einem Fehler kann der D1-Squash-Merge gezielt zurückgenommen werden:

`1de0999cd570c612a80649cfe4975d8531947935`

Der bereits stabile Stand 0.3.0-C und die separat gemergten Design-/Quality-Gate-Patches bleiben davon getrennt.

Es existiert keine Datenmigration und kein neuer Speicher-Schlüssel.

---

# 10. Nächste zwei Schritte

## Nächster Schritt

**0.3.0-D2 – DOM-Anwendung gespeicherter Größen**

- `widthUnits` zentral in die Grid-Breite übertragen
- `heightPx` zentral anwenden
- `heightPx: null` wieder als automatische Höhe darstellen
- responsive Desktopwerte auf Tablet/Mobil nur visuell begrenzen
- weiterhin noch kein Pointer-Resize

## Danach

**0.3.0-D3 – Resize-Griff + Pointer/Tastatur**

- ein Griff pro Panel
- Pointer Events für Maus/Touch/Stift
- Tastatur über denselben Griff
- Vorschau transient
- genau ein Commit am Ende
- Abbruch ohne Zustandsverlust

Erst nach vollständiger D-Abnahme folgt `0.3.0-E – Reorder & Drag and Drop`.
