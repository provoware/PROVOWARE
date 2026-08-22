# Entwicklungsplan 0.3.0-C – Sichtbarkeit & kompakte Schnellstarterleiste

## Ziel in einfacher Sprache

Diese Teilstufe macht die vorhandenen Workspace-Panels erstmals sichtbar steuerbar. Direkt unter dem festen oberen Bereich entsteht eine kompakte Schnellstarter-/Menüleiste. Der wichtigste Rettungsweg `Layout` bleibt dort immer sichtbar und liegt bewusst außerhalb der veränderbaren Arbeitsfläche.

Alle Panels dürfen ausgeblendet werden. Trotzdem muss der Nutzer jederzeit ohne Konsole, Neuinstallation oder Löschen anderer Browserdaten wieder zu einem vollständigen Standardlayout zurückkehren können.

## Begriffe vorab

- **Sichtbarkeit:** Ein Panel wird angezeigt oder ausgeblendet, ohne seine gespeicherte Reihenfolge oder Größe zu verlieren.
- **Schnellstarterleiste:** kompakte feste Leiste mit häufig benötigten Layoutfunktionen.
- **Fokus:** markiert das aktuell per Tastatur bedienbare Element.
- **Live-Status:** kurze Textmeldung, die eine ausgeführte Aktion bestätigt.
- **ARIA:** zusätzliche HTML-Informationen für Bedienhilfen.
- **Regression:** eine neue Änderung beschädigt bereits funktionierendes Verhalten.

## 1. Baseline

- Produkt: `PROVOWARE ALL-IN 2026`
- freigegebene Produktversion: `0.2.0`
- Entwicklungsstufe: `0.3.0-C`
- Baseline: `247b584e87f4e041e6f405932328659e895bfbb7`
- Workspace-Vertrag: Version `1`
- bestehende Zustandsbasis: `0.3.0-B`
- lokaler Schlüssel: `provoware.allin.workspace.main.v1`
- keine neue externe Laufzeitabhängigkeit

## 2. Bestätigte Entscheidungen

- [x] Alle Workspace-Panels dürfen vollständig ausgeblendet werden.
- [x] Ein permanenter `Layout`-Schalter liegt außerhalb des veränderbaren Workspace.
- [x] Die Schnellstarterleiste liegt direkt unter dem festen oberen Bereich.
- [x] Mobile Option A: Leiste bleibt einzeilig und kompakt; `Layout` bleibt fest sichtbar.
- [x] Nur sekundäre Leisteninhalte dürfen horizontal scrollen.
- [x] Keine zweite unnötige Navigation erzeugen.
- [x] Resize bleibt in 0.3.0-D.
- [x] Drag & Drop bleibt in 0.3.0-E.

## 3. Änderungsgrenze

### Enthalten

- [x] feste kompakte Schnellstarterleiste
- [x] permanenter `Layout`-Schalter
- [x] Layout-Menü mit den fünf Kernpanels
- [x] jedes Panel einzeln ein-/ausblendbar
- [x] `Alle anzeigen`
- [x] `Standardlayout wiederherstellen`
- [x] Sichtbarkeit über die zentrale Workspace-Zustandsverwaltung
- [x] automatische lokale Speicherung nach Sichtbarkeitsänderung
- [x] ausgeblendete Panels behalten Reihenfolge und Größe
- [x] verständliches Nutzerfeedback
- [x] Tastaturbedienung und Fokusführung für die neue Menüfunktion
- [x] automatische Tests und Quality-Gate-Prüfungen
- [x] Dokumentation, TODO und Manifeste synchronisieren

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

`assets/workspace-state.js` bleibt die einzige verbindliche Quelle für Workspace-Zustand und Speicherung.

Die sichtbare Bedienlogik schreibt nicht selbst in `localStorage`.

### 4.2 UI-Logik ist getrennt

`assets/workspace-ui.js` übernimmt ausschließlich:

- DOM-Zuordnung der Panels
- Anzeigen/Ausblenden
- Layout-Menü öffnen/schließen
- Fokusführung
- Nutzerfeedback
- Verbindung zwischen Bedienaktion und Workspace-API

Die Datei besitzt keinen eigenen persistenten Layoutzustand.

### 4.3 Stabile Panel-Zuordnung

Die fünf sichtbaren Panels verwenden `data-workspace-panel` mit den Vertrags-IDs:

1. `overview`
2. `modules`
3. `work`
4. `details`
5. `system-status`

