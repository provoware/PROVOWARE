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
- [x] Core Quality Gate Node 20 grün.
- [x] Core Quality Gate Node 24 grün.
- [x] Chromium-Browser-E2E grün: 2/2 echte Browserprüfungen bestanden.
- [x] Browser-Evidenzartefakt `9474583341` vorhanden; SHA-256 `f2009e5b8c1ae992a8894fcb1d3d4d5bc41bd5aaa4e24fad0dd4747a6c8eff27`.
- [x] sechs Screenshotdateien und JSON-Export aus dem Erfolgsartefakt entpackt und geprüft.
- [x] Mirror-Evidenz bestätigt 1366 × 900 intern, Faktor 0,5, 683 × 450 visuell und identische Schlüsselgeometrie.
- [x] erster echter Browserlauf deckte einen UI-Überlagerungsfehler auf; Container-Responsive-Reparatur anschließend im unveränderten E2E-Test grün validiert.

## E – Dokumentation / Abschluss

- [x] Plan anlegen.
- [x] Checkpoint anlegen.
- [x] Checkliste anlegen.
- [ ] README aktualisieren.
- [ ] TODO aktualisieren.
- [ ] CHANGELOG aktualisieren.
- [ ] MANIFEST aktualisieren.
- [x] VERSION-Entwicklungsphase aktualisieren; Produktversion bleibt 0.2.0 und Datenschema v1.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR auf ready for review setzen.
- [ ] Squash-Merge durchführen.
- [ ] `main` nach Merge prüfen.
