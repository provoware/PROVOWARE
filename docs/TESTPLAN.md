# Testplan

## L0 – bei jeder Daten- oder Strukturänderung

- erwartete Dateien vorhanden
- JSON parsebar
- IDs eindeutig
- Regelverweise gültig
- HTML-Verweise vorhanden
- JavaScript syntaktisch gültig, sofern Node.js verfügbar
- keine externen Laufzeitadressen

Befehl:

```bash
python3 scripts/validate.py
```

## L1 – betroffene Logik

- Frageempfehlungen verweisen auf existierende Optionen
- Regeln verwenden bekannte Frage-IDs
- Schemata akzeptieren gültige Prüfdaten

Befehl:

```bash
pytest -q tests/unit tests/integration
```

## L2 – repräsentativer Smoke-Test

- Seite öffnet ohne externen Netzwerkzugriff
- sechs Fragen sind erreichbar
- Fortschritt steigt nach Antworten
- Empfehlung kann übernommen werden
- Konflikt `offline + Cloud-Hauptspeicher` wird sichtbar
- Desktop- und Mobilansicht überlaufen nicht horizontal
- Tastaturfokus bleibt sichtbar

## Noch offen

Realer Browser-Smoke-Test, Screenreader-Test, IndexedDB-Fehlerfälle, Migrationen und Wiederherstellung.
