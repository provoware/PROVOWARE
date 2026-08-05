# Architektur

## Ziel

Die Anwendung trennt Oberfläche, Zustand, Workflow, Regeln, Validierung, Berichte, Projektverwaltung, Migration und Speicherung. Keine Fachlogik liegt direkt in `index.html`.

## Laufzeitfluss

```text
index.html
  → migration-engine.js stellt reine Einzelschritt-Migrationen bereit
  → storage-engine.js stellt IndexedDB, Revisionen und Migrationstransaktionen bereit
  → project-repository.js verwaltet mehrere Projekte und deren Lebenszyklus
  → state-manager.js hält ausschließlich das aktuell geöffnete Projekt
  → workflow-engine.js bestimmt Fragen und Phasen
  → validation-engine.js prüft Kataloge und Projektschema
  → rule-engine.js leitet Konflikte und Empfehlungen ab
  → report-generator.js erzeugt den Bericht des aktuellen Projekts
  → app-ui.js rendert Workflow und Live-Auswertung
  → project-manager.js rendert Projektübersicht und Aktionen
  → report-manager.js prüft Vorschau und lokale Exporte
  → storage-manager.js rendert Snapshots und Wiederherstellung
  → app.js serialisiert Speicherung und Projektwechsel
```

## Projektgrenze

### `project-repository.js`

Das Modul arbeitet direkt auf den vorhandenen IndexedDB-Stores, besitzt aber keine Verantwortung für die Darstellung.

Aufgaben:

- alle aktuellen Projektdatensätze lesen
- Lebenszyklusmetadaten zuordnen
- eindeutige Projekt-IDs erzeugen
- leere Projekte anlegen
- Namen als neue Revision speichern
- Projektstände mit neuer ID duplizieren
- Archiv und Papierkorb verwalten
- endgültige Löschung auf ein einzelnes Projekt begrenzen

Lebenszyklusdaten werden unter `lifecycle:<projectId>` im Store `meta` gespeichert. Alte Projekte ohne diesen Datensatz gelten als aktiv.

### `project-manager.js`

- zeigt Projekte, Revisionen, Antwortzahl und Status
- filtert nach aktiv, Archiv und Papierkorb
- sucht nach Name oder Projekt-ID
- fordert Namen für neue Projekte und Duplikate an
- verlangt exakten Projektname und separates Bestätigungsfeld vor endgültiger Löschung
- kennt keine direkten IndexedDB-Transaktionen

### `app.js`

`app.js` ist die Koordinationsgrenze zwischen aktuellem Zustand und Projekt-Persistenz.

Beim Wechsel:

1. geplantes Autosave stoppen,
2. ausstehende Änderung des bisherigen Projekts seriell speichern,
3. Zielprojekt und Lebenszyklus prüfen,
4. jüngsten gültigen Stand laden oder migrieren,
5. State-Manager vollständig auf das Zielprojekt setzen,
6. projektbezogene Aufbewahrung anwenden,
7. URL und sichtbaren Projektnamen aktualisieren.

Archiviert oder verschiebt der Nutzer das aktuelle Projekt in den Papierkorb, wird ein anderes aktives Projekt geöffnet. Fehlt ein solches Projekt, wird ein neues leeres Ersatzprojekt angelegt.

## Unabhängigkeit

Die logische Trennung erfolgt durch `projectId` in:

- `projects`
- `snapshots`
- `meta`
- `migrationLog`
- Berichtskopf und Rückverfolgbarkeit

Ein Duplikat übernimmt bewusst den fachlichen Inhalt, erhält jedoch:

- neue Projekt-ID
- neue Erstellungszeit
- Revision 1
- eigene künftige Snapshot-Folge
- eigene Aufbewahrungsmetadaten
- eigene Berichte

## Endgültiges Löschen

Die Löschung verwendet eine gemeinsame Schreibtransaktion über alle vier Stores.

Vorbedingungen:

- Projekt existiert
- Lebenszyklusstatus ist `trash`
- eingegebener Name entspricht dem aktuellen Projektnamen exakt
- Oberfläche hat eine separate Bestätigung erhalten

Innerhalb der Transaktion werden Projektstand, projektspezifische Snapshots, Lebenszyklus- und Aufbewahrungsmetadaten sowie projektspezifische Ereignisprotokolle entfernt. Schlägt ein Teil fehl, wird die Transaktion zurückgerollt.

## Berichtsgrenze

`report-generator.js` verarbeitet ausschließlich den aktuellen State-Manager-Zustand. Projekt-ID, Name und Revision werden deshalb bei jedem Bericht neu vom geöffneten Projekt übernommen. Andere gespeicherte Projekte können den Bericht nicht beeinflussen.

## Prüfgrenzen

Die schnelle CI prüft Struktur, JavaScript-Syntax und statische Projektverträge. Der separate Mehrprojekt-Browser-Smoke prüft Desktop und Mobil praktisch. Echte IndexedDB-Transaktionen bleiben zusätzlich auf einem normalen Kubuntu-System abzunehmen, wenn die isolierte Prüfumgebung lokale Navigation blockiert.
