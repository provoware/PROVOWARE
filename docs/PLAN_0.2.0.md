# Entwicklungsplan 0.2.0 – Modulvertrag & Registry

## Ziel in einfacher Sprache

PROVOWARE ALL-IN 2026 bekommt eine feste, kleine Schnittstelle für spätere Tools. Jedes Tool kann dadurch nach denselben Regeln bekannt gemacht, geladen, aktiviert, deaktiviert und wieder entfernt werden, ohne die Oberfläche selbst umbauen zu müssen.

## Begriffe vorab

- **Baseline (Ausgangsstand):** der unveränderte Commit, von dem diese Iteration startet.
- **Patch (gezielte Änderung):** eine kleine, nachvollziehbare Änderung mit genau benanntem Zweck.
- **Vertrag (Contract):** feste Regeln, welche Angaben und Funktionen ein Modul bereitstellen muss.
- **Registry (Modulverzeichnis):** zentrale Liste aller bekannten Module.
- **Lebenszyklus (Lifecycle):** definierte Reihenfolge `bekannt -> geladen -> aktiv -> inaktiv -> entfernt`.
- **Deterministisch:** dieselben Eingaben führen bei jeder Prüfung zum selben Ergebnis.
- **Quality Gate (Qualitätsschranke):** automatische Prüfung, die fehlerhafte Änderungen vor dem Merge stoppt.
- **Rollback (Rückweg):** sichere Möglichkeit, die komplette Iteration über den Pull Request zurückzunehmen.

## Ausgangslage

- Produkt: `PROVOWARE ALL-IN 2026`
- Ausgangsversion: `0.1.0 – UI Foundation`
- Baseline-Commit: `cda1c4092d2a041cbacf4a72308ed9b08406317f`
- Oberfläche bleibt fachlich leer.
- Vorhandenes dreistufiges Debugging/Logging bleibt erhalten.
- Die direkte Nutzung über `index.html` soll weiterhin möglich bleiben.

## Nummerierte Schrittfolge und Checkliste

### 1. Baseline einfrieren und Änderungsgrenze festlegen

- [x] Ausgangscommit eindeutig festhalten.
- [x] Eigener Feature-Branch für 0.2.0 anlegen.
- [x] Hauptziel auf Modulvertrag, Registry und dafür notwendige Qualitätsabsicherung begrenzen.
- [x] Keine fachlichen Beispieltools und keine Demo-Inhalte einbauen.
- [x] Vor dem Merge prüfen, dass der Branch nicht hinter `main` liegt.

**Abnahmekriterium:** Jede geänderte Datei muss direkt dem Modulvertrag, dem Registry-Lebenszyklus, der reproduzierbaren Prüfung oder der zugehörigen Dokumentation dienen.

### 2. Entwicklungsregeln in `AGENTS.md` professionalisieren

- [x] Reihenfolge `Baseline -> Plan -> Precheck -> Patch -> Prüfung -> Dokumentation -> Diff-Kontrolle -> PR` verbindlich machen.
- [x] Kleine, codesparsame Änderungen als Standard festlegen.
- [x] Unbegründete Refactorings, neue Abhängigkeiten und Seiteneffekte ausdrücklich verbieten.
- [x] Für jeden Patch Zweck, Risiko, Prüfung und Rückweg verlangen.
- [x] Laienkommunikation festlegen: Fachbegriff zuerst erklären, Fachwort anschließend in Klammern nennen.
- [x] Statusausgabe mit erledigt, in Arbeit, blockiert und nächstem Schritt standardisieren.
- [x] Zwei Folgeschritte plus drei Auswahlantworten für die Abschlussfrage vorsehen.

**Abnahmekriterium:** Ein fremder Entwickler kann aus `AGENTS.md` allein erkennen, wie eine Änderung reproduzierbar vorbereitet, umgesetzt, geprüft und dokumentiert wird.

### 3. Minimalen Modulvertrag definieren

- [x] Pflichtfelder festlegen: `id`, `name`, `version`, `apiVersion`, `entry`, `enabledByDefault`.
- [x] Optionale Felder nur aufnehmen, wenn sie bereits einen klaren Zweck haben: `description`, `slots`, `capabilities`.
- [x] Modul-ID auf kleingeschriebene, stabile Bindestrichnamen begrenzen.
- [x] Version auf das Schema `MAJOR.MINOR.PATCH` begrenzen.
- [x] Einstiegspfad auf lokale Dateien innerhalb von `modules/` begrenzen.
- [x] Doppelte Modul-IDs ablehnen.
- [x] Keine Berechtigungen oder Funktionen automatisch voraussetzen.

**Abnahmekriterium:** Ein ungültiger Moduleintrag wird mit klarer Fehlermeldung abgewiesen, bevor Code geladen wird.

### 4. Leere zentrale Registry anlegen

- [x] Registry als bewusst leeren Katalog starten.
- [x] Die Registry darf keine Beispielmodule vortäuschen.
- [x] Katalogdaten beim Start validieren.
- [x] Status jedes Moduls intern eindeutig führen: `registered`, `loading`, `loaded`, `active`, `inactive`, `error`.

**Abnahmekriterium:** Die Anwendung startet mit null Modulen fehlerfrei und meldet im Diagnosebereich, dass die Registry initialisiert wurde.

### 5. Reproduzierbaren Modul-Lebenszyklus implementieren

- [x] `load(id)` lädt genau den registrierten Einstiegspunkt.
- [x] Das Modul muss sich anschließend über `define(id, implementation)` eindeutig anmelden.
- [x] `activate(id)` lädt bei Bedarf und aktiviert nur einmal.
- [x] `deactivate(id)` beendet eine aktive Instanz sauber.
- [x] `remove(id)` deaktiviert zuerst, räumt Laufzeitdaten auf und entfernt den geladenen Script-Knoten.
- [x] Mehrfachaufrufe müssen sicher sein oder mit klarer Meldung abgewiesen werden.
- [x] Fehler dürfen die übrige Anwendung nicht stoppen.

