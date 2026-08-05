# Schwachstellen und technische Risiken

## Aktuelle Schwachstellen

| ID | Bereich | Risiko | Auswirkung | Gegenmaßnahme | Status |
|---|---|---|---|---|---|
| S-001 | Architektur | Der Prototyp deckt erst sechs Beispiel-Fragen ab | Fachkatalog noch nicht produktionsvollständig | Katalog iterativ erweitern und jede Phase abnehmen | Beobachtung |
| S-002 | Migration | Bisher existiert nur Projektschema `1.1.0` | Mehrstufige Migrationen sind noch nicht praktisch geprüft | Migrationsmatrix mit älteren Prüfdaten ergänzen | Offen |
| S-003 | Qualität | Noch keine GitHub-Actions-CI | Prüfungen müssen lokal gestartet werden | Kleine CI für L0/L1 und Browser-Smoke vorbereiten | Offen |
| S-004 | Barrierefreiheit | Dialog ist tastaturfähig, aber ohne reale Screenreader-Abnahme | Bedienhindernisse können unentdeckt bleiben | Orca-, NVDA- und Tastaturprüfplan durchführen | Offen |
| S-005 | Browserdaten | Nutzer kann Browserdaten manuell löschen | Lokale Projektstände könnten verloren gehen | geprüften JSON-Export und Sicherungserinnerung ergänzen | Offen |
| S-006 | Speicherquote | Browser kann bei sehr knapper Quote Schreibvorgänge ablehnen | neuer Projektstand wird nicht gespeichert | Quota-Fehler verständlich melden und Export anbieten | Offen |
| S-007 | Prüfumgebung | Isolierte Umgebungen können lokale Browsernavigation blockieren | Echte IndexedDB-Abnahme ist dort nicht möglich | Runner nutzt klar gemeldeten UI-Fallback; reale Linux-Abnahme bleibt Pflicht | Teilweise |
| S-008 | Release | Ein-Datei-Build fehlt noch | Direktverteilung ist noch nicht optimal | deterministischen One-File-Build ergänzen | Teilweise |
| S-009 | Aufbewahrung | Automatische Bereinigung ist dauerhaft | gelöschte Überschuss-Snapshots sind nur über andere Sicherungen verfügbar | Grenze mindestens 5; Vorschau der Regel; letzter gültiger Sicherheitsstand wird geschützt | Kontrolliert |

## Erledigte oder deutlich reduzierte Risiken

- Unbegrenztes Snapshot-Wachstum wurde durch die konfigurierbare Grenze reduziert.
- Eine manuelle Wiederherstellung kann erst nach Vorschau und ausdrücklicher Bestätigung erfolgen.
- Der letzte gültige Sicherheitsstand wird von der Bereinigung nicht entfernt.

## Sicherheitsgrundsatz

Keine Eingabe, importierte Datei oder automatisch erzeugte Schlussfolgerung darf ungeprüft dauerhaft gespeichert, ausgeführt oder exportiert werden.
