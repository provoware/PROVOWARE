# Projektvorlagen und Profile

## Zweck

Die Vorlagenverwaltung legt kein Projekt still im Hintergrund an. Jede Vorlage wird zuerst vollständig geprüft und als verständliche Vorschau dargestellt. Erst nach ausdrücklicher Bestätigung entsteht ein neues, unabhängiges Projekt.

## Integrierte Projektarten

| Projektart | Profile |
|---|---:|
| Offline-HTML-Werkzeug | 3 |
| Linux-Desktop-Anwendung | 3 |
| Medienverarbeitung | 3 |
| Dateiorganisation | 3 |
| Songwriting und Audio | 3 |
| Mobile PWA | 3 |

Insgesamt stehen 18 integrierte Profile bereit.

## Verbindlicher Profilinhalt

Jedes Profil enthält:

- genau eine gültige Antwort für jede Pflichtfrage
- die erwarteten Regel-IDs
- Architekturbausteine
- Ordnerstruktur
- Berichtstiefe, Formate und Abschnitte
- Qualitätsgates
- Meilensteine
- Sonder- und Fehlerfälle

Ein Profil wird blockiert, wenn eine Frage fehlt, eine unbekannte Frage vorkommt, ein Wert nicht im Fragenkatalog enthalten ist oder die behaupteten Regeln nicht mit dem tatsächlichen Regelkern übereinstimmen.

## Vorschau vor der Projektanlage

Die Vorschau zeigt:

1. alle Antworten des Profils,
2. den aktuellen Wert des geöffneten Projekts,
3. den Profilwert,
4. ob ein Wert unverändert bleibt oder im neuen Projekt anders gesetzt wird,
5. alle tatsächlich ausgelösten Regeln,
6. kritische Regelkonflikte,
7. Architekturvorschläge,
8. Ordnerstruktur,
9. Berichtsvorgaben,
10. Qualitätsgates,
11. Meilensteine,
12. Sonderfälle.

Die Projektanlage bleibt gesperrt, bis die Vorschau bestätigt wurde. Enthält das Profil eine kritische Regel, ist eine zweite ausdrückliche Bestätigung erforderlich.

Unmittelbar vor der Speicherung wird das Profil erneut validiert. Zusätzlich wird sein Fingerabdruck mit der angezeigten Vorschau verglichen. Wurde das Profil zwischen Vorschau und Übernahme verändert, wird die Projektanlage abgebrochen.

## Neues Projekt aus einem Profil

Ein Vorlagenprojekt erhält:

- eine neue eindeutige Projekt-ID,
- Revision 1,
- ein vollständiges Antwortset,
- eigene Snapshots,
- eigene Berichte,
- eigene künftige Änderungen,
- getrennte Vorlagenherkunftsmetadaten.

Das aktuell geöffnete Projekt wird nicht überschrieben oder zusammengeführt.

## Integrierte und eigene Profile

### Integrierte Profile

Integrierte Profile sind schreibgeschützt. Dadurch bleiben ihre geprüften Inhalte reproduzierbar.

### Eigene Profile

Ein vollständig beantwortetes Projekt kann als eigenes Profil gespeichert werden. Technische Vorgaben werden aus dem gerade ausgewählten Profil übernommen und anschließend erneut validiert.

Eigene Profile können:

- umbenannt,
- dupliziert,
- exportiert,
- importiert,
- endgültig gelöscht werden.

Das Löschen eines Profils verändert keine daraus entstandenen Projekte.

## Lokale Speicherung

Eigene Profile verwenden den vorhandenen IndexedDB-Metadaten-Store:

```text
meta
└── key = profile:<profileId>
    ├── type = template-profile
    ├── schemaVersion = 1.0.0
    ├── id
    ├── baseTemplateId
    ├── baseProfileId
    ├── createdAt
    ├── updatedAt
    └── profile
```

Die Herkunft eines Vorlagenprojekts wird getrennt gespeichert:

```text
meta
└── key = template-origin:<projectId>
    ├── templateId
    ├── profileId
    ├── profileFingerprint
    ├── architecture
    ├── folderTree
    ├── reportPreset
    ├── qualityGates
    ├── milestones
    └── specialCases
```

Das fachliche Projektschema `1.2.0` bleibt dadurch unverändert.

## Profilexport und -import

Profilpakete verwenden die Paketversion `1.0.0` und enthalten:

- Exportzeitpunkt,
- vollständiges Profil,
- kompakte Paketprüfsumme.

Vor dem Import werden geprüft:

- maximale Dateigröße von 512 KiB,
- gültiges JSON,
- unterstützte Paketversion,
- Prüfsumme,
- vollständige Fragen-IDs,
- Antwortwerte,
- Regelauswirkungen,
- technische Vorgaben.

Ein importiertes Profil erhält eine neue lokale Profil-ID und den sichtbaren Namenszusatz `– Import`.

Die kompakte Prüfsumme erkennt unbeabsichtigte Änderungen, ist aber keine kryptografische Signatur. Ein kryptografischer SHA-256-Fingerabdruck und ein optional signierbares Manifest bleiben ein eigener nächster Sicherheitsschritt.

## Datenmodule

Der Index `data/templates.json` enthält nur Metadaten und Modulpfade. Die vollständigen Profile liegen getrennt unter:

```text
data/template-profiles/
├── offline-html.js
├── linux-desktop.js
├── media-processing.js
├── file-organization.js
├── songwriting-audio.js
└── mobile-pwa.js
```

Der Unit-Vertrag prüft, dass Index, Dateien und tatsächliche Profilzahlen übereinstimmen.

## Prüfungen

```bash
pytest -q tests/unit/test_template_profiles.py
python3 tests/smoke/run_template_profile_smoke.py
```

Der Browser-Smoke prüft auf Desktop und Mobil:

- 18 integrierte Profile,
- vollständige Vorschau,
- sechs Antwortzeilen,
- Architektur, Ordnerstruktur und Berichtsvorgaben,
- gesperrte Projektanlage ohne Bestätigung,
- unabhängige Projekt-ID,
- vollständiges Antwortset,
- eigenes Profil speichern,
- umbenennen,
- duplizieren,
- Löschen mit Bestätigung,
- kritische Regelerkennung,
- fehlendes horizontales Überlaufen.

## Grenzen

- Die Releaseversion bleibt `0.8.0`, bis die gesamte Releasekette neu gebaut und abgenommen wurde.
- Der integrierte Fragenkatalog enthält derzeit sechs Pflichtfragen. Neue Fragen machen bestehende Profile bewusst ungültig, bis diese vollständig ergänzt wurden.
- Die automatische Prüfung ersetzt keine fachliche Entscheidung darüber, ob ein Profil tatsächlich zum geplanten Projekt passt.
