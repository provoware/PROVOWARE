# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

`0.3.0-A – Workspace-Vertrag`, `0.3.0-B – State Foundation & Autosave/Reset` und `0.3.0-C – Visibility Controls + kompakte Menüleiste` sind abgeschlossen.

Die freigegebene Produktversion bleibt bis zur vollständigen Workspace-Abnahme korrekt bei `0.2.0`. Die interne Entwicklungsphase ist in `VERSION.json` transparent als `0.3.0-C` vermerkt.

## Erledigt

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

- Mobile Option A umgesetzt: `Layout` bleibt fest sichtbar; nur sekundärer Leisteninhalt darf horizontal überlaufen.
- kompakte Schnellstarter-/Menüleiste direkt unter dem oberen Bereich angelegt.
- permanenter `Layout`-Schalter außerhalb des veränderbaren Workspace integriert.
- jedes der fünf Kernpanels einzeln ein-/ausblendbar.
- alle fünf Panels dürfen gleichzeitig ausgeblendet werden.
- `Alle anzeigen` und `Standardlayout wiederherstellen` bleiben erreichbar.
- Reihenfolge und Größenwerte bleiben beim Aus-/Einblenden erhalten.
- `assets/workspace-ui.js` trennt DOM, Menü, Fokus und Nutzerfeedback von der persistenten Zustandslogik.
- sichtbares Live-Nutzerfeedback ergänzt.
- `Escape` schließt das Layout-Menü und setzt den Fokus zurück auf `Layout`.
- Quality Gate prüft zusätzlich Panel-Zuordnung, UI-Pflichtdateien, Script-Reihenfolge und die Lage des permanenten Layout-Schalters.

## Validierung 0.3.0-C

- Baseline: `247b584e87f4e041e6f405932328659e895bfbb7`.
- Branch vor Merge: `0` Commits hinter `main`.
- technischer Pull Request: `#68`.
- geänderte Dateien im technischen PR: `20`.
- PR war mergebar.
- GitHub Quality Gate: `success`.
- statische Projektprüfung: `39` Dateien erfolgreich geprüft.
- automatische Tests: `18/18` erfolgreich, `0` fehlgeschlagen.
- Node für das Projekt-Quality-Gate: `20.20.2`.
- Squash-Merge: `dce166770cf589a8fb9720cb3c0a650c19151cd9`.
- Main-Stichprobe: `index.html`, `assets/workspace-ui.js` und `VERSION.json` erfolgreich gelesen.

## Änderungsvolumen

Einstufung: **mittel**.

Betroffen:

- feste obere Bedienzone
- Panel-Sichtbarkeit
- Workspace-State-API
- Workspace-UI-Anbindung
- CSS
- automatische Tests
- Quality Gate
- Entwicklungsdokumentation

Nicht betroffen:

- Resize
- Drag & Drop
- Fachmodule
- Netzwerk
- Modulvertrag
- andere lokale PROVOWARE-Schlüssel

## Technischer Hinweis

GitHub Actions meldet weiterhin einen nicht blockierenden Hinweis zur auslaufenden internen Node-20-Laufzeit der derzeit verwendeten Actions `v4`. Das eigentliche Projekt-Quality-Gate lief erfolgreich mit Node `20.20.2`.

Diese Workflow-Hygiene bleibt bewusst von den Funktionspatches getrennt und wird spätestens in `0.3.0-G` geprüft.

## Nächste zwei Schritte

1. `0.3.0-D – Resize`: Breite und Höhe innerhalb des Workspace-Vertrags veränderbar machen, Maus/Touch/Tastatur absichern und nur validierte Endwerte speichern.
2. `0.3.0-E – Reorder & Drag and Drop`: erst nach stabiler Größenlogik die Reihenfolge über einen dedizierten Griff verändern und eine vollständige Tastaturalternative anbieten.

## Empfehlung

Als Nächstes ausschließlich `0.3.0-D – Resize` umsetzen. Drag & Drop bleibt bis `0.3.0-E` gesperrt.
