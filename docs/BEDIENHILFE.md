# Bedienhilfe

## Start

1. Im Projektordner ein Terminal öffnen.
2. `python3 -m http.server 8080` eingeben.
3. Im Browser `http://localhost:8080` öffnen.

Alternativ kann `index.html` direkt geöffnet werden. Dann kann der Browser getrennte JSON-Dateien blockieren; der sichtbare Hinweis „Direktdatei-Fallback“ bestätigt den sicheren Beispieldatenmodus.

## Aktuelles Projekt erkennen

Der Name des aktuell geöffneten Projekts steht oben im Header. Alle Antworten, Snapshots und Berichte beziehen sich ausschließlich auf dieses Projekt.

## Projekte verwalten

Rechts auf **„Projekte verwalten“** klicken.

Die Übersicht zeigt:

- Projektname und Projekt-ID
- Status
- Revision
- Anzahl gespeicherter Antworten
- letzten Speicherzeitpunkt
- Projektschema
- Kennzeichnung des aktuell geöffneten Projekts

Mit dem Suchfeld kann nach Name oder Projekt-ID gesucht werden. Der Statusfilter zeigt aktive Projekte, Archiv, Papierkorb oder alle Projekte.

## Neues Projekt

1. Unter **„Neues Projekt“** einen verständlichen Namen eingeben.
2. **„Projekt anlegen“** drücken.
3. Die Projektverwaltung schließt sich.
4. Das neue Projekt wird sofort geöffnet.

Ein neues Projekt beginnt ohne Antworten und besitzt eine eigene Projekt-ID, Revision 1 und eigene Snapshots.

## Projekt öffnen

Nur aktive Projekte können direkt geöffnet werden. Bei einem anderen aktiven Projekt auf **„Öffnen“** klicken.

Vor dem Wechsel speichert die Anwendung ausstehende Änderungen des bisherigen Projekts. Danach wird ausschließlich der gewählte Projektstand geladen.

## Projekt umbenennen

1. Beim aktiven Projekt **„Umbenennen“** drücken.
2. Neuen Namen kontrollieren oder eingeben.
3. **„Umbenennen“** bestätigen.

Der neue Name wird als neue Revision gespeichert. Frühere Snapshots behalten den damals verwendeten Namen.

## Projekt duplizieren

1. **„Duplizieren“** drücken.
2. Namen der Kopie festlegen.
3. **„Kopie erstellen“** bestätigen.

Die Kopie übernimmt Antworten und Einstellungen, besitzt aber eine neue Projekt-ID, Revision 1, eigene Snapshots und eigene Berichte.

## Archiv

**„Archivieren“** entfernt ein Projekt aus der aktiven Arbeitsliste, ohne Daten zu löschen.

Zum Zurückholen:

1. Filter **„Archiv“** wählen.
2. Beim Projekt **„Wiederherstellen“** drücken.

Das Projekt wird wieder aktiv und kann anschließend geöffnet werden.

## Papierkorb

**„In Papierkorb“** markiert das Projekt für mögliche Wiederherstellung oder endgültige Löschung. Projektstand und Snapshots bleiben zunächst vollständig erhalten.

Zum Zurückholen:

1. Filter **„Papierkorb“** wählen.
2. **„Wiederherstellen“** drücken.

## Endgültig löschen

Diese Aktion ist nicht rückgängig zu machen.

1. Projekt zuerst in den Papierkorb verschieben.
2. Filter **„Papierkorb“** wählen.
3. **„Endgültig löschen“** drücken.
4. Den vollständigen Projektnamen exakt eingeben.
5. Das separate Bestätigungsfeld aktivieren.
6. **„Endgültig löschen“** drücken.

Ein falscher Name, fehlende Bestätigung oder ein Projekt außerhalb des Papierkorbs blockiert die Löschung.

Gelöscht werden ausschließlich die Daten dieses Projekts:

- aktueller Stand
- Snapshots
- Aufbewahrungs- und Lebenszyklusmetadaten
- Ereignis- und Migrationsprotokolle

Andere Projekte bleiben unberührt.

## Aktuelles Projekt archivieren oder verschieben

Wird das gerade geöffnete Projekt archiviert oder in den Papierkorb verschoben, öffnet die Anwendung automatisch ein anderes aktives Projekt. Existiert keines, wird ein neues leeres Projekt angelegt.

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

## Tastatur

- Tab und Umschalt+Tab wechseln Bedienelemente.
- Enter aktiviert Schaltflächen und Formulare.
- Escape schließt zuerst eine offene Projektaktion, danach den Dialog.
- Nach dem Schließen kehrt der Fokus zur öffnenden Schaltfläche zurück.

## Datenschutz

Alle Projekte bleiben lokal in IndexedDB. Eine Browserdaten-Bereinigung kann sie löschen. Ein geprüfter Projekt-JSON-Export und Import-Assistent ist der nächste geplante Sicherungsschritt.
