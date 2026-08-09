# AGENTS.md

## Verbindlicher Arbeitsmodus

1. Nie auf unbekannter Baseline patchen.
2. Pro Iteration genau ein Hauptziel oder ein explizit dokumentierter enger Iterationsblock.
3. Neue Arbeit wird als `PLAN_DELTA` registriert und nicht still mitimplementiert.
4. Kritische Änderungen benötigen vorab einen Rückweg.
5. Pflichtprüfungen dürfen nicht durch spätere Funktionen überdeckt werden.
6. Nutzerseitige Begriffe und Berichte bleiben deutsch.
7. Stable- und Evidence-Artefakte werden nicht still überschrieben.
8. Alle maschinenlesbaren Projektwahrheiten besitzen eine eindeutige autoritative Datei.
9. Netzwerkzugriff ist kein Bestandteil der Laufzeit-Kernfunktion.
10. Erst nach grünem kritischen PoA-Pfad beginnt breiter V1-Ausbau.
11. Jede Installations-, Build-, Recovery- oder Bedienanleitung enthält alle benötigten Befehle vollständig, kopierbar und in korrekter Reihenfolge.
12. Größen von Downloads, Artefakten und Transferteilen werden nutzerseitig zusätzlich in MB angegeben.
13. Große Übergabebinärdaten werden bevorzugt als reproduzierbare GitHub-Actions-Artefakte erzeugt, statt die Git-Historie dauerhaft aufzublähen; Hashes und Buildlogik bleiben im Repository.
14. Jede abgeschlossene Iteration wird nach grüner Validierung vollständig im GitHub-Repository nachgezogen: Code, Registries, Evidence, README/Changelog und Iterationsübergabe. `main` wird erst nach grünen Pflichtgates promoviert; der unmittelbar vorherige validierte Stand bleibt als Rückfallbasis erhalten.

## Iterationsablauf

`BASELINE -> VORANALYSE -> PATCHPLAN -> PRECHECK -> STAGING -> PATCH -> TEST -> POSTCHECK -> EVIDENCE -> PLAN_DELTA -> GITHUB_PROMOTION -> UEBERGABE`

## Abbruch

Bei Baseline-Mismatch, unklarer Datenintegrität, fehlendem Rückweg für einen riskanten Schritt oder rotem Pflichtgate wird nicht automatisch weiterentwickelt.
