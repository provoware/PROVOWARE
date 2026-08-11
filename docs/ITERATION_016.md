# Delta-I016 — Lock-Lease und Prozessidentität

## Ziel
Delta-I016 schließt die nach P03 verschobene Schreibkonkurrenz-Sicherheitskette ab: exklusiver kooperativer Linux-Lease, echte Prozessgrenze und unmittelbare Kopplung des gehaltenen Lease an Stale-Recheck und atomaren Replace.

## Qualifizierter Gesamtvertrag

`Lease erwerben -> I014-Stale-Recheck unter gehaltenem Lease -> I015 atomar_ersetzen -> Lease freigeben`

- kanonischer absoluter Zielpfad oder fail-closed `FEHLER`
- stabile benachbarte Lockdatei `.<name>.provoware.lock`
- `flock(LOCK_EX | LOCK_NB)`; Konkurrenz liefert `BELEGT`
- Lease-Identität aus PID, Zufallstoken und Lockpfad
- deterministische, idempotente Freigabe
- echte Mehrprozess-Qualification mit `multiprocessing`/`spawn`
- frischer I014-Stale-Recheck erst unter gehaltenem Lease
- I015-Mutation nur über den frischen Recheck; STALE/UNBEKANNT blockieren
- Lease-Freigabe auch bei Exception im Replace-Pfad

## Sicherheitsgrenzen

- nicht kooperierende Schreiber: `NICHT_QUALIFIZIERT`
- Netzwerkdateisysteme: `NICHT_QUALIFIZIERT`
- Advisory `flock` schützt nur kooperierende Schreiber.
- Die persistente leere Lockdatei bleibt Metadatenzustand; Löschen/Reanlegen könnte Split-Locks über unterschiedliche Inodes erzeugen.

## Qualification Phase 1

- Qualifikations-Head: `4eea4591ae2296961869f567498744372aa7ff11`
- I016-Workflow: `31476216289` — `success`
- I015-Revalidation: `31476216369` — `success`
- I016-Artefakt: `9095330662`, 899 Byte
- Artefakt-SHA-256: `fd7d62679176faf3a3dcd90b7675f492e40b620c9fb5a7035273a1f5876b2ec6`
- kanonischer Tool-Merge: `cfb9d67966ba737eb1331004890973ed2404f3ff`

## Qualification I016.2 — echte Prozessgrenze

- Tool-PR: `#34`
- Qualifikations-Head: `0be678f4c9bffee072253c4b117e6658145a709a`
- Workflow: `31490138072` — `completed / success`
- kanonischer Tool-Merge: `38f873b55a4539147458ed8a76ad4ac4f4e3e116`
- Testmodell: getrennte Prozesse über `multiprocessing` mit `spawn`

## Qualification I016.3 — Lease-Stale-Replace

- Tool-PR: `#36`
- Qualifikations-Head: `403bba4b2ae6e8a79e573e95dca7f2308c37207f`
- Workflow: `31511070448` — `completed / success`
- kanonischer Tool-Merge: `a4b63b758bf5ef71060d2e73eae95d584be13fbe`
- publizierte Workflow-Artefakte: keine; es wird deshalb keine Artifact-ID erfunden.

Nachgewiesen sind Erfolgsweg unter Lease, Blockade nach externer Zieländerung, Blockade bei belegtem Lease sowie deterministische Lease-Freigabe bei Exception.

## Wissensstatus

ERK-I016-001/002/003 bilden konsolidierte E2/P0-Evidence. Es wurde keine neue Goldene Regel erzeugt. Gültigkeitsbereich bleiben lokale Linux-Dateisysteme und kooperierende Schreiber.

## P03- und PLAN_DELTA-Abschluss

`PLAN-DELTA-P03-2026-08-10-001` erfüllt seine dokumentierte Abschlussbedingung. P03 ist fachlich abgeschlossen; die Planidentität bleibt erhalten und P04 wird projektintern neu zugeordnet:

- Projekt-I017 = Masterplan P04/I015 — dauerhafte ID-Erzeugung und Validierung
- Projekt-I018 = Masterplan P04/I016 — Versions- und Manifestregistry

**Delta-I016: QUALIFIZIERT UND PROMOVIERT. P03: ABGESCHLOSSEN. PLAN_DELTA: ABGESCHLOSSEN.**

## Rückfall

Die I016-Schritte bleiben über ihre isolierten Git-Promotionen rückfallfähig. Dieser Abschluss ändert keine Produktlogik und keine Nutzdaten; er synchronisiert ausschließlich Status, Planidentität und Nachweise.
