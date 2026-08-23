# Plan 0.3.0-D3b – Pointer Resize & Visual Balance

## Hauptziel

Den vorhandenen Resize-Griff auf Desktop ab 981 px mit einer gemeinsamen Pointer-Steuerung für Maus, Touch und Stift vervollständigen und gleichzeitig die sichtbaren Größenverhältnisse des Workspace gezielt harmonisieren.

Baseline: `5ed92c6f749818977d7a90f2e9958df9bdc08868`.

Die freigegebene Produktversion bleibt `0.2.0`. Workspace-Vertrag und persistiertes Schema bleiben Version 1.

## Begriffe in einfacher Sprache

- **Pointer Events (gemeinsame Zeigereingabe):** ein Browserweg für Maus, Touch und Stift statt drei getrennten Implementierungen.
- **Pointer Capture (Zeiger festhalten):** der aktive Resize-Griff erhält Bewegungen weiter, auch wenn der Zeiger beim Ziehen kurz außerhalb des Griffs liegt.
- **Bewegungsschwelle:** erst ab 4 px realer Bewegung wird eine Größenänderung gestartet; ein normaler Klick verändert nichts.
- **Transiente Vorschau:** sichtbare Zwischenstände werden nur dargestellt, aber noch nicht dauerhaft gespeichert.
- **Visual Balance (optische Balance):** Abstände, Mindesthöhen, Rasterausrichtung und Lichtwirkung werden so abgestimmt, dass die Oberfläche ruhiger und proportionaler wirkt.

## Änderungsgrenze

Enthalten:

1. `pointerdown`, `pointermove`, `pointerup`, `pointercancel` am bestehenden Resize-Griff,
2. 4-px-Bewegungsschwelle,
3. Pointer Capture und sauberer Abbruch,
4. Wiederverwendung der vorhandenen reinen Größenberechnung mit real gemessenem CSS-Spaltenabstand,
5. genau ein persistenter Commit am Ende einer echten Größenänderung,
6. bestehende Tastatursteuerung unverändert funktionsfähig halten,
7. Desktop-Raster optisch ausbalancieren: adaptive Abstände, echte Mindesthöhen aus dem Vertrag, keine künstliche Zeilenstreckung,
8. Licht-/Kontrastwirkung moderat verstärken, ohne Daueranimation oder neue Laufzeitabhängigkeit,
9. schnelle automatisierte Tests.

Nicht enthalten:

- kein Drag & Drop / Reorder,
- keine zweite Größenoberfläche im Layout-Menü,
- keine neue Persistenz,
- kein Schema-Upgrade,
- keine Medien-/Datenbank-/Recovery-Änderung,
- keine Browser-E2E-Ausführung in dieser Iteration; Browser-Endabnahme bleibt im manuellen Release-Gate.

## Nummerierte Checkliste – Abschluss

- [x] 1. Baseline, D3a-Code, Größenlogik, UI-Schicht und CSS gelesen.
- [x] 2. Bestehende D1-/D2-/D3a-Schichten wiederverwendet; keine zweite Resize-Logik entstanden.
- [x] 3. Pointer-Sitzung mit 4-px-Schwelle und Primary-Pointer-Prüfung implementiert.
- [x] 4. Rasterbreite und `column-gap` aus dem real gerenderten Grid gelesen; keine CSS-Gap-Konstante in JavaScript dupliziert.
- [x] 5. Pointer Capture gesetzt und bei Commit, Cancel, Escape oder Responsive-Abbruch sicher freigegeben.
- [x] 6. Pointerbewegung ausschließlich als Vorschau angewendet; `pointerup` erzeugt höchstens einen Commit.
- [x] 7. Klick beziehungsweise Bewegung unter 4 px endet ohne Größenänderung.
- [x] 8. `pointercancel` und Escape setzen ohne Persistenz auf den letzten gültigen Zustand zurück.
- [x] 9. Tastaturpfad gegen Vermischung mit einer aktiven Pointer-Sitzung geschützt.
- [x] 10. Desktop-Proportionen an den Workspace-Vertrag angeglichen und Grid-Stretching verhindert.
- [x] 11. Resize-Griff für Maus/Touch/Stift optisch klarer gemacht: sichtbarer Fokus, `nwse-resize`, `touch-action: none`, ruhige Lichtwirkung.
- [x] 12. Headquarter-Lichtwirkung moderat verstärkt, ohne neue Animation oder Layoutkopplung.
- [x] 13. Unit-/Vertragstests für Schwelle, Capture, Vorschau, Commit, Cancel, Escape, kleinen Viewport und CSS ergänzt.
- [x] 14. `npm run verify` über GitHub Quality Gate unter Node 20 und Node 24 erfolgreich geprüft.
- [x] 15. Diff gegen Baseline geprüft; Branch vor Merge 0 Commits hinter `main`.
- [x] 16. Technischen PR bei grünem schnellen Prüfstand per Squash gemergt.
- [x] 17. Dokumentation/TODO nach realem Merge-Stand geschlossen.

## Reale technische Abnahme

- technischer Pull Request: `#94`
- technischer Squash-Merge: `bf833fe50acbecc8d7d8e22a2bf8d4434cc0dee4`
- Quality-Gate-Run: `32611892780`
- Node 20.20.2: PASS
- Node 24: PASS
- Project Lint: `53` JavaScript-Dateien PASS
- Quality Gate: `134` Projektdateien PASS
- Node-Test-Suite: `147/147` PASS, `0` Fehler
- Branch vor Merge: `0` Commits hinter `main`
- Browser-E2E: gemäß aktueller Teststrategie in D3b **nicht ausgeführt**; bleibt im manuellen Release-/Abnahme-Gate.

## Abnahmekriterien

Alle schnellen technischen D3b-Kriterien sind erfüllt:

1. `pointerdown` erfasst einen primären Zeiger auf Desktop.
2. Unter 4 px Bewegung entsteht weder Vorschau noch Commit.
3. Ab 4 px startet die Vorschau.
4. Breite verwendet das reale 12er-Raster samt gemessenem CSS-Spaltenabstand.
5. Höhe rastet in 24-px-Schritten und beginnt bei automatischer Höhe mit der real gerenderten Höhe.
6. `pointermove` schreibt nicht persistent.
7. `pointerup` schreibt höchstens einmal.
8. `pointercancel`, Escape und Responsive-Abbruch schreiben nicht.
9. Pointer Capture wird sauber freigegeben.
10. Maus, Touch und Stift verwenden denselben Codepfad.
11. Tastatur-Resize bleibt regressionsfrei.
12. Workspace-Schema Version 1 bleibt unverändert.
13. Browser-E2E wird bewusst erst im späteren manuellen Release-Gate ausgeführt.

## Rückweg

Revert des D3b-PRs entfernt Pointer-Ereignisse und die gezielte Visual-Balance-Anpassung. D3a-Tastaturresize, D2-CSS-Variablen, D1-Größenlogik sowie gespeicherte Workspace-Daten bleiben kompatibel; keine Migration ist nötig.

## Nächste zwei Stufen

1. **0.3.0-E – Reorder & Drag and Drop:** eigener Drag-Griff, Resize-Griff bleibt ausschließlich für Größenänderung; nur Reihenfolge persistieren.
2. **0.3.0-G – manuelles Browser-/Accessibility-Release-Gate:** Chromium gebündelt ausführen, Firefox optional zuschalten und reale Pointer-/Layout-Abnahme dokumentieren.
