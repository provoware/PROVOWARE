# Delta-I016 — Lock-Lease und Prozessidentität

## Ziel

Kleinster reversibler P0-Schritt: ein nichtblockierender exklusiver Linux-advisory-Lease für genau ein Ziel. Die Nutzdatei wird durch den Lease selbst nicht verändert. I012–I015 bleiben fachlich unverändert.

## Vertrag Phase 1

- kanonischer absoluter Zielpfad oder fail-closed `FEHLER`
- stabile benachbarte Lockdatei `.<name>.provoware.lock`
- `flock(LOCK_EX | LOCK_NB)`; Konkurrenz liefert `BELEGT` statt zu warten
- maschinenlesbare Lease-Identität aus PID, Zufallstoken und Lockpfad
- deterministische, idempotente Freigabe
- keine Integration in `atomar_ersetzen` in Phase 1

## Sicherheitsgrenzen

`flock` ist advisory und schützt nur kooperierende Schreiber. Netzwerkdateisysteme sind nicht qualifiziert. Die persistente leere Lockdatei ist PROVOWARE-Metadatenzustand und wird absichtlich nicht beim Release gelöscht, weil Löschen/Reanlegen parallele Lock-Inodes und damit Split-Locks ermöglichen könnte.

Maschinenlesbarer Status der offenen Grenzen:

- nicht kooperierende Schreiber: `NICHT_QUALIFIZIERT`
- Netzwerkdateisysteme: `NICHT_QUALIFIZIERT`
- direkte Replace-Integration: `NICHT_IMPLEMENTIERT`

## Rückfall

Phase 1 und I016.2 sind additiv. Die bestehende Replace-Primitive wurde nicht verändert. Rückfall erfolgt über die isolierten Git-Commits beziehungsweise Revert der jeweiligen Promotion.

## Qualification Phase 1

Die Phase-1-Implementierung wurde real auf GitHub Actions qualifiziert.

- Qualifikations-Head: `4eea4591ae2296961869f567498744372aa7ff11`
- I016-Workflow: `31476216289` — `success`
- I015-Revalidation: `31476216369` — `success`
- I016-Artefakt: `9095330662`, 899 Byte
- Artefakt-SHA-256: `fd7d62679176faf3a3dcd90b7675f492e40b620c9fb5a7035273a1f5876b2ec6`
- kanonischer Tool-Merge: `cfb9d67966ba737eb1331004890973ed2404f3ff`

Qualifiziert sind der exklusive Erwerb, das Blockieren eines konkurrierenden kooperierenden Erwerbs, erneuter Erwerb nach Freigabe, idempotente Freigabe, fail-closed Pfadfehler, unveränderte Nutzdatei und die Regression der I012–I015-Plattformverträge.

## Qualification I016.2 — echte Prozessgrenze

Der Mehrprozess-Nachweis wurde real und getrennt von der späteren Schreibkopplung qualifiziert.

- Tool-PR: `#34`
- Qualifikations-Head: `0be678f4c9bffee072253c4b117e6658145a709a`
- Workflow: `31490138072` — `completed / success`
- kanonischer Tool-Merge: `38f873b55a4539147458ed8a76ad4ac4f4e3e116`
- Testmodell: getrennte Prozesse über `multiprocessing` mit `spawn`
- Vertrag: Prozess A hält Lease; Prozess B erhält deterministisch `BELEGT`; nach Freigabe kann ein neuer Prozess den Lease erwerben.

Damit ist die Exklusivität an der realen lokalen Prozessgrenze für kooperierende Linux-Schreiber qualifiziert. Daraus folgt ausdrücklich **keine** Qualification für nicht kooperierende Schreiber oder Netzwerkdateisysteme.

## Wissensstatus

Die Mehrprozess-Evidence verstärkt den bestehenden Lock-Lease-Wissenseintrag und erzeugt keine neue Goldene Regel. Sie bleibt im Gültigkeitsbereich lokaler Linux-Dateisysteme und kooperierender Schreiber. Die Dublettenkonsolidierung mit dem bestehenden I016-Wissenseintrag hat Vorrang vor einer neuen Regelnummer.

## Status und nächster technischer Schritt

**Phase 1: QUALIFIZIERT. I016.2 Mehrprozess-Nachweis: QUALIFIZIERT. Delta-I016 insgesamt: IN_ARBEIT.**

Offen bleibt die sicherheitskritische Kopplung `Lease -> unmittelbarer I014-Stale-Recheck -> I015 atomar_ersetzen`. Diese Kopplung ist weiterhin `NICHT_IMPLEMENTIERT` und darf erst in einer getrennten Iteration implementiert und qualifiziert werden.
