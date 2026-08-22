# MANIFEST

## Projekt

`PROVOWARE ALL-IN 2026`

Freigegebene Produktversion: `0.2.0 – Module Contract & Registry`

Interne Entwicklungsstufe: `0.4.3 – Recovery Envelope · Journaled Multi-File Restore & Rollback`

Verträge:

- Modulvertrag: `1`
- Workspace-Vertrag: `1`
- Project-Data-Produktionsschema: `1`
- Data-Studio-PRO-Metadatenvertrag: `1`
- Recovery-Envelope-Format: `1`
- Workspace-Schlüssel: `provoware.allin.workspace.main.v1`
- Legacy-Recovery-Backup-Limit: `10`
- Recovery-Envelope-Limit: `10`
- zentraler Atomic-Writer: `scripts/atomic-file.mjs`
- Browser-E2E primär: `chromium`
- Browser-E2E alternativ: `firefox`
- HTML-Mirror: `1366 × 900 @ 0,5`

Produktversion, Workspace-Vertrag, Project-Data-Produktionsschema und Data-Studio-PRO-Metadatenvertrag ändern sich durch 0.4.3 nicht.

## Laufzeitstruktur

### Einstieg

- `index.html` – HTML-Einstieg
- `start.cmd` / `start.sh` – Plattform-Einstiege
- `scripts/start.mjs` – lokaler Server, Node-Prüfung, statische Auslieferung, API-Routing und Recovery-Journalprüfung vor `listen()`

### Oberfläche und Kern

- `assets/styles.css` – Basisdarstellung
- `assets/workspace-layout.css` – Workspace-Größen-/Resize-Darstellung
- `assets/project-data.css` – gemeinsame container-responsive Darstellung für Data Studio, PRO und Recovery
- `assets/app.js` – App-Initialisierung
- `assets/module-registry.js` – Modulvertrag und Lifecycle
- `modules/registry.js` – kanonischer Modulkatalog

### Aktive Fachmodule

| Modul | Version | Slot | Aufgabe |
| --- | --- | --- | --- |
| `development-notes` | `0.4.0` | `quickbar` | zeitgestempelte Schnellnotiz |
| `data-studio` | `0.4.0` | `details` | stabiler Vorlagen-/Datensatz-CRUD-Editor |
| `data-studio-pro` | `0.4.2` | `details` | Suche, Filter, Kategorien, Vorlagenbibliothek, Vorlagenexport, gespeicherte Ansichten |
| `data-studio-pro-bridge` | `0.4.2` | – | Navigation zum bestehenden CRUD-Editor und Revisionssynchronisierung |
| `data-recovery` | `0.4.3` | `details` | Legacy-Recovery, versionierter Recovery Envelope, Multi-Datei-Restore und Rollback |

## Gemeinsame Persistenzbasis – 0.4.2-H1

Zentrale Schicht:

`scripts/atomic-file.mjs`

Vertrag:

- Temp-Datei im selben Verzeichnis wie das Ziel
- exklusive Temp-Erzeugung mit `wx`
- Inhaltssynchronisierung über `FileHandle.sync()` vor Rename
- kein Datenverlust-Fallback `unlink(ziel) -> rename(temp,ziel)`
- fail-closed bei permanentem Replace-Fehler
- Cleanup-Fehler verdecken Primärfehler nicht
- fremde Temp-Dateien werden bei `EEXIST` nicht gelöscht
- begrenzte Windows-Retries ausschließlich für definierte transiente Fehler `EPERM`, `EACCES`, `EBUSY`

Diese Schicht wird von Project Data, Data Studio PRO und Recovery Envelope verwendet.

## Project Data – Produktionsdaten

Live-Datenbank:

`data/project-data.json`

Schema v1:

- `schemaVersion`
- `revision`
- `templates[]`
- `records[]`

Verantwortliche Schicht:

`scripts/project-data-service.mjs`

Schutz:

- serverseitige Vorlagen-/Datensatzvalidierung
- gemeinsamer Atomic-Writer
- zentrale serialisierte Mutationssperre
- Same-Origin-Schutz
- keine freie Serverpfadwahl aus Browserdaten
- Laufzeitdatenbank und Temp-Dateien aus Git ausgeschlossen
- statische Auslieferung der Datenbank blockiert
- beschädigte Live-Datei wird nicht still überschrieben

