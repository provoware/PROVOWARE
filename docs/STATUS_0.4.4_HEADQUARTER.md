# Status 0.4.4 – PROVOWARE Headquarter Dashboard & Media

## Ergebnis

`0.4.4 – Headquarter Dashboard & Media` ist technisch umgesetzt und über PR `#88` auf `main` gemergt.

Squash-Merge:

`cb3772c736021d92d41aa109a1165c01c98e57f0`

Technische Baseline:

`818c4121324e1725d775fdacbde6a461e253c5a8`

Die freigegebene Produktversion bleibt `0.2.0`; `VERSION.json` weist die interne Entwicklungsphase `0.4.4 Headquarter Dashboard & Media` aus.

---

## Was umgesetzt wurde

### PROVOWARE HEADQUARTER 2026

Die bisher inhaltlich leere Übersicht besitzt jetzt ein dynamisch geladenes Headquarter-Modul.

Das Dashboard zeigt nur Werte, die Browser und bestehende PROVOWARE-APIs tatsächlich liefern können:

- Release-/Entwicklungsinformation
- Klick-&-Start oder Direktstart
- Modulanzahl, aktive Module und Modulfehler
- sichtbare Workspace-Panels
- aktuelle Fenstergröße
- logische CPU-Threads, sofern der Browser sie meldet
- groben Geräte-RAM-Hinweis, sofern der Browser ihn meldet
- Browser-Speicherbelegung und Kontingent, sofern verfügbar
- aktuellen Audio-/Video-Playliststatus

Nicht erfunden werden:

- CPU-Auslastung in Prozent
- IO-Schreibaktivität
- Betriebssystem-Prozessliste
- exakte System-RAM-Auslastung

### Audio

Neu vorhanden:

- lokaler Dateiauswahldialog
- Mehrfachauswahl
- Sitzungs-Playlist
- Deduplizierung derselben Datei
- sichtbare Titelliste
- Vorher/Nächster
- automatische Weiterschaltung nach `ended`
- native Browser-Steuerung
- verständlicher Codec-/Formatfehler
- vollständige Freigabe temporärer Object URLs bei Leeren oder Modulabbau

### Video

Verwendet dieselbe Playlist- und Aufräumlogik wie Audio. Es existiert keine zweite parallele Medienengine.

Unterstützt werden über Browser-MIME beziehungsweise Dateiendung unter anderem MP4, WebM, OGV, MOV und M4V. Ob ein konkreter Codec wiedergegeben werden kann, entscheidet weiterhin der jeweilige Browser.

### Mehr Licht / Leuchten

Die zusätzliche Datei `assets/headquarter-dashboard.css` bildet ein separates Darstellungs-Overlay:

- hellere Cyan-/Blau-Akzente
- statische Statusleuchten
- stärkere, aber begrenzte Glow-/Schattenwirkung
- Fokusmarkierung bleibt sichtbar
- keine Daueranimation
- mobile Einspaltenansicht

`assets/styles.css` wurde nicht umgebaut.

---

## Architektur

```text
modules/registry.js
-> modules/headquarter-dashboard/index.js
   -> reale Tool-Informationen
   -> gemeinsame Playlist-Logik
      -> Audio
      -> Video
-> DOM
```

Darstellung:

```text
assets/styles.css
-> assets/headquarter-dashboard.css
```

Persistenz:

- keine neue Datenbank
- keine neue Server-API
- keine Datenmigration
- keine zweite Browser-Persistenz
- keine großen Medienblobs in Project Data oder Data Studio PRO
- Playlist bewusst nur für die aktuelle Seitensitzung

---

## Reale technische Abnahme

### Core Quality Gate

- Node 20: **PASS**
- Node 24: **PASS**
- Project Lint: **51 JavaScript-Dateien**
- Quality Gate: **123 Projektdateien**
- Node-Tests: **138/138 PASS**
- Fehler: **0**

Die sieben neuen Headquarter-Tests sind vollständig grün.

### Chromium Browser Gate

- Chromium: **4/4 PASS**
- bestehende CRUD-/Legacy-Recovery-Kette: PASS
- Data Studio PRO: PASS
- Recovery Envelope: PASS
- HTML-Mirror: PASS
- Firefox: wie im Projektvertrag optional übersprungen

Evidenz:

- Workflow Run: `32609010449`
- Artefakt: `9484973879`
- Artefakt-SHA-256: `09b92507a435a925c7aba7274b08a96c5612f7b95f87053da8647387a9d5842b`
- Artefaktgröße: `16,540,775` Bytes
- hochgeladene Dateien: `11`

---

## Validierungsgrenze

Der reale Chromium-Gesamtlauf beweist, dass das neue Dashboard und das Licht-Overlay die vorhandene UI-, Project-Data-, PRO-, Recovery- und Mirror-Kette nicht regressieren.

Die neue Audio-/Video-Playlistlogik wurde automatisiert mit lokalen File-/Object-URL-Simulationen geprüft. Ein dedizierter Browser-E2E mit einer konkreten echten Audio- und Videodatei ist in 0.4.4 noch **nicht** Teil des Chromium-Gates.

Daraus folgt:

- Player-/Playlist-Vertrag: automatisiert geprüft
- DOM-/Object-URL-Lifecycle: automatisiert geprüft
- Codecfehler: automatisiert geprüft
- konkrete Mediencodec-Matrix: noch offen und browserabhängig

---

## Änderungsvolumen

Technischer PR `#88`:

- 8 geänderte Dateien
- 1 neues Laufzeitmodul
- 1 neues CSS-Overlay
- 1 neue Testdatei
- Registry-/HTML-/Versionsanpassungen
- Plan und Patchmanifest

Nicht betroffen:

- Project-Data-Schema
- Data-Studio-PRO-Schema
- Recovery-Envelope-Format
- Atomic Writer
- bestehende Backups
- Workspace-Vertragsversion
- Modulvertragsversion

---

## Rückweg

Revert von PR `#88` entfernt Dashboard, Medienplayer, Licht-Overlay, Tests und 0.4.4-Metadaten. Es existiert keine Datenmigration und keine persistente 0.4.4-Mediendatei, die zusätzlich zurückgesetzt werden müsste.

---

## Parallel offener Workspace-Strang

Die bestätigte D3b-Entscheidung ist dokumentiert, aber bewusst nicht mit 0.4.4 vermischt:

- `pointerdown` darf den Pointer erfassen
- erst nach ungefähr **4 px** realer Bewegung beginnt die Resize-Vorschau
- ein Klick ohne Bewegung verändert keine Panelgröße

D3b bleibt ein eigener Patch.

---

## Nächste zwei logische Schritte

### 1. 0.4.5 – Projekt-Mediathek

Nur falls Audio-/Video-Playlists über Neustarts hinweg dauerhaft im Projekt erhalten bleiben sollen:

- expliziter Dateiimport in projektgebundenen Medienordner
- Größen-/Quota-Grenzen
- portable Playlist-Metadaten
- sichere Dateinamen
- Entfernen/Papierkorb
- Backup-/Recovery-Vertrag
- reale Audio-/Video-Browserfixtures

### 2. 0.3.0-D3b – Pointer Resize

Den getrennten Workspace-Strang mit der bestätigten 4-px-Bewegungsschwelle fortsetzen und Pointer Capture, Vorschau, Einzel-Commit, `pointercancel` und Touch/Stift automatisiert absichern.

## Empfehlung

Als nächstes nicht gleichzeitig Media-Persistenz und Pointer-Resize mischen. Ein eigenes kleines Gate pro Mechanik hält Fehlerradius und Rückweg klar.
