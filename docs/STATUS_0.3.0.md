# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

`0.3.0-A – Workspace-Vertrag` ist abgeschlossen.

`0.3.0-B – State Foundation & Autosave/Reset` ist implementiert und befindet sich in der Abschlussvalidierung.

Die freigegebene Produktversion bleibt bis zur vollständigen Workspace-Abnahme korrekt bei `0.2.0`.

## Erledigt

### Vertragsphase 0.3.0-A

- Workspace-Vertrag Version 1 definiert.
- Option A für automatische lokale Speicherung und vollständigen Reset bestätigt.
- Planungs-PR #64 erfolgreich geprüft und gemergt.

### Laufzeitgrundlage 0.3.0-B

- `assets/workspace-state.js` als getrennte Zustandsverwaltung angelegt.
- fünf Kernpanels zentral definiert.
- Standardzustand reproduzierbar erzeugt.
- gespeicherte Daten validiert und deterministisch normalisiert.
- unbekannte, doppelte oder fehlende Panel-IDs kontrolliert behandelt.
- Breiten und Höhen auf sichere Werte begrenzt.
- beschädigtes JSON auf Standardzustand zurückgeführt.
- Browser-Speicherfehler so behandelt, dass die Sitzung weiterläuft.
- lokales Speichern und Wiederladen vorbereitet.
- Reset auf `provoware.allin.workspace.main.v1` begrenzt.
- Workspace-Logging an den vorhandenen dreistufigen Logger angebunden.
- automatische Tests für Zustand, Speicherfehler und Reset ergänzt.
- `npm run test` auf alle Testdateien erweitert.
- Quality Gate um Workspace-Dateien und Script-Reihenfolge erweitert.
- Wartbarkeitsstandard in `AGENTS.md` geschärft.
- detaillierter Teilplan und Patchmanifest ergänzt.

## Bestätigte Bedienentscheidung für 0.3.0-C

Alle Workspace-Panels dürfen später vollständig ausgeblendet werden.

Unter dem festen oberen Bereich wird eine kompakte Schnellstarter-/Menüleiste vorgesehen. Darin bleibt ein permanenter `Layout`-Schalter außerhalb des verschiebbaren Workspace jederzeit erreichbar.

## In Arbeit

- vollständiger Diff-Check gegen den aktuellen `main`
- GitHub Quality Gate für 0.3.0-B
- Merge und Main-Stichprobe

## Blockiert

Keine bekannte fachliche oder technische Blockade.

## Änderungsvolumen

Einstufung: **mittel**.

Betroffen sind:

- interne Workspace-Zustandsverwaltung
- App-Start
- lokale Workspace-Speicherung
- automatische Tests
- Quality Gate
- Entwicklungsdokumentation

Nicht betroffen sind:

- sichtbares Panel-Layout
- Fachmodule
- Netzwerk
- Debug-Einstellungen
- Modulvertrag

## Nächste zwei Schritte

1. `0.3.0-C – Visibility Controls + kompakte Menüleiste`: feste Schnellstarter-/Menüleiste mit permanentem `Layout`-Schalter anlegen, Panels sicher ein-/ausblendbar machen, `Alle anzeigen` und Reset jederzeit erreichbar halten sowie Tastatur/Fokus prüfen.
2. `0.3.0-D – Resize`: Panelbreite und -höhe innerhalb des Vertrags veränderbar machen, Maus/Touch/Tastatur absichern und nur validierte Endwerte speichern.

## Empfehlung

0.3.0-B erst nach grünem Quality Gate mergen. Danach direkt 0.3.0-C beginnen. Drag & Drop bleibt bis 0.3.0-E gesperrt.
