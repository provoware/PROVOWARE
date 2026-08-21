# LOGGING

## Ziel

Ein kleiner, lokaler Diagnosekanal für die HTML-Oberfläche. Standardmäßig bleibt der Bereich verborgen.

## Ereignisse

Erfasst werden ausschließlich technische Laufzeitereignisse der Oberfläche, insbesondere Start, JavaScript-Fehler und unbehandelte Promise-Ablehnungen.

## Stufen

### Stufe 1 · Ereignisse

Kritische Laufzeitereignisse und Fehler.

### Stufe 2 · Diagnose

Stufe 1 plus Zustandsänderungen des Debugbereichs und der Logging-Konfiguration.

### Stufe 3 · Trace

Stufe 1 und 2 plus feingranulare technische Baseline-Informationen.

## Format

`ZEIT [Lx] [BEREICH] NACHRICHT DATEN`

## Datenschutz

Keine Netzwerkübertragung. Der Logger arbeitet lokal im Browser. Technische Zusatzdaten sollen auf das für die Diagnose notwendige Minimum begrenzt bleiben.

## Aufbewahrung

Maximal 500 Einträge im Arbeitsspeicher. Beim Neuladen gehen die Logeinträge verloren. Gespeichert werden nur Sichtbarkeit und gewählte Logging-Stufe.
