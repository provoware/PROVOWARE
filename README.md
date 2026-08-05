# PROVOWARE Entwicklungsplan-Assistent

## Projektstatus

Dieses Repository wurde am 5. August 2026 vollständig neu aufgesetzt. Frühere Dateien gehören nicht mehr zum aktiven Projektbaum und bleiben nur über die Git-Historie rekonstruierbar.

**Phase:** Planung und Architektur  
**Ziel:** vollständig offline nutzbares, laienoptimiertes HTML-Werkzeug  
**Grundsatz:** kleine, prüfbare und reversible Entwicklungsschritte

## Zweck

Das Projekt soll Nutzer schrittweise durch die Planung technischer Anwendungen führen. Antworten werden in Anforderungen, Risiken, Testfälle, Ordnerstrukturen, Architekturvorschläge und Entwicklungsberichte überführt.

## Verbindliche Grunddateien

| Datei | Zweck |
|---|---|
| `README.md` | Einstieg, Ziel, Status und Arbeitsweise |
| `TODO.md` | priorisierte offene Aufgaben und Abnahmepunkte |
| `CHANGELOG.md` | nachvollziehbarer Änderungsverlauf |
| `SCHWACHSTELLEN.md` | bekannte Risiken, technische Schulden und Gegenmaßnahmen |
| `AGENTS.md` | verbindliche Regeln für Entwickler und KI-Agenten |
| `UPGRADEPOOL.md` | geprüfte spätere Erweiterungen ohne Vermischung mit dem Kernumfang |
| `PROJEKTORDNERSTRUKTUR.md` | geplante Zielstruktur und Verantwortlichkeiten |
| `requirements.txt` | optionale Python-Werkzeuge für Prüfung und Entwicklung |

## Entwicklungsprinzipien

- offline-first; keine verpflichtenden Cloud- oder CDN-Abhängigkeiten
- datengetriebene Fragen-, Regel- und Berichtssysteme
- verständliche Hilfetexte mit Beispiel, Pro, Contra, Alternative und Empfehlung
- Vorvalidierung, Vorschau, sichere Ausführung und Nachprüfung
- Autospeicherung, Snapshots, Migration und Wiederherstellung
- Tastaturbedienung, sichtbarer Fokus und Screenreader-Beschriftungen
- keine zerstörerischen Änderungen ohne Sicherung oder nachvollziehbaren Commit

## Aktueller Umfang

Der aktive Repository-Stand enthält zunächst nur die Projektgrundlage. Programmcode, Tests, Datenkataloge und Release-Artefakte werden erst nach bestätigter Struktur in kleinen Iterationen ergänzt.

## Start

Noch keine ausführbare Anwendung vorhanden. Der erste technische Meilenstein ist in `TODO.md` beschrieben.

## Statusanzeige

- **Erledigt:** Repository bereinigt und Grunddokumentation angelegt
- **Offen:** Architekturgrundgerüst, Datenmodelle, Prototyp, Tests und Releaseprozess
- **Nächster Schritt:** Zielstruktur anlegen und minimalen Offline-Prototyp erstellen
