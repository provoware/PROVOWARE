# AGENTS.md

## Zweck

Diese Datei ist die verbindliche Arbeitsanweisung für Änderungen an **PROVOWARE ALL-IN 2026**. Ziel sind kleine, begründete, reproduzierbare und leicht rückgängig zu machende Änderungen statt großer unübersichtlicher Umbauten.

## Begriffe in einfacher Sprache

- **Baseline (Ausgangsstand):** der unveränderte Commit vor einer Iteration.
- **Patch (gezielte Änderung):** möglichst kleine Änderung mit einem klaren Zweck.
- **Precheck (Vorprüfung):** lesende Prüfung vor dem Ändern von Dateien.
- **Postcheck (Nachprüfung):** Prüfung nach der Änderung, ob nur das Beabsichtigte verändert wurde.
- **Diff (Änderungsvergleich):** zeigt exakt, welche Zeilen hinzugekommen, entfernt oder geändert wurden.
- **Regression:** eine neue Änderung macht eine bereits funktionierende Funktion kaputt.
- **Deterministisch:** dieselbe Prüfung liefert bei demselben Stand dasselbe Ergebnis.
- **Quality Gate (Qualitätsschranke):** automatische Prüfung, die einen fehlerhaften Stand vor dem Merge stoppt.
- **Rollback (Rückweg):** dokumentierte Möglichkeit, eine Änderung vollständig zurückzunehmen.
- **Single Source of Truth (eine verbindliche Quelle):** ein Zustand oder eine Regel wird nur an einer Stelle festgelegt und nicht mehrfach kopiert.
- **Kopplung:** beschreibt, wie stark zwei Systemteile voneinander abhängen. Weniger Kopplung erleichtert Tests und spätere Änderungen.

## 1. Verbindliche Grundregeln

1. Pro Iteration genau **ein Hauptziel** bearbeiten.
2. Vor jeder Änderung Baseline, Ziel, Grenzen, Risiken und Rückweg festhalten.
3. Erst lesen und planen, dann ändern.
4. Nur Dateien ändern, die für das Hauptziel nachweisbar nötig sind.
5. Bestehenden Code bevorzugt erweitern statt parallel neu erfinden.
6. Keine spekulativen Refactorings, kosmetischen Massenänderungen oder neuen Abhängigkeiten ohne konkreten Nutzen.
7. Keine versteckten Seiteneffekte: neue Zustände, Speicherung, Netzwerkzugriffe oder Berechtigungen müssen ausdrücklich dokumentiert werden.
8. Automatische Korrekturen dürfen nur eindeutig sichere Format- oder Strukturfehler ändern; keine fachliche Logik automatisch umschreiben.
9. Fehler nicht verschlucken. Fehler müssen kontrolliert behandelt, sinnvoll geloggt und für Laien verständlich beschrieben werden.
10. Dokumentation, TODO, Changelog und Version müssen den realen Codezustand widerspiegeln.
11. Ein Pull Request darf erst gemergt werden, wenn der geplante Diff geprüft und alle verfügbaren Quality Gates grün sind.
12. Bei unklarer Baseline, Datenintegrität, Sicherheitswirkung oder fehlendem Rückweg nicht automatisch weiterarbeiten.
13. Neue Datenformate, lokale Speicherstrukturen und öffentliche Schnittstellen müssen versioniert werden.
14. Benutzertexte und Projektdokumentation werden klar und konsistent auf Deutsch benannt. Neue technische Bezeichner eines Subsystems sollen innerhalb dieses Subsystems ebenfalls konsistent und verständlich benannt werden; bestehende veröffentlichte Schnittstellen werden nicht nur aus Stilgründen massenhaft umbenannt.
15. Jede Mechanik braucht einen konkreten Nutzen. Ohne Nutzer-, Qualitäts- oder Wartbarkeitsgewinn wird sie nicht eingebaut.

## 2. Verbindlicher Iterationsablauf

`BASELINE -> ZIEL -> PLAN -> PRECHECK -> PATCH -> FORMAT/FIX -> TEST -> POSTCHECK -> DOKUMENTATION -> DIFF-GATE -> PR -> MERGE -> MAIN-CHECK`

### 2.1 BASELINE – Ausgangsstand sichern

