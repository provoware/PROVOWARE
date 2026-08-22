# CHECKLIST 0.4.2-H1 – Persistence Portability

## A – Vertrag

- [x] isolierten Hardening-Branch anlegen.
- [x] Plan und Baseline-Checkpoint anlegen.
- [ ] zentrale `atomicReplaceFile()`-Schicht implementieren.
- [ ] Temp-Datei immer im Zielordner erzeugen.
- [ ] exklusives Temp-Anlegen verwenden.
- [ ] Temp-Inhalt vor Rename synchronisieren.
- [ ] kein `unlink -> rename`-Fallback.
- [ ] begrenzte Windows-Retries ausschließlich für transiente Fehler.
- [ ] Cleanup darf Primärfehler nicht verdecken.

## B – Integration

- [ ] Project-Data-Writer auf zentrale Schicht umstellen.
- [ ] Data-Studio-PRO-Writer auf zentrale Schicht umstellen.
- [ ] bestehende `beforeRename`-Hooks kompatibel halten.
- [ ] Dateiformate und Schemata unverändert lassen.

## C – Tests

- [ ] Erfolgspfad testen.
- [ ] Same-Directory-Temp testen.
- [ ] `beforeRename`-Failure testen.
- [ ] permanenter Rename-Fehler testen.
- [ ] Temp-Cleanup testen.
- [ ] Windows `EPERM` Retry testen.
- [ ] Windows `EACCES` Retry testen.
- [ ] Windows `EBUSY` Retry testen.
- [ ] Retry-Limit und unbekannten Fehler testen.
- [ ] bestehende Project-Data-/Recovery-/PRO-Regressionen grün halten.

## D – CI

- [ ] `Persistence Portability Gate` anlegen.
- [ ] Ubuntu + Node 20 prüfen.
- [ ] Windows + Node 20 prüfen.
- [ ] vollständigen Quality Gate auf Node 20 + 24 grün halten.
- [ ] Chromium 3/3 grün halten.

## E – Abschluss

- [ ] VERSION/README/TODO/CHANGELOG/MANIFEST synchronisieren.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR freigeben.
- [ ] kontrolliert squash-mergen.
- [ ] `main` nach Merge prüfen.
