# Änderungsverlauf

## 0.1.0-dev - 2026-08-12

### I018.1H — Registry-Source-Fingerprint metadatenseitig synchronisiert
- I018.1-Qualification `31590478317` lief auf Head `d4c85ffc7b28c0e33dcd504c2155794caca8eaea` real mit `completed / success`; Tool-PR #47 wurde als Main-Merge `c6322ec2251fc8c54c2648c586572e34a14409e0` promoviert.
- Die autoritative Registryquelle ist über kanonische Serialisierung und SHA-256 `source_fingerprint` gebunden; ein erwarteter Fingerprint kann als Pin verwendet werden und Abweichungen blockieren fail-closed.
- Nicht kanonisierbare Registryinhalte werden fail-closed abgewiesen; bestehende I018.0-Single-Source-of-Truth- und ID-Referenzverträge bleiben erhalten.
- Masterbuch-Evidence `ERK-I018-002` ist als `E2 / P0 / BESTAETIGT` ohne Goldene Regel kanonisch; Masterbuch-Run `31590656723`, Masterbuch-Merge `6666c37071312424d24c118428bffa1cf19a46c0`.
- Registry-Persistenz, automatische Quellensuche, separater Registry-Contract-Fingerprint, Mehrprojekt-Registry und GUI bleiben `NICHT_IMPLEMENTIERT`; Signatur/Herkunftsgarantie bleibt `NICHT_QUALIFIZIERT`.
- `PROJEKTSTATUS.json` wird um den I018.1-Nachweis ergänzt; P04 wird aus abgeschlossenem I017 und konservativem I018-Teilfortschritt auf 80 % geführt. I018 bleibt `IN_ARBEIT`.
- Das bereits qualifizierte I018.0H-Metadatengate wird nach Promotion auf `workflow_dispatch` eingefroren, damit spätere Status-/Changelog-Fortschreibungen keinen historischen Kandidatenvertrag reaktivieren.
- Keine Produkt-, Test-, Registry-Persistenz-, Baseline-, Evidence-, Masterbuch- oder Nutzdatenmutation in I018.1H.

### I018.0H — read-only Registry metadatenseitig synchronisiert
- I018.0-Qualification `31573547771` lief auf Head `45e9edec963dfd4f0a7c3e23c264b1c28d08a3d1` real mit `completed / success`; Tool-PR #45 wurde als Main-Merge `f9c5a065231329a668ae9a3dc1a65783252f6362` promoviert.
- Qualifiziert wurden 6/6 neue Registry-Contracttests, 168 Gesamtregressionstests PASS sowie 1 historischer I010-Test SKIP; der SKIP wird ausdrücklich nicht als PASS umgedeutet.
- Ruff, Ruff Format, mypy strict, Lifecycle-Freeze, E1-Fail-Closed-Evidence und der qualifizierte PR-Scope waren grün.
- Masterbuch-Evidence `ERK-I018-001` ist als `E2 / P0 / BESTAETIGT` ohne Goldene Regel kanonisch; Masterbuch-Merge `650896dcee6826d141cf7a17e83bc378671d4db5`.
- Der qualifizierte Vertrag erzwingt genau eine autoritative Registryquelle, referenziert bestehende IDs nur read-only und löst Produktversion sowie Manifest-Schema deterministisch auf; Mehrdeutigkeit und Versions-/Manifestwiderspruch bleiben fail-closed.
- Registry-Persistenz, automatische Quellensuche, Registry-Source-Fingerprint und GUI bleiben `NICHT_IMPLEMENTIERT`; Crash-Atomizität und Netzwerkdateisysteme aus I017 bleiben `NICHT_QUALIFIZIERT`.
- `PROJEKTSTATUS.json` wird metadatenseitig um den I018.0-Nachweis ergänzt; P04 wird aus I017=100 % und dem konservativen I018-Teilfortschritt auf 67 % geführt. I018 bleibt `IN_ARBEIT`.
- Keine Produkt-, Test-, Registry-Persistenz-, Baseline-, Evidence-, Masterbuch- oder Nutzdatenmutation in I018.0H.

