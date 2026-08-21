# Entwicklungsplan 0.3.0-B – State Foundation & Autosave/Reset

## Ziel in einfacher Sprache

Diese Teilstufe baut das stabile Gedächtnis der Arbeitsfläche. Die Anwendung soll einen Layoutzustand sicher prüfen, bereinigen, laden, lokal speichern und vollständig zurücksetzen können. Noch wird **kein Panel sichtbar verschoben, versteckt oder in der Größe verändert**.

Damit entstehen zuerst belastbare Regeln für den Zustand. Erst spätere Bedienfunktionen greifen darauf zu.

## Begriffe vorab

- **Zustand (State):** die aktuell gültigen Layoutdaten der Arbeitsfläche.
- **Validierung:** Prüfung, ob Daten grundsätzlich zum vereinbarten Format passen.
- **Normalisierung:** fehlerhafte oder fehlende Einzelwerte werden kontrolliert auf sichere Werte gebracht.
- **Persistenz:** dauerhaftes lokales Speichern über einen Browser-Neustart hinweg.
- **Seiteneffekt:** eine Aktion außerhalb einer reinen Berechnung, zum Beispiel Browser-Speicherung oder Logging.
- **Unit-Test (kleiner automatischer Funktionstest):** prüft eine klar abgegrenzte Funktion mit festen Eingaben und erwarteten Ergebnissen.
- **Fallback (Rückfallregel):** sicherer Standard, wenn gespeicherte Daten nicht nutzbar sind.

## 1. Ausgangsstand

- Produkt: `PROVOWARE ALL-IN 2026`
- freigegebene Produktversion: `0.2.0`
- Entwicklungsstufe: `0.3.0-B`
- Baseline dieser Teilstufe: `59491ad1d5fa199402ddf4d72d71eddb525d43a8`
- Workspace-Vertrag: Version `1`
- Speicher-Schlüssel: `provoware.allin.workspace.main.v1`
- Modulvertrag bleibt unverändert bei Version `1`
- keine neuen Laufzeitabhängigkeiten

## 2. Bestätigte Produktentscheidungen

- [x] Layoutänderungen werden später automatisch lokal gespeichert.
- [x] `Standardlayout wiederherstellen` löscht ausschließlich Workspace-Layoutdaten.
- [x] Alle Panels dürfen später vollständig ausgeblendet werden.
- [x] Die Wiederherstellung bleibt über einen festen `Layout`-Schalter außerhalb des veränderbaren Workspace erreichbar.
- [x] Unter dem festen oberen Bereich ist für 0.3.0-C eine kompakte Schnellstarter- und Menüleiste vorgesehen.
- [x] Die Schnellstarterleiste bleibt selbst **nicht** Teil des verschiebbaren Workspace.
- [x] Drag & Drop bleibt bis 0.3.0-E gesperrt.

## 3. Änderungsgrenze für 0.3.0-B

### Enthalten

- [x] Workspace-Zustandsverwaltung als eigene kleine Laufzeitdatei
- [x] feste Paneldefinitionen und Standardzustand
- [x] reine Validierungs- und Normalisierungsfunktionen
- [x] sichere lokale Speicherung
- [x] sicheres Laden mit Fallback
- [x] isolierter Reset
- [x] Anbindung an vorhandenes Logging
- [x] automatische Tests für Normalisierung, Speicherung und Fehlerfälle
- [x] Quality Gate um die neue Laufzeitdatei und Tests erweitern
- [x] Entwicklerregeln, Status, Manifest und Fachplanung synchronisieren

### Nicht enthalten

- [x] kein Layout-Schalter in der sichtbaren Oberfläche
- [x] keine Schnellstarterleiste in der sichtbaren Oberfläche
- [x] kein Ein-/Ausblenden von Panels
- [x] kein Resize
- [x] kein Drag & Drop
- [x] keine CSS-Layoutänderung
- [x] keine Änderung des Modulvertrags
- [x] keine Cloud- oder Netzwerkfunktion
- [x] keine neue Bibliothek

