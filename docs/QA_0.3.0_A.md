# Abnahmecheckliste 0.3.0-A

## Inhaltliche Prüfung

- [x] Baseline eindeutig dokumentiert.
- [x] Option A eindeutig dokumentiert.
- [x] Produktversion bleibt während der Planungsphase bei 0.2.0.
- [x] Workspace und Debugbereich klar getrennt.
- [x] Fünf stabile Panel-IDs definiert.
- [x] Standardreihenfolge definiert.
- [x] Sichtbarkeit, Breite, Höhe und erlaubter Bereich definiert.
- [x] Persistente und transiente Zustände getrennt.
- [x] lokaler Speicher-Schlüssel versioniert.
- [x] Reset löscht ausschließlich Workspace-Zustand.
- [x] beschädigte Speicherung besitzt einen sicheren Fallback.
- [x] responsive Darstellung überschreibt keine gespeicherten Desktopwerte.
- [x] Drag & Drop wird noch nicht implementiert.

## Repository-Prüfung

- [ ] Branch ist vor Merge nicht hinter `main`.
- [ ] Diff enthält ausschließlich Planungs- und Statusdokumentation.
- [ ] vorhandenes `npm run verify` läuft im Pull Request erfolgreich.
- [ ] Pull Request ist mergebar.

## Freigabe

0.3.0-A ist abgeschlossen, wenn alle Repository-Prüfungen grün sind und der Planungs-PR gemergt wurde.