### I017FM — I017 kanonisch abgeschlossen
- I017F-Abschlussgate `31549054588` lief auf Head `f4e3c6907d7a587dd688d7ce7578a70e0b0f5c4a` real mit `completed / success`; Tool-Merge `c3e28ce098b9b2f5d63d4fe53dffaae1e088b26e`.
- I017FH-Status-Readback `31555861084` lief auf Head `5a4f7465cc14eda7b363b339c72e87a80ca2f326` real mit `completed / success`; Tool-Merge `a04d2510e05cd3d5fb12771bad29f7fd74f48b0e`.
- Der qualifizierte Readback belegte die verbliebene Abweichung zwischen `CURRENT_BASELINE`/`ITERATIONSUEBERGABE` (`I017 -> I018`) und dem nachlaufenden `PROJEKTSTATUS` (`I016 -> I017`).
- `PROJEKTSTATUS.json` wird deshalb ausschließlich metadatenseitig auf `letzte_abgeschlossene_iteration = I017` und `naechste_iteration = I018` synchronisiert; I018-Fachlogik bleibt `NICHT_IMPLEMENTIERT`.
- P04 wird nach der dokumentierten Zweischritt-Zuordnung I017/I018 mit abgeschlossenem I017 konservativ auf 50 % geführt; I018 bleibt vollständig offen.
- UUID4-Kollisionsfreiheit bleibt `NICHT_BEWIESEN`; Crash-Atomizität und Netzwerkdateisysteme bleiben `NICHT_QUALIFIZIERT`.
- Keine neue Masterbuchregel und keine Goldene Regel: I017FM ist reiner Metadatenverschluss bereits qualifizierter E2/P0-Evidence.
- Keine Produkt-, Test-, Persistenz-, Registry-, Baseline-, Evidence- oder Nutzdatenmutation.

### I017.1H — ID-Persistenz/Restart metadatenseitig synchronisiert
- I017.1 funktionaler Kandidatenlauf `31536871890` auf Head `1a0a6d85e0547d6f1e0b395281a490828d40491c` real mit `completed / success`.
- Promotions-/Evidence-Lauf `31536951091` auf Head `739f0b8368ad79f418a800d5d98b5aea70e0ab54` real mit `completed / success`.
- Tool-PR #40 wurde als Main-Merge `0d2e6c8d2e042527274fb2428efe635dbbb337cc` promoviert.
- Masterbuch-Evidence `ERK-I017-002` ist als `E2 / P0 / BESTAETIGT` ohne Goldene Regel konsolidiert; Masterbuch-Merge `5d4be8436e12937dff5e3a50aedfb8804782e0a1`.
- `PROJEKTSTATUS.json` führt den Persistenz-/Restartnachweis in einem eigenen Qualifikationsblock, ohne die historische I017-Kernaussage `ID_VERTRAGSKERN_OHNE_PERSISTENZ` umzuschreiben.
- Qualifiziert sind Restart-Erhalt, idempotente Wiederverwendung, Konfliktblockade und fail-closed Behandlung beschädigter Persistenz. Registry bleibt `NICHT_IMPLEMENTIERT`; UUID4-Kollisionsfreiheit bleibt `NICHT_BEWIESEN`; Crash-Atomizität und Netzwerkdateisysteme bleiben `NICHT_QUALIFIZIERT`.
- I017 bleibt bis zur formalen Abschlussbewertung `IN_ARBEIT`; P04 bleibt in diesem reinen Metadatenabschluss konservativ bei 20 %, I018 wird nicht vorgezogen.
- Historische I017- und I017.1-Candidate-Gates werden nach erfolgreicher Qualification auf read-only `workflow_dispatch` begrenzt.
- Keine Produkt-, Test-, Persistenz-, Registry-, Baseline- oder Nutzdatenmutation in I017.1H.

## 0.1.0-dev - 2026-08-11

