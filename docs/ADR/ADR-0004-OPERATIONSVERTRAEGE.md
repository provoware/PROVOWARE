# ADR-0004 — Operationsverträge ohne Handlersemantik

**Status:** vorgeschlagen für I009-Qualifikation  
**Datum:** 2026-08-09

## Kontext

Nach I007 und I008 existieren stabile Identitäts-, Fehler-, Ergebnis- und Schemaverträge. I009 benötigt eine einheitliche Request-/Result-Hülle, ohne spätere Controller-, Handler-, Persistenz- oder GUI-Entscheidungen vorwegzunehmen.

## Entscheidung

1. `OperationRequest` und `OperationResult` sind reine Wert- und Serialisierungsverträge.
2. Beide verwenden die vorhandene `OperationId` zur Korrelation.
3. `OperationResult` verwendet ausschließlich `OperationErgebnis[OperationPayload]` und `FehlerInfo`.
4. `OperationArt` ist ein streng validierter Code-Werttyp statt einer vorzeitig festgeschriebenen Fach-Enum.
5. `OperationPayload` ist eine unveränderliche kanonische JSON-Objekthülle.
6. Payloads akzeptieren nur JSON-kompatible Ganzzahlen, boolesche Werte, Text, null, Listen und Objekte; Fließkommazahlen sind ausgeschlossen.
7. Payload-Größe, Containergröße und Verschachtelung sind begrenzt.
8. Unbekannte Request-/Result-Felder werden fail-closed abgewiesen.
9. Request, Result und Payload besitzen deterministische JSON-Darstellung und SHA-256-Fingerprint.
10. Handler, Dispatcher, Datenbank, Datei-I/O und GUI bleiben außerhalb dieser Schicht.

## Folgen

Die Operationsgrenze ist früh auditierbar und reproduzierbar, ohne konkrete Fachoperationen festzuschreiben. Spätere Controller und Handler können darauf aufbauen, ohne eine zweite Ergebnis- oder Identitätssemantik einzuführen.
