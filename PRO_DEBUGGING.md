# PRO DEBUGGING

## Ziel

Fehler der HTML-Oberfläche, Modul-Registry und Workspace-Zustandsverwaltung reproduzierbar sichtbar machen, ohne den normalen Arbeitsbereich dauerhaft mit Diagnoseinformationen zu belasten.

## Begriffe in einfacher Sprache

- **Quality Gate (Qualitätsschranke):** automatische Prüfung, die fehlerhafte Projektstände erkennt.
- **Registry (Modulverzeichnis):** kennt und verwaltet die späteren Tools.
- **Lifecycle (Lebenszyklus):** Zustandsfolge eines Moduls vom Bekanntmachen bis zum Entfernen.
- **Workspace-Zustand:** gespeicherte Layoutdaten der Arbeitsfläche.
- **Normalisierung:** fehlerhafte Einzelwerte werden kontrolliert auf sichere Werte gebracht.

## Prüfbereich

- Laden der Oberfläche
- Umschalten des Debugbereichs
- Wechsel zwischen Logging-Stufe 1, 2 und 3
- JavaScript-Laufzeitfehler
- unbehandelte Promise-Ablehnungen
- Initialisierung der leeren Modul-Registry
- Modulvertrag und Modulpfade
- Laden, Aktivieren, Deaktivieren und Entfernen eines Testmoduls
- Workspace-Standardzustand
- Workspace-Normalisierung
- beschädigte Workspace-Daten
- gesperrter lokaler Speicher
- Workspace-Reset
- responsive Darstellung

## Schnelle Entwicklerprüfung

Node.js 20 oder neuer verwenden. Es sind keine installierten npm-Pakete erforderlich.

```bash
npm run verify
```

Die Prüfung kombiniert statische Projektprüfung, Registry-Lebenszyklustest und Workspace-Zustandstests.

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
6. Bei Modulproblemen auf `MODULES`, bei Layoutzustandsproblemen auf `WORKSPACE` achten.

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

Reine Statusabfrage:

```js
window.PROVOWARE_MODULES.getSnapshot();
```

### Workspace-Zustand

Unter `window.PROVOWARE_WORKSPACE`:

- `initialisieren`
- `normalisieren`
- `standardzustandErstellen`
- `zustandSetzen`
- `zustandSpeichern`
- `zuruecksetzen`
- `statusLesen`
- `loggerSetzen`

Reine Statusabfrage:

```js
window.PROVOWARE_WORKSPACE.statusLesen();
```

Technischer Reset für die Entwicklungsprüfung:

```js
window.PROVOWARE_WORKSPACE.zuruecksetzen();
```

Der Reset betrifft ausschließlich:

`provoware.allin.workspace.main.v1`

## Typische reproduzierbare Fehlerfälle

### Beschädigtes JSON

Erwartung: Anwendung startet mit Standardlayout weiter und protokolliert die Reparatur im Bereich `WORKSPACE`.

### Unbekannte Panel-ID

Erwartung: unbekannter Eintrag wird ignoriert, bekannte Panels bleiben erhalten.

### Fehlendes Panel

Erwartung: Panel wird anhand der Standardreihenfolge ergänzt.

### Gesperrter Browser-Speicher

Erwartung: aktuelle Sitzung bleibt funktionsfähig; Speicherung schlägt kontrolliert fehl und wird geloggt.

### Reset

Erwartung: Workspace-Schlüssel wird entfernt; Debug-Einstellungen und andere Browserdaten bleiben bestehen.

## Ergebnis

- Logs verbleiben lokal im Arbeitsspeicher.
- Logpuffer ist auf 500 Einträge begrenzt.
- Registry- und Workspace-Fehler werden kontrolliert geloggt.
- GitHub Actions führt `npm run verify` bei Pull Requests und Änderungen auf `main` automatisch aus.

## Rückweg

Die freigegebene Produktversion bleibt `0.2.0`. Die Teilstufe `0.3.0-B` wird als eigener Pull Request umgesetzt und kann dadurch als Einheit zurückgenommen werden. Workspace-Daten sind auf einen eigenen versionierten lokalen Schlüssel begrenzt.
