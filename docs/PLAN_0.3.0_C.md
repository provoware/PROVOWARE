# Entwicklungsplan 0.3.0-C – Sichtbarkeit & kompakte Schnellstarterleiste

## Ziel in einfacher Sprache

Diese Teilstufe macht die vorhandenen Workspace-Panels sichtbar steuerbar. Direkt unter dem festen oberen Bereich liegt eine kompakte Schnellstarter-/Menüleiste. Der Rettungsweg `Layout` bleibt immer erreichbar und liegt außerhalb der veränderbaren Arbeitsfläche.

Alle Panels dürfen ausgeblendet werden. Trotzdem kann der Nutzer jederzeit ohne Konsole, Neuinstallation oder Löschen anderer Browserdaten wieder zu einem vollständigen Standardlayout zurückkehren.

## Begriffe vorab

- **Sichtbarkeit:** Ein Panel wird angezeigt oder ausgeblendet, ohne gespeicherte Reihenfolge oder Größe zu verlieren.
- **Schnellstarterleiste:** kompakte feste Leiste mit häufig benötigten Layoutfunktionen.
- **Fokus:** aktuell per Tastatur bedienbares Element.
- **Live-Status:** kurze sichtbare Bestätigung nach einer Aktion.
- **Quality Gate (Qualitätsschranke):** automatische Prüfung vor dem Merge.

## 1. Baseline

- Produkt: `PROVOWARE ALL-IN 2026`
- freigegebene Produktversion: `0.2.0`
- Entwicklungsstufe: `0.3.0-C`
- Baseline: `247b584e87f4e041e6f405932328659e895bfbb7`
- Workspace-Vertrag: Version `1`
- lokaler Schlüssel: `provoware.allin.workspace.main.v1`
- keine neue externe Laufzeitabhängigkeit

## 2. Bestätigte Entscheidungen

- [x] Alle Workspace-Panels dürfen vollständig ausgeblendet werden.
- [x] Permanenter `Layout`-Schalter liegt außerhalb des Workspace.
- [x] Schnellstarterleiste liegt direkt unter dem festen oberen Bereich.
- [x] Mobile Option A: `Layout` bleibt fest sichtbar.
- [x] Nur sekundäre Leisteninhalte dürfen horizontal scrollen.
- [x] Keine zweite unnötige Navigation.
- [x] Resize bleibt in 0.3.0-D.
- [x] Drag & Drop bleibt in 0.3.0-E.

## 3. Änderungsgrenze

### Enthalten und umgesetzt

- [x] kompakte Schnellstarterleiste
- [x] permanenter `Layout`-Schalter
- [x] Layout-Menü für fünf Kernpanels
- [x] einzelnes Ein-/Ausblenden
- [x] `Alle anzeigen`
- [x] `Standardlayout wiederherstellen`
- [x] zentrale Workspace-Zustandsverwaltung als einzige persistente Quelle
- [x] automatische lokale Speicherung
- [x] Erhalt von Reihenfolge und Größe
- [x] verständliches Nutzerfeedback
- [x] Tastatur- und Fokusverhalten für das Layout-Menü
- [x] automatische Tests
- [x] Quality-Gate-Erweiterung
- [x] Dokumentation und Manifeste

### Nicht enthalten

- [x] kein Resize
- [x] kein Drag & Drop
- [x] keine Fachmodule
- [x] keine Cloud-/Netzwerkfunktion
- [x] keine neue Bibliothek
- [x] keine zweite Zustandsquelle
- [x] keine Änderung des Modulvertrags

## 4. Wartbarkeitsarchitektur

### Zustandslogik

`assets/workspace-state.js` bleibt die einzige persistente Workspace-Zustandsquelle.

Neue zentrale Methoden:

- `panelSichtbarkeitSetzen()`
- `allePanelsAnzeigen()`

### Bedienlogik

`assets/workspace-ui.js` übernimmt nur:

- DOM-Zuordnung
- sichtbares Anwenden des Zustands
- Layout-Menü
- Fokus
- Nutzerfeedback
- Weiterleitung von Aktionen an die State-API

Die UI schreibt nicht direkt in `localStorage`.

### Stabile Zuordnung

- `data-workspace-panel` markiert die fünf sichtbaren Panels.
- `data-layout-panel` verwendet im Menü exakt dieselben Vertrags-IDs.
- Das Quality Gate liest die realen Paneldefinitionen aus `assets/workspace-state.js`, statt die Liste erneut zu duplizieren.

## 5. Umsetzungscheckliste

### 5.1 Vorprüfung

- [x] Baseline bestätigt
- [x] IDs, Raster und Breakpoints geprüft
- [x] bestehende Workspace-API geprüft
- [x] keine parallele Speicherung eingeführt
- [x] Scope auf Sichtbarkeit und feste Layoutsteuerung begrenzt

### 5.2 State