**Abnahmekriterium:** Der Lebenszyklus ist über eine kleine öffentliche API testbar, ohne Fachinhalte in die UI einzubauen.

### 6. Bestehendes Logging anbinden

- [x] Registry-Ereignisse über die vorhandene dreistufige Logging-Infrastruktur melden.
- [x] Stufe 1 für wichtige Zustandsänderungen und Fehler verwenden.
- [x] Stufe 2 für Lade- und Registry-Diagnose verwenden.
- [x] Stufe 3 für tiefe Trace-Daten reservieren und in 0.2.0 keine künstlichen Daten erzeugen.
- [x] Fehlertext so formulieren, dass Ursache oder betroffener Schritt erkennbar sind.

**Abnahmekriterium:** Registry-Fehler erscheinen kontrolliert im Debugbereich und nicht als unlesbarer ungefangener Fehler.

### 7. Reproduzierbare Qualitätsprüfung ohne Laufzeitabhängigkeiten ergänzen

- [x] `package.json` nur als Befehlszentrale verwenden; keine npm-Pakete zur Laufzeit hinzufügen.
- [x] Node-20-Prüfscript anlegen.
- [x] JSON-Syntax und JSON-Format prüfen.
- [x] Pflichtdateien und lokale Asset-Verweise prüfen.
- [x] Modulvertrag und Registry automatisch validieren.
- [x] Doppelte IDs und unsichere Einstiegspfade erkennen.
- [x] Externe Laufzeit-URLs in `src`/`href` erkennen.
- [x] Sichere automatische Korrektur (`--fix`) nur für Formatierung, Zeilenenden und eindeutig reparierbare Textfehler erlauben.
- [x] Keine semantische Codeänderung automatisch durchführen.
- [x] Automatischen Modul-Lebenszyklustest mit Node-Bordmitteln ergänzen.

**Abnahmekriterium:** `npm run verify` benötigt keine installierten npm-Abhängigkeiten und läuft im GitHub-Quality-Gate reproduzierbar durch.

### 8. Automatische GitHub-Prüfung einrichten

- [x] Workflow bei Pull Requests und Änderungen auf `main` ausführen.
- [x] Node 20 fest verwenden.
- [x] Nur Leserechte für Repository-Inhalte vergeben.
- [x] Zeitlimit setzen, damit defekte Prüfungen nicht endlos laufen.
- [x] `npm run verify` als kanonisches Quality Gate verwenden.
- [x] Quality Gate auf PR #62 real erfolgreich durchlaufen lassen.

**Abnahmekriterium:** Der Pull-Request-Lauf für 0.2.0 wurde mit `success` abgeschlossen.

### 9. Dokumentation synchronisieren

- [x] `README.md`: Start, Modulprinzip, Qualitätsbefehle und aktueller Stand.
- [x] `TODO.md`: erledigte 0.2.0-Punkte abhaken und 0.3.0 als nächste Hauptiteration ankündigen.
- [x] `CHANGELOG.md`: ausschließlich tatsächlich umgesetzte Änderungen dokumentieren.
- [x] `MANIFEST.md`: neue technische Dateien aufnehmen.
- [x] `VERSION.json`: auf `0.2.0 – Module Contract & Registry` aktualisieren.
- [x] Eigene Modulvertragsdokumentation mit einem rein schematischen, nicht ausführbaren Beispiel ergänzen.

**Abnahmekriterium:** README, TODO, CHANGELOG, VERSION und reale Dateien widersprechen sich nicht.

### 10. Abschlussprüfung und Merge

- [x] Branch gegen `main` vergleichen.
- [x] Nur geplante Dateien akzeptieren.
- [x] Quality Gate prüfen.
- [x] Pull Request mit Ziel, Risiken, Tests und Rückweg dokumentieren.
- [x] Nur bei grünem Stand mergen.
- [x] Nach Merge Version, `AGENTS.md`, TODO und Modul-Registry auf `main` stichprobenartig erneut lesen.

**Rollback:** Der gesamte Release kann über PR #62 beziehungsweise dessen Merge zurückgesetzt werden. Keine Migration verändert Nutzerdaten.

## Releaseabschluss

- Pull Request: `#62`
- Release-Merge: `64b7f232acd13535133ee5f0a5e3322cbae7e0ba`
- PR-Quality-Gate: `success`
- Ausgangsbranch war beim Abschluss `0` Commits hinter `main`.
- Version auf `main`: `0.2.0`

## Bewusst nicht Teil von 0.2.0

- keine echten Fachmodule
- kein Drag & Drop
- keine veränderbaren Panelgrößen
- keine Modul-Marktplatzfunktion
- keine Remote-Plugins
- keine automatische Installation fremder Pakete
- kein Diagnoseexport

Diese Punkte bleiben getrennte spätere Iterationen, damit 0.2.0 klein und prüfbar bleibt.

## Geplante nächste zwei Schritte nach 0.2.0

1. **0.3.0 – Flexible Workspace Engine:** Panels verschieben, verbergen und in der Größe ändern; Layoutzustand lokal speichern.
2. **0.4.0 – Diagnose Foundation PRO:** Filter, Kategorien, Zeitmessung, Fehlerkontext und datensparsamen Diagnoseexport ergänzen.

## Freigabedefinition

0.2.0 ist abgeschlossen: Modulvertrag, leere Registry, Lebenszyklus-API, automatische Qualitätsprüfung, GitHub-Quality-Gate, Dokumentation und Merge sind gemeinsam konsistent abgeschlossen.
