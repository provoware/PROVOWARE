# ADR-0002 — Kernverträge und ID-Format

## Kontext

Spätere Datenbank-, Audit-, Undo-, Import-, Modul- und Desktop-Schichten benötigen dieselben Identitäten und Ergebnissemantiken. Lose Strings würden diese Grenzen früh destabilisieren.

## Entscheidung

- `ProjektId` → `prj_<32 hex>`
- `ObjektId` → `obj_<32 hex>`
- `RevisionId` → `rev_<32 hex>`
- `ChangeId` → `chg_<32 hex>`
- `OperationId` → `op_<32 hex>`
- IDs sind unveränderliche Wertobjekte und voneinander typologisch getrennt.
- `Status` und `Fehlerklasse` verwenden explizite `StrEnum`-Werte.
- `OperationErgebnis[T]` erzwingt Laufzeitinvarianten: Erfolg ohne Fehler oder Fehlschlag mit `FehlerInfo`.
- Die Vertragsschicht importiert weder Qt noch SQLite und besitzt keine Persistenz.

## Konsequenz

Die frühen öffentlichen Typen sind bewusst klein. Neue Status- oder Fehlerklassen werden nicht spekulativ ergänzt, sondern erst durch konkrete spätere Verträge.
