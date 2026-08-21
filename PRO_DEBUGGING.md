# PRO DEBUGGING

## Ziel

Fehler der HTML-Oberfläche reproduzierbar sichtbar machen, ohne den normalen Arbeitsbereich dauerhaft mit Diagnoseinformationen zu belasten.

## Prüfbereich

- Laden der Oberfläche
- Umschalten des Debugbereichs
- Wechsel zwischen Logging-Stufe 1, 2 und 3
- JavaScript-Laufzeitfehler
- unbehandelte Promise-Ablehnungen
- responsive Darstellung

## Reproduktion

1. `index.html` im Browser öffnen.
2. `Debug & Logging` einschalten.
3. Geeignete Logging-Stufe wählen.
4. Fehlerzustand reproduzieren.
5. Zeit, Stufe, Bereich und Meldung vergleichen.

## Diagnose

Der Logger ist unter `window.PROVOWARE_DEBUG` erreichbar. Verfügbar sind `log`, `clear`, `setLevel`, `show`, `hide` und `getState`.

## Ergebnis

Logs verbleiben lokal im Arbeitsspeicher und sind auf 500 Einträge begrenzt.

## Rückweg

Der komplette UI-Schritt basiert auf Commit `e15c45ca9a355ae564cd25cb15aa7e59fac90ffa`. Ein Rückbau kann durch Revert der UI-Foundation-Änderungen erfolgen.
