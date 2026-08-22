# CHECKLIST 0.4.2-H1 – Persistence Portability Foundation

## A – Gemeinsamer Vertrag

- [x] isolierten Feature-Branch anlegen.
- [x] Plan und Baseline-Checkpoint anlegen.
- [ ] `scripts/runtime-persistence.mjs` anlegen.
- [ ] Temp-Datei im Zielverzeichnis erzwingen.
- [ ] exklusives Temp-Erzeugen verwenden.
- [ ] begrenzten Retry nur für transiente Replace-Fehler implementieren.
- [ ] fail-closed ohne `unlink(target) -> rename(temp)` sicherstellen.
- [ ] Temp-Cleanup bei Fehlern durchführen.
- [ ] stabile Fehlerklassifikation bereitstellen.

## B – Writer migrieren

- [ ] Project-Data-Writer auf gemeinsamen Vertrag umstellen.
- [ ] Data-Studio-PRO-Writer auf gemeinsamen Vertrag umstellen.
- [ ] Fachvalidierung unverändert in den Fachservices belassen.
- [ ] bestehende `beforeRename`-Failure-Injection kompatibel halten.
- [ ] Dateiformate byte-/semantikgleich halten.

## C – Tests

- [ ] Erfolgsfall des gemeinsamen Writers testen.
- [ ] Failure-Injection vor Replace testen.
- [ ] bytegenauen Erhalt der Live-Datei nach Fehler testen.
- [ ] Temp-Cleanup testen.
- [ ] transiente Retry-Grenze testen.
- [ ] permanente Fehler ohne destruktiven Fallback testen.
- [ ] Fehlerklassifikation testen.
- [ ] statisch nachweisen, dass beide Fachwriter denselben Vertrag verwenden.
- [ ] statisch verbieten, dass die Fachwriter wieder eigene `rename`-/Temp-Logik einführen.

## D – Quality / Regression

- [ ] H1-Pflichtdateien im zentralen Quality Gate verankern.
- [ ] VERSION/TODO/README/MANIFEST/CHANGELOG synchronisieren.
- [ ] Node 20 grün.
- [ ] Node 24 grün.
- [ ] Chromium-E2E unverändert grün.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR kontrolliert mergen.
- [ ] `main` nach Merge prüfen.

## Bewusst nicht H1

- [ ] echte Windows-CI – folgt H1b.
- [ ] Windows-Chromium-E2E – erst nach stabilem Dateisystem-Gate.
- [ ] Recovery Envelope – folgt 0.4.3.
- [ ] Multi-Datei-Journal/Rollback – folgt 0.4.3.
