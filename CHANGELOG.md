# CHANGELOG

## 0.2.0 – Module Contract & Registry

### Hinzugefügt

- Modulvertrag mit Vertragsversion `1`.
- Leerer kanonischer Modulkatalog in `modules/registry.js`.
- Laufzeit-Registry mit kontrollierten Zuständen für Laden, Aktivieren, Deaktivieren und Entfernen.
- Registry-Anbindung an das bestehende dreistufige Debugging/Logging.
- Detaillierter Entwicklungsplan für 0.2.0.
- Reproduzierbares Node-20-Quality-Gate ohne installierte npm-Pakete.
- Sicherer Auto-Fix für JSON-Format, Zeilenenden und überflüssige Leerzeichen am Zeilenende.
- Automatischer Modul-Lebenszyklustest mit Node-Bordmitteln.
- GitHub-Actions-Workflow für Pull Requests und `main`.
- `.editorconfig` für einheitliche Textdateien.

### Geändert

- `AGENTS.md` auf kleine, begründete und reproduzierbare Patches mit festem Prüf- und Dokumentationsablauf erweitert.
- `index.html` lädt Modulkatalog und Registry vor der Hauptanwendung.
- `assets/app.js` initialisiert die Registry kontrolliert und leitet Registry-Ereignisse an den Logger weiter.
- README, TODO, Manifest, Logging-, Debugging- und Versionsdokumentation auf 0.2.0 aktualisiert.

### Entfernt

- Nichts.

## 0.1.0 – UI Foundation

### Hinzugefügt

- PROVOWARE ALL-IN 2026 als leere modulare HTML-Oberfläche.
- Responsive Seitenleiste, Kopfbereich und flexible Kartenbereiche.
- Versteckbarer Debugging- und Logging-Bereich.
- Drei Logging-Stufen: Ereignisse, Diagnose und Trace.
- Globale Fehler- und Promise-Erfassung mit begrenztem Speicherpuffer.
- Versionsmetadaten in `VERSION.json`.

### Geändert

- README und TODO auf die neue UI-Baseline aktualisiert.

### Entfernt

- Nichts.
