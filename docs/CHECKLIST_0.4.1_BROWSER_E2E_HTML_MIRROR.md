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
- [x] finaler Core Quality Gate auf Node 20 grün.
- [x] finaler Core Quality Gate auf Node 24 grün.
- [x] finaler Core-Stand: 35 JavaScript-Dateien gelintet, 94 Projektdateien geprüft, 87/87 Node-Tests erfolgreich.
- [x] finaler Chromium-Browser-E2E grün: 2/2 echte Browserprüfungen bestanden.
- [x] finales Browser-Evidenzartefakt `9474686971`; SHA-256 `0ed384715c715ec78c9bfbabfc283e26f490fc7c83fa66f0355a60340118a8fe`.
- [x] sechs Screenshotdateien und JSON-Export aus dem finalen Erfolgsartefakt entpackt und geprüft.
- [x] Mirror-Evidenz bestätigt 1366 × 900 intern, Faktor 0,5, 683 × 450 visuell und identische Schlüsselgeometrie.
- [x] erster echter Browserlauf deckte einen UI-Überlagerungsfehler auf; Container-Responsive-Reparatur anschließend im unveränderten E2E-Test grün validiert.
- [x] Firefox im automatischen Abnahmelauf wie vorgesehen übersprungen.

## E – Dokumentation / Abschluss

- [x] Plan anlegen.
- [x] Checkpoint anlegen.
- [x] Checkliste anlegen.
- [x] README auf Chromium-first, Mirror, E2E-Befehle und reale Evidenz aktualisieren.
- [x] TODO auf Chromium-first-E2E und Cross-OS-Folgeschritt aktualisieren.
- [x] CHANGELOG mit E2E-Strang ergänzen und bestehende Historie erhalten.
- [x] MANIFEST um Browser-, Mirror-, Isolierungs- und Evidenzvertrag erweitern.
- [x] VERSION-Entwicklungsphase aktualisieren; Produktversion bleibt 0.2.0 und Datenschema v1.
- [x] E2E-Metadaten und Container-Responsive-Reparatur zusätzlich mit paketfreien Node-Vertragstests absichern.
- [x] finalen Dokumentationsstand auf Node 20 und Node 24 grün geprüft.
- [x] finalen Dokumentationsstand im Chromium-Browser-Gate grün geprüft.
- [x] finalen Diff gegen `main` geprüft: 26 Commits voraus, 0 hinter, 20 begründete Dateien.
- [x] PR #83 auf ready for review gesetzt.
- [x] PR #83 per Squash gemergt: `4e0a8fca18e59ff832a79064a91cc3b222e5f4ab`.
- [x] `main` auf Merge-SHA, VERSION, Browserworkflow, Mirror und container-responsiven UI-Fix geprüft.

## Definition of Done

0.4.1-E2E ist vollständig abgeschlossen. Chromium ist der automatische Primärbrowser, Firefox bleibt optionaler Alternativlauf, die HTML-Mirror-Pipeline ist prüf- und screenshotfähig, und der reale Browserpfad hat bereits einen UI-Fehler gefunden, dessen Reparatur im unveränderten E2E-Test bestätigt wurde.
