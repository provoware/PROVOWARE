# MASTERPLAN COVERAGE GATE — P04

Zweck: Vor einem Phasenabschluss wird jeder Pflichtkern des verbindlichen Masterplans eindeutig einem Projektstand zugeordnet.

Erlaubte Zustände sind ausschließlich `QUALIFIZIERT`, `EXPLIZIT_WEITERGEFUEHRT` und `BLOCKIERT`. Jeder andere oder fehlende Zustand blockiert die Prüfung.

Für P04 gelten vier Pflichtkerne. Projekt-I017 und I018 sind qualifiziert. Projekt-I019 und I020 sind durch `PLAN-DELTA-P04-2026-08-12-001` explizit weitergeführt. Deshalb beträgt die fachliche Pflichtkernabdeckung derzeit 2 von 4 beziehungsweise 50 Prozent; P04 darf noch nicht geschlossen werden.

Das Gate gleicht die Coverage mit `ITERATIONSUEBERGABE.json` und dem bestätigten PLAN_DELTA ab. Der ältere Prozentwert in `PROJEKTSTATUS.json` wird nicht als Phasenabschlussbeleg verwendet.

Grenzen: Das Gate implementiert keine Produktlogik, verändert keine Nutzdaten und qualifiziert weder I019 noch I020. Es prüft ausschließlich die Planabdeckung und den aktiven Übergabe-Lifecycle.
