# I010 — P02 Architektur- und Vertragsgate

## Ausgangszustand

Kanonische Baseline ist `BASELINE-2026-08-09-I009`. I007-I009 sind als `VALIDIERT_GITHUB` dokumentiert. I010 darf keine P03-Funktion vorziehen.

## Gewählter kleiner Schritt

Die öffentliche P02-Vertragsoberfläche wird als maschinenlesbarer Snapshot erfasst und mit einem gemeinsamen Contracttest gegen unbeabsichtigte Drift gesichert. Gleichzeitig wird das exakte Python-Produktquellinventar geprüft und die Architekturgrenze über alle P02-Quellen gemeinsam revalidiert.

## Risikoanalyse

- Produktlogik: unverändert.
- Persistenz/Dateiformate: unverändert.
- Datenverlustrisiko: keines durch diesen Patch; nur Tests, Fixture und Dokumentation.
- Rückfall: Branch kann vollständig verworfen werden.
- Hauptrisiko: Ein zu enger Snapshot kann absichtliche API-Änderungen blockieren. Deshalb ist eine Änderung nur über expliziten Vertrags-/Migrationsschritt zulässig.

## Neue Prüfungen

1. öffentliche `__all__`-Symbole entsprechen exakt dem Snapshot,
2. ID-Präfixe bleiben stabil,
3. Status- und Fehlerklassen bleiben stabil,
4. Manifest-, Projekt- und Operationsschemaversionen bleiben getrennt und stabil,
5. das Produktquellinventar entspricht exakt der erwarteten P02-Schicht,
6. alle Produktquellen bleiben frei von Qt-, SQLite-, Datei-I/O-, Handler-, Persistenz- und Modulabhängigkeiten.

## Wissensspeicher

`ERK-I010-001` wurde als Regelentwurf E1/P0 aufgenommen. Keine Hochstufung auf E2+ vor einem tatsächlich beobachteten reproduzierbaren Qualifikationslauf.

## Qualifikationsstatus

Die Contracttests sind implementiert, aber in dieser Iteration noch nicht als Runtime-PASS bewertet. Ein GitHub-Actions-Gesamtgate muss vor Promotion ergänzt bzw. erfolgreich ausgeführt werden. Unbekannt bleibt unbekannt; `main` wird nicht verändert.
