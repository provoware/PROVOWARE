# Entscheidungen 0.3.0 – Flexible Workspace Engine

## D-001 – Speicherung

**Entscheidung:** Option A.

Layoutänderungen werden automatisch lokal im Browser gespeichert.

**Begründung:** Die Oberfläche soll beim nächsten Start den zuletzt gewählten Arbeitszustand wiederherstellen, ohne einen zusätzlichen Speichern-Schritt zu verlangen.

**Schutzmaßnahme:** Ein klarer Befehl `Standardlayout wiederherstellen` setzt ausschließlich die Workspace-Einstellungen zurück.

## D-002 – Speicherort

**Entscheidung:** ausschließlich lokaler Browserspeicher (`localStorage`).

**Begründung:** Offline-First, keine Netzwerkabhängigkeit und keine unnötige Übertragung von Layoutdaten.

## D-003 – Positionsmodell

**Entscheidung:** keine freien Pixelkoordinaten speichern.

Gespeichert werden Panelreihenfolge und Rasterbreite.

**Begründung:** Das Layout bleibt reproduzierbar und robust bei unterschiedlichen Bildschirmgrößen.

## D-004 – Responsive Verhalten

**Entscheidung:** Tablet- und Mobilansicht dürfen gespeicherte Desktopwerte nur für die Darstellung begrenzen, aber nicht überschreiben.

**Begründung:** Ein kurzzeitig kleines Browserfenster darf das sorgfältig eingerichtete Desktoplayout nicht dauerhaft zerstören.

## D-005 – Drag & Drop

**Entscheidung:** noch nicht implementieren.

Drag & Drop folgt erst nach Workspace-Vertrag, State Foundation, Autosave/Reset, Sichtbarkeit und Resize-Grundlage.

**Begründung:** Zeigerbewegungen sollen erst dann Zustand verändern, wenn dessen Regeln bereits vollständig definiert und getestet sind.

## D-006 – Debugbereich

**Entscheidung:** Debugging & Logging bleibt außerhalb des Workspace-Vertrags.

**Begründung:** Diagnosefunktionen müssen auch dann erreichbar bleiben, wenn der Nutzer das Arbeitslayout verändert oder beschädigte Layoutdaten geladen werden.

## D-007 – Produktversion

**Entscheidung:** während der reinen Planungs- und Vertragsphase bleibt die reale Produktversion `0.2.0`.

**Begründung:** Eine neue Produktversion wird erst vergeben, wenn die zugehörige Funktion implementiert und geprüft ist.
