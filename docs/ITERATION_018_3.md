# I018.3 — Source+Contract Binding Receipt

## Ziel

Die bereits qualifizierten I018.1-/I018.2-Integritätswerte werden in einem gemeinsamen, weiterhin read-only Nachweis zusammengeführt. Das Binding-Receipt bindet Projekt-ID, Source-Fingerprint, Contract-Fingerprint, aufgelöste Produktversion und Manifest-Schema kanonisch per SHA-256.

## Vertragskern

- `RegistryBindingReceipt` ist unveränderlich und enthält ausschließlich bereits qualifizierte Auflösungswerte.
- `registry_binding_receipt_fingerprint()` bildet SHA-256 über eine kanonische JSON-Repräsentation des Receipts.
- Das Receipt bindet `projekt_id`, `source_fingerprint`, `contract_fingerprint`, `produktversion` und `manifest_schema` gemeinsam.
- `registry_aufloesen()` liefert das explizite Receipt und `binding_receipt_sha256` zurück.
- Ein optionaler erwarteter Binding-Receipt-Fingerprint kann gepinnt werden.
- Jede Abweichung eines gebundenen Bestandteils gegen den erwarteten Receipt-Pin blockiert fail-closed.
- Source- und Contract-Fingerprint bleiben weiterhin getrennte Einzelbelege; das Receipt ersetzt sie nicht.
- Bestehende Projekt-IDs werden weiterhin ausschließlich referenziert.

## Sicherheitsnutzen

I018.1 beantwortet, welche Registryquelle gelesen wurde. I018.2 beantwortet, nach welchem Vertrag sie interpretiert wurde. I018.3 bindet zusätzlich das konkrete Auflösungsergebnis an beide Integritätswerte und verhindert damit, dass eine Kombination aus Quelle, Vertrag, Projekt-ID, Produktversion oder Manifest-Schema unbemerkt gegen einen zuvor gepinnten Gesamtzustand ausgetauscht wird.

## Bewusste Grenzen

Nicht Bestandteil von I018.3 sind Registry-Persistenz, automatische Quellensuche, Signatur- oder Herkunftsgarantie, Mehrprojekt-Registry, GUI oder das dauerhafte Speichern des Receipts. Das Receipt ist ausschließlich eine deterministische read-only Bindung innerhalb der Auflösung.

## Risiko und Rollback

Der Schritt verändert keine Registry- oder Nutzdaten. Rollback erfolgt vollständig über Rücknahme des isolierten I018.3-Commits/PRs. Promotion ist ausschließlich nach real erfolgreichem I018.3-Gate auf exakt dem finalen PR-Head zulässig.
