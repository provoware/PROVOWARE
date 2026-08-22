# CHECKLIST 0.4.2 – Data Studio PRO

## A – Architektur / Persistenz

- [x] isolierten Feature-Branch anlegen.
- [x] Plan und Baseline-Checkpoint anlegen.
- [ ] PRO-Metadatenvertrag Version 1 definieren.
- [ ] feste Runtime-Datei `data/data-studio-pro.json` implementieren.
- [ ] atomare PRO-Persistenz implementieren.
- [ ] gemeinsame Project-Data-Mutationssperre wiederverwenden.
- [ ] PRO-Datei und Temp-Dateien aus Git ausschließen und gegen statische Auslieferung schützen.
- [ ] Same-Origin-geschützte PRO-API integrieren.

## B – Kategorien / Vorlagenbibliothek

- [ ] Kategorien anlegen.
- [ ] Kategorien löschen und Zuweisungen kontrolliert entfernen.
- [ ] Vorlage einer Kategorie zuweisen oder Zuweisung entfernen.
- [ ] Vorlagenbibliothek mit Name, Kategorie, Feldanzahl und Datensatzanzahl darstellen.
- [ ] Bibliothek per Text durchsuchen.
- [ ] Bibliothek nach Kategorie filtern.
- [ ] Vorlage aus der Bibliothek direkt öffnen.

## C – Suche / Filter / Sortierung

- [ ] Datensatz-Volltextsuche über sichtbare Feldwerte implementieren.
- [ ] Trefferzahl anzeigen.
- [ ] Sortierung nach Aktualisierung neu→alt / alt→neu ergänzen.
- [ ] Sortierung nach Erstellung neu→alt / alt→neu ergänzen.
- [ ] Nulltreffer verständlich anzeigen.

## D – Gespeicherte Ansichten

- [ ] aktuelle Ansicht serverseitig benannt speichern.
- [ ] Vorlage, Kategorie-Filter, Suchtext und Sortierung speichern.
- [ ] gespeicherte Ansicht anwenden.
- [ ] gespeicherte Ansicht löschen.
- [ ] doppelte Namen case-insensitiv verhindern.
- [ ] Ansicht nach Reload weiter verfügbar halten.

## E – Vorlagenexport

- [ ] gewählte Vorlage als JSON exportieren.
- [ ] Formatkennung und Formatversion integrieren.
- [ ] Kategoriebezeichnung optional mitgeben.
- [ ] Datensätze bewusst nicht exportieren.
- [ ] Dateiname sicher aus Vorlagenname ableiten.

## F – Regression / Browser

- [ ] Service-Tests für Kategorien, Zuweisungen, Views und atomare Persistenz ergänzen.
- [ ] API-Tests für Routing, Same-Origin und Validierung ergänzen.
- [ ] UI-Vertragstests für PRO-Funktionen ergänzen.
- [ ] Linter-Verbot einer Browser-Zweitpersistenz weiter wirksam halten.
- [ ] Chromium-E2E um Kategorie, Suche, View, Export und Reload ergänzen.
- [ ] HTML-Mirror unverändert grün halten.
- [ ] Node 20 Core-Gate grün.
- [ ] Node 24 Core-Gate grün.
- [ ] Chromium Browser-Gate grün.

## G – Dokumentation / Abschluss

- [ ] Registry auf Data Studio 0.4.2 aktualisieren.
- [ ] VERSION aktualisieren, Produktversion und Project-Data-Schema unverändert lassen.
- [ ] README aktualisieren.
- [ ] TODO aktualisieren.
- [ ] CHANGELOG aktualisieren.
- [ ] MANIFEST aktualisieren.
- [ ] finalen Diff gegen `main` prüfen.
- [ ] PR auf ready for review setzen.
- [ ] kontrolliert per Squash mergen.
- [ ] `main` nach Merge prüfen.
