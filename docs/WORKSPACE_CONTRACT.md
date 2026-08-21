# Workspace-Vertrag Version 1

## Zweck

Dieser Vertrag legt fest, wie die flexible Arbeitsfläche von **PROVOWARE ALL-IN 2026** aufgebaut, gespeichert, geprüft und zurückgesetzt wird.

Er wird bewusst vor Drag & Drop festgelegt. Dadurch kann die spätere Bedienlogik nur gültige Zustände erzeugen und muss nicht gleichzeitig das Datenmodell erfinden.

## Begriffe in einfacher Sprache

- **Panel-ID:** dauerhafter technischer Name eines Panels.
- **Metadaten:** feste Eigenschaften eines Panels, die der Nutzer nicht verändert.
- **Layoutzustand:** veränderbare Anordnung, Sichtbarkeit und Größe.
- **Rastereinheit:** eine von zwölf gleichmäßigen Spalten der Desktop-Arbeitsfläche.
- **Persistenz:** dauerhaftes Speichern über einen Browser-Neustart hinweg.
- **Transient:** nur während einer aktuellen Aktion vorhanden und nicht dauerhaft gespeichert.
- **Normalisierung:** ungültige oder unvollständige Daten werden kontrolliert auf sichere Werte gebracht.
- **Schema-Version:** Versionsnummer der gespeicherten Datenstruktur.

---

# 1. Grundprinzipien

1. Die Arbeitsfläche verwendet weiterhin ein **12-Spalten-Raster**.
2. Es werden keine freien absoluten `x/y`-Pixelpositionen gespeichert.
3. Die Panelreihenfolge wird als eindeutige Liste stabiler Panel-IDs gespeichert.
4. Feste Panelregeln und veränderlicher Nutzerzustand werden strikt getrennt.
5. Responsive Begrenzungen verändern nur die aktuelle Darstellung und überschreiben nicht automatisch die gespeicherten Desktopwerte.
6. Der Zustand wird automatisch ausschließlich lokal im Browser gespeichert.
7. Ein vollständiger Reset löscht nur Workspace-Einstellungen und stellt das definierte Standardlayout wieder her.
8. Fehlerhafte Speicherung darf die Oberfläche niemals am Start hindern.
9. Unbekannte alte Paneldaten dürfen keine bekannten Panels beschädigen.
10. Drag & Drop darf später ausschließlich gültigen Zustand aus diesem Vertrag erzeugen.

---

# 2. Workspace-Identität

## Vertragsversion

`1`

## Workspace-ID

`main`

Die ID ist stabil und wird nicht aus sichtbaren Überschriften abgeleitet.

## Vorgesehener Speicher-Schlüssel

`provoware.allin.workspace.main.v1`

Der Schlüssel enthält Produkt, Bereich und Schema-Version. Eine spätere inkompatible Version erhält einen neuen Schlüssel statt alte Daten stillschweigend umzudeuten.

---

# 3. Kernpanels

Die aktuelle Oberfläche besitzt fünf Panels innerhalb der Hauptarbeitsfläche.

| stabile Panel-ID | sichtbarer Bereich | Standardbreite | Mindestbreite | Standard-Mindesthöhe |
| --- | --- | ---: | ---: | ---: |
| `overview` | Übersicht | 12 | 6 | 148 px |
| `modules` | Module | 4 | 4 | 220 px |
| `work` | Arbeitsbereich | 8 | 6 | 360 px |
| `details` | Detailbereich | 4 | 4 | 220 px |
| `system-status` | Systemstatus | 12 | 6 | 148 px |

### Hinweise

- Breitenwerte beziehen sich auf das 12-Spalten-Raster.
- `work` ist eine logische Panel-ID. Sie kollidiert bewusst nicht mit der bestehenden HTML-ID `arbeitsbereich` des gesamten `<main>`-Containers.
- Der Debug-/Logging-Bereich gehört **nicht** zum Workspace und wird nicht durch diesen Vertrag verschoben, versteckt oder gespeichert.
- Seitenleiste und Kopfbereich gehören ebenfalls nicht zum Workspace.

---

# 4. Unveränderliche Panel-Metadaten

Diese Werte werden von der Anwendung definiert und nicht im Nutzerzustand gespeichert.

Jedes Panel benötigt später intern mindestens:

```text
id
region
defaultOrder
defaultVisible
defaultWidthUnits
minWidthUnits
maxWidthUnits
defaultHeightPx
minHeightPx
maxHeightPx
```

## Regeln

### `id`

