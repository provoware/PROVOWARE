# CHECKPOINT 0.4.0 – Project Data Studio

## Gesicherter Ausgangsstand

- Baseline: `6fd1123122cca0c69fd50bdbf69ef2186cc930d0`
- Ausgangsbranch: `main`
- Arbeitsbranch: `feat/0.4.0-project-data-studio`
- Produktversion vor Änderung: `0.2.0`
- Entwicklungsstand vor Änderung: `0.3.0-D3a`

## Unveränderte Verträge

- Modulvertrag bleibt Version `1`.
- Workspace-Vertrag bleibt Version `1`.
- bestehender Workspace-Storage-Key wird nicht verändert.
- `index.html` bleibt direkt über `file://` startbar.
- lokale Serverbindung bleibt auf `127.0.0.1` begrenzt.
- keine externen Laufzeitbibliotheken.

## Neue persistente Daten

- `data/ENTWICKLUNGSNOTIZEN.txt` – bewusst projektgebundene, sichtbare Entwicklungsnotizen.
- `data/project-data.json` – lokale Laufzeitdatenbank; wird nicht als Quellcodebasis benötigt und darf aus einer leeren Version-1-Struktur neu erzeugt werden.

## Sicherheitsgrenzen

- kein Browserparameter darf einen beliebigen Dateipfad bestimmen.
- Schreib-API akzeptiert ausschließlich JSON und begrenzte Payloads.
- Schreibzugriffe werden nur für definierte API-Routen erlaubt.
- JSON-Store wird atomar ersetzt; beschädigte bestehende Daten werden nicht automatisch überschrieben.
- Vorlagen- und Datensatz-IDs werden serverseitig erzeugt.

## Rollback

Vor Merge:

1. Feature-Branch löschen.
2. `main` bleibt bytegenau auf der bisherigen Funktionsbasis.

Nach Merge:

1. Merge-/Squash-Commit revertieren.
2. `data/project-data.json` separat sichern, falls reale Nutzerdaten entstanden sind.
3. Entwicklungsnotizdatei nur dann zurücksetzen, wenn die darin gespeicherten Notizen bewusst verworfen werden sollen.

## Abnahme-Checkpoint

Der Checkpoint gilt erst als abgeschlossen, wenn:

- neue Unit-/Regressionstests grün sind,
- bisherige Tests weiterhin grün sind,
- Quality Gate grün ist,
- Branch-Diff nur geplante Dateien enthält,
- GitHub Actions grün ist,
- README/TODO/CHANGELOG/MANIFEST/VERSION den realen Stand widerspiegeln.
