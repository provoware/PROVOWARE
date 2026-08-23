# Entwicklungsplan 0.4.4 – PROVOWARE Headquarter Dashboard & Media

## Ziel in einfacher Sprache

Die bisher leere Übersicht wird zu einem nützlichen **PROVOWARE HEADQUARTER 2026**. Das Dashboard zeigt echte, im Browser verfügbare Tool-Informationen und erhält zwei tatsächlich funktionierende lokale Medienplayer für Audio und Video mit Sitzungs-Playlist.

Zusätzlich bekommt die Oberfläche mehr Lichtwirkung durch eine kleine, separat rücknehmbare CSS-Schicht mit stärkeren Akzenten und statischem Leuchten. Es werden keine erfundenen CPU-/IO-/Prozesswerte angezeigt.

## Begriffe

- **Dashboard:** kompakte Übersicht mit nützlichen Zustands- und Laufzeitinformationen.
- **Sitzungs-Playlist:** ausgewählte lokale Dateien bleiben bis zum Neuladen oder Schließen der Seite in der aktuellen Browser-Sitzung verfügbar.
- **Object URL:** vom Browser erzeugte temporäre Adresse für eine vom Nutzer ausgewählte lokale Datei.
- **Native Mediensteuerung:** die eingebauten Audio-/Video-Bedienelemente des Browsers.
- **Licht-Overlay:** zusätzliche CSS-Datei für stärkere Akzente und Leuchteffekte, ohne die bewährte Basisdatei umzubauen.

---

## 1. Ausgangsstand

- [x] aktueller `main`-Commit bestätigt: `818c4121324e1725d775fdacbde6a461e253c5a8`
- [x] interne Entwicklungsstufe vor Patch: `0.4.3 Recovery Envelope – Journaled Multi-File Restore & Rollback`
- [x] eigener Branch: `feat/0.4.4-headquarter-dashboard-media`
- [x] aktuell existiert im Repository **kein Audio-/Video-Modul und kein Dashboard-Modul**; der gemeldete Medienfehler ist deshalb in der realen Codebasis eine fehlende Funktion statt eine defekte vorhandene Implementierung
- [x] `#uebersicht` ist als stabiler Zielbereich vorhanden
- [x] Modulvertrag Version `1` und Registry-Lifecycle bleiben unverändert
- [x] 0.3.0-D3b bleibt ein getrennter Workspace-Strang; die bestätigte Variante A wird für später vorgemerkt: Pointer wird erfasst, Resize beginnt erst nach ungefähr 4 px realer Bewegung

---

## 2. Ein Hauptziel

**PROVOWARE Headquarter 2026 als modularen, wartbaren Dashboard- und Medienbereich bereitstellen.**

Dazu gehören als eine zusammenhängende Nutzerfunktion:

1. nützliche Tool-Informationen im Dashboard,
2. funktionierender lokaler Audio-Player mit Playlist,
3. funktionierender lokaler Video-Player mit Playlist,
4. kontrolliert hellere/leuchtende Darstellung ohne Umbau des Kern-Stylesheets.

---

## 3. Gewünschtes Endverhalten

### Dashboard

Das Dashboard zeigt nur Daten, die real verfügbar sind:

- Produkt-/Entwicklungsstand aus `VERSION.json`, sofern lesbar
- Startmodus: Klick-&-Start-Server oder direkter Datei-Start
- bekannte/aktive/fehlerhafte Module
- sichtbare Workspace-Panels
- aktuelle Fenstergröße
- vom Browser gemeldete logische CPU-Threads (`hardwareConcurrency`), falls verfügbar
- groben RAM-Hinweis (`deviceMemory`), falls der Browser ihn bereitstellt
- Browser-Speicherbelegung/-Kontingent über `navigator.storage.estimate()`, falls verfügbar
- Medienstatus Audio/Video

Nicht vortäuschen:

- echte CPU-Auslastung in Prozent
- echte IO-Schreibaktivität
- Prozessliste des Betriebssystems
- exakte RAM-Belegung des Gesamtsystems

Diese Werte sind aus einer normalen Browseroberfläche nicht zuverlässig verfügbar.

### Audio

- lokale Audiodateien per Standard-Dateiauswahl wählen
- mehrere Dateien auf einmal
- Playlist sichtbar
- Titel anklickbar
- Vorheriger/Nächster Titel
- automatische Weiterschaltung bei `ended`
- Playlist leeren
- native Browser-Steuerung für Lautstärke, Zeit und Wiedergabe
- verständliche Meldung bei nicht unterstütztem Format

