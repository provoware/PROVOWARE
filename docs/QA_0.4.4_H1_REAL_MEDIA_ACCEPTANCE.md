# QA 0.4.4-H1 – Real Media Acceptance

## Zweck

Diese Datei trennt klar zwischen **simulierter Playerlogik** und **real nachgewiesener Browserwiedergabe**.

## Testmatrix

| Prüfung | Umgebung | Ergebnis |
| --- | --- | --- |
| PCM-WAV Magic Bytes / Größe | Node 20 + 24 | PASS |
| VP8-WebM/EBML Magic Bytes / Größe | Node 20 + 24 | PASS |
| Headquarter lädt echte WAV-Datei | Chromium 151 | PASS |
| WAV-Metadaten und positive Dauer | Chromium 151 | PASS |
| WAV `play()` + fortgeschrittene `currentTime` | Chromium 151 | PASS |
| Headquarter lädt echte VP8-WebM-Datei | Chromium 151 | PASS |
| WebM-Metadaten, Breite und Höhe | Chromium 151 | PASS |
| WebM `play()` + fortgeschrittene `currentTime` | Chromium 151 | PASS |
| defekte MP3-Payload erzeugt kontrollierten Fehler | Chromium 151 | PASS |
| bestehende CRUD-/Recovery-Kernkette | Chromium 151 | PASS |
| Data Studio PRO | Chromium 151 | PASS |
| Recovery Envelope | Chromium 151 | PASS |
| HTML-Mirror | Chromium 151 | PASS |
| Firefox Real Media | nicht ausgeführt | NOT_RUN |

## Core-Evidenz

Quality-Gate-Run: `32609864766`

- Node 20.20.2: PASS
- Node 24: PASS
- Project Lint: 53 JavaScript-Dateien
- Quality Gate: 130 Projektdateien
- Tests: 141/141 PASS
- Fehler: 0

## Browser-Evidenz

Browser-Run: `32609864563`

Ausgabe:

`Running 5 tests using 1 worker`

Der H1-Test wurde als erster der fünf Chromium-Tests tatsächlich ausgeführt und bestand. Gesamtergebnis:

`5 passed`

Artefakt:

- ID: `9485201898`
- SHA-256: `4c0344c12fdf46f5998120ca66d92ceaf427ebb6bab50930ede071f5fdeea354`
- Größe: `16,913,377` Bytes
- 12 hochgeladene Dateien

## Was der Test wirklich beweist

Der Browser erhält echte Binärdateien über dieselben `<input type="file">`-Elemente, die auch die normale Oberfläche verwendet. Die Anwendung erzeugt daraus lokale Object URLs und übergibt sie an native `<audio>`-/`<video>`-Elemente.

PASS verlangt unter anderem:

- Browser erkennt echte Mediendaten,
- Metadaten werden geladen,
- Dauer ist positiv,
- Video besitzt reale Breite und Höhe,
- `HTMLMediaElement.play()` löst echte Wiedergabe aus,
- `currentTime` schreitet voran.

Das ist stärker als ein reiner DOM-Test oder ein Mock, weil die Medienpipeline des realen Chromium-Prozesses beteiligt ist.

## CI-Autoplay-Präzisierung

Die Medienelemente werden für den automatischen Test stummgeschaltet. Das verhindert, dass Browser-Autoplay-Regeln den Test aus Berechtigungsgründen blockieren. Der Test behauptet deshalb **nicht**, dass ein grafischer Klick auf die nativen Controls geprüft wurde. Er beweist Dekodierung und laufende Wiedergabe.

## Codec-Grenze

Nachgewiesen:

- PCM-WAV
- VP8-WebM

Nicht automatisch nachgewiesen:

- beliebige MP3-Codecs/Bitraten,
- beliebige MP4/H.264-Profile,
- AAC-/M4A-/MOV-/M4V-Varianten,
- Firefox in H1.

Ein Dateiname wie `.mp4` oder `.mp3` ist nur ein Container-/Formatindikator und kein vollständiger Codec-Nachweis.

## Regression

Der vollständige bestehende Chromium-E2E-Satz blieb grün. Damit hat die reine H1-Testergänzung keine Regression in CRUD, Recovery, Data Studio PRO oder HTML-Mirror festgestellt.
