# CHANGELOG

## In Entwicklung – 0.4.2-H1 Persistence Portability Foundation

### Hinzugefügt

- `scripts/runtime-persistence.mjs` als gemeinsamer Runtime-Persistenzvertrag Version 1.
- `atomicReplaceFile()` für fail-closed Temp-Datei-zu-Replace-Persistenz.
- stabile Fehlerklassen `LOCKED`, `PERMISSION`, `READ_ONLY`, `NO_SPACE`, `TEMP_CREATE`, `WRITE_FAILED`, `REPLACE_FAILED` und `UNKNOWN`.
- begrenzter Retry ausschließlich für transiente Replace-Fehler `EBUSY` und `EPERM`.
- isolierte Tests `tests/runtime-persistence.test.mjs` für echten Replace, Failure-Injection, Retry, Rechtefehler, `ENOSPC`, Temp-Cleanup und Fehlerklassifikation.
- Integrationsvertrag `tests/runtime-persistence-integration.test.mjs`, der die gemeinsame Nutzung durch Project Data und Data Studio PRO erzwingt.
- Plan, Baseline-Checkpoint und Abnahmecheckliste für H1.

### Geändert

- `writeProjectDatabaseAtomic()` delegiert auf den gemeinsamen Runtime-Persistence-Vertrag.
- `writeDataStudioProAtomic()` delegiert auf denselben Vertrag.
- eigene `rename`-/Temp-Datei-Implementierungen wurden aus beiden Fachservices entfernt.
- bestehende `beforeRename`-Failure-Injection bleibt kompatibel und behält die Identität injizierter Testfehler.
- `VERSION.json` führt `runtime_persistence_contract_version = 1` und den kanonischen Writerpfad.
- der zentrale Quality Gate verlangt H1-Dateien und verbietet eigene Fach-`rename()`-Pfade sowie destruktive Target-Unlink-Fallbacks.

### Sicherheits- und Portabilitätsregeln

- Temp-Datei wird im selben Verzeichnis wie das Ziel erzeugt.
- exklusives Erzeugen mit `flag: "wx"`.
- kein `unlink(target) -> rename(temp)`-Fallback.
- permanente Replace-Fehler brechen fail-closed ab.
- eine teilweise erzeugte Temp-Datei wird nach Schreibfehler best-effort entfernt.
- `EEXIST` beim exklusiven Temp-Erzeugen führt nicht zum Löschen einer möglicherweise fremden Temp-Datei.
- Product- und Datenformate bleiben unverändert.

### Erster Abnahmestand

- Node 20: PASS.
- Node 24: PASS.
- Projekt-Linter: 44 JavaScript-Dateien.
- Quality Gate: 109 Projektdateien.
- Node-Test-Suite: 112/112 PASS, 0 Fehler.
- bestehende Recovery-/PRO-Failure-Injection: PASS.
- Chromium-E2E nach Writer-Migration: PASS.
- Firefox im automatischen Lauf: wie vorgesehen skipped.

### Bewusst nicht enthalten

- echte Windows-Dateisystem-CI; folgt als 0.4.2-H1b.
- verpflichtender Windows-Chromium-E2E-Lauf.
- Recovery Envelope oder Multi-Datei-Journal; folgt als 0.4.3.
- Änderung an Produktversion `0.2.0`.
- Änderung an Project-Data-Schema v1 oder PRO-Metadatenvertrag v1.

## 0.4.2 – Data Studio PRO

- Suche, Filter und Sortierung für Datensätze.
- Kategorien und Vorlagenbibliothek.
- gespeicherte Ansichten.
- Vorlagenexport ohne Datensätze.
- getrennte PRO-Metadaten in `data/data-studio-pro.json`, Schema v1.
- Companion-Modul + Navigationsbrücke statt CRUD-Duplikation.
- Same-Origin, atomare Persistenz, statischer Dateischutz und Browser-Zweitpersistenz-Verbot.
- Chromium-E2E auf drei reale Pfade erweitert.
- finaler Stand: 41 JavaScript-Dateien, 103 Projektdateien, 101/101 Node-Tests, Chromium 3/3.
- PR #84 · Squash-Merge `d22a4ba51a970966b8f0242186094fb894e14356`.

## 0.4.1-E2E – Chromium Gate & HTML UI Mirror

- Chromium als automatischer Primärbrowser; Firefox optional.
- reale CRUD-/Recovery-Browserkette.
- proportionaler HTML-Mirror `1366 × 900 @ 0,5`.
- Screenshot-/Export-Evidenz.
- realen UI-Überlagerungsfehler gefunden und container-responsiv repariert.
- PR #83 · Squash-Merge `4e0a8fca18e59ff832a79064a91cc3b222e5f4ab`.

## 0.4.1 – Recovery & Migration

- `.pwbak`-Backups mit Rotation auf zehn.
- Sicherheitsbackup vor Restore/Import.
- SHA-gebundene Vorschau und explizite Bestätigung.
- Failure-Injection vor Rename.
- beschädigte Live-Rohbytes können vor Recovery erhalten werden.
- Migrationsengine `n -> n+1`; Produktionsschema bleibt v1.
- PR #82 · Squash-Merge `babdc49367a4fe6b07ce64599fedf23c552ab173`.

## 0.4.0 – Project Data Studio

- Entwicklungsnotiz-Schnellspeichern.
- `data/project-data.json`, Schema v1.
- Eingabemasken-/Vorlagenbaukasten und Datensatz-CRUD.
- serverseitige Validierung, Same-Origin, atomare Persistenz und Mutationssperre.
- eigener Projekt-Linter und Node-20/24-CI.
- PR #81 · Squash-Merge `20546306a0db98c25a003f4cf96f142aac851d6f`.

## 0.3.0 – Flexible Workspace Engine

Abgeschlossene Teilstufen:

- A – Workspace-Vertrag.
- B – State Foundation & Autosave/Reset.
- C – Visibility Controls.
- D1 – Größenberechnung.
- D2 – CSS-Variablen-/DOM-Anwendung.
- D3a – Resize-Griff und Tastatur-Vorschau.

Pointer-/Touch-Resize und Reorder bleiben eigene spätere Teilstufen.

## 0.2.0 – Module Contract & Registry

- Modulvertrag Version 1.
- lokale Registry mit Lifecycle.
- Quality Gate und GitHub Actions.
- semantikneutraler Auto-Fix.
- Produktrelease-Merge `64b7f232acd13535133ee5f0a5e3322cbae7e0ba`.

## 0.1.0 – UI Foundation

- modulare HTML-Oberfläche.
- responsive Seitenleiste, Kopfbereich und Karten.
- Debugging/Logging mit drei Stufen.
- Versionsmetadaten und lokale Basisstruktur.

Detaillierte historische Patchlisten bleiben über Git sowie die versionsbezogenen Dateien unter `docs/` nachvollziehbar.
