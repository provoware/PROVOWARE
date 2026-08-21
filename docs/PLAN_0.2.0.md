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
- [ ] Vor dem Merge prüfen, dass der Branch nicht hinter `main` liegt.

**Abnahmekriterium:** Jede geänderte Datei muss direkt dem Modulvertrag, dem Registry-Lebenszyklus, der reproduzierbaren Prüfung oder der zugehörigen Dokumentation dienen.

### 2. Entwicklungsregeln in `AGENTS.md` professionalisieren

- [ ] Reihenfolge `Baseline -> Plan -> Precheck -> Patch -> Prüfung -> Dokumentation -> Diff-Kontrolle -> PR` verbindlich machen.
- [ ] Kleine, codesparsame Änderungen als Standard festlegen.
- [ ] Unbegründete Refactorings, neue Abhängigkeiten und Seiteneffekte ausdrücklich verbieten.
- [ ] Für jeden Patch Zweck, Risiko, Prüfung und Rückweg verlangen.
- [ ] Laienkommunikation festlegen: Fachbegriff zuerst erklären, Fachwort anschließend in Klammern nennen.
- [ ] Statusausgabe mit erledigt, in Arbeit, blockiert und nächstem Schritt standardisieren.
- [ ] Zwei Folgeschritte plus drei Auswahlantworten für die Abschlussfrage vorsehen.

**Abnahmekriterium:** Ein fremder Entwickler kann aus `AGENTS.md` allein erkennen, wie eine Änderung reproduzierbar vorbereitet, umgesetzt, geprüft und dokumentiert wird.

### 3. Minimalen Modulvertrag definieren

- [ ] Pflichtfelder festlegen: `id`, `name`, `version`, `apiVersion`, `entry`, `enabledByDefault`.
- [ ] Optionale Felder nur aufnehmen, wenn sie bereits einen klaren Zweck haben: `description`, `slots`, `capabilities`.
- [ ] Modul-ID auf kleingeschriebene, stabile Bindestrichnamen begrenzen.
- [ ] Version auf das Schema `MAJOR.MINOR.PATCH` begrenzen.
- [ ] Einstiegspfad auf lokale Dateien innerhalb von `modules/` begrenzen.
- [ ] Doppelte Modul-IDs ablehnen.
- [ ] Keine Berechtigungen oder Funktionen automatisch voraussetzen.

**Abnahmekriterium:** Ein ungültiger Moduleintrag wird mit klarer Fehlermeldung abgewiesen, bevor Code geladen wird.

### 4. Leere zentrale Registry anlegen

- [ ] Registry als bewusst leeren Katalog starten.
- [ ] Die Registry darf keine Beispielmodule vortäuschen.
- [ ] Katalogdaten beim Start validieren.
- [ ] Status jedes Moduls intern eindeutig führen: `registered`, `loading`, `loaded`, `active`, `inactive`, `error`.

**Abnahmekriterium:** Die Anwendung startet mit null Modulen fehlerfrei und meldet im Diagnosebereich, dass die Registry initialisiert wurde.

### 5. Reproduzierbaren Modul-Lebenszyklus implementieren

- [ ] `load(id)` lädt genau den registrierten Einstiegspunkt.
- [ ] Das Modul muss sich anschließend über `define(id, implementation)` eindeutig anmelden.
- [ ] `activate(id)` lädt bei Bedarf und aktiviert nur einmal.
- [ ] `deactivate(id)` beendet eine aktive Instanz sauber.
- [ ] `remove(id)` deaktiviert zuerst, räumt Laufzeitdaten auf und entfernt den geladenen Script-Knoten.
- [ ] Mehrfachaufrufe müssen sicher sein oder mit klarer Meldung abgewiesen werden.
- [ ] Fehler dürfen die übrige Anwendung nicht stoppen.

**Abnahmekriterium:** Der Lebenszyklus ist über eine kleine öffentliche API testbar, ohne Fachinhalte in die UI einzubauen.

### 6. Bestehendes Logging anbinden

