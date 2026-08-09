# Änderungsverlauf

## 0.1.0-dev - 2026-08-09

### I006 — reproduzierbarer Offline-Clean-Bootstrap qualifiziert
- I005-Actions-Artefakt über feste Run-/Artifact-Identität geladen und vor dem Entpacken per SHA-256 verifiziert.
- Nach dem Entpacken Manifest, Evidence und alle 50 Wheel-Hashes erneut geprüft.
- Zwei voneinander getrennte Clean-Bootstraps auf Ubuntu 22.04.5 LTS / CPython 3.13.15 durchgeführt.
- Paketinstallation mit `PIP_NO_INDEX=1`, `--no-index`, lokalem `PIP_FIND_LINKS` und zusätzlicher Proxy-Falle erzwungen.
- Beide Paket-Freezes byteidentisch mit I005 und miteinander; SHA-256 `5e44649e72afd6b6076f76c21bcb29b8232d17ae106bdece4e0cca122090b1ed`.
- In beiden Umgebungen `pip check`, Projektinstallation, Baseline-Prüfer, 17 Tests, Ruff Check/Format und Import-Smoke erfolgreich.
- Hartcodierte I004-Annahme aus dem Baseline-Prüfer entfernt; Prüfung arbeitet jetzt gegen autoritative Baseline-/Iterationsregistries.
- Prüflogik nach Ruff-Komplexitätsgate modularisiert und bestehende Strukturtests formatiert.
- I006-Evidence-Artefakt `9043135144` mit SHA-256 `2029a08b0b772524bb023b1066bf0730a3ec2ca118723af6caf5c4f3778f7636` erzeugt und lokal nachverifiziert.
- P00 und P01 im Masterplanstatus auf `VALIDIERT` gesetzt; P02 ist `BEREIT`.

### I005 — Offline-Wheelhouse qualifiziert
- Reproduzierbarer GitHub-Actions-Builder auf Ubuntu 22.04 amd64 eingeführt.
- CPython 3.13.15 und pip 25.2 als Ausführungsbasis erzwungen.
- Direkte Toolchain-Pins festgelegt; transitive Abhängigkeiten vollständig aufgelöst und inventarisiert.
- 50 Wheels mit zusammen 294428822 Bytes erzeugt; keine Source-Distribution zugelassen.
- SHA-256 je Wheel, finales Wheelhouse-Manifest, Lizenz- und `Requires-Dist`-Inventar sowie vollständiger Offline-Freeze erzeugt.
- Zweite frische Umgebung ausschließlich aus lokalem Wheelhouse mit `PIP_NO_INDEX=1` und `--no-index` installiert.
- `pip check`, Import-/CLI-Smoke, Baselineprüfung, 11 Projekttests und Ruff Check/Format erfolgreich.
- GitHub-Actions-Artefakt `9042907351` mit SHA-256 `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040` erzeugt und lokal nachverifiziert.
- Regressionstest ergänzt, damit vendorte `.dist-info/METADATA`-Dateien in Wheels nicht mit der Root-Paketmetadatei verwechselt werden.

### Neuaufbau I000-I004
- Repository-Neuaufbau auf Basis des Masterplans v2.0.0.
- Maschinenlesbare Projekt-, Technologie-, Architektur-, Versions- und Gate-Registries.
- Struktur- und Baseline-Validator.
- Zentrale `pyproject.toml`-Qualitätskonfiguration.
- Backup-Hinweis auf den vorherigen Repositoryzustand.
- Initiale Evidence für I000-I004.

### Bewusst noch nicht enthalten
- Fachlogik.
- SQLite-Datenkern.
- PySide6-Oberfläche.
- Module.
- Release-Builder.
- I007 Vertrags- und Datentypen.
