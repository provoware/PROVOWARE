# LOGGING

## Ziel

Ein kleiner, lokaler Diagnosekanal für die HTML-Oberfläche und die Modul-Registry. Standardmäßig bleibt der Bereich verborgen.

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

## Stufen

### Stufe 1 · Ereignisse

Wichtige Laufzeitereignisse, Modul-Zustandsänderungen und Fehler.

### Stufe 2 · Diagnose

Stufe 1 plus Zustandsänderungen des Debugbereichs, der Logging-Konfiguration und technische Registry-Abläufe wie der Start eines Ladevorgangs.

### Stufe 3 · Trace

Stufe 1 und 2 plus feingranulare technische Baseline-Informationen.

## Bereiche

- `APP` – Start und allgemeine Oberfläche
- `DEBUG` – Bedienung des Diagnosebereichs
- `TRACE` – technische Detailinformationen
- `ERROR` – globale JavaScript-Fehler
- `PROMISE` – unbehandelte Promise-Ablehnungen
- `MODULES` – Modulvertrag, Registry und Lebenszyklus

## Format

`ZEIT [Lx] [BEREICH] NACHRICHT DATEN`

## Datenschutz

Keine Netzwerkübertragung durch den Logger. Technische Zusatzdaten werden auf das für die Diagnose notwendige Minimum begrenzt. Modul-Logs sollen keine Nutzinhalte oder vertrauliche Fachinhalte aufnehmen, wenn ein Zustandsname oder Fehlercode ausreicht.

## Aufbewahrung

Maximal 500 Einträge im Arbeitsspeicher. Beim Neuladen gehen die Logeinträge verloren. Gespeichert werden nur Sichtbarkeit und gewählte Logging-Stufe.

## Entwicklerzugriff

Der Logger ist unter `window.PROVOWARE_DEBUG` erreichbar. Die Modul-Registry erhält denselben Logger über `setLogger()` und erzeugt dadurch keine parallele zweite Log-Infrastruktur.
