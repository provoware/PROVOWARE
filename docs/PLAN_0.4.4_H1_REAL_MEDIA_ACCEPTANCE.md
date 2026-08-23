# Plan 0.4.4-H1 – Real Media Acceptance

## Hauptziel

Die in 0.4.4 eingeführten lokalen Audio-/Video-Player werden nicht nur auf DOM- und Object-URL-Ebene, sondern mit **echten kleinen Mediendateien im realen Chromium-Browserlauf** geprüft.

Ausgangsstand (Baseline): `d439ccf9881e9a6fe6f7f51007dbcb77ce31144f`.

Technischer H1-Merge: `a768bd58233b8358a81caed9e96123ab4508bb91` über PR `#90`.

Die freigegebene Produktversion bleibt `0.2.0`; H1 ist eine interne Abnahmestufe ohne neues Datenformat.

## Begriffe in einfacher Sprache

- **Fixture (Testdatei):** eine kleine feste Datei, die ausschließlich für reproduzierbare Tests im Repository liegt.
- **Codec (Kompressionsverfahren):** legt fest, wie Audio- oder Videodaten technisch gespeichert sind.
- **Playback-Ereignis (Wiedergabeereignis):** Browsermeldung wie geladene Metadaten oder fortgeschrittene Wiedergabezeit, mit der echte Medienverarbeitung nachgewiesen wird.
- **E2E-Test (Ende-zu-Ende-Test):** Prüfung in einem realen Browser statt nur in einer simulierten JavaScript-Umgebung.

## Änderungsgrenze

Enthalten:

1. kleine reproduzierbare Audio-Testdatei im unkomprimierten PCM-WAV-Format,
2. kleine reproduzierbare Video-Testdatei im WebM-/VP8-Format,
3. Chromium-E2E für echte Dateiauswahl, Metadaten, Dekodierung und Wiedergabe,
4. kontrollierter Browser-Fehlerpfad für eine nicht abspielbare Datei,
5. technische Dokumentation der real nachgewiesenen und nicht nachgewiesenen Codec-Grenzen.

Nicht enthalten:

- keine Projekt-Mediathek,
- keine dauerhafte Playlist-Persistenz,
- keine neue Server-API,
- keine Datenbank- oder Recovery-Änderung,
- kein Codec-Transcoding,
- keine Workspace-/Resize-Änderung,
- keine Änderung des Modulvertrags.

## Nummerierte Checkliste

- [x] 1. **Ausgangslage:** `main` entsprach exakt Baseline `d439ccf...`; 0.4.4 war bereits technisch und dokumentarisch abgeschlossen.
- [x] 2. **Gewünschtes Endverhalten:** Chromium lädt die echten Testdateien über die Headquarter-Dateifelder, dekodiert sie und bestätigt eine fortgeschrittene Wiedergabezeit.
- [x] 3. **Betroffene Dateien:** Browser-E2E-Spec, zwei kleine Medien-Fixtures, H1-Vertragstest, Plan und interne Entwicklungsmetadaten.
- [x] 4. **Daten-/Schnittstellenvertrag:** keine neue Produktionspersistenz; Fixtures bleiben reine Testressourcen. Die öffentliche Headquarter-Modul-API blieb unverändert.
- [x] 5. **Implementierung:** PCM-WAV und VP8-WebM hinzugefügt und den Chromium-E2E-Lauf um einen isolierten Headquarter-Medientest ergänzt.
- [x] 6. **Automatische Prüfungen:** Node 20 und Node 24 PASS; Project Lint 53 JavaScript-Dateien; Quality Gate 130 Projektdateien; 141/141 Node-Tests PASS; Chromium 5/5 PASS.
- [x] 7. **Browser-Stichprobe:** Joblog bestätigt die reale Ausführung des Medientests. Firefox blieb gemäß bestehendem Projektvertrag im automatischen PR-Lauf übersprungen und wird nicht als nachgewiesen bezeichnet.
- [x] 8. **Dokumentation:** H1-Status, QA, Testformate, Codec-Grenze, Evidenz und Rückweg werden mit dieser Abschlussstufe festgehalten.
- [x] 9. **Rückweg:** Revert von PR `#90` entfernt nur H1-Fixtures, E2E-Erweiterung, Vertragstest, Plan und H1-Metadaten; die 0.4.4-Laufzeit selbst bleibt unverändert.
- [x] 10. **Änderungsvolumen:** technischer PR `#90` umfasste 6 Dateien, 204 Ergänzungen und 2 Entfernungen; betroffen war ausschließlich der Test-/Abnahmepfad plus interne Versionsmetadaten.
- [x] 11. **Nutzerfeedback/Fehler:** die vorhandene verständliche Meldung `Format oder Codec ... nicht unterstützt` wurde mit einer bewusst defekten MP3-Payload im echten Browserpfad bestätigt.
- [x] 12. **Nächste zwei Stufen:** `0.3.0-D3b Pointer Resize` ist der logisch nächste technische Schritt; `0.4.5 Projekt-Mediathek` erst bei echtem Persistenzbedarf.

