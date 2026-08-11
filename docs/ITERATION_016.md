# Delta-I016 — Lock-Lease und Prozessidentität, Phase 1

## Ziel

Kleinster reversibler P0-Schritt: ein nichtblockierender exklusiver Linux-advisory-Lease für genau ein Ziel. Die Nutzdatei wird durch den Lease selbst nicht verändert. I012–I015 bleiben fachlich unverändert.

## Vertrag

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

Der Patch ist additiv: neues Modul, neue Tests und Evidence. Die bestehende Replace-Primitive wird nicht verändert. Rückfall erfolgt durch Revert dieses isolierten Patches.

## Qualification Phase 1

Die Phase-1-Implementierung wurde real auf GitHub Actions qualifiziert.

- Qualifikations-Head: `4eea4591ae2296961869f567498744372aa7ff11`
- I016-Workflow: `31476216289` — `success`
- I015-Revalidation: `31476216369` — `success`
- I016-Artefakt: `9095330662`, 899 Byte
- Artefakt-SHA-256: `fd7d62679176faf3a3dcd90b7675f492e40b620c9fb5a7035273a1f5876b2ec6`
- kanonischer Tool-Merge: `cfb9d67966ba737eb1331004890973ed2404f3ff`

Qualifiziert sind der exklusive Erwerb, das Blockieren eines konkurrierenden kooperierenden Erwerbs, erneuter Erwerb nach Freigabe, idempotente Freigabe, fail-closed Pfadfehler, unveränderte Nutzdatei und die Regression der I012–I015-Plattformverträge. Nicht qualifiziert bleiben nicht kooperierende Schreiber und Netzwerkdateisysteme. Die direkte Kopplung `Lease -> unmittelbarer Stale-Recheck -> atomar_ersetzen` ist noch nicht implementiert.

## Status und nächste Qualification

**Phase 1: QUALIFIZIERT. Delta-I016 insgesamt: IN_ARBEIT.**

Als nächster kleiner Schritt folgt ein echter Mehrprozess-Test des Lease-Kerns. Erst danach soll die mutierende Integration `Lease -> unmittelbarer Stale-Recheck -> atomar_ersetzen` erfolgen, damit Prozessgrenzen separat von der Schreibkopplung qualifiziert bleiben.
