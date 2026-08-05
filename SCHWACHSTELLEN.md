# Schwachstellen und technische Risiken

## Zweck

Dieses Dokument sammelt bekannte Risiken, technische Schulden und offene Sicherheitsfragen. Ein Punkt wird erst entfernt, wenn Ursache, Korrektur und Nachprüfung dokumentiert sind.

## Aktuelle Schwachstellen

| ID | Bereich | Risiko | Auswirkung | Gegenmaßnahme | Status |
|---|---|---|---|---|---|
| S-001 | Architektur | Noch kein ausführbarer Kern vorhanden | Funktionen und Datenflüsse sind noch nicht praktisch validiert | Minimalprototyp mit klaren Modulgrenzen erstellen | Offen |
| S-002 | Datenhaltung | Noch kein finales Projektschema | Spätere Migrationen könnten unnötig kompliziert werden | Schema früh versionieren und mit Prüffällen absichern | Offen |
| S-003 | Qualität | Noch keine automatisierte CI | Fehler können unbemerkt in `main` gelangen | Kleine Syntax-, Schema- und Smoke-Tests einrichten | Offen |
| S-004 | Barrierefreiheit | Noch keine reale Screenreader-Abnahme | Bedienhindernisse können unentdeckt bleiben | Tastatur-, Fokus- und Screenreader-Prüfplan erstellen | Offen |
| S-005 | Release | Noch kein reproduzierbarer Build | Unterschiede zwischen Quellstand und Ausgabe möglich | Deterministischen Build mit Manifest und SHA-256 einführen | Offen |
| S-006 | Umfang | Gefahr zu vieler gleichzeitiger Funktionen | Komplexität, Wiederholungen und Fehler nehmen zu | P0/P1/P2-Prioritäten und Minimal-Patches erzwingen | Beobachtung |

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
