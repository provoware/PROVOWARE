# Schwachstellen und technische Risiken

## Aktuelle Schwachstellen

| ID | Bereich | Risiko | Auswirkung | Gegenmaßnahme | Status |
|---|---|---|---|---|---|
| S-001 | Architektur | Der Prototyp deckt erst sechs Beispiel-Fragen ab | Fachkatalog noch nicht produktionsvollständig | Katalog iterativ erweitern und jede Phase abnehmen | Beobachtung |
| S-002 | Migration | Künftige Schemas nach `1.2.0` besitzen noch keinen Pfad | spätere Projektstände könnten ohne neue Matrix nicht geöffnet werden | jede Zielversion mit explizitem Einzelschritt ergänzen | Kontrolliert |
| S-003 | Qualität | Schnelle CI deckt keine echten Browser- oder IndexedDB-Läufe ab | browserabhängige Fehler können erst im Release-Gate auffallen | vier Browsergruppen getrennt vor Release ausführen | Kontrolliert |
| S-004 | Barrierefreiheit | automatisierte Grundprüfung ersetzt keine reale Screenreader-Abnahme | semantische oder sprachliche Hindernisse können unentdeckt bleiben | reale Orca- und ergänzende NVDA- oder VoiceOver-Abnahme durchführen | Offen |
| S-005 | Browserdaten | Nutzer kann Browserdaten manuell löschen | mehrere lokale Projekte könnten gemeinsam verloren gehen | Projekt-JSON regelmäßig exportieren und Sicherungserinnerung später ergänzen | Teilweise |
| S-006 | Speicherquote | Browser kann bei knapper Quote Schreibvorgänge ablehnen | neues Projekt oder neue Revision wird nicht gespeichert | transaktionaler Rückfall vorhanden; reale Kubuntu-Quota-Abnahme ergänzen | Teilweise |
| S-007 | Prüfumgebung | isolierte Umgebungen können lokale Browsernavigation blockieren | echte IndexedDB-Abnahme ist dort nicht möglich | Runner nutzt klar gemeldeten Fallback; reale Linux-Abnahme bleibt Pflicht | Teilweise |
| S-008 | Release | Ein-Datei-Build fehlt noch | Direktverteilung ist noch nicht optimal | deterministischen One-File-Build ergänzen | Teilweise |
| S-009 | Aufbewahrung | automatische Bereinigung ist dauerhaft | gelöschte Überschuss-Snapshots sind nur über andere Sicherungen verfügbar | Grenze mindestens 5; letzter gültiger Sicherheitsstand bleibt geschützt | Kontrolliert |
| S-010 | Migration | Legacy-Migration kann bei vielen Snapshots zusätzlichen Speicher benötigen | Migration könnte bei knapper Quote abgelehnt werden | vollständiger Rollback und Vorher-Sicherung; Speicherbedarf später vorab schätzen | Kontrolliert |
| S-011 | Bericht | Automatische Anforderungen sind nur so vollständig wie der Fragenkatalog | kurzer Katalog erzeugt begrenzten Bericht | offene Entscheidungen, Quellenfragen und Modellversion sichtbar halten | Kontrolliert |
| S-012 | Export | Ein Bericht ist eine Momentaufnahme | spätere Projektänderungen erscheinen nicht im alten Bericht | Projekt-ID, Revision, Erzeugungszeit und Schema ausgeben | Kontrolliert |
| S-013 | Projektlöschung | Endgültiges Löschen entfernt sämtliche lokale Historie eines Projekts | Bedienfehler könnte Projekt und Snapshots verlieren | Papierkorbpflicht, exakte Namenseingabe, separates Bestätigungsfeld und gemeinsame Transaktion | Kontrolliert |
| S-014 | Projektstatus | Lebenszyklus liegt außerhalb des Projektschemas | ein manuell beschädigter Metadatensatz könnte falschen Status anzeigen | unbekannte Werte auf `active` normalisieren; Übergänge ausschließlich über Projekt-Persistenz ausführen | Kontrolliert |
| S-015 | Projektwechsel | nicht abgeschlossene Änderungen könnten beim schnellen Wechsel verloren gehen | letzter Bearbeitungsstand des Ausgangsprojekts wäre unvollständig | geplantes Autosave stoppen und serielle Speicherkette vor dem Laden des Zielprojekts abschließen | Kontrolliert |
| S-016 | Duplikate | eine Kopie übernimmt bewusst alle fachlichen Antworten | vertrauliche Inhalte können unbeabsichtigt kopiert werden | Kopie eindeutig benennen und neue ID sichtbar anzeigen | Beobachtung |
| S-017 | Paketprüfsumme | die kompakte Prüfsumme ist nicht kryptografisch signiert | ein gezielter Angreifer könnte Inhalt und Prüfsumme gemeinsam verändern | Paket immer zusätzlich schema- und fachlich validieren; später optional kryptografische Signatur ergänzen | Kontrolliert |
| S-018 | Import-Ersetzen | bewusstes Ersetzen verändert den aktiven Projektstand | falsche Auswahl könnte gewünschte lokale Änderungen verdrängen | neue ID als Standard, nur aktive Ziele, exakter Name, separates Häkchen und `pre-import-backup` | Kontrolliert |
| S-019 | Importgröße | sehr große JSON-Dateien könnten Speicher und Oberfläche belasten | Browser könnte langsam oder instabil reagieren | Dateigröße vor `file.text()` auf zwei MiB begrenzen | Kontrolliert |
| S-020 | Importdaten | unbekannte Fragen oder Werte könnten den Zustand inkonsistent machen | Berichte und Workflow wären unzuverlässig | unbekannte IDs und nicht katalogisierte Werte blockieren | Kontrolliert |

## Erledigte oder deutlich reduzierte Risiken

- Projektschemata `1.0.0` und `1.1.0` werden schrittweise auf `1.2.0` migriert.
- Quota- und Transaktionsabbrüche werden vollständig zurückgerollt.
- Beschädigte neuere Snapshots verdecken keinen älteren gültigen Stand.
- Alle Berichtsformate verwenden dasselbe validierte Modell.
- Mehrere Projekte besitzen getrennte IDs, Revisionen, Snapshots und Berichte.
- Archiv und Papierkorb löschen keine Projektdaten.
- Projektpakete werden vor der Speicherung ausschließlich gelesen, geprüft und verglichen.
- Manipulierte Prüfsummen, unbekannte Fragen und ungültige Antworten blockieren den Import.
- Dialogfokus, Escape-Hierarchie und Pfeiltastennavigation werden zentral gesteuert.

## Sicherheitsgrundsatz

Keine Eingabe, importierte Datei, Projektaktion oder automatisch erzeugte Schlussfolgerung darf ungeprüft dauerhaft gespeichert, ausgeführt, gelöscht oder exportiert werden.
