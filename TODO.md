# Offene Punkte

## P0 — nächster Pflichtschritt I011
- P03 ausschließlich mit dem read-only Linux-Systemprofil und der X11-Erkennung beginnen.
- Ubuntu 22.04 und Ubuntu 24.04 amd64 X11 über deterministische, injizierbare Golden-Profile qualifizieren.
- X11 nicht nur aus `DISPLAY` ableiten; XWayland, Wayland und widersprüchliche Session-Signale müssen strukturiert unterschieden werden.
- OS-/Session-Probes von der eigentlichen Profilbewertung trennen, damit Tests nicht vom CI-Host abhängen.
- unbekannte oder nicht unterstützte Architektur-/Sessionzustände fail-closed beziehungsweise eindeutig als unbekannt/nicht V1-qualifiziert ausgeben.
- `P02_API_SNAPSHOT.json` und `P02_QUELLINVENTAR.json` während I011 unverändert lassen und über das I010-Gate revalidieren.
- keine Pfadnormalisierung, atomare Dateischreibprimitive oder Lock-Lease-Logik aus I012-I014 vorziehen.
- Ruff, mypy strict, Plattformtests, P02-Regressionsgate und vollständige Regression aus dem I005-Wheelhouse ausführen.

## P03 danach
- I012: Pfadnormalisierung und Projektwurzel-Schutz mit Traversal-/Symlink-Testmatrix.
- I013: atomare Temp/Replace-Primitive mit Crash-/Disk-full-Tests.
- I014: Lock-Lease und Prozessidentität mit stale-lock-Recovery.

## Erledigt in I010
- P02 als gemeinsames Architektur- und Vertragsgate über I007-I009 vollständig qualifiziert.
- kanonischen `P02_API_SNAPSHOT.json` mit SHA-256-Fingerprint eingeführt.
- exaktes hashgebundenes `P02_QUELLINVENTAR.json` eingeführt.
- gemeinsame AST-Abhängigkeitsmatrix und Versionsraum-/Traceability-Prüfung eingeführt.
- Negativfixtures für SQLite, Qt/PySide, Handler, Datei-I/O, unregistrierte P02-Quellen und vorgezogene P03-Quellen nachweisbar ROT qualifiziert.
- parallelen schwächeren I010-Teil-Snapshot entfernt; eine einzige kanonische Wahrheitsquelle bleibt.
- 12 Architektur-/Negativtests, 49 Contracttests und 80 Gesamtregressionstests grün; Ruff und mypy strict grün.
- I005-I009-Regressionsworkflows auf finalem I010-Head erneut grün.
- I009-Rückfallbasis auf `backup/vor-i010-promotion-2026-08-10` gesichert.
- P02 erst nach erfolgreicher I010-Promotion auf `VALIDIERT` gesetzt; P03/I011 freigegeben.

## Release-Blocker
- Keine Stable-Freigabe vor vollständigem PoA, Fault-/Recovery-Nachweis, Real-Target-Abnahme und Release-Gates G0-G15.

## Langfristige Artefaktaufbewahrung
Das I005-GitHub-Actions-Artefakt besitzt zeitlich begrenzte Retention. Vor produktiver Offline-Nutzung muss die validierte Wheelhouse-Baseline zusätzlich in eine dauerhafte Projekt-/Release-Ablage mit identischem SHA-256 überführt werden.
