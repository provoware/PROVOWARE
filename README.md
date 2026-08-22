# PROVOWARE ALL-IN 2026

Modulare, flexible und weiterhin fachlich leere HTML-Oberfläche. Die freigegebene Produktversion bleibt `0.2.0`. Parallel wird die Flexible Workspace Engine in kleinen, prüfbaren Teilstufen entwickelt. Aktuell ist `0.3.0-C – Visibility Controls & Compact Menu` implementiert und befindet sich in der technischen Abnahme.

## Start für normale Nutzung

1. Projektordner öffnen.
2. `index.html` doppelklicken oder in Firefox/Chrome öffnen.
3. Es werden weder Server noch installierte npm-Pakete noch Netzwerkzugriff benötigt.

## Oberfläche

- Seitenleiste
- Kopfbereich
- kompakte Schnellstarter-/Menüleiste
- Übersicht
- Module
- Arbeitsbereich
- Detailbereich
- Systemstatus
- versteckbarer Bereich `Debugging & Logging`

Die Bereiche enthalten weiterhin keine erfundenen Fachfunktionen.

## Layout bedienen – 0.3.0-C

Direkt unter dem oberen Bereich befindet sich die kompakte Schnellstarterleiste.

Der Schalter **`Layout`** bleibt bewusst außerhalb der veränderbaren Arbeitsfläche. Dadurch bleibt er auch erreichbar, wenn alle Panels ausgeblendet wurden.

### Ein Panel ausblenden

1. `Layout` öffnen.
2. Haken beim gewünschten Bereich entfernen.
3. Die Änderung wird automatisch lokal gespeichert.

### Ein Panel wieder anzeigen

1. `Layout` öffnen.
2. Haken beim gewünschten Bereich setzen.
3. Gespeicherte Reihenfolge und Größe des Panels bleiben erhalten.

### Alles wieder anzeigen

Im Layout-Menü `Alle anzeigen` wählen.

### Komplett auf Standard zurücksetzen

Im Layout-Menü `Standardlayout wiederherstellen` wählen.

Dieser Reset betrifft ausschließlich den Workspace-Schlüssel:

`provoware.allin.workspace.main.v1`

Debug-Einstellungen und andere PROVOWARE-Daten werden nicht gelöscht.

### Tastatur

- `Tab` wechselt durch die Bedienelemente.
- `Leertaste` schaltet die Kontrollfelder.
- `Escape` schließt das Layout-Menü und setzt den Fokus zurück auf `Layout`.

### Mobil

Die bestätigte mobile Option A hält `Layout` fest sichtbar. Nur sekundäre Inhalte der Schnellstarterleiste dürfen horizontal überlaufen. Es gibt keine separate mobile Zweitnavigation.

## Workspace-Grundlage

Die zentrale Workspace-Zustandsverwaltung kann:

- Standardzustand reproduzierbar erzeugen
- gespeicherte Layoutdaten prüfen und sicher bereinigen
- unbekannte oder fehlende Panels kontrolliert behandeln
- Sichtbarkeit zentral ändern
- Layoutdaten lokal speichern und wieder laden
- bei beschädigtem oder gesperrtem Browser-Speicher sicher weiterarbeiten
- ausschließlich den Workspace-Zustand zurücksetzen

Die sichtbare Bedienlogik liegt getrennt in `assets/workspace-ui.js` und schreibt niemals direkt in `localStorage`.

Die Vertragsdetails stehen in [`docs/WORKSPACE_CONTRACT.md`](docs/WORKSPACE_CONTRACT.md).

Aktuelle Pläne:

- [`docs/PLAN_0.3.0.md`](docs/PLAN_0.3.0.md) – Gesamtplan
- [`docs/PLAN_0.3.0_C.md`](docs/PLAN_0.3.0_C.md) – aktuelle Teilstufe

## Modulprinzip

Ein **Modul-Steckbrief (Manifest)** beschreibt ein späteres Tool. Das zentrale **Modulverzeichnis (Registry)** prüft diesen Steckbrief, bevor JavaScript geladen wird.

Der feste **Lebenszyklus (Lifecycle)** lautet:

`registered -> loading -> loaded -> active -> inactive -> registered`

Aktuell ist `modules/registry.js` absichtlich leer. Es werden noch keine Fachmodule ausgeliefert.

## Debugging & Logging

Der Bereich ist über `Debug & Logging` ein-/ausblendbar.

- Stufe 1 · Ereignisse
- Stufe 2 · Diagnose
- Stufe 3 · Trace

Registry-Ereignisse erscheinen unter `MODULES`, Workspace-Ereignisse unter `WORKSPACE`.

## Entwicklung und automatische Prüfung

Für Entwickler wird Node.js 20 oder neuer benötigt. Es müssen keine npm-Pakete installiert werden.

### Alles prüfen

```bash
npm run verify
```

Geprüft werden unter anderem:

- JavaScript-Syntax
- JSON und Format
- Pflichtdateien
- lokale HTML-Verweise
- doppelte HTML-IDs
- keine unbeabsichtigten externen Laufzeitverweise
- Versionskonsistenz
- Modulvertrag und Registry
- Workspace-Zustand und Speicherfehler
- Sichtbarkeitsaktionen
- isolierter Reset
- vollständige Panel-Zuordnung zwischen Vertrag, HTML und Layout-Menü
- permanenter Layout-Schalter außerhalb des Workspace
- Workspace-UI-Verhalten

### Sichere automatische Korrektur

```bash
npm run fix
```

Der Auto-Fix verändert nur eindeutig semantikneutrale Dinge wie JSON-Einrückung, Zeilenenden und überflüssige Leerzeichen am Zeilenende. Programmlogik wird nicht automatisch umgeschrieben.

## Entwicklungsworkflow

Die verbindlichen Regeln stehen in [`AGENTS.md`](AGENTS.md).

Kurzform:

`BASELINE -> ZIEL -> PLAN -> PRECHECK -> PATCH -> FORMAT/FIX -> TEST -> POSTCHECK -> DOKUMENTATION -> DIFF-GATE -> PR -> MERGE -> MAIN-CHECK`

## Struktur

- `index.html` – semantische UI-Hülle
- `assets/styles.css` – responsives Dark-/Petrol-Layout
- `assets/app.js` – Logging und Start der Subsysteme
- `assets/module-registry.js` – Modulvertrag und Laufzeit-Lebenszyklus
- `assets/workspace-state.js` – Workspace-Zustand, Validierung, Speicherung, Sichtbarkeit und Reset
- `assets/workspace-ui.js` – Layout-Menü, DOM-Anwendung, Fokus und Nutzerfeedback
- `modules/registry.js` – kanonischer, derzeit leerer Modulkatalog
- `scripts/quality-check.mjs` – reproduzierbare Qualitätsprüfung und sicherer Auto-Fix
- `tests/module-registry.test.mjs` – Modul-Lebenszyklus
- `tests/workspace-state.test.mjs` – Workspace-Zustand und Sichtbarkeitslogik
- `tests/workspace-ui.test.mjs` – sichtbare Workspace-Bedienung
- `.github/workflows/quality.yml` – automatisches Quality Gate
- `VERSION.json` – Release- und Entwicklungsmetadaten

## Noch nicht enthalten

- Resize – folgt in `0.3.0-D`
- Neuordnung/Drag & Drop – folgt in `0.3.0-E`
- Fachmodule

## Version

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`.

Aktuelle Entwicklungsstufe: `0.3.0-C – Visibility Controls & Compact Menu`.
