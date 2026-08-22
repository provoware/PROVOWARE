# CHECKLIST 0.4.2-H1 – Persistence Portability

## A – Vertrag

- [x] isolierten Hardening-Branch anlegen.
- [x] Plan und Baseline-Checkpoint anlegen.
- [x] zentrale `atomicReplaceFile()`-Schicht implementieren.
- [x] Temp-Datei immer im Zielordner erzeugen.
- [x] exklusives Temp-Anlegen über `wx` verwenden.
- [x] Temp-Inhalt vor Rename über `FileHandle.sync()` synchronisieren.
- [x] keinen riskanten `unlink -> rename`-Fallback verwenden.
- [x] begrenzte Windows-Retries ausschließlich für `EPERM`, `EACCES` und `EBUSY` implementieren.
- [x] Retry-Limits deterministisch und testbar halten.
- [x] Cleanup darf Primärfehler nicht verdecken.
- [x] fremde kollidierende Temp-Datei bei `EEXIST` niemals löschen.

## B – Integration

- [x] Project-Data-Writer auf zentrale Schicht umstellen.
- [x] Data-Studio-PRO-Writer auf zentrale Schicht umstellen.
- [x] bestehende `beforeRename`-Hooks kompatibel halten.
- [x] `database` bzw. `stored` weiterhin an bestehende Failure-Injection-Hooks durchreichen.
- [x] Dateiformate und Schemata unverändert lassen.
- [x] `.pwbak`-Format unverändert lassen.
- [x] APIs, Recovery-Routen, Browser-UI und Workspace unverändert lassen.

## C – Tests

- [x] Erfolgspfad testen.
- [x] Same-Directory-Temp testen.
- [x] `beforeRename`-Failure testen.
- [x] permanenter Rename-Fehler fail-closed testen.
- [x] Temp-Cleanup testen.
- [x] Cleanup-Fehler gegen Primärfehler testen.
- [x] Windows `EPERM` Retry testen.
- [x] Windows `EACCES` Retry testen.
- [x] Windows `EBUSY` Retry testen.
- [x] Retry-Limit und unbekannten Fehler testen.
- [x] `EEXIST`-Kollision einer fremden Temp-Datei testen.
- [x] Schreibreihenfolge `write -> sync -> close -> beforeRename -> rename` testen.
- [x] bestehende Project-Data-/Recovery-/PRO-Regressionen grün halten.
- [x] statisch prüfen, dass beide Runtime-Writer wirklich dieselbe Atomic-Schicht verwenden.

## D – CI / Evidenz

- [x] `Persistence Portability Gate` anlegen.
- [x] Ubuntu + Node 20 real prüfen: PASS.
- [x] Windows + Node 20 real prüfen: PASS.
- [x] vollständigen Quality Gate auf Node 20 prüfen: PASS.
- [x] vollständigen Quality Gate auf Node 24 prüfen: PASS.
- [x] finaler Core-Stand: 44 JavaScript-Dateien gelintet.
- [x] finaler Quality-Gate-Stand: 110 Projektdateien geprüft.
- [x] finaler Node-Teststand: 114/114 PASS, 0 Fehler.
- [x] Chromium 3/3 unverändert grün halten.
- [x] Firefox im automatischen Lauf wie vorgesehen übersprungen.
- [x] Browser-Evidenzartefakt `9477830587`, SHA-256 `fed02b407da6e9916d4423aed94da8d03e581f3d8e99f5db7e049355f6c84d52` festhalten.

## E – Abschluss

- [x] parallelen einzeiligen H1-Plan auf `main` erkannt und Branch kontrolliert auf `9794828aa4dbe95d3a97bf6541fca008956c2056` rebasiert.
- [x] finaler Diff: 1 Commit voraus, 0 hinter `main`, 10 begründete Dateien.
- [x] keine offenen Review-Threads.
- [x] PR #85 auf ready for review setzen.
- [x] kontrolliert squash-mergen.
- [x] Merge-SHA `b25b9e424b7445e1a8444aefde456744fcf42587` prüfen.
- [x] `main` direkt nach Merge auf Merge-SHA und H1-Dateibaum prüfen.
- [x] VERSION und H1-spezifische Plan-/Checkpoint-/Checklisten-Dokumentation vorhanden.
- [ ] README/CHANGELOG/MANIFEST als separaten reinen Dokumentationsabschluss auf H1-Abschlussstand synchronisieren.

## Bewusste Grenze

0.4.2-H1 ist die **Portability Foundation**. Ein gemeinsamer Multi-Datei-Backup-/Restore-Vertrag wird nicht nachträglich in `.pwbak` eingebaut, sondern folgt separat als `0.4.3 Recovery Envelope`.