- [ ] Registry-Ereignisse über die vorhandenen drei Logging-Stufen melden.
- [ ] Stufe 1 nur wichtige Zustandsänderungen und Fehler.
- [ ] Stufe 2 Lade-/Aktivierungsdiagnose.
- [ ] Stufe 3 technische Detaildaten ohne unnötige Nutzerdaten.
- [ ] Fehlertext so formulieren, dass Ursache und nächster Prüfschritt erkennbar sind.

**Abnahmekriterium:** Registry-Fehler erscheinen kontrolliert im Debugbereich und nicht als unlesbarer ungefangener Fehler.

### 7. Reproduzierbare Qualitätsprüfung ohne Laufzeitabhängigkeiten ergänzen

- [ ] `package.json` nur als Befehlszentrale verwenden; keine npm-Pakete zur Laufzeit hinzufügen.
- [ ] Node-20-Prüfscript anlegen.
- [ ] JSON-Syntax und JSON-Format prüfen.
- [ ] Pflichtdateien und lokale Asset-Verweise prüfen.
- [ ] Modulvertrag und Registry automatisch validieren.
- [ ] Doppelte IDs und unsichere Einstiegspfade erkennen.
- [ ] Externe Laufzeit-URLs in `src`/`href` erkennen.
- [ ] Sichere automatische Korrektur (`--fix`) nur für Formatierung, Zeilenenden und eindeutig reparierbare Textfehler erlauben.
- [ ] Keine semantische Codeänderung automatisch durchführen.

**Abnahmekriterium:** `npm run verify` benötigt keine installierten npm-Abhängigkeiten und liefert lokal wie in GitHub Actions dasselbe Ergebnis.

### 8. Automatische GitHub-Prüfung einrichten

- [ ] Workflow bei Pull Requests und Änderungen auf `main` ausführen.
- [ ] Node 20 fest verwenden.
- [ ] Nur Leserechte für Repository-Inhalte vergeben.
- [ ] Zeitlimit setzen, damit defekte Prüfungen nicht endlos laufen.
- [ ] `npm run verify` als einziges kanonisches Quality Gate verwenden.

**Abnahmekriterium:** Ein fehlerhafter Modulvertrag oder Formatfehler lässt den Workflow fehlschlagen.

### 9. Dokumentation synchronisieren

- [ ] `README.md`: Start, Modulprinzip, Qualitätsbefehle und aktueller Stand.
- [ ] `TODO.md`: erledigte 0.2.0-Punkte abhaken und 0.3.0 als nächste Hauptiteration ankündigen.
- [ ] `CHANGELOG.md`: ausschließlich tatsächlich umgesetzte Änderungen dokumentieren.
- [ ] `MANIFEST.md`: neue technische Dateien aufnehmen.
- [ ] `VERSION.json`: auf `0.2.0 – Module Contract & Registry` aktualisieren.
- [ ] Eigene Modulvertragsdokumentation mit einem rein schematischen, nicht ausführbaren Beispiel ergänzen.

**Abnahmekriterium:** README, TODO, CHANGELOG, VERSION und reale Dateien widersprechen sich nicht.

### 10. Abschlussprüfung und Merge

- [ ] Branch gegen `main` vergleichen.
- [ ] Nur geplante Dateien akzeptieren.
- [ ] Quality Gate prüfen.
- [ ] Pull Request mit Ziel, Risiken, Tests und Rückweg dokumentieren.
- [ ] Nur bei grünem Stand mergen.
- [ ] Nach Merge die Dateien auf `main` stichprobenartig erneut lesen.

**Rollback:** Der gesamte Release kann über den einzelnen Pull Request zurückgesetzt werden. Keine Migration verändert Nutzerdaten.

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

0.2.0 gilt erst als fertig, wenn Modulvertrag, leere Registry, Lebenszyklus-API, automatische Qualitätsprüfung, GitHub-Quality-Gate und Dokumentation gemeinsam konsistent sind und der Pull Request ohne ungeklärte Abweichung gemergt wurde.
