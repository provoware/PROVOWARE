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

## Rückfallfähigkeit

Die Iteration ist additiv auf `iteration/i013-dateisystem-probe`. Ein Rückfall besteht im Verwerfen des Branches beziehungsweise des Draft-PRs. Nutzerdaten werden nicht verändert.

## Prüfstatus vor CI

- Baseline/Übergabe: geprüft
- Produktimplementierung: `PASS_STATIC`
- Contracttests: implementiert, Laufzeitstatus `UNKNOWN`
- Ruff: `UNKNOWN`
- Ruff Format: `UNKNOWN`
- mypy strict: `UNKNOWN`
- Regression: `UNKNOWN`
- Qualification Receipt: noch nicht vorhanden
- Promotion: blockiert bis reale grüne Evidence vorliegt
