# PLAN 0.4.2 – Data Studio PRO

## Ziel

Data Studio von der reinen Vorlagen-/Datensatzbearbeitung zu einer effizient nutzbaren Projekt-Datenoberfläche ausbauen. Schwerpunkt sind Auffindbarkeit, Organisation und wiederverwendbare Ansichten. Das bestehende Project-Data-Produktionsschema bleibt Version 1.

## Verbindlicher Funktionsumfang

1. Datensätze innerhalb der gewählten Vorlage per Volltextsuche filtern.
2. Datensätze reproduzierbar nach Aktualisierung oder Erstellung auf-/absteigend sortieren.
3. Vorlagen in frei benennbare Kategorien organisieren.
4. eine kompakte Vorlagenbibliothek mit Suche, Kategorie-Filter, Feld- und Datensatzanzahl anbieten.
5. eine gewählte Vorlage als portables JSON exportieren.
6. aktuelle Arbeitsansichten unter einem Namen speichern und wieder anwenden.
7. gespeicherte Ansichten löschen können.
8. alle PRO-Metadaten serverseitig und projektgebunden speichern; keine zweite Browser-Persistenz.

## Datenarchitektur

Das Kernschema `data/project-data.json` bleibt unverändert bei `schemaVersion: 1`.

PRO-Metadaten werden getrennt gespeichert in:

`data/data-studio-pro.json`

Eigener kleiner Vertrag Version 1:

- `schemaVersion`
- `revision`
- `categories[]`
- `templateCategories[]`
- `savedViews[]`

Damit werden Kategorien und Ansichten nicht künstlich in das bereits abgenommene Project-Data-Schema gedrückt. Die Datei ist lokale Runtime-Konfiguration, wird aus Git ausgeschlossen und nicht statisch ausgeliefert.

## Gespeicherte Ansicht

Eine Ansicht speichert nur UI-/Abfragezustand:

- Name
- gewählte Vorlage
- Kategorie-Filter
- Datensatz-Suchtext
- Sortierung

Sie enthält keine Kopie von Datensätzen und keine frei wählbaren Dateipfade.

## Vorlagenexport

Exportformat:

- Kennung `provoware-data-studio-template`
- Formatversion 1
- Exportzeitpunkt
- Vorlagenname und Beschreibung
- Felddefinitionen
- optionale Kategoriebezeichnung

Datensätze werden bewusst nicht in einen Vorlagenexport aufgenommen.

## Sicherheits- und Robustheitsregeln

- Same-Origin bleibt Pflicht für alle schreibenden PRO-Routen.
- feste serverseitige Runtime-Datei statt Browserpfaden.
- atomarer Dateiersatz über Temp-Datei und Rename.
- PRO-Mutationen verwenden dieselbe zentrale Mutationssperre wie Project Data und Recovery.
- Kategorienamen und Ansichten werden serverseitig normalisiert und begrenzt.
- Referenzen auf Vorlagen werden gegen die aktuelle Project-Data-Datenbank geprüft.
- `localStorage` und `sessionStorage` bleiben für Data Studio/Recovery verboten.
- `file://` degradiert weiterhin kontrolliert in einen nicht schreibfähigen Zustand.

## Browser-Abnahme

Der vorhandene Chromium-first E2E-Lauf wird erweitert um:

1. Kategorie anlegen.
2. Vorlage der Kategorie zuweisen.
3. Vorlagenbibliothek filtern.
4. Datensatzsuche mit Treffer und Nulltreffer prüfen.
5. gespeicherte Ansicht erzeugen, Filter verändern und Ansicht wieder anwenden.
6. Vorlagenexport herunterladen und Vertrag prüfen.
7. Reload und Persistenz der PRO-Metadaten prüfen.

Firefox bleibt optionaler Alternativlauf.

## Nicht Teil von 0.4.2

- keine relationale Feldtypen
- keine Template-Importfunktion
- kein SQLite-Adapter
- keine Änderung des Project-Data-Schemas v1
- keine Cross-OS-/Windows-Dateisystemhärtung; folgt als eigener Qualitätsstrang
