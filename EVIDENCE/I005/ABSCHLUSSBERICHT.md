# I005 — Abschlussbericht Offline-Wheelhouse + Toolinventar

## Ergebnis

**Status: GRÜN / VALIDIERBAR / bereit für I006.**

Der Wheelhouse-Builder lief auf GitHub Actions mit Ubuntu 22.04.5 LTS x86_64 und CPython 3.13.15. Er erzeugte 50 Wheels mit insgesamt 294428822 Bytes. Source-Distributionen wurden über `--only-binary=:all:` ausgeschlossen.

## Offline-Beweis

Eine frische virtuelle Umgebung wurde anschließend mit `PIP_NO_INDEX=1`, lokalem `PIP_FIND_LINKS` und `--no-index` ausschließlich aus dem erzeugten Wheelhouse installiert. Danach waren `pip check`, die Versions-/Import-Smokes, der Projekt-Baselineprüfer, 11 Tests, `ruff check` und `ruff format --check` grün.

## Artefaktidentität

- Workflow Run: `31330952896`
- Job: `93288985009`
- Branch-Head zur Qualifikation: `58fb17a1c3878ffa62c7688f6902a58a59e80893`
- PR-Merge-Ref der Qualifikation: `abfcd3e5cee3e8901bdd1ebc5a9c77888dc7c111`
- Artifact-ID: `9042907351`
- Artifact-Größe: `294502210` Bytes
- Artifact-SHA-256: `6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040`

Das heruntergeladene ZIP wurde zusätzlich außerhalb des Actions-Laufs gehasht. Sein SHA-256 stimmt mit dem GitHub-Artefaktdigest überein. Danach wurden alle 50 Wheels erneut gegen `WHEELHOUSE_SHA256.txt` geprüft; kein Mismatch wurde gefunden.

## Wichtige Reparatur innerhalb I005

Der erste echte Builderlauf deckte einen Parserfehler auf: Das `setuptools`-Wheel enthält mehrere vendorte `.dist-info/METADATA`-Dateien. Der Inventarisierer erwartete zunächst genau eine beliebige METADATA-Datei. Die Ursache wurde eingegrenzt und der Parser so korrigiert, dass nur die Root-`<distribution>.dist-info/METADATA` berücksichtigt wird. Ein synthetischer Regressionstest mit zusätzlicher vendorter METADATA schützt diesen Fehlerpfad jetzt dauerhaft.

## Scope-Kontrolle

Es wurde keine Core-, Daten-, Modul- oder UI-Fachlogik eingeführt. Der Patch bleibt vollständig auf Toolchain, Wheelhouse, CI, Tests, Registries und Evidence begrenzt.

## Verbleibende Grenze

Das GitHub-Actions-Artefakt besitzt 90 Tage Retention. Es ist damit ein qualifizierter Entwicklungsnachweis, aber noch keine dauerhafte Release-Ablage. I006 muss das verifizierte Artefakt als einzige Paketquelle verwenden. Spätestens vor einem Stable-Release wird eine langlebige, hashidentische Offline-Baseline benötigt.

## Nächster Schritt

**I006 — Clean-Bootstrap:** zwei aufeinanderfolgende Neuaufbauten in leeren Zielverzeichnissen ausschließlich aus dem I005-Artefakt; gleicher Paket-Freeze, grüne Baseline-/Testprüfung und kein Paketindexzugriff.
