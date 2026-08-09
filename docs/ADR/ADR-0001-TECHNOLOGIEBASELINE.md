# ADR-0001 - Technologiebaseline

## Kontext
V1 benötigt klassische Desktop-Formulare, Tabellen, deterministische Tests, Offlinebetrieb und geringe Betriebsabhängigkeit.

## Entscheidung
- CPython 3.13.x / Qualifikationsziel 3.13.15
- PySide6 6.11.1 / Qt Widgets
- SQLite mit konservativem Rollback-Journal
- kein ORM
- PyInstaller One-Dir
- Build auf Ubuntu 22.04 amd64
- X11-first

## Konsequenzen
Das System bleibt testbar, transparent und portabel. QML, Browser und Sync werden erst nach stabilem Core aktiviert.
