# I006 — Abschlussbericht reproduzierbarer Offline-Clean-Bootstrap

## Ergebnis

**Status: GRÜN. P01 Repository- und Entwicklungsfundament ist qualifiziert.**

Der qualifizierte Workflow `31331742667` lief auf Ubuntu 22.04.5 LTS x86_64 mit CPython 3.13.15. Das zuvor verifizierte I005-Wheelhouse wurde über feste Run-/Artifact-Identität geladen, vor dem Entpacken gegen SHA-256 geprüft und danach erneut über Manifest, Evidence-Dateien und alle 50 Wheel-Hashes validiert.

## Zwei unabhängige Neuaufbauten

Zwei getrennte Zielverzeichnisse `bootstrap-a` und `bootstrap-b` wurden vollständig neu erzeugt. Beide Installationen verwendeten ausschließlich das I005-Wheelhouse:

- `PIP_NO_INDEX=1`,
- `--no-index`,
- lokales `PIP_FIND_LINKS`,
- zusätzliche Proxy-Falle `127.0.0.1:9`,
- Projektinstallation mit `--no-deps --no-build-isolation`.

Beide Paket-Freezes sind byteidentisch mit der I005-Referenz und miteinander. SHA-256: `5e44649e72afd6b6076f76c21bcb29b8232d17ae106bdece4e0cca122090b1ed`.

## Projektprüfung

In beiden Clean-Bootstraps waren erfolgreich:

- `pip check`,
- PROVOWARE-Baseline-Prüfer mit 17 Registern,
- 17 Pytest-Tests,
- Ruff Check,
- Ruff Format Check,
- Installation des Projekts im Entwicklungsmodus,
- Import-Smoke.

## Iterativ erkannte und behobene Fehler

### 1. Hartcodierter Baseline-Prüfer

Der erste I006-Lauf deckte auf, dass der bisherige Baseline-Prüfer noch fest auf `I004` verdrahtet war. Eine korrekte I005-Baseline wurde dadurch fälschlich als rot bewertet. Die Prüfung wurde auf echte Konsistenzregeln umgestellt: aktuelle Baseline, Version, Masterplan-Hash sowie fortlaufende letzte/nächste Iteration werden jetzt aus den autoritativen Registries geprüft.

### 2. Qualitäts- und Formatgate

Ein Folgelauf deckte zu hohe Komplexität und Formatabweichungen auf. Die Prüflogik wurde in klar abgegrenzte Funktionen zerlegt; bestehende Strukturtests wurden ebenfalls auf den gepinnten Ruff-0.16.1-Stand gebracht. Der finale Lauf ist vollständig grün.

## Artefaktidentität

- Workflow Run: `31331742667`
- Job: `93290977176`
- qualifizierter Branch-Head: `cc55fcfc89f35065bbfa847e928145d7f3e3f2bf`
- qualifizierter PR-Merge-Ref: `47af691ddf6355f2a1f006b998e3e43d4d649cd9`
- I006 Artifact-ID: `9043135144`
- I006 Artifact-Größe: `3001` Bytes
- I006 Artifact-SHA-256: `2029a08b0b772524bb023b1066bf0730a3ec2ca118723af6caf5c4f3778f7636`

Das heruntergeladene I006-ZIP wurde außerhalb des Actions-Laufs erneut gehasht; der SHA-256 stimmt mit dem GitHub-Digest überein. Die darin enthaltenen Receipts und Hashes wurden zusätzlich gelesen und gegengeprüft.

## Scope-Kontrolle

I006 hat keine Fachlogik, Datenbanklogik, GUI oder Module eingeführt. Geändert wurden ausschließlich Bootstrap-/Prüfwerkzeuge, CI, Tests, Evidence und die notwendigen Projektstatusregister.

## Nicht blockierende neue Erkenntnis

`DELTA-0003`: Der I005-Workflow reagiert derzeit auf `tests/**` und baut deshalb bei fachfremden Teständerungen unnötig ein rund 294-MB-Wheelhouse neu. Das wird im I007-Precheck als kleiner Sparsamkeitspatch eingegrenzt.

## Nächster Schritt

**I007 — ID-, Status-, Fehler- und Ergebnistypen.** Erst die Kernverträge definieren und strikt typisieren; noch keine GUI-, SQLite- oder Modulimplementierung.
