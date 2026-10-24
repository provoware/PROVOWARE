# H2 – Statische HTTP-Dateipfade gegen Symlink-Ausbruch absichern

**Basis:** `2dec63ff0662e42782894033aed7df3eec1b8f3e` (`main`, 24.10.2026). **Branch:** `automation/20261024-static-realpath-guard`.

## Hauptziel und Wirkung

Der lokale HTTP-Server darf eine syntaktisch innerhalb des Projektordners liegende Datei nicht ausliefern, wenn ein symbolischer Link auf eine Datei **außerhalb** des Projekts, auf einen versteckten Pfad oder auf geschützte Laufzeitdaten verweist. Der bisherige `stat()`-Aufruf folgt solchen Links. Eine lokale, isolierte Vorprüfung mit einer Testdatei hat den Ausbruch reproduziert (lexikalisch innerhalb, tatsächlich außerhalb).

## Abgrenzung und Risiken

- Nur statische GET-Auslieferung in `scripts/start.mjs`, zugehörige Regressionstests und Release-Nachweise ändern.
- Keine API-, Speicherformat-, Medien-, Workspace- oder Versionsänderung; keine Migration.
- Öffentliche Dateien und Links auf andere **öffentliche** Dateien im Projekt bleiben erreichbar.
- Fehlende Dateien bleiben 404; unzulässige aufgelöste Pfade werden 403.
- Risiko: bisher irrtümlich erreichbare externe oder private Linkziele werden künftig blockiert (beabsichtigt).

## Ablauf und Abnahme

1. [x] Baseline, Serverpfadprüfung, vorhandene Tests und GitHub-CI lesend geprüft.
2. [x] Fehler in isoliertem temporären Testordner reproduziert; keine Nutzerdaten berührt.
3. [x] Nach der bisherigen URL-/Pfadprüfung den echten Dateipfad auflösen und erneut gegen Projektgrenze, versteckte Segmente und geschützte Laufzeitdateien prüfen.
4. [x] Den **geprüften echten Pfad** für `stat` und Auslieferung verwenden; keine zweite Dateiauslieferungslogik einführen.
5. [x] Regressionstests: öffentliche Datei, externer Link, verstecktes Ziel, Datenbankziel, öffentlicher interner Link und fremder Direktpfad.
6. [x] `npm run verify` auf Node 20/24: beide PASS auf H2-Code-Commit `15c96b16fd3e71b7bc8bdc18513835920a826883` (GitHub-Lauf `40099906839`); nach Dokumentationsabschluss finalen PR-HEAD erneut prüfen.
7. [x] Dokumentation, Pflichtmatrix, Diff, Risiken und Rückweg prüfen.

**Rückweg:** PR nicht integrieren oder diesen isolierten Patch revertieren. Kein Datenschema betroffen.

**PR:** #97 (Entwurf, kein Merge zum Dokumentationszeitpunkt). **CI:** https://github.com/provoware/PROVOWARE/actions/runs/40099906839

**Danach:** HTTP-Ende-zu-Ende-Test mit tatsächlichem Serverrequest; anschließend responsive Bedienbarkeit bei 800 × 600 und hoher Skalierung prüfen.
