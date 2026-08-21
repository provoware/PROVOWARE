# PROVOWARE ALL-IN 2026

Modulare, flexible und bewusst noch fachlich leere HTML-Oberfläche. Die freigegebene Produktversion ist `0.2.0`. Parallel wird die Flexible Workspace Engine schrittweise entwickelt; aktuell befindet sich `0.3.0-B – State Foundation & Autosave/Reset` in der technischen Abnahme.

## Start für normale Nutzung

`index.html` direkt in Firefox oder Chrome öffnen.

Für die Oberfläche selbst werden weder Server noch npm-Pakete noch Netzwerkzugriff benötigt.

## Oberfläche

- Seitenleiste
- Kopfbereich
- Übersicht
- Module
- Arbeitsbereich
- Detailbereich
- Systemstatus
- versteckbarer Bereich `Debugging & Logging`

Die Bereiche enthalten weiterhin keine erfundenen Fachfunktionen.

## Modulprinzip

Ein **Modul-Steckbrief (Manifest)** beschreibt ein späteres Tool. Das zentrale **Modulverzeichnis (Registry)** prüft diesen Steckbrief, bevor JavaScript geladen wird.

Der feste **Lebenszyklus (Lifecycle)** lautet:

`registered -> loading -> loaded -> active -> inactive -> registered`

Bei einem kontrollierten Fehler wird der Zustand `error` verwendet.

Aktuell ist `modules/registry.js` absichtlich leer. Es werden noch keine Fachmodule ausgeliefert.

Die vollständigen Regeln stehen in [`docs/MODULE_CONTRACT.md`](docs/MODULE_CONTRACT.md).

## Workspace-Grundlage 0.3.0-B

Die sichtbare Arbeitsfläche ist noch nicht verschiebbar. Zuerst wurde die interne Zustandsgrundlage aufgebaut.

Sie kann:

- den Standardzustand der fünf Kernpanels reproduzierbar erzeugen
- gespeicherte Layoutdaten prüfen und sicher bereinigen
- unbekannte oder fehlende Panels kontrolliert behandeln
- Layoutdaten lokal speichern und wieder laden
- bei beschädigtem oder gesperrtem Browser-Speicher auf einen sicheren Zustand zurückfallen
- ausschließlich den Workspace-Zustand zurücksetzen

Lokaler Schlüssel:

`provoware.allin.workspace.main.v1`

Der Reset löscht keine Debug-Einstellungen und keine anderen PROVOWARE-Daten.

Die Vertragsdetails stehen in [`docs/WORKSPACE_CONTRACT.md`](docs/WORKSPACE_CONTRACT.md). Der aktuelle Teilplan steht in [`docs/PLAN_0.3.0_B.md`](docs/PLAN_0.3.0_B.md).

## Nächste sichtbare Workspace-Stufe

In `0.3.0-C` ist unter dem festen oberen Bereich eine kompakte Schnellstarter-/Menüleiste vorgesehen. Ein permanenter `Layout`-Schalter bleibt dort außerhalb des veränderbaren Workspace erreichbar, damit auch nach dem Ausblenden aller Panels jederzeit eine Wiederherstellung möglich ist.

## Debugging & Logging

Der Bereich ist über den Schalter `Debug & Logging` ein- und ausblendbar.

- Stufe 1 · Ereignisse
- Stufe 2 · Diagnose
- Stufe 3 · Trace

Die gewählte Stufe und Sichtbarkeit werden lokal im Browser gespeichert. Fehler und unbehandelte Promise-Ablehnungen werden in einem begrenzten Arbeitsspeicher-Puffer erfasst.

Registry-Ereignisse erscheinen unter `MODULES`, Workspace-Ereignisse unter `WORKSPACE`.

## Entwicklung und automatische Prüfung

Für Entwickler wird Node.js 20 oder neuer benötigt. Es müssen **keine npm-Pakete installiert** werden.

### Alles prüfen

```bash
npm run verify
```

Dieser Befehl prüft unter anderem:

- JavaScript-Syntax
- JSON-Syntax und einheitliches JSON-Format
- Pflichtdateien
- lokale HTML-Verweise
- doppelte HTML-IDs
- unbeabsichtigte externe Laufzeitverweise
- Versionskonsistenz
- Modulvertrag und Registry
- unsichere Modulpfade
- Modul-Lebenszyklus
- Workspace-Standardzustand
- Workspace-Normalisierung
- beschädigte oder gesperrte lokale Speicherung
- Workspace-Reset

### Sichere automatische Korrektur

```bash
npm run fix
```

Der Auto-Fix verändert nur eindeutig semantikneutrale Dinge wie JSON-Einrückung, Zeilenenden und überflüssige Leerzeichen am Zeilenende. Programmlogik wird nicht automatisch umgeschrieben.

Bei Pull Requests und Änderungen an `main` führt GitHub Actions denselben Befehl `npm run verify` automatisch aus.

## Entwicklungsworkflow

Die verbindlichen Regeln stehen in [`AGENTS.md`](AGENTS.md).

Aktuelle Pläne:

- [`docs/PLAN_0.3.0.md`](docs/PLAN_0.3.0.md) – Gesamtplan Workspace Engine
- [`docs/PLAN_0.3.0_B.md`](docs/PLAN_0.3.0_B.md) – aktuelle Teilstufe

Kurzform:

`BASELINE -> ZIEL -> PLAN -> PRECHECK -> PATCH -> FORMAT/FIX -> TEST -> POSTCHECK -> DOKUMENTATION -> DIFF-GATE -> PR -> MERGE -> MAIN-CHECK`

## Struktur

- `index.html` – semantische UI-Hülle
- `assets/styles.css` – responsives Dark-/Petrol-Layout
- `assets/app.js` – UI-Zustand, Logging und Start der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Laufzeit-Lebenszyklus
- `assets/workspace-state.js` – Workspace-Zustand, Validierung, Speicherung und Reset
- `modules/registry.js` – kanonischer, derzeit leerer Modulkatalog
- `scripts/quality-check.mjs` – reproduzierbare Qualitätsprüfung und sicherer Auto-Fix
- `tests/module-registry.test.mjs` – Modul-Lebenszyklus-Test
- `tests/workspace-state.test.mjs` – Workspace-Zustands- und Speicherfehler-Test
- `.github/workflows/quality.yml` – automatisches Quality Gate
- `VERSION.json` – Release- und Entwicklungsmetadaten

## Version

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`.

Aktuelle Entwicklungsstufe: `0.3.0-B – State Foundation & Autosave/Reset`.
