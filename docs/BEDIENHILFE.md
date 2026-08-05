# Bedienhilfe

## Start

1. Im Projektordner ein Terminal öffnen.
2. `python3 -m http.server 8080` eingeben.
3. Im Browser `http://localhost:8080` öffnen.

Alternativ kann `index.html` direkt geöffnet werden. Dann kann der Browser getrennte JSON-Dateien blockieren; der sichtbare Hinweis „Direktdatei-Fallback“ bestätigt den sicheren Beispieldatenmodus.

## Aktuelles Projekt erkennen

Der Name des aktuell geöffneten Projekts steht oben im Header. Alle Antworten, Snapshots, Exporte und Berichte beziehen sich ausschließlich auf dieses Projekt.

## Projekte verwalten

Rechts auf **„Projekte verwalten“** klicken.

Die Übersicht zeigt Projektname, Projekt-ID, Status, Revision, Antwortzahl, Speicherzeitpunkt und Projektschema. Mit Suche und Statusfilter lassen sich aktive Projekte, Archiv und Papierkorb getrennt anzeigen.

Unterstützt werden:

- neues Projekt
- Projekt öffnen
- umbenennen
- duplizieren
- archivieren
- in den Papierkorb verschieben
- wiederherstellen
- endgültig löschen

Endgültiges Löschen verlangt den exakten Projektnamen und eine separate Bestätigung.

## Projekt als JSON sichern

1. **„Projekt sichern oder importieren“** öffnen.
2. **„Aktuelles Projekt als JSON sichern“** drücken.
3. Die erzeugte Datei an einem unabhängigen Ort aufbewahren.

Das Paket enthält Projekt-ID, Namen, Revision, Schema, Fragenkatalogversion, vollständigen Projektstand und Prüfsumme.

Die Prüfsumme erkennt typische Beschädigungen. Sie ist keine kryptografische Signatur und beweist nicht, von wem die Datei stammt.

## Projektdatei prüfen

1. **„Projekt sichern oder importieren“** öffnen.
2. Über das Dateifeld eine `.json`-Datei auswählen.
3. Die Datei wird zunächst nur lokal gelesen.
4. Prüfergebnis vollständig ansehen.

Geprüft werden:

- Dateigröße bis zwei MiB
- JSON-Syntax
- Paketschema
- Prüfsumme
- Projektschema und notwendige Migration
- Projekt-ID und Name
- Frage-IDs
- Antwortwerte
- vorhandenes lokales Projekt
- Änderungen und Konflikte

Der Import bleibt gesperrt, solange ein Fehler angezeigt wird.

## Importvorschau verstehen

### Prüfsumme

- **gültig:** Paketkern entspricht der gespeicherten Prüfsumme
- **ungültig:** Datei wurde beschädigt oder verändert; Import bleibt gesperrt

### Projektschema

Eine Anzeige wie `1.1.0 → 1.2.0` bedeutet, dass der Import vor der Übernahme schrittweise im Arbeitsspeicher migriert wird.

### Lokal vorhanden

Steht dort ein Projektname mit Revision, existiert bereits ein Projekt mit derselben ID.

### Konflikte

Die Vorschau nennt:

- geänderte Grundfelder
- abweichende Antworten
- nur im Import vorhandene Antworten
- nur lokal vorhandene Antworten

## Importart auswählen

### Projekt-ID beibehalten

Nur verfügbar, wenn die importierte ID lokal noch frei ist.

### Als unabhängiges neues Projekt importieren

Empfohlene Standardwahl bei einer ID-Kollision. Das importierte Projekt erhält eine neue ID; das lokale Projekt bleibt unverändert.

### Vorhandenes Projekt ersetzen

Nur bei einem aktiven vorhandenen Projekt verfügbar.

Vor der Freigabe:

1. lokalen Projektnamen exakt eingeben,
2. separates Bestätigungsfeld aktivieren,
3. Vorschau nochmals kontrollieren.

Die Anwendung legt zuerst eine unveränderte Sicherheitsrevision `pre-import-backup` an. Erst danach wird der importierte Stand gespeichert.

Archivierte Projekte und Papierkorbprojekte können nicht ersetzt werden.

## Workflow

- Links eine Planungsphase auswählen.
- In der Mitte eine Antwort anklicken.
- Beispiel, Pro, Contra, Alternative und Empfehlung lesen.
- „Empfehlung übernehmen“ setzt den empfohlenen Wert.
- Rechts erscheinen Entscheidungen, Hinweise und die Planvorschau.

## Bericht prüfen und exportieren

1. **„Bericht prüfen und exportieren“** öffnen.
2. Projektstatus und Kennzahlen kontrollieren.
3. Markdown, Offline-HTML, Text oder JSON auswählen.
4. Vorschau prüfen.
5. Format herunterladen.

Projekt-ID und Revision im Bericht entsprechen immer dem aktuell geöffneten Projekt.

## Speicherstände verwalten

1. **„Speicherstände verwalten“** öffnen.
2. Revision auswählen.
3. Prüfergebnis und JSON-Vorschau kontrollieren.
4. Bestätigungsfeld aktivieren.
5. Snapshot als neue Revision wiederherstellen.

Snapshots werden nur für das aktuell geöffnete Projekt angezeigt.

## Tastaturbedienung

### Dialoge

- Tab wechselt zum nächsten Element im obersten Dialog.
- Umschalt+Tab wechselt zum vorherigen Element.
- Am letzten beziehungsweise ersten Element bleibt der Fokus im Dialog und springt zyklisch weiter.
- Escape schließt zuerst eine offene Unteraktion und danach den Dialog.
- Nach dem Schließen kehrt der Fokus zur tatsächlich verwendeten Auslöseschaltfläche zurück.

### Listen und Aktionsgruppen

In Projektliste, Snapshot-Liste und markierten Aktionsgruppen:

- Pfeil nach unten oder rechts: nächster Eintrag
- Pfeil nach oben oder links: vorheriger Eintrag
- Home: erster Eintrag
- Ende: letzter Eintrag

### Barrierefreiheits-Grundprüfung

Beim Öffnen des Transferdialogs wird eine automatisierte Grundprüfung ausgeführt. Sie meldet die Zahl technischer Fehler und Hinweise.

Diese Prüfung ersetzt keine reale Screenreader-Abnahme. Für eine endgültige Freigabe sind Orca unter Kubuntu und ergänzend NVDA oder VoiceOver praktisch zu prüfen.

## Datenschutz

Alle Projekte bleiben lokal in IndexedDB. Importdateien werden nur nach ausdrücklicher Dateiauswahl gelesen. Eine Browserdaten-Bereinigung kann lokale Projekte löschen; regelmäßige JSON-Sicherungen sollten außerhalb des Browserprofils gespeichert werden.
