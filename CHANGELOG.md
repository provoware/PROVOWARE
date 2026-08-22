# CHANGELOG

## In Entwicklung – 0.3.0 Flexible Workspace Engine

### 0.3.0-D3a – Keyboard Resize Preview

#### Hinzugefügt

- `assets/workspace-resize.js` als entkoppelte Eingabeschicht für sichtbaren Resize-Griff und Tastaturbedienung.
- genau ein dynamisch erzeugter Resize-Griff pro Workspace-Panel mit ungefähr 44 × 44 px Trefferfläche.
- zugängliche deutsche Griffbeschriftung und `aria-keyshortcuts` für Pfeile, `Home` und `Escape`.
- flüchtiger Tastatur-Vorschauzustand ohne Zwischen-Speicherung.
- gebündelter Größen-Commit erst nach Freigabe der letzten aktiven Resize-Pfeiltaste.
- `Escape` zum Verwerfen der laufenden Vorschau ohne Persistenz.
- `Home` zum Zurücksetzen ausschließlich der aktuellen Panelgröße.
- logische Responsive-Sperre bis einschließlich 980 px zusätzlich zur visuellen CSS-Sperre.
- neue Tests `tests/workspace-resize.test.mjs` und `tests/workspace-resize-load.test.mjs`.

#### Geändert

- `assets/workspace-ui.js` stellt mit `panelGroesseVorschauAnwenden` dieselbe CSS-Variablen-Darstellung nun auch für nicht persistente Vorschauwerte bereit.
- `assets/workspace-layout.css` ergänzt Griff-, Aktiv- und Vorschau-Darstellung ausschließlich ab 981 px.
- `assets/app.js` initialisiert die Resize-Eingabeschicht erst nach Workspace-State und Workspace-UI.
- `index.html` lädt `workspace-size.js` und `workspace-resize.js` in deterministischer Reihenfolge vor `app.js`.
- interne Entwicklungsphase auf `0.3.0-D3a Keyboard Resize Preview` fortgeschrieben; Produktversion und Workspace-Vertragsversion bleiben unverändert.

#### Validiert

- technischer PR #78 war beim finalen Diff-Check 0 Commits hinter `main` und mergebar.
- GitHub Quality Gate erfolgreich: 56 Dateien geprüft, 48/48 Tests erfolgreich, 0 fehlgeschlagen.
- Squash-Merge: `5e1db3ff65d034b478f4aec032f36c0c3ffb2300`.

#### Bewusst noch nicht enthalten

- keine Pointer-/Maus-/Touch-/Stift-Ziehbedienung
- kein Pointer Capture
- kein Drag & Drop
- keine neue persistente State-Struktur
- keine neue Bibliothek

### Entwicklungsqualität

#### Geändert

- Unerwartete interne Fehler der Qualitätsschranke enden kontrolliert mit Ursache und nächstem Prüfschritt statt mit einem technischen Stapelabdruck.
- Ein automatischer Fehlerfall sichert verständliche Diagnoseausgabe und den Fehler-Exitcode ab.

### 0.3.0-D2 – Resize DOM Application

#### Hinzugefügt

- `assets/workspace-layout.css` als kleine isolierte Desktop-Darstellungsschicht für gespeicherte Panelgrößen.
- CSS-Variablen `--panel-spalten` und `--panel-hoehe` als alleinige Übergabe von Workspace-State an die Darstellung.
- automatische DOM-Tests für gespeicherte Breite, feste Höhe, Rückkehr zu automatischer Höhe und ungültige Darstellungswerte.
- automatische Prüfung des Desktop-CSS-Vertrags und der lokalen Stylesheet-Ladereihenfolge.

#### Geändert

