# Iteration I015 — atomarer Einzeldatei-Replace

## Ziel

Erster bewusst mutierender P03-Dateisystemvertrag nach qualifizierter I012-Pfadgrenze, I013-Symlinkprobe und I014-Stale-Guard.

## Sicherheitskette

1. I012 muss exakt dasselbe normalisierte Ziel als `INNERHALB` bestätigen.
2. I013 muss exakt dasselbe Ziel als `SICHER` bestätigen.
3. I014 muss exakt dasselbe Ziel als unveränderte reguläre Datei mit `GLEICH` bestätigen.
4. Temp-Datei wird ausschließlich im Zielverzeichnis erzeugt.
5. Berechtigungsbits der Zieldatei werden auf die Temp-Datei übernommen.
6. Inhalt wird geschrieben, geflusht und per Datei-`fsync` synchronisiert.
7. `os.replace` ersetzt den Namen atomar.
8. Das Zielverzeichnis wird anschließend separat per `fsync` synchronisiert.

## Fail-closed Zustände

`BLOCKIERT` bedeutet: kein Temp-Schreibpfad wurde freigegeben. `FEHLER_VOR_REPLACE` bedeutet: `os.replace` wurde nicht erfolgreich erreicht; das Original wird nicht als ersetzt betrachtet. `FEHLER_NACH_REPLACE` bedeutet: Replace war erfolgreich, aber ein nachgelagerter Dauerhaftigkeitsschritt schlug fehl. In diesem Zustand wird ausdrücklich keine Rollback- oder Persistenzgarantie behauptet.

## Scope

Kein Lock-Lease, kein Batch-Schreiben, kein Delete, keine Verzeichnisverschiebung, keine ACL-/xattr-Rekonstruktion und keine NFS-spezifische Erfolgsbehauptung. Die Primitive ist auf bestehende reguläre PROVOWARE-Projektdateien begrenzt.

## Primärquellen

Python dokumentiert `os.fsync` als expliziten Datenträger-Synchronisationsschritt. Linux `rename(2)` dokumentiert den atomaren Ersatz eines bestehenden Zielnamens; `fsync(2)` dokumentiert, dass für die Persistenz des Verzeichniseintrags zusätzlich das Verzeichnis selbst synchronisiert werden muss. NFS wird als besonderer Fehlerfall behandelt, bei dem ein gemeldeter Rename-Fehler nicht beweist, dass kein Rename stattgefunden hat.

## Promotion

I014 bleibt kanonische Baseline, bis I015 Contracttests, I011–I014 Regressionen, Ruff, Ruff Format, mypy strict, P02-Runtime-Regression und Gesamtregression real grün beobachtet und Evidence erzeugt wurden.