- aktuellen `main`-Commit feststellen
- aktuelle Version lesen
- vorhandene TODO-/Planpunkte lesen
- betroffene Dateien vor Änderung lesen
- eigenen Feature-Branch vom aktuellen `main` erstellen

**Ergebnis:** eindeutiger Startpunkt und einfacher Rückweg.

### 2.2 ZIEL – Änderungsgrenze definieren

Vor dem Patch schriftlich festhalten:

- Hauptziel
- ausdrücklich nicht enthaltene Arbeiten
- erwartete Dateien
- mögliche Risiken
- Abnahmekriterien
- Rückweg
- erwartetes Änderungsvolumen: klein, mittel oder groß
- betroffene Nutzergruppen oder Systemteile

### 2.3 PLAN – nummerierte Checkliste zuerst

Vor Codeänderungen einen detaillierten Plan erstellen. Der Plan enthält mindestens:

1. Ausgangslage
2. gewünschtes Endverhalten
3. betroffene Dateien/Module
4. Daten- oder Schnittstellenvertrag
5. Implementierungsreihenfolge
6. automatische Prüfungen
7. manuelle Stichproben
8. Dokumentationsänderungen
9. Rückweg
10. Änderungsvolumen und betroffene Bereiche
11. Nutzerfeedback und Fehlermeldungen
12. nächste zwei logische Entwicklungsstufen

Jeder Punkt wird als Checkliste geführt und erst nach realer Umsetzung abgehakt.

### 2.4 PRECHECK – nur lesen, noch nichts reparieren

- betroffene Dateien vollständig oder gezielt lesen
- bestehende Schnittstellen wiederverwenden
- Abhängigkeiten und Aufrufreihenfolge prüfen
- nach doppelten Lösungen suchen
- prüfen, ob die geplante Änderung mit weniger Code möglich ist
- prüfen, ob Daten, Logik und Darstellung sauber getrennt werden können

**Abbruchbedingung:** Wenn die reale Codebasis dem Plan widerspricht, zuerst den Plan korrigieren.

### 2.5 PATCH – codesparsam ändern

Für jeden Patch gilt:

- kleinster sinnvoller Änderungsumfang
- eine fachliche Ursache pro Patch
- keine unbeteiligten Dateien anfassen
- bestehende Namen und Muster beibehalten, solange sie nicht Ursache des Problems sind
- neue Abstraktionen erst einführen, wenn mindestens ein realer Wiederverwendungsfall besteht
- keine Platzhalterfunktionen vortäuschen
- keine toten Optionen oder ungenutzten Konfigurationen anlegen
- doppelte Validierungs- oder Zustandslogik vermeiden
- reine Daten und Regeln von Seiteneffekten wie DOM, Speicherung und Logging trennen

Jeder Patch muss vier Fragen beantworten:

1. **Warum ist die Änderung nötig?**
2. **Was kann dadurch kaputtgehen?**
3. **Wie wird sie geprüft?**
4. **Wie wird sie zurückgenommen?**

### 2.6 FORMAT/FIX – nur sichere automatische Korrekturen

Kanonischer Befehl:

```bash
npm run fix
```

Erlaubt sind nur reproduzierbare, semantikneutrale Korrekturen wie:

- einheitliche JSON-Einrückung
- finales Zeilenende
- Entfernen überflüssiger Leerzeichen am Zeilenende
- eindeutig reparierbare Textformatfehler

Nicht automatisch ändern:

- Programmlogik
- Bedingungen
- API-Verhalten
- Datenmigrationen
- Berechtigungen
- Modulaktivierung

### 2.7 TEST – automatische Prüfung

Kanonischer Befehl:

```bash
npm run verify
```

Die Prüfung soll ohne installierte npm-Laufzeitpakete funktionieren und mindestens kontrollieren:

- Syntax und Format der Projekt-JSON-Dateien
- erforderliche Kerndateien
- lokale HTML-Asset-Verweise
- keine unbeabsichtigten externen Laufzeit-URLs
- Modulvertrag und Registry
- doppelte IDs
- sichere lokale Modulpfade
- Versionskonsistenz, soweit deterministisch prüfbar
- neue Zustands- oder Speicherverträge mit gezielten Unit-Tests

