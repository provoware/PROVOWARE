# Entwicklungsplan 0.3.0-C – Sichtbarkeit & kompakte Schnellstarterleiste

## Ziel in einfacher Sprache

Diese Teilstufe macht die vorhandenen Workspace-Panels erstmals sichtbar steuerbar. Direkt unter dem festen oberen Bereich entsteht eine kompakte Schnellstarter-/Menüleiste. Der wichtigste Rettungsweg `Layout` bleibt dort immer sichtbar und liegt bewusst außerhalb der veränderbaren Arbeitsfläche.

Alle Panels dürfen ausgeblendet werden. Trotzdem muss der Nutzer jederzeit ohne Konsole, Neuinstallation oder Löschen anderer Browserdaten wieder zu einem vollständigen Standardlayout zurückkehren können.

## Begriffe vorab

- **Sichtbarkeit:** Ein Panel wird angezeigt oder ausgeblendet, ohne seine gespeicherte Reihenfolge oder Größe zu verlieren.
- **Schnellstarterleiste:** kompakte feste Leiste mit häufig benötigten Layoutfunktionen.
- **Menüleiste:** Bereich, aus dem der Nutzer weitere Layoutaktionen öffnet.
- **Fokus:** markiert das aktuell per Tastatur bedienbare Element.
- **Live-Status:** kurze Textmeldung, die eine ausgeführte Aktion bestätigt.
- **ARIA:** zusätzliche HTML-Informationen, damit Bedienhilfen Zustand und Bedeutung einer Steuerung erkennen.
- **Regression:** eine neue Änderung beschädigt bereits funktionierendes Verhalten.

## 1. Baseline

- Produkt: `PROVOWARE ALL-IN 2026`
- freigegebene Produktversion: `0.2.0`
- Entwicklungsstufe: `0.3.0-C`
- Baseline: `247b584e87f4e041e6f405932328659e895bfbb7`
- Workspace-Vertrag: Version `1`
- bestehende Zustandsbasis: `0.3.0-B`
- lokale Speicherung: `provoware.allin.workspace.main.v1`
- keine neue externe Laufzeitabhängigkeit

## 2. Bestätigte Entscheidungen

- [x] Alle Workspace-Panels dürfen vollständig ausgeblendet werden.
- [x] Ein permanenter `Layout`-Schalter liegt außerhalb des veränderbaren Workspace.
- [x] Die Schnellstarterleiste liegt direkt unter dem festen oberen Bereich.
- [x] Mobile Option A: Leiste bleibt einzeilig und kompakt; `Layout` bleibt fest sichtbar.
- [x] Weitere Leisteninhalte dürfen bei Bedarf horizontal scrollen.
- [x] Keine zweite unnötige Navigation erzeugen.
- [x] Resize bleibt in 0.3.0-D.
- [x] Drag & Drop bleibt in 0.3.0-E.

## 3. Änderungsgrenze

### Enthalten

- [ ] feste kompakte Schnellstarterleiste
- [ ] permanenter `Layout`-Schalter
- [ ] Layout-Menü mit den fünf Kernpanels
- [ ] jedes Panel einzeln ein-/ausblendbar
- [ ] `Alle anzeigen`
- [ ] `Standardlayout wiederherstellen`
- [ ] Sichtbarkeit über die zentrale Workspace-Zustandsverwaltung
- [ ] automatische lokale Speicherung nach Sichtbarkeitsänderung
- [ ] ausgeblendete Panels behalten Reihenfolge und Größe
- [ ] verständliches Nutzerfeedback
- [ ] Tastaturbedienung und Fokusführung
- [ ] automatische Tests und Quality-Gate-Prüfungen
- [ ] Dokumentation, TODO und Manifeste synchronisieren

### Nicht enthalten

- [x] kein Resize
- [x] kein Drag & Drop
- [x] keine freie Pixelpositionierung
- [x] keine Fachmodule
- [x] keine Cloud-Synchronisation
- [x] keine neue Bibliothek
- [x] keine zweite Zustandsquelle
- [x] keine Änderung des Modulvertrags

## 4. Wartbarkeitsarchitektur

### 4.1 Zustandslogik bleibt zentral

Die Datei `assets/workspace-state.js` bleibt die einzige verbindliche Quelle für Workspace-Zustand und Speicherung.

Neue sichtbare Bedienlogik darf nicht selbst `localStorage` schreiben.

### 4.2 UI-Logik wird getrennt

Eine kleine Datei `assets/workspace-ui.js` übernimmt ausschließlich:

