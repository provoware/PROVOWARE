# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

`0.3.0-A – Workspace-Vertrag`, `0.3.0-B – State Foundation & Autosave/Reset` und `0.3.0-C – Visibility Controls + kompakte Menüleiste` sind abgeschlossen.

Für `0.3.0-D – Resize` sind die Planungs-/Vertragsphase und der erste kleine technische Patch **D1 – State-API + reine Größenberechnung** abgeschlossen. Es gibt weiterhin **keine sichtbare Resize-Bedienung**. Der nächste Patch ist ausschließlich **D2 – DOM-Anwendung gespeicherter Größen**.

Die freigegebene Produktversion bleibt bis zur vollständigen Workspace-Abnahme korrekt bei `0.2.0`. `VERSION.json` weist die interne Entwicklungsphase transparent als `0.3.0-D Resize State & Calculation` aus.

## Erledigt bis 0.3.0-C

### 0.3.0-A – Vertrag

- Workspace-Vertrag Version 1 definiert.
- automatische lokale Speicherung und vollständiger Reset festgelegt.
- stabile Panel-IDs, Größen- und Sichtbarkeitsregeln festgelegt.
- PR #64 erfolgreich geprüft und gemergt.

### 0.3.0-B – Zustandsgrundlage

- zentrale Workspace-Zustandsverwaltung angelegt.
- Normalisierung, lokale Speicherung und isolierter Reset implementiert.
- beschädigte oder gesperrte Speicherung robust behandelt.
- automatische Zustands- und Fehlertests ergänzt.
- PR #66 erfolgreich geprüft und gemergt.

### 0.3.0-C – Sichtbarkeit und Schnellstarterleiste

- Mobile Option A umgesetzt: `Layout` bleibt fest sichtbar.
- kompakte Schnellstarter-/Menüleiste direkt unter dem oberen Bereich angelegt.
- permanenter `Layout`-Schalter außerhalb des Workspace integriert.
- alle fünf Kernpanels einzeln ein-/ausblendbar.
- alle fünf dürfen gleichzeitig ausgeblendet werden.
- `Alle anzeigen` und `Standardlayout wiederherstellen` bleiben erreichbar.
- Reihenfolge und Größenwerte bleiben beim Aus-/Einblenden erhalten.
- `assets/workspace-ui.js` trennt DOM/Bedienung von der persistierenden State-Schicht.
- technischer PR #68: Quality Gate `success`, 39 Dateien geprüft, 18/18 Tests erfolgreich.
- Squash-Merge: `dce166770cf589a8fb9720cb3c0a650c19151cd9`.

## 0.3.0-D – Planungs- und Vertragsabschluss

Bestätigte Option A:

- ein klarer Resize-Griff pro sichtbarem Panel
- Maus, Touch und Stift über gemeinsame Pointer Events
- derselbe Griff per Tastatur bedienbar
- Breite in Schritten von 1 Rastereinheit
- Höhe in Schritten von 24 px
- Pointer-/Tastaturbewegungen verändern nur eine transiente Vorschau
- Persistenz erst nach validiertem Abschluss
- `Home/Pos1` stellt nur das aktuelle Panel auf Standardbreite und automatische Höhe zurück
- Resize in dieser Stufe nur ab 981 px aktiv
- Tablet-/Mobilansichten überschreiben gespeicherte Desktopwerte nicht
- keine zweite vollständige Größensteuerung im Layout-Menü
- Drag & Drop bleibt bis 0.3.0-E gesperrt

Kanonische Dokumente:

- `docs/RESIZE_CONTRACT_0.3.0.md`
- `docs/PLAN_0.3.0_D.md`
- `docs/MANIFEST_0.3.0_D_PLAN.md`

Die Resize-Testmatrix enthält **40 klar benannte Prüfziele** für State, Berechnung, Pointer, Tastatur, Responsive Verhalten, Zugänglichkeit und Quality Gate.

## Reale Planungsabnahme

- Baseline: `e167226b7f2e1d80c2d16de9964a3a13d1efbfca`.
- Planungs-PR: `#70`.
- Branch vor Merge: `0` Commits hinter `main`.
- geänderte Dateien: `9`, ausschließlich Dokumentation/Entwicklungsmetadaten.
- PR war mergebar.
- GitHub Quality Gate: `success`.
- statische Projektprüfung: `42` Dateien erfolgreich geprüft.
- bestehende automatische Tests: `18/18` erfolgreich, `0` fehlgeschlagen.
- Node für das Projekt-Quality-Gate: `20.20.2`.
- Squash-Merge: `c41b958b6a1aa426cd427be4f633742b21e404d0`.
- Main-Stichprobe: `docs/RESIZE_CONTRACT_0.3.0.md`, `docs/PLAN_0.3.0_D.md` und `VERSION.json` erfolgreich gelesen.

