from __future__ import annotations

import multiprocessing as mp
from pathlib import Path
from queue import Empty
from typing import Any

from provoware.plattform.datei_lease import LeaseStatus, erwerbe_datei_lease


def _halte_lease(ziel: str, bereit: Any, freigabe: Any, ergebnis: Any) -> None:
    lease = erwerbe_datei_lease(ziel)
    ergebnis.put((str(lease.status), lease.identitaet.pid if lease.identitaet else None))
    if lease.status is not LeaseStatus.ERWORBEN:
        bereit.set()
        return
    bereit.set()
    if not freigabe.wait(timeout=10):
        lease.freigeben()
        return
    lease.freigeben()


def _versuche_lease(ziel: str, ergebnis: Any) -> None:
    lease = erwerbe_datei_lease(ziel)
    ergebnis.put((str(lease.status), lease.identitaet.pid if lease.identitaet else None))
    if lease.status is LeaseStatus.ERWORBEN:
        lease.freigeben()


def _hole_ergebnis(ergebnis: Any) -> tuple[str, int | None]:
    try:
        status, pid = ergebnis.get(timeout=10)
    except Empty as exc:
        raise AssertionError("Mehrprozess-Lease lieferte kein Ergebnis.") from exc
    assert isinstance(status, str)
    assert pid is None or isinstance(pid, int)
    return status, pid


def _beende_prozess(prozess: mp.Process) -> None:
    prozess.join(timeout=10)
    if prozess.is_alive():
        prozess.terminate()
        prozess.join(timeout=5)
        raise AssertionError("Mehrprozess-Lease-Testprozess hing und wurde beendet.")
    assert prozess.exitcode == 0


def test_lease_serialisiert_drei_getrennte_prozesse(tmp_path: Path) -> None:
    """A hält den Lease, B wird blockiert, nach A-Freigabe erwirbt C denselben Lease."""
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")

    ctx = mp.get_context("spawn")
    bereit = ctx.Event()
    freigabe = ctx.Event()
    ergebnis_a = ctx.Queue()
    ergebnis_b = ctx.Queue()
    ergebnis_c = ctx.Queue()

    prozess_a = ctx.Process(target=_halte_lease, args=(str(datei), bereit, freigabe, ergebnis_a))
    prozess_a.start()
    assert bereit.wait(timeout=10), "Prozess A meldete keinen Lease-Zustand."
    status_a, pid_a = _hole_ergebnis(ergebnis_a)
    assert status_a == LeaseStatus.ERWORBEN
    assert pid_a == prozess_a.pid

    prozess_b = ctx.Process(target=_versuche_lease, args=(str(datei), ergebnis_b))
    prozess_b.start()
    status_b, pid_b = _hole_ergebnis(ergebnis_b)
    _beende_prozess(prozess_b)
    assert status_b == LeaseStatus.BELEGT
    assert pid_b is None
    assert datei.read_bytes() == b"alt"

    freigabe.set()
    _beende_prozess(prozess_a)

    prozess_c = ctx.Process(target=_versuche_lease, args=(str(datei), ergebnis_c))
    prozess_c.start()
    status_c, pid_c = _hole_ergebnis(ergebnis_c)
    _beende_prozess(prozess_c)
    assert status_c == LeaseStatus.ERWORBEN
    assert pid_c == prozess_c.pid
    assert pid_a != pid_c
    assert datei.read_bytes() == b"alt"
