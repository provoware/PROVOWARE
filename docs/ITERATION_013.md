# Iteration I013 — Read-only Symlink- und Dateisystemprobe

## Ausgangszustand

Kanonische Basis ist `BASELINE-2026-08-10-I012`. I012 qualifiziert Projektwurzel-Zugehörigkeit rein lexikalisch und fail-closed, erwartet die Aussage `symlink_frei` aber bewusst aus einer vorgelagerten Quelle. I013 schließt genau diese Lücke.

## Gewählter kleiner Schritt

Ein isolierter Adapter `src/provoware/plattform/dateisystem_probe.py` prüft einen absoluten POSIX-Pfad segmentweise mit `lstat`. Er folgt keinen Symlinks, verwendet weder `resolve` noch `realpath` und führt keinerlei schreibende Operation aus.

Ergebniszustände:

- `SICHER`: alle Segmente konnten gelesen werden und kein Segment ist ein Symlink;
- `SYMLINK`: mindestens ein Segment ist ein Symlink;
- `UNBEKANNT`: Eingabe ungültig, Segment fehlt oder `lstat` schlägt fehl.

Die Eigenschaft `symlink_frei` bildet diese Zustände direkt auf den I012-Vertrag `True | False | None` ab.

## Ablauf- und Risikoanalyse

1. I012-Baseline und Übergabevertrag prüfen.
2. Read-only Adapter mit injizierbarer `lstat`-Funktion implementieren.
3. Datei-, Verzeichnis-, Kandidaten-Symlink-, Eltern-Symlink-, Missing- und Fehlerfälle testen.
4. Determinismus und Nicht-Mutation prüfen.
5. Ruff, Ruff Format, mypy strict und Regression über CI ausführen.
6. Erst nach real grünem Workflow Receipt/Evidence prüfen und Promotion erwägen.

### Risiken

- **TOCTOU:** Eine erfolgreiche Probe garantiert nicht, dass der Pfad bei einer späteren Mutation unverändert ist. Dieses Risiko bleibt offen und muss in einem späteren mutierenden Vertrag erneut geprüft werden.
- **Symlink-Folgen:** `resolve`/`realpath` werden absichtlich nicht verwendet, damit die Probe keine Symlink-Semantik verschleiert.
- **Fehlerzustände:** Nicht existente oder nicht lesbare Segmente dürfen nie als sicher gewertet werden.
- **Scope-Creep:** Keine Locks, keine Schreibprimitive, keine Persistenz und keine GUI in I013.

## Reale CI-Befunde und Korrekturen

Die ersten Läufe wurden bewusst nicht als PASS gewertet:

- Run `31365172908`: Produkt- und Regressionstests sowie Ruff/Format grün; mypy meldete eine zu abstrakte Rückgabetyp-Grenze für die injizierte `lstat`-Funktion. Minimalfix: Typgrenze auf den tatsächlich verwendeten `os.stat_result`-Vertrag präzisiert.
- Run `31365257105`: Tests grün; Ruff meldete ausschließlich eine Importreihenfolge. Importstruktur wurde ohne Laufzeitänderung überarbeitet.
- Run `31365391079`: Tests grün; Ruff meldete weiterhin nur Importreihenfolge. Die Injektion wurde daraufhin als explizites Callable-Protocol mit `None`-Default modelliert, sodass der reale `os.lstat`-Pfad nicht als Default-Callable typisiert werden muss.
- Run `31365563846`: Ruff-Lint grün; Ruff-Format verlangte ausschließlich die einzeilige Darstellung der bedingten `lstat`-Auswahl. Reine Formatkorrektur, keine Logikänderung.
- Run `31365712032`: vollständig grün. I012-Baseline, 9 I013-Contracttests, 21 I011/I012-Plattformregressionstests, Ruff, Ruff Format, mypy strict, P02-Laufzeitregression, Gesamtregression, Qualification Receipt und Evidence-Upload bestanden.

Evidence zu Run `31365712032`:

- Artifact-ID: `9054057077`
- Artifact-Größe: `1031` Byte
- Artifact-SHA-256: `60f736b8fcfd255bc29d4143521b103ac27c3f86ab4fab231869a28ddc433041`
- qualifizierter Head: `f64df97a4b357646480277b455fad3c9861c31cf`

Zusätzlich wurde das historische I012-Gate gemäß der bereits bestätigten I012-Lebenszyklusregel auf seine eigenen qualifizierten Quellen begrenzt. Der historische Testinhalt wurde nicht verändert.

## Rückfallfähigkeit

Die Iteration ist additiv auf `iteration/i013-dateisystem-probe`. Ein Rückfall besteht im Verwerfen des Branches beziehungsweise des Draft-PRs. Nutzerdaten werden nicht verändert.

## Aktueller Prüfstatus

- I012-Baseline: `PASS`
- 9 I013-Contracttests: `PASS`
- 21 I011/I012-Plattformregressionstests: `PASS`
- Ruff: `PASS`
- Ruff Format: `PASS`
- mypy strict: `PASS`
- P02-Laufzeitregression: `PASS`
- Gesamtregression: `PASS`
- Qualification Receipt: `PASS`
- Evidence-Upload: `PASS`
- Promotion/Main-Merge: `BLOCKED_BIS_ATOMARE_PROMOTION`
