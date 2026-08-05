# PROVOWARE Entwicklungsplan-Assistent

## Projektstatus

Das Repository enthält jetzt einen kleinen, startbaren und vollständig lokalen HTML-Prototypen. Die Oberfläche, JavaScript-Logik, Datenkataloge und JSON-Schemata sind getrennt aufgebaut.

**Version:** 0.2.0 – Architekturprototyp  
**Ziel:** laienoptimierter Assistent für belastbare Entwicklungspläne  
**Grundsatz:** kleine, prüfbare und reversible Entwicklungsschritte

## Zweck

Das Tool führt Nutzer durch wichtige Projektentscheidungen. Jede Antwort kann später in Anforderungen, Risiken, Testfälle, Ordnerstrukturen und Entwicklungsberichte überführt werden.

## Schnellstart

### Empfohlen: lokaler Browserstart

```bash
python3 -m http.server 8080
```

Danach im Browser öffnen:

```text
http://localhost:8080
```

Damit werden die getrennten JSON-Datenkataloge direkt geladen.

### Direkter Offline-Start

`index.html` kann auch per Doppelklick geöffnet werden. Falls der Browser lokale JSON-Zugriffe blockiert, verwendet der Prototyp automatisch einen eingebauten, klar gekennzeichneten Beispieldatensatz. Es werden keine Daten ins Internet übertragen.

## Aktuell enthalten

- semantischer Header mit Fortschritt und Statusampel
- Workflow-Navigation mit vier Beispielphasen
- mehrschichtige Fragenkarte
- einfache Erklärungen, Beispiel, Pro, Contra, Alternative und Empfehlung
- Live-Zusammenfassung und offene Entscheidungen
- regelbasierte Hinweise und Konflikterkennung
- getrennte CSS-, JavaScript-, Daten- und Schemadateien
- Tastaturbedienung und sichtbarer Fokus
- lokale Validierungs-, Test-, Build- und Release-Skripte
- keine Cloud-, CDN- oder externen Laufzeitabhängigkeiten

## Projektstruktur

Die verbindliche Struktur steht in `PROJEKTORDNERSTRUKTUR.md`.

Wichtige Bereiche:

| Bereich | Zweck |
|---|---|
| `index.html` | semantische Grundoberfläche |
| `css/` | Design-Tokens, Layout, Komponenten und Themes |
| `js/` | Zustand, Workflow, Regeln, Validierung und UI |
| `data/` | versionierte Fragen, Regeln, Vorlagen und Prompts |
| `schemas/` | maschinenlesbare Datenverträge |
| `tests/` | Unit-, Integrations- und Smoke-Prüfungen |
| `scripts/` | Validierung, Build und Release |
| `docs/` | Architektur, Datenmodell, Testplan und Bedienhilfe |
| `dist/` | ausschließlich generierte Release-Ausgaben |

## Prüfung

Optionale Python-Werkzeuge installieren:

```bash
python3 -m pip install -r requirements.txt
```

Struktur, JSON, Schemata und Verweise prüfen:

```bash
python3 scripts/validate.py
```

Tests ausführen:

```bash
pytest -q
```

Modulares Ausgabepaket erzeugen:

```bash
python3 scripts/build.py
```

ZIP-Release erzeugen:

```bash
python3 scripts/release.py
```

## Entwicklungsprinzipien

- offline-first; keine verpflichtenden Cloud- oder CDN-Abhängigkeiten
- datengetriebene Fragen-, Regel- und Berichtssysteme
- verständliche Hilfetexte mit Beispiel, Pro, Contra, Alternative und Empfehlung
- Vorvalidierung, Vorschau, sichere Ausführung und Nachprüfung
- Tastaturbedienung, sichtbarer Fokus und Screenreader-Beschriftungen
- keine zerstörerischen Änderungen ohne Sicherung oder nachvollziehbaren Commit

## Statusanzeige

- **Erledigt:** Grundstruktur, Minimalprototyp, erste Datenkataloge, Schemata und lokale Prüfungen
- **Offen:** IndexedDB, vollständiger Berichtsgenerator, Projektverwaltung, Import und umfassende Barrierefreiheitsabnahme
- **Nächster Schritt:** lokale Projektpersistenz mit versioniertem IndexedDB-Schema entwickeln
