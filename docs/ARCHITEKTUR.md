# Architektur

## Ziel

Die Anwendung trennt Oberfläche, Zustand, Workflow, Regeln, Validierung, Berichte, Migration und Speicherung. Keine Fachlogik liegt direkt in `index.html`.

## Laufzeitfluss

```text
index.html
  → migration-engine.js stellt reine Einzelschritt-Migrationen bereit
  → storage-engine.js stellt IndexedDB, Revisionen und Migrationstransaktionen bereit
  → state-manager.js hält den laufenden Projektzustand
  → workflow-engine.js bestimmt Fragen und Phasen
  → validation-engine.js prüft nur das aktuelle Zielschema
  → app-ui.js rendert Workflow und Status
  → storage-manager.js rendert Snapshot-Liste und Vorschau
  → app.js koordiniert Laden, Migration, Autospeichern, Aufbewahrung und Wiederherstellung
```

## Migrationsgrenze

### `migration-engine.js`

- besitzt keinen Zugriff auf IndexedDB oder Oberfläche
- akzeptiert ausschließlich bekannte Projektschemata
- migriert immer nur zur direkt folgenden Version
- führt `1.0.0 → 1.1.0 → 1.2.0` schrittweise aus
- erkennt fehlende Pfade und Zyklen
- gibt migrierten Projektstand und vollständige Schrittfolge zurück

### `storage-engine.js`

- prüft vor der Nutzung Prüfsumme und Migrationsfähigkeit
- wählt den jüngsten nutzbaren Haupt- oder Snapshotstand
- führt die gesamte Persistenzmigration in einer Schreibtransaktion aus
- erhält vorhandene Legacy-Snapshots unverändert
- erzeugt migrierte Snapshot-Kopien mit neuen Revisionen
- legt vor dem Ersetzen eines Legacy-Hauptstands eine unveränderte Vorher-Sicherung an
- aktualisiert Hauptstand, Metadaten und Migrationsprotokoll atomar

## Transaktionale Migrationsfolge

```text
Legacy-Hauptstand und Snapshots lesen
  → Prüfsumme kontrollieren
  → jeden Projektstand rein im Speicher schrittweise migrieren
  → Zielschema validieren
  → eine gemeinsame IndexedDB-Schreibtransaktion öffnen
  → migrierte Kopien der Legacy-Snapshots hinzufügen
  → Vorher-Sicherung des Hauptstands hinzufügen
  → neuen Hauptstand und Zielsnapshot schreiben
  → Metadaten und jeden Migrationsschritt protokollieren
  → Transaktion vollständig bestätigen
```

Bei Quota, Fehler oder Abbruch wird die gesamte Transaktion zurückgerollt.

## Speichergrenzen

### `storage-manager.js`

- kennt keine IndexedDB-Transaktionen
- fordert Daten ausschließlich über `namespace.persistence` an
- zeigt Gültigkeit und Inhalte an
- verlangt eine ausdrückliche Bestätigung
- übergibt nur die gewählte Snapshot-ID an die Anwendung

### `app.js`

- serialisiert Autosave-Vorgänge
- übergibt Fragenkatalogversion und Validierungszeitpunkt an die Migration
- verhindert doppelte Speicherung während einer Wiederherstellung
- führt nach erfolgreichem Speichern die Aufbewahrungsprüfung aus
- setzt migrierte oder wiederhergestellte Daten kontrolliert in den State-Manager

## Fehlerprüfgrenze

Fehlerinjektion ist nur aktiv, wenn `window.__PROVOWARE_TESTING__ === true` gesetzt ist. Unterstützt werden:

- voller Speicher vor dem ersten Schreibvorgang,
- Abbruch nach dem vorgemerkten Hauptstand,
- beschädigte Prüfsummen in neueren Snapshots.

Normale Nutzeroberflächen können diese Haken nicht aktivieren.
