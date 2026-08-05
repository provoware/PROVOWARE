# PROVOWARE Entwicklungsplan-Assistent

## Projektstatus

Das Repository enthält einen startbaren, vollständig lokalen HTML-Prototyp mit datengetriebenem Fragenworkflow, versionierter IndexedDB, mehreren unabhängig verwalteten Projekten, sicherem Projekttransfer, grafischer Speicherverwaltung, schrittweiser Projektschema-Migration und formatneutralem Berichtsgenerator.

**Version:** 0.8.0  
**Phase:** belastbarer P1-Prototyp  
**Zielplattform:** aktuelle Chromium- und Firefox-Browser unter Linux

## Start

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen. Dieser Modus lädt die getrennten JSON-Kataloge und erlaubt reguläre IndexedDB-Speicherung.

`index.html` kann alternativ direkt geöffnet werden. Blockiert der Browser getrennte JSON-Dateien unter `file://`, verwendet die Oberfläche sichtbar den eingebauten Beispieldatensatz. Es werden keine Daten ins Internet übertragen.

## Aktueller Funktionsumfang

- sechs mehrschichtig erklärte Entwicklungsfragen in vier Phasen
- Empfehlungsschaltfläche, Fortschritt und Live-Zusammenfassung
- Konflikterkennung für widersprüchliche Entscheidungen
- vollständige Mehrprojektverwaltung
- sicherer Projekt-JSON-Export und Import-Assistent
- reine Importvorschau vor jeder dauerhaften Änderung
- versionierte IndexedDB mit getrennten Projektständen und Snapshots
- grafische Snapshot-Liste, Vorschau und kontrollierte Wiederherstellung
- Aufbewahrungsgrenze mit Schutz des letzten gültigen Sicherheitsstands
- schrittweise Migration `1.0.0 → 1.1.0 → 1.2.0`
- Berichtsmodell mit Markdown-, Offline-HTML-, TXT- und JSON-Ausgabe
- zentrale Dialog-, Fokus-, Escape- und Pfeiltastennavigation
- automatisierte Barrierefreiheits-Grundprüfung
- reproduzierbare Quota-, Abbruch- und beschädigte-Snapshot-Szenarien
- schnelle GitHub-Actions-CI für Struktur, Schemata, Unit-Tests und JavaScript-Syntax

## Mehrprojektverwaltung

Über **„Projekte verwalten“** können mehrere Projekte parallel und vollständig getrennt geführt werden.

Unterstützt werden:

- Projektübersicht mit Suche und Statusfilter
- neues leeres Projekt
- bestehendes Projekt öffnen
- Projekt umbenennen
- Projekt mit neuer ID duplizieren
- Projekt archivieren
- Projekt in den Papierkorb verschieben
- Projekt aus Archiv oder Papierkorb wiederherstellen
- Projekt endgültig löschen

Jedes Projekt besitzt eine eindeutige ID, eigene Revisionen, eigene Snapshots, eigene Aufbewahrung, eigene Protokolle und eigene Berichte. Beim Projektwechsel werden ausstehende Änderungen des bisherigen Projekts zuerst seriell abgeschlossen.

## Projekt sichern oder importieren

Über **„Projekt sichern oder importieren“** kann der aktuelle Stand als eigenständiges JSON-Paket gespeichert und später wieder eingelesen werden.

### Exportpaket

Das Paketschema `1.0.0` enthält:

- Anwendungsversion
- Exportzeitpunkt
- ursprüngliche Projekt-ID und Projektname
- ursprüngliche Revision und Lebenszyklusstatus
- Projektschema und Fragenkatalogversion
- vollständigen Projektstand
- Paketprüfsumme

Die Prüfsumme erkennt versehentliche Veränderungen und Beschädigungen. Sie ist keine kryptografische Signatur und kein Nachweis für einen vertrauenswürdigen Urheber. Importierte Inhalte werden deshalb zusätzlich strukturell und fachlich validiert und niemals als ausführbarer Code behandelt.

### Reine Importvorschau

Eine ausgewählte Datei wird zunächst ausschließlich lokal gelesen. Vor einer Speicherung prüft die Anwendung:

1. Dateigröße bis maximal zwei MiB,
2. gültiges JSON,
3. Paketschema `1.0.0`,
4. Paketprüfsumme,
5. Ausgangs- und Zielversion des Projektschemas,
6. erforderliche Migrationsschritte,
7. Projekt-ID und Projektname,
8. bekannte Frage-IDs,
9. zulässige Antwortwerte,
10. bestehendes lokales Projekt mit gleicher ID,
11. geänderte Grundfelder,
12. hinzugefügte, entfernte und abweichende Antworten,
13. Anzahl echter Konflikte,
14. Lebenszyklusstatus des vorhandenen Projekts.

Fehlerhafte Pakete, unbekannte Fragen, ungültige Antworten und manipulierte Prüfsummen bleiben blockiert.

### Importarten

| Importart | Verhalten |
|---|---|
| Projekt-ID beibehalten | nur verfügbar, wenn die ID lokal frei ist |
| Als neues Projekt importieren | erzeugt eine neue ID; vorhandene Projekte bleiben unverändert |
| Vorhandenes Projekt ersetzen | nur für ein aktives Projekt; mit exaktem Namen, separater Bestätigung und Vorher-Sicherung |

Bei einer ID-Kollision ist **„Als neues Projekt importieren“** die sichere Standardempfehlung. Archiv- und Papierkorbprojekte können nicht ersetzt werden.

Vor dem bewussten Ersetzen wird der unveränderte lokale Stand als neue Revision mit dem Grund `pre-import-backup` gespeichert. Scheitert die anschließende Übernahme, bleibt der bisherige Projektstand verwendbar.

## Tastatur und Dialoge

Alle Hauptdialoge verwenden eine gemeinsame Zugänglichkeitsschicht:

- Fokus bleibt im obersten geöffneten Dialog.
- Tab und Umschalt+Tab laufen zyklisch durch bedienbare Elemente.
- Escape schließt zuerst eine offene Unteraktion und danach den Dialog.
- Nach dem Schließen kehrt der Fokus zum tatsächlichen Auslöser zurück.
- Pfeiltasten navigieren markierte Projekt-, Snapshot- und Aktionslisten.
- Home und Ende springen zum ersten beziehungsweise letzten Eintrag.

Die automatisierte Grundprüfung kontrolliert unter anderem doppelte IDs, unbenannte Schaltflächen, unbeschriftete Formularfelder, fehlerhafte Dialogtitel, positive `tabindex`-Werte und fehlende Bildalternativen. Sie ersetzt keine reale Prüfung mit Orca, NVDA oder VoiceOver.

## Berichte

Über **„Bericht prüfen und exportieren“** wird aus dem aktuell geöffneten Projekt ein gemeinsames Berichtsmodell erzeugt. Projekt-ID, Revision, Anforderungen, Risiken, Tests und Abnahmekriterien gehören damit immer exakt zu diesem Projekt.

Ausgaben:

- Markdown
- eigenständiges Offline-HTML
- TXT
- JSON

## Prüfungen

```bash
python3 -m pip install -r requirements.txt
python3 scripts/validate.py
pytest -q
python3 tests/smoke/run_browser_smoke.py
python3 tests/smoke/run_project_management_smoke.py
python3 tests/smoke/run_transfer_accessibility_smoke.py
python3 tests/smoke/run_storage_failure_smoke.py
```

Komplett einschließlich aller Browsergruppen:

```bash
python3 scripts/validate.py --browser
```

Der Transfer-/A11y-Smoke prüft auf Desktop und Mobil praktisch:

- Barrierefreiheits-Grundprüfung ohne Fehler
- Fokus im obersten Dialog
- Pfeiltastennavigation
- zweistufige Escape-Hierarchie
- Rückkehr zum tatsächlichen Auslöser
- Tab-Fokusfalle
- blockierte manipulierte Prüfsumme
- Projekt-ID-Kollision und Konfliktvorschau
- sicheren Standard mit neuer Projekt-ID
- doppelte Bestätigung vor dem Ersetzen
- geprüfte Projektübernahme
- fehlendes horizontales Überlaufen

## Datenschutz und Offline-Betrieb

Der Anwendungskern enthält keine CDN-, Cloud- oder Netzpflicht. Projektstände, Importprüfung und Berichte bleiben lokal im Browser. JSON-Dateien werden nur nach ausdrücklicher Dateiauswahl gelesen.

## Nächster Schritt

Eine datengetriebene Projektvorlagen- und Profilverwaltung entwickeln. Vorlagen sollen vollständige Antwortsets, empfohlene Regeln, Architekturvorschläge, Ordnerstrukturen und Berichtsvorgaben als sicher prüfbare neue Projekte bereitstellen.
