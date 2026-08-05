# Datenmodell

## Fragenkatalog

Jede Frage besitzt:

- eindeutige ID
- Phase
- Antworttyp
- Pflichtstatus
- kurze Erklärung
- Begründung
- Beispiel
- Pro und Contra
- Alternative und Empfehlung
- Fachinformation
- gültige Optionen

## Regelkatalog

Eine Regel enthält ID, Schweregrad, Bedingungen, Meldung und empfohlene Maßnahme. Der Minimalprototyp unterstützt `all`- und `any`-Bedingungsgruppen.

## Projektstand

Das erste Schema `1.0.0` definiert Projekt-ID, Name, Antworten, aktuelle Frage und Zeitstempel. Persistenz und Migration folgen in der nächsten Iteration.

## Vorlagen

Eine Vorlage enthält sichere Standardantworten. Sie verändert im Prototyp noch keine bestehenden Projekte automatisch.
