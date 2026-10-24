# Release-Pflichtmatrix – PROVOWARE ALL-IN 2026

Stand: 24.10.2026 · freigegebene Produktversion: `0.2.0` · Baseline `main`: `2dec63ff0662e42782894033aed7df3eec1b8f3e` · Entwicklungszweig: `automation/20261024-static-realpath-guard`.

**Regel:** PASS gilt nur für die jeweils belegte Teilprüfung; ein älterer grüner Lauf beweist keine aktuelle Gesamtfreigabe. `OFFEN` bedeutet nicht automatisch defekt, sondern noch nicht vollständig nachgewiesen. Keine erfundenen Prozentwerte.

| Release-Pflicht | Ist / Nachweis | Status |
| --- | --- | --- |
| Kernfunktionen, Grenzfälle und Modulvertrag | Registry, Data Studio, PRO, Recovery, Medien laut `README.md` und vorhandenen Tests; vollständige fachliche Soll/Ist-Abnahme ausstehend | OFFEN |
| Datenverlustschutz und Wiederherstellung | Atomare Speicherung, Sicherungen, Journal-Rollback; bestehende `tests/recovery-envelope*.test.mjs`; reale Stromausfall- und Langzeitprüfung offen | OFFEN |
| Fehlerbehandlung und Sicherheit | H2: Symlink-Ausbruch bei statischer Auslieferung im Quellcode korrigiert; isolierte lokale Pfadtests PASS, GitHub-Regression noch ausstehend | IN PRÜFUNG |
| Design, Lesbarkeit und flexible Bedienung | Workspace und Container-Responsive vorhanden; gezielte 800×600-Prüfung bei hoher Skalierung offen | OFFEN |
| Tastatur und Barrierefreiheit | Skip-Link, Fokus- und Resize-Steuerung vorhanden; vollständiger Tastatur- und Screenreader-Durchlauf offen | OFFEN |
| Leistung und Wartbarkeit | Modulstruktur, Quality Gate und Linter vorhanden; Last- und Langzeittest offen | OFFEN |
| Installation und Paketierung | `start.sh`, `start.cmd`, Node-20+-Start; frische Kubuntu-/Windows-Installation als Release-Gate offen | OFFEN |
| Automatisierte Funktionstests und Regression | `npm run verify` im Hauptzweig: GitHub-Run `39984342697` PASS am Baseline-HEAD; H2-Prüfung auf PR-HEAD offen | TEILBELEGT |
| Integration und GUI/Browser | Frühere Chromium-E2E-Läufe in `docs/STATUS_0.4.4_H1_REAL_MEDIA_ACCEPTANCE.md`; H2-HTTP-Integration, Firefox und Zoom offen | OFFEN |
| CI und Freigabeschranken | `.github/workflows/quality.yml` prüft Node 20 und 24; H2-PR-Gates abwarten | IN PRÜFUNG |
| Dokumentation und Release-Vorbereitung | `AGENTS.md`, `README.md`, `MANIFEST.md`, `TODO.md`, H2-Plan; gesamter Release-Kandidat noch nicht eingefroren | OFFEN |
| Persönliche Endabnahme / Veröffentlichung | Erst nach vollständiger technischer Vorrelease-Reife gebündelt; keine Veröffentlichung ohne Freigabe | BLOCKIERT BIS ZUM RELEASE-KANDIDATEN |

## H2 – reproduzierbarer Nachweis und Rückweg

- **Fehler vor Änderung:** Ein Symlink `assets/alias.txt` zeigte auf eine Datei außerhalb des Projektordners; die bisherige lexikalische Pfadprüfung akzeptierte ihn, `stat()` folgte dem Link. Isolierter lokaler Test reproduziert.
- **Patch:** `scripts/start.mjs` prüft `realpath()`, verbietet externe/versteckte/geschützte Ziele und liefert nur den geprüften kanonischen Pfad aus.
- **Tests:** `tests/start.test.mjs` prüft reguläre öffentliche Dateien, fremde Pfade, Symlinks auf externe/versteckte/geschützte Ziele sowie zulässige interne Aliasse. Symbolische Links werden nur bei fehlender Betriebssystemberechtigung übersprungen.
- **Nicht im Scope:** APIs, Datenmigration, Workspace, Medien und UI.
- **Rückweg:** H2-PR nicht integrieren oder die isolierten H2-Commits zurücknehmen; kein Datenformat verändert.
- **Nächster technischer Schritt:** CI auf dem endgültigen PR-HEAD auswerten; danach echter HTTP-Integrationstest. **Danach:** 800×600/200%-Zoom und Tastaturprüfung.

**Aktueller HEAD, PR und zugehörige Checks:** GitHub-Branch und PR sind verbindliche Quellen; nur erfolgreiche Checks auf genau demselben HEAD als PASS melden.