## Data Studio PRO – 0.4.2

### Ziel

Recherche und Organisation werden vom stabilen CRUD-Editor getrennt gehalten. `data-studio-pro` liest Project Data, speichert aber ausschließlich eigene Organisationsmetadaten.

### PRO-Runtime-Datei

`data/data-studio-pro.json`

Metadatenvertrag v1:

```text
schemaVersion
revision
categories[]
templateCategories[]
savedViews[]
```

Kategorie:

```text
id
name
createdAt
updatedAt
```

Vorlagenzuweisung:

```text
templateId
categoryId
```

Gespeicherte Ansicht:

```text
id
name
templateId | null
categoryId | null
query
sort
createdAt
updatedAt
```

Sortiermodi:

- `updated-desc`
- `updated-asc`
- `created-desc`
- `created-asc`

### PRO-Persistenzregeln

`scripts/data-studio-pro-service.mjs` verantwortet:

- Metadatenvertrag v1
- Kategorievalidierung und case-insensitive Eindeutigkeit
- Prüfung von Vorlagenreferenzen gegen die aktuelle Project-Data-Datenbank
- Prüfung von Kategorienreferenzen
- gespeicherte Ansichten
- Same-Origin-geschützte PRO-API
- Persistenz über `scripts/atomic-file.mjs`

PRO verwendet dieselbe exportierte `withMutationLock()`-Sperre wie CRUD und Recovery. Dadurch schreibt keine zweite lokale Mutationsschiene parallel an den projektgebundenen Datenstrukturen vorbei.

Ein Fehler vor Rename entfernt die eigene Temp-Datei und lässt den vorherigen PRO-Bestand bytegenau unverändert.

### PRO-Oberfläche

`modules/data-studio-pro/index.js` bietet:

- Datensatz-Volltextsuche über Feldbezeichnungen und sichtbare Werte
- Vorlagenfilter
- Kategorienfilter
- vier Sortiermodi
- Trefferzahl / Nulltrefferanzeige
- Vorlagenbibliothek
- Bibliothekssuche
- Bibliotheks-Kategorienfilter
- Kategorien anlegen/löschen
- Vorlage einer Kategorie zuweisen oder lösen
- gespeicherte Ansicht anlegen/anwenden/löschen
- Vorlagenexport

`modules/data-studio-pro-bridge/index.js` bietet bewusst nur Integration:

- PRO-Treffer im bestehenden CRUD-Editor öffnen
- PRO-Vorlagen im bestehenden Editor auswählen
- gerenderte Data-Studio-Revision beobachten
- nach einer echten CRUD-Revision `provoware:data-studio-refreshed` auslösen

Die Bridge enthält keine eigene API-/CRUD-Persistenz.

### Vorlagenexport-Vertrag

Formatkennung:

`provoware-data-studio-template`

Formatversion:

`1`

Enthalten:

- `exportedAt`
- optionale Kategoriebezeichnung
- Vorlagen-Schemaversion
- Name
- Beschreibung
- Felddefinitionen mit IDs, Labels, Typ, Pflichtstatus und Auswahlwerten

Nicht enthalten:

- keine Datensätze
- keine PRO-Ansichten
- keine frei wählbaren Serverpfade

### PRO-API

- `GET /api/provoware/data-studio-pro`
- `POST /api/provoware/data-studio-pro/categories`
- `DELETE /api/provoware/data-studio-pro/categories/:id`
- `PUT /api/provoware/data-studio-pro/template-categories/:templateId`
- `POST /api/provoware/data-studio-pro/saved-views`
- `DELETE /api/provoware/data-studio-pro/saved-views/:id`

Schreibzugriffe sind Same-Origin-gebunden und besitzen eine feste Payload-Obergrenze.

### Runtime-Schutz

