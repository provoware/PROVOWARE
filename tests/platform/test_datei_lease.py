from __future__ import annotations

from pathlib import Path

from provoware.plattform.datei_lease import LeaseStatus, erwerbe_datei_lease


def test_lease_erwerb_ist_exklusiv_und_nutzdatei_bleibt_unveraendert(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")

    erster = erwerbe_datei_lease(str(datei))
    zweiter = erwerbe_datei_lease(str(datei))

    assert erster.status is LeaseStatus.ERWORBEN
    assert erster.aktiv is True
    assert erster.identitaet is not None
    assert zweiter.status is LeaseStatus.BELEGT
    assert zweiter.aktiv is False
    assert datei.read_bytes() == b"alt"

    assert erster.freigeben() is LeaseStatus.FREIGEGEBEN
    assert erster.aktiv is False
    assert datei.read_bytes() == b"alt"


def test_nach_freigabe_kann_neuer_lease_erworben_werden(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    erster = erwerbe_datei_lease(str(datei))
    assert erster.status is LeaseStatus.ERWORBEN
    erster.freigeben()

    zweiter = erwerbe_datei_lease(str(datei))
    assert zweiter.status is LeaseStatus.ERWORBEN
    zweiter.freigeben()


def test_freigabe_ist_idempotent(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    lease = erwerbe_datei_lease(str(datei))
    assert lease.status is LeaseStatus.ERWORBEN

    assert lease.freigeben() is LeaseStatus.FREIGEGEBEN
    assert lease.freigeben() is LeaseStatus.FREIGEGEBEN


def test_nicht_kanonischer_pfad_wird_fail_closed_blockiert(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")

    lease = erwerbe_datei_lease(f"{tmp_path}/./wissen.json")

    assert lease.status is LeaseStatus.FEHLER
    assert lease.aktiv is False
    assert datei.read_bytes() == b"alt"


def test_context_manager_gibt_lease_frei(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    lease = erwerbe_datei_lease(str(datei))

    with lease:
        assert lease.aktiv is True
        konkurrenz = erwerbe_datei_lease(str(datei))
        assert konkurrenz.status is LeaseStatus.BELEGT

    assert lease.status is LeaseStatus.FREIGEGEBEN
    danach = erwerbe_datei_lease(str(datei))
    assert danach.status is LeaseStatus.ERWORBEN
    danach.freigeben()