### I017H — ID-Vertragskern metadatenseitig synchronisiert
- I017-ID-Vertragskern real qualifiziert: Promotionsworkflow `31526518691` auf Head `be324f1cbbe30ee4e2c9f19e17b1855d5601c34c` mit `completed / success`.
- I007-Kernvertragsregression `31526518704` auf demselben Head real erfolgreich.
- Tool-PR #38 wurde SHA-gebunden als Main-Merge `4e0a9f961c479932ac1e72c7b68367e200451ec9` promoviert.
- Masterbuch-Evidence `ERK-I017-001` ist mit Main-Merge `d6b80cdc534ae3567b5a037e420f0bc30884f318` als `E2 / P0 / BESTAETIGT` synchronisiert; keine Goldene Regel.
- Projekt-I017 bleibt formal `IN_ARBEIT`: `PERSISTENZ_ANBINDUNG = NICHT_IMPLEMENTIERT`, `REGISTRY_ANBINDUNG = NICHT_IMPLEMENTIERT`, `KOLLISIONSFREIHEIT = NICHT_BEWIESEN`.
- P04-Fortschritt wird konservativ mit 20 % geführt; der Masterplan-Abnahmekern Kollisions-/Restarttest ist noch nicht vollständig erfüllt.
- Historische I016.3H- und I017-Candidate-Gates werden nach abgeschlossener Qualification auf read-only `workflow_dispatch` begrenzt, damit spätere gemeinsame Metadaten sie nicht fälschlich reaktivieren.
- Keine Produkt-, Test-, Persistenz-, Registry-, Baseline- oder Nutzdatenmutation.

### Delta-I016.3H — P03 und PLAN_DELTA formal abgeschlossen
- Reale I016.3-Qualification nachgetragen: Workflow `31511070448` lief auf Head `403bba4b2ae6e8a79e573e95dca7f2308c37207f` mit `completed / success`.
- Tool-PR #36 wurde als kanonischer Merge `a4b63b758bf5ef71060d2e73eae95d584be13fbe` promoviert.
- Der qualifizierte End-to-End-Vertrag ist `Lease -> unmittelbarer I014-Stale-Recheck -> I015 atomar_ersetzen -> Lease freigeben`; belegter Lease, STALE/UNBEKANNT und Exception-Pfade bleiben fail-closed beziehungsweise geben den Lease deterministisch frei.
- Workflow `31511070448` publizierte keine Artefakte; deshalb wird keine Artifact-ID oder SHA erfunden. Evidence ist an Run, Qualification-Head und Merge gebunden.
- `PLAN-DELTA-P03-2026-08-10-001` erfüllt damit seine dokumentierte Abschlussbedingung und wird auf `ABGESCHLOSSEN` gesetzt.
- P03 und PLAN_DELTA-Verschluss werden auf 100 % gesetzt; die Grenzen für nicht kooperierende Schreiber und Netzwerkdateisysteme bleiben ausdrücklich `NICHT_QUALIFIZIERT`.
- Die P04-Fortsetzung wird ohne Umschreiben des Masterplans eindeutig neu zugeordnet: Projekt-I017 = Masterplan P04/I015 „dauerhafte ID-Erzeugung und Validierung“, Projekt-I018 = Masterplan P04/I016 „Versions- und Manifestregistry“.
- Diese Abschlussiteration verändert keine Produktlogik und keine Nutzdaten.

### Delta-I016.2 — Mehrprozess-Lease qualifiziert
- Echten Prozessgrenzen-Nachweis für den bereits qualifizierten Datei-Lease ergänzt; die Produktlogik und der mutierende Replace-Pfad wurden dabei nicht verändert.
- Testmodell verwendet getrennte Prozesse über `multiprocessing` mit `spawn`: Prozess A hält den Lease, Prozess B erhält deterministisch `BELEGT`, nach Freigabe kann ein neuer Prozess den Lease erwerben.
- Reale Qualification auf Head `0be678f4c9bffee072253c4b117e6658145a709a` durch Workflow `31490138072` mit `completed / success`.
- Tool-PR #34 wurde per kanonischem Merge `38f873b55a4539147458ed8a76ad4ac4f4e3e116` promoviert.
- Nicht kooperierende Schreiber und Netzwerkdateisysteme bleiben `NICHT_QUALIFIZIERT`.
- Die direkte Schreibkopplung wurde anschließend separat in I016.3 qualifiziert; dieser historische Abschnitt bleibt als zeitlicher Zwischenstand erhalten.

