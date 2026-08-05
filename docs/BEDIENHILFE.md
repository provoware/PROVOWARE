# Bedienhilfe

## Start

1. Im Projektordner ein Terminal öffnen.
2. `python3 -m http.server 8080` eingeben.
3. Im Browser `http://localhost:8080` öffnen.

Alternativ kann `index.html` direkt geöffnet werden. Dann kann der Browser getrennte JSON-Dateien blockieren; der sichtbare Hinweis „Direktdatei-Fallback“ bestätigt den sicheren Beispieldatenmodus.

## Workflow

- Links eine Planungsphase auswählen.
- In der Mitte eine Antwort anklicken.
- Beispiel, Pro, Contra, Alternative und Empfehlung lesen.
- „Empfehlung übernehmen“ setzt den empfohlenen Wert.
- Rechts erscheinen Entscheidungen, Hinweise und die Planvorschau.

## Speicherstände verwalten

1. Rechts auf **„Speicherstände verwalten“** klicken.
2. Links eine Revision auswählen.
3. Prüfen, ob sie als „Gültig“ oder „Sicherheitsstand“ markiert ist.
4. Zeitpunkt, Speichergrund, Antwortzahl und JSON-Vorschau kontrollieren.
5. Das Bestätigungsfeld aktivieren.
6. **„Ausgewählten Snapshot wiederherstellen“** drücken.

Die wiederhergestellten Daten werden als neue Revision gespeichert. Der ursprüngliche Snapshot bleibt erhalten.

## Manueller Sicherheitsstand

**„Jetzt Sicherheitsstand anlegen“** speichert den aktuellen Projektstand sofort mit einem verständlichen Speichergrund.

## Aufbewahrungsgrenze

- Mindestwert: 5
- Standardwert: 30
- Höchstwert: 200

Nach **„Grenze anwenden“** werden ältere Überschüsse entfernt. Der jüngste gültige Sicherheitsstand bleibt immer erhalten.

## Ampel

- **Gelb – Unvollständig:** Pflichtfragen sind noch offen.
- **Grün – Vollständig:** alle Pflichtfragen wurden beantwortet.
- **Rot – Konflikt:** mindestens zwei Antworten widersprechen sich.

## Tastatur

- Tab und Umschalt+Tab wechseln Bedienelemente.
- Enter oder Leertaste aktiviert Schaltflächen und Auswahlfelder.
- Escape schließt die Speicherverwaltung.
- Nach dem Schließen kehrt der Fokus zur öffnenden Schaltfläche zurück.

## Datenschutz

Alle Projektstände bleiben lokal in IndexedDB. Eine manuelle Browserdaten-Bereinigung kann sie löschen. Ein unabhängiger JSON-Sicherungsexport ist noch offen.
