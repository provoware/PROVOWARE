# Schwachstellen und technische Risiken

## Zweck

Dieses Dokument sammelt bekannte Risiken, technische Schulden und offene Sicherheitsfragen. Ein Punkt wird erst entfernt, wenn Ursache, Korrektur und Nachprüfung dokumentiert sind.

## Aktuelle Schwachstellen

| ID | Bereich | Risiko | Auswirkung | Gegenmaßnahme | Status |
|---|---|---|---|---|---|
| S-001 | Architektur | Der Prototyp bildet erst einen kleinen Funktionskern ab | komplexe Projekte sind noch nicht vollständig planbar | Kern schrittweise erweitern, ohne Module zu vermischen | Reduziert |
| S-002 | Datenhaltung | Projektschema ist vorhanden, aber noch keine IndexedDB-Persistenz | Antworten gehen nach Neuladen verloren | versionierte IndexedDB mit Snapshots ergänzen | Offen |
| S-003 | Qualität | Lokale Prüfungen vorhanden, aber noch keine automatisierte CI | Fehler können auf `main` unbemerkt bleiben | kleinen GitHub-Actions-Workflow ergänzen | Teilweise |
| S-004 | Barrierefreiheit | Tastaturgrundlage vorhanden, aber keine reale Screenreader-Abnahme | Bedienhindernisse können unentdeckt bleiben | NVDA, Orca oder VoiceOver nach festem Prüfplan testen | Offen |
| S-005 | Release | Modularer Build vorbereitet, Ein-Datei-Build fehlt | Direktverteilung ist noch nicht optimal | deterministischen One-File-Build ergänzen | Teilweise |
| S-006 | Umfang | Gefahr zu vieler gleichzeitiger Funktionen | Komplexität, Wiederholungen und Fehler nehmen zu | P0/P1/P2-Prioritäten und Minimal-Patches erzwingen | Beobachtung |
| S-007 | Browser | Manche Browser blockieren `fetch()` bei `file://` | getrennte JSON-Kataloge werden beim Doppelklick nicht geladen | klar gekennzeichneter Fallback; empfohlenen lokalen Server dokumentieren | Kontrolliert |

## Meldeformat

Neue Schwachstellen erhalten:

- eindeutige ID
- betroffenen Bereich
- konkrete Ursache
- nachvollziehbare Auswirkung
- reproduzierbaren Nachweis
- geplante Gegenmaßnahme
- Prüf- und Abschlusskriterium

## Sicherheitsgrundsatz

Keine Eingabe, importierte Datei oder automatisch erzeugte Schlussfolgerung darf ungeprüft dauerhaft gespeichert, ausgeführt oder exportiert werden.
