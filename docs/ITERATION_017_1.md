# Iteration I017.1 — ID-Persistenz- und Restartvertrag

## Ziel

Den bereits qualifizierten I017-ID-Vertragskern um den kleinsten dauerhaften Persistenznachweis erweitern, ohne Registry, Datenbank oder breite Speicherarchitektur vorzuziehen.

## Vertrag

1. Eine vorhandene Kern-ID wird erstmalig exklusiv an einen stabilen `objekt_schluessel` gebunden.
2. Ein erneutes Laden — auch in einem neuen Python-Prozess — liefert exakt dieselbe typisierte ID.
3. Ein identischer erneuter Speicherversuch ist idempotent und erzeugt keine neue ID.
4. Gleicher Pfad mit anderer ID oder anderem Objektschluessel wird als `IdKonfliktFehler` blockiert.
5. Beschaedigte oder nichtkanonische Persistenz wird als `IdPersistenzFehler` blockiert; kein stilles Reparieren oder Neuerzeugen.

## Sicherheitsgrenze

Die Implementierung verwendet erstmalige exklusive Dateierzeugung (`O_CREAT | O_EXCL`) und `fsync` auf dem Dateideskriptor. Ein vorhandener Datensatz wird niemals ueberschrieben. Bei einem Schreibfehler im laufenden Prozess wird die neu angelegte unvollstaendige Datei bestmoeglich entfernt.

Nicht qualifiziert werden:

- Versions-/Manifestregistry (`NICHT_IMPLEMENTIERT`, I018)
- mathematische UUID4-Kollisionsfreiheit (`NICHT_BEWIESEN`)
- Crash-Atomizitaet bei Stromausfall oder Dateisystemausfall (`NICHT_QUALIFIZIERT`)
- Netzwerkdateisysteme (`NICHT_QUALIFIZIERT`)

## Reversibilitaet

Der Patch ist additiv: ein neues Vertragsmodul, ein gezielter Test, Evidence, diese Dokumentation und ein eigenes CI-Gate. Bestehende I017-ID-Klassen und historische Qualification-Evidence bleiben unveraendert.

## Reale Qualification und Promotion

- funktionaler Kandidatenlauf `31536871890` auf Head `1a0a6d85e0547d6f1e0b395281a490828d40491c`: `completed / success`
- Promotions-/Evidence-Lauf `31536951091` auf Head `739f0b8368ad79f418a800d5d98b5aea70e0ab54`: `completed / success`
- Tool-PR #40 wurde als Main-Merge `0d2e6c8d2e042527274fb2428efe635dbbb337cc` promoviert.
- Masterbuch-Evidence `ERK-I017-002` wurde als `E2 / P0 / BESTAETIGT` ohne Goldene Regel konsolidiert; Masterbuch-Merge `5d4be8436e12937dff5e3a50aedfb8804782e0a1`.

## I017.1H Metadatenabschluss

Der qualifizierte Persistenz-/Restartvertrag wird getrennt vom historischen I017-Vertragskern in `PROJEKTSTATUS.json` nachgewiesen. Dadurch bleibt die fruehere Aussage `ID_VERTRAGSKERN_OHNE_PERSISTENZ` historisch korrekt, waehrend die spaetere Persistenzqualification maschinenlesbar separat gebunden ist.

I017 bleibt in dieser Metadateniteration formal `IN_ARBEIT`. P04 wird nicht allein aufgrund des Nachtrags hochgerechnet. Vor dem formalen I017-Abschluss wird separat entschieden, ob der bereits erfuellte Restart-/Konflikt-Abnahmekern genuegt oder noch ein Crash-/Teilwrite-Haertungsnachweis erforderlich ist. Die I018 Versions-/Manifestregistry wird nicht vorgezogen.