Die Schalter im Layout-Menü verwenden dieselben IDs über `data-layout-panel`.

### 4.4 Kurze Funktionen

Die Bedienlogik ist in kleine Aufgaben getrennt, unter anderem:

- `zustandAnwenden()`
- `menueSetzen()`
- `panelSichtbarkeitAendern()`
- `alleAnzeigen()`
- `standardWiederherstellen()`
- `statusMelden()`
- `aktionAusfuehren()`

Browser-Speicherung bleibt vollständig in der State-Schicht.

## 5. Schrittfolge und Checkliste

### 5.1 Vorprüfung

- [x] aktuellen `main`-Stand `247b584e87f4e041e6f405932328659e895bfbb7` bestätigt
- [x] bestehende IDs, Raster und Breakpoints geprüft
- [x] vorhandene Workspace-API gelesen
- [x] keine parallele Speicherung eingeführt
- [x] Diff-Grenze auf Sichtbarkeit und feste Layoutsteuerung begrenzt

### 5.2 Workspace-State minimal erweitern

- [x] zentrale Methode `panelSichtbarkeitSetzen` ergänzt
- [x] zentrale Methode `allePanelsAnzeigen` ergänzt
- [x] unbekannte Panel-ID wird vor Zustandsänderung abgelehnt
- [x] Änderungen laufen über vorhandene Normalisierung und Speicherung
- [x] Reset bleibt isoliert auf dem Workspace-Schlüssel
- [x] unveränderte Sichtbarkeit erzeugt keinen unnötigen neuen Zustand

### 5.3 HTML-Struktur

- [x] Schnellstarterleiste nach `topbar` und vor `main` eingefügt
- [x] `Layout`-Schalter permanent sichtbar platziert
- [x] Layout-Menü außerhalb von `main` angelegt
- [x] fünf Kontrollfelder für Panels angelegt
- [x] `Alle anzeigen` integriert
- [x] `Standardlayout wiederherstellen` integriert
- [x] Live-Statusbereich ergänzt
- [x] `data-workspace-panel` an allen Kernpanels gesetzt

### 5.4 CSS

- [x] Leiste kompakt und visuell klar gestaltet
- [x] `Layout` als feste primäre Aktion behandelt
- [x] Menü optisch vom Workspace getrennt
- [x] sekundäre Leistenfläche kann horizontal überlaufen
- [x] `Layout` bleibt auf Mobilgeräten im nicht scrollenden Primärbereich
- [x] versteckte Panels werden zuverlässig aus dem Grid entfernt
- [x] Fokuszustände für Buttons, Links und Kontrollfelder sichtbar
- [x] bestehendes `prefers-reduced-motion` bleibt erhalten

### 5.5 Workspace-UI-Controller

- [x] Workspace-API beim Start angebunden
- [x] gespeicherten Zustand auf DOM angewendet
- [x] Kontrollfelder mit Zustand synchronisiert
- [x] einzelne Sichtbarkeit angebunden
- [x] alle Panels anzeigen angebunden
- [x] Standardlayout wiederherstellen angebunden
- [x] Menü per `Escape` schließen
- [x] Klick außerhalb schließt Menü kontrolliert
- [x] Fokus nach `Escape` zum Layout-Schalter zurückführen
- [x] keine Render-/Speicher-Endlosschleife erzeugt
- [x] fehlerhafte UI-Aktion fällt auf letzten gültigen Zustand zurück

### 5.6 Nutzerfeedback

- [x] `Module ausgeblendet.` bzw. entsprechender Bereichsname
- [x] `Alle Bereiche sind wieder sichtbar.`
- [x] `Standardlayout wiederhergestellt.`
- [x] Fehler meldet, dass der bisherige Zustand erhalten bleibt
- [x] technische Fehler zusätzlich im Bereich `WORKSPACE` geloggt

### 5.7 Automatische Tests

- [x] einzelnes Panel ausblenden
- [x] Panel wieder anzeigen und gespeicherte Größe/Reihenfolge erhalten
- [x] alle fünf Panels ausblenden dürfen
- [x] `allePanelsAnzeigen` stellt Sichtbarkeit wieder her
- [x] Reset stellt Standardzustand wieder her
- [x] unbekannte Panel-ID verändert keinen Zustand
- [x] UI wendet gespeicherte Sichtbarkeit auf DOM und Kontrollfelder an
- [x] sichtbare Aktion aktualisiert Nutzerfeedback
- [x] `Alle anzeigen` in UI geprüft
- [x] Reset in UI geprüft
- [x] Layout-Menü per `Escape` schließen und Fokus zurückführen
- [x] statische Zuordnung der fünf Vertrags-IDs im Quality Gate geprüft
- [x] Script-Reihenfolge deterministisch geprüft

