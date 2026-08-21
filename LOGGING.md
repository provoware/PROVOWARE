# LOGGING

## Ziel

Ein kleiner, lokaler Diagnosekanal für Oberfläche, Modul-Registry und Workspace-Zustand. Standardmäßig bleibt der Bereich verborgen.

## Ereignisse

Erfasst werden technische Laufzeitereignisse der Oberfläche, insbesondere:

- Start der Anwendung
- JavaScript-Fehler
- unbehandelte Promise-Ablehnungen
- Öffnen und Schließen des Debugbereichs
- Wechsel der Logging-Stufe
- Initialisierung der Modul-Registry
- Laden, Aktivieren, Deaktivieren und Entfernen von Modulen
- kontrollierte Modulvertrags- und Modul-Ladefehler
- Initialisierung des Workspace-Zustands
- sichere Korrektur ungültiger Workspace-Daten
- Speicher- und Lesefehler des lokalen Workspace-Schlüssels
- Workspace-Reset

## Stufen

### Stufe 1 · Ereignisse

Wichtige Laufzeitereignisse und Fehler, zum Beispiel beschädigte Workspace-Daten, nicht nutzbarer lokaler Speicher oder ein Reset.

### Stufe 2 · Diagnose

Stufe 1 plus Zustandsänderungen des Debugbereichs, Registry-Abläufe und nachvollziehbare Workspace-Korrekturen wie fehlende oder unbekannte Panels.

### Stufe 3 · Trace

Stufe 1 und 2 plus feingranulare technische Baseline-Informationen. Trace darf nicht dazu benutzt werden, unnötige Nutzerdaten zu sammeln.

## Bereiche

- `APP` – Start und allgemeine Oberfläche
- `DEBUG` – Bedienung des Diagnosebereichs
- `TRACE` – technische Detailinformationen
- `ERROR` – globale JavaScript-Fehler
- `PROMISE` – unbehandelte Promise-Ablehnungen
- `MODULES` – Modulvertrag, Registry und Lebenszyklus
- `WORKSPACE` – Layoutzustand, Normalisierung, lokale Speicherung und Reset

## Format

`ZEIT [Lx] [BEREICH] NACHRICHT DATEN`

## Verständlichkeit

Meldungen sollen in dieser Reihenfolge helfen:

1. **Was ist passiert?**
2. **Welcher Bereich ist betroffen?**
3. **Welche sichere Reaktion wurde ausgeführt?**

Beispiel:

`[WORKSPACE] Gespeicherter Workspace-Zustand ist beschädigt; Standardlayout wird verwendet.`

Technische Zusatzdaten werden nur ergänzt, wenn sie die Reproduktion erleichtern.

## Datenschutz

Keine Netzwerkübertragung durch den Logger. Technische Zusatzdaten werden auf das für die Diagnose notwendige Minimum begrenzt. Logs sollen keine Nutzinhalte oder vertrauliche Fachinhalte aufnehmen, wenn Zustandsname, Feldname oder Fehlerursache ausreichen.

## Aufbewahrung

Maximal 500 Einträge im Arbeitsspeicher. Beim Neuladen gehen die Logeinträge verloren. Gespeichert werden nur Sichtbarkeit und gewählte Logging-Stufe des Debugbereichs.

Workspace-Layoutdaten liegen getrennt unter:

`provoware.allin.workspace.main.v1`

## Entwicklerzugriff

Der zentrale Logger ist unter `window.PROVOWARE_DEBUG` erreichbar.

Die Modul-Registry erhält ihn über `setLogger()`.

Die Workspace-Zustandsverwaltung erhält denselben Logger über `loggerSetzen()`.

Dadurch existiert nur eine sichtbare Log-Infrastruktur und keine doppelte Diagnoseanzeige.
