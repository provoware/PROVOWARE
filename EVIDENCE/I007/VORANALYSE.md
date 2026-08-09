# I007 — Voranalyse: strikt typisierte Kernverträge

## Ausgangslage

P00 und P01 sind qualifiziert. I007 ist der erste produktive Schritt von P02 und darf noch keine GUI-, SQLite-, Datei- oder Modulabhängigkeit einführen.

## Risikoanalyse

1. **ID-Drift:** uneinheitliche Stringformate würden Persistenz, Import und Audit später destabilisieren.
2. **Magic Strings:** lose Status- und Fehlertexte würden Controller und UI unnötig koppeln.
3. **Widersprüchliche Ergebnisse:** ein Ergebnis darf nicht gleichzeitig Erfolg und Fehler repräsentieren.
4. **Überabstraktion:** I007 darf nur die im Masterplan geforderte minimale Typgrenze schaffen.
5. **CI-I/O:** der bisherige I005-Filter `tests/**` würde diese reine Vertragsiteration unnötig mit einem rund 294-MB-Wheelhouse-Neubau belasten.

## Entscheidung

- IDs als unveränderliche, präfixierte UUID-Wertobjekte.
- kanonisches Format `<praefix>_<32 lowercase-hex>`.
- `Status` und `Fehlerklasse` als `StrEnum` mit stabilen Maschinenwerten.
- `FehlerInfo` trennt Klasse, Diagnosecode und Nachricht.
- `OperationErgebnis[T]` erzwingt eindeutige Erfolgs-/Fehlerzustände.
- Vertragsschicht bleibt ausschließlich auf Python-Standardbibliothek gestützt.
- I005-Trigger wird vor I007 auf den spezifischen I005-Vertragstest verengt.
