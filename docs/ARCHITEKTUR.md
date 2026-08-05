# Architektur

## Ziel

Die Anwendung trennt Oberfläche, Zustand, Workflow, Regeln, Validierung, Berichte, Projektverwaltung, Projekttransfer, Zugänglichkeit, Migration und Speicherung. Keine Fachlogik liegt direkt in `index.html`.

## Laufzeitfluss

```text
index.html
  → migration-engine.js stellt reine Einzelschritt-Migrationen bereit
  → storage-engine.js stellt IndexedDB, Revisionen und Migrationstransaktionen bereit
  → project-repository.js verwaltet mehrere Projekte und deren Lebenszyklus
  → project-transfer.js bildet, prüft, migriert und vergleicht Projektpakete
  → state-manager.js hält ausschließlich das aktuell geöffnete Projekt
  → workflow-engine.js bestimmt Fragen und Phasen
  → validation-engine.js prüft Kataloge und Projektschema
  → rule-engine.js leitet Konflikte und Empfehlungen ab
  → report-generator.js erzeugt den Bericht des aktuellen Projekts
  → app-ui.js rendert Workflow und Live-Auswertung
  → accessibility.js steuert Dialogfokus, Escape, Pfeiltasten und Grundprüfung
  → project-manager.js rendert Projektübersicht und Lebenszyklusaktionen
  → project-transfer-manager.js rendert Export, Importvorschau und Bestätigungen
  → report-manager.js prüft Vorschau und lokale Exporte
  → storage-manager.js rendert Snapshots und Wiederherstellung
  → app.js serialisiert Speicherung, Projektwechsel und Importübernahme
```

## Projekttransfergrenze

### `project-transfer.js`

Das Modul besitzt keine Dateiauswahl und keine direkten IndexedDB-Zugriffe. Es verarbeitet reine Datenobjekte.

Aufgaben:

- Projektpaket `1.0.0` erzeugen
- Herkunftsmetadaten und Projektstand zusammenstellen
- deterministische Paketprüfsumme bilden
- JSON-Größe und Grundstruktur prüfen
- Legacy-Projekte über die bestehende Migrationsmatrix vorbereiten
- Namen, Fragen und Antwortwerte validieren
- importierten und vorhandenen Projektstand vergleichen
- Konfliktzahl und sichere Importempfehlung ableiten
- zulässige Übernahmemodi bestimmen

Die Prüfsumme erkennt typische Beschädigungen und unbeabsichtigte Änderungen. Sie ist keine kryptografische Signatur. Die eigentliche Schutzgrenze entsteht durch die Kombination aus Größenlimit, JSON-Parsing, Paketschema, Prüfsumme, Projektschemamigration und fachlicher Katalogvalidierung.

### `project-transfer-manager.js`

- liest eine ausdrücklich ausgewählte lokale Datei zunächst ausschließlich über `file.text()`
- zeigt sämtliche Prüfergebnisse und Unterschiede vor einer Speicherung
- empfiehlt bei einer Projekt-ID-Kollision eine neue unabhängige ID
- fordert beim Ersetzen exakten Namen und separates Bestätigungsfeld
- führt die Barrierefreiheits-Grundprüfung sichtbar aus
- besitzt keine direkte IndexedDB-Transaktion

### `app.js`

Die dauerhafte Übernahme bleibt in `app.js` koordiniert.

Importmodi:

1. **Original-ID beibehalten:** nur bei freier Projekt-ID.
2. **Neue ID:** erzeugt ein unabhängiges aktives Projekt.
3. **Ersetzen:** nur für ein aktives vorhandenes Projekt.

Vor dem Ersetzen wird der unveränderte lokale Projektstand als neue Revision `pre-import-backup` gespeichert. Erst danach wird der importierte Stand in einer separaten validierten Speicherung übernommen. Scheitert der zweite Schritt, bleibt der alte aktuelle Stand beziehungsweise seine Sicherungsrevision erhalten.

## Zugänglichkeitsgrenze

### `accessibility.js`

Die zentrale Schicht wird vor den Dialogmanagern initialisiert und erweitert die nativen Dialogmethoden.

Enthalten:

- Stapel der geöffneten Dialoge
- tatsächlicher Auslöser je Dialog
- Fokusfalle für Tab und Umschalt+Tab
- Escape-Verarbeitung ausschließlich am obersten Dialog
- Weiterleitung über das native `cancel`-Ereignis
- Rückkehr zum Auslöser nach dem Schließen
- Pfeiltastennavigation für markierte Listen und Aktionsgruppen
- Home-/Ende-Navigation
- automatisierte Grundprüfung

Die bestehende Projektverwaltung verwendet das `cancel`-Ereignis für eine Hierarchie: Ein erstes Escape schließt eine geöffnete Umbenennungs-, Kopier- oder Löschaktion; erst ein weiteres Escape schließt den Projektmanager.

Die Grundprüfung kontrolliert statische und DOM-basierte Fehler, ersetzt aber keine tatsächliche Nutzung mit Orca, NVDA oder VoiceOver.

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

## Unabhängigkeit

Die logische Trennung erfolgt durch `projectId` in:

- `projects`
- `snapshots`
- `meta`
- `migrationLog`
- Exportpaket und Importvorschau
- Berichtskopf und Rückverfolgbarkeit

Ein Duplikat oder ein Import mit neuer ID besitzt eine eigene Revisions- und Snapshotfolge.

## Prüfgrenzen

Die schnelle CI prüft Struktur, Schemata, JavaScript-Syntax und reine Projekt-, Transfer- und A11y-Verträge. Vier getrennte Browsergruppen prüfen Workflow, Mehrprojektverwaltung, Transfer/Zugänglichkeit und Speicherfehler. Echte IndexedDB-Transaktionen und reale Screenreader-Nutzung bleiben zusätzlich auf einem normalen Kubuntu-System abzunehmen, wenn eine isolierte Prüfumgebung lokale Navigation blockiert.
