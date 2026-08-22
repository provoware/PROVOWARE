# CHECKLIST 0.4.3 – Recovery Envelope

## A – Format / Speicherung

- [x] isolierten Feature-Branch anlegen.
- [x] Plan und Baseline-Checkpoint anlegen.
- [x] Formatkennung `provoware-recovery-envelope` + `formatVersion: 1` definieren.
- [x] Komponenten `project-data` und `data-studio-pro` definieren.
- [x] Rohbytes/Base64, SHA-256, Byte-Länge und Zustand je Komponente erfassen.
- [x] Schema-/Zusammenfassungsmetadaten nur bei erfolgreicher Validierung ergänzen.
- [x] Envelope-Gesamt-SHA über kanonischen Payload binden.
- [x] feste `.pwenvelope`-IDs und Pfade verwenden.
- [x] Rotation auf maximal 10 Envelopes.

## B – Schutz / Rückwärtskompatibilität

- [x] Envelope- und Journalpfade aus Git/Auto-Fix ausschließen.
- [x] statische Direktauslieferung blockieren.
- [x] Legacy-`.pwbak` unverändert lassen.
- [x] vorhandene 0.4.1-Routen unverändert grün halten.

## C – Vorschau / Restore / Journal

- [x] Envelope-Liste implementieren.
- [x] Envelope-Vorschau mit Komponentenstatus implementieren.
- [x] SHA-gebundene Bestätigung erzwingen.
- [x] Safety-Envelope vor Multi-Datei-Restore erzeugen.
- [x] Journalzustände versioniert persistieren.
- [x] Project Data über `atomic-file` ersetzen.
- [x] PRO-Metadaten über `atomic-file` ersetzen.
- [x] beide Live-Komponenten nach Restore erneut per SHA verifizieren.
- [x] Journal nach Commit entfernen.

## D – Rollback / Wiederanlauf

- [x] Fehler vor erster Komponente testen.
- [x] Fehler zwischen Project Data und PRO testen.
- [x] Fehler nach zweiter Komponente vor Verifikation testen.
- [x] beide Komponenten aus Safety-Envelope zurückrollen.
- [x] Rollback-Ergebnis verifizieren.
- [x] liegengebliebenes Journal vor neuer Operation erkennen.
- [x] deterministischen Wiederanlauf/Rollback aus Journal testen.
- [x] gemischten Live-Zustand nach Fehler ausschließen.

## E – API / UI

- [x] Envelope-API unter bestehendem Recovery-Prefix integrieren.
- [x] Same-Origin weiter erzwingen.
- [x] Envelope-Abschnitt im bestehenden Recovery-Modul ergänzen.
- [x] Vorschau vor Restore in der UI erzwingen.
- [x] Legacy-Backup-UI unverändert erhalten.
- [x] `file://` kontrolliert nicht schreibfähig halten.

## F – Gates / Dokumentation

- [x] Service-/API-/UI-Vertragstests ergänzen.
- [x] Persistence-Portability-Workflow um Envelope-Service erweitern.
- [x] zentralen Quality Gate aktualisieren.
- [x] VERSION/README/TODO/CHANGELOG/MANIFEST aktualisieren.
- [x] Node 20 grün.
- [x] Node 24 grün.
- [x] Ubuntu-Portability grün.
- [x] Windows-Portability grün.
- [x] Chromium-E2E auf 4/4 erweitert und grün.
- [x] finalen Diff gegen `main` geprüft.
- [x] PR #87 kontrolliert gemergt.
- [x] `main` nach Merge geprüft.

## Finale Evidenz

- Merge-Commit PR #87: `b1bf3a24b30cb18df693b46a26953de8bc9aef18`.
- Funktions-Head vor Merge: `5710a068dba7758b95aa8391c3abed7342e6eaee`.
- Node 20: PASS.
- Node 24: PASS.
- Project Lint: 49 JavaScript-Dateien.
- Quality Gate: 118 Projektdateien.
- Node-Test-Suite: 131/131 PASS, 0 Fehler.
- Ubuntu Persistence Portability: PASS.
- Windows Persistence Portability: PASS.
- Chromium: 4/4 PASS.
- Firefox im automatischen Lauf: wie vorgesehen SKIPPED.
- Browser-Evidenzartefakt: `9481363211`.
- Artefakt-SHA-256: `a4e897f6a594fd126d9c19f5a72bb2416a5b0f7de14ec1ab285afbb231839566`.
- Erfolgsartefakt geprüft: 11 Dateien inklusive `08-recovery-envelope-restored.png` und grünem HTML-Mirror.
- HTML-Mirror: intern 1366 × 900 auf beiden Frames, Skalierung 0,5, `keyGeometryIdentical: true`, keine Geometrieabweichungen.
