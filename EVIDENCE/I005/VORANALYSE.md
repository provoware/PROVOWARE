# I005 — Voranalyse Offline-Wheelhouse

## Ausgangslage

Baseline: `BASELINE-2026-08-09-I004` auf `main` bei Commit `8d4b9993cf530f4089eee05870b0cc4ab0f33fc0`.

Der Masterplan fordert in P01/I005 ein lokales Offline-Wheelhouse samt Hash-, Versions- und Lizenzinventar. Die bisherige Datei `WERKZEUGE/WHEELHOUSE_STATUS.json` markierte diesen Punkt ausdrücklich als noch nicht qualifiziert.

## Risikoanalyse

Hauptgefahr ist ein scheinbar portables Wheelhouse, das auf einer neueren Linuxbasis oder mit abweichender Python-Version erzeugt wird. Deshalb blockiert der Builder bei jeder Abweichung von Ubuntu 22.04 amd64 und CPython 3.13.15.

Weitere Risiken:
- Source-Distribution statt Wheel würde Buildtoolchain/Compiler nachfordern.
- transitive Abhängigkeiten könnten fehlen.
- ein Online-Installationsschritt könnte unbemerkt fehlende Wheels nachladen.
- Hash- und Lizenzinventar könnten vom tatsächlich geprüften Artefakt abweichen.

## Gegenmaßnahmen

- GitHub Hosted Runner `ubuntu-22.04`.
- `actions/setup-python` mit exakt `3.13.15` und gepinntem pip `25.2`.
- `pip download --only-binary=:all:`.
- zweite Installation in frischem venv mit `PIP_NO_INDEX=1` und `--no-index`.
- `pip check`, Import-/CLI-Smoke.
- SHA-256 je Wheel plus finales Manifest.
- Metadatenextraktion direkt aus Wheel-`METADATA` mit Standardbibliothek.
- GitHub-Actions selbst auf unveränderliche Commit-SHAs gepinnt.

## Scope Freeze

I005 erzeugt und qualifiziert ausschließlich Entwicklungs-/Runtime-Wheels und Evidence. Keine Core-, Daten-, Modul- oder UI-Fachlogik wird ergänzt.

## Abbruch

I005 bleibt BLOCKIERT, wenn Plattform, Python-Version, Binär-Wheel-Auflösung, Offline-Installation, `pip check`, Inventarisierung oder Hashkonsistenz fehlschlagen.
