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

## Rückfall

Der Patch ist additiv: neues Modul, neue Tests und Evidence. Die bestehende Replace-Primitive wird nicht verändert. Rückfall erfolgt durch Revert dieses isolierten Patches.

## Nächste Qualification

Erforderlich sind mindestens: exklusiver Erwerb, konkurrierender Erwerb blockiert, erneuter Erwerb nach Freigabe, idempotente Freigabe, ungültiger Pfad fail-closed sowie vollständige P03-Regression. Erst danach darf eine Integration `Lease -> unmittelbarer Stale-Guard -> Replace` folgen.