Wenn ein Test fehlschlägt: Ursache beheben, nicht den Test abschwächen, außer der Test ist nachweislich falsch.

### 2.8 POSTCHECK – Änderung gegen Plan prüfen

Nach dem Patch:

- geänderte Dateien auflisten
- Diff gegen Baseline prüfen
- ungeplante Änderungen entfernen
- neue Abhängigkeiten erneut begründen
- Fehlerszenarien prüfen
- sicherstellen, dass vorhandenes Verhalten erhalten bleibt
- Änderungsvolumen tatsächlich erfassen und gegen die Planung halten

### 2.9 DOKUMENTATION – Realität nachziehen

Mindestens prüfen:

- `README.md`
- `TODO.md`
- `CHANGELOG.md`
- `VERSION.json`
- `MANIFEST.md`
- passende Fach-/Entwicklerdokumentation

Dokumentiert wird nur, was tatsächlich existiert und geprüft wurde.

### 2.10 DIFF-GATE – letzte Schranke vor dem PR

Ein PR ist nur bereit, wenn:

- Branch nicht unbeabsichtigt hinter `main` liegt
- geänderte Dateien dem Plan entsprechen
- `npm run verify` erfolgreich ist
- keine ungeklärten TODOs innerhalb des Release-Ziels offen sind
- Rückweg dokumentiert ist
- Version und Changelog stimmen
- keine identische Geschäfts-, Validierungs- oder Zustandslogik mehrfach entstanden ist

### 2.11 PR / MERGE / MAIN-CHECK

Pull Request enthält:

- Ziel in einfacher Sprache
- technische Änderungen
- bewusst nicht enthaltene Punkte
- Tests und deren Ergebnis
- bekannte Risiken
- Rückweg
- Änderungsvolumen und betroffene Bereiche
- nächste zwei Entwicklungsstufen

Nach dem Merge mindestens Version, Einstiegspunkt und zentrale neue Datei auf `main` erneut lesen.

## 3. Kommunikationsstandard für Laien

Alle Entwicklungsberichte auf Deutsch.

Fachbegriffe werden **zuerst in Alltagssprache erklärt** und erst anschließend als Fachwort in Klammern genannt. Beispiel:

> Der feste Ausgangsstand vor der Änderung (Baseline) ist Commit `abc123`.

Keine bloßen Statusfloskeln. Jede Statusmeldung nennt konkret, was geprüft oder geändert wurde.

Nutzerfeedback in der Oberfläche folgt, soweit passend, dem Muster:

`Aktion -> Ergebnis -> nächster sinnvoller Schritt`

Fehlertexte sollen Ursache, betroffenen Bereich und eine konkrete nächste Prüfmöglichkeit enthalten, ohne technische Datenfluten anzuzeigen.

### Pflichtformat am Ende jeder Entwicklungsiteration

1. **Entwicklungsstand:** Version, Branch/PR, Fortschritt, Merge-Status.
2. **Umgesetzt:** konkrete Änderungen.
3. **Änderungsvolumen:** Anzahl/Art geänderter Dateien und betroffene Systemteile.
4. **Betroffen:** Nutzer, Daten, Laufzeit oder nur Entwicklung/Dokumentation.
5. **Validierung:** ausgeführte automatische und manuelle Prüfungen.
6. **Offen/Risiken:** nur reale offene Punkte.
7. **Nächster Schritt:** genau der logisch beste Folgeschritt, detailliert angekündigt.
8. **Danach:** zweiter angekündigter Folgeschritt.
9. **Drei sinnvolle Optionen:** A/B/C mit klarer farblicher Empfehlung.
10. **Klärungsfrage:** eine Frage, die Verständnis erhöht oder einen typischen Fehler verhindert.

## 4. Statuskennzeichnung

- 🟢 **ERLEDIGT** – umgesetzt und geprüft
- 🟡 **IN ARBEIT** – geplant oder teilweise umgesetzt
- 🔴 **BLOCKIERT** – kann ohne Klärung oder externe Voraussetzung nicht sicher fortgesetzt werden
- ⚪ **SPÄTER** – bewusst außerhalb der aktuellen Iteration

Fortschrittsprozente nur aus realen Abnahmekriterien ableiten, nicht schätzen.

