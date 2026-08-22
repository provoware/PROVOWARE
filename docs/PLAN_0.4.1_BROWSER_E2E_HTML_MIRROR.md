# PLAN 0.4.1-E2E – Chromium Gate & HTML UI Mirror

## Ziel

Die bisher überwiegend DOM-/Service-basierten Regressionen um einen echten Browserpfad erweitern. Primärbrowser ist Chromium. Firefox bleibt ein bewusst optionaler Kompatibilitätslauf.

## Verbindlicher Kernpfad

1. Anwendung über lokalen Klick-&-Start-Server laden.
2. Entwicklungsnotiz über die echte UI speichern.
3. gespeicherte Notiz über die feste Projekttextdatei nachweisen.
4. Vorlage über Data Studio erzeugen.
5. Datensatz speichern.
6. Seite neu laden und Persistenz nachweisen.
7. Datensatz bearbeiten.
8. Backup erzeugen.
9. Datensatz nach dem Backup verändern.
10. Backup-Vorschau und Restore ausführen.
11. alten Datensatzstand nach Restore nachweisen.
12. JSON exportieren.
13. Datensatz löschen.
14. Exportdatei importieren.
15. wiederhergestellten Datensatz nachweisen.

## Browserstrategie

- Chromium: automatisch bei Pull Request und `main`-Push.
- Firefox: nur als alternativer manueller Workflow-Dispatch.
- kein Google-Chrome-spezifischer Projektlauf.
- Playwright ist ausschließlich Dev-/CI-Werkzeug und keine Runtime-Abhängigkeit.

## Isolierung

Browser-E2E läuft aus einer temporären Projektkopie. Dadurch dürfen Tests reale Projektdateien beschreiben, ohne die Arbeitskopie oder lokale Nutzdaten zu verändern.

## HTML-Mirror-Pipeline

`tests/browser/ui-mirror.html` lädt zweimal dieselbe echte `/index.html`.

- Referenz: interner Layout-Viewport 1366 × 900 bei 100 %.
- Spiegel: identischer interner Layout-Viewport 1366 × 900.
- visuelle Skalierung ausschließlich außen per CSS auf Faktor 0,5.
- zentrale UI-Rechtecke werden innerhalb beider Frames gemessen und verglichen.
- PASS nur bei identischer interner Geometrie und korrektem Skalierungsfaktor.

Screenshots dokumentieren die UI, sind aber nicht als betriebssystemabhängiger Pixel-Diff-Gate gedacht. Das eigentliche Mirror-Gate basiert auf DOM-/Geometriemessung.

## Evidenz

Bei erfolgreichem Chromium-Lauf entstehen unter anderem:

- Startansicht
- gespeicherter Datensatz
- Restore-Ergebnis
- Import-Ergebnis
- vollständige Mirror-Pipeline
- separat skalierter Mirror
- exportierte Project-Data-JSON

Bei Fehlern bleiben zusätzlich Playwright Trace, Fehler-Screenshot und Video erhalten.

## Nicht Teil dieses Strangs

- 0.4.2 Data Studio PRO
- echte Produktionsmigration auf Schema v2
- Windows-/macOS-CI
- Pixel-Perfect-Screenshot-Baselines über mehrere Betriebssysteme