- [x] einzelne Sichtbarkeit zentral steuerbar
- [x] `allePanelsAnzeigen()` zentral vorhanden
- [x] unbekannte Panel-ID wird abgelehnt
- [x] Änderungen laufen über vorhandene Normalisierung und Speicherung
- [x] Reset bleibt isoliert
- [x] unnötiger Schreibvorgang bei unverändertem Wert vermieden

### 5.3 HTML/CSS

- [x] Schnellstarterleiste vor dem Workspace
- [x] Layout-Schalter dauerhaft erreichbar
- [x] fünf Panel-Schalter
- [x] `Alle anzeigen`
- [x] Reset
- [x] Live-Status
- [x] versteckte Panels verlassen das Grid
- [x] mobile Option A umgesetzt
- [x] Fokuszustände sichtbar
- [x] `prefers-reduced-motion` bleibt berücksichtigt

### 5.4 Bedienlogik

- [x] gespeicherten Zustand auf DOM anwenden
- [x] Schalter synchron halten
- [x] Sichtbarkeitsaktionen anbinden
- [x] `Alle anzeigen` anbinden
- [x] Reset anbinden
- [x] `Escape` schließt Menü
- [x] Fokus nach `Escape` zurück zu `Layout`
- [x] Klick außerhalb schließt Menü
- [x] Fehler fällt auf letzten gültigen Zustand zurück
- [x] keine Render-/Speicher-Endlosschleife

### 5.5 Nutzerfeedback

- [x] Ausblenden verständlich bestätigen
- [x] `Alle anzeigen` bestätigen
- [x] Reset bestätigen
- [x] Fehler meldet sicheren bestehenden Zustand
- [x] technische Details bleiben im `WORKSPACE`-Log

### 5.6 Automatische Tests

- [x] Aus-/Einblenden erhält Reihenfolge und Größe
- [x] alle fünf Panels dürfen ausgeblendet werden
- [x] alle Panels wieder anzeigen
- [x] unbekannte ID verändert Zustand nicht
- [x] gespeicherte Sichtbarkeit auf DOM anwenden
- [x] Schalter, Zustand und Feedback synchronisieren
- [x] Reset über UI
- [x] Layout-Menü und `Escape`
- [x] Fokus-Rückkehr
- [x] statische Vertrags-/HTML-Zuordnung
- [x] deterministische Script-Reihenfolge

## 6. Reale Abnahme

- [x] vollständiger Diff gegen `main` geprüft
- [x] Branch war `0` Commits hinter `main`
- [x] technischer PR: `#68`
- [x] PR war mergebar
- [x] GitHub Quality Gate: `success`
- [x] statische Prüfung: `39` Dateien
- [x] automatische Tests: `18/18` erfolgreich
- [x] fehlgeschlagene Tests: `0`
- [x] Projektprüfung lief mit Node `20.20.2`
- [x] PR per Squash gemergt
- [x] Merge: `dce166770cf589a8fb9720cb3c0a650c19151cd9`
- [x] Main-Stichprobe: `index.html`, `assets/workspace-ui.js`, `VERSION.json`

## 7. Änderungsvolumen

**Einstufung: mittel.**

Der technische PR #68 änderte `20` Dateien. Betroffen waren feste Bedienzone, Sichtbarkeit, State-API, UI-Anbindung, CSS, Tests, Quality Gate und Dokumentation.

Nicht betroffen waren Fachmodule, Netzwerk, Modulvertrag, Resize und Drag & Drop.

## 8. Risiken und Schutzmaßnahmen

- **Alles ausgeblendet:** `Layout` bleibt außerhalb des Workspace erreichbar.
- **UI/Zustand widersprüchlich:** Darstellung wird aus der zentralen Workspace-API abgeleitet.
- **Doppelte Speicherung:** nur State-Schicht schreibt persistent.
- **Mobile Enge:** `Layout` bleibt im festen Primärbereich; nur sekundärer Inhalt scrollt.
- **Reset-Risiko:** Reset löscht weiterhin nur `provoware.allin.workspace.main.v1`.

## 9. Rückweg

0.3.0-C wurde als eigener Squash-PR gemergt und kann als Einheit zurückgenommen werden. Es existiert keine serverseitige Migration.

## 10. Nächste zwei Schritte

### 0.3.0-D – Resize

1. Breite in ganzen Rastereinheiten ändern.
2. Höhe innerhalb gültiger Grenzen ändern.
3. Maus, Touch und Tastatur unterstützen.
4. nur validierte Endwerte speichern.
5. Desktopwerte bei kleineren Viewports erhalten.

### 0.3.0-E – Reorder & Drag and Drop

1. dedizierten Drag-Griff ergänzen.
2. nur Reihenfolge verändern.
3. keine freien Pixelkoordinaten speichern.
4. Abbruch ohne Zustandsverlust.
5. vollständige Tastaturalternative.

## Empfehlung

0.3.0-C ist abgeschlossen. Als nächsten Funktionspatch ausschließlich `0.3.0-D – Resize` umsetzen. Drag & Drop bleibt bis `0.3.0-E` gesperrt.
