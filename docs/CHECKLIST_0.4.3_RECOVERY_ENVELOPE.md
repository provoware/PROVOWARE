# CHECKLIST 0.4.3 – Recovery Envelope

## A – Format / Speicherung

- [x] isolierten Feature-Branch anlegen.
- [x] Plan und Baseline-Checkpoint anlegen.
- [ ] Formatkennung `provoware-recovery-envelope` + `formatVersion: 1` definieren.
- [ ] Komponenten `project-data` und `data-studio-pro` definieren.
- [ ] Rohbytes/Base64, SHA-256, Byte-Länge und Zustand je Komponente erfassen.
- [ ] Schema-/Zusammenfassungsmetadaten nur bei erfolgreicher Validierung ergänzen.
- [ ] Envelope-Gesamt-SHA über kanonischen Payload binden.
- [ ] feste `.pwenvelope`-IDs und Pfade verwenden.
- [ ] Rotation auf maximal 10 Envelopes.

## B – Schutz / Rückwärtskompatibilität

- [ ] Envelope- und Journalpfade aus Git/Auto-Fix ausschließen.
- [ ] statische Direktauslieferung blockieren.
- [ ] Legacy-`.pwbak` unverändert lassen.
- [ ] vorhandene 0.4.1-Routen unverändert grün halten.

## C – Vorschau / Restore / Journal

- [ ] Envelope-Liste implementieren.
- [ ] Envelope-Vorschau mit Komponentenstatus implementieren.
- [ ] SHA-gebundene Bestätigung erzwingen.
- [ ] Safety-Envelope vor Multi-Datei-Restore erzeugen.
- [ ] Journalzustände versioniert persistieren.
- [ ] Project Data über `atomic-file` ersetzen.
- [ ] PRO-Metadaten über `atomic-file` ersetzen.
- [ ] beide Live-Komponenten nach Restore erneut per SHA verifizieren.
- [ ] Journal nach Commit entfernen.

## D – Rollback / Wiederanlauf

- [ ] Fehler vor erster Komponente testen.
- [ ] Fehler zwischen Project Data und PRO testen.
- [ ] Fehler nach zweiter Komponente vor Verifikation testen.
- [ ] beide Komponenten aus Safety-Envelope zurückrollen.
- [ ] Rollback-Ergebnis verifizieren.
- [ ] liegengebliebenes Journal vor neuer Operation erkennen.
- [ ] deterministischen Wiederanlauf/Rollback aus Journal testen.
- [ ] gemischten Live-Zustand nach Fehler ausschließen.

## E – API / UI

- [ ] Envelope-API unter bestehendem Recovery-Prefix integrieren.
- [ ] Same-Origin weiter erzwingen.
- [ ] Envelope-Abschnitt im bestehenden Recovery-Modul ergänzen.
- [ ] Vorschau vor Restore in der UI erzwingen.
- [ ] Legacy-Backup-UI unverändert erhalten.
- [ ] `file://` kontrolliert nicht schreibfähig halten.

## F – Gates / Dokumentation

- [ ] Service-/API-/UI-Vertragstests ergänzen.
- [ ] Persistence-Portability-Workflow um Envelope-Service erweitern, soweit dateisystemrelevant.
- [ ] zentralen Quality Gate aktualisieren.
- [ ] VERSION/README/TODO/CHANGELOG/MANIFEST aktualisieren.
- [ ] Node 20 grün.
- [ ] Node 24 grün.
- [ ] Ubuntu-Portability grün.
- [ ] Windows-Portability grün.
- [ ] Chromium mindestens 3/3 unverändert grün; Envelope-E2E ergänzen.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR kontrolliert squash-mergen.
- [ ] `main` nach Merge prüfen.