- `assets/workspace-ui.js` überträgt normalisierte Größenwerte auf CSS-Variablen, ohne `grid-column`, `height` oder Browser-Speicherung direkt zu steuern.
- ein nicht persistenter Bereitschaftsmarker aktiviert das Desktop-Overlay nur bei gültiger Breite; ohne gültige Größenübergabe bleibt die bewährte Basisdarstellung erhalten.
- `index.html` lädt das lokale Workspace-Größenstylesheet direkt nach `assets/styles.css`.
- Tablet- und Mobilregeln bleiben unangetastet, weil das neue Overlay ausschließlich ab 981 px aktiv ist.
- Entwicklungsmetadaten auf `0.3.0-D Resize DOM Application` fortgeschrieben.

#### Bewusst noch nicht enthalten

- kein Resize-Griff
- keine Pointer-/Touch-/Stiftsteuerung
- keine Resize-Tastatursteuerung
- keine transiente Resize-Vorschau
- kein Drag & Drop

### 0.3.0-D1 – Resize State & Calculation Foundation

#### Hinzugefügt

- `assets/workspace-size.js` als reine, DOM-freie Größenberechnung für Rasterbreite und Höhe.
- deterministische Rastermetrik mit Berücksichtigung des tatsächlichen Spaltenabstands (`column-gap`).
- symmetrische Rundung horizontaler Bewegungen auf ganze Rastereinheiten.
- Höhenberechnung in festen 24-px-Schritten.
- automatische Tests für Rastermetrik, Grenzen, Rundung und reproduzierbare Ergebnisse.
- zusätzliche State-Tests für Größenänderung, Einzel-Reset und Erhalt von Sichtbarkeit/Reihenfolge.

#### Geändert

- Workspace-State-API um `panelGroesseSetzen` und `panelGroesseZuruecksetzen` erweitert.
- Panel-ID-Prüfung zentralisiert und von Sichtbarkeits- sowie Größenaktionen gemeinsam verwendet.
- Entwicklungsmetadaten auf `0.3.0-D Resize State & Calculation` fortgeschrieben.

#### Bewusst noch nicht enthalten

- keine sichtbare Größenänderung
- kein Resize-Griff
- keine DOM-Anwendung gespeicherter Größen
- keine Pointer-/Touch-/Tastatursteuerung für Resize
- kein Drag & Drop

### Erscheinungsbild nach Referenz

#### Geändert

- Farbwirkung, Ebenen, Schatten und Abstände an eine kompakte Petrol-/Cyan-Kartenoberfläche angeglichen.
- Seitenleiste auf eine schmale, nummerierte Bereichsnavigation verdichtet.
- Kopf-, Schnellstarter-, Panel- und Debugbereiche visuell vereinheitlicht, ohne Funktionen oder Zustandsverträge zu ändern.
- Mobile Darstellung der verdichteten Navigation und Oberflächenrahmung abgesichert.

#### Bewusst nicht enthalten

- keine neuen Fachinhalte oder Module
- keine Änderung an Speicherung oder öffentlichen Schnittstellen
- kein Resize und kein Drag & Drop

### 0.3.0-C – Visibility Controls & Compact Menu

#### Hinzugefügt

- kompakte Schnellstarter-/Menüleiste direkt unter dem oberen Bereich.
- permanenter `Layout`-Schalter außerhalb des veränderbaren Workspace.
- Layout-Menü für alle fünf Kernpanels.
- einzelne Panel-Sichtbarkeit mit automatischer lokaler Speicherung.
- `Alle anzeigen`.
- dauerhaft erreichbarer Befehl `Standardlayout wiederherstellen`.
- Live-Nutzerfeedback für Layoutaktionen.
- `assets/workspace-ui.js` als getrennte DOM- und Bedienlogik ohne eigene Persistenz.
- stabile Zuordnung zwischen Workspace-Vertrag und HTML über `data-workspace-panel` und `data-layout-panel`.
- automatische Workspace-UI-Tests ohne externe Testbibliothek.
- Quality-Gate-Prüfung für Panel-Zuordnung und permanenten Layout-Schalter.
- Teilplan und Patchmanifest für 0.3.0-C.

#### Geändert

