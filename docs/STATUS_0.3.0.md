# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

Planungsphase `0.3.0-A – Workspace-Vertrag`.

Produktiv freigegebene Version bleibt `0.2.0`.

## Erledigt

- Baseline `0a2240f89fa11dd0759af0b4cfa96c79e35714b4` festgehalten.
- Option A bestätigt: automatische lokale Speicherung plus vollständiger Reset.
- Bestehende HTML- und CSS-Grid-Struktur geprüft.
- Workspace-Vertrag Version 1 definiert.
- Stabile Panel-IDs und Standardreihenfolge festgelegt.
- Speicherformat, Validierung, Reset und responsive Rückfallregeln festgelegt.
- Drag & Drop bewusst bis nach State-, Visibility- und Resize-Grundlage zurückgestellt.

## In Arbeit

- Planungs-PR und automatische Qualitätsprüfung.

## Blockiert

Keine technische Blockade.

Vor `0.3.0-C – Visibility Controls` ist noch eine Bedienentscheidung offen: Wie wird ein vollständig ausgeblendeter Workspace sicher wiederhergestellt?

## Nächste zwei Schritte

1. `0.3.0-B – State Foundation & Autosave/Reset`: Vertrag als kleine validierbare Laufzeitbasis implementieren.
2. `0.3.0-C – Visibility Controls`: Panels kontrolliert ein-/ausblendbar machen und sichere Wiederherstellung anbieten.

## Empfehlung

Erst `0.3.0-B` vollständig implementieren und automatisiert testen. Drag & Drop beginnt erst in `0.3.0-E`, wenn Datenmodell, Speicherung, Reset und Größenregeln bereits stabil sind.
