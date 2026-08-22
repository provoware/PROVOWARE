# PLAN 0.4.2-H1 – Persistence Portability Foundation

## Ziel

Eine einzige plattformneutrale, fail-closed Persistenzschicht für alle Runtime-Datendateien schaffen, bevor 0.4.3 mehrere Dateien gemeinsam sichern und wiederherstellen muss.

## Unveränderte Verträge

- Produktversion bleibt `0.2.0`.
- Project-Data-Produktionsschema bleibt `1`.
- `data/project-data.json` bleibt unverändert.
- `data/data-studio-pro.json` bleibt unverändert.
- bestehende HTTP-/Modul-/Recovery-Verträge bleiben unverändert.
- keine SQLite-Einführung.
- kein Recovery-Envelope in diesem Strang.

## Architektur

Neue interne Schicht: `scripts/runtime-persistence.mjs`.

Sie verantwortet:

1. Temp-Datei im selben Zielverzeichnis.
2. exklusives Erzeugen der Temp-Datei.
3. vollständiges Schreiben und Schließen.
4. optionalen Failure-Injection-Hook direkt vor Replace.
5. begrenzte Wiederholungen ausschließlich für transiente Replace-Fehler.
6. fail-closed Verhalten: niemals `unlink(target) -> rename(temp)`.
7. best-effort Temp-Cleanup bei Fehlern.
8. stabile Fehlerklassifikation für Diagnose und Cross-OS-Tests.

## Fehlerklassen

- `LOCKED`: transiente `EBUSY`-/`EPERM`-Replace-Probleme.
- `PERMISSION`: `EACCES` oder nicht-transientes `EPERM` außerhalb des Replace-Retry-Pfads.
- `READ_ONLY`: `EROFS`.
- `NO_SPACE`: `ENOSPC`.
- `TEMP_CREATE`: Temp-Datei konnte nicht erzeugt werden.
- `REPLACE_FAILED`: Replace blieb nach begrenzten Versuchen erfolglos.
- `WRITE_FAILED`: Temp-Datei konnte nicht vollständig geschrieben werden.
- `UNKNOWN`: unbekannter Dateisystemfehler.

## Umstellung

- `writeProjectDatabaseAtomic()` delegiert an den gemeinsamen Vertrag.
- `writeDataStudioProAtomic()` delegiert an denselben Vertrag.
- fachliche Validierung bleibt jeweils im Fachservice.
- gemeinsame Project-Data-Mutationssperre bleibt unverändert.

## Tests

- Erfolgsfall ersetzt vorhandene Datei.
- Failure-Injection vor Replace lässt Live-Datei bytegenau unverändert.
- Temp-Datei wird nach Fehler entfernt.
- transiente Replace-Fehler werden nur begrenzt wiederholt.
- permanente Fehler werden fail-closed weitergereicht.
- kein `unlink(target)`-Fallback vorhanden.
- Project Data und PRO verwenden nachweislich dieselbe Persistenzfunktion.
- bestehende Node-20/24- und Chromium-Gates bleiben grün.

## Danach

0.4.2-H1b ergänzt echte Ubuntu-/Windows-Dateisystem-CI. Erst auf dieser Basis folgt 0.4.3 Recovery Envelope mit Journal und Multi-Datei-Rollback.
