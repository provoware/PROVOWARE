# Schwachstellen und technische Risiken

## Aktuelle Schwachstellen

| ID | Bereich | Risiko | Auswirkung | Gegenmaßnahme | Status |
|---|---|---|---|---|---|
| S-001 | Architektur | Der Prototyp deckt erst sechs Beispiel-Fragen ab | Fachkatalog noch nicht produktionsvollständig | Katalog iterativ erweitern und jede Phase abnehmen | Beobachtung |
| S-002 | Migration | Künftige Schemas nach `1.2.0` besitzen noch keinen Pfad | spätere Projektstände könnten ohne neue Matrix nicht geöffnet werden | jede Zielversion ausschließlich mit explizitem Einzelschritt ergänzen | Kontrolliert |
| S-003 | Qualität | Schnelle CI deckt bewusst keine echten Browser- oder IndexedDB-Läufe ab | browserabhängige Fehler können erst im Release-Gate auffallen | Desktop-/Mobil-Smoke und Speicherfehlertest getrennt vor Release ausführen | Kontrolliert |
| S-004 | Barrierefreiheit | Dialoge sind tastaturfähig, aber ohne reale Screenreader-Abnahme | Bedienhindernisse können unentdeckt bleiben | Orca-, NVDA- und Tastaturprüfplan durchführen | Offen |
| S-005 | Browserdaten | Nutzer kann Browserdaten manuell löschen | lokale Projektstände könnten verloren gehen | geprüften Projekt-JSON-Export, Import und Sicherungserinnerung ergänzen | Offen |
| S-006 | Speicherquote | Browser kann bei sehr knapper Quote Schreibvorgänge ablehnen | neuer Projektstand wird nicht gespeichert | verständliche Meldung vorhanden; reale Kubuntu-Quota-Abnahme ergänzen | Teilweise |
| S-007 | Prüfumgebung | isolierte Umgebungen können lokale Browsernavigation blockieren | echte IndexedDB-Abnahme ist dort nicht möglich | Runner nutzt klar gemeldeten Fallback; reale Linux-Abnahme bleibt Pflicht | Teilweise |
| S-008 | Release | Ein-Datei-Build fehlt noch | Direktverteilung ist noch nicht optimal | deterministischen One-File-Build ergänzen | Teilweise |
| S-009 | Aufbewahrung | automatische Bereinigung ist dauerhaft | gelöschte Überschuss-Snapshots sind nur über andere Sicherungen verfügbar | Grenze mindestens 5; letzter gültiger Sicherheitsstand bleibt geschützt | Kontrolliert |
| S-010 | Migration | Legacy-Migration kann bei sehr vielen Snapshots zusätzlichen Speicher benötigen | Migration könnte bei knapper Quote abgelehnt werden | vollständiger Rollback, Vorher-Sicherung und Quota-Test; später Speicherbedarf vorab schätzen | Kontrolliert |
| S-011 | Bericht | Automatisch abgeleitete Anforderungen sind nur so vollständig wie der Fragenkatalog | ein kurzer Katalog erzeugt einen fachlich begrenzten Bericht | offene Entscheidungen, Quellenfragen und Modellversion sichtbar halten; Katalog iterativ erweitern | Kontrolliert |
| S-012 | Export | Ein exportierter Bericht ist eine Momentaufnahme | spätere Projektänderungen erscheinen nicht automatisch im alten Bericht | Erzeugungszeitpunkt, Revision, Schema und Katalogversion in jedem Format ausgeben | Kontrolliert |

## Erledigte oder deutlich reduzierte Risiken

- Projektschemata `1.0.0` und `1.1.0` werden schrittweise auf `1.2.0` migriert.
- Legacy-Hauptstände erhalten vor dem Ersetzen eine unveränderte Sicherung.
- Quota- und Transaktionsabbrüche werden vollständig zurückgerollt.
- Beschädigte neuere Snapshots verdecken keinen älteren gültigen Stand.
- Alle Berichtsformate verwenden dasselbe validierte Modell.
- HTML-Berichte besitzen keine externen Laufzeitressourcen.
- Eine schnelle GitHub-Actions-CI führt L0- und L1-Prüfungen automatisch aus.

## Sicherheitsgrundsatz

Keine Eingabe, importierte Datei oder automatisch erzeugte Schlussfolgerung darf ungeprüft dauerhaft gespeichert, ausgeführt oder exportiert werden.
