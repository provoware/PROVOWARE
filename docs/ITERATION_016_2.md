# Delta-I016.2 — Mehrprozess-Lease-Qualification

## Ziel

Den bereits qualifizierten Datei-Lease ohne Produktmutation an einer echten Prozessgrenze pruefen. Drei per `spawn` getrennte Prozesse verwenden dasselbe Ziel: Prozess A haelt den Lease, Prozess B muss deterministisch `BELEGT` erhalten, nach der Freigabe durch A muss Prozess C denselben Lease erwerben koennen.

## Risiko

Niedrig: Es werden ausschliesslich temporaere Testdateien verwendet. Die Produktionsimplementierung `datei_lease.py`, der atomare Replace-Pfad und reale Nutzdaten bleiben unveraendert. Haengende Kindprozesse werden zeitbegrenzt beendet und fuehren zum Testfehler.

## Qualifikationsvertrag

- echte getrennte Prozesse via `multiprocessing` mit Startmethode `spawn`
- A erwirbt `ERWORBEN`
- B erhaelt waehrend A den Lease haelt `BELEGT`
- Nutzdatei bleibt bytegleich
- nach A-Freigabe erwirbt C `ERWORBEN`
- Prozess-Exitcodes muessen 0 sein
- Timeout/Hang ist fail-closed ein Fehler
- keine Replace-Integration in dieser Iteration

## Grenzen

Nicht kooperierende Schreiber und Netzwerkdateisysteme bleiben `NICHT_QUALIFIZIERT`. Die Kopplung `Lease -> unmittelbarer Stale-Recheck -> atomar_ersetzen` bleibt `NICHT_IMPLEMENTIERT`.

## Rueckfall

Der Schritt ist rein additiv und kann durch Revert der I016.2-Test-, Evidence-, Dokumentations- und Workflowdateien vollstaendig entfernt werden.

## Status

`IN_PRUEFUNG` bis ein realer GitHub-Actions-Lauf auf dem exakten PR-Head erfolgreich abgeschlossen ist. Ein unbekannter, laufender oder ausgefallener Zustand ist kein PASS.