- `data/data-studio-pro.json` aus Git ausgeschlossen
- `data/data-studio-pro.json.tmp-*` aus Git ausgeschlossen
- statische Auslieferung beider Pfade blockiert
- beide Pfade aus `npm run fix` / Quellcode-Walk ausgeschlossen
- `localStorage` und `sessionStorage` für PRO durch Projekt-Linter verboten
- direkter `file://`-Start deaktiviert PRO-Schreib-/Suchbedienung kontrolliert

## Legacy Recovery – 0.4.1

Recovery-Backups:

`data/backups/project-data/*.pwbak`

`scripts/project-data-recovery.mjs` verantwortet:

- Backup und Rotation
- Backup-Liste und Restore-Vorschau
- SHA-256-Fingerprints
- Sicherheitsbackup vor Restore/Import
- Restore
- JSON-Export/-Import
- Erhalt beschädigter Live-Rohbytes
- deterministische Migrationsplanung

Restore-/Import-Vertrag:

```text
Vorschau
-> SHA-256-Bindung
-> explizite Bestätigung
-> Sicherheitsbackup
-> atomarer Ersatz
```

Produktionsziel bleibt Project-Data-Schema `1`. `v1 -> v2` existiert weiterhin nur als isolierte Testfixture.

### Unveränderte Legacy-Grenze

Das bestehende `.pwbak`-Format aus 0.4.1 sichert **nur** `data/project-data.json`. Alte `.pwbak`-Dateien werden durch 0.4.3 nicht umgeschrieben oder als Zwei-Komponenten-Sicherung interpretiert.

## Recovery Envelope – 0.4.3

Verantwortliche Schicht:

`scripts/recovery-envelope.mjs`

Ablage:

`data/backups/project-envelope/*.pwenvelope`

Journal:

`data/recovery/recovery-envelope-journal.json`

Formatkennung:

`provoware-recovery-envelope`

Formatversion:

`1`

Komponenten:

- `project-data`
- `data-studio-pro`

Pro Komponente werden gespeichert:

- Rohbytes als Base64
- SHA-256
- Byte-Länge
- Zustand
- bei erfolgreicher Validierung Schema-/Zusammenfassungsmetadaten

Zusätzlich wird der kanonische Envelope-Payload mit einer eigenen Gesamt-SHA gebunden. Fehlende oder beschädigte Komponenten werden als solche erhalten und nicht still normalisiert.

### Multi-Datei-Restore

Der normale Restore ist nur für vollständig restorable Envelopes freigegeben und folgt:

```text
Envelope-Vorschau
-> erwartete Envelope-SHA
-> Safety-Envelope
-> Journal PREPARED
-> Project Data atomar ersetzen
-> Journal fortschreiben
-> Data Studio PRO atomar ersetzen
-> Journal fortschreiben
-> beide Live-Komponenten per SHA verifizieren
-> COMMITTED
-> Journal entfernen
```

Fehler lösen einen Rollback beider Komponenten aus dem Safety-Envelope aus. Der Rollback wird ebenfalls verifiziert. Kann er nicht vollständig abgeschlossen werden, bleibt das Journal erhalten.

### Wiederanlauf

`scripts/start.mjs` prüft ein offenes Recovery-Envelope-Journal **vor** dem Öffnen des lokalen Serverports. Ein deterministisch reparierbarer Zustand wird aus dem Safety-Envelope zurückgeführt. Ein nicht sicher auflösbarer Zustand darf den normalen Serverstart nicht still fortsetzen.

### Envelope-API

Envelope-Routen werden vor dem Legacy-Recovery-Router behandelt.

- `GET /api/provoware/project-data/recovery/envelopes`
- `POST /api/provoware/project-data/recovery/envelopes`
- `POST /api/provoware/project-data/recovery/envelopes/preview`
- `POST /api/provoware/project-data/recovery/envelopes/restore`
- `GET /api/provoware/project-data/recovery/envelopes/journal`

Schreibzugriffe bleiben Same-Origin-gebunden.

### Envelope-Schutz

- Envelope-Verzeichnis aus Git ausgeschlossen
- Journalpfad aus Git ausgeschlossen
- Envelope-/Journal-Temp-Dateien aus Git ausgeschlossen
- statische Direktauslieferung blockiert
- Pfade aus Auto-Fix / Quellcode-Walk ausgeschlossen
- feste IDs und Serverpfade, keine freie Browser-Pfadwahl
- manipulierte Envelope-Prüfsummen werden vor Vorschau/Restore verworfen