### Delta-I016 Phase 1 — Datei-Lease-Kern qualifiziert
- Minimalen nichtblockierenden Linux-advisory-Lease für genau ein Ziel eingeführt; die Nutzdatei selbst wird beim Lease-Erwerb nicht verändert.
- Exklusiver Erwerb, konkurrierender kooperierender Erwerb, erneuter Erwerb nach Freigabe, idempotente Freigabe und fail-closed Pfadfehler qualifiziert.
- I012–I015-Plattformverträge auf dem Qualifikations-Head erneut regressionsgeprüft.
- I016-Workflow `31476216289` und I015-Revalidation `31476216369` real mit `success` beendet.
- Qualifikations-Head `4eea4591ae2296961869f567498744372aa7ff11`; Artifact `9095330662`, 899 Byte, SHA-256 `fd7d62679176faf3a3dcd90b7675f492e40b620c9fb5a7035273a1f5876b2ec6`.
- Phase 1 per kanonischem Tool-Merge `cfb9d67966ba737eb1331004890973ed2404f3ff` promoviert.
- Nicht kooperierende Schreiber und Netzwerkdateisysteme bleiben `NICHT_QUALIFIZIERT`.
- Die zu diesem Zeitpunkt noch offene Replace-Integration wurde später separat in I016.3 qualifiziert.

## 0.1.0-dev - 2026-08-10

### I015 — Atomarer Einzeldatei-Replace qualifiziert
- Ersten bewusst mutierenden P03-Baustein als isolierten Einzeldatei-Vertrag hinter den bereits qualifizierten I012–I014-Sicherheitsgates eingeführt.
- Mutation nur bei `INNERHALB` (Projektwurzel), `SICHER` (Symlinkprobe) und unmittelbar erneut bestätigtem `GLEICH` (Stale-Guard).
- Temp-Datei ausschließlich im Zielverzeichnis; Berechtigungsbits werden übernommen, Dateiinhalt vor `os.replace` geflusht und per Datei-fsync gesichert.
- `os.replace` führt die Namensmutation atomar aus; anschließender Verzeichnis-fsync ist ein getrenntes Dauerhaftigkeitsgate.
- Fehler vor `os.replace` erhalten das Original und behaupten keine Mutation; Fehler nach erfolgreichem Replace melden `mutation_erfolgt=true` und täuschen keinen Rollback vor.
- Lock-Lease, Batch-Schreiben und Delete bleiben ausdrücklich außerhalb von I015.
- Finaler Workflow `31378734347` vollständig grün; Artifact `9058982637`, 759 Byte, SHA-256 `448c1aa364596e78ad3fe73a86aaafdda10dfd2e1253ae8ce14858876700f73f`, Receipt-SHA-256 `ef11d8315907029c31c19d0c003a6f42573d72ab0387c48e434121d549201703`.
- Produkt-PR #22 SHA-gebunden auf den qualifizierten Head `4cdbe1a2810476c1e95588dfed6199025d6b4826` gemergt; Produktmerge `8052d9ce42014e6037c59b0aed47d8dcd2edecc1`.
- Vorherige I014-Baseline auf `backup/vor-i015-promotion-2026-08-10` gesichert; Promotions-PR #23 bindet Status, Register, Wissen und Evidence ohne neue Produktlogik.
- `ERK-I015-001` nach realer Qualification von E1 auf E2 gehoben; keine Goldene Regel.
- PLAN-DELTA-Verschluss auf 50 % erhöht; P03-Meilensteinfortschritt bleibt bis zum separat qualifizierten Lock-Lease konservativ bei 75 %.