- stabil
- eindeutig
- Kleinbuchstaben, Zahlen und Bindestriche
- darf nach Veröffentlichung nicht ohne Migration umbenannt werden

### `region`

Für Version 1 ausschließlich:

`main`

Ein Panel darf in 0.3.0 nicht in Seitenleiste, Kopfbereich oder Debugbereich verschoben werden.

### `defaultOrder`

Standardreihenfolge:

1. `overview`
2. `modules`
3. `work`
4. `details`
5. `system-status`

### `defaultVisible`

Für alle fünf Kernpanels zunächst:

`true`

### Breite

- Werte ausschließlich von `1` bis `12`
- Mindest- und Höchstwert müssen gültige Rastereinheiten sein
- Standardbreite muss innerhalb der eigenen Grenzen liegen

Vorgesehene Maximalbreite aller Kernpanels:

`12`

### Höhe

Vorgesehene Startgrenzen:

- minimale absolute Grenze: `120 px`
- maximale absolute Grenze: `1200 px`
- individuelle Panelgrenzen dürfen enger sein
- `null` kann später bedeuten: Höhe automatisch durch Inhalt bestimmen

Die tatsächliche Implementierung darf diese Grenzen nur durch einen begründeten Vertragspatch ändern.

---

# 5. Gespeicherter Nutzerzustand

Der gespeicherte Zustand enthält ausschließlich veränderbare Layoutwerte.

Konzeptionelles Schema:

```json
{
  "schemaVersion": 1,
  "workspaceId": "main",
  "order": [
    "overview",
    "modules",
    "work",
    "details",
    "system-status"
  ],
  "panels": {
    "overview": {
      "visible": true,
      "widthUnits": 12,
      "heightPx": null
    }
  }
}
```

Das Beispiel zeigt nur die Struktur. Der reale Zustand enthält später für jedes bekannte Panel einen Eintrag.

## Bewusst nicht gespeichert

- sichtbarer Paneltitel
- HTML-Inhalte
- Formulareingaben eines Fachmoduls
- Debuglogs
- Modul-Laufzeitstatus
- Mausposition
- aktuelle Drag-Position
- Resize-Vorschau während einer Bewegung
- Fokusposition
- Scrollposition
- Browserfenstergröße
- temporär responsive begrenzte Werte

Dadurch bleibt der Zustand klein, nachvollziehbar und datensparsam.

---

# 6. Reihenfolge

## Speicherform

Eine Liste in `order` ist die einzige Quelle für die Nutzerreihenfolge.

Beispiel:

```text
overview -> modules -> work -> details -> system-status
```

## Regeln

- jede bekannte sichtbare oder versteckte Panel-ID darf höchstens einmal vorkommen
- unbekannte IDs werden beim Laden entfernt und protokolliert
- fehlende bekannte IDs werden anhand der Standardreihenfolge ergänzt
- eine leere oder beschädigte Liste fällt auf die Standardreihenfolge zurück
- die Reihenfolge versteckter Panels bleibt erhalten

## Warum keine gespeicherte `order`-Zahl pro Panel?

Eine einzelne geordnete Liste verhindert widersprüchliche Zustände wie zwei Panels mit derselben Positionsnummer.

---

# 7. Sichtbarkeit

Jedes Panel besitzt:

```text
visible = true | false
```

## Regeln

- Ausblenden entfernt das Panel nur aus der sichtbaren Darstellung
- Metadaten und gespeicherte Reihenfolge bleiben erhalten
- gespeicherte Breite und Höhe bleiben erhalten
- Wiederanzeigen verwendet wieder die gespeicherten Werte
- ungültige Sichtbarkeitswerte fallen auf `defaultVisible` zurück

## Sicherheitsanforderung

Es muss außerhalb der veränderbaren Panels eine dauerhaft erreichbare Möglichkeit geben, Panels wieder einzublenden oder das Standardlayout wiederherzustellen.

Die genaue Bedienvariante wird vor Implementierung von 0.3.0-C festgelegt.

---

# 8. Breite

Gespeichert wird:

`widthUnits`

## Desktop ab 981 px

- gespeicherten Wert anwenden
- auf `minWidthUnits` und `maxWidthUnits` begrenzen
- nur ganzzahlige Rastereinheiten verwenden

## Tablet von 681 bis 980 px

Die aktuelle Darstellung wird auf sichere Werte reduziert:

- schmale Panels effektiv mindestens 6 Spalten
- breite Panels können 12 Spalten verwenden
- gespeicherter Desktopwert bleibt unverändert

## Mobil bis 680 px