## Bestehende Project-Data-API

- `POST /api/provoware/development-notes`
- `GET /api/provoware/project-data`
- `POST /api/provoware/project-data/templates`
- `PUT /api/provoware/project-data/templates/:id`
- `POST /api/provoware/project-data/records`
- `PUT /api/provoware/project-data/records/:id`
- `DELETE /api/provoware/project-data/records/:id`

Legacy Recovery:

- `GET /api/provoware/project-data/recovery/backups`
- `POST /api/provoware/project-data/recovery/backups`
- `POST /api/provoware/project-data/recovery/preview-backup`
- `POST /api/provoware/project-data/recovery/restore`
- `GET /api/provoware/project-data/recovery/export`
- `POST /api/provoware/project-data/recovery/preview-import`
- `POST /api/provoware/project-data/recovery/import`

## `file://`-Vertrag

Direkter Start über `index.html` bleibt möglich.

Verfügbar:

- Workspace
- statische Oberfläche
- Modulinitialisierung

Kontrolliert deaktiviert:

- Entwicklungsnotiz schreiben
- Data-Studio-Mutationen
- Data-Studio-PRO-API-Funktionen
- Legacy-Recovery-Aktionen
- Recovery-Envelope-Aktionen

Nutzerhinweise verweisen auf den lokalen Klick-&-Start-Server.

## Container-responsive UI-Vertrag

`.data-studio` ist ein Inline-Size-Container.

Regeln:

- Standard: einspaltig
- Feldzeilen/PRO-Filter ab `520px` Containerbreite verdichtet
- Hauptkarten ab `760px` Containerbreite zweispaltig
- Controls besitzen `scroll-margin-top: 84px`

Damit reagieren Data Studio, Data Studio PRO und Recovery auf ihre reale Fachmodulbreite und nicht nur auf den Browserviewport.

## Chromium-first Browser-E2E

Primärprojekt:

`chromium`

Optional:

`firefox`

Playwright:

`1.62.1` exakt als Dev-Abhängigkeit gepinnt.

Browser-Testserver:

`scripts/browser-e2e-server.mjs`

Der Testserver kopiert das Repository in ein temporäres Verzeichnis und startet den lokalen Server dort. Echte Arbeitsdaten werden dadurch nicht verändert.

### Chromium-Test 1 – CRUD / Legacy Recovery

```text
Notiz
-> Datei
-> Vorlage
-> Datensatz
-> Reload
-> Edit
-> Backup
-> Änderung
-> Restore
-> Export
-> Delete
-> Import
```

### Chromium-Test 2 – Data Studio PRO

```text
Vorlage
-> zwei Datensätze
-> Kategorie
-> Kategoriezuweisung
-> Bibliotheksfilter
-> Volltextsuche
-> gespeicherte Ansicht
-> Filter ändern
-> Ansicht anwenden
-> Vorlagenexport
-> Reload
-> gespeicherte Ansicht erneut anwenden
```

### Chromium-Test 3 – Recovery Envelope

```text
Project Data + PRO Ausgangszustand
-> gemeinsamen Envelope erstellen
-> Project Data verändern
-> PRO verändern
-> Envelope-Vorschau
-> gemeinsamer Restore
-> Reload
-> beide Ausgangszustände verifizieren
-> Journal muss leer sein
```

### Chromium-Test 4 – HTML Mirror

- Referenz lädt echte `/index.html`
- Spiegel lädt dieselbe echte `/index.html`
- intern jeweils `1366 × 900`
- Spiegel außen `scale(0.5)`
- sichtbar `683 × 450`
- wartet auf fertige Data-Studio-, PRO- und Recovery-Zustände
- verlangt mehrere stabile Geometriemessungen
- Schlüsselgeometrie muss identisch sein
- `.data-studio-pro` und `.data-recovery` sind Teil des Geometrievergleichs
- Abweichungen werden als `geometryDifferences` berichtet

## Evidenzartefakte

Finale 0.4.3-Chromium-Evidenz enthält 11 Dateien, darunter:

- `01-start.png`
- `02-record-created.png`
- `03-restored.png`
- `04-import-restored.png`
- `05-ui-mirror-pipeline.png`
- `06-ui-mirror-scaled.png`
- `07-data-studio-pro.png`
- `08-recovery-envelope-restored.png`
- `project-data-export.json`
- `data-studio-template-export.json`
- Playwright-Report

Finaler vollständig grüner 0.4.3-Artefaktlauf:

- Artifact ID `9481363211`
- SHA-256 `a4e897f6a594fd126d9c19f5a72bb2416a5b0f7de14ec1ab285afbb231839566`

## Qualitätskette

Kanonische Befehle:

```bash
npm run lint
npm run fix
npm run verify
```

`verify`:

```text
PROJECT LINT
-> QUALITY GATE
-> NODE TEST RUNNER
```

GitHub Actions führt den Core-Gate auf Node 20 und Node 24 aus.

Zusätzlich existiert `Persistence Portability Gate` auf Ubuntu und Windows mit Node 20. Browser-E2E ist ein getrennter Chromium-Gate.

### 0.4.3-Testgruppen

- `tests/recovery-envelope.test.mjs`
- `tests/recovery-envelope-api.test.mjs`
- erweiterte `tests/project-data-recovery-ui.test.mjs`
- erweiterte `tests/project-data-api.test.mjs`
- erweiterte `tests/persistence-portability-contract.test.mjs`
- erweiterte `tests/browser-e2e-contract.test.mjs`
- erweiterte `tests/browser/project-data.e2e.spec.mjs`

Zusätzlich bleiben sämtliche bestehenden Project-Data-, Data-Studio-PRO-, Legacy-Recovery-, Workspace-, Registry-, Start-, Lint- und E2E-Regressionen aktiv.

### Finaler vollständig grüner 0.4.3-Gate-Stand

- Node 20: PASS
- Node 24: PASS
- Project Lint: `49` JavaScript-Dateien
- Quality Gate: `118` Projektdateien
- Node-Test-Suite: `131/131` PASS
- Ubuntu Persistence Portability: PASS
- Windows Persistence Portability: PASS
- Chromium: `4/4` PASS
- Firefox automatisch: SKIPPED wie vorgesehen
- HTML-Mirror: PASS, `geometryDifferences: []`

## Entwicklungsdokumente

Project Data / Legacy Recovery:

- `docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md`
- `docs/PLAN_0.4.1_RECOVERY_MIGRATION.md`
- `docs/CHECKPOINT_0.4.1_RECOVERY_MIGRATION.md`
- `docs/CHECKLIST_0.4.1_RECOVERY_MIGRATION.md`

Browser E2E:

- `docs/PLAN_0.4.1_BROWSER_E2E_HTML_MIRROR.md`
- `docs/CHECKPOINT_0.4.1_BROWSER_E2E_HTML_MIRROR.md`
- `docs/CHECKLIST_0.4.1_BROWSER_E2E_HTML_MIRROR.md`

Data Studio PRO:

- `docs/PLAN_0.4.2_DATA_STUDIO_PRO.md`
- `docs/CHECKPOINT_0.4.2_DATA_STUDIO_PRO.md`
- `docs/CHECKLIST_0.4.2_DATA_STUDIO_PRO.md`

Recovery Envelope:

- `docs/PLAN_0.4.3_RECOVERY_ENVELOPE.md`
- `docs/CHECKPOINT_0.4.3_RECOVERY_ENVELOPE.md`
- `docs/CHECKLIST_0.4.3_RECOVERY_ENVELOPE.md`

## Bewusst offen nach 0.4.3

- verpflichtender echter Windows-Chromium-Browserlauf als eigener Release-Hardening-Schritt
- portabler Recovery-Envelope-Export/-Import mit eigenem Vorschau-, Konflikt- und Identitätsvertrag
- relationale Feldtypen
- Template-Import mit Konflikt-/ID-Vertrag
- SQLite nur bei nachgewiesenem Bedarf
- Pointer-/Touch-Workspace D3b
- reale Project-Data-Schema-v2-Migration erst bei fachlichem Bedarf
