# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

`0.3.0-A – Workspace-Vertrag`, `0.3.0-B – State Foundation & Autosave/Reset` und `0.3.0-C – Visibility Controls + kompakte Menüleiste` sind abgeschlossen.

Für `0.3.0-D – Resize` sind Planungs- und Vertragsphase ebenfalls abgeschlossen. Der erste bewusst kleine technische Folgepatch **State-API + reine Größenberechnung** ist implementiert und befindet sich jetzt in der Abschlussvalidierung. Es gibt weiterhin **keine sichtbare Resize-Bedienung**.

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

## 0.3.0-D – State & Calculation Foundation

Aktuelle technische Baseline:

`a9b23b8d16e96142f35904a08315ca3f2f4495a0`

Diese Baseline enthält bereits den separat gemergten Erscheinungsbild-Patch PR #72. Der Resize-Patch baut deshalb bewusst auf dem **aktuellen** `main` auf und überschreibt keine Designänderungen.

Implementiert:

- `panelGroesseSetzen(id, groesse)` in `assets/workspace-state.js`
- `panelGroesseZuruecksetzen(id)` in `assets/workspace-state.js`
- gemeinsame Panel-ID-Prüfung für Sichtbarkeits- und Größenaktionen
- Erhalt von Reihenfolge und Sichtbarkeit bei Größenänderungen
- Größenbegrenzung über die bereits kanonischen `PANEL_DEFINITIONEN`
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

## Aktuelle Abschlussvalidierung

Noch offen:

- vollständiger Diff gegen aktuellen `main`
- Branch muss 0 Commits hinter `main` bleiben
- GitHub Quality Gate erfolgreich
- alle neuen und bestehenden Tests erfolgreich
- PR mergebar
- technischer Merge
- Main-Stichprobe der zentralen Dateien

## Änderungsvolumen des aktuellen technischen Patches

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

GitHub Actions meldet weiterhin einen nicht blockierenden Hinweis zur auslaufenden internen Node-20-Laufzeit der verwendeten Actions `v4`. Das Projekt-Quality-Gate selbst wurde in den bisherigen Stufen erfolgreich mit Node `20.20.2` ausgeführt.

Diese Workflow-Hygiene bleibt von Funktionspatches getrennt und wird spätestens in `0.3.0-G` behandelt.

## Nächste zwei Schritte

1. **0.3.0-D DOM-Anwendung:** gespeicherte `widthUnits` und `heightPx` zentral auf die Panels anwenden; `heightPx: null` muss sauber automatische Höhe bedeuten. Noch ohne Ziehen.
2. **0.3.0-D Resize-Griff + Eingabe:** erst danach einen Griff pro Panel und den entkoppelten Pointer-/Tastatur-Controller auf die geprüfte State-/Berechnungsbasis setzen.

Anschließend folgt erst `0.3.0-E – Reorder & Drag and Drop`.

## Empfehlung

Die aktuelle Trennung beibehalten. Dieser Patch darf erst nach grünem Quality Gate gemergt werden. Die sichtbare Resize-Bedienung beginnt erst im nächsten Patch auf der bereits geprüften Größenbasis.
