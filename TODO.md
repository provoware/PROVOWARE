# TODO

Kanonische Entwicklungsroadmap. Detailhistorie bleibt über Git, CHANGELOG und die versionsbezogenen Checklisten nachvollziehbar. Diese Datei zeigt bewusst den aktuellen Stand und die nächsten realen Gates.

## Freigegebene Basis

### 0.1.0 – UI Foundation

- [x] modulare HTML-Oberfläche, responsives Dark-/Petrol-Layout und Debugging/Logging.

### 0.2.0 – Module Contract & Registry

- [x] Modulvertrag Version 1, Registry-Lifecycle, Quality Gate, GitHub Actions und semantikneutraler Auto-Fix.

Release-Merge: `64b7f232acd13535133ee5f0a5e3322cbae7e0ba`

## Paralleler Workspace-Strang – 0.3.0 Flexible Workspace Engine

- [x] A – Workspace-Vertrag.
- [x] B – State Foundation & Autosave/Reset.
- [x] C – Visibility Controls.
- [x] D1 – State-API und Größenberechnung.
- [x] D2 – DOM-Anwendung über CSS-Variablen.
- [x] D3a – Resize-Griff und Tastatur-Vorschau.
- [ ] D3b – Pointer/Maus/Touch/Stift über denselben Resize-Vertrag.
- [ ] E/F/G – Reorder, Responsive-/Accessibility-Hardening und Browserprüfung.

## Abgeschlossen – 0.4.0 Project Data Studio

- [x] Entwicklungsnotiz-Schnelleingabe mit fester Projektdatei.
- [x] Project-Data-Schema v1 mit Vorlagen und Datensätzen.
- [x] atomare Persistenz, serialisierte Mutationen und serverseitige Validierung.
- [x] Node-20/24-CI und projektspezifischer Linter.

PR `#81` · Squash-Merge `20546306a0db98c25a003f4cf96f142aac851d6f`

## Abgeschlossen – 0.4.1 Recovery & Migration

- [x] `.pwbak`-Backups, Rotation, Restore-/Import-Vorschau und SHA-Bindung.
- [x] Sicherheitsbackup vor Datenersatz.
- [x] Failure-Injection vor Rename und Recovery beschädigter Live-Daten.
- [x] Migrationsengine `n -> n+1`; Produktionsschema bleibt v1.

PR `#82` · Squash-Merge `babdc49367a4fe6b07ce64599fedf23c552ab173`

## Abgeschlossen – 0.4.1-E2E Chromium Gate & HTML UI Mirror

- [x] Chromium als automatischer Primärbrowser; Firefox optional.
- [x] echte CRUD-/Recovery-Kette automatisiert.
- [x] proportionaler Mirror `1366 × 900 @ 0,5` und Screenshot-Evidenz.
- [x] realen UI-Überlagerungsfehler gefunden und container-responsiv repariert.

PR `#83` · Squash-Merge `4e0a8fca18e59ff832a79064a91cc3b222e5f4ab`

## Abgeschlossen – 0.4.2 Data Studio PRO

- [x] Suche, Filter, Sortierung und Trefferansicht.
- [x] Kategorien und Vorlagenbibliothek.
- [x] gespeicherte Ansichten und Vorlagenexport.
- [x] eigene PRO-Metadaten `data/data-studio-pro.json`, Schema v1.
- [x] PRO-Brücke zum bestehenden CRUD-Editor ohne CRUD-Duplikation.
- [x] Chromium-Pfad auf 3/3 reale E2E-Prüfungen erweitert.
- [x] finaler Core-Gate: 41 JavaScript-Dateien, 103 Projektdateien, 101/101 Node-Tests.

PR `#84` · Squash-Merge `d22a4ba51a970966b8f0242186094fb894e14356`

## In Abnahme – 0.4.2-H1 Persistence Portability Foundation

Baseline: `9794828aa4dbe95d3a97bf6541fca008956c2056`

Branch: `feat/0.4.2-h1-persistence-portability`

Pull Request: `#86`

### Gemeinsamer Persistenzvertrag

