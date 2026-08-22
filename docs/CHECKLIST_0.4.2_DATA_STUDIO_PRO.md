# CHECKLIST 0.4.2 – Data Studio PRO

## A – Architektur / Persistenz

- [x] isolierten Feature-Branch anlegen.
- [x] Plan und Baseline-Checkpoint anlegen.
- [x] PRO-Metadatenvertrag Version 1 definieren.
- [x] feste Runtime-Datei `data/data-studio-pro.json` implementieren.
- [x] atomare PRO-Persistenz implementieren.
- [x] gemeinsame Project-Data-Mutationssperre wiederverwenden.
- [x] PRO-Datei und Temp-Dateien aus Git, Auto-Fix und statischer Auslieferung ausschließen.
- [x] Same-Origin-geschützte PRO-API integrieren.
- [x] beschädigte PRO-Datei kontrolliert ablehnen.
- [x] Failure-Injection direkt vor Rename implementieren und bytegenau unveränderten Live-Bestand nachweisen.

## B – Kategorien / Vorlagenbibliothek

- [x] Kategorien anlegen.
- [x] case-insensitive doppelte Kategorienamen ablehnen.
- [x] Kategorien löschen und Zuweisungen kontrolliert entfernen.
- [x] Vorlage einer Kategorie zuweisen oder Zuweisung entfernen.
- [x] Vorlagenbibliothek mit Name, Kategorie, Feldanzahl und Datensatzanzahl darstellen.
- [x] Bibliothek per Text durchsuchen.
- [x] Bibliothek nach Kategorie filtern.
- [x] Vorlage aus der Bibliothek über getrennte Bridge im bestehenden CRUD-Editor öffnen.
- [x] Data-Studio-Revision über Bridge automatisch an PRO weiterreichen.

## C – Suche / Filter / Sortierung

- [x] Datensatz-Volltextsuche über Feldbezeichnungen und sichtbare Feldwerte implementieren.
- [x] Filter nach Vorlage implementieren.
- [x] Filter nach Kategorie implementieren.
- [x] Trefferzahl anzeigen.
- [x] Sortierung nach Aktualisierung neu→alt / alt→neu ergänzen.
- [x] Sortierung nach Erstellung neu→alt / alt→neu ergänzen.
- [x] Nulltreffer verständlich anzeigen.

## D – Gespeicherte Ansichten

- [x] aktuelle Ansicht serverseitig benannt speichern.
- [x] Vorlage, Kategorie-Filter, Suchtext und Sortierung speichern.
- [x] gespeicherte Ansicht anwenden.
- [x] gespeicherte Ansicht löschen.
- [x] doppelte Namen case-insensitiv verhindern.
- [x] Ansicht nach Reload weiter verfügbar halten.
- [x] keine Datensatzkopien in Ansichten persistieren.

## E – Vorlagenexport

- [x] gewählte Vorlage als JSON exportieren.
- [x] Formatkennung `provoware-data-studio-template` integrieren.
- [x] Formatversion 1 integrieren.
- [x] Kategoriebezeichnung optional mitgeben.
- [x] Datensätze bewusst nicht exportieren.
- [x] Dateiname sicher aus Vorlagenname ableiten.
- [x] Exportvertrag im echten Chromiumlauf prüfen.

## F – Regression / Browser

- [x] Service-Tests für Kategorien, Zuweisungen, Views und atomare Persistenz ergänzen.
- [x] API-Tests für Routing, Same-Origin, Referenzen und Validierung ergänzen.
- [x] UI-/Registry-/Bridge-Vertragstests für PRO-Funktionen ergänzen.
- [x] Linter-Verbot einer Browser-Zweitpersistenz auf PRO erweitern und mit Fehlerprobe testen.
- [x] PRO-Runtime-Datei im zentralen Quality Gate vom Quellcode-/Auto-Fix-Walk ausschließen.
- [x] PRO-Pflichtdateien, Registry und VERSION im zentralen Quality Gate verankern.
- [x] Chromium-E2E um Kategorie, Bibliothek, Suche, View, Export und Reload ergänzen.
- [x] HTML-Mirror auf vollständig geladenes PRO warten lassen und `.data-studio-pro` geometrisch vergleichen.
- [x] erster Node-20-Core-Gate grün: 41 JavaScript-Dateien, 103 Projektdateien, 101/101 Tests.
- [x] erster Node-24-Core-Gate grün.
- [x] erster Chromium-Browser-Gate grün: 3/3 echte Browserprüfungen.
- [x] Firefox im automatischen Lauf wie vorgesehen übersprungen.
- [x] Browserartefakt `9476750307`, SHA-256 `f2eee6beb9baec81126885ce23c8543070afec0fae088045d104cd68a8628f99`.
- [x] Artefakt tatsächlich entpackt und geprüft: sieben PNGs, Project-Data-Export, Vorlagenexport und Playwright-Report.

## G – Dokumentation / Abschluss

- [x] Registry um `data-studio-pro` und `data-studio-pro-bridge` 0.4.2 ergänzt.
- [x] VERSION aktualisiert; Produktversion `0.2.0`, Project-Data-Schema `1` und Workspace-Vertrag unverändert.
- [x] README aktualisiert.
- [x] TODO aktualisiert.
- [x] CHANGELOG aktualisiert und bisherige Historie erhalten.
- [x] MANIFEST auf aktuellen 0.4.2-Vertrag aktualisiert.
- [x] Recovery-Grenze dokumentiert: 0.4.1-`.pwbak` enthält noch keine PRO-Metadaten.
- [ ] finalen Dokumentationsstand erneut auf Node 20 und Node 24 grün prüfen.
- [ ] finalen Dokumentationsstand im Chromium-Gate grün prüfen.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR #84 auf ready for review setzen.
- [ ] kontrolliert per Squash mergen.
- [ ] `main` nach Merge prüfen.

## Bewusst nicht Teil von 0.4.2

- [ ] relationale Feldtypen – eigener späterer Datenmodellvertrag.
- [ ] Template-Import – eigener Konflikt-/ID-Vertrag.
- [ ] SQLite-Adapter – nur bei nachgewiesenem Bedarf.
- [ ] gemeinsamer Recovery Envelope für Project Data + PRO-Metadaten – eigener versionierter Folgeschritt.
- [ ] Cross-OS-/Windows-Hardening – nächster Qualitätsstrang.