### Video

- gleiche Playlist-Mechanik wie Audio
- lokales Video über Object URL
- native Controls und `playsinline`
- Vorheriger/Nächster Eintrag
- automatische Weiterschaltung
- verständliche Fehlermeldung bei Codec-/Formatproblem

### Persistenzgrenze

0.4.4 speichert **keine großen Audio-/Videodateien ungefragt im Browser oder Projektordner**.

Die Playlist ist zunächst bewusst eine Sitzungs-Playlist. Das ist browserübergreifend zuverlässig und verhindert versteckte Speicherlast. Eine dauerhaft projektgebundene Mediathek mit explizitem Dateiimport wird erst als eigener Folgepatch umgesetzt, wenn der Daten-/Quota-/Recovery-Vertrag festgelegt ist.

---

## 4. Architektur

Verbindliche Kette:

```text
Modul-Registry
-> headquarter-dashboard
   -> Dashboard-Info (nur lesen)
   -> Audio-Playlist (nur Arbeitsspeicher + Object URLs)
   -> Video-Playlist (nur Arbeitsspeicher + Object URLs)
-> DOM
```

Darstellung:

```text
assets/styles.css (bestehende Basis, unverändert)
-> assets/headquarter-dashboard.css (kleines rücknehmbares Overlay)
```

### Trennung

- `modules/headquarter-dashboard/index.js` – Daten lesen, Medienzustand, DOM-Ereignisse, Aufräumen
- `assets/headquarter-dashboard.css` – Dashboard-/Playerdarstellung und Lichtwirkung
- `modules/registry.js` – nur Modul-Steckbrief
- keine neue Server-API
- keine neue Datenbank
- keine neue persistente Browserquelle

---

## 5. Wartbarkeitsregeln

- kurze Funktionen mit jeweils einer Aufgabe
- eine gemeinsame Playlist-Logik für Audio und Video statt doppeltem Code
- Object URLs zentral erzeugen und beim Entfernen/Deaktivieren immer wieder freigeben
- native Browserplayer verwenden statt eigener komplexer Wiedergabeengine
- keine neue Bibliothek
- keine Remote-Abhängigkeit
- keine direkte Geschäftslogik in CSS
- keine Medienzustände in DOM-Texten als Datenquelle verwenden
- Fehler verständlich melden und unter `HEADQUARTER` loggen

---

## 6. Geplante Dateien

### Neu

- [ ] `modules/headquarter-dashboard/index.js`
- [ ] `assets/headquarter-dashboard.css`
- [ ] `tests/headquarter-dashboard.test.mjs`
- [ ] `docs/MANIFEST_0.4.4_HEADQUARTER.md`

### Gezielt ändern

- [ ] `modules/registry.js`
- [ ] `index.html`
- [ ] `VERSION.json`
- [ ] `README.md`
- [ ] `TODO.md`
- [ ] `CHANGELOG.md`
- [ ] `MANIFEST.md`

Nur falls automatisiert notwendig:

- [ ] `scripts/quality-check.mjs`
- [ ] Browser-E2E-/Mirror-Verträge

---

## 7. Implementierungsreihenfolge

1. Modul-Steckbrief und CSS-Ladung vorbereiten.
2. Dashboard-Grundstruktur ohne Medienzustand anlegen.
3. kleine reine Format-/Statushilfen ergänzen.
4. gemeinsame Playlist-Komponente bauen.
5. Audio- und Video-Instanzen mit derselben Playlistlogik erzeugen.
6. Object-URL-Lifecycle und Fehlerzustände absichern.
7. Tool-Infos asynchron lesen und defensiv darstellen.
8. statisches Licht-/Glow-Overlay ergänzen.
9. automatische Tests ergänzen.
10. `npm run verify` über CI ausführen.
11. nur bei grünem Diff/Quality Gate mergen.
12. nach Merge zentrale Dateien erneut auf `main` lesen.

---

## 8. Automatische Testmatrix

### Modulvertrag

- [ ] Registry enthält `headquarter-dashboard` genau einmal
- [ ] Einstiegspfad liegt unter `modules/headquarter-dashboard/`
- [ ] Modul definiert `activate`, `deactivate`, `dispose`

### Dashboard

- [ ] wird genau einmal in `#uebersicht` eingebaut
- [ ] erneutes Aktivieren erzeugt kein Duplikat
- [ ] direkter Datei-Start wird verständlich erkannt
- [ ] fehlende optionale Browserinformationen führen nicht zu Fehlern
- [ ] Modul-/Workspace-Zahlen werden aus APIs gelesen, nicht fest eincodiert

