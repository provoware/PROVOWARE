"""Kooperativ serialisierte Replace-Kopplung fuer PLAN_DELTA-I016.3.

Diese Orchestrierung verbindet die bereits qualifizierten Bausteine in enger Reihenfolge:
Lease erwerben -> I014-Stale-Recheck unter gehaltenem Lease -> I015 atomarer Replace ->
Lease freigeben. Die bestehende I015-Primitive bleibt unveraendert und separat testbar.

Der Schutz gilt fuer kooperierende PROVOWARE-Schreiber auf dem qualifizierten lokalen
Linux-Dateisystem-Scope. Nicht kooperierende Prozesse und Netzwerkdateisysteme bleiben
ausdruecklich ausserhalb der Qualification.
"""

from __future__ import annotations

from provoware.plattform.atomarer_replace import ReplaceErgebnis, ReplaceStatus, atomar_ersetzen
from provoware.plattform.datei_lease import LeaseStatus, erwerbe_datei_lease
from provoware.plattform.dateiidentitaet import IdentitaetsSnapshot, pruefe_stale_guard
from provoware.plattform.dateisystem_probe import DateisystemProbe
from provoware.plattform.pfade import PfadPruefung


def _blockiert(ziel: str, begruendung: str) -> ReplaceErgebnis:
    return ReplaceErgebnis(
        ziel=ziel,
        status=ReplaceStatus.BLOCKIERT,
        mutation_erfolgt=False,
        temp_pfad=None,
        fehler_typ=None,
        begruendung=begruendung,
    )


def sicher_atomar_ersetzen(
    *,
    ziel: str,
    inhalt: bytes,
    pfadpruefung: PfadPruefung,
    dateisystemprobe: DateisystemProbe,
    erwartet: IdentitaetsSnapshot,
) -> ReplaceErgebnis:
    """Ersetze genau eine Datei nur unter Lease und frischem I014-Recheck.

    Ein nicht erworbener Lease blockiert vor jeder Nutzdatenmutation. Nach erfolgreichem
    Lease-Erwerb wird der erwartete I014-Snapshot unmittelbar erneut gelesen und genau
    dieser frische Befund an I015 weitergereicht. Der Lease bleibt bis zum Abschluss oder
    Fehler der Replace-Primitive gehalten und wird ueber den Kontextmanager deterministisch
    freigegeben.
    """

    lease = erwerbe_datei_lease(ziel)
    if lease.status is not LeaseStatus.ERWORBEN:
        return _blockiert(
            ziel,
            f"I016-Lease blockiert den Replace: {lease.status.value}; {lease.begruendung}",
        )

    with lease:
        stale = pruefe_stale_guard(erwartet)
        return atomar_ersetzen(
            ziel=ziel,
            inhalt=inhalt,
            pfadpruefung=pfadpruefung,
            dateisystemprobe=dateisystemprobe,
            stale_pruefung=stale,
        )
