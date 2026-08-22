# Planungsmanifest 0.3.0-D – Resize

## Zweck

Dieses Manifest beschreibt ausschließlich den abgeschlossenen **Planungs- und Vertrags-Patch** vor der technischen Resize-Implementierung.

## Baseline

`e167226b7f2e1d80c2d16de9964a3a13d1efbfca`

## Produktversion

Freigegebene Produktversion bleibt:

`0.2.0`

Workspace-Vertragsversion bleibt:

`1`

Es wurden keine neuen persistenten Schemafelder eingeführt.

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

- `TODO.md`
- `docs/STATUS_0.3.0.md`
- `docs/PLAN_0.3.0.md`
- `docs/DECISIONS_0.3.0.md`
- `MANIFEST.md`
- `VERSION.json`

## Laufzeitänderungen

Keine.

Der Planungs-Patch veränderte nicht:

- HTML
- CSS
- JavaScript
- Tests
- Quality-Gate-Code
- Browser-Speicherung

## Reale Abnahme

- Planungs-PR: `#70`
- Branch vor Merge: `0` Commits hinter `main`
- geänderte Dateien: `9`
- Dateityp: ausschließlich Dokumentation und Entwicklungsmetadaten
- PR: mergebar
- GitHub Quality Gate: `success`
- statische Projektprüfung: `42` Dateien
- bestehende automatische Tests: `18/18` erfolgreich
- fehlgeschlagene Tests: `0`
- verwendete Projekt-Node-Version: `20.20.2`
- Squash-Merge: `c41b958b6a1aa426cd427be4f633742b21e404d0`
- Main-Stichprobe erfolgreich für:
  - `docs/RESIZE_CONTRACT_0.3.0.md`
  - `docs/PLAN_0.3.0_D.md`
  - `VERSION.json`

## Verbindliche technische Richtung für den Folgepatch

Verantwortungstrennung:

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

Die Testmatrix deckt 40 Prüfziele ab:

1. State-API
2. Raster-/Höhenberechnung
3. Pointer
4. Tastatur
5. Responsive Verhalten
6. UI/Zugänglichkeit
7. Quality Gate

## Änderungsvolumen

Planungs-Patch: **klein bis mittel, nur Dokumentation**.

Technischer Folgepatch erwartet: **mittel**.

## Rückweg

Revert des Planungs-Pull-Requests `#70`.

Da keine Laufzeitdatei verändert wurde, entstanden keine Datenmigrationen und keine Änderungen am Funktionsstand 0.3.0-C.

## Nächste zwei Schritte

1. State-API für Größenwerte + reine Größenberechnung implementieren und testen.
2. Danach Resize-Griffe und Pointer-/Tastatursteuerung auf diese geprüfte Basis setzen.

Drag & Drop bleibt bis `0.3.0-E` gesperrt.
