# QA 0.4.4 – PROVOWARE Headquarter Dashboard & Media

## Gate-Zusammenfassung

Technischer PR: `#88`

Merge: `cb3772c736021d92d41aa109a1165c01c98e57f0`

Ausgangsbaseline: `818c4121324e1725d775fdacbde6a461e253c5a8`

## Core

| Prüfung | Ergebnis |
| --- | --- |
| Node 20 | PASS |
| Node 24 | PASS |
| Project Lint | 51 JavaScript-Dateien · PASS |
| Quality Gate | 123 Projektdateien · PASS |
| Node-Tests | 138/138 PASS |
| Fehlgeschlagen | 0 |

## Neue 0.4.4-Vertragstests

Alle PASS:

1. Headquarter-Modul baut Dashboard und beide nativen Medienplayer genau einmal auf.
2. Dashboard zeigt reale Modul-, Workspace- und Browserinformationen statt erfundener Lastwerte.
3. Direktstart benötigt keine Versions-Fetch-Anfrage und bleibt funktionsfähig.
4. Audio-Playlist nimmt passende Dateien auf, verhindert Duplikate und schaltet bei `ended` weiter.
5. Video-Playlist nutzt dieselbe lokale Object-URL-Mechanik und meldet Codecfehler verständlich.
6. Headquarter-CSS ist ein statisches Licht-Overlay ohne Daueranimation und wird lokal geladen.
7. Registry enthält das Headquarter genau einmal mit lokalem Modulpfad.

## Chromium

Workflow: `Browser E2E Gate` Run `32609010449`

- Chromium: 4/4 PASS
- Firefox: optional, automatisch übersprungen
- HTML-Mirror im vierten Chromium-Test: PASS

Evidenzartefakt:

- ID: `9484973879`
- Name: `browser-e2e-chromium`
- Dateien: `11`
- Größe: `16,540,775` Bytes
- SHA-256: `09b92507a435a925c7aba7274b08a96c5612f7b95f87053da8647387a9d5842b`

## Regressionsabdeckung

Der bestehende Browserlauf blieb vollständig grün für:

- Entwicklungsnotiz
- Project Data CRUD
- Reload
- Legacy Backup/Restore/Export/Import
- Data Studio PRO
- Recovery Envelope
- journalisierten Multi-Datei-Restore
- HTML UI Mirror

Damit verursachen Dashboard, Media-Modul und Glow-Overlay in der bestehenden geprüften Nutzerkette keine festgestellte Regression.

## Medien-Validierungsgrenze

Automatisiert geprüft sind:

- File-Auswahlvertrag
- Playlistaufbau
- Deduplizierung
- Object-URL-Zuweisung
- Wechsel zum nächsten Track
- `ended`-Weiterschaltung
- Cleanup/Revoke
- Fehlertext bei Medienfehler

Noch nicht automatisiert mit echten binären Medienfixtures geprüft:

- tatsächliche Decodierung eines konkreten Audio-Codecs
- tatsächliche Decodierung eines konkreten Video-Codecs
- Codec-Matrix Chromium/Firefox

Diese Grenze ist absichtlich sichtbar dokumentiert; Containerformat und Dateiendung garantieren nicht, dass der Browser den enthaltenen Codec unterstützt.

## Abnahmeurteil

**PASS für 0.4.4 Headquarter Dashboard & Media als Browser-native Sitzungsmedienfunktion.**

Kein Freigabeversprechen für jeden denkbaren Audio-/Video-Codec.
