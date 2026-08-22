# CHECKLIST 0.4.1-E2E – Chromium Gate & HTML UI Mirror

## A – Browser-Infrastruktur

- [x] Chromium als primären Playwright-Projektlauf definieren.
- [x] Firefox als separaten alternativen Projektlauf definieren.
- [x] Playwright als Dev-Abhängigkeit exakt pinnen.
- [x] Browser-Testserver aus temporärer Projektkopie implementieren.
- [x] Browserartefakte aus Git ausschließen.
- [x] Core-Gate von Browserinstallation getrennt halten.

## B – Funktionale Browserkette

- [x] Entwicklungsnotiz über echte UI speichern.
- [x] feste Notizdatei per HTTP nachprüfen.
- [x] Vorlage erzeugen.
- [x] Datensatz speichern.
- [x] Reload und Persistenz prüfen.
- [x] Datensatz bearbeiten.
- [x] Backup erzeugen.
- [x] Daten nach Backup verändern.
- [x] Restore-Vorschau und Bestätigung ausführen.
- [x] wiederhergestellten Stand nachweisen.
- [x] JSON exportieren.
- [x] Datensatz löschen.
- [x] Exportdatei importieren.
- [x] importierten Datensatz nachweisen.

## C – HTML-Mirror

- [x] echte `index.html` als Referenz laden.
- [x] dieselbe echte `index.html` als Spiegel laden.
- [x] internen Viewport für beide auf 1366 × 900 festlegen.
- [x] Spiegel ausschließlich außen auf Faktor 0,5 skalieren.
- [x] zentrale UI-Rechtecke beider Frames vergleichen.
- [x] Skalierungsfaktor messen.
- [x] PASS/FAIL-Evidenz im Mirror-Dokument ausgeben.
- [x] Screenshot der Pipeline erzeugen.
- [x] separaten Screenshot des proportionalen Spiegels erzeugen.

## D – CI / Evidenz

- [x] automatischen Chromium-Workflow für PR und `main` definieren.
- [x] Firefox nur über optionalen Workflow-Dispatch definieren.
- [x] Screenshot-/Export-/Report-Artefakte hochladen.
- [ ] Core Quality Gate Node 20 grün.
- [ ] Core Quality Gate Node 24 grün.
- [ ] Chromium-Browser-E2E grün.
- [ ] Browser-Evidenzartefakt vorhanden.
- [ ] tatsächliche Screenshotdateien im Artefakt prüfen.

## E – Dokumentation / Abschluss

- [x] Plan anlegen.
- [x] Checkpoint anlegen.
- [x] Checkliste anlegen.
- [ ] README aktualisieren.
- [ ] TODO aktualisieren.
- [ ] CHANGELOG aktualisieren.
- [ ] MANIFEST aktualisieren.
- [ ] VERSION-Entwicklungsphase aktualisieren.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR auf ready for review setzen.
- [ ] Squash-Merge durchführen.
- [ ] `main` nach Merge prüfen.
