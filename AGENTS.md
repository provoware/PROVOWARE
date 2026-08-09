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

## Iterationsablauf

`BASELINE -> VORANALYSE -> PATCHPLAN -> PRECHECK -> STAGING -> PATCH -> TEST -> POSTCHECK -> EVIDENCE -> PLAN_DELTA -> UEBERGABE`

## Abbruch

Bei Baseline-Mismatch, unklarer Datenintegrität, fehlendem Rückweg für einen riskanten Schritt oder rotem Pflichtgate wird nicht automatisch weiterentwickelt.
