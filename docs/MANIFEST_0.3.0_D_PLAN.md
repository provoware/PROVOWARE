# Planungsmanifest 0.3.0-D – Resize

## Zweck

Dieses Manifest beschreibt ausschließlich den **Planungs- und Vertrags-Patch** vor der technischen Resize-Implementierung.

## Baseline

`e167226b7f2e1d80c2d16de9964a3a13d1efbfca`

## Produktversion

Freigegebene Produktversion bleibt:

`0.2.0`

Workspace-Vertragsversion bleibt:

`1`

Es werden keine neuen persistenten Schemafelder eingeführt.

## Bestätigte Bedienentscheidung

Option A:

- ein Resize-Griff pro sichtbarem Workspace-Panel
- Maus, Touch und Stift über gemeinsame Pointer Events
- derselbe Griff unterstützt Tastatur
- Breite in ganzen Rastereinheiten
- Höhe in 24-px-Schritten
- Vorschau transient
- Persistenz erst nach validiertem Abschluss
- kein paralleles vollständiges Größenmenü

## Neue Dokumente

- `docs/RESIZE_CONTRACT_0.3.0.md`
  - Größenregeln
  - Pointer-Vertrag
  - Tastaturmodell
  - Responsive Regeln
  - Logging-/Fehlerregeln
  - 40-teilige Testmatrix

- `docs/PLAN_0.3.0_D.md`
  - nummerierte Implementierungsreihenfolge
  - Änderungsgrenze
  - Architektur
  - Abnahmekriterien
  - Risiken
  - Änderungsvolumen
  - nächste zwei Schritte

- `docs/MANIFEST_0.3.0_D_PLAN.md`
  - dieses Planungsmanifest

## Aktualisierte Dokumente

Vorgesehen:

- `TODO.md`
- `docs/STATUS_0.3.0.md`
- `docs/PLAN_0.3.0.md`
- `docs/DECISIONS_0.3.0.md`
- `MANIFEST.md`
- `VERSION.json`

## Laufzeitänderungen

Keine.

Dieser Patch verändert nicht:

- HTML
- CSS
- JavaScript
- Tests
- Quality-Gate-Code
- Browser-Speicherung

## Verbindliche technische Richtung für den Folgepatch

Vorgesehene Verantwortungstrennung:

- `assets/workspace-state.js` → einzige persistente Größenquelle
- `assets/workspace-ui.js` → gültige gespeicherte Größe auf DOM anwenden
- neue `assets/workspace-resize.js` → Pointer/Tastatur, transiente Vorschau, Commit/Abbruch

Die Resize-Eingabeschicht darf nicht direkt in `localStorage` schreiben.

## Größenregeln

Breite:

- 12-Spalten-Raster
- Schritt 1 Rastereinheit
- individuelle Min-/Max-Grenzen aus `PANEL_DEFINITIONEN`

Höhe:

- `null` = automatisch
- feste Höhe nur innerhalb individueller Grenzen
- Schritt 24 px

Responsive:

- Resize aktiv ab 981 px
- bis 980 px keine persistente Resize-Aktion
- gespeicherte Desktopwerte bleiben erhalten

## Teststrategie für den Folgepatch

Die Testmatrix deckt ab:

1. State-API
2. Raster-/Höhenberechnung
3. Pointer
4. Tastatur
5. Responsive Verhalten
6. UI/Zugänglichkeit
7. Quality Gate

Ziel: 40 klar benannte Prüfziele.

## Änderungsvolumen

Planungs-Patch: **klein bis mittel, nur Dokumentation**.

Folgepatch erwartet: **mittel**.

## Rückweg

Revert dieses Dokumentations-Pull-Requests.

Da keine Laufzeitdatei verändert wird, entstehen keine Datenmigrationen und keine Änderungen am aktuellen Funktionsstand 0.3.0-C.

## Nächster technischer Schritt

Nach erfolgreicher Planungsabnahme:

1. State-API für Größenwerte
2. reine Größenberechnung
3. automatische Tests
4. erst danach Resize-Griffe und Eingabesteuerung

Drag & Drop bleibt bis `0.3.0-E` gesperrt.
