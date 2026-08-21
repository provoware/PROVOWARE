# PROVOWARE ALL-IN 2026

Modulare, flexible und bewusst noch fachlich leere HTML-Oberfläche. Version `0.2.0` ergänzt einen festen Modulvertrag und eine zentrale Registry, damit spätere Tools nach denselben Regeln eingebunden werden können.

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

## Debugging & Logging

Der Bereich ist über den Schalter `Debug & Logging` ein- und ausblendbar.

- Stufe 1 · Ereignisse
- Stufe 2 · Diagnose
- Stufe 3 · Trace

Die gewählte Stufe und Sichtbarkeit werden lokal im Browser gespeichert. Fehler und unbehandelte Promise-Ablehnungen werden in einem begrenzten Arbeitsspeicher-Puffer erfasst.

Registry-Ereignisse erscheinen unter dem Bereich `MODULES` im selben Logger.

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
- automatischen Modul-Lebenszyklustest

### Sichere automatische Korrektur

```bash
npm run fix
```

Der Auto-Fix verändert nur eindeutig semantikneutrale Dinge wie JSON-Einrückung, Zeilenenden und überflüssige Leerzeichen am Zeilenende. Programmlogik wird nicht automatisch umgeschrieben.

Bei Pull Requests und Änderungen an `main` führt GitHub Actions denselben Befehl `npm run verify` automatisch aus.

## Entwicklungsworkflow

Die verbindlichen Regeln stehen in [`AGENTS.md`](AGENTS.md). Der detaillierte Plan für diese Iteration steht in [`docs/PLAN_0.2.0.md`](docs/PLAN_0.2.0.md).

Kurzform:

`BASELINE -> ZIEL -> PLAN -> PRECHECK -> PATCH -> FORMAT/FIX -> TEST -> POSTCHECK -> DOKUMENTATION -> DIFF-GATE -> PR -> MERGE -> MAIN-CHECK`

## Struktur

- `index.html` – semantische UI-Hülle
- `assets/styles.css` – responsives Dark-/Petrol-Layout
- `assets/app.js` – UI-Zustand und dreistufiges Logging
- `assets/module-registry.js` – Modulvertrag und Laufzeit-Lebenszyklus
- `modules/registry.js` – kanonischer, derzeit leerer Modulkatalog
- `scripts/quality-check.mjs` – reproduzierbare Qualitätsprüfung und sicherer Auto-Fix
- `tests/module-registry.test.mjs` – Lebenszyklus-Test mit Node-Bordmitteln
- `.github/workflows/quality.yml` – automatisches Quality Gate
- `VERSION.json` – Versionsmetadaten

## Version

Aktueller Entwicklungsstand: `0.2.0 – Module Contract & Registry`.
