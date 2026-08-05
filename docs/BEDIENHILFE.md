# Bedienhilfe

## Start

1. Im Projektordner ein Terminal öffnen.
2. `python3 -m http.server 8080` eingeben.
3. Im Browser `http://localhost:8080` öffnen.

Alternativ kann `index.html` direkt geöffnet werden. Dann kann der Browser die getrennten JSON-Dateien blockieren; der sichtbare Hinweis „Direktdatei-Fallback“ bestätigt den sicheren Beispieldatenmodus.

## Bedienung

- Links eine Planungsphase auswählen.
- In der Mitte eine Antwort anklicken.
- Unter der Frage Beispiel, Pro, Contra, Alternative und Empfehlung lesen.
- „Empfehlung übernehmen“ setzt den empfohlenen Wert.
- Rechts erscheinen Entscheidungen, Hinweise und eine Markdown-Vorschau.
- Mit Tab, Umschalt+Tab, Leertaste und Enter ist die Oberfläche ohne Maus bedienbar.

## Ampel

- **Gelb – Unvollständig:** Pflichtfragen sind noch offen.
- **Grün – Vollständig:** alle Pflichtfragen wurden beantwortet.
- **Rot – Konflikt:** mindestens zwei Antworten widersprechen sich.

## Datenschutz

Der Prototyp sendet keine Daten ins Internet. Antworten existieren derzeit nur während der geöffneten Browsersitzung und werden noch nicht dauerhaft gespeichert.