### 5.8 Quality Gate

Kanonischer Befehl:

```bash
npm run verify
```

Implementierte Prüfungen:

- [x] neue UI-Datei als Pflichtdatei
- [x] UI-Test als Pflichtdatei
- [x] Script-Reihenfolge korrekt
- [x] Layout-Schalter vorhanden
- [x] Panel-Zuordnung vollständig und eindeutig
- [x] Vertrags-IDs werden direkt aus `assets/workspace-state.js` abgeleitet
- [x] keine externen Laufzeitabhängigkeiten
- [ ] GitHub-Quality-Gate dieses PRs erfolgreich abschließen

### 5.9 Dokumentation

- [x] `README.md`
- [x] `TODO.md`
- [x] `CHANGELOG.md`
- [x] `MANIFEST.md`
- [x] `LOGGING.md`
- [x] `PRO_DEBUGGING.md`
- [x] `VERSION.json` nur als Entwicklungsphase aktualisiert
- [x] `docs/STATUS_0.3.0.md`
- [x] `docs/DECISIONS_0.3.0.md`
- [x] `docs/MANIFEST_0.3.0_C.md`

## 6. Änderungsvolumen

**Einstufung: mittel.**

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

Schutz: `Layout` liegt außerhalb des Workspace und wird vom Quality Gate statisch abgesichert.

### Risiko: UI und gespeicherter Zustand laufen auseinander

Schutz: Rendern liest aus der zentralen Workspace-API. Die UI besitzt keinen eigenen persistenten Zustand.

### Risiko: doppelte Speicherung

Schutz: nur Workspace-State schreibt persistent.

### Risiko: Mobile Leiste wird unbedienbar

Schutz: `Layout` liegt im festen, nicht scrollenden Primärbereich. Nur der sekundäre Statusbereich darf horizontal überlaufen.

### Risiko: Reset löscht andere Daten

Schutz: bestehender isolierter Reset-Vertrag bleibt unverändert.

## 8. Abnahmekriterien

0.3.0-C ist erst abgeschlossen, wenn:

- [x] alle fünf Panels einzeln steuerbar sind
- [x] alle fünf gleichzeitig ausgeblendet werden können
- [x] `Layout` trotzdem außerhalb des Workspace vorhanden ist
- [x] `Alle anzeigen` funktioniert
- [x] Standardlayout reproduzierbar wiederhergestellt wird
- [x] Reihenfolge und Größe beim Aus-/Einblenden erhalten bleiben
- [x] neue Bedienung per Maus und Tastatur bedienbar ist
- [x] sichtbares Feedback verständlich ist
- [x] keine neue externe Abhängigkeit existiert
- [ ] Branch-Diff geprüft ist
- [ ] Branch nicht hinter `main` liegt
- [ ] `npm run verify` im Pull Request erfolgreich ist
- [ ] PR mergebar ist
- [ ] Merge und Main-Stichprobe erfolgt sind

## 9. Rückweg

Der gesamte 0.3.0-C-Patch wird als eigener Pull Request umgesetzt und kann als Einheit revertiert werden.

Workspace-Layoutdaten bleiben versionsgebunden. Es gibt keine serverseitige Migration.

## 10. Nächste zwei Schritte

### 0.3.0-D – Resize

1. Breite in ganzen Rastereinheiten ändern
2. Höhe innerhalb gültiger Grenzen ändern
3. Maus, Touch und Tastatur unterstützen
4. nur validierte Endwerte speichern
5. Desktopwerte bei kleineren Viewports erhalten

### 0.3.0-E – Reorder & Drag and Drop

1. dedizierten Drag-Griff ergänzen
2. nur Reihenfolge verändern
3. keine freien Pixelkoordinaten speichern
4. Abbruch ohne Zustandsverlust
5. vollständige Tastaturalternative

## Empfehlung

0.3.0-C nur nach erfolgreichem Diff-Check und grünem Quality Gate mergen. Danach ausschließlich `0.3.0-D – Resize` beginnen. Drag & Drop bleibt bis `0.3.0-E` gesperrt.
