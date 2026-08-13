# Historische-Candidate-Gates-Linter

## Zweck

Der Linter verhindert, dass bereits qualifizierte und promovierte historische Candidate- oder Closure-Gates durch spaetere Projektmetadaten erneut automatisch ausgefuehrt werden.

## Vertrag

Die maschinenlesbare Quelle ist `docs/HISTORISCHE_GATES.json`. Jeder dort mit `PROMOTED_FROZEN` registrierte Workflow muss:

- `workflow_dispatch` enthalten,
- keinen `pull_request`-Trigger enthalten,
- keinen `push`-Trigger enthalten.

Fehlende Dateien, ungueltige Registry-Eintraege oder nicht pruefbare Trigger muessen fail-closed zum Fehler fuehren.

## Motivation

Die Regel konsolidiert die wiederholt beobachtete Fehlerklasse, bei der historische Qualifikations-Gates auf spaetere Aenderungen langlebiger Metadaten reagieren und dann korrekt gegen ihren historischen Vertrag scheitern. Der historische Vertrag soll nicht aufgeweicht werden; stattdessen wird sein automatischer Lifecycle nach Promotion eingefroren.

## Wissensstatus

Der generische Linter ist bis zu einer realen CI-Qualifikation ein E1/P0-Kandidat und keine Goldene Regel. Nach realem PASS und Promotion kann die konkrete automatisierte Praevention als E2-Nachweis in das Masterbuch uebernommen werden.
