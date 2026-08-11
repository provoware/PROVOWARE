from __future__ import annotations

from pathlib import Path

import pytest

import provoware.plattform.sicherer_replace as sicherer_replace_modul
from provoware.plattform.atomarer_replace import ReplaceStatus
from provoware.plattform.datei_lease import LeaseStatus, erwerbe_datei_lease
from provoware.plattform.dateiidentitaet import erfasse_dateiidentitaet
from provoware.plattform.dateisystem_probe import pruefe_dateisystempfad
from provoware.plattform.pfade import pruefe_projektpfad
from provoware.plattform.sicherer_replace import sicher_atomar_ersetzen


def _vorbedingungen(datei: Path):
    probe = pruefe_dateisystempfad(str(datei))
    pfad = pruefe_projektpfad(str(datei.parent), str(datei), symlink_frei=probe.symlink_frei)
    erwartet = erfasse_dateiidentitaet(str(datei))
    return pfad, probe, erwartet


def test_erfolgsweg_ersetzt_unter_lease_und_gibt_ihn_frei(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    pfad, probe, erwartet = _vorbedingungen(datei)

    ergebnis = sicher_atomar_ersetzen(
        ziel=str(datei),
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        erwartet=erwartet,
    )

    assert ergebnis.status is ReplaceStatus.ERSETZT
    assert ergebnis.mutation_erfolgt is True
    assert datei.read_bytes() == b"neu"
    danach = erwerbe_datei_lease(str(datei))
    assert danach.status is LeaseStatus.ERWORBEN
    danach.freigeben()


def test_externe_aenderung_vor_lease_recheck_blockiert_ohne_mutation(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    pfad, probe, erwartet = _vorbedingungen(datei)
    datei.write_bytes(b"extern-geaendert")

    ergebnis = sicher_atomar_ersetzen(
        ziel=str(datei),
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        erwartet=erwartet,
    )

    assert ergebnis.status is ReplaceStatus.BLOCKIERT
    assert ergebnis.mutation_erfolgt is False
    assert datei.read_bytes() == b"extern-geaendert"
    assert list(tmp_path.glob(".wissen.json.provoware-*")) == []


def test_belegter_lease_blockiert_vor_stale_recheck_und_mutation(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    pfad, probe, erwartet = _vorbedingungen(datei)
    gehalten = erwerbe_datei_lease(str(datei))
    assert gehalten.status is LeaseStatus.ERWORBEN

    def stale_darf_nicht_laufen(*args: object, **kwargs: object):
        raise AssertionError("Stale-Recheck darf ohne Lease nicht erreicht werden")

    monkeypatch.setattr(sicherer_replace_modul, "pruefe_stale_guard", stale_darf_nicht_laufen)
    try:
        ergebnis = sicher_atomar_ersetzen(
            ziel=str(datei),
            inhalt=b"neu",
            pfadpruefung=pfad,
            dateisystemprobe=probe,
            erwartet=erwartet,
        )
    finally:
        gehalten.freigeben()

    assert ergebnis.status is ReplaceStatus.BLOCKIERT
    assert ergebnis.mutation_erfolgt is False
    assert "BELEGT" in ergebnis.begruendung
    assert datei.read_bytes() == b"alt"


def test_unerwarteter_replace_fehler_gibt_lease_trotzdem_frei(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    pfad, probe, erwartet = _vorbedingungen(datei)

    def kaputt(*args: object, **kwargs: object):
        raise RuntimeError("absichtlicher Testfehler")

    monkeypatch.setattr(sicherer_replace_modul, "atomar_ersetzen", kaputt)
    with pytest.raises(RuntimeError, match="absichtlicher Testfehler"):
        sicher_atomar_ersetzen(
            ziel=str(datei),
            inhalt=b"neu",
            pfadpruefung=pfad,
            dateisystemprobe=probe,
            erwartet=erwartet,
        )

    danach = erwerbe_datei_lease(str(datei))
    assert danach.status is LeaseStatus.ERWORBEN
    danach.freigeben()
    assert datei.read_bytes() == b"alt"
