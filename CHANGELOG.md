# Änderungsverlauf

## 0.1.0-dev - 2026-08-10

### I010 — P02 Architecture Gate und Unified Contract Qualification
- Öffentliche I007-I009-Vertragsoberfläche als kanonischen `P02_API_SNAPSHOT.json` eingefroren.
- Snapshot enthält öffentliche Symbole, Typklassen, Dataclass-Felder, ID-Präfixe, Enumwerte, Schema-Versionen, Pflichtfelder, Vertragsmarker und stabile Fehlercodes.
- Kanonischen API-Fingerprint `2e74f555a8b7cc4aaa45f7cb109eaf22a1c255953d9ff98bb159ad2df895ed16` qualifiziert.
- `P02_QUELLINVENTAR.json` als exaktes hashgebundenes P02-Produktquellinventar eingeführt.
- `WERKZEUGE/p02_architekturgate.py` als gemeinsames Baseline-, Inventar-, AST-, API-, Versions- und Traceability-Gate eingeführt.
- Negative Architektur-Fixtures für SQLite, Qt/PySide, Handler, Datei-I/O, unregistrierte P02-Quellen und vorgezogene P03-Quellen ergänzt.
- Nachgewiesen, dass absichtliche Architekturverletzungen das Gate tatsächlich ROT schalten.
- Parallelen schwächeren I010-Teil-Snapshot und redundanten Contracttest entfernt; eine einzige kanonische Wahrheitsquelle bleibt.
- REQ-V1-003 bis zur Gesamtpromotion wieder auf `IN_ARBEIT` gesetzt und erst nach grüner Evidence auf `VALIDIERT` geschlossen.
- ARCH-013 als verbindliche Snapshot-/Quellinventar-Migrationsregel eingeführt und nach Gesamtqualifikation validiert.
- Finale Qualifikation auf Ubuntu 22.04.5 / CPython 3.13.15: Ruff grün, Ruff Format grün, mypy strict grün, **12 Architektur-/Negativtests**, **49 Contracttests** und **80 Gesamtregressionstests** bestanden.
- I005-, I006-, I007-, I008- und I009-Regressionsworkflows auf finalem I010-Head erneut vollständig grün.
- Workflow `31339417368`, Artifact `9045351696`, **0,000683 MB**, SHA-256 `6ebf3d679a063eaf4b09f8cc7b8adcc51cea16643596d545796d1acd0f22a9b9`, Receipt-SHA-256 `cb0b092abd5b2356e5c0197a5e8df48c6e50612d822772d049bb374a6d1c5fee`.
- Validierten I009-main-Stand vor Promotion auf `backup/vor-i010-promotion-2026-08-10` gesichert.
- I010 per PR #11 auf Main-Merge-Commit `7dfe6d2cf039d9b974bad464ed0efa0aa6eec998` promoviert.
- P02 erst danach auf `VALIDIERT` gesetzt und P03/I011 freigegeben.

## 0.1.0-dev - 2026-08-09

