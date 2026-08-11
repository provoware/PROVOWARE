# I017 — Dauerhafte ID-Erzeugung und Validierung: Vertragskern

## Ausgangszustand

P03 ist abgeschlossen. Der Masterplan führt P04 mit dauerhafter ID-Erzeugung und Validierung fort. Im bestehenden Kern ist bereits ein kleiner ID-Vertrag vorhanden: `ProjektId`, `ObjektId`, `RevisionId`, `ChangeId` und `OperationId` verwenden domänenspezifische Präfixe und UUID-basierte Textwerte. I017 dupliziert diesen Code nicht, sondern qualifiziert zuerst seine Invarianten.

## Gewählter kleiner Schritt

Diese Teiliteration verändert keine Produktlogik und keine Persistenz. Sie ergänzt ausschließlich gezielte Contracttests, Wissensevidence, Dokumentation und ein eigenes fail-closed CI-Gate.

Qualifiziert sind:

- stabile Präfixe `prj`, `obj`, `rev`, `chg`, `op`,
- exakt 32 lowercase Hex-Zeichen hinter dem Präfix,
- UUID4 bei neu erzeugten IDs,
- verlustfreier Text-/JSON-Roundtrip,
- strikte Trennung der ID-Domänen,
- Ablehnung von Leerraum, Uppercase, Bindestrichformat sowie falscher Länge,
- unveränderte bestehende Kernverträge.

## Reale Qualification

Erster Qualification-Head: `bfea0bce26720ddb955dc3a05070040959155cbb`

Erster Workflow: `31526347950` — `completed / success`

Promotionsfähiger Qualification-Head: `be324f1cbbe30ee4e2c9f19e17b1855d5601c34c`

Promotionsworkflow: `31526518691` — `completed / success`

I007-Kernvertragsregression: `31526518704` — `completed / success`

Tool-PR #38 wurde SHA-gebunden als kanonischer Main-Merge `4e0a9f961c479932ac1e72c7b68367e200451ec9` promoviert.

Das Gate bestätigte den exakten Vier-Dateien-Scope, die neuen I017-Contracttests, bestehende ID-Regressionsprüfungen, Ruff/Format, mypy sowie die Wissens- und Grenzmarker.

## Masterbuch-Synchronisierung

`ERK-I017-001` ist als `E2 / P0 / BESTAETIGT` dokumentiert. Masterbuch-Main-Merge: `d6b80cdc534ae3567b5a037e420f0bc30884f318`.

Keine Goldene Regel wurde erzeugt. Die Evidence bleibt ein bestätigter Nachweis; eine kanonische Regelaufnahme erfordert weiterhin eine vollständige Dubletten- und Widerspruchsprüfung im Masterbuch.

## Sicherheits- und Gültigkeitsgrenzen

`PERSISTENZ_ANBINDUNG = NICHT_IMPLEMENTIERT`

`REGISTRY_ANBINDUNG = NICHT_IMPLEMENTIERT`

`KOLLISIONSFREIHEIT = NICHT_BEWIESEN`

Die Contracttests dürfen nicht als mathematischer Kollisionsbeweis umgedeutet werden. SQLite-, Datei- oder Registry-Persistenz wird in diesem Schritt nicht eingeführt. Die Versions-/Manifestregistry bleibt I018.

Der Masterplan fordert für die dauerhafte ID-Schicht ausdrücklich Kollisions-/Restarttests. Deshalb bleibt Projekt-I017 trotz vollständig qualifiziertem Vertragskern formal `IN_ARBEIT`, bis die Persistenz-/Restartbindung und die Konfliktsemantik separat real qualifiziert sind.

## Rückfallfähigkeit

Der Produktpatch I017 war vollständig additiv. I017H verändert ausschließlich Metadaten und Dokumentation. Nutzdaten, Baselines und bestehende Vertragsimplementierung werden nicht verändert.

## Nächster technischer Schritt

Kleinster Funktionspatch: Persistenz-Roundtrip über eine Prozess-/Neuladegrenze, ohne Registry-Vorgriff:

`ID erzeugen -> serialisieren -> neu laden -> parse -> exakt identische ID`

Zusätzlich muss ein vorhandener Identitätswert beim Restore erhalten bleiben; stilles Neuerzeugen ist fail-closed als Fehler zu behandeln.
