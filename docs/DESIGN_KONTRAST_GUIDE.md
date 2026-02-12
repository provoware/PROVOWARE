# Farb- und Kontrastleitfaden

Dieser Leitfaden fasst die verbindlichen Regeln für PROVOWARE zusammen. Die Hinweise basieren auf:

- [WCAG 2.2 Erfolgskriterium 1.4.3 „Contrast (Minimum)”](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) – fordert mindestens 4,5 : 1 für normalen Text und 3 : 1 für große Überschriften (Heading = Kapitelüberschrift).
- [Material Design 3 – Color Guidance](https://m3.material.io/styles/color/overview) – beschreibt nachvollziehbar, wie Farben, Oberflächen und Markenwerte harmonisch eingesetzt werden.

## Grundregeln

1. **Normaler Text (Paragraph = Lauftext)** benötigt mindestens **4,5 : 1 Kontrast (Helligkeitsunterschied)** zum Hintergrund.
2. **Große Überschriften (Heading ab 24 px)** benötigen mindestens **3 : 1 Kontrast**.
3. **Interaktive Elemente (Buttons, Links, Schalter)** müssen sowohl im Normalzustand als auch im Fokuszustand die Mindestwerte einhalten.
4. **Statusanzeigen (Erfolg, Warnung, Fehler)** richten sich nach der WCAG-Empfehlung für Grafiken: mindestens **3 : 1** gegen die jeweilige Kartenfläche.
5. **Hell-Dunkel-Wechsel**: Wenn neue Farben ergänzt werden, muss `design/manifest.json` um den Token erweitert und die Kontrastprüfung erneut gestartet werden.

## Vorgehensweise in der Praxis

1. **Farben definieren**
   - Trage jede neue Farbe als CSS-Variable (Token = Wiederverwendungsname) in `design/manifest.json` ein.
   - Ergänze für Buttons die Variable `--color-text-on-accent`, damit die Beschriftung auf jedem Farbverlauf gut lesbar ist.

2. **Kontrastmessung durchführen**
   - Konsole öffnen und folgenden Befehl ausführen:
     ```bash
     npm run check:contrast
     ```
   - Das Skript `scripts/contrast.js` liest die Konfigurationspaare aus dem Manifest und meldet je Paar „✓ Kontrast erfüllt” oder „✗ Kontrast zu niedrig”.
   - Bei Fehlern hilft die Ausgabe `failures` dabei, die betroffenen Token gezielt anzupassen.

3. **Globale Prüfung starten**
   - Nach Änderungen immer die komplette Startroutine (Bootstrap = automatische Vorbereitung) laufen lassen:
     ```bash
     ./scripts/bootstrap.sh
     ```
   - Die Reihenfolge deckt Formatierung, Linting (Quellcode-Regeln), Unit-Tests (Funktionstests), Kontrastmessung und Barrierefreiheit ab.

4. **Design dokumentieren**
   - Im Manifest die gemessenen Kontrastwerte (`computedRatio`) aktualisieren, damit das Team transparent sieht, dass die Vorgaben erfüllt wurden.
   - Verlinke bei neuen Anforderungen zusätzliche Quellen, damit spätere Module denselben Wissensstand besitzen.

## Zusätzliche Ressourcen

- [Understanding Success Criterion 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) – detaillierte Hintergründe und Beispiele.
- [Material Design: Contrast and Tone](https://m3.material.io/styles/color/the-color-system/contrast) – erläutert Farbtöne (Tone = Helligkeitswert) und empfohlene Paare.
- [WAI Media Guide – Player](https://www.w3.org/WAI/media/av/accessible-player/) – erinnert daran, Kontraste auch für Steuerelemente (Controls = Bedienknöpfe) zu überprüfen.

Halte dich an diese Schritte, damit alle nachfolgenden Module automatisch das gleiche, barrierefreie Farbniveau erreichen.
