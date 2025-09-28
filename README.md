# PROVOWARE Steuerzentrale

Diese Codebasis bildet das Hauptmodul („Steuerzentrale“) für PROVOWARE ab. Sie kombiniert ein dokumentiertes Designsystem, mehrere Themes, eine barrierefreie Grundstruktur sowie automatische Prüf- und Reparatur-Routinen.

## Schnellstart

```bash
# 1. Abhängigkeiten prüfen und Tests ausführen
./scripts/bootstrap.sh

# 2. Lokalen Server starten
npm run start
```

Der Server stellt `src/index.html` unter [http://localhost:4173](http://localhost:4173) bereit.

## Ordnerstruktur

- `design/manifest.json` – vollständige Farb-, Layout- und Accessibility-Standards.
- `design/themes.css` – Theme-Tokens für Dunkel, Hell und Hoher Kontrast.
- `src/index.html` – Dashboard-Layout mit Navigation, Kartenbereich und Sidebar.
- `src/styles/global.css` – globale Styles inklusive Responsive-Verhalten.
- `src/scripts` – modulare Logik (Theme-Wechsel, Debugging, Self-Heal, Laien-Tipps) mit Validierung und Logging.
- `scripts/` – ausführbare Hilfsprogramme für Start, Lint, Tests, Formatierung und Accessibility-Prüfung.
- `logs/` – Ablageort für Protokolle der Startroutine.

## Automatische Prüfungen

Die CI-Skripte führen folgende Schritte aus:

1. `node scripts/format.js` – formatiert JSON-Dateien.
2. `node scripts/lint.js` – prüft auf Tabulatoren und überflüssige Leerzeichen.
3. `node scripts/test.js` – Testet Selbstheilung und Theme-Konfiguration.
4. `node scripts/accessibility.js` – Kontrolliert wichtige Barrierefreiheitsmerkmale.

Alle Schritte laufen zusammen mit `npm run ci`.

## Laienfreundliche Hinweise

- **Theme wechseln:** Rechts im Panel „Farbschema“ auswählen. Die Farben wurden nach WCAG-Standards abgestimmt.
- **Debug-Modus:** Nur aktivieren, wenn zusätzliche Hilfslinien und Konsolenmeldungen benötigt werden.
- **Self-Repair:** Formular ausfüllen und „Prüfung starten“ drücken. Das System führt automatische Korrekturen durch.
- **Tipps:** Unter „Laien-Tipps“ stehen leicht verständliche Empfehlungen für den Alltag.

Weitere Details findest du im Manifest (`design/manifest.json`).
