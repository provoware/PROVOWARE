# Änderungsverlauf

## 0.1.0-dev - 2026-08-09

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
- I006 Clean-Bootstrap-Nachweis.
