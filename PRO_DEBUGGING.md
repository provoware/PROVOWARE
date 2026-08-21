# PRO DEBUGGING

## Ziel

Fehler der HTML-Oberfläche und der Modul-Registry reproduzierbar sichtbar machen, ohne den normalen Arbeitsbereich dauerhaft mit Diagnoseinformationen zu belasten.

## Begriffe in einfacher Sprache

- **Quality Gate (Qualitätsschranke):** automatische Prüfung, die fehlerhafte Projektstände erkennt.
- **Registry (Modulverzeichnis):** kennt und verwaltet die späteren Tools.
- **Lifecycle (Lebenszyklus):** Zustandsfolge eines Moduls vom Bekanntmachen bis zum Entfernen.

## Prüfbereich

- Laden der Oberfläche
- Umschalten des Debugbereichs
- Wechsel zwischen Logging-Stufe 1, 2 und 3
- JavaScript-Laufzeitfehler
- unbehandelte Promise-Ablehnungen
- Initialisierung der leeren Modul-Registry
- Modulvertrag und Modulpfade
- Laden, Aktivieren, Deaktivieren und Entfernen eines Testmoduls
- responsive Darstellung

## Schnelle Entwicklerprüfung

Node.js 20 oder neuer verwenden. Es sind keine installierten npm-Pakete erforderlich.

```bash
npm run verify
```

Die Prüfung kombiniert statische Projektprüfung und einen echten automatischen Registry-Lebenszyklustest.

## Sichere automatische Korrektur

```bash
npm run fix
```

Dieser Befehl repariert nur sichere Formatabweichungen. Fachliche Programmlogik wird nicht automatisch verändert.

## Reproduktion im Browser

1. `index.html` im Browser öffnen.
2. `Debug & Logging` einschalten.
3. Geeignete Logging-Stufe wählen.
4. Fehlerzustand reproduzieren.
5. Zeit, Stufe, Bereich und Meldung vergleichen.
6. Bei Modulproblemen besonders auf den Bereich `MODULES` achten.

## Diagnose-Schnittstellen

### Logger

Unter `window.PROVOWARE_DEBUG`:

- `log`
- `clear`
- `setLevel`
- `show`
- `hide`
- `getState`

### Modul-Registry

Unter `window.PROVOWARE_MODULES`:

- `initialize`
- `define`
- `load`
- `activate`
- `deactivate`
- `remove`
- `getSnapshot`
- `setLogger`
- `validateManifest`

Beispiel für eine reine Statusabfrage in der Browserkonsole:

```js
window.PROVOWARE_MODULES.getSnapshot();
```

Bei Version 0.2.0 ist das normale Ergebnis eine leere Liste, weil noch keine Fachmodule registriert sind.

## Ergebnis

- Logs verbleiben lokal im Arbeitsspeicher.
- Logpuffer ist auf 500 Einträge begrenzt.
- Registry-Fehler werden kontrolliert geloggt.
- GitHub Actions führt `npm run verify` bei Pull Requests und Änderungen auf `main` automatisch aus.

## Rückweg

Baseline für 0.2.0 ist Commit `cda1c4092d2a041cbacf4a72308ed9b08406317f`. Der komplette 0.2.0-Schritt soll als einzelner Pull Request mergebar und damit auch als Einheit revertierbar bleiben.
