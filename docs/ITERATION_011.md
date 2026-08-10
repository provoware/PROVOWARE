# I011 — Linux-Systemprofil und X11-Erkennung

## Ausgangszustand

- Baseline: `BASELINE-2026-08-10-I010`
- P02: 100 % und `VALIDIERT_GITHUB`
- Phase: P03 Plattform- und Dateisystemschicht
- nächster Pflichtschritt laut `ITERATIONSUEBERGABE.json`: Linux-Systemprofil und X11-Erkennung

## Ablauf- und Risikoanalyse

I011 bleibt strikt read-only. Die Erkennung verarbeitet injizierte Systemquellen und führt weder Persistenz noch Dateischreiblogik aus. Höchstes Fehlklassifikationsrisiko ist ein vorhandenes `DISPLAY` unter Wayland/XWayland. Deshalb gilt `DISPLAY` nicht als X11-Beweis; `XDG_SESSION_TYPE=x11` ist erforderlich. Fehlende oder widersprüchliche Signale werden fail-closed klassifiziert.

## Umgesetzter Vertrag

- typisierte `LinuxSystemQuellen`
- unveränderliches `LinuxSystemProfil`
- `SessionArt`: X11 / WAYLAND / UNBEKANNT
- `PlattformStatus`: UNTERSTUETZT / EINGESCHRAENKT / UNBEKANNT / NICHT_UNTERSTUETZT
- deterministischer SHA-256-Profilfingerprint
- parser für injizierten `os-release`-Text ohne Shell- oder Datei-I/O
- Golden-Profile Ubuntu 22.04 und 24.04 amd64 X11
- negative Fälle Wayland+DISPLAY, fehlendes Session-Signal, fremde Architektur, unbekannte Ubuntu-Version und unvollständige OS-Daten

## Datenverlustschutz und Rückfall

Die Produktimplementierung ist read-only und enthält keine Lösch-, Verschiebe-, Überschreib- oder Verzeichnis-Erzeugungsoperation. Die Iteration liegt bis zur Qualifikation auf einem separaten Branch; Rückfall ist durch Verwerfen des Branches vollständig möglich.

## Wissensspeicher

`ERK-I011-001` dokumentiert als E1/P0-Regelentwurf, dass `DISPLAY` allein keine echte X11-Sitzung beweist. Keine Hochstufung zur Goldenen Regel vor beobachteter Qualifikation.

## Qualifikationsvertrag

Der I011-Workflow revalidiert I010, installiert die Toolchain aus dem verifizierten I005-Wheelhouse und prüft I011-Contracttests, Ruff, Ruff-Format, mypy strict, P02-Regression und Gesamtregression. Erst ein tatsächlich erfolgreicher Workflow darf I011 promovieren.

## Noch nicht als PASS zu werten

Solange der Pull-Request-Workflow nicht beobachtet grün abgeschlossen ist, bleiben Runtime-, CI- und Promotionstatus unbekannt beziehungsweise blockiert.
