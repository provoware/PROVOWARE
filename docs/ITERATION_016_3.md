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
- Nicht kooperierende Schreiber: NICHT_QUALIFIZIERT.
- Netzwerkdateisysteme: NICHT_QUALIFIZIERT.
- Advisory `flock` ist keine globale Schreibsperre gegen fremde Programme.
- Der bisherige rohe Einstieg `atomar_ersetzen` bleibt aus Kompatibilitaetsgruenden erhalten; der neue kooperative I016-Pfad ist `sicher_atomar_ersetzen`.

## Qualification
Status: AUSSTEHEND.

Erforderlich vor Promotion:
1. Erfolgsweg ersetzt unter Lease und gibt danach den Lease frei.
2. Externe Zielaenderung zwischen erwartetem Snapshot und Lease-Recheck blockiert ohne Mutation.
3. Bereits belegter Lease blockiert vor Stale-Recheck.
4. Unerwarteter Fehler im Replace-Pfad gibt den Lease dennoch frei.
5. Bestehende I014-, I015- und I016-Regressionen bleiben gruen.
6. Ruff, Format und mypy strict sind gruen.

Goldene Regel: NEIN. Wissensreife vor realer Qualification: E1 / IN_PRUEFUNG.