### Audio/Video

- [ ] Audio und Video verwenden denselben Playlist-Erzeuger
- [ ] mehrere gültige Dateien werden aufgenommen
- [ ] doppelte Auswahl derselben Datei wird nicht mehrfach eingefügt
- [ ] Wechsel des aktiven Eintrags setzt die passende Object URL
- [ ] `ended` wechselt zum nächsten Element
- [ ] Vorher/Nächster hält Listenränder sicher ein
- [ ] Leeren widerruft alle Object URLs
- [ ] `dispose` widerruft alle verbleibenden Object URLs
- [ ] Playerfehler erzeugt verständliches Nutzerfeedback

### Darstellung

- [ ] CSS enthält statische Leuchteffekte, keine Daueranimation
- [ ] Fokus bleibt sichtbar
- [ ] mobile Darstellung bleibt einspaltig nutzbar
- [ ] bestehende Basis-CSS bleibt unverändert

### Regression

- [ ] `npm run lint`
- [ ] `npm run verify`
- [ ] bestehende 0.4.3-Recovery-/Data-Studio-/Workspace-Tests bleiben grün
- [ ] Chromium-E2E nach Möglichkeit gegen aktuellen Stand ausführen
- [ ] HTML-Mirror darf keine Geometrieabweichung melden

---

## 9. Nutzerfeedback

Beispiele:

- `Audio: 4 Dateien geladen. Wähle einen Titel oder drücke Wiedergabe.`
- `Video: Format konnte vom Browser nicht wiedergegeben werden. Andere Datei oder Codec verwenden.`
- `Playlist geleert.`
- `Direktstart aktiv: Dashboard und Medien funktionieren; Projekt-Schreibfunktionen benötigen Klick-&-Start.`

Keine technischen Stacktraces in der sichtbaren Oberfläche.

---

## 10. Risiken

### Codec-Unterstützung

Der Browser entscheidet, welche Audio-/Video-Codecs er wiedergeben kann. Ein korrekt geladener MP4-/WebM-/Audio-Container kann deshalb trotzdem einen Codecfehler melden.

### Object URLs

Temporäre Medienadressen müssen beim Leeren und Deaktivieren widerrufen werden, sonst hält der Browser unnötig Speicher fest.

### Große Dateien

Die Datei bleibt beim Nutzer und wird nicht zusätzlich persistiert. 0.4.4 kopiert deshalb keine großen Medienblobs in IndexedDB oder Projektdaten.

### UI-Höhe

Dashboard-Inhalt vergrößert den Übersichtsbereich. Der reale Browser-/Mirror-Test muss sicherstellen, dass dadurch keine anderen Bedienelemente blockiert werden.

---

## 11. Rückweg

Revert des 0.4.4-PRs entfernt:

- Dashboard-Modul
- Medienplayer
- Dashboard-/Glow-Overlay
- zugehörige Tests/Dokumentation

Unverändert bleiben:

- Project Data Studio
- Data Studio PRO
- Recovery Envelope
- persistente Projektdaten
- Workspace-Vertrag
- D3a Resize

Es gibt keine Datenmigration zurückzunehmen.

---

## 12. Änderungsvolumen und Betroffene

Erwartetes Volumen: **mittel**.

Betroffen:

- sichtbare Übersicht
- Modulregistry
- Browser-Medienwiedergabe
- CSS-Darstellung
- Tests/Dokumentation

Nicht betroffen:

- Project-Data-/PRO-Schema
- Recovery-Dateien
- Server-Persistenz
- Projektdateischreiblogik
- Datenmigration

---

## 13. Nächste zwei logische Schritte

### Danach 1 – 0.4.5 Projekt-Mediathek

Nur falls dauerhaft gespeicherte Playlists/Dateien gewünscht sind:

- expliziter Import in einen projektgebundenen Medienordner
- Dateigrößenlimit und Quota-Anzeige
- sichere Dateinamen
- portable Playlist-Metadaten
- Lösch-/Recovery-Regeln
- keine browserabhängigen File-System-Handles als einzige Lösung

### Danach 2 – Workspace 0.3.0-D3b

Die bereits bestätigte Variante A anwenden:

- `pointerdown` erfasst den Zeiger
- erst nach ungefähr **4 px** realer Bewegung startet die Resize-Vorschau
- Klick ohne Bewegung verändert keine Größe
- danach Pointer Capture, Preview, einzelner Commit und Abbruchtests
