# I017 — Dauerhafte ID-Erzeugung und Validierung: Vertragskern

## Ausgangszustand

P03 ist abgeschlossen. Der Masterplan führt P04 mit dauerhafter ID-Erzeugung und Validierung fort. Im bestehenden Kern ist bereits ein kleiner ID-Vertrag vorhanden: `ProjektId`, `ObjektId`, `RevisionId`, `ChangeId` und `OperationId` verwenden domänenspezifische Präfixe und UUID-basierte Textwerte. I017 dupliziert diesen Code nicht, sondern qualifiziert zuerst seine Invarianten.

## Gewählter kleiner Schritt

Diese Teiliteration verändert keine Produktlogik und keine Persistenz. Sie ergänzt ausschließlich gezielte Contracttests, Wissensevidence, Dokumentation und ein eigenes fail-closed CI-Gate.

Zu qualifizieren sind:

- stabile Präfixe `prj`, `obj`, `rev`, `chg`, `op`,
- exakt 32 lowercase Hex-Zeichen hinter dem Präfix,
- UUID4 bei neu erzeugten IDs,
- verlustfreier Text-/JSON-Roundtrip,
- strikte Trennung der ID-Domänen,
- Ablehnung von Leerraum, Uppercase, Bindestrichformat sowie falscher Länge,
- unveränderte bestehende Kernverträge.

## Sicherheits- und Gültigkeitsgrenzen

`PERSISTENZ_ANBINDUNG = NICHT_IMPLEMENTIERT`

`REGISTRY_ANBINDUNG = NICHT_IMPLEMENTIERT`

`KOLLISIONSFREIHEIT = NICHT_BEWIESEN`

Die Stichproben- und Contracttests dürfen nicht als mathematischer Kollisionsbeweis umgedeutet werden. SQLite-, Datei- oder Registry-Persistenz wird in diesem Schritt nicht eingeführt. Die Versions-/Manifestregistry bleibt I018.

## Wissenseinordnung

`ERK-I017-001` bleibt bis zu einem real erfolgreichen I017-Workflow auf `E1 / P0 / IN_PRUEFUNG`. Keine Goldene Regel.

## Rückfallfähigkeit

Der Patch ist vollständig additiv. Das Entfernen der vier I017-Artefakte stellt den vorherigen Produktstand wieder her; Nutzdaten, Baselines und bestehende Vertragsimplementierung werden nicht verändert.

## Promotion

Eine Promotion ist nur nach real erfolgreicher Qualification auf dem exakten PR-Head zulässig. Ein laufender, fehlender oder unbekannter CI-Zustand ist kein PASS.