## 4. Architektur für maximale Wartbarkeit

### 4.1 Daten

Die unveränderlichen Panelregeln werden zentral als feste Definitionen gehalten. Dazu gehören unter anderem ID, Standardreihenfolge, Standardbreite und Größenlimits.

**Regel:** Kein zweites Parallelobjekt mit denselben Grenzen anlegen.

### 4.2 Reine Logik

Validierung und Normalisierung arbeiten nur mit Eingabedaten und liefern neue Daten zurück. Sie greifen nicht direkt auf HTML, Browser-Speicher oder Netzwerk zu.

**Nutzen:** Diese Funktionen sind schnell und reproduzierbar testbar.

### 4.3 Seiteneffekte

Browser-Speicherung und Logging liegen in kleinen getrennten Hilfsfunktionen.

**Nutzen:** Ein gesperrter Speicher kann die reine Zustandslogik nicht beschädigen.

### 4.4 Zustand

Es gibt genau eine aktive Zustandsquelle innerhalb der Workspace-Zustandsverwaltung. Externe Aufrufer erhalten Kopien statt veränderbarer interner Referenzen.

### 4.5 Benennung

Neue Workspace-Funktionen werden konsistent und verständlich deutsch benannt, zum Beispiel:

- `initialisieren`
- `normalisieren`
- `zustandSetzen`
- `zustandSpeichern`
- `zuruecksetzen`
- `statusLesen`

Bestehende veröffentlichte Schnittstellen anderer Subsysteme werden nicht nur für Stilgleichheit umbenannt.

## 5. Datenfluss

Der Startweg lautet:

`Standarddefinition -> lokalen Text lesen -> JSON parsen -> Version prüfen -> normalisieren -> gültigen Zustand setzen -> Korrekturen protokollieren`

Eine spätere Layoutaktion nutzt:

`neuen Kandidatenzustand -> normalisieren -> internen Zustand ersetzen -> lokal speichern`

Der Reset nutzt:

`nur Workspace-Schlüssel entfernen -> Standardzustand setzen -> Ereignis protokollieren`

## 6. Fehler- und Reparaturmatrix

- [x] kein gespeicherter Zustand -> Standardlayout
- [x] ungültiges JSON -> Standardlayout und reparierter Workspace-Schlüssel
- [x] falsche Schema-Version -> Standardlayout
- [x] falsche Workspace-ID -> Standardlayout
- [x] unbekannte Panel-ID -> ignorieren und protokollieren
- [x] fehlende Panel-ID -> nach Standardreihenfolge ergänzen
- [x] doppelte Panel-ID -> einmal behalten, Duplikat entfernen
- [x] ungültige Sichtbarkeit -> Standardwert
- [x] ungültige Breite -> Standard oder sichere Begrenzung
- [x] ungültige Höhe -> automatische Höhe oder sichere Begrenzung
- [x] gesperrter Browser-Speicher -> Sitzung bleibt funktionsfähig
- [x] Reset bei gesperrtem Speicher -> In-Memory-Standardzustand bleibt funktionsfähig
- [x] Reset -> Debug-Einstellungen und andere Browserdaten bleiben erhalten

## 7. Nutzerfeedback und Logging

Workspace-Ereignisse verwenden den Bereich `WORKSPACE`.

### Stufe 1 – wichtig

- Speicher nicht lesbar
- Speicher nicht beschreibbar
- gespeicherter Zustand beschädigt
- Reset durchgeführt

### Stufe 2 – Diagnose

- Zustandsverwaltung initialisiert
- Zustand normalisiert
- fehlende oder unbekannte Panels korrigiert
- Zustand erfolgreich gespeichert

### Grundregel

Die sichtbare Oberfläche bleibt in 0.3.0-B unverändert. Technische Meldungen erscheinen nur im vorhandenen Debugbereich. Erst 0.3.0-C erhält sichtbares Layout-Nutzerfeedback.

## 8. Automatische Prüfung

Kanonischer Befehl bleibt:

```bash
npm run verify
```

Der Testlauf prüft zusätzlich:

