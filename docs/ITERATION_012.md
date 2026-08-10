# Iteration I012 — Pfadnormalisierung und Projektwurzel-Schutz

## Ausgangslage

I011 ist als `BASELINE-2026-08-10-I011` auf `main` qualifiziert und promoviert. I012 ist der erste Pfad-Sicherheitsbaustein in P03 und bleibt strikt read-only.

## Gewählter Minimalumfang

- deterministische POSIX-Pfadnormalisierung ohne Datei-I/O
- segmentbasierte Prüfung gegen eine absolute Projektwurzel
- fail-closed Blockade von Parent-Traversal
- sichere Abgrenzung präfixähnlicher Geschwisterpfade
- explizit injizierter Symlink-Vorprüfstatus
- strukturierte Ergebnisse `INNERHALB`, `BLOCKIERT`, `UNBEKANNT`
- reproduzierbarer SHA-256-Fingerprint des Prüfergebnisses

Nicht Bestandteil von I012 sind `mkdir`, Schreiben, Verschieben, Löschen, Überschreiben, Locks, Persistenz, SQLite oder GUI.

## Risikoanalyse

Das höchste Risiko ist eine falsche Innen-/Außen-Klassifikation. Ein Stringvergleich wie `candidate.startswith(root)` würde `/projekt-alt` fälschlich unter `/projekt` einordnen. Ebenfalls gefährlich wäre ein ungeprüftes `resolve()`, da dies reale Dateisystemzustände, Symlinks und nicht existente Pfade vermischt. I012 trennt deshalb lexikalische Zugehörigkeit und Symlink-Sicherheit.

## Sicherheitsvertrag

Ein Kandidat darf nur `INNERHALB` sein, wenn:

1. die Projektwurzel absolut und traversal-frei ist,
2. der Kandidat keine `..`-Traversal enthält,
3. die segmentbasierte `relative_to`-Prüfung innerhalb der Wurzel gelingt und
4. eine vorgelagerte read-only Prüfung `symlink_frei=True` belegt.

`symlink_frei=None` bleibt `UNBEKANNT`, `symlink_frei=False` wird `BLOCKIERT`.

## Rückfallfähigkeit

Die Implementierung liegt auf einem separaten Branch. Sie verändert keine Nutzerdaten und kann vollständig durch Verwerfen dieses Branches zurückgenommen werden.

## CI-Befunde und Minimalreparaturen

Der erste reale I012-Lauf (`31351698536`) war rot. Gleichzeitig wurde der historische I011-Workflow durch den zu breiten Filter `src/provoware/plattform/**` erneut ausgelöst und scheiterte erwartbar an seiner historischen I010-Baseline-Prüfung. Der I012-Code enthielt außerdem eine Ruff-E501-Verletzung in einer 116 Zeichen langen Begründungszeile.

Die erste Reparatur blieb klein und reversibel: Die lange Zeichenkette wurde ohne Logikänderung formatiert. Der historische I011-Workflow reagiert künftig nur noch auf `linux.py`, seinen eigenen Contracttest, die I011-Golden-Fixtures und die I011-Wissenseinträge. Der gemeinsame Exportpunkt `plattform/__init__.py` ist ausdrücklich kein historischer Trigger mehr, weil spätere Iterationen dort regulär neue Exporte ergänzen.

Der zweite reale I012-Lauf (`31354578922`) lieferte den entscheidenden Nachweis: I011-Baseline, 10 I012-Contracttests, 11 I011-Regressionsprüfungen, Ruff, Ruff Format und mypy strict waren grün. Rot war ausschließlich `test_traceability_passt_zum_aktuellen_i010_lebenszykluszustand`, ein drittes historisches I010-Phasenabschlussgate. Es erwartete den alten P02-Zustand `IN_ARBEIT`, obwohl P02 auf der kanonischen I011-Baseline bereits `VALIDIERT` ist.

Die zweite Reparatur ändert keinen Produktcode und keine historische Evidence. Stattdessen wird genau dieses historische I010-Lebenszyklusgate sowohl aus der P02-Laufzeitregression als auch aus der schnellen Gesamtregression im P03-Modus getrennt. Die bereits qualifizierten historischen Abschlussgates bleiben unverändert erhalten und können separat revalidiert werden.

## Qualifikationsstatus

Produktlogik und statische Qualität sind durch Lauf `31354578922` bereits real positiv belegt. Die I012-Promotion bleibt dennoch gesperrt, bis ein neuer Lauf auf dem korrigierten Workflow vollständig grün endet und ein Qualification Receipt samt Evidence-Artefakt erzeugt wurde. Bis dahin lautet der Status weiterhin `PENDING_QUALIFICATION`.