### I009 — kanonische Operationsverträge qualifiziert
- Obsoleten parallelen I008-PR #7 geschlossen und als durch PR #8 ersetzt dokumentiert.
- I008-Regressionsworkflow promotionsfest gemacht: aktuelle validierte Baseline und historische I008-Evidence werden getrennt geprüft.
- `OperationArt` als streng validierten Code-Werttyp ohne vorgezogene Fach- oder Handler-Enum eingeführt.
- `OperationPayload` als unveränderliche kanonische JSON-Objekthülle eingeführt.
- Tiefe Payload-Validierung mit Limits für Verschachtelung, Containergröße, Schlüssel und 65.536 Byte kanonische Größe eingeführt.
- Fließkommazahlen für eindeutige kanonische Semantik explizit ausgeschlossen.
- `OperationRequest` mit Schema, `OperationId`, Operationsart und Payload eingeführt.
- `OperationResult` ausschließlich auf `OperationErgebnis[OperationPayload]` und `FehlerInfo` aufgebaut; keine zweite Ergebnissemantik.
- Request und Result ausschließlich über `OperationId` korreliert.
- Deterministische JSON-Serialisierung und SHA-256-Fingerprints für Payload, Request und Result qualifiziert.
- Unbekannte Request-/Result-Felder fail-closed abgewiesen.
- Gültige und ungültige Golden-Fixtures für Request, Erfolg, Fehler, Float, Widerspruch und unbekannte Felder ergänzt.
- AST-basierte Architekturgrenze auf Handler, GUI, SQLite, Persistenz und Dateizugriffe erweitert.
- Payload-Normalisierung nach erstem Ruff-Befund in kleinere wartbare Hilfsfunktionen zerlegt und exakt auf Ruff 0.16.1 formatiert.
- Finale Qualifikation: Ruff grün, mypy strict grün, **49 Contracttests** und **68 Gesamtregressionstests** bestanden.
- I007- und I008-Regressionsworkflows auf finalem I009-Head ebenfalls vollständig grün.
- Finaler I009-Workflow `31337914639`, Artifact-ID `9044902480`, Größe **0,000663 MB**, SHA-256 `962e8e45bb2df60a6ead6750bf9b737520ea30290eabf3df73510a10ef7ec5f9`.
- Vorheriger validierter I008-main-Stand auf `backup/vor-i009-promotion-2026-08-09` gesichert.
- I009 per PR #9 auf Main-Merge-Commit `5f94bfc43c038530738d1a320ba6c9a050b39a17` promoviert.

### I008 — Manifest- und Projektschemata qualifiziert
- `SchemaVersion` und `ProduktVersion` technisch getrennt.
- `ManifestSchema`, `ProjektSchema` und strukturierte Schemafehler eingeführt.
- Unbekannte Felder, fehlende Pflichtfelder, falsche Schema-Arten und inkompatible Versionen strikt abgewiesen.
- Deterministische JSON-Serialisierung und kanonische Golden-Fixtures qualifiziert.
- I007-ID-Präfixe, Statuswerte, Fehlerklassen und `OperationErgebnis`-Invarianten als öffentliche API eingefroren.
- AST-basierte Architekturprüfung eingeführt.
- 30 Contracttests und 48 Regressionstests bestanden; Ruff und mypy strict grün.
- Workflow `31336626886`, Artifact `9044527742`, **0,000618 MB**, SHA-256 `f58529730ac88675ab1b002130abca1f33e8ceffc4df8727c7a09e7ebf194e61`.

### I007 — strikt typisierte Kernverträge qualifiziert
- `ProjektId`, `ObjektId`, `RevisionId`, `ChangeId`, `OperationId`, `Status`, `Fehlerklasse`, `FehlerInfo` und `OperationErgebnis[T]` qualifiziert.
- ID-Präfixe und Ergebnisinvarianten stabilisiert.
- Vertragsschicht technisch von Qt, SQLite, Datei-I/O und Modulen getrennt.
- 16 Contracttests und 33 Regressionstests bestanden; Ruff und mypy strict grün.
- Workflow `31335066204`, Artifact `9044073684`, **0,000575 MB**.

### I006 — reproduzierbarer Offline-Clean-Bootstrap qualifiziert
- Zwei voneinander getrennte Offline-Clean-Bootstraps auf Ubuntu 22.04.5 / CPython 3.13.15 durchgeführt.
- Paketinstallation ausschließlich aus I005-Wheelhouse erzwungen.
- Byteidentische Paket-Freezes und vollständige Baseline-/Ruff-/Testprüfung.

### I005 — Offline-Wheelhouse qualifiziert
- 50 Wheels mit zusammen 294428822 Byte erzeugt und inventarisiert.
- Zweite frische Umgebung ausschließlich offline aus dem Wheelhouse installiert und geprüft.
- Artifact `9042907351`, SHA-256 `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040`.

### Neuaufbau I000-I004
- Repository-Neuaufbau auf Basis des Masterplans v2.0.0.
- Maschinenlesbare Projekt-, Technologie-, Architektur-, Versions- und Gate-Registries.
- Struktur- und Baseline-Validator sowie zentrale Qualitätskonfiguration.

### Bewusst noch nicht enthalten
- I011-I014 P03-Plattform-/Dateisystemschicht.
- SQLite-Datenkern.
- PySide6-Oberfläche.
- Module.
- Release-Builder.
