# Status 0.4.4-H1 – Real Media Acceptance

## Entwicklungsstand

**Status: 🟢 technisch abgeschlossen und auf `main` gemergt.**

- technische Baseline: `d439ccf9881e9a6fe6f7f51007dbcb77ce31144f`
- technischer PR: `#90`
- Squash-Merge: `a768bd58233b8358a81caed9e96123ab4508bb91`
- freigegebene Produktversion: weiterhin `0.2.0`
- interne Entwicklungsphase: `0.4.4-H1 Real Media Acceptance`

## Umgesetzt

### Echte Testmedien

Es liegen zwei bewusst kleine, feste Testdateien im Repository:

- `tests/fixtures/media/test-tone.wav` – PCM-WAV
- `tests/fixtures/media/test-card.webm` – VP8-WebM

Sie dienen ausschließlich der reproduzierbaren Browserabnahme und werden nicht als Nutzer-Mediathek verwendet.

### Echter Chromium-Medientest

`tests/browser/headquarter-media.e2e.spec.mjs` prüft im realen Chromium-Prozess:

1. Headquarter-Dashboard wird geladen.
2. PCM-WAV wird über das echte Dateifeld ausgewählt.
3. Playlist zeigt `test-tone.wav`.
4. Audio-Metadaten werden vom Browser gelesen.
5. native Medienwiedergabe startet über `HTMLMediaElement.play()`.
6. reale `currentTime` schreitet voran.
7. VP8-WebM wird über das echte Videodateifeld ausgewählt.
8. Video-Metadaten, Breite und Höhe werden gelesen.
9. reale Video-Wiedergabezeit schreitet voran.
10. eine bewusst defekte `defekt.mp3` wird als Medieninhalt abgelehnt.
11. die vorhandene verständliche Format-/Codec-Meldung erscheint.
12. das Dashboard bleibt nach dem Fehler funktionsfähig.

Das Medienelement wird im automatischen Lauf stummgeschaltet, damit Chromium-Autoplay-Regeln den Decoder-Test nicht zufällig blockieren. Der Test prüft echte Browserdekodierung und Wiedergabe, aber keinen separaten Mausklick auf die grafischen nativen Playercontrols.

## Änderungsvolumen

Technischer PR `#90`:

- 6 geänderte Dateien
- 2 echte Binär-Fixtures
- 1 neuer Chromium-E2E-Test
- 1 neuer Node-Vertragstest
- 1 H1-Plan
- `VERSION.json` auf interne H1-Phase aktualisiert
- 204 Ergänzungen, 2 Entfernungen

Nicht verändert wurden:

- Headquarter-Laufzeitcode
- Audio-/Video-Playlistlogik
- Project-Data-Schema
- Data-Studio-PRO-Schema
- Recovery Envelope
- Atomic Writer
- Workspace-Vertrag
- Modulvertrag

## Betroffen

**Nutzerlaufzeit:** keine neue Produktionsfunktion; bestehende Player bleiben unverändert.

**Tests/Qualität:** deutlich stärker, weil Audio/Video jetzt mit echten Binärdateien und echter Browserdekodierung geprüft werden.

**Daten:** keine neue Nutzerpersistenz, keine Migration, keine Änderung vorhandener Backups.

## Validierung

### Core Quality Gate

Workflow Run `32609864766`:

- Node 20.20.2: **PASS**
- Node 24: **PASS**
- Project Lint: **53 JavaScript-Dateien**
- Quality Gate: **130 Projektdateien**
- Node-Tests: **141/141 PASS**
- Fehler: **0**

Die drei neuen H1-Vertragstests sind grün:

- echte PCM-WAV-Struktur und Größenlimit
- echte WebM-/EBML-Struktur und Größenlimit
- E2E-Vertrag enthält beide Fixtures, `play()`, `currentTime`, Videoabmessungen und Fehlerpfad

### Reale Browserabnahme

Workflow Run `32609864563`:

- Chromium: **5/5 PASS**
- neuer H1-Medientest: **PASS**
- CRUD-/Recovery-Kernkette: **PASS**
- Data Studio PRO: **PASS**
- Recovery Envelope: **PASS**
- HTML-Mirror: **PASS**
- Firefox: im automatischen Lauf gemäß Projektvertrag **übersprungen**

Ausgeführtes Chromium: Chrome for Testing `151.0.7922.34` über Playwright.

### Evidenz

- Browserartefakt: `9485201898`
- SHA-256: `4c0344c12fdf46f5998120ca66d92ceaf427ebb6bab50930ede071f5fdeea354`
- Größe: `16,913,377` Bytes
- enthaltene Dateien: `12`
- zusätzlicher Screenshot: `09-headquarter-real-media.png`

## Reale Aussage

Nach H1 ist für die getestete Chromium-Matrix nachgewiesen:

- **PCM-WAV kann real geladen, dekodiert und abgespielt werden.**
- **VP8-WebM kann real geladen, dekodiert und abgespielt werden.**
- **Playlist-Dateiauswahl funktioniert im realen Browser.**
- **ungültiger Medieninhalt wird kontrolliert behandelt.**

Nicht pauschal nachgewiesen sind:

- jedes MP3-Profil,
- jedes MP4/H.264-Profil,
- MOV-/M4V-Varianten,
- AAC-/FLAC-/Opus-Kombinationen in jedem Browser,
- Firefox-Wiedergabe in dieser H1-Abnahme.

Dateiendung und Container allein garantieren keine Codec-Kompatibilität. Deshalb bleibt die bestehende verständliche Fehlermeldung fachlich notwendig.

## Offen / Risiken

Kein technischer Blocker für die getestete PCM-WAV-/VP8-WebM-Chromium-Matrix.

Restliche Risiken sind gezielt begrenzt:

1. andere Codecs und Containerprofile können browserabhängig abweichen;
2. Firefox wurde in diesem automatischen PR-Lauf nicht ausgeführt;
3. Sitzungsplaylists werden weiterhin absichtlich nicht dauerhaft gespeichert.

## Rückweg

Revert von PR `#90` entfernt nur:

- H1-Fixtures,
- H1-Browsertest,
- H1-Vertragstest,
- H1-Plan,
- interne H1-Versionsmetadaten.

Die 0.4.4-Headquarter-Laufzeit selbst benötigt keinen Rollback und keine Datenmigration.

## Nächster logischer Schritt

### 0.3.0-D3b – Pointer Resize

Den bereits begonnenen Workspace-Resize-Strang fortsetzen:

- `pointerdown` erfasst den Zeiger,
- erst nach ungefähr 4 px realer Bewegung startet die Vorschau,
- Klick ohne Bewegung ändert keine Größe,
- Pointer Capture,
- Maus/Touch/Stift über denselben Pfad,
- `pointercancel` und Escape sauber abbrechen,
- genau ein Commit am Ende,
- keine Regression der bestehenden Tastatursteuerung.

## Danach

### 0.4.5 – Projekt-Mediathek nur bei echtem Bedarf

Erst wenn Playlists Neustarts überleben sollen, einen eigenen Persistenzvertrag entwickeln: expliziter Import, Größenlimit, sichere Dateinamen, Medienindex, Entfernen/Papierkorb sowie Backup-/Recovery-Regeln.