## Reale Abnahme

### Core

- Node 20.20.2: **PASS**
- Node 24: **PASS**
- Project Lint: **53 JavaScript-Dateien**
- Quality Gate: **130 Projektdateien**
- Node-Tests: **141/141 PASS**
- Fehler: **0**

### Chromium

Workflow Run: `32609864563`

- **5/5 PASS**
- H1 Real Media Acceptance: PASS
- bestehende CRUD-/Recovery-Kernkette: PASS
- Data Studio PRO: PASS
- Recovery Envelope: PASS
- HTML-Mirror: PASS
- Firefox: im automatischen Lauf wie vorgesehen übersprungen

Browser-Evidenz:

- Artefakt: `9485201898`
- SHA-256: `4c0344c12fdf46f5998120ca66d92ceaf427ebb6bab50930ede071f5fdeea354`
- Größe: `16,913,377` Bytes
- hochgeladene Dateien: `12`
- H1-Screenshot: `09-headquarter-real-media.png`

## Abnahmekriterien – Ergebnis

1. PCM-WAV erreicht im echten Chromium-Medienelement geladene Metadaten und eine positive Dauer: **PASS**.
2. Audio wird über das native `HTMLMediaElement.play()` gestartet und zeigt danach eine fortgeschrittene `currentTime`: **PASS**.
3. VP8-WebM erreicht geladene Metadaten, positive Dauer sowie Breite/Höhe > 0 und eine fortgeschrittene Wiedergabezeit: **PASS**.
4. Die sichtbare Audio-/Video-Playlist zeigt die ausgewählten Fixture-Dateinamen: **PASS**.
5. Eine bewusst nicht abspielbare MP3-Payload erzeugt den kontrollierten Format-/Codecfehler; Dashboard bleibt aktiv: **PASS**.
6. Alle bestehenden Node-Tests bleiben grün: **PASS**.
7. Alle bisherigen Chromium-E2E-Ketten und der HTML-Mirror bleiben grün: **PASS**.
8. Branch war vor Merge `0` Commits hinter `main`: **PASS**.

## Präzisierung zum Wiedergabestart

Der H1-E2E-Test verwendet das echte native `HTMLMediaElement.play()` im realen Chromium-Prozess. Das Medienelement wird im CI-Test stummgeschaltet, damit Browser-Autoplay-Regeln den Decoder-Test nicht zufällig blockieren. Nach dem Start muss die reale Wiedergabezeit (`currentTime`) fortgeschritten sein.

Damit sind **Dateiauswahl, Browserdekodierung und Wiedergabe** nachgewiesen. Ein gesonderter Klick auf die grafischen nativen Play/Pause-Controls ist nicht Teil dieses H1-Vertrags und wird nicht behauptet.

## Aussagegrenze

Der größte reale Restfaktor bleibt browserabhängige Codec-Unterstützung. H1 beweist konkret:

- PCM-WAV in dem ausgeführten Chromium-Lauf,
- VP8-WebM in dem ausgeführten Chromium-Lauf,
- kontrollierte Fehlerbehandlung bei ungültigem Audioinhalt.

H1 beweist **nicht automatisch** jedes MP3-, MP4-, MOV-, AAC- oder proprietäre Codecprofil und auch keinen Firefox-Lauf.

## Format/Fix

`npm run fix` wurde im technischen H1-Patch nicht separat als schreibender Schritt ausgeführt. Der vollständige reproduzierbare Lint-/Quality-/Testpfad war ohne Korrekturbedarf grün. Es wurde keine automatische Programmlogik verändert.
