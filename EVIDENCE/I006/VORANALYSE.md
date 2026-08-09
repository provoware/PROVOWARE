# I006 — Voranalyse reproduzierbarer Clean-Bootstrap

## Baseline

Eingang ist `BASELINE-2026-08-09-I005`. I005 hat ein Wheelhouse mit 50 Wheels auf Ubuntu 22.04 amd64 / CPython 3.13.15 erzeugt und offline verifiziert. Das qualifizierte GitHub-Artefakt besitzt ID `9042907351` und SHA-256 `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040`.

## Ziel

I006 beweist nicht erneut die Paketbeschaffung. I006 beweist, dass eine **leere Entwicklungsumgebung** aus der bereits verifizierten I005-Baseline reproduzierbar aufgebaut werden kann, ohne einen Paketindex oder eine alternative Paketquelle zu benötigen.

## Risikokette

1. Falsches oder manipuliertes I005-ZIP könnte als Quelle dienen.
2. Entpackter Inhalt könnte trotz richtigem Dateinamen verändert worden sein.
3. pip könnte bei einer fehlenden Abhängigkeit still das Internet nutzen.
4. Zwei scheinbar erfolgreiche Bootstraps könnten unterschiedliche Paketstände erzeugen.
5. Installierte Toolchain könnte funktionieren, das eigentliche Projekt aber nicht.

## Gegenmaßnahmen

- äußeren GitHub-Artefakt-SHA-256 vor Entpacken prüfen,
- danach Manifest-, Evidence- und jeden Wheel-Hash prüfen,
- `PIP_NO_INDEX=1`, `--no-index`, lokales `PIP_FIND_LINKS`, zusätzlich Proxy-Falle auf `127.0.0.1:9`,
- zwei voneinander getrennte Zielverzeichnisse vollständig neu aufbauen,
- beide Paket-Freezes bytegenau gegen I005 und gegeneinander vergleichen,
- Projekt ohne Build-Isolation und ohne Dependency-Nachladen installieren,
- Baseline-Prüfer, vollständige Tests, Ruff Check/Format und Import-Smoke in beiden Umgebungen ausführen.

## Scope Freeze

I006 verändert keine Fachlogik, Datenhaltung, GUI oder Module. Zulässig sind nur Bootstrap-, Prüf-, CI-, Test- und Evidence-Artefakte sowie die nach erfolgreichem Lauf notwendige Status-/Planfortschreibung.

## Abbruch

Jede Hashabweichung, jeder Indexzugriff, abweichender Freeze, fehlerhafte Projektinstallation, roter Test oder fehlendes Evidence-Artefakt blockiert I006 und damit den Abschluss von P01.