- [x] reproduzierbaren Standardzustand
- [x] Reihenfolge mit unbekannten und doppelten IDs
- [x] fehlende Panels
- [x] Größenbegrenzung
- [x] falsche Schema-Version
- [x] beschädigtes JSON
- [x] Speichern und erneutes Laden
- [x] gesperrten Speicher
- [x] Reset ohne Löschen der Debug-Einstellungen

## 9. Änderungsvolumen

**Einstufung:** mittel.

### Laufzeit

- 1 neue Zustandsdatei
- 1 kleine Startanbindung in `assets/app.js`
- 1 zusätzlicher lokaler Script-Verweis in `index.html`

### Qualitätssicherung

- 1 neue Testdatei
- Testbefehl auf alle Testdateien erweitert
- vorhandenes Quality Gate um Pflichtdateien und Script-Reihenfolge ergänzt

### Dokumentation

- Entwicklungsplan, Entscheidungen, Status, TODO und Manifest werden synchronisiert
- Produktversion bleibt `0.2.0`, bis die vollständige Workspace Engine abgenommen ist

## 10. Wer oder was ist betroffen?

### Nutzer

Keine neue sichtbare Bedienfunktion. Der Start lädt künftig zusätzlich die interne Workspace-Zustandsverwaltung.

### Nutzerdaten

Nur der versionsgebundene lokale Workspace-Schlüssel kann gelesen, geschrieben oder entfernt werden.

### Debug-Einstellungen

Nicht betroffen.

### Module

Nicht betroffen; Modulvertrag und Modul-Registry bleiben unverändert.

### Netzwerk

Nicht betroffen; keine Übertragung.

## 11. Rückweg

Der gesamte 0.3.0-B-Patch kann über seinen Pull Request zurückgenommen werden.

Zusätzlich gilt:

- kein Serverzustand
- keine Datenmigration
- keine Änderung an Fachmoduldaten
- Workspace-Daten sind auf einen eigenen versionierten Schlüssel begrenzt

## 12. Abnahmekriterien

0.3.0-B ist erst abgeschlossen, wenn:

- [x] Laufzeitbasis implementiert ist
- [x] Zustandslogik getrennt von Browser-Speicherung testbar ist
- [x] Laden, Speichern und Reset robust sind
- [x] Fehlerfälle automatisiert getestet sind
- [x] keine neue Abhängigkeit entstanden ist
- [x] sichtbare UI unverändert geblieben ist
- [ ] vollständiger Branch-Diff gegen aktuellen `main` kontrolliert ist
- [ ] GitHub Quality Gate erfolgreich ist
- [ ] Pull Request mergebar ist
- [ ] PR gemergt und `main` stichprobenartig nachgeprüft ist

## 13. Nächste zwei Schritte

### 0.3.0-C – Visibility Controls + kompakte Menüleiste

1. feste kompakte Schnellstarter-/Menüleiste direkt unter dem oberen Bereich anlegen
2. permanenten `Layout`-Schalter dort unterbringen
3. Panel-Liste öffnen
4. jedes Panel einzeln ein-/ausblendbar machen
5. `Alle anzeigen` und `Standardlayout wiederherstellen` dauerhaft erreichbar halten
6. Tastatur- und Fokusführung testen
7. Nutzerfeedback nach `Aktion -> Ergebnis -> nächster Schritt` ausgeben

### 0.3.0-D – Resize

1. Breitenänderung auf ganze Rastereinheiten begrenzen
2. Höhenänderung auf gültige Panelgrenzen begrenzen
3. Maus, Touch und Tastatur unterstützen
4. Desktopwerte bei Tablet/Mobil nur temporär begrenzen
5. Änderungen erst nach Abschluss speichern

## Empfehlung

Nach erfolgreichem Merge von 0.3.0-B direkt mit **0.3.0-C** fortfahren. Der permanente `Layout`-Schalter und die kompakte Schnellstarterleiste lösen dann zuerst die sichere Sichtbarkeit. Resize und Drag & Drop bleiben weiterhin getrennte spätere Patches.
