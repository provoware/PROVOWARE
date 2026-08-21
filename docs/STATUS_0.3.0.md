# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

`0.3.0-A – Workspace-Vertrag` ist abgeschlossen.

`0.3.0-B – State Foundation & Autosave/Reset` ist abgeschlossen, automatisch geprüft und über PR #66 gemergt.

Die freigegebene Produktversion bleibt bis zur vollständigen Workspace-Abnahme korrekt bei `0.2.0`. Die interne Entwicklungsphase ist in `VERSION.json` transparent als `0.3.0-B` vermerkt.

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
- beschädigtes JSON auf Standardzustand zurückgeführt und kontrolliert repariert.
- Browser-Speicherfehler so behandelt, dass die Sitzung weiterläuft.
- lokales Speichern und Wiederladen implementiert.
- Reset auf `provoware.allin.workspace.main.v1` begrenzt.
- Workspace-Logging an den vorhandenen dreistufigen Logger angebunden.
- automatische Tests für Zustand, Speicherfehler und Reset ergänzt.
- `npm run test` auf alle Testdateien erweitert.
- Quality Gate um Workspace-Dateien und Script-Reihenfolge erweitert.
- Wartbarkeitsstandard in `AGENTS.md` geschärft.
- detaillierter Teilplan und Patchmanifest ergänzt.

## Validierung 0.3.0-B

- Branch vor Merge: `0` Commits hinter `main`.
- PR: `#66`.
- PR war mergebar.
- GitHub Quality Gate: `success`.
- statische Projektprüfung: `35` Dateien erfolgreich geprüft.
- automatische Tests: `11/11` erfolgreich, `0` fehlgeschlagen.
- Merge: `069ad34f2b869fb91dc1c7726cb5903431863cfb`.
- Main-Stichprobe: `assets/workspace-state.js` und `VERSION.json` erfolgreich gelesen.

## Technischer Hinweis

GitHub Actions meldet bei den derzeit verwendeten Actions der Generation `v4` einen Hinweis zur veraltenden internen Node-20-Laufzeit. Das Projekt-Quality-Gate selbst lief erfolgreich mit bereitgestelltem Node `20.20.2`.

Der Hinweis blockiert 0.3.0-B nicht. Die Workflow-Hygiene wird spätestens im Release-Hardening 0.3.0-G erneut geprüft, damit eine Umstellung getrennt und reproduzierbar erfolgt.

## Bestätigte Bedienentscheidung für 0.3.0-C

Alle Workspace-Panels dürfen vollständig ausgeblendet werden.

Unter dem festen oberen Bereich wird eine kompakte Schnellstarter-/Menüleiste vorgesehen. Darin bleibt ein permanenter `Layout`-Schalter außerhalb des verschiebbaren Workspace jederzeit erreichbar.

## Blockiert

Keine bekannte fachliche oder technische Blockade.

## Änderungsvolumen 0.3.0-B

Einstufung: **mittel**.

PR #66 änderte 19 Dateien. Betroffen waren:

- interne Workspace-Zustandsverwaltung
- App-Start
- lokale Workspace-Speicherung
- automatische Tests
- Quality Gate
- Entwicklungsdokumentation

Nicht betroffen waren:

- sichtbare Panelbedienung
- Fachmodule
- Netzwerk
- Debug-Einstellungen
- Modulvertrag

## Nächste zwei Schritte

1. `0.3.0-C – Visibility Controls + kompakte Menüleiste`: feste Schnellstarter-/Menüleiste mit permanentem `Layout`-Schalter anlegen, Panels sicher ein-/ausblendbar machen, `Alle anzeigen` und Reset jederzeit erreichbar halten sowie Tastatur/Fokus und verständliches Nutzerfeedback prüfen.
2. `0.3.0-D – Resize`: Panelbreite und -höhe innerhalb des Vertrags veränderbar machen, Maus/Touch/Tastatur absichern und nur validierte Endwerte speichern.

## Empfehlung

Als Nächstes ausschließlich 0.3.0-C umsetzen. Drag & Drop bleibt bis 0.3.0-E gesperrt, damit Sichtbarkeit und Größenlogik vorher unabhängig stabilisiert werden.