### I014 — Read-only Dateiidentität und Stale-Guard qualifiziert
- `DateiIdentitaet` aus Device, Inode, Objektart, Modus, Größe, `mtime_ns` und `ctime_ns` eingeführt.
- Fail-closed Recheck mit `GLEICH`, `STALE` und `UNBEKANNT` implementiert; fehlende oder nicht lesbare Identität kann niemals als gleich gelten.
- Inode-Austausch und relevante Stat-Drift werden als `STALE` erkannt; Snapshot und Recheck verändern Nutzdaten nicht.
- P0-`PLAN_DELTA-P03-2026-08-10-001` dokumentiert die sicherheitsbedingte Abweichung vom Masterplan: atomare Replace- und Lock-Lease-Bausteine bleiben aufgeschoben, bis Symlink- und TOCTOU-Vorbedingungen qualifiziert sind.
- Erster Workflow `31373390990` nach 9 Contracttests und 30 Plattformregressionen ausschließlich an Ruff E501 gescheitert; keine übersprungenen Gates wurden als PASS gewertet.
- Minimaler Formatfix ohne Logikänderung; finaler Workflow `31373576096` vollständig grün: 9 I014-Contracttests, 30 I011-I013-Plattformregressionen, Ruff, Ruff Format, mypy strict, P02-Runtime-Regression und Gesamtregression.
- Artifact `9057041454`, 778 Byte, SHA-256 `a7645776306118682e6c2f1d81718fdc04669647e9500c0de474625a9414a050`; Receipt-SHA-256 `2bca92ad8795620ec1b1edcdcb90a14a2cb25559cb087f1d0ad282285851526b`.
- I013-Baseline auf `backup/vor-i014-promotion-2026-08-10` gesichert; Produkt-PR #21 SHA-gebunden als Squash-Commit `73e8e86eb359c8f9b5baceaade259bf5eb749c14` gemergt.
- `ERK-I014-001` nach realer Qualification von E1 auf E2 gehoben; keine Goldene Regel.
- P03-Fortschritt bleibt konservativ bei 75 %, weil die ursprünglich vorgesehenen mutierenden P03-Bausteine durch den PLAN_DELTA noch nicht erledigt sind.

### I013 — Read-only Symlink- und Dateisystemprobe qualifiziert
- Segmentweise `lstat`-Probe ohne `resolve`/`realpath` eingeführt.
- Zustände `SICHER`, `SYMLINK` und `UNBEKANNT` fail-closed modelliert und direkt auf I012 `symlink_frei` abgebildet.
- Symlinks im Kandidaten- und Elternpfad, fehlende Segmente sowie `lstat`-/Berechtigungsfehler abgedeckt.
- Nicht-Mutations-Test bestätigt, dass Inhalt, Größe und `mtime_ns` durch die Probe unverändert bleiben.
- Historisches I012-CI-Gate auf seine eigenen qualifizierten Quellen begrenzt; historische Evidence blieb unverändert.
- Finaler Workflow `31365831357` vollständig grün auf Head `3d6d809cf18904afa11f7d7e5c9d9f770afde0fd`; 9 I013-Contracttests, 21 I011/I012-Plattformregressionen, Ruff, Ruff Format, mypy strict, P02-Runtime-Regression und Gesamtregression grün.
- Artifact `9054096684`, 1031 Byte, SHA-256 `a7cc14181ac15011e83f2b7e9fa7890eb2e120aa2aaf7f6439b94f268bf9fc39`.
- Vorherige I012-Baseline auf `backup/vor-i013-promotion-2026-08-10` gesichert.
- P03-Fortschritt auf 75 % gesetzt; I014 wird als read-only Dateiidentitäts- und Stale-Guard-Vertrag vorbereitet. TOCTOU bleibt ausdrücklich offen.

