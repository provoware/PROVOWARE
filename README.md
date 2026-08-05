# PROVOWARE Entwicklungsplan-Assistent

## Projektstatus

Das Repository enthält einen startbaren, vollständig lokalen HTML-Prototyp mit datengetriebenem Fragenworkflow, versionierter IndexedDB, mehreren unabhängig verwalteten Projekten, sicherem Projekttransfer, geprüften Projektvorlagen, lokaler Profilverwaltung, grafischer Speicherverwaltung, schrittweiser Projektschema-Migration und formatneutralem Berichtsgenerator.

**Version:** 0.8.0  
**Entwicklungsstand:** 0.8.0 plus unveröffentlichte Vorlagen-/Profilerweiterung  
**Phase:** belastbarer P1-Prototyp  
**Zielplattform:** aktuelle Chromium- und Firefox-Browser unter Linux

## Start

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen. Dieser Modus lädt die getrennten JSON-Kataloge und erlaubt reguläre IndexedDB-Speicherung.

`index.html` kann alternativ direkt geöffnet werden. Blockiert der Browser getrennte JSON-Dateien unter `file://`, verwendet die Oberfläche sichtbare lokale Fallbackdaten. Es werden keine Daten ins Internet übertragen.

## Aktueller Funktionsumfang

- sechs mehrschichtig erklärte Entwicklungsfragen in vier Phasen
- Empfehlungsschaltfläche, Fortschritt und Live-Zusammenfassung
- Konflikterkennung für widersprüchliche Entscheidungen
- vollständige Mehrprojektverwaltung
- sicherer Projekt-JSON-Export und Import-Assistent
- reine Importvorschau vor jeder dauerhaften Änderung
- sechs datengetriebene Projektvorlagen mit insgesamt 18 vollständigen Profilen
- Vorschau aller Antwortunterschiede und tatsächlich ausgelösten Regeln
- Architektur-, Ordner-, Berichts-, Qualitäts-, Meilenstein- und Sonderfallvorgaben
- lokale eigene Profile mit Export, Import, Duplikat und sicherer Löschung
- versionierte IndexedDB mit getrennten Projektständen und Snapshots
- grafische Snapshot-Liste, Vorschau und kontrollierte Wiederherstellung
- Aufbewahrungsgrenze mit Schutz des letzten gültigen Sicherheitsstands
- schrittweise Migration `1.0.0 → 1.1.0 → 1.2.0`
- Berichtsmodell mit Markdown-, Offline-HTML-, TXT- und JSON-Ausgabe
- zentrale Dialog-, Fokus-, Escape- und Pfeiltastennavigation
- automatisierte Barrierefreiheits-Grundprüfung
- reproduzierbare Quota-, Abbruch- und beschädigte-Snapshot-Szenarien

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

## Vorlagen und Profile

Über **„Vorlagen und Profile“** stehen sechs Projektarten mit je drei Profilen bereit:

| Projektart | Profile |
|---|---:|
| Offline-HTML-Werkzeug | 3 |
| Linux-Desktop-Anwendung | 3 |
| Medienverarbeitung | 3 |
| Dateiorganisation | 3 |
| Songwriting und Audio | 3 |
| Mobile PWA | 3 |

Jedes Profil enthält genau eine gültige Antwort für jede Pflichtfrage sowie erwartete Regeln, Architekturvorschläge, Ordnerstruktur, Berichtsvorgaben, Qualitätsgates, Meilensteine und Sonderfälle.

### Pflichtvorschau

Vor der Projektanlage zeigt die Oberfläche:

1. alle Profilantworten,
2. die Werte des aktuellen Projekts,
3. unveränderte und abweichende Werte,
4. alle tatsächlich ausgelösten Regeln,
5. kritische Konflikte,
6. Architektur und Ordnerstruktur,
7. Berichtsvorgaben,
8. Qualitätsgates, Meilensteine und Sonderfälle.

Die Anlage bleibt gesperrt, bis die Vorschau bestätigt wurde. Kritische Regeln benötigen eine zweite ausdrückliche Bestätigung. Direkt vor der Speicherung werden Profil und Vorschaufingerabdruck erneut geprüft.

### Unabhängiges Vorlagenprojekt

Ein Projekt aus einer Vorlage erhält:

- eine neue Projekt-ID,
- Revision 1,
- das vollständige Antwortset,
- eigene Snapshots und Berichte,
- getrennte Herkunftsmetadaten.

Das aktuell geöffnete Projekt wird nicht überschrieben.

### Eigene Profile

Ein vollständig beantwortetes Projekt kann als eigenes Profil gespeichert werden. Eigene Profile lassen sich umbenennen, duplizieren, exportieren, importieren und nach separater Bestätigung löschen. Integrierte Profile sind schreibgeschützt.

Ausführliche Dokumentation: `docs/VORLAGEN_PROFILE.md`.

## Projekt sichern oder importieren

Über **„Projekt sichern oder importieren“** kann der aktuelle Stand als eigenständiges JSON-Paket gespeichert und später wieder eingelesen werden.

Vor der Speicherung prüft die Anwendung Dateigröße, JSON, Paketschema, Prüfsumme, Projektschema, Migration, Projekt-ID, Fragen, Werte, bestehende Projekte und Konflikte. Bei einer ID-Kollision ist **„Als neues Projekt importieren“** die sichere Standardempfehlung.

Vor dem bewussten Ersetzen wird der unveränderte lokale Stand als Revision `pre-import-backup` gespeichert. Archiv- und Papierkorbprojekte können nicht ersetzt werden. Hat sich die lokale Revision seit der Vorschau verändert, wird das Ersetzen blockiert.

Die bestehende kompakte Prüfsumme erkennt unbeabsichtigte Änderungen. Sie ist keine kryptografische Signatur oder Herkunftsbestätigung.

## Tastatur und Dialoge

- Fokus bleibt im obersten geöffneten Dialog.
- Tab und Umschalt+Tab laufen zyklisch durch bedienbare Elemente.
- Escape schließt zuerst eine offene Unteraktion und danach den Dialog.
- Nach dem Schließen kehrt der Fokus zum tatsächlichen Auslöser zurück.
- Pfeiltasten navigieren markierte Projekt-, Snapshot- und Aktionslisten.
- Der Profilimport ist mit Enter oder Leertaste erreichbar.

Die automatisierte Grundprüfung ersetzt keine reale Prüfung mit Orca, NVDA oder VoiceOver.

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
python3 tests/smoke/run_template_profile_smoke.py
python3 tests/smoke/run_storage_failure_smoke.py
```

Der Vorlagen-/Profil-Smoke prüft auf Desktop und Mobil:

- 18 integrierte Profile
- vollständige Antwort- und Wirkungsvorschau
- Architektur, Ordnerstruktur und Berichtsvorgaben
- gesperrte Anlage bis zur Bestätigung
- unabhängige Projekt-ID und vollständige Antworten
- eigenes Profil speichern, umbenennen, duplizieren und löschen
- kritische Regelerkennung
- fehlendes horizontales Überlaufen

## Datenschutz und Offline-Betrieb

Der Anwendungskern enthält keine CDN-, Cloud- oder Netzpflicht. Projektstände, Vorlagenprüfung, Profile, Importprüfung und Berichte bleiben lokal im Browser. Dateien werden nur nach ausdrücklicher Dateiauswahl gelesen.

## Nächster Schritt

Projektpaketen zusätzlich einen kryptografischen SHA-256-Fingerabdruck und ein optional signierbares Manifest hinzufügen. Die bestehende kompakte Prüfsumme bleibt für schnelle lokale Beschädigungserkennung kompatibel erhalten.
