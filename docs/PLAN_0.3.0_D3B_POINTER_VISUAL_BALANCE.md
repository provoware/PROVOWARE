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

## Nummerierte Checkliste

- [x] 1. Baseline, D3a-Code, Größenlogik, UI-Schicht und CSS gelesen.
- [x] 2. Bestehende D1-/D2-/D3a-Schichten werden wiederverwendet; keine zweite Resize-Logik entsteht.
- [ ] 3. Pointer-Sitzung mit 4-px-Schwelle und Primary-Pointer-Prüfung implementieren.
- [ ] 4. Rasterbreite und `column-gap` aus dem real gerenderten Grid lesen; keine CSS-Gap-Konstante in JavaScript duplizieren.
- [ ] 5. Pointer Capture setzen und bei Commit, Cancel, Escape oder Responsive-Abbruch sicher freigeben.
- [ ] 6. Pointerbewegung ausschließlich als Vorschau anwenden; `pointerup` erzeugt höchstens einen Commit.
- [ ] 7. Klick beziehungsweise Bewegung unter 4 px ohne Größenänderung beenden.
- [ ] 8. `pointercancel` und Escape ohne Persistenz auf letzten gültigen Zustand zurücksetzen.
- [ ] 9. Tastaturpfad gegen Vermischung mit einer aktiven Pointer-Sitzung schützen.
- [ ] 10. Desktop-Proportionen an den Workspace-Vertrag angleichen und Grid-Stretching verhindern.
- [ ] 11. Resize-Griff für Maus/Touch/Stift optisch klarer machen: sichtbarer Fokus, `nwse-resize`, `touch-action: none`, ruhige Lichtwirkung.
- [ ] 12. Headquarter-Lichtwirkung moderat verstärken, ohne neue Animation oder Layoutkopplung.
- [ ] 13. Unit-/Vertragstests für Schwelle, Capture, Vorschau, Commit, Cancel, Escape, kleinen Viewport und CSS ergänzen.
- [ ] 14. `npm run verify` über GitHub Quality Gate unter Node 20 und Node 24 grün prüfen.
- [ ] 15. Diff gegen Baseline prüfen; Branch vor Merge 0 Commits hinter `main`.
- [ ] 16. Technischen PR nur bei grünem schnellen Prüfstand mergen.
- [ ] 17. Dokumentation/TODO nach realem Merge-Stand schließen.

## Abnahmekriterien

D3b ist technisch grün, wenn:

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
13. Browser-E2E wird in dieser Iteration nicht automatisch ausgeführt.

## Rückweg

Revert des D3b-PRs entfernt Pointer-Ereignisse und die gezielte Visual-Balance-Anpassung. D3a-Tastaturresize, D2-CSS-Variablen, D1-Größenlogik sowie gespeicherte Workspace-Daten bleiben kompatibel; keine Migration ist nötig.

## Nächste zwei Stufen

1. **0.3.0-E – Reorder & Drag and Drop:** erst nach stabilem D3b; eigener Drag-Griff und nur Reihenfolge persistieren.
2. **0.3.0-G – manuelles Browser-/Accessibility-Release-Gate:** Chromium gebündelt ausführen, Firefox optional zuschalten und reale Pointer-/Layout-Abnahme dokumentieren.
