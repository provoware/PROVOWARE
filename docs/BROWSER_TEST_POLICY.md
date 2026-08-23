# Browser-Teststrategie – Release Gate

## Entscheidung

Browser-Ende-zu-Ende-Tests (Browser-E2E) werden nicht mehr bei jedem Pull Request und nicht mehr automatisch nach jedem Push auf `main` gestartet.

Der schnelle Entwicklungsweg bleibt:

`Pull Request -> Quality Gate -> Lint -> Node-Tests -> Diff-Prüfung -> Merge`

Der schwere Browserweg wird gebündelt:

`Release-/Abnahmepunkt -> Browser E2E Release Gate -> Chromium -> optional Firefox -> Evidenz`

## Warum

Die Browserläufe installieren Playwright-Browser und Systempakete und sind deutlich langsamer und ressourcenintensiver als die normalen Projektprüfungen. Für kleine, gut isolierte Entwicklungs-Patches entsteht dadurch viel Wartezeit, obwohl die meisten Fehler bereits durch Lint, Vertragsprüfungen und Node-Tests erkannt werden.

Das Verschieben reduziert Entwicklungszeit und CI-Traffic, ohne die Browserprüfung zu entfernen.

## Verbindlicher Ablauf

1. Normale Entwicklungs-PRs müssen weiterhin das zentrale Quality Gate bestehen.
2. Browser-E2E wird über `.github/workflows/browser-e2e.yml` ausschließlich manuell über `workflow_dispatch` gestartet.
3. Chromium bleibt der primäre Browserlauf.
4. Firefox kann im selben manuellen Lauf optional zugeschaltet werden.
5. Vor einem Release oder einer ausdrücklich definierten Browser-Abnahmestufe muss das Browser-Gate ausgeführt und das Ergebnis dokumentiert werden.
6. Ein fehlender Browserlauf während einer normalen Zwischeniteration darf nicht als Browser-PASS bezeichnet werden.
7. Nach Änderungen an Browser-, Medien-, Layout- oder Recovery-Pfaden bleiben gezielte Node-/Vertragstests Pflicht; die reale Browser-Endabnahme wird gesammelt nachgeholt.

## Aktuelle Anwendung auf den Workspace-Strang

Für `0.3.0-D3b`, `0.3.0-E` und `0.3.0-F` gilt zunächst das schnelle Quality Gate. Die zusammenhängende reale Browserprüfung des Workspace-Pfads wird in `0.3.0-G` gebündelt.

Dort sollen mindestens geprüft werden:

- Pointer-Resize mit Maus,
- Touch-/Stift-Pfad soweit die Browserautomation ihn reproduzierbar abbildet,
- Tastatur-Resize ohne Regression,
- Drag-and-Drop/Reorder,
- responsive Grenzfälle,
- Accessibility-/Fokuspfad,
- Chromium als Primärlauf,
- Firefox als optionale Gegenprobe.

## H1-Medienabnahme

Die bereits abgeschlossene `0.4.4-H1 Real Media Acceptance` bleibt gültig. Sie wurde vor dieser Strategieänderung real in Chromium ausgeführt und nachgewiesen. Die neue Regel ändert keine historischen Testergebnisse.

## Rückweg

Falls wieder Browser-E2E auf jedem Pull Request benötigt wird, können die Trigger `pull_request` und/oder `push` gezielt in `.github/workflows/browser-e2e.yml` zurückgeführt werden. Die Browser-Testdateien selbst bleiben unverändert vorhanden.
