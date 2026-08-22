# PLAN 0.4.2-H1 – Persistence Portability Foundation

## Ziel

Die vorhandenen atomaren JSON-Schreibpfade von Project Data und Data Studio PRO auf **einen** plattformneutralen Dateiersatz-Vertrag stellen und diesen auf Linux und Windows gezielt gegen Dateisperren, Rename-Fehler, Temp-Reste und Schreibabbrüche prüfen.

## Nicht-Ziele

- keine Änderung am Project-Data-Schema v1
- keine Änderung am Data-Studio-PRO-Schema v1
- keine Änderung des `.pwbak`-Formats
- noch kein Recovery Envelope
- keine UI-Funktion
- kein SQLite

## Kernvertrag

Neue zentrale Schicht: `scripts/atomic-file.mjs`.

Ein erfolgreicher Ersatz folgt:

`Temp im selben Ordner -> exklusiv öffnen -> vollständig schreiben -> Datei synchronisieren -> optionaler Failpoint -> Rename/Replace -> Erfolg`

Bei Fehler:

`Fehler -> Temp bestmöglich entfernen -> Live-Zieldatei unangetastet -> Fehler weiterreichen`

### Sicherheitsregeln

1. Temp-Datei liegt immer im selben Verzeichnis wie das Ziel, damit kein Cross-Device-Rename entsteht.
2. Temp-Erstellung verwendet exklusives Anlegen (`wx`).
3. Vor dem Rename wird der Temp-Dateihandle synchronisiert.
4. Es gibt **keinen** Fallback `unlink(ziel) -> rename(temp, ziel)`.
5. Windows darf nur bei klar transienten Fehlercodes (`EPERM`, `EACCES`, `EBUSY`) begrenzt erneut versuchen.
6. Retry ist deterministisch, begrenzt und testbar; permanente Fehler bleiben Fehler.
7. Temp-Cleanup darf den ursprünglichen Fehler nicht verdecken.
8. Bestehende Service-Funktionssignaturen und Failure-Injection-Hooks bleiben kompatibel.

## Integration

### Project Data

`writeProjectDatabaseAtomic()` bleibt öffentliche API und delegiert intern an `atomicReplaceFile()`.

### Data Studio PRO

`writeDataStudioProAtomic()` bleibt öffentliche API und delegiert intern an dieselbe Schicht.

Damit werden bestehende Recovery-/PRO-Tests nicht umgeschrieben, sondern beweisen zusätzlich die Rückwärtskompatibilität.

## Tests

### Plattformunabhängig

- erfolgreicher Ersatz
- Temp-Datei im Zielordner
- Ziel bei `beforeRename`-Fehler bytegenau unverändert
- Temp-Datei nach Fehler entfernt
- permanenter Rename-Fehler lässt Ziel unverändert
- Cleanup-Fehler verdeckt Primärfehler nicht

### Windows-Vertrag

Per injizierbarer Platform-/FS-Schicht:

- `EPERM` -> Retry -> Erfolg
- `EACCES` -> Retry -> Erfolg
- `EBUSY` -> Retry -> Erfolg
- anderes Fehlerkürzel -> kein Retry
- Retry-Limit -> kontrollierter Abbruch, Ziel unverändert

Zusätzlich läuft derselbe Test auf `windows-latest` in GitHub Actions.

## CI

Neuer kleiner Workflow `Persistence Portability Gate`:

- `ubuntu-latest`, Node 20
- `windows-latest`, Node 20
- nur Portability-Vertrag + relevante Service-Tests

Der bestehende vollständige Quality Gate auf Node 20/24 und der Chromium-E2E bleiben unverändert aktiv.

## Abnahme

PASS nur wenn:

- bestehender `npm run verify` grün auf Node 20 und 24
- neuer Portability-Gate grün auf Ubuntu + Windows
- bestehender Chromium-E2E weiterhin 3/3 grün
- Diff enthält keine Schema-/UI-/Backupformatänderung
