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

## Qualifikationsstatus

Die Contracttests und der CI-Vertrag sind Bestandteil des Branches. Erst ein real beobachteter grüner GitHub-Actions-Lauf darf I012 promovieren oder die Wissensregel über E1 hinaus anheben.
