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