- jedes sichtbare Panel effektiv 12 Spalten breit
- gespeicherter Desktopwert bleibt unverändert

## Fehlerfälle

Folgende Werte sind ungültig und werden normalisiert:

- negative Werte
- `0`
- Werte über `12`
- Dezimalwerte
- Textwerte
- `NaN`
- nicht endliche Zahlen

---

# 9. Höhe

Gespeichert wird:

`heightPx`

Erlaubte Bedeutungen:

- `null`: automatische Höhe
- positive ganze Zahl innerhalb der Panelgrenzen: feste Nutzerhöhe

## Desktop und Tablet

- gültige feste Höhe anwenden
- Wert auf Mindest- und Höchstgrenze begrenzen

## Mobil

- Höhe primär inhaltsgerecht darstellen
- ein gespeicherter Desktopwert darf ignoriert werden, ohne ihn zu überschreiben

## Fehlerfälle

Ungültige Höhen fallen auf den Standardwert beziehungsweise `null` zurück.

---

# 10. Automatische lokale Speicherung – bestätigte Option A

## Verhalten

Layoutänderungen werden automatisch lokal gespeichert.

## Speicherzeitpunkt

Nicht bei jeder einzelnen Zeigerbewegung schreiben.

Speichern bevorzugt:

- nach abgeschlossener Verschiebung
- nach abgeschlossener Größenänderung
- nach Sichtbarkeitsänderung
- nach Tastaturaktion
- nach expliziter Layoutänderung

Bei kontinuierlichen Änderungen darf zusätzlich eine kurze gebündelte Speicherung verwendet werden.

## Robustheit

Wenn `localStorage` nicht verfügbar, voll oder gesperrt ist:

1. aktuelle Sitzung funktioniert weiter
2. Fehler wird kontrolliert geloggt
3. keine Endlosschleife
4. keine wiederholten störenden Fehlermeldungen bei jeder Zeigerbewegung
5. Standardlayout bleibt jederzeit nutzbar

## Datenschutz

Der Workspace-Zustand enthält ausschließlich Layoutdaten und wird nicht über das Netzwerk übertragen.

---

# 11. Laden und Validieren

Beim Anwendungsstart gilt folgende Reihenfolge:

1. Standarddefinition laden
2. gespeicherten Text lesen
3. JSON sicher parsen
4. `schemaVersion` prüfen
5. `workspaceId` prüfen
6. Reihenfolge normalisieren
7. Panelzustände einzeln prüfen
8. unbekannte Paneldaten entfernen
9. fehlende bekannte Panels ergänzen
10. Größen auf erlaubte Grenzen begrenzen
11. bereinigten Zustand anwenden
12. relevante Korrekturen im Debugbereich protokollieren

## Fehlerstufen

### harmloser Unterschied

Beispiel: neues Panel fehlt in altem Zustand.

Verhalten: ergänzen und weiterarbeiten.

### reparierbarer Fehler

Beispiel: `widthUnits: 99`.

Verhalten: auf gültigen Wert normalisieren und weiterarbeiten.

### unbrauchbarer Zustand

Beispiel: kein gültiges Objekt, falscher Workspace oder nicht lesbares JSON.

Verhalten: kompletten gespeicherten Zustand ignorieren und Standardlayout verwenden.

Die Anwendung darf dadurch nicht abstürzen.

---

# 12. Reset-Vertrag

Sichtbare Bezeichnung:

**Standardlayout wiederherstellen**

## Reset darf ausschließlich

- den Schlüssel `provoware.allin.workspace.main.v1` entfernen
- den Workspace-Zustand im Arbeitsspeicher auf die Standarddefinition setzen
- das Standardlayout sofort neu anwenden
- den Vorgang im technischen Logging vermerken

## Reset darf niemals

- Debugeinstellungen löschen
- Module entfernen
- Fachmoduldaten löschen
- Browserdaten anderer PROVOWARE-Bereiche löschen
- global `localStorage.clear()` verwenden

## Standardzustand nach Reset

Reihenfolge:

1. Übersicht
2. Module
3. Arbeitsbereich
4. Detailbereich
5. Systemstatus

Sichtbarkeit:

- alle sichtbar

Breiten:

- Übersicht: 12
- Module: 4
- Arbeitsbereich: 8
- Detailbereich: 4
- Systemstatus: 12

Höhen:

- wieder die vom Standardlayout definierten Ausgangswerte beziehungsweise automatische Höhe

---

# 13. Temporäre Laufzeitzustände

