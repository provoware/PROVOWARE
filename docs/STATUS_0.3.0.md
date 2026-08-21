# Status 0.3.0 – Flexible Workspace Engine

## Aktueller Stand

`0.3.0-A – Workspace-Vertrag` ist abgeschlossen und über PR #64 gemergt.

Produktiv freigegebene Version bleibt korrekt `0.2.0`, weil noch keine Workspace-Laufzeitfunktion implementiert wurde.

## Erledigt

- Baseline `0a2240f89fa11dd0759af0b4cfa96c79e35714b4` festgehalten.
- Option A bestätigt: automatische lokale Speicherung plus vollständiger Reset.
- Bestehende HTML- und CSS-Grid-Struktur geprüft.
- Workspace-Vertrag Version 1 definiert.
- Stabile Panel-IDs und Standardreihenfolge festgelegt.
- Speicherformat, Validierung, Reset und responsive Rückfallregeln festgelegt.
- Drag & Drop bewusst bis nach State-, Visibility- und Resize-Grundlage zurückgestellt.
- Planungs-PR #64 mit erfolgreichem Quality Gate geprüft.
- Planungs-PR #64 gemergt: `3998373876f087f90ddbf248c316986b85c20fe9`.

## In Arbeit

Noch keine Laufzeitänderung. Der nächste technische Patch ist `0.3.0-B – State Foundation & Autosave/Reset`.

## Blockiert

Keine technische Blockade für 0.3.0-B.

Vor `0.3.0-C – Visibility Controls` ist noch eine Bedienentscheidung offen: Wie wird ein vollständig ausgeblendeter Workspace sicher wiederhergestellt?

## Nächste zwei Schritte

1. `0.3.0-B – State Foundation & Autosave/Reset`: Vertrag als kleine validierbare Laufzeitbasis implementieren, inklusive sicherer lokaler Speicherung und Reset, weiterhin ohne Drag & Drop.
2. `0.3.0-C – Visibility Controls`: Panels kontrolliert ein-/ausblendbar machen und eine dauerhaft erreichbare Wiederherstellung anbieten.

## Empfehlung

Als Nächstes ausschließlich `0.3.0-B` umsetzen und automatisiert testen. Drag & Drop beginnt erst in `0.3.0-E`, wenn Datenmodell, Speicherung, Reset, Sichtbarkeit und Größenregeln stabil sind.
