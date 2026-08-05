# Architektur

## Ziel

Die Anwendung trennt Oberfläche, Zustand, Workflow, Regeln, Validierung, Berichte und Speicherung. Keine Fachlogik liegt direkt in `index.html`.

## Laufzeitfluss

```text
index.html
  → storage-engine.js stellt die IndexedDB-API bereit
  → state-manager.js hält den laufenden Projektzustand
  → workflow-engine.js bestimmt Fragen und Phasen
  → validation-engine.js prüft Kataloge und Projektstände
  → app-ui.js rendert Workflow und Status
  → storage-manager.js rendert Snapshot-Liste und Vorschau
  → app.js koordiniert Laden, Autospeichern, Aufbewahrung und Wiederherstellung
```

## Speichergrenzen

### `storage-engine.js`

- kennt IndexedDB und alle Stores
- erzeugt Revisionen und Prüfsummen
- schreibt Hauptstand, Snapshot, Metadaten und Protokoll transaktional
- liest und bewertet Snapshots
- plant und vollzieht Aufbewahrung
- stellt gültige Snapshots als neue Revision wieder her

### `storage-manager.js`

- kennt keine IndexedDB-Transaktionen
- fordert Daten ausschließlich über `namespace.persistence` an
- zeigt Gültigkeit und Inhalte an
- verlangt eine ausdrückliche Bestätigung
- übergibt nur die gewählte Snapshot-ID an die Anwendung

### `app.js`

- serialisiert Autosave-Vorgänge
- verhindert doppelte Speicherung während einer Wiederherstellung
- führt nach erfolgreichem Speichern die Aufbewahrungsprüfung aus
- setzt den wiederhergestellten Zustand kontrolliert in den State-Manager

## Aufbewahrungsalgorithmus

1. Snapshots nach Revision absteigend sortieren.
2. jüngsten gültigen Snapshot als Sicherheitsstand bestimmen.
3. regulär die neuesten Snapshots bis zur Grenze behalten.
4. liegt der Sicherheitsstand außerhalb, ersetzt er den ältesten regulären Platz.
5. nur die übrigen Snapshot-IDs in einer Schreibtransaktion löschen.

Die konfigurierte Grenze wird dadurch nicht überschritten.
