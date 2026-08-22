# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

`0.3.0-A – Workspace-Vertrag` ist abgeschlossen.

`0.3.0-B – State Foundation & Autosave/Reset` ist abgeschlossen, automatisch geprüft und über PR #66 gemergt.

`0.3.0-C – Visibility Controls + kompakte Menüleiste` ist implementiert und befindet sich in der Abschlussvalidierung.

Die freigegebene Produktversion bleibt bis zur vollständigen Workspace-Abnahme korrekt bei `0.2.0`. Die interne Entwicklungsphase ist in `VERSION.json` transparent als `0.3.0-C` vermerkt.

## Erledigt

### Vertragsphase 0.3.0-A

- Workspace-Vertrag Version 1 definiert.
- Option A für automatische lokale Speicherung und vollständigen Reset bestätigt.
- Planungs-PR #64 erfolgreich geprüft und gemergt.

### Laufzeitgrundlage 0.3.0-B

- zentrale Workspace-Zustandsverwaltung angelegt.
- fünf Kernpanels reproduzierbar definiert.
- Normalisierung, lokale Speicherung und isolierter Reset implementiert.
- Speicherfehler und beschädigte Zustände robust behandelt.
- automatische Zustands- und Fehlertests ergänzt.
- PR #66 erfolgreich geprüft und gemergt.

### Sichtbarkeit und Schnellstarterleiste 0.3.0-C

- Mobile Option A bestätigt: `Layout` bleibt fest sichtbar; nur sekundärer Inhalt darf horizontal überlaufen.
- kompakte Schnellstarter-/Menüleiste direkt unter dem oberen Bereich angelegt.
- `Layout`-Schalter außerhalb des veränderbaren Workspace integriert.
- Layout-Menü für alle fünf Kernpanels ergänzt.
- jedes Panel einzeln ein-/ausblendbar gemacht.
- alle fünf Panels dürfen gleichzeitig ausgeblendet werden.
- `Alle anzeigen` integriert.
- `Standardlayout wiederherstellen` im permanent erreichbaren Layout-Menü integriert.
- stabile DOM-Zuordnung über `data-workspace-panel` ergänzt.
- `assets/workspace-ui.js` als eigene entkoppelte Bedienlogik angelegt.
- Workspace-State-API um zentrale Sichtbarkeitsmethoden erweitert.
- Reihenfolge und Größenwerte bleiben beim Aus-/Einblenden erhalten.
- Live-Nutzerfeedback ergänzt.
- Layout-Menü lässt sich per `Escape` schließen und führt den Fokus zurück.
- automatische Workspace-State- und Workspace-UI-Tests ergänzt.
- Quality Gate um Layout-Pflichtdateien, Panel-Zuordnung und permanenten Layout-Schalter erweitert.
- Teilplan und Patchmanifest für 0.3.0-C angelegt.

## In Arbeit

- vollständiger Diff-Check gegen aktuellen `main`
- GitHub Quality Gate für 0.3.0-C
- Mergebar-Prüfung
- Merge und Main-Stichprobe

## Blockiert

Keine bekannte fachliche oder technische Blockade.

## Änderungsvolumen 0.3.0-C

Einstufung: **mittel**.

Betroffen sind:

- feste obere Bedienzone
- Panel-Sichtbarkeit
- Workspace-State-API
- neue Workspace-UI-Anbindung
- CSS für Schnellstarterleiste und Layout-Menü
- automatische Tests
- Quality Gate
- Entwicklungsdokumentation

Nicht betroffen sind:

- Resize
- Drag & Drop
- Fachmodule
- Netzwerk
- Modulvertrag
- andere lokale PROVOWARE-Schlüssel

## Technischer Hinweis

Der bereits bekannte GitHub-Actions-Hinweis zur auslaufenden internen Node-20-Laufzeit der verwendeten Actions bleibt getrennt vom Funktionspatch. Das Projekt-Quality-Gate selbst wird weiterhin mit dem vorgesehenen Node-Laufzeitstand ausgeführt. Die Workflow-Hygiene wird spätestens in 0.3.0-G separat gehärtet.

## Nächste zwei Schritte

1. `0.3.0-D – Resize`: Breite und Höhe innerhalb des Workspace-Vertrags veränderbar machen, Maus/Touch/Tastatur absichern und nur validierte Endwerte speichern.
2. `0.3.0-E – Reorder & Drag and Drop`: erst nach stabiler Größenlogik die Reihenfolge per dediziertem Griff veränderbar machen und vollständige Tastaturalternative anbieten.

## Empfehlung

0.3.0-C erst nach grünem Quality Gate mergen. Danach ausschließlich 0.3.0-D umsetzen. Drag & Drop bleibt weiterhin bis 0.3.0-E gesperrt.
