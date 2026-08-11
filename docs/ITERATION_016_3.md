# Delta-I016.3 — Lease-Stale-Replace-Kopplung

## Ziel
Den kleinsten mutierenden P0-Verbund qualifizieren, ohne die bereits qualifizierte I015-Primitive umzubauen:

`Lease erwerben -> I014-Stale-Recheck unter gehaltenem Lease -> I015 atomar_ersetzen -> Lease freigeben`

## Sicherheitsvertrag
- Ein nicht erworbener oder belegter Lease blockiert vor Stale-Recheck und Nutzdatenmutation.
- Der I014-Recheck wird erst nach erfolgreichem Lease-Erwerb ausgeführt.
- Nur der frische Recheck wird an I015 weitergereicht.
- Bei STALE oder UNBEKANNT bleibt I015 fail-closed und erzeugt keine Nutzdatenmutation.
- Der Lease bleibt bis zum Ende der Replace-Primitive gehalten und wird auch bei unerwarteter Exception deterministisch freigegeben.
- I012-Projektwurzel und I013-Symlinkprobe bleiben unverändert verpflichtende I015-Vorbedingungen.

## Bewusste Grenzen
- Nicht kooperierende Schreiber: `NICHT_QUALIFIZIERT`.
- Netzwerkdateisysteme: `NICHT_QUALIFIZIERT`.
- Advisory `flock` ist keine globale Schreibsperre gegen fremde Programme.
- Der rohe Einstieg `atomar_ersetzen` bleibt aus Kompatibilitaetsgruenden erhalten; der kooperative I016-Pfad ist `sicher_atomar_ersetzen`.

## Reale Qualification
Status: `VALIDIERT_GITHUB` / `PASS_REAL`.

- Tool-PR: `#36`
- Qualifikations-Head: `403bba4b2ae6e8a79e573e95dca7f2308c37207f`
- Workflow: `31511070448` — `completed / success`
- kanonischer Tool-Merge: `a4b63b758bf5ef71060d2e73eae95d584be13fbe`
- Workflow-Artefakte: keine publizierten Artefakte; der Nachweis ist deshalb an Run, Head und Merge gebunden, nicht an eine erfundene Artifact-ID.

Real nachgewiesen wurden:
1. Erfolgsweg ersetzt unter Lease und gibt danach den Lease frei.
2. Externe Zielaenderung zwischen erwartetem Snapshot und Lease-Recheck blockiert ohne Mutation.
3. Bereits belegter Lease blockiert vor Stale-Recheck.
4. Unerwarteter Fehler im Replace-Pfad gibt den Lease dennoch frei.
5. Bestehende I014-, I015- und I016-Regressionen blieben im Qualification-Gate gruen.
6. Der endgültige Workflow lief auf exakt dem promovierten Qualification-Head erfolgreich.

## Wissensstatus
Die zugehoerige Masterbuch-Evidence `ERK-I016-003` wurde nach realer Qualification auf E2/P0 `BESTAETIGT` angehoben und mit ERK-I016-001/002 konsolidiert. Es entstand keine neue Goldene Regel.

## P03-Abschluss
Die Abschlussbedingung von `PLAN-DELTA-P03-2026-08-10-001` ist erfuellt. Der Delta-Punkt I016 ist real qualifiziert und promoviert. Die P04-Fortsetzung wird ohne Umschreiben des Masterplans eindeutig neu zugeordnet:

- Projekt-I017 = Masterplan P04/I015 — dauerhafte ID-Erzeugung und Validierung
- Projekt-I018 = Masterplan P04/I016 — Versions- und Manifestregistry

Goldene Regel: NEIN. Die Grenzen `NICHT_QUALIFIZIERT` fuer nicht kooperierende Schreiber und Netzwerkdateisysteme bleiben unveraendert bestehen.
