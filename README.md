# PROVOWARE ALL-IN 2026

Modulare, flexible HTML-Oberfläche als bewusst leere UI-Basis. Die Arbeitsfläche enthält nur Bereichstitel und ist für spätere Module vorbereitet.

## Start

`index.html` direkt in Firefox oder Chrome öffnen. Es werden keine externen Abhängigkeiten benötigt.

## Oberfläche

- Seitenleiste
- Kopfbereich
- Übersicht
- Module
- Arbeitsbereich
- Detailbereich
- Systemstatus
- versteckbarer Bereich `Debugging & Logging`

## Debugging & Logging

Der Bereich ist über den Schalter `Debug & Logging` ein- und ausblendbar.

- Stufe 1 · Ereignisse
- Stufe 2 · Diagnose
- Stufe 3 · Trace

Die gewählte Stufe und Sichtbarkeit werden lokal im Browser gespeichert. Fehler und unbehandelte Promise-Ablehnungen werden in einem begrenzten In-Memory-Puffer erfasst.

## Struktur

- `index.html` – semantische UI-Hülle
- `assets/styles.css` – responsives Dark-/Petrol-Layout
- `assets/app.js` – UI-Zustand und dreistufiges Logging
- `VERSION.json` – Versionsmetadaten

## Version

Aktuelle Basis: `0.1.0 – UI Foundation`.
