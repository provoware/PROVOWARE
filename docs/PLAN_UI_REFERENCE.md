# Plan – Übertragung des Referenzdesigns

## Ziel und Grenze

Hauptziel ist die Übertragung von Farbwirkung, räumlicher Hierarchie und kompaktem Kartenlayout der bereitgestellten Referenz auf die bestehende PROVOWARE-Oberfläche. Funktionen, Daten, Speicherung und öffentliche Schnittstellen bleiben unverändert.

- Ausgangsstand (Baseline): `bfb9b9205f0c4c6e3a708d6f54ec90923e6fa9a8`
- Branch: `feature/reference-ui-transfer`
- Änderungsvolumen: mittel
- Betroffen: Darstellungsschicht und Entwicklungsdokumentation
- Nicht enthalten: Resize, Drag & Drop, Fachmodule, neue Abhängigkeiten, Netzwerkzugriffe und neue Speicherwerte
- Risiko: Kontrast, Überlauf oder zu dichte Darstellung bei kleinen Viewports
- Rückweg: den einzelnen Iterationscommit mit `git revert <commit>` zurücknehmen

## Nummerierte Checkliste

1. [x] Ausgangslage, Version und zuständige Dateien lesen.
2. [x] Zielbild auf zentrale Farben, Ebenen, Abstände und Komponenten begrenzen.
3. [x] `assets/styles.css`, `CHANGELOG.md` und diesen Plan als betroffene Dateien festlegen.
4. [x] Bestehende HTML-IDs, Zustände und Schnittstellen unverändert lassen.
5. [x] Farben und Ebenen vor Navigation, Karten und responsiven Regeln umsetzen.
6. [x] Sichere Formatkorrektur und vorhandenes Quality Gate ausführen.
7. [x] Desktop- und Mobilansicht rendern und visuell prüfen.
8. [x] Reale visuelle Änderung im Changelog dokumentieren.
9. [x] Vollständigen Rückweg ohne Datenmigration festhalten.
10. [x] Tatsächlichen Diff gegen die Baseline prüfen.
11. [x] Vorhandene Nutzer- und Fehlermeldungen unverändert erhalten.
12. [x] Folgestufen festlegen: Browser-Stichprobe, danach Resize getrennt implementieren.

## Patchbegründung

Die bisherige Oberfläche besitzt bereits die nötige semantische Struktur, bildet die kompakte, tief gestaffelte Referenzwirkung aber noch nicht ausreichend ab. Deshalb genügt ein auf CSS begrenzter Patch. Möglich sind ausschließlich Darstellungsregressionen; sie werden über das Quality Gate, gerenderte Ansichten und den Diff geprüft. Es entstehen keine neuen Seiteneffekte und keine Migration.