- DOM-Zuordnung der Panels
- Anzeigen/Ausblenden
- Layout-Menü öffnen/schließen
- Fokusführung
- Nutzerfeedback
- Verbindung zwischen Klick/Tastatur und Workspace-API

Sie erhält keinen eigenen persistenten Zustand.

### 4.3 Stabile Panel-Zuordnung

Die fünf sichtbaren Panels erhalten `data-workspace-panel` mit den stabilen Vertrags-IDs:

1. `overview`
2. `modules`
3. `work`
4. `details`
5. `system-status`

Sichtbare deutsche Überschriften bleiben davon getrennt.

### 4.4 Kurze Funktionen

Bevorzugte kleine Aufgaben:

- `zustandAnwenden()`
- `menueSetzen()`
- `panelSichtbarkeitSetzen()`
- `alleAnzeigen()`
- `standardWiederherstellen()`
- `statusMelden()`
- `fokusNachAktionSetzen()`

Keine Funktion soll gleichzeitig Zustand berechnen, Browserdaten schreiben und UI rendern.

## 5. Schrittfolge

### 5.1 Vorprüfung

- [ ] aktuellen `main`-Stand bestätigen
- [ ] bestehende IDs, Raster und Breakpoints prüfen
- [ ] vorhandene Workspace-API vollständig lesen
- [ ] keine bestehende Funktion doppelt implementieren
- [ ] Diff-Grenze festlegen

### 5.2 Workspace-State minimal erweitern

- [ ] zentrale Methode für einzelne Panel-Sichtbarkeit ergänzen
- [ ] zentrale Methode `allePanelsAnzeigen` ergänzen
- [ ] unbekannte Panel-ID kontrolliert ablehnen
- [ ] Änderungen immer über bestehende Normalisierung und Speicherung führen
- [ ] Reset unverändert isoliert halten

### 5.3 HTML-Struktur

- [ ] Schnellstarterleiste nach `topbar` und vor `main` einfügen
- [ ] `Layout`-Schalter permanent sichtbar platzieren
- [ ] Layout-Menü außerhalb von `main` anlegen
- [ ] fünf Checkbox-/Schalterzeilen für Panels anlegen
- [ ] `Alle anzeigen` und `Standardlayout wiederherstellen` integrieren
- [ ] Live-Statusbereich für kurze Rückmeldungen ergänzen
- [ ] `data-workspace-panel` an allen Kernpanels setzen

### 5.4 CSS

- [ ] Leiste kompakt und visuell klar gestalten
- [ ] `Layout` als primäre feste Aktion behandeln
- [ ] Menü optisch vom Workspace trennen
- [ ] horizontales Überlaufen der sekundären Leistenfläche erlauben
- [ ] auf Mobilgeräten `Layout` sichtbar halten
- [ ] versteckte Panels zuverlässig aus dem Grid entfernen
- [ ] Fokuszustände deutlich halten
- [ ] `prefers-reduced-motion` respektieren

### 5.5 Workspace-UI-Controller

- [ ] Workspace-API beim Start anbinden
- [ ] gespeicherten Zustand auf DOM anwenden
- [ ] Menüschalter synchron halten
- [ ] einzelne Sichtbarkeit setzen
- [ ] alle Panels anzeigen
- [ ] Standardlayout wiederherstellen
- [ ] Menü per `Escape` schließen
- [ ] Klick außerhalb schließt Menü kontrolliert
- [ ] Fokus nach Aktionen nachvollziehbar setzen
- [ ] keine Endlosschleife zwischen Rendern und Speichern erzeugen

### 5.6 Nutzerfeedback

Nach jeder Layoutaktion gilt:

`Aktion -> Ergebnis -> sicherer nächster Zustand`

Beispiele:

- `Module ausgeblendet.`
- `Alle Bereiche sind wieder sichtbar.`
- `Standardlayout wiederhergestellt.`

Fehler werden kurz und verständlich gemeldet und zusätzlich im Bereich `WORKSPACE` geloggt.

### 5.7 Automatische Tests

- [ ] einzelnes Panel ausblenden und speichern
- [ ] Panel wieder anzeigen und gespeicherte Größe/Reihenfolge erhalten
- [ ] alle fünf Panels ausblenden dürfen
- [ ] `allePanelsAnzeigen` stellt nur Sichtbarkeit auf `true`
- [ ] Reset stellt vollständigen Standardzustand wieder her
- [ ] unbekannte Panel-ID verändert keinen Zustand
- [ ] UI wendet gespeicherten Zustand auf alle fünf DOM-Panels an
- [ ] `Layout`-Schalter liegt statisch außerhalb des Workspace
- [ ] alle fünf `data-workspace-panel`-IDs stimmen mit dem Vertrag überein
- [ ] Script-Reihenfolge bleibt deterministisch

