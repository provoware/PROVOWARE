# PRO DEBUGGING

## Ziel

Fehler der HTML-Oberfläche, Modul-Registry und Workspace-Funktionen reproduzierbar sichtbar machen, ohne den normalen Arbeitsbereich dauerhaft mit Diagnoseinformationen zu belasten.

## Begriffe in einfacher Sprache

- **Quality Gate (Qualitätsschranke):** automatische Prüfung, die fehlerhafte Projektstände erkennt.
- **Registry (Modulverzeichnis):** kennt und verwaltet die späteren Tools.
- **Workspace-Zustand:** gespeicherte Layoutdaten der Arbeitsfläche.
- **Normalisierung:** fehlerhafte Einzelwerte werden kontrolliert auf sichere Werte gebracht.
- **UI-Controller:** kleine Bedienlogik, die den gültigen Workspace-Zustand auf HTML-Elemente anwendet.

## Prüfbereich

- Laden der Oberfläche
- Umschalten des Debugbereichs
- Wechsel zwischen Logging-Stufe 1, 2 und 3
- JavaScript-Laufzeitfehler
- unbehandelte Promise-Ablehnungen
- Modul-Registry und Modul-Lebenszyklus
- Workspace-Standardzustand
- Workspace-Normalisierung
- beschädigte Workspace-Daten
- gesperrter lokaler Speicher
- einzelne Panel-Sichtbarkeit
- alle Panels gleichzeitig ausgeblendet
- `Alle anzeigen`
- Workspace-Reset
- Layout-Menü öffnen/schließen
- `Escape` und Fokus-Rückkehr
- vollständige HTML-Zuordnung der fünf Panel-IDs
- permanenter `Layout`-Schalter außerhalb des Workspace
- responsive Darstellung

## Schnelle Entwicklerprüfung

Node.js 20 oder neuer verwenden. Es sind keine installierten npm-Pakete erforderlich.

```bash
npm run verify
```

Die Prüfung kombiniert statische Projektprüfung, Registry-Lebenszyklustest, Workspace-Zustandstests und Workspace-UI-Tests.

## Sichere automatische Korrektur

```bash
npm run fix
```

Dieser Befehl repariert nur sichere Formatabweichungen. Fachliche Programmlogik wird nicht automatisch verändert.

## Reproduktion im Browser

1. `index.html` in Firefox öffnen.
2. `Layout` öffnen.
3. einen Bereich ausblenden.
4. Seite neu laden und prüfen, ob die Sichtbarkeit erhalten bleibt.
5. alle Bereiche ausblenden und prüfen, ob `Layout` weiterhin sichtbar bleibt.
6. `Alle anzeigen` verwenden.
7. erneut einen Bereich ausblenden und `Standardlayout wiederherstellen` verwenden.
8. `Debug & Logging` einschalten.
9. bei Problemen den Bereich `WORKSPACE` prüfen.
10. denselben Ablauf stichprobenartig in Chrome wiederholen.

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

Unter `window.PROVOWARE_MODULES` unter anderem:

- `initialize`
- `load`
- `activate`
- `deactivate`
- `remove`
- `getSnapshot`

### Workspace-Zustand

Unter `window.PROVOWARE_WORKSPACE`:

- `initialisieren`
- `normalisieren`
- `standardzustandErstellen`
- `zustandSetzen`
- `zustandSpeichern`
- `panelSichtbarkeitSetzen`
- `allePanelsAnzeigen`
- `zuruecksetzen`
- `statusLesen`
- `loggerSetzen`

Reine Statusabfrage:

```js
window.PROVOWARE_WORKSPACE.statusLesen();
```

Beispiel für eine gezielte Sichtbarkeitsprüfung:

```js
window.PROVOWARE_WORKSPACE.panelSichtbarkeitSetzen("modules", false);
```

Technischer Reset:

```js
window.PROVOWARE_WORKSPACE.zuruecksetzen();
```

Der Reset betrifft ausschließlich:

`provoware.allin.workspace.main.v1`

### Workspace-UI

Unter `window.PROVOWARE_WORKSPACE_UI`:

- `initialisieren`
- `zustandAnwenden`
- `menueSetzen`
- `statusMelden`
- `istInitialisiert`

Die UI besitzt keinen eigenen persistenten Layoutzustand. Die verbindliche Quelle bleibt `window.PROVOWARE_WORKSPACE`.

## Typische reproduzierbare Fehlerfälle

### Alle Panels ausgeblendet

Erwartung: Arbeitsfläche ist leer, `Layout` bleibt sichtbar und kann `Alle anzeigen` oder den Reset ausführen.

### Unbekannte Panel-ID

Erwartung: die Zustands-API lehnt die Änderung ab; der bisherige Zustand bleibt erhalten.

### Gesperrter Browser-Speicher

Erwartung: aktuelle Sitzung bleibt funktionsfähig; Speicherung schlägt kontrolliert fehl und wird geloggt.

### UI und Zustand stimmen nicht überein

Erwartung: erneutes Anwenden von `statusLesen()` über die UI stellt die Darstellung aus der zentralen Zustandsquelle wieder her.

### Reset

Erwartung: Workspace-Schlüssel wird entfernt; Debug-Einstellungen und andere Browserdaten bleiben bestehen.

## Ergebnis

- Logs verbleiben lokal im Arbeitsspeicher.
- Logpuffer ist auf 500 Einträge begrenzt.
- Registry-, Workspace-State- und Workspace-UI-Fehler werden kontrolliert geloggt.
- GitHub Actions führt `npm run verify` bei Pull Requests und Änderungen auf `main` automatisch aus.

## Rückweg

Die freigegebene Produktversion bleibt `0.2.0`. `0.3.0-C` wird als eigener Pull Request umgesetzt und kann als Einheit zurückgenommen werden. Workspace-Daten bleiben auf den eigenen versionierten lokalen Schlüssel begrenzt.
