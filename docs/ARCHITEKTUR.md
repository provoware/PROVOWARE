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
  → validation-engine.js prüft Kataloge und das aktuelle Projektschema
  → rule-engine.js leitet Konflikte und Empfehlungen ab
  → report-generator.js erzeugt ein formatneutrales Berichtsmodell
  → app-ui.js rendert Workflow und Live-Vorschau
  → report-manager.js prüft Vorschau und lokale Exporte
  → storage-manager.js rendert Snapshot-Liste und Wiederherstellung
  → app.js koordiniert Laden, Migration, Autospeichern und Modulstart
```

## Berichtsgrenze

### `report-generator.js`

Das Modul besitzt keinen Dateidialog und keine IndexedDB-Zugriffe. Es verarbeitet ausschließlich einen gelesenen Anwendungszustand und aktive Regeln.

Es erzeugt einmalig:

- Projektstatus und Zusammenfassung
- Entscheidungen
- Anforderungen
- Architekturprinzipien, Komponenten und Datenfluss
- Risiken
- Testfälle
- Abnahmekriterien
- Meilensteine
- offene Entscheidungen
- Rückverfolgbarkeit

Die Renderer für Markdown, HTML, TXT und JSON akzeptieren ausschließlich dieses Modell. Dadurch bleiben Kennungen und Beziehungen formatübergreifend identisch.

### `report-manager.js`

- liest den aktuellen Zustand über den State-Manager
- erzeugt das Modell neu
- validiert interne Verweise vor Vorschau und Export
- zeigt Status, Anzahl Anforderungen, Risiken, Tests und offene Entscheidungen
- erzeugt lokale Dateien über Blob-URLs
- gibt den Fokus nach dem Schließen an den tatsächlichen Auslöser zurück

Das eigenständige HTML enthält nur eingebettetes CSS und keine externen Ressourcen.

## Migrationsgrenze

### `migration-engine.js`

- besitzt keinen Zugriff auf IndexedDB oder Oberfläche
- akzeptiert ausschließlich bekannte Projektschemata
- migriert immer nur zur direkt folgenden Version
- führt `1.0.0 → 1.1.0 → 1.2.0` schrittweise aus
- erkennt fehlende Pfade und Zyklen

### `storage-engine.js`

- prüft Prüfsumme und Migrationsfähigkeit
- wählt den jüngsten nutzbaren Haupt- oder Snapshotstand
- migriert Hauptstand und Kopien in einer Schreibtransaktion
- erhält Legacy-Snapshots unverändert
- aktualisiert Hauptstand, Metadaten und Protokoll atomar

## Fehler- und Testgrenzen

Fehlerinjektion ist nur aktiv, wenn `window.__PROVOWARE_TESTING__ === true` gesetzt ist. Normale Nutzeroberflächen können diese Haken nicht aktivieren.

Die schnelle GitHub Actions-CI führt L0 und L1 aus:

- Struktur und Schemata
- Migrations-, Speicher- und Berichtsverträge
- Unit- und Integrationsprüfungen
- JavaScript-Syntax

Browser-, Quota- und echte IndexedDB-Prüfungen bleiben L2-/Release-Gates und blockieren dadurch nicht jeden kleinen Entwicklungsschritt.