### I012 — Pfadnormalisierung und Projektwurzel-Schutz qualifiziert
- Read-only Pfadnormalisierung und segmentbasierte Projektwurzel-Prüfung eingeführt.
- Parent-Traversal fail-closed blockiert und präfixähnliche Geschwisterpfade ausdrücklich nicht als Unterpfade akzeptiert.
- Symlink-Sicherheit als expliziten Vorprüfstatus modelliert; ungeklärte Symlink-Semantik kann nicht als `INNERHALB` qualifiziert werden.
- Historische I011-/I010-Gates auf ihren qualifizierten Quell- und Lebenszyklus-Scope begrenzt, ohne historische Evidence zu verändern.
- Finaler Workflow `31357647745` vollständig grün; Artifact `9051207196`, 786 Byte, SHA-256 `1cced27d241951ec9190f82f7bb72680193d4d325cfdae9c10e1a371309c1d3a`, Receipt-SHA-256 `b88d8a6cc811b2119490cca9d6a6716b921bf9c0fe0f0e61895fa50dea825010`.
- Produktstand per PR #18 auf Main-Merge-Commit `0402f4f910923f703eadb97243bc554ebccf2f0c` übernommen; vorherige I011-Baseline auf `backup/vor-i012-promotion-2026-08-10` gesichert.
- P03-Fortschritt auf 50 % gesetzt und I013 als read-only Symlink-/Dateisystemprobe freigegeben.

### I011 — Linux-Systemprofil und X11-Erkennung qualifiziert
- Read-only Linux-Systemprofil mit injizierbaren Erkennungsquellen eingeführt.
- Ubuntu 22.04 und 24.04 amd64 X11 über Golden-Profile qualifiziert.
- `XDG_SESSION_TYPE` als primäres Session-Signal verwendet; `DISPLAY` allein qualifiziert keine echte X11-Sitzung.
- Wayland/XWayland, unbekannte Session und nicht-amd64 als fail-closed Negativfälle abgesichert.
- Deterministischen Profil-Fingerprint und strukturierte Plattformzustände eingeführt.
- Historische P02-Phasenabschlussgates unverändert erhalten und im P03-Regressionslauf sauber getrennt behandelt.
- Finale Qualifikation: **11 I011-Contracttests**, Ruff grün, Ruff Format grün, mypy strict grün, **59 P02-Runtime-Regressionstests** und **88 Gesamtregressionstests** grün; historische Freeze-Nachweise separat unverändert bestätigt.
- Workflow `31346707865`, Artifact `9047566065`, **830 Byte**, SHA-256 `e7206090329a169437cfad847d109422f83b30eca122608d16935e02f3a33ec0`, Receipt-SHA-256 `ba8150c4a6a6454c6b2dacbf9e974394e9a0d409edf6a21d8c3b51805ac3bb76`.
- I011 per PR #16 auf Main-Merge-Commit `66b9f5fbede68c61eb3d54185a253ff8bea81ca4` promoviert; vorherigen Stand zusätzlich auf `backup/vor-i011-promotion-2026-08-10` gesichert.
- P03-Fortschritt auf 25 % gesetzt und I012 Pfadnormalisierung/Projektwurzel-Schutz freigegeben.

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
- Netzwerkdateisystem-Qualification und Schutz gegen nicht kooperierende fremde Schreiber; beide bleiben außerhalb des qualifizierten lokalen advisory-Lease-Vertrags.
- I017: optionaler Crash-/Teilwrite-Härtungsnachweis; der formale I017-Abschluss ist erfolgt, Crash-Atomizität bleibt dennoch `NICHT_QUALIFIZIERT`.
- P04: I018 ist nach I018.1 read-only Registry-Source-Fingerprint fortgeschritten; Registry-Persistenz, automatische Quellensuche, separater Contract-Fingerprint, Mehrprojekt-Registry und GUI bleiben offen.
- SQLite-Datenkern.
- PySide6-Oberfläche.
- Module.
- Release-Builder.
