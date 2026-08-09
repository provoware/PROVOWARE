# Architektur-Baseline

## Zielarchitektur

`Desktop-Adapter -> Commands/Queries -> Headless-Core -> Daten-/Plattformdienste`

Die GUI besitzt keine Fachlogik. Persistente Nutzerdaten dürfen später ausschließlich über den zentralen Transaktionsdienst verändert werden.

## V1-Technik
- CPython 3.13.x; Qualifikationsziel 3.13.15.
- PySide6 / Qt Widgets; Qualifikationsziel 6.11.1.
- SQLite, konservativer Rollback-Journal-Modus als Standard.
- PyInstaller One-Dir.
- Linux/Ubuntu-Derivate, X11-first, amd64.
- Buildbasis: Ubuntu 22.04 amd64.
- Zielabnahme: Ubuntu 22.04 / 24.04 / 26.04 X11.

## Architekturgrenzen
- keine Fachlogik in Qt-Widgets,
- kein ORM in V1,
- kein paralleler regulärer Nutzerdaten-Schreibweg,
- keine versteckten globalen Zustände,
- keine Runtime-Telemetrie,
- keine ungeplanten Netzwerkabhängigkeiten.
