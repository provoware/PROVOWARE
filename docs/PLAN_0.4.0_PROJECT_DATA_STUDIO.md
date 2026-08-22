# PLAN 0.4.0 – Project Data Studio

## Hauptziel

PROVOWARE erhält eine lokale, projektgebundene Datenebene für zwei zusammengehörige Arbeitsabläufe:

1. Entwicklungsnotizen über ein einzeiliges Dashboard-Feld mit Zeitstempel direkt in eine feste Projekttextdatei schreiben.
2. Strukturierte Projektdaten zentral verwalten, Datensätze bearbeiten und flexible Eingabemasken als wiederverwendbare Vorlagen speichern.

Die bestehende Offline-First-Architektur, der direkte `index.html`-Start und der Modulvertrag Version 1 bleiben erhalten.

## Baseline

- Repository: `provoware/PROVOWARE`
- Ausgangsbranch: `main`
- Baseline-Commit: `6fd1123122cca0c69fd50bdbf69ef2186cc930d0`
- freigegebene Produktversion: `0.2.0`
- bisherige Entwicklungsstufe: `0.3.0-D3a`
- Feature-Branch: `feat/0.4.0-project-data-studio`

## Änderungsgrenze

### Enthalten

- Modul `development-notes`
- Modul `data-studio`
- lokale Server-API für projektgebundene Schreibzugriffe
- feste Datei `data/ENTWICKLUNGSNOTIZEN.txt`
- versionierte zentrale JSON-Datenablage mit atomaren Schreibvorgängen
- Vorlagenbaukasten mit Text, Mehrzeiler, Zahl, Datum, Checkbox und Auswahlfeld
- Erstellen und Bearbeiten von Vorlagen
- Erstellen, Bearbeiten und Löschen von Datensätzen
- serverseitige Validierung und Größenbegrenzung
- sichere Degradierung beim direkten `file://`-Start
- automatische Unit-/Regressionstests für Datenvertrag und Persistenz
- Checkpoint und Abnahmechecklisten
- gezielte Härtung des Quality Gates für die neuen Pflichtdateien

### Bewusst nicht enthalten

- SQLite oder externer Datenbankserver
- Cloud-Synchronisation
- Mehrbenutzerbetrieb
- Dateianhänge/Binärdaten in Datensätzen
- komplexe Relationen zwischen Datensätzen
- Volltextsuche oder SQL-Abfragesprache
- Pointer-Resize `0.3.0-D3b`
- Drag & Drop `0.3.0-E`

## Architekturentscheidung

Die Laufzeit bleibt ohne externe Pakete. Der vorhandene lokale Node-Server erhält eine kleine API-Schicht. Die zentrale Datenablage ist ein versionierter JSON-Store, der ausschließlich über validierte Serverfunktionen verändert wird.

Das verhindert Browser-`localStorage` als versteckte zweite Datenquelle und hält einen späteren Wechsel auf SQLite möglich, ohne die Moduloberfläche vollständig neu bauen zu müssen.

## Datenverträge

### Entwicklungsnotizen

Feste Datei:

`data/ENTWICKLUNGSNOTIZEN.txt`

Jeder Eintrag wird als genau eine Zeile gespeichert:

`[YYYY-MM-DD HH:mm:ss] Text`

Die Eingabe wird getrimmt, Zeilenumbrüche werden auf Leerzeichen reduziert und die Länge begrenzt.

### Zentrale Datenablage

Laufzeitdatei:

`data/project-data.json`

Vertrag Version 1:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

Vorlagen enthalten stabile IDs und versionierte Felddefinitionen. Datensätze referenzieren eine Vorlage und werden gegen deren Feldtypen validiert.

## Implementierungsreihenfolge

1. Checkpoint und Plan festschreiben.
2. Daten-/Validierungslogik als getrennten Serverdienst implementieren.
3. `start.mjs` nur um das Routing zur neuen API erweitern.
4. Entwicklungsnotiz-Modul implementieren.
5. Data-Studio-Modul und Formularbaukasten implementieren.
6. Modulkatalog aktivieren und Styles ergänzen.
7. Unit- und Regressionstests ergänzen.
8. Quality Gate um neue Pflichtdateien und Datenverträge erweitern.
9. README, TODO, CHANGELOG, MANIFEST und VERSION-Metadaten synchronisieren.
10. Pull Request erstellen, GitHub Actions prüfen, Diff kontrollieren und erst danach Merge entscheiden.

## Abnahmekriterien

- Dashboard-Eingabe speichert per Button und Enter.
- Eintrag landet mit Zeitstempel in der festen Projekttextdatei.
- Link `Datei öffnen` öffnet die Textdatei über den lokalen Server.
- Direkter `index.html`-Start bleibt möglich; Schreibfunktionen erklären dort verständlich die Servervoraussetzung.
- Vorlagen können erstellt und erneut geladen/bearbeitet werden.
- Felder können flexibel hinzugefügt und entfernt werden.
- Datensätze können erstellt, erneut geladen, geändert und gelöscht werden.
- ungültige Daten werden serverseitig abgelehnt.
- Schreibvorgänge der JSON-Datenablage sind atomar.
- beschädigte JSON-Daten werden nicht still überschrieben.
- keine neuen Laufzeitabhängigkeiten.
- bestehende Tests bleiben grün.
- neue Tests decken Erfolgs- und Fehlerpfade ab.
- GitHub Actions ist grün.

## Risiken

- Browsermodule benötigen für echte Projektdatei-Schreibzugriffe den lokalen Startserver.
- parallele Schreibzugriffe dürfen die JSON-Datei nicht überschreiben.
- Vorlagenänderungen dürfen bestehende Datensätze nicht unbemerkt invalidieren.
- Datenbankdatei darf nicht als beliebiger Schreibpfad vom Browser steuerbar sein.

## Rückweg

Der gesamte Funktionsumfang ist auf dem Feature-Branch isoliert. Vor Merge kann der Branch ohne Wirkung auf `main` verworfen werden. Nach Merge kann der einzelne Squash-/Merge-Commit zurückgesetzt werden. Bestehende Workspace-Speicherdaten werden nicht verändert.

## Nächste Entwicklungsstufen

1. `0.4.1` – Datenexport/-import, Backup/Restore und Migrationsproben.
2. `0.4.2` – relationale Feldtypen, Such-/Filteransicht und optionale SQLite-Adapter-Schnittstelle.
