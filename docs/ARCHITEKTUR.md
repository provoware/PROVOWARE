# Architektur

## Ziel

Der Prototyp trennt Darstellung, Zustand, Workflow, Regeln, Validierung und Berichte. Keine Fachlogik liegt direkt in `index.html`.

## Laufzeitfluss

```text
index.html
  → app.js lädt Datenkataloge
  → validation-engine.js prüft Grundstruktur
  → state-manager.js hält den Sitzungszustand
  → workflow-engine.js bestimmt aktuelle Frage und Phase
  → rule-engine.js wertet Bedingungen aus
  → report-generator.js erzeugt die Planvorschau
  → ui/app-ui.js rendert Oberfläche und Status
```

## Offline-Verhalten

Beim empfohlenen lokalen HTTP-Start werden die JSON-Dateien aus `data/` geladen. Blockiert ein Browser lokale `fetch()`-Aufrufe beim Doppelklick, verwendet die Anwendung einen eingebauten Beispieldatensatz und kennzeichnet diesen Modus sichtbar.

## Nächste Architekturgrenze

Die folgende Iteration ergänzt IndexedDB hinter einer eigenen Speicherschicht. UI und Workflow dürfen nicht direkt auf Browserdatenbanken zugreifen.
