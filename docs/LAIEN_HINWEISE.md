# Leicht verständliche Hinweise

- **Startroutine (bootstrap = automatische Vorbereitung)** – Datei `scripts/bootstrap.sh` einfach im Terminal ausführen. Das Skript erledigt Formatierung, Tests, Kontrastmessung und Barrierefreiheits-Check automatisch.
- **Kontrast prüfen (Farbvergleich)** – `npm run check:contrast` starten. Bei „✗“ die betroffenen Farben in `design/manifest.json` anpassen.
- **Design einhalten** – Alle Farben, Abstände und Schriftgrößen stehen in `design/manifest.json`. Nicht frei erfinden, sondern Werte daraus kopieren.
- **Themes wechseln** – In der Oberfläche das Dropdown „Farbschema“ benutzen. Bei Problemen kann im HTML-Tag `data-theme` angepasst werden.
- **Debug-Modus** – Häkchen „Debug aktivieren“ setzen. Dadurch werden sichtbare Linien und ausführliche Meldungen in der Konsole angezeigt.
- **Self-Repair** – Formular rechts ausfüllen, Bereich wählen und starten. Das System zeigt sofort, ob alles geklappt hat (✅ oder ⚠️).
- **Logs** – Automatische Ablage in `logs/bootstrap.log`. Bei Fehlern zuerst dort nachlesen.