### 5.8 Quality Gate

Kanonischer Befehl:

```bash
npm run verify
```

Er muss zusätzlich prüfen:

- neue UI-Datei vorhanden
- Script-Reihenfolge korrekt
- Layout-Schalter vorhanden
- Panel-Zuordnung vollständig und eindeutig
- keine externen Laufzeitabhängigkeiten
- alle automatischen Tests grün

### 5.9 Dokumentation

- [ ] `README.md`
- [ ] `TODO.md`
- [ ] `CHANGELOG.md`
- [ ] `MANIFEST.md`
- [ ] `VERSION.json` nur als Entwicklungsphase aktualisieren
- [ ] `docs/STATUS_0.3.0.md`
- [ ] `docs/DECISIONS_0.3.0.md`
- [ ] `docs/MANIFEST_0.3.0_C.md`

## 6. Änderungsvolumen

**Erwartete Einstufung: mittel.**

Hauptbetroffen:

- HTML-Struktur der festen oberen Bedienzone
- CSS der Schnellstarterleiste und des Layout-Menüs
- Workspace-UI-Anbindung
- kleine Erweiterung der Workspace-State-API
- Tests und Quality Gate
- Entwicklungsdokumentation

Nicht betroffen:

- Modul-Lebenszyklus
- Fachmodule
- Netzwerk
- Debug-Speicher
- Resize
- Drag & Drop

## 7. Risiken und Schutzmaßnahmen

### Risiko: Nutzer blendet alles aus

Schutz: `Layout` bleibt außerhalb des Workspace permanent sichtbar.

### Risiko: UI und gespeicherter Zustand laufen auseinander

Schutz: Rendern liest ausschließlich aus der zentralen Workspace-API.

### Risiko: doppelte Speicherung

Schutz: nur Workspace-State schreibt persistent; UI ruft nur dessen Methoden auf.

### Risiko: Mobile Leiste wird unbedienbar

Schutz: `Layout` liegt im festen, nicht scrollenden Primärbereich. Nur sekundärer Inhalt darf horizontal überlaufen.

### Risiko: Reset löscht andere Daten

Schutz: bestehender isolierter Reset-Vertrag bleibt unverändert.

## 8. Abnahmekriterien

0.3.0-C ist erst abgeschlossen, wenn:

- [ ] alle fünf Panels einzeln steuerbar sind
- [ ] alle fünf gleichzeitig ausgeblendet werden können
- [ ] `Layout` trotzdem erreichbar bleibt
- [ ] `Alle anzeigen` funktioniert
- [ ] Standardlayout reproduzierbar wiederhergestellt wird
- [ ] Reihenfolge und Größe beim Aus-/Einblenden erhalten bleiben
- [ ] Maus und Tastatur funktionieren
- [ ] sichtbares Feedback verständlich ist
- [ ] keine neue externe Abhängigkeit existiert
- [ ] Branch-Diff geprüft ist
- [ ] Branch nicht hinter `main` liegt
- [ ] `npm run verify` erfolgreich ist
- [ ] PR mergebar ist
- [ ] Merge und Main-Stichprobe erfolgt sind

## 9. Rückweg

Der gesamte 0.3.0-C-Patch wird als eigener Pull Request umgesetzt und kann als Einheit revertiert werden.

Workspace-Layoutdaten bleiben versionsgebunden. Es gibt keine serverseitige Migration.

## 10. Nächste zwei Schritte

### Danach 0.3.0-D – Resize

1. Breite in ganzen Rastereinheiten ändern
2. Höhe innerhalb gültiger Grenzen ändern
3. Maus, Touch und Tastatur unterstützen
4. nur validierte Endwerte speichern
5. Desktopwerte bei kleineren Viewports erhalten

### Danach 0.3.0-E – Reorder & Drag and Drop

1. dedizierten Drag-Griff ergänzen
2. nur Reihenfolge verändern
3. keine freien Pixelkoordinaten speichern
4. Abbruch ohne Zustandsverlust
5. vollständige Tastaturalternative

## Empfehlung

0.3.0-C ausschließlich auf Sichtbarkeit, feste Schnellstarterleiste und sicheren Wiederherstellungsweg begrenzen. Resize und Drag & Drop nicht vorziehen. Dadurch bleibt die neue Bedienmechanik klein, testbar und bei Fehlern leicht rückgängig zu machen.