Folgende Informationen können während späterer Bedienaktionen benötigt werden, dürfen aber nicht persistent gespeichert werden:

```text
isDragging
isResizing
dragSourceId
dropTargetIndex
previewWidth
previewHeight
pointerId
keyboardMoveMode
```

Nach Abbruch oder Ende einer Aktion müssen sie vollständig verworfen werden.

---

# 14. Drag-&-Drop-Vertrag für die spätere Teilstufe

Noch nicht implementiert.

Verbindliche Regeln:

1. Ziehen startet nur an einem dafür vorgesehenen Griff.
2. Interaktionen mit Buttons, Formularen oder zukünftigen Modulinhalten dürfen kein Ziehen auslösen.
3. Während des Ziehens wird nur eine Vorschauposition berechnet.
4. Der gespeicherte Zustand ändert sich erst nach erfolgreichem Abschluss.
5. Abbruch stellt den vorherigen Zustand wieder her.
6. Gespeichert wird nur die neue Reihenfolge, keine Zeigerkoordinate.
7. Jede Mausfunktion benötigt eine Tastaturalternative.

---

# 15. Größenänderungsvertrag für die spätere Teilstufe

Noch nicht implementiert.

Verbindliche Regeln:

1. Breite rastet auf ganzen Rastereinheiten ein.
2. Höhe wird innerhalb definierter Pixelgrenzen gehalten.
3. Vorschauwerte sind transient.
4. Persistiert wird erst ein validierter Endwert.
5. Unterhalb responsiver Breakpoints werden nur effektive Darstellungswerte begrenzt; Desktopwerte bleiben erhalten.
6. Größenänderung muss auch ohne Maus möglich sein.

---

# 16. Logging

Workspace-Ereignisse verwenden später den Bereich:

`WORKSPACE`

Vorgesehene Zuordnung:

### Stufe 1 – Ereignisse

- Zustand nicht lesbar
- Reset durchgeführt
- Speicherung dauerhaft nicht möglich
- schwerer Validierungsfehler

### Stufe 2 – Diagnose

- Zustand geladen
- Zustand gespeichert
- Panel sichtbar/unsichtbar
- Reihenfolge geändert
- Größe übernommen
- einzelne Werte normalisiert

### Stufe 3 – Trace

- berechnete responsive Effektivwerte
- Drag-/Resize-Vorschau nur bei expliziter Trace-Stufe
- keine unnötigen Nutzerdaten

---

# 17. Testvertrag

Vor Freigabe der Workspace Engine müssen automatisiert mindestens geprüft werden:

- gültiger Standardzustand
- doppelte ID in der Definition
- fehlende Panel-ID
- unbekannte gespeicherte Panel-ID
- fehlendes bekanntes Panel im gespeicherten Zustand
- doppelte ID in `order`
- ungültige Reihenfolge
- Breite unter Minimum
- Breite über Maximum
- ungültige Höhe
- falsche Schema-Version
- falsche Workspace-ID
- beschädigtes JSON
- Reset
- localStorage-Ausfall
- Desktop-/Tablet-/Mobil-Normalisierung
- gespeicherter Desktopwert bleibt bei Mobilansicht unverändert

Der kanonische Prüfaufruf bleibt:

```bash
npm run verify
```

---

# 18. Code-Sparsamkeitsregel

Für die erste Implementierung wird keine Framework- oder Drag-&-Drop-Bibliothek eingeführt.

Bevorzugt werden:

- vorhandenes CSS Grid
- Browser-Standardfunktionen
- kleine reine Validierungsfunktionen
- vorhandenes Debugging/Logging
- vorhandenes Quality Gate

Eine neue Abhängigkeit ist nur zulässig, wenn ein konkreter nicht sinnvoll mit Bordmitteln lösbarer Bedarf dokumentiert und separat freigegeben wird.

---

# 19. Offener Punkt vor Sichtbarkeitsimplementierung

Noch festzulegen ist nur die Bedienregel für den Fall, dass der Nutzer alle Panels ausblendet.

Der Vertrag verlangt bereits zwingend eine Wiederherstellungsmöglichkeit außerhalb der Panels. Die konkrete Variante wird vor 0.3.0-C entschieden.

---

# 20. Freigabe dieses Vertrags

Workspace-Vertrag Version 1 gilt als planerische Grundlage für 0.3.0-B bis 0.3.0-G.

Die Produktversion bleibt während dieser reinen Vertragsphase **0.2.0**. Erst die vollständig implementierte, getestete und gemergte Flexible Workspace Engine erhält die Produktversion `0.3.0`.
