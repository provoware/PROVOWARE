# Optimierungsprotokoll – HTTP-Pfadschutz

## 2026-10-23 – Nachtrag zu offenem Sicherheits-Patch vom 21.10.2026

- **Basis-HEAD:** `4a008a1a1c4eb4d0151b95d56c5c7c48bcf82537`.
- **Fehler:** `anfragepfadAufloesen` akzeptierte bisher interne Dateien wie `/.git/config`, da nur die Begrenzung auf das Projektverzeichnis geprüft wurde.
- **Änderung:** Verborgene Pfadsegmente nach der URL-Decodierung ablehnen. Normaler Zugriff auf `index.html` und öffentliche `assets/` bleibt erhalten.
- **Regression:** In `tests/start.test.mjs` sind Verweigerungstests für verborgene Dateien, verschachtelte und kodierte Varianten enthalten, dazu ein positiver Assetfall.
- **Risiko:** Statische URLs zu absichtlich versteckten Dateien werden nun untersagt; dies dient dem Schutz von Projektinterna.
- **Ausgangsevidenz:** Der Fehler wurde im GitHub-Quellcode direkt bestätigt; die vorliegende Patch-Testkopie vom 21.10.2026 berichtete vier isolierte Funktionstests (kein GitHub-CI-Ersatz).
- **Neuer Branch:** `sync/20261023-http-hidden-files`. Vor Merge ist `npm test` sowie ein echter HTTP-Integrationstest erforderlich; **nicht als freigegeben markieren**, solange nicht alle CI-Gates grün sind.
- **PR/Commit:** Der GitHub-Verlauf des Entwicklungszweigs ist die verbindliche Quelle.
