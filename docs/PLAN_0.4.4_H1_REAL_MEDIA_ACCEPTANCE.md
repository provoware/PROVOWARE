# Plan 0.4.4-H1 – Real Media Acceptance

## Hauptziel

Die in 0.4.4 eingeführten lokalen Audio-/Video-Player werden nicht nur auf DOM- und Object-URL-Ebene, sondern mit **echten kleinen Mediendateien im realen Chromium-Browserlauf** geprüft.

Ausgangsstand (Baseline): `d439ccf9881e9a6fe6f7f51007dbcb77ce31144f`.

Die freigegebene Produktversion bleibt `0.2.0`; H1 ist eine interne Abnahmestufe ohne neues Datenformat.

## Begriffe in einfacher Sprache

- **Fixture (Testdatei):** eine kleine feste Datei, die ausschließlich für reproduzierbare Tests im Repository liegt.
- **Codec (Kompressionsverfahren):** legt fest, wie Audio- oder Videodaten technisch gespeichert sind.
- **Playback-Ereignis (Wiedergabeereignis):** Browsermeldung wie `loadedmetadata`, `playing` oder `ended`, mit der echte Medienverarbeitung nachgewiesen wird.
- **E2E-Test (Ende-zu-Ende-Test):** Prüfung in einem realen Browser statt nur in einer simulierten JavaScript-Umgebung.

## Änderungsgrenze

Enthalten:

1. kleine reproduzierbare Audio-Testdatei im unkomprimierten WAV-Format,
2. kleine reproduzierbare Video-Testdatei im WebM-/VP8-Format,
3. Chromium-E2E für echte Dateiauswahl, Metadaten, Start der Wiedergabe und Playlistwechsel,
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

- [x] 1. **Ausgangslage:** `main` entspricht exakt Baseline `d439ccf...`; 0.4.4 ist bereits technisch und dokumentarisch abgeschlossen.
- [x] 2. **Gewünschtes Endverhalten:** Chromium muss die echten Testdateien über die sichtbaren Headquarter-Dateifelder laden und mindestens Medienmetadaten sowie einen echten Wiedergabestart bestätigen.
- [x] 3. **Betroffene Dateien:** Browser-E2E-Spec, zwei kleine Medien-Fixtures, H1-Dokumentation und interne Entwicklungsmetadaten.
- [x] 4. **Daten-/Schnittstellenvertrag:** keine neue Produktionspersistenz; Fixtures bleiben reine Testressourcen. Das Headquarter-Modul selbst behält seine bestehende öffentliche Modul-API.
- [ ] 5. **Implementierung:** Audio-WAV und Video-WebM hinzufügen und den bestehenden Chromium-E2E-Lauf um einen isolierten Headquarter-Medientest ergänzen.
- [ ] 6. **Automatische Prüfungen:** `npm run verify` unter Node 20/24 sowie Chromium-E2E inklusive bestehender vier Ketten plus neuem Medientest.
- [ ] 7. **Manuelle/Browser-Stichprobe:** Chromium-Joblog auf tatsächliche Ausführung des Medientests prüfen; Firefox bleibt gemäß bestehendem Projektvertrag optional und wird nur als nachgewiesen bezeichnet, wenn ein realer Lauf existiert.
- [ ] 8. **Dokumentation:** H1-Status, Testformat, Codec-Grenze, Evidenz und Rückweg festhalten.
- [ ] 9. **Rückweg:** Revert des H1-PRs entfernt nur Test-Fixtures, E2E-Erweiterung und H1-Metadaten; 0.4.4-Laufzeit bleibt unverändert.
- [ ] 10. **Änderungsvolumen:** erwartet klein bis mittel; betroffen sind ausschließlich Test-/Abnahmepfad und interne Versionsdokumentation.
- [ ] 11. **Nutzerfeedback/Fehler:** vorhandene verständliche Headquarter-Codecmeldung bleibt unverändert; der Test prüft reale Browserereignisse statt neue UI-Texte einzuführen.
- [ ] 12. **Nächste zwei Stufen:** danach entweder `0.3.0-D3b Pointer Resize` oder – nur bei echtem Bedarf – `0.4.5 Projekt-Mediathek`.

## Abnahmekriterien

H1 ist nur grün, wenn:

1. WAV-Fixture in Chromium `loadedmetadata` erreicht und eine positive Dauer meldet.
2. Audio kann über einen echten Nutzerklick gestartet werden und erreicht `playing` oder eine fortgeschrittene Wiedergabezeit.
3. WebM-Fixture erreicht in Chromium `loadedmetadata`, besitzt Breite/Höhe > 0 und kann gestartet werden.
4. Die sichtbare Audio-/Video-Playlist zeigt die ausgewählten Fixture-Dateinamen.
5. Eine bewusst nicht abspielbare Datei erzeugt einen kontrollierten Medienfehler ohne Absturz der Anwendung.
6. Alle bestehenden Node-Tests bleiben grün.
7. Alle bisherigen Chromium-E2E-Ketten und der HTML-Mirror bleiben grün.
8. Branch ist vor Merge nicht hinter `main`.

## Risiko

Der größte reale Restfaktor ist browserabhängige Codec-Unterstützung. Deshalb verwendet H1 bewusst konservative Testformate: PCM-WAV für Audio und VP8-WebM für Video. Ein grüner H1-Lauf beweist diese konkrete Chromium-Testmatrix, nicht automatisch jedes MP3-, MP4-, MOV- oder proprietäre Codecprofil.
