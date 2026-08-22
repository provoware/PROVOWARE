# CHECKLIST 0.4.0 – Project Data Studio

## A – Implementierung

- [x] Baseline und Feature-Branch festgelegt.
- [x] Plan und Checkpoint angelegt.
- [ ] zentrale Daten-/Validierungslogik implementiert.
- [ ] atomare JSON-Persistenz implementiert.
- [ ] feste Entwicklungsnotizdatei implementiert.
- [ ] Dashboard-Schnelleingabe mit Enter und Button implementiert.
- [ ] Link zum Öffnen der Entwicklungsnotizdatei implementiert.
- [ ] Data-Studio-Modul implementiert.
- [ ] flexibler Feldbaukasten implementiert.
- [ ] Vorlagen speichern und bearbeiten implementiert.
- [ ] Datensätze erstellen, bearbeiten und löschen implementiert.
- [ ] direkte `file://`-Nutzung degradiert kontrolliert statt abzustürzen.

## B – Datenintegrität

- [ ] unbekannte Feldtypen werden abgelehnt.
- [ ] doppelte Feld-IDs werden abgelehnt.
- [ ] Auswahlwerte werden gegen erlaubte Optionen geprüft.
- [ ] Zahlen müssen endlich sein.
- [ ] erforderliche Felder werden geprüft.
- [ ] beschädigte Datenbankdatei wird nicht überschrieben.
- [ ] parallele Mutationen werden serialisiert.
- [ ] Dateischreibpfade sind fest verdrahtet und nicht vom Browser frei wählbar.

## C – Regression

- [ ] bestehende Modul-Registry-Tests bleiben grün.
- [ ] bestehende Workspace-State-Tests bleiben grün.
- [ ] bestehende Workspace-UI-/Resize-Tests bleiben grün.
- [ ] bestehende Starttests bleiben grün.
- [ ] direkter HTML-Start bleibt als statische Variante erhalten.
- [ ] bestehende Workspace-Verträge/Storage-Keys bleiben unverändert.
- [ ] keine externen Laufzeit-URLs eingeführt.
- [ ] keine Laufzeitabhängigkeiten eingeführt.

## D – Codequalität

- [ ] `npm run fix` ohne fachliche Logikänderung möglich.
- [ ] `npm run verify` vollständig grün.
- [ ] JavaScript-Syntax aller neuen Dateien geprüft.
- [ ] Projektformat/-normalisierung aller neuen Textdateien geprüft.
- [ ] neue Fehlerpfade automatisiert getestet.
- [ ] Quality Gate kennt die neuen Pflichtdateien.
- [ ] Lint-Lücke ausdrücklich bewertet und nächste Härtungsstufe dokumentiert.

## E – Dokumentation und Release

- [ ] README aktualisiert.
- [ ] TODO aktualisiert.
- [ ] CHANGELOG aktualisiert.
- [ ] MANIFEST aktualisiert.
- [ ] VERSION-Entwicklungsmetadaten aktualisiert.
- [ ] Branch-Diff gegen Baseline geprüft.
- [ ] Pull Request erstellt.
- [ ] GitHub Actions grün.
- [ ] Mergeability geprüft.
- [ ] Main-Check nach Merge durchgeführt.

## Definition of Done

`0.4.0 Project Data Studio` ist erst abgeschlossen, wenn alle Punkte aus A bis E entweder abgehakt oder mit einem konkreten, begründeten Blocker versehen sind.
