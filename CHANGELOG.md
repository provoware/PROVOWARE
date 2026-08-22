# CHANGELOG

## In Entwicklung – 0.3.0 Flexible Workspace Engine

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
