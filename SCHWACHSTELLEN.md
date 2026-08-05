# Schwachstellen und technische Risiken

## Aktuelle Schwachstellen

| ID | Bereich | Risiko | Auswirkung | Gegenmaßnahme | Status |
|---|---|---|---|---|---|
| S-001 | Architektur | Der Prototyp deckt erst sechs Beispiel-Fragen ab | Fachkatalog noch nicht produktionsvollständig | Katalog iterativ erweitern und jede Phase abnehmen | Beobachtung |
| S-002 | Migration | Künftige Schemas nach `1.2.0` besitzen noch keinen Pfad | spätere Projektstände könnten ohne neue Matrix nicht geöffnet werden | jede Zielversion ausschließlich mit explizitem Einzelschritt ergänzen | Kontrolliert |
| S-003 | Qualität | Noch keine GitHub-Actions-CI | Prüfungen müssen lokal gestartet werden | kleine CI für L0/L1 und Browser-Smoke vorbereiten | Offen |
| S-004 | Barrierefreiheit | Dialog ist tastaturfähig, aber ohne reale Screenreader-Abnahme | Bedienhindernisse können unentdeckt bleiben | Orca-, NVDA- und Tastaturprüfplan durchführen | Offen |
| S-005 | Browserdaten | Nutzer kann Browserdaten manuell löschen | lokale Projektstände könnten verloren gehen | geprüften JSON-Export und Sicherungserinnerung ergänzen | Offen |
| S-006 | Speicherquote | Browser kann bei sehr knapper Quote Schreibvorgänge ablehnen | neuer Projektstand wird nicht gespeichert | verständliche Meldung vorhanden; Export und reale Kubuntu-Quota-Abnahme ergänzen | Teilweise |
| S-007 | Prüfumgebung | isolierte Umgebungen können lokale Browsernavigation blockieren | echte IndexedDB-Abnahme ist dort nicht möglich | Runner nutzt klar gemeldeten Fallback; reale Linux-Abnahme bleibt Pflicht | Teilweise |
| S-008 | Release | Ein-Datei-Build fehlt noch | Direktverteilung ist noch nicht optimal | deterministischen One-File-Build ergänzen | Teilweise |
| S-009 | Aufbewahrung | automatische Bereinigung ist dauerhaft | gelöschte Überschuss-Snapshots sind nur über andere Sicherungen verfügbar | Grenze mindestens 5; letzter gültiger Sicherheitsstand bleibt geschützt | Kontrolliert |
| S-010 | Migration | Legacy-Migration kann bei sehr vielen Snapshots zusätzlichen Speicher benötigen | Migration könnte bei knapper Quote abgelehnt werden | vollständiger Rollback, Vorher-Sicherung und Quota-Test; später Speicherbedarf vorab schätzen | Kontrolliert |

## Erledigte oder deutlich reduzierte Risiken

- Projektschemata `1.0.0` und `1.1.0` werden schrittweise auf `1.2.0` migriert.
- Legacy-Hauptstände erhalten vor dem Ersetzen eine unveränderte Sicherung.
- Originale Legacy-Snapshots werden nicht überschrieben.
- Quota- und Transaktionsabbrüche werden vollständig zurückgerollt.
- Beschädigte neuere Snapshots verdecken keinen älteren gültigen Stand.
- Migrationsschritte und Abschluss werden getrennt protokolliert.

## Sicherheitsgrundsatz

Keine Eingabe, importierte Datei oder automatisch erzeugte Schlussfolgerung darf ungeprüft dauerhaft gespeichert, ausgeführt oder exportiert werden.