## 0.3.0-D1 – State & Calculation Foundation

Technische Ausgangsbaseline:

`a9b23b8d16e96142f35904a08315ca3f2f4495a0`

Während der Arbeit wurde PR #73 zur Quality-Gate-Härtung parallel auf `main` gemergt. Der D1-Branch wurde deshalb vor der finalen Abnahme kontrolliert mit `main` `887ff10363662935c385e1f7e965e0eb75be5918` synchronisiert. Die parallele Härtung wurde erhalten.

Implementiert:

- `panelGroesseSetzen(id, groesse)` in `assets/workspace-state.js`
- `panelGroesseZuruecksetzen(id)` in `assets/workspace-state.js`
- gemeinsame Panel-ID-Prüfung für Sichtbarkeits- und Größenaktionen
- Erhalt von Reihenfolge und Sichtbarkeit bei Größenänderungen
- Größenbegrenzung über die kanonischen `PANEL_DEFINITIONEN`
- `heightPx: null` bleibt als automatische Höhe gültig
- neue reine Datei `assets/workspace-size.js`
- Rastermetrik aus Containerbreite, 12 Spalten und realem Spaltenabstand
- symmetrische Rundung der Horizontalbewegung auf Rastereinheiten
- Höhenberechnung in 24-px-Schritten
- reine kombinierte Größenberechnung ohne DOM, Speicherung oder Logging
- neue Tests `tests/workspace-size.test.mjs`
- erweiterte `tests/workspace-state.test.mjs` für Größen-State und Einzel-Reset

Bewusst nicht enthalten:

- keine Änderung an `index.html`
- keine Änderung an `assets/styles.css`
- keine sichtbaren Resize-Griffe
- keine DOM-Anwendung der gespeicherten Größen
- keine Pointer-/Touch-/Stiftsteuerung
- keine Resize-Tastatursteuerung
- keine Änderung am Browser-Speicherschlüssel
- keine neue Workspace-Vertragsversion
- kein Drag & Drop

## Reale D1-Abnahme

- technischer Pull Request: `#74`
- finaler Branch: `0` Commits hinter `main`
- geänderte Dateien im PR: `11`
- GitHub Quality Gate: `success`
- statische Projektprüfung: `48` Dateien erfolgreich geprüft
- automatische Tests: `31/31` erfolgreich, `0` fehlgeschlagen
- Projektprüfung: Node `20.20.2`
- paralleler Quality-Gate-Regressionstest aus PR #73 ebenfalls erfolgreich
- PR war mergebar
- Squash-Merge: `1de0999cd570c612a80649cfe4975d8531947935`
- Main-Stichprobe: `assets/workspace-state.js`, `assets/workspace-size.js` und `VERSION.json` erfolgreich gelesen

Der erste Testlauf meldete einen Fehler ausschließlich beim strikten Vergleich eines Objektwertes aus einer separaten JavaScript-VM. Die berechneten Werte waren bereits korrekt. Der Test wurde gezielt normalisiert; Produktlogik musste dafür nicht geändert werden. Der anschließende vollständige Lauf war grün.

## Änderungsvolumen D1

Einstufung: **klein bis mittel**.

Direkt betroffen:

- Workspace-State-API
- reine Größenberechnung
- automatische Tests
- Entwicklungsmetadaten und Dokumentation

Nicht betroffen:

- sichtbare Oberfläche
- CSS
- Fachmodule
- Netzwerk
- Modulvertrag
- persistentes Workspace-Schema

## Technischer Hinweis

GitHub Actions meldet weiterhin einen nicht blockierenden Hinweis zur auslaufenden internen Node-20-Laufzeit der verwendeten Actions `v4`. Das Projekt-Quality-Gate selbst lief erfolgreich mit Node `20.20.2`.

Diese Workflow-Hygiene bleibt von Funktionspatches getrennt und wird spätestens in `0.3.0-G` behandelt.

## Nächste zwei Schritte

1. **0.3.0-D2 – DOM-Anwendung:** gespeicherte `widthUnits` und `heightPx` zentral auf die Panels anwenden; `heightPx: null` muss automatische Höhe bedeuten. Responsive Ansichten dürfen Desktopwerte nur darstellen, nicht überschreiben. Noch kein Ziehen.
2. **0.3.0-D3 – Resize-Griff + Eingabe:** erst danach einen Griff pro Panel und den entkoppelten Pointer-/Tastatur-Controller auf die geprüfte State-/Berechnungsbasis setzen.

Anschließend folgt erst `0.3.0-E – Reorder & Drag and Drop`.

## Empfehlung

Die Trennung beibehalten. Als Nächstes ausschließlich D2 umsetzen und die gespeicherten Größen zentral über eine wiederverwendbare Darstellungsregel auf das DOM übertragen. Pointer-/Drag-Logik bleibt weiterhin außen vor.
