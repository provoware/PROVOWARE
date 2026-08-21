# Entwicklungsplan 0.3.0-B – State Foundation & Autosave/Reset

## Ziel in einfacher Sprache

Diese Teilstufe baut das stabile Gedächtnis der Arbeitsfläche. Die Anwendung kann einen Layoutzustand sicher prüfen, bereinigen, laden, lokal speichern und vollständig zurücksetzen. Noch wird **kein Panel sichtbar verschoben, versteckt oder in der Größe verändert**.

Damit sind belastbare Regeln für den Zustand vorhanden. Erst spätere Bedienfunktionen greifen darauf zu.

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

Kanonischer Befehl:

```bash
npm run verify
```

Der Testlauf prüft:

- [x] reproduzierbaren Standardzustand
- [x] Reihenfolge mit unbekannten und doppelten IDs
- [x] fehlende Panels
- [x] Größenbegrenzung
- [x] falsche Schema-Version
- [x] beschädigtes JSON
- [x] Speichern und erneutes Laden
- [x] gesperrten Speicher
- [x] Reset ohne Löschen der Debug-Einstellungen

Reales Ergebnis des PR-Laufs:

- `QUALITY GATE: OK (35 Dateien geprüft)`
- `11` Tests
- `11` erfolgreich
- `0` fehlgeschlagen

## 9. Änderungsvolumen

**Einstufung:** mittel.

PR #66 änderte `19` Dateien.

### Laufzeit

- 1 neue Zustandsdatei
- 1 kleine Startanbindung in `assets/app.js`
- 1 zusätzlicher lokaler Script-Verweis in `index.html`

### Qualitätssicherung

- 1 neue Testdatei
- Testbefehl auf alle Testdateien erweitert
- vorhandenes Quality Gate um Pflichtdateien und Script-Reihenfolge ergänzt

### Dokumentation

- Entwicklungsplan, Entscheidungen, Status, TODO, README, Logging, Debugging und Manifeste synchronisiert
- Produktversion bleibt `0.2.0`, bis die vollständige Workspace Engine abgenommen ist

## 10. Wer oder was ist betroffen?

### Nutzer

Keine neue sichtbare Bedienfunktion. Der Start lädt zusätzlich die interne Workspace-Zustandsverwaltung.

### Nutzerdaten

Nur der versionsgebundene lokale Workspace-Schlüssel kann gelesen, geschrieben oder entfernt werden.

### Debug-Einstellungen

Nicht betroffen.

### Module

Nicht betroffen; Modulvertrag und Modul-Registry bleiben unverändert.

### Netzwerk

Nicht betroffen; keine Übertragung.

## 11. Rückweg

Der gesamte 0.3.0-B-Patch kann über PR #66 zurückgenommen werden.

Zusätzlich gilt:

- kein Serverzustand
- keine Datenmigration
- keine Änderung an Fachmoduldaten
- Workspace-Daten sind auf einen eigenen versionierten Schlüssel begrenzt

## 12. Abnahmekriterien

0.3.0-B ist abgeschlossen:

- [x] Laufzeitbasis implementiert
- [x] Zustandslogik getrennt von Browser-Speicherung testbar
- [x] Laden, Speichern und Reset robust
- [x] Fehlerfälle automatisiert getestet
- [x] keine neue Abhängigkeit entstanden
- [x] sichtbare UI unverändert geblieben
- [x] vollständiger Branch-Diff gegen `main` kontrolliert
- [x] Branch beim Diff-Check 0 Commits hinter `main`
- [x] GitHub Quality Gate erfolgreich
- [x] Pull Request #66 mergebar
- [x] PR #66 per Squash gemergt
- [x] `assets/workspace-state.js` und `VERSION.json` auf `main` stichprobenartig nachgeprüft

## 13. Releaseabschluss der Teilstufe

- PR: `#66`
- Quality Gate: `success`
- geprüfte Dateien: `35`
- Tests: `11/11` erfolgreich
- Merge: `069ad34f2b869fb91dc1c7726cb5903431863cfb`
- freigegebene Produktversion bleibt: `0.2.0`
- Workspace-Vertragsversion: `1`

### Nicht blockierender Workflow-Hinweis

GitHub meldet für die aktuell eingesetzten Actions der Generation `v4` eine Warnung zur auslaufenden internen Node-20-Laufzeit. Das eigentliche Projekt-Quality-Gate lief erfolgreich mit Node `20.20.2`.

Die Workflow-Hygiene wird getrennt betrachtet und spätestens in 0.3.0-G erneut geprüft. Sie war kein Fehler von 0.3.0-B.

## 14. Nächste zwei Schritte

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

Direkt mit **0.3.0-C** fortfahren. Der permanente `Layout`-Schalter und die kompakte Schnellstarterleiste lösen zuerst die sichere Sichtbarkeit. Resize und Drag & Drop bleiben getrennte spätere Patches.
