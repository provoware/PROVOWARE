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

**Entscheidung:** Die freigegebene Produktversion bleibt bis zur vollständigen Abnahme der Workspace Engine bei `0.2.0`.

**Begründung:** Interne Teilstufen werden transparent dokumentiert, aber nicht als vollständig freigegebene 0.3.0-Funktion ausgegeben.

## D-008 – Vollständig ausgeblendeter Workspace

**Entscheidung:** Option A.

Alle Panels dürfen vollständig ausgeblendet werden.

**Schutzmaßnahme:** Ein permanenter `Layout`-Schalter bleibt außerhalb des veränderbaren Workspace jederzeit erreichbar. Darüber können einzelne Panels wieder eingeblendet oder das Standardlayout vollständig wiederhergestellt werden.

**Begründung:** Maximale Flexibilität ohne Gefahr, sich aus der Oberfläche auszusperren.

## D-009 – Kompakte Schnellstarter- und Menüleiste

**Entscheidung:** Unter dem festen oberen Bereich wird ab 0.3.0-C eine moderne kompakte Schnellstarter-/Menüleiste eingesetzt.

Die Leiste:

- gehört nicht zum verschiebbaren Workspace
- bleibt bei ausgeblendeten Panels erreichbar
- enthält den permanenten `Layout`-Schalter
- soll spätere häufige Aktionen aufnehmen, ohne die Hauptfläche zu überladen
- wird erst mit real benötigten Funktionen erweitert

**Begründung:** Wichtige Steuerfunktionen bleiben schnell erreichbar, während die Arbeitsfläche klar und modular bleibt.

## D-010 – Wartbarkeit und Benennung

**Entscheidung:** Neue Workspace-Logik wird in kleine, klar abgegrenzte Funktionen zerlegt. Daten, reine Logik, Browser-Speicherung und Logging werden getrennt behandelt.

Neue Workspace-Funktionsnamen werden verständlich und konsistent deutsch benannt. Bestehende veröffentlichte Schnittstellen anderer Subsysteme werden nicht nur aus Stilgründen umbenannt.

**Begründung:** Weniger doppelte Logik, reproduzierbare Tests und geringeres Risiko bei späteren Erweiterungen.

## D-011 – Mobile Schnellstarterleiste

**Entscheidung:** Option A.

Die kompakte Schnellstarterleiste bleibt auch auf kleinen Displays einzeilig. Der primäre `Layout`-Schalter liegt in einem festen, nicht horizontal scrollenden Bereich. Nur sekundäre Informationen oder spätere zusätzliche Aktionen dürfen horizontal überlaufen.

**Begründung:** Der wichtigste Wiederherstellungsweg bleibt jederzeit sichtbar. Gleichzeitig bleibt die Bedienlogik auf Desktop und Mobil konsistent und benötigt keine separate mobile Aktionsleiste.

**Grenze:** Die Leiste darf nicht zu einer zweiten parallelen Seitennavigation ausgebaut werden. Neue Einträge brauchen einen konkreten, häufigen Nutzen.

## D-012 – Resize-Bedienmodell

**Entscheidung:** Option A.

Jedes sichtbare Workspace-Panel erhält einen klaren Resize-Griff unten rechts. Derselbe fokussierbare Griff unterstützt Maus, Touch/Stift und Tastatur.

Für Maus, Touch und Stift wird eine gemeinsame Pointer-Event-Logik verwendet. Die Tastatur nutzt dieselbe Größenberechnung und denselben Commitpfad.

**Begründung:** Eine gemeinsame Bedienmechanik reduziert doppelte Logik, Synchronisationsfehler und Testaufwand.

**Grenze:** In 0.3.0-D wird keine zweite vollständige Größensteuerung im Layout-Menü eingeführt.

## D-013 – Resize-Raster, Persistenz und Responsive Grenze

**Entscheidung:**

- Breite ändert sich in Schritten von genau `1` Rastereinheit.
- Höhe ändert sich in Schritten von `24 px`.
- Während Pointer-/Tastaturbewegungen entsteht nur eine transiente Vorschau.
- Persistiert wird erst ein validierter Endwert.
- Resize wird in 0.3.0-D nur ab `981 px` aktiv angeboten.
- Tablet-/Mobilansichten verändern gespeicherte Desktopgrößen nicht.
- `Home/Pos1` stellt die Standardgröße des einzelnen Panels wieder her: Standardbreite und `heightPx: null`.

**Begründung:** Die Größenänderung bleibt reproduzierbar, speicherschonend und kompatibel mit den bereits definierten responsive Rückfallregeln.

**Technische Folge:** Workspace-Vertragsversion `1` bleibt unverändert, weil die Felder `widthUnits` und `heightPx` bereits Bestandteil des bestehenden Schemas sind.
