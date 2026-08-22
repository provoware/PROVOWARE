# CHECKLIST 0.4.2-H1 – Persistence Portability Foundation

## A – Gemeinsamer Vertrag

- [x] isolierten Feature-Branch anlegen.
- [x] Plan und Baseline-Checkpoint anlegen.
- [x] `scripts/runtime-persistence.mjs` anlegen.
- [x] Temp-Datei im Zielverzeichnis erzwingen.
- [x] exklusives Temp-Erzeugen verwenden.
- [x] begrenzten Retry nur für transiente Replace-Fehler implementieren.
- [x] fail-closed ohne `unlink(target) -> rename(temp)` sicherstellen.
- [x] Temp-Cleanup bei Fehlern durchführen.
- [x] teilweise erzeugte Temp-Datei nach Schreibfehler sicher bereinigen, ohne `EEXIST`-Fremdtemp zu löschen.
- [x] stabile Fehlerklassifikation bereitstellen.

## B – Writer migrieren

- [x] Project-Data-Writer auf gemeinsamen Vertrag umstellen.
- [x] Data-Studio-PRO-Writer auf gemeinsamen Vertrag umstellen.
- [x] Fachvalidierung unverändert in den Fachservices belassen.
- [x] bestehende `beforeRename`-Failure-Injection kompatibel halten.
- [x] Dateiformate byte-/semantikgleich halten.

## C – Tests

- [x] Erfolgsfall des gemeinsamen Writers testen.
- [x] Failure-Injection vor Replace testen.
- [x] bytegenauen Erhalt der Live-Datei nach Fehler testen.
- [x] Temp-Cleanup testen.
- [x] teilweisen Temp-Schreibfehler `ENOSPC` testen.
- [x] Verzeichnis-/Rechtefehler vor Schreibversuch testen.
- [x] transiente Retry-Grenze testen.
- [x] permanente Fehler ohne destruktiven Fallback testen.
- [x] Fehlerklassifikation testen.
- [x] statisch nachweisen, dass beide Fachwriter denselben Vertrag verwenden.
- [x] statisch verbieten, dass die Fachwriter wieder eigene `rename`-/Temp-Logik einführen.

## D – Quality / Regression

- [x] H1-Pflichtdateien und Architekturregeln im zentralen Quality Gate verankern.
- [x] VERSION auf H1-Vertrag aktualisieren; Produktversion und Datenschemata unverändert lassen.
- [ ] TODO/README/MANIFEST/CHANGELOG synchronisieren.
- [x] erster H1-Core-Gate: Node 20 grün.
- [x] erster H1-Core-Gate: Node 24 grün.
- [x] erster H1-Core-Gate: 44 JavaScript-Dateien, 109 Projektdateien, 112/112 Node-Tests.
- [x] erster Chromium-E2E nach Writer-Migration unverändert grün; Firefox wie vorgesehen übersprungen.
- [ ] finalen Dokumentationsstand erneut durch Node 20/24 und Chromium prüfen.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR #86 auf ready for review setzen und kontrolliert squash-mergen.
- [ ] `main` nach Merge prüfen.

## Bewusst nicht H1

- [ ] echte Windows-CI – folgt H1b.
- [ ] Windows-Chromium-E2E – erst nach stabilem Dateisystem-Gate.
- [ ] Recovery Envelope – folgt 0.4.3.
- [ ] Multi-Datei-Journal/Rollback – folgt 0.4.3.
