# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

`0.3.0-A – Workspace-Vertrag`, `0.3.0-B – State Foundation & Autosave/Reset` und `0.3.0-C – Visibility Controls + kompakte Menüleiste` sind abgeschlossen.

Für `0.3.0-D – Resize` ist die **Planungs- und Vertragsphase abgeschlossen**. Die technische Resize-Laufzeit ist noch nicht implementiert; sie ist jetzt der nächste Entwicklungsschritt.

Die freigegebene Produktversion bleibt bis zur vollständigen Workspace-Abnahme korrekt bei `0.2.0`. `VERSION.json` weist die interne Entwicklungsphase transparent als `0.3.0-D Resize Planning & Contract` aus.

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

## Änderungsvolumen des Planungs-Patches

Einstufung: **klein bis mittel**.

Betroffen waren ausschließlich:

- Entwicklungsplan
- Resize-Vertrag
- Testmatrix
- Entscheidungen
- TODO
- Status
- Manifest
- Entwicklungsmetadaten

Nicht betroffen waren:

- HTML
- CSS
- JavaScript-Laufzeit
- Tests
- Browser-Speicherung
- Fachmodule
- Netzwerk

## Erwartetes Volumen der technischen Resize-Implementierung

Einstufung: **mittel**.

Voraussichtlich betroffen:

- `assets/workspace-state.js`
- `assets/workspace-ui.js`
- neue `assets/workspace-resize.js`
- `assets/styles.css`
- `index.html`
- automatische Tests
- Quality Gate
- Entwicklungsdokumentation

## Technischer Hinweis

GitHub Actions meldet weiterhin einen nicht blockierenden Hinweis zur auslaufenden internen Node-20-Laufzeit der verwendeten Actions `v4`. Das Projekt-Quality-Gate selbst war erfolgreich mit Node `20.20.2`.

Diese Workflow-Hygiene bleibt von Funktionspatches getrennt und wird spätestens in `0.3.0-G` behandelt.

## Nächste zwei Schritte

1. **0.3.0-D State-API + reine Größenberechnung:** `panelGroesseSetzen`, `panelGroesseZuruecksetzen`, Rasterberechnung und 24-px-Höhenraster implementieren und automatisiert testen.
2. **0.3.0-D Resize-Griffe + Pointer/Tastatur:** erst danach sichtbare Griffe und Eingabesteuerung auf die geprüfte Größenlogik setzen.

Anschließend folgt erst `0.3.0-E – Reorder & Drag and Drop`.

## Empfehlung

Den technischen Resize-Patch jetzt mit der State-API und reinen Berechnungsfunktionen beginnen. Sichtbare Ziehlogik erst anschließen, wenn Größenwerte, Rasterung, Grenzen und Abbruchfälle bereits automatisiert grün sind.
