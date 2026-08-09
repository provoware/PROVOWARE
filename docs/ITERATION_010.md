# I010 — P02 Architektur- und Vertragsgate

## Ergebnis

**Status: GRÜN / GitHub-validiert / P02 abgeschlossen.**

Kanonische Ausgangsbasis war `BASELINE-2026-08-09-I009`. I010 hat keine P03-Produktfunktion vorgezogen, sondern ausschließlich die bereits qualifizierten I007-I009-Verträge als gemeinsame, maschinenlesbare P02-Architekturbasis eingefroren und geprüft.

Aktuelle Baseline nach Promotion: `BASELINE-2026-08-10-I010`.

## Kanonischer Gesamt-Freeze

Die öffentliche P02-Vertragsoberfläche wird jetzt über genau eine maschinenlesbare Wahrheitsquelle abgesichert:

- `P02_API_SNAPSHOT.json`: öffentliche Symbole, Typklassen, Dataclass-Felder, ID-Präfixe, Enumwerte, Schemaversionen, Pflichtfelder, Vertragsmarker und Fehlercodes.
- Snapshot-Fingerprint: `2e74f555a8b7cc4aaa45f7cb109eaf22a1c255953d9ff98bb159ad2df895ed16`.
- `P02_QUELLINVENTAR.json`: exaktes Python-Produktquellinventar mit SHA-256 je P02-Quelle.
- `WERKZEUGE/p02_architekturgate.py`: gemeinsames Baseline-, Inventar-, AST-, API-, Versions- und Traceability-Gate.

Ein früher I010-Entwurf enthielt zusätzlich einen kleineren parallelen Snapshot und einen separaten Contracttest. Diese doppelte Wahrheitsquelle wurde bewusst entfernt; der kanonische P02-Snapshot ist allein maßgeblich.

## Nachgewiesene ROT-Fälle

Die Architekturgrenze wurde nicht nur positiv getestet. Negative Fixtures beweisen, dass das Gate bei folgenden Verletzungen tatsächlich blockiert:

1. SQLite-Import in der P02-Vertragsschicht,
2. Qt/PySide-Import,
3. Handler-Abhängigkeit,
4. Datei-I/O-Aufruf,
5. neue unregistrierte P02-Produktdatei,
6. vorgezogene P03-Produktquelle während I010.

Damit erfüllt I010 den Masterplan-Abnahmekern, dass eine absichtliche Architekturverletzung erkannt und blockiert wird.

## Finale Qualifikation

GitHub-Actions-Run: `31339417368`  
Job: `93310619106`  
Ubuntu: `22.04.5 LTS x86_64`  
Python: `3.13.15`  
Toolchain: verifiziertes I005-Wheelhouse, offline installiert.

Ergebnisse:

- P02-Gesamtgate: GRÜN
- P02-Quellinventar: GRÜN / exakt und hashgebunden
- API-Snapshot: GRÜN / kanonisch und fingerprintgebunden
- AST-Architekturmatrix: GRÜN
- Negativfixtures: GRÜN
- P03-Scope-Freeze: GRÜN
- Versionsräume: GRÜN
- Traceability vor Promotion: GRÜN
- Ruff Check: GRÜN
- Ruff Format: GRÜN / 20 Dateien
- mypy strict: GRÜN / 11 Quelldateien
- Architektur-/Negativtests: 12 bestanden
- Contracttests: 49 bestanden
- Gesamtregression: 80 bestanden
- I005-, I006-, I007-, I008- und I009-Regressionsworkflows auf dem finalen I010-Head: erneut GRÜN

Evidence-Artefakt: `9045351696`  
Artifact-SHA-256: `6ebf3d679a063eaf4b09f8cc7b8adcc51cea16643596d545796d1acd0f22a9b9`  
Receipt-SHA-256: `cb0b092abd5b2356e5c0197a5e8df48c6e50612d822772d049bb374a6d1c5fee`.

## Promotion und Rückfall

Vor der Promotion wurde der validierte I009-main-Stand auf `backup/vor-i010-promotion-2026-08-10` gesichert. Der qualifizierte I010-PR wurde anschließend nach `main` promoviert. Erst danach wurden P02, Traceability und Architekturregeln auf `VALIDIERT` gesetzt.

## Wissensspeicher

`ERK-I010-001` ist nach dem tatsächlich reproduzierten grünen Gesamtgate nicht mehr nur eine Hypothese. Der Regelentwurf wird auf E2 / bestätigt angehoben. Eine projektübergreifende Goldene Regel wird daraus weiterhin nicht automatisch abgeleitet; dafür wären zusätzliche unabhängige Wiederholungen in weiteren Schichten oder Projekten erforderlich.

## Nächster Schritt

P03 ist freigegeben. I011 implementiert ausschließlich das read-only Linux-Systemprofil und die X11-Erkennung. Ubuntu 22.04 und 24.04 amd64 X11 bilden den Pflicht-Abnahmekern. Pfadnormalisierung, atomare Schreibprimitive und Lock-Leases bleiben I012-I014 vorbehalten.
