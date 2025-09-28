# Leicht verständliche Hinweise

- **Startroutine (bootstrap)** – Datei `scripts/bootstrap.sh` einfach im Terminal ausführen. Das Skript erledigt Formatierung, Tests und Barrierefreiheits-Check automatisch.
- **Design einhalten** – Alle Farben, Abstände und Schriftgrößen stehen in `design/manifest.json`. Nicht frei erfinden, sondern Werte daraus kopieren.
- **Themes wechseln** – In der Oberfläche das Dropdown „Farbschema“ benutzen. Bei Problemen kann im HTML-Tag `data-theme` angepasst werden.
- **Debug-Modus** – Häkchen „Debug aktivieren“ setzen. Dadurch werden sichtbare Linien und ausführliche Meldungen in der Konsole angezeigt.
- **Self-Repair** – Formular rechts ausfüllen, Bereich wählen und starten. Das System zeigt sofort, ob alles geklappt hat (✅ oder ⚠️).
- **Logs** – Automatische Ablage in `logs/bootstrap.log`. Bei Fehlern zuerst dort nachlesen.
