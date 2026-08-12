# I018.2 — Registry-Contract-Fingerprint

## Ziel

Der bereits qualifizierte read-only Registryvertrag wird um eine zweite, vom Quellinhalt unabhängige Integritätsbindung ergänzt. `source_fingerprint` beantwortet, welche konkreten Registrydaten gelesen wurden; `contract_fingerprint` bindet dagegen die expliziten Interpretationsregeln.

## Vertragskern

- `RegistryVertrag` ist unveränderlich und explizit versionsiert.
- `registry_contract_fingerprint()` bildet SHA-256 über eine kanonische JSON-Repräsentation des Vertrags.
- `registry_aufloesen()` kann einen erwarteten Contract-Fingerprint als Pin verlangen.
- Abweichender Contract-Pin blockiert fail-closed.
- Ein Vertrag, der nicht exakt eine Registryquelle verlangt, blockiert fail-closed.
- Der Contract-Fingerprint bleibt bei Änderungen des Registryquellinhalts stabil; der Source-Fingerprint ändert sich dagegen.
- Bestehende Projekt-IDs werden weiterhin ausschließlich referenziert.

## Bewusste Grenzen

Nicht Bestandteil von I018.2 sind Registry-Persistenz, automatische Quellensuche, Signatur- oder Herkunftsgarantie, Mehrprojekt-Registry, GUI und ein kombiniertes Binding-Receipt.

## Risiko und Rollback

Der Schritt ist read-only und verändert keine Registry- oder Nutzdaten. Rollback erfolgt vollständig über Rücknahme des isolierten I018.2-Commits/PRs. Promotion ist nur nach real erfolgreichem I018.2-Gate auf exakt dem finalen PR-Head zulässig.
