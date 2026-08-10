# Iteration 014 — Read-only Dateiidentität + Stale-Guard

## Ausgangslage

Kanonische Basis ist `BASELINE-2026-08-10-I013`. I013 qualifiziert die segmentweise `lstat`-Probe und blockiert ungeklärte Symlink-Semantik fail-closed. Offen bleibt TOCTOU: Zwischen einer erfolgreichen Probe und einer späteren Mutation kann ein Objekt ausgetauscht oder verändert werden.

Der Entwicklungsplan v2.0.0 sah für I013/I014 ursprünglich atomare Temp/Replace-Primitive und Lock-Lease vor. Diese mutierenden Schritte werden wegen der neu belegten P0-Vorbedingungen nicht gestrichen, sondern über `PLAN_DELTA_I014.json` nach hinten verschoben.

## Umfang

I014 ergänzt ausschließlich read-only:

- `DateiIdentitaet` aus Device, Inode, Objektart, Modus, Größe, `mtime_ns`, `ctime_ns`
- deterministischen Snapshot-Fingerprint
- Recheck mit `GLEICH`, `STALE`, `UNBEKANNT`
- fail-closed Behandlung fehlender, ungültiger oder nicht lesbarer Pfade
- injizierbare `lstat`-Grenze für deterministische Tests

## Harte Grenzen

I014 führt kein `mkdir`, `rename`, `move`, `delete`, `overwrite`, produktives Locking oder Persistenzschreiben ein. Die I013-Symlinkprobe bleibt eine getrennte Voraussetzung. `GLEICH` ist nur der unmittelbar beobachtete Recheck und keine dauerhafte Garantie.

## Abnahmekern

- gleiche Datei liefert reproduzierbare Identität
- unveränderter unmittelbarer Recheck liefert `GLEICH`
- Inode-Austausch liefert `STALE`
- relevante Stat-Änderung liefert `STALE`
- fehlende Datei liefert `UNBEKANNT`
- Recheck nach Entfernen liefert `UNBEKANNT`
- `lstat`-Fehler bleibt fail-closed
- Snapshot/Recheck verändern Nutzdaten nicht
- I011-I013 Regression, Ruff, Ruff Format, mypy strict und Gesamtregression

## Rückfall

Die Iteration liegt isoliert auf `iteration/i014-dateiidentitaet-stale-guard`. Solange keine Promotion erfolgt, bleibt `main` auf I013. Ein Abbruch benötigt daher keine Nutzdatenwiederherstellung.
