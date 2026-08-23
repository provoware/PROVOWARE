# Patchmanifest 0.4.4 – PROVOWARE Headquarter Dashboard & Media

## Zweck

Dieser Patch macht die bisher leere Übersicht zu einem nützlichen Headquarter-Dashboard und führt erstmals reale lokale Audio-/Video-Wiedergabe mit Sitzungs-Playlists ein. Gleichzeitig wird die Oberfläche über ein separates CSS-Overlay sichtbar heller und leuchtender, ohne die bestehende Basis-CSS umzubauen.

## Baseline

`818c4121324e1725d775fdacbde6a461e253c5a8`

## Produkt- und Vertragsstand

- freigegebene Produktversion bleibt `0.2.0`
- interne Entwicklungsphase: `0.4.4 Headquarter Dashboard & Media`
- Modulvertrag: Version `1`
- Workspace-Vertrag: Version `1`
- Project-Data-Schema: Version `1`
- Data-Studio-PRO-Schema: Version `1`
- Recovery-Envelope-Format: Version `1`
- keine Datenmigration
- keine neue Server-API
- keine neue persistente Browser-Datenquelle

## Neue Laufzeitdateien

### `modules/headquarter-dashboard/index.js`

Verantwortlich für:

- Dashboard in `#uebersicht`
- reale Tool-/Browserinformationen
- Laufzeit-/Modul-/Workspace-Statuslampen
- Audio-Sitzungsplaylist
- Video-Sitzungsplaylist
- lokale Dateien via Object URLs
- Vorher/Nächster, automatische Weiterschaltung und Leeren
- kontrollierte Fehlertexte bei Codec-/Formatproblemen
- vollständiges Freigeben erzeugter Object URLs bei Leeren, Deaktivieren oder Entfernen
- Logging im Bereich `HEADQUARTER`

### `assets/headquarter-dashboard.css`

Verantwortlich für:

- Dashboard-/Info-/Playerlayout
- statische Statusleuchten
- sichtbarere Cyan-/Blau-/Amber-Akzente
- zusätzliches statisches Leuchten auf bestehenden Oberflächen
- responsive Einspaltenansicht auf kleinen Viewports

Die Datei ist bewusst ein separates Overlay. `assets/styles.css` bleibt unverändert und kann durch Revert vollständig wieder alleinige Basis werden.

### `tests/headquarter-dashboard.test.mjs`

Prüft:

- genau ein Dashboard bei mehrfacher Aktivierung
- Audio- und Video-Player vorhanden
- echte Modul-/Workspace-/Browserwerte
- Direktstart ohne Versions-Fetch
- Audio-Playlist, Deduplizierung und `ended`-Weiterschaltung
- Video-Object-URL und verständlichen Codecfehler
- Freigabe aller Object URLs bei `dispose`
- statisches CSS ohne Daueranimation
- lokale CSS-Ladereihenfolge
- eindeutigen Registry-Eintrag

## Geänderte Dateien

### `modules/registry.js`

Neuer Modul-Steckbrief:

- ID `headquarter-dashboard`
- Version `0.4.4`
- Slot `overview`
- Fähigkeiten `runtime-dashboard`, `local-audio`, `local-video`, `session-playlist`

Der Eintrag steht nach den bestehenden Daten-/Recovery-Modulen, damit der Dashboard-Snapshot nach Möglichkeit bereits deren Laufzeitzustand sieht.

### `index.html`

Lädt `assets/headquarter-dashboard.css` lokal nach den vorhandenen Stylesheets. Es wird kein neues fest verdrahtetes Dashboard-Markup eingeführt; die UI bleibt Modulverantwortung.

### `VERSION.json`

Nur die interne Entwicklungsphase und Entwicklungsbaseline werden fortgeschrieben. Freigegebene Produktversion und alle bestehenden Daten-/Recovery-Verträge bleiben unverändert.

## Medienvertrag 0.4.4

### Funktionsumfang

- Nutzer wählt lokale Dateien über die Standard-Dateiauswahl des Browsers.
- Dateien werden nicht hochgeladen.
- Dateien werden nicht in Project Data, Data Studio PRO oder Recovery gespeichert.
- Browser erzeugt temporäre Object URLs.
- Playlist lebt nur in der aktuellen Seite/Sitzung.

### Warum zunächst nur Sitzung?

Dauerhaftes Speichern großer Video-/Audiodateien benötigt einen eigenen Vertrag für:

- expliziten Import
- Dateigrößenlimit
- Quota
- sichere Dateinamen
- Löschung
- Portabilität
- Backup/Recovery

0.4.4 täuscht deshalb keine dauerhafte Playlist vor und legt keine großen Blobs ungefragt in IndexedDB ab.

## Toolinformationen

Dashboard zeigt nur Werte, die real lesbar sind:

- Version/Entwicklungsphase, sofern `VERSION.json` lesbar ist
- Startmodus
- Modulstatus
- Workspace-Sichtbarkeit
- Viewport
- logische CPU-Threads des Browsers, sofern verfügbar
- groben Geräte-RAM-Hinweis, sofern verfügbar
- Browser-Speicherbelegung/-Kontingent, sofern verfügbar

Nicht angezeigt werden erfundene CPU-Auslastung, IO-Aktivität, Prozesslast oder exakte Betriebssystem-RAM-Belegung.

## Bewusst nicht enthalten

- keine dauerhaft gespeicherte Projekt-Mediathek
- kein Media-Upload zum lokalen Server
- keine Remote-Streams
- kein eigener Codec
- kein Audio-Equalizer
- kein Video-Editor
- keine neue Datenbank
- keine Änderung an Recovery
- keine Änderung an Data Studio
- keine Pointer-Resize-Implementierung
- kein Drag & Drop der Workspace-Panels

## D3b-Entscheidung aus Nutzervorgabe

Für den späteren getrennten Workspace-Patch ist Variante A bestätigt:

- `pointerdown` darf den Zeiger erfassen
- Resize-Vorschau startet erst nach ungefähr **4 px** realer Bewegung
- reiner Klick ohne Bewegung verändert keine Panelgröße

Diese Entscheidung wird in 0.4.4 nicht als Resize-Laufzeitcode umgesetzt.

## Erwartetes Änderungsvolumen

Einstufung: **mittel**.

Direkt betroffen:

- Übersicht/Dashboard
- Modulregistry
- Browser-Medienwiedergabe
- CSS-Darstellung
- automatische Tests
- Entwicklungsmetadaten

Nicht betroffen:

- Serverpersistenz
- Project-Data-/PRO-Schema
- Recovery-Dateien
- bestehende Backups
- Modulvertrag
- Workspace-Schema

## Validierung vor Merge

- Branch-Diff gegen aktuelles `main`
- Branch 0 Commits hinter `main`
- `npm run lint`
- `npm run verify`
- alle bestehenden Node-Tests grün
- neuer Headquarter-Test grün
- GitHub Quality Gate `success`
- nach Möglichkeit Chromium-E2E und HTML-Mirror
- PR mergebar
- zentrale Dateien nach Merge erneut auf `main` lesen

## Rückweg

Revert dieses Pull Requests entfernt Dashboard, Player, Licht-Overlay und Tests vollständig. Es gibt keine Datenmigration und keine neuen Laufzeitdaten, die separat zurückgebaut werden müssten.

## Nächste zwei Schritte

1. `0.4.5 Projekt-Mediathek` nur bei bestätigtem Bedarf an dauerhaft projektgebundenen Medien/Playlists.
2. `0.3.0-D3b Pointer Resize` mit bestätigter 4-px-Bewegungsschwelle als getrennten Workspace-Patch fortsetzen.
