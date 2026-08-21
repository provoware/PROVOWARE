# Implementierungsreihenfolge 0.3.0

Diese Reihenfolge ist verbindlich, damit die flexible Arbeitsfläche nicht gleichzeitig Datenmodell und Bedienlogik erfinden muss.

1. `0.3.0-A – Workspace-Vertrag`
   - Datenregeln, Panel-IDs, Grenzen, Speicherung, Reset, responsive Verhalten.
2. `0.3.0-B – State Foundation & Autosave/Reset`
   - Vertrag in Code abbilden, validieren, laden, speichern und zurücksetzen.
3. `0.3.0-C – Visibility Controls`
   - Panels sicher ein-/ausblenden und wiederherstellen.
4. `0.3.0-D – Resize`
   - Breite und Höhe innerhalb geprüfter Grenzen verändern.
5. `0.3.0-E – Reorder & Drag and Drop`
   - erst jetzt Neuordnung über Zeigerbewegung und Tastatur.
6. `0.3.0-F – Responsive & Accessibility Hardening`
   - mobile Rückfallregeln, Fokus, Touch und reduzierte Bewegung prüfen.
7. `0.3.0-G – Release Gate`
   - automatische und manuelle Abnahme, Dokumentation, Versionierung und Merge.

## Sperrregel

Drag & Drop darf nicht vor erfolgreicher State-, Autosave-/Reset-, Visibility- und Resize-Grundlage beginnen.
