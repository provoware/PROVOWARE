# Änderungsverlauf

## 0.1.0-dev - 2026-08-09

### I008 — Manifest- und Projektschemata qualifiziert
- `SchemaVersion` als eigener numerischer `MAJOR.MINOR.PATCH`-Typ eingeführt.
- `ProduktVersion` technisch und semantisch von Schema-Versionen getrennt; Vorab-Suffixe wie `0.1.0-dev` bleiben ausschließlich Produktversionen vorbehalten.
- `ManifestSchema` als minimale strikt versionierte Identitätshülle eingeführt.
- `ProjektSchema` als minimale Projektidentität mit dem bereits qualifizierten `Status` eingeführt.
- `SchemaValidierungsfehler` mit stabilem Code, Feldbezug und Nachricht eingeführt.
- Unbekannte Felder, fehlende Pflichtfelder, falsche Schema-Arten und inkompatible Schema-Versionen werden strikt abgewiesen.
- Deterministische JSON-Serialisierung als Vertragsbestandteil festgelegt.
- Kanonische gültige und ungültige Golden-Fixtures für Manifest- und Projektbeispiele ergänzt.
- I007-ID-Präfixe, Statuswerte, Fehlerklassen und `OperationErgebnis`-Invarianten per Contracttest als öffentliche API eingefroren.
- Architekturwächter von anfälliger Textsuche auf AST-basierte Prüfung echter Imports und `open()`-Dateizugriffe gehärtet.
- `VERSIONSREGISTER.json`, Architekturregister, Komponentenregister, Traceability und ADR-0003 nachgezogen.
- Finale Qualifikation auf Ubuntu 22.04.5 / Python 3.13.15: Ruff grün, mypy strict grün, **30 Contracttests** und **48 Regressionstests** bestanden.
- Finaler I008-Workflow `31336626886`, Artifact-ID `9044527742`, Größe **0,000618 MB**, SHA-256 `f58529730ac88675ab1b002130abca1f33e8ceffc4df8727c7a09e7ebf194e61`.
- I007-Regressionsworkflow auf dem finalen I008-Head erneut vollständig grün.
- Vorheriger validierter I007-main-Stand auf `backup/vor-i008-promotion-2026-08-09` gesichert.

### I007 — strikt typisierte Kernverträge qualifiziert
- `ProjektId`, `ObjektId`, `RevisionId`, `ChangeId` und `OperationId` als unveränderliche, domänentrennte Wertobjekte eingeführt.
- Kanonisches ID-Format `<praefix>_<32 lowercase-hex>` festgelegt und validiert.
- `Status` und `Fehlerklasse` als stabile `StrEnum`-Verträge eingeführt.
- `FehlerInfo` trennt Fehlerklasse, maschinenlesbaren Diagnosecode und Nachricht.
- `OperationErgebnis[T]` erzwingt widerspruchsfreie Erfolgs-/Fehlerzustände.
- Vertragsschicht technisch von Qt, SQLite, Datei-I/O und Modulen getrennt.
- ADR-0002, Architekturregister, Komponentenregister, Fehlerklassenregister und Traceability nachgezogen.
- DELTA-0003 geschlossen: I005-Workflow reagiert nicht mehr auf beliebige `tests/**`.
- DELTA-0005 geschlossen: Transfer V1 wird nicht mehr durch allgemeine Produktstatusänderungen als veraltete I006-Baseline automatisch gestartet.
- DELTA-0006 geschlossen: auch I006 reagiert nicht mehr auf beliebige `tests/**`.
- Finale Qualifikation auf Ubuntu 22.04.5 / Python 3.13.15: Ruff grün, mypy strict grün, 16 Contracttests und 33 Regressionstests bestanden.
- Finaler I007-Workflow `31335066204`, Artifact-ID `9044073684`, Größe **0,000575 MB**, SHA-256 `007a7f0412274a1dcf72379202f87f3fa7629be4de6dd500534ed4a88373a909`.
- I005, I006 und Transfer V1 nach den CI-Änderungen erneut vollständig grün revalidiert.
- I006-Rückfallbasis auf `backup/vor-i007-promotion-2026-08-09` gesichert.

### I006 — reproduzierbarer Offline-Clean-Bootstrap qualifiziert
- I005-Actions-Artefakt über feste Run-/Artifact-Identität geladen und vor dem Entpacken per SHA-256 verifiziert.
- Nach dem Entpacken Manifest, Evidence und alle 50 Wheel-Hashes erneut geprüft.
- Zwei voneinander getrennte Clean-Bootstraps auf Ubuntu 22.04.5 LTS / CPython 3.13.15 durchgeführt.
- Paketinstallation mit `PIP_NO_INDEX=1`, `--no-index`, lokalem `PIP_FIND_LINKS` und zusätzlicher Proxy-Falle erzwungen.
- Beide Paket-Freezes byteidentisch mit I005 und miteinander; SHA-256 `5e44649e72afd6b6076f76c21bcb29b8232d17ae106bdece4e0cca122090b1ed`.
- In beiden Umgebungen `pip check`, Projektinstallation, Baseline-Prüfer, 17 Tests, Ruff Check/Format und Import-Smoke erfolgreich.
- I006-Evidence-Artefakt `9043135144` mit SHA-256 `2029a08b0b772524bb023b1066bf0730a3ec2ca118723af6caf5c4f3778f7636` erzeugt.
- P00 und P01 im Masterplanstatus auf `VALIDIERT` gesetzt.

### I005 — Offline-Wheelhouse qualifiziert
- Reproduzierbarer GitHub-Actions-Builder auf Ubuntu 22.04 amd64 eingeführt.
- CPython 3.13.15 und pip 25.2 als Ausführungsbasis erzwungen.
- Direkte Toolchain-Pins festgelegt; transitive Abhängigkeiten vollständig aufgelöst und inventarisiert.
- 50 Wheels mit zusammen 294428822 Bytes erzeugt; keine Source-Distribution zugelassen.
- SHA-256 je Wheel, finales Wheelhouse-Manifest, Lizenz- und `Requires-Dist`-Inventar sowie vollständiger Offline-Freeze erzeugt.
- Zweite frische Umgebung ausschließlich aus lokalem Wheelhouse mit `PIP_NO_INDEX=1` und `--no-index` installiert.
- `pip check`, Import-/CLI-Smoke, Baselineprüfung, Projekttests und Ruff Check/Format erfolgreich.
- GitHub-Actions-Artefakt `9042907351` mit SHA-256 `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040` erzeugt.

### Neuaufbau I000-I004
- Repository-Neuaufbau auf Basis des Masterplans v2.0.0.
- Maschinenlesbare Projekt-, Technologie-, Architektur-, Versions- und Gate-Registries.
- Struktur- und Baseline-Validator.
- Zentrale `pyproject.toml`-Qualitätskonfiguration.
- Backup-Hinweis auf den vorherigen Repositoryzustand.
- Initiale Evidence für I000-I004.

### Bewusst noch nicht enthalten
- OperationRequest/OperationResult aus I009.
- abschließendes P02-Architekturgate aus I010.
- SQLite-Datenkern.
- PySide6-Oberfläche.
- Module.
- Release-Builder.