- Workspace-State-API um `panelSichtbarkeitSetzen` und `allePanelsAnzeigen` erweitert.
- `assets/app.js` initialisiert die Workspace-UI nach der Zustandsbasis.
- `assets/styles.css` enthält kompakte feste Layoutsteuerung und responsive mobile Option A.
- Sichtbarkeitstests prüfen Erhalt von Reihenfolge und Größenwerten.
- Dokumentation und Entwicklungsmetadaten auf 0.3.0-C fortgeschrieben.

#### Bewusst noch nicht enthalten

- kein Resize
- kein Drag & Drop
- keine Fachmodule

### 0.3.0-B – State Foundation & Autosave/Reset

#### Hinzugefügt

- `assets/workspace-state.js` als versionierte Workspace-Zustandsverwaltung.
- reproduzierbarer Standardzustand für fünf Kernpanels.
- Validierung und Normalisierung für Reihenfolge, Sichtbarkeit, Breite und Höhe.
- robuste lokale Speicherung über `provoware.allin.workspace.main.v1`.
- isolierter Reset auf das Standardlayout.
- Workspace-Logging im Bereich `WORKSPACE`.
- automatische Tests für Normalisierung, beschädigte Daten, Speicherfehler und Reset.
- detaillierter Teilplan und Patchmanifest für 0.3.0-B.

#### Geändert

- `index.html` lädt die Workspace-Zustandsverwaltung vor `assets/app.js`.
- `assets/app.js` initialisiert den Workspace-Zustand und bindet ihn an das vorhandene Logging an.
- `npm run test` führt alle Testdateien aus.
- das Quality Gate prüft die neuen Workspace-Pflichtdateien und die Script-Reihenfolge.
- `AGENTS.md` stärkt Wartbarkeit, Zustandsverwaltung, Entkopplung und Patchtransparenz.

Die freigegebene Produktversion bleibt bis zur vollständigen Abnahme der Workspace Engine bei `0.2.0`.

## 0.2.0 – Module Contract & Registry

### Hinzugefügt

- Modulvertrag mit Vertragsversion `1`.
- Leerer kanonischer Modulkatalog in `modules/registry.js`.
- Laufzeit-Registry mit kontrollierten Zuständen für Laden, Aktivieren, Deaktivieren und Entfernen.
- Registry-Anbindung an das bestehende dreistufige Debugging/Logging.
- Detaillierter Entwicklungsplan für 0.2.0.
- Reproduzierbares Node-20-Quality-Gate ohne installierte npm-Pakete.
- Sicherer Auto-Fix für JSON-Format, Zeilenenden und überflüssige Leerzeichen am Zeilenende.
- Automatischer Modul-Lebenszyklustest mit Node-Bordmitteln.
- GitHub-Actions-Workflow für Pull Requests und `main`.
- `.editorconfig` für einheitliche Textdateien.

### Geändert

- `AGENTS.md` auf kleine, begründete und reproduzierbare Patches mit festem Prüf- und Dokumentationsablauf erweitert.
- `index.html` lädt Modulkatalog und Registry vor der Hauptanwendung.
- `assets/app.js` initialisiert die Registry kontrolliert und leitet Registry-Ereignisse an den Logger weiter.
- README, TODO, Manifest, Logging-, Debugging- und Versionsdokumentation auf 0.2.0 aktualisiert.

### Entfernt

- Nichts.

## 0.1.0 – UI Foundation

### Hinzugefügt

- PROVOWARE ALL-IN 2026 als leere modulare HTML-Oberfläche.
- Responsive Seitenleiste, Kopfbereich und flexible Kartenbereiche.
- Versteckbarer Debugging- und Logging-Bereich.
- Drei Logging-Stufen: Ereignisse, Diagnose und Trace.
- Globale Fehler- und Promise-Erfassung mit begrenztem Speicherpuffer.
- Versionsmetadaten in `VERSION.json`.

### Geändert

- README und TODO auf die neue UI-Baseline aktualisiert.

### Entfernt

- Nichts.