## 5. Codequalitäts- und Wartbarkeitsregeln

### 5.1 Kleine, eindeutige Einheiten

- Funktionen haben genau eine klar erkennbare Aufgabe.
- Kurze Funktionen sind Standard; deutlich längere Funktionen werden nur akzeptiert, wenn Aufteilung mehr Kopplung oder schlechtere Lesbarkeit erzeugen würde.
- Wiederverwendbare Regeln werden zentral definiert und nicht kopiert.
- Kommentare erklären **warum** eine ungewöhnliche Entscheidung nötig ist, nicht Zeile für Zeile **was** offensichtlicher Code tut.

### 5.2 Daten, Logik und Seiteneffekte trennen

- feste Daten und Verträge in unveränderlichen Konstanten halten
- reine Validierungs- und Normalisierungslogik ohne DOM oder Speicherung schreiben, wenn möglich
- Browser-Speicherung, DOM und Logging über kleine klar abgegrenzte Funktionen anbinden
- keine UI-Komponente als versteckten Datenspeicher benutzen
- keine Logik aus HTML-Texten oder sichtbaren Beschriftungen ableiten

### 5.3 Zustand sauber verwalten

- pro Subsystem genau eine verbindliche Zustandsquelle verwenden
- Zustandswechsel über wenige zentrale Funktionen führen
- gespeicherten Zustand vor Nutzung immer validieren
- temporäre Zustände nicht versehentlich persistent speichern
- Version von gespeicherten Daten und öffentlichen Verträgen ausdrücklich mitführen
- Reset löscht nur den fachlich zugehörigen Schlüssel, niemals pauschal alle Browserdaten

### 5.4 Systeme entkoppeln

- Module kommunizieren über kleine dokumentierte Schnittstellen
- Logging darf keine Geschäftslogik steuern
- Speicherung darf die UI nicht blockieren
- Diagnosefehler dürfen die Kernfunktion nicht lahmlegen
- neue Subsysteme dürfen bestehende globale APIs nicht ungeplant verändern

### 5.5 Reproduzierbare Fehler und verständliche Logs

- Fehlerpfade genauso testen wie Erfolgswege
- Logs nennen Bereich, Ereignis und relevante Ursache
- gleiche Fehlerklasse möglichst mit gleicher Meldungsstruktur ausgeben
- keine unnötigen Nutzerdaten in Logs aufnehmen
- bei reparierten Eingaben die Art der Korrektur nachvollziehbar machen
- Fehler sollen mit demselben Eingabefall reproduzierbar sein

### 5.6 Bestehende technische Grundregeln

- frühe Validierung an Systemgrenzen
- unveränderliche Konstanten für Verträge und Zustandsnamen
- keine globalen Variablen außer ausdrücklich dokumentierten öffentlichen Browser-Schnittstellen
- Nutzer- und Diagnosedaten sparsam halten
- keine Remote-Abhängigkeit, wenn dieselbe Aufgabe zuverlässig lokal lösbar ist
- Browser-Kompatibilität für Firefox und Chrome erhalten
- direkte lokale Nutzung darf nicht versehentlich durch unnötige Serverpflicht zerstört werden

## 6. Abhängigkeitsregel

Neue Bibliotheken oder Frameworks sind nur zulässig, wenn alle Punkte beantwortet sind:

1. Welches konkrete Problem lösen sie?
2. Warum ist die bestehende Standardbibliothek nicht ausreichend?
3. Welche Größe und Wartungslast entsteht?
4. Funktioniert die Kernanwendung ohne Netzwerk weiter?
5. Wie wird die Version reproduzierbar fixiert?
6. Wie sieht der Rückweg aus?

Fehlt eine überzeugende Antwort, keine neue Abhängigkeit hinzufügen.

## 7. Abbruch und Eskalation

Nicht automatisch fortfahren bei:

- unklarem oder bewegtem Ausgangsstand
- widersprüchlichen Versions-/Statusdateien
- unklarer Datenmigration
- möglichem Datenverlust
- ungeklärtem Sicherheits- oder Berechtigungswechsel
- fehlender Möglichkeit zur Validierung
- Änderungen außerhalb des bestätigten Hauptziels

Dann den Blocker konkret benennen und drei sichere Entscheidungsoptionen anbieten.
