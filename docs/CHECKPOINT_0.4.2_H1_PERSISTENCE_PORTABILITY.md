# CHECKPOINT 0.4.2-H1 – Persistence Portability

## Baseline

- `main`: `b59b798cf5b5c75f7adddb9f56442bddb106093a`
- vorheriger Funktionsmerge 0.4.2: `d22a4ba51a970966b8f0242186094fb894e14356`
- Produktversion: `0.2.0`
- Project-Data-Schema: `1`
- Data-Studio-PRO-Schema: `1`
- Recovery-Backupformat: bestehende `.pwbak`-Sicherungen unverändert

## Vorhandene Schreibpfade

- `scripts/project-data-service.mjs::writeProjectDatabaseAtomic()`
- `scripts/data-studio-pro-service.mjs::writeDataStudioProAtomic()`

Beide verwenden aktuell denselben Grundablauf getrennt voneinander: Temp-Datei `wx`, Schreiben, optionaler `beforeRename`-Hook, `rename`, Cleanup bei Fehler.

## Bereits abgesichert

- Schreibabbruch direkt vor Rename lässt Live-Daten bytegenau unverändert.
- Project Data und PRO verwenden dieselbe Mutationssperre.
- Runtime-Dateien und Temp-Dateien sind aus Git/Auto-Fix ausgeschlossen.
- Chromium-E2E: 3/3 PASS auf finalem 0.4.2-Head.
- Core: 101/101 Node-Tests auf Node 20/24 PASS.

## Noch nicht bewiesen

- tatsächlicher Windows-Lauf des atomaren Dateiersatzes
- Verhalten bei Windows-Dateisperren / `EPERM` / `EACCES` / `EBUSY`
- gemeinsamer zentraler Atomic-Replace-Vertrag
- synchronisierter Temp-Dateihandle vor Replace
- deterministischer begrenzter Retry-Vertrag

## Unveränderliche Grenze dieser Iteration

0.4.2-H1 darf keine neue fachliche Datenstruktur und keinen neuen Backupcontainer einführen. Erst nach grünem Portability-Fundament beginnt 0.4.3 Recovery Envelope.
