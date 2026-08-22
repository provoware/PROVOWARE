# CHECKLIST 0.4.0 – Project Data Studio

## A – Implementierung

- [x] Baseline und Feature-Branch festgelegt.
- [x] Plan und Checkpoint angelegt.
- [x] zentrale Daten-/Validierungslogik implementiert.
- [x] atomare JSON-Persistenz implementiert.
- [x] feste Entwicklungsnotizdatei implementiert.
- [x] Dashboard-Schnelleingabe mit Enter und Button implementiert.
- [x] Link zum Öffnen der Entwicklungsnotizdatei implementiert.
- [x] Data-Studio-Modul implementiert.
- [x] flexibler Feldbaukasten implementiert.
- [x] Vorlagen speichern und bearbeiten implementiert.
- [x] Datensätze erstellen, bearbeiten und löschen implementiert.
- [x] direkte `file://`-Nutzung degradiert kontrolliert statt abzustürzen.

## B – Datenintegrität

- [x] unbekannte Feldtypen werden abgelehnt.
- [x] doppelte Feld-IDs werden abgelehnt.
- [x] Auswahlwerte werden gegen erlaubte Optionen geprüft.
- [x] Zahlen müssen endlich sein.
- [x] erforderliche Felder werden geprüft.
- [x] beschädigte Datenbankdatei wird nicht überschrieben.
- [x] parallele Mutationen werden serialisiert und mit einer 12-fach-Parallelprobe getestet.
- [x] Dateischreibpfade sind fest verdrahtet und nicht vom Browser frei wählbar.
- [x] Laufzeitdatenbank wird nicht direkt statisch ausgeliefert.
- [x] Laufzeitdatenbank und atomare Temp-Dateien bleiben aus Git ausgeschlossen.
- [x] Laufzeitdatenbank bleibt vom Auto-Fix unangetastet.

## C – Regression

- [x] bestehende Modul-Registry-Tests bleiben Teil der unveränderten Testsuite.
- [x] bestehende Workspace-State-Tests bleiben Teil der unveränderten Testsuite.
- [x] bestehende Workspace-UI-/Resize-Tests bleiben Teil der unveränderten Testsuite.
- [x] bestehende Starttests bleiben Teil der unveränderten Testsuite.
- [x] direkter HTML-Start bleibt als statische Variante erhalten.
- [x] bestehende Workspace-Verträge/Storage-Keys bleiben unverändert.
- [x] keine externen Laufzeit-URLs eingeführt.
- [x] keine Laufzeitabhängigkeiten eingeführt.
- [x] beschädigte Project-Data-Datei wird als Failure-Probe geprüft.
- [x] inkompatible Vorlagenänderung wird als Regression blockiert.
- [x] Parallelmutationen werden auf verlorene Datensätze geprüft.
- [x] finaler vollständiger Regressionstest auf Node 20 grün.
- [x] finaler vollständiger Regressionstest auf Node 24 grün.

## D – Codequalität

- [x] `npm run lint` als separates Gate eingeführt.
- [x] `npm run verify` führt Lint -> Quality Gate -> Tests aus.
- [x] JavaScript-Syntax aller Projektdateien bleibt Bestandteil des Quality Gates.
- [x] semantikneutraler Formatter/Normalizer bleibt als `npm run fix` erhalten.
- [x] aggressive automatische Code-Reformatierung bewusst nicht eingeführt.
- [x] neue Fehlerpfade automatisiert getestet.
- [x] Quality Gate kennt die neuen Pflichtdateien und Project-Data-Verträge.
- [x] Lint-Lücke ausdrücklich bewertet und mit abhängigkeitfreiem Projekt-Linter geschlossen.
- [x] GitHub Actions auf `checkout@v7` und `setup-node@v7` aktualisiert.
- [x] CI-Matrix auf Node 20 und 24 erweitert.
- [x] `npm run verify` im finalen Branch-Stand vollständig grün: 25 JavaScript-Dateien gelintet, 74 Projektdateien geprüft, 66/66 Tests erfolgreich.

## E – Dokumentation und Release

- [x] README aktualisiert.
- [x] TODO aktualisiert und Roadmap-Versionierung bereinigt.
- [x] CHANGELOG aktualisiert.
- [x] MANIFEST aktualisiert.
- [x] VERSION-Entwicklungsmetadaten aktualisiert; Produktversion bleibt `0.2.0`.
- [x] Pull Request #81 als Draft erstellt.
- [x] Branch-Diff gegen Baseline geprüft: 33 Commits voraus, 0 hinter `main`, 25 geplante Dateien.
- [x] GitHub Actions auf beiden Matrixläufen grün.
- [x] Mergeability geprüft.
- [x] Pull Request auf „ready for review“ gesetzt.
- [x] kontrollierter Squash-Merge durchgeführt: `20546306a0db98c25a003f4cf96f142aac851d6f`.
- [x] Main-Check nach Merge durchgeführt: Registry, Datenservice, VERSION und Abschlussdokumentation geprüft.

## Noch kein Bestandteil von 0.4.0

Diese Punkte sind ausdrücklich **keine stillen Restfehler**, sondern geplante nächste Härtungsstufen:

- [ ] echte Firefox-/Chrome-E2E-Tests – Release-/Folgestufe.
- [ ] Backup/Restore und Recovery-Failure-Injection – `0.4.1`.
- [ ] Schema-Migrationstests – `0.4.1`.
- [ ] Cross-OS-CI für Windows/macOS – nach Stabilisierung der lokalen Datenpfade.

## Definition of Done

`0.4.0 Project Data Studio` ist für den definierten Iterationsscope abgeschlossen. Die vier offenen Punkte gehören bewusst zu späteren Härtungsstufen und erweitern den Scope, statt verdeckte Abnahmefehler darzustellen.