- [x] `scripts/runtime-persistence.mjs` als kanonische Runtime-Schreibschicht angelegt.
- [x] Temp-Datei im selben Zielverzeichnis und exklusives Erzeugen mit `wx`.
- [x] Project Data und Data Studio PRO auf denselben `atomicReplaceFile`-Vertrag umgestellt.
- [x] bestehende Dateiformate und Fachvalidierungen unverändert gelassen.
- [x] vorhandenen `beforeRename`-Failure-Injection-Vertrag kompatibel gehalten.
- [x] begrenzter Retry ausschließlich für transiente Replace-Fehler `EBUSY` / `EPERM`.
- [x] destruktiven Fallback `unlink(target) -> rename(temp)` ausdrücklich ausgeschlossen.
- [x] Temp-Cleanup bei Replace-, Schreib- und Failure-Injection-Fehlern.
- [x] teilweise erzeugte Temp-Datei nach `ENOSPC` bereinigt; `EEXIST`-Fremdtemp wird nicht gelöscht.
- [x] stabile Fehlerklassen für Lock, Rechte, Read-only, Speicherplatz, Temp, Write und Replace.

### Regression / Evidence

- [x] isolierte Runtime-Persistence-Tests ergänzt.
- [x] statischer Integrationsvertrag verhindert neue eigene Fachwriter.
- [x] H1 als Pflichtbestandteil im zentralen Quality Gate verankert.
- [x] erster H1-Gate: Node 20 PASS.
- [x] erster H1-Gate: Node 24 PASS.
- [x] erster H1-Gate: 44 JavaScript-Dateien, 109 Projektdateien, 112/112 Node-Tests, 0 Fehler.
- [x] erster Chromium-E2E nach Writer-Migration: PASS; Firefox wie vorgesehen skipped.
- [ ] finalen Dokumentationsstand erneut durch Node 20/24 + Chromium prüfen.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR #86 ready setzen, squash-mergen und `main` prüfen.

## Nächster Qualitätsstrang – 0.4.2-H1b Cross-OS Persistence Gate

Ziel: denselben H1-Persistenzvertrag auf **realen Ubuntu- und Windows-Runnern** prüfen, ohne einen zweiten Windows-Codepfad einzuführen.

- [ ] GitHub-Actions-Matrix Ubuntu + Windows ergänzen.
- [ ] Pfadseparatoren und Projektpfade mit Leerzeichen/Umlauten prüfen.
- [ ] Temp-Erstellung und Cleanup auf beiden Plattformen prüfen.
- [ ] reale bzw. reproduzierbare Lock-/Rename-/Replace-Fälle prüfen.
- [ ] Rechte-/Read-only-/Speicherplatzfehler und Fehlerklassifikation prüfen.
- [ ] begrenzte Retry-Semantik und fail-closed Verhalten prüfen.
- [ ] JSON-Portability-Report pro Plattform als CI-Artefakt erzeugen.
- [ ] Windows-Browser-E2E weiterhin noch nicht verpflichtend machen.

## Danach – 0.4.3 Recovery Envelope

Ziel: Project Data und PRO-Metadaten gemeinsam sichern, ohne das bestehende `.pwbak`-Format still umzudeuten.

- [ ] explizites Envelope-Format Version 1 definieren.
- [ ] Project Data und PRO als getrennte Komponenten mit SHA-256 und Byte-Länge erfassen.
- [ ] fehlende oder beschädigte Komponenten als Zustand dokumentieren.
- [ ] bestehende `.pwbak`-Backups weiterhin lesbar halten.
- [ ] Envelope-Vorschau mit Komponentenstatus und Prüfsummen.
- [ ] Multi-Datei-Restore mit Journal und Safety-Envelope.
- [ ] Rollback nach Fehler zwischen Komponente A und B.
- [ ] Wiederanlauf nach unterbrochener Transaktion nachweisen.
- [ ] Failure-Injection an mehreren Transaktionsphasen.

## Danach – 0.5.0 Diagnose Foundation PRO

- [ ] Logging nach Bereichen und Stufen filterbar machen.
- [ ] Zeitmessung und Laufzeitkontext ergänzen.
- [ ] kontrollierten Fehlerkontext strukturieren.
- [ ] datensparsamen Diagnosebericht exportierbar machen.

## Langfristig

- [ ] reale Schema-v2-Migration erst bei tatsächlichem fachlichem Bedarf.
- [ ] SQLite nur hinter derselben Service-Schnittstelle und nur bei nachgewiesenem Bedarf.
- [ ] Berechtigungsmodell erst mit einem echten privilegierten Modul entwerfen.
- [ ] keine Remote-Plugin-Installation ohne eigenes Sicherheitskonzept.
