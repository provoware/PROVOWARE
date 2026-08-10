from __future__ import annotations

import os
import stat
from pathlib import Path

import pytest

from provoware.plattform.atomarer_replace import ReplaceStatus, atomar_ersetzen
from provoware.plattform.dateiidentitaet import erfasse_dateiidentitaet, pruefe_stale_guard
from provoware.plattform.dateisystem_probe import pruefe_dateisystempfad
from provoware.plattform.pfade import pruefe_projektpfad


def _gates(datei: Path):
    probe = pruefe_dateisystempfad(str(datei))
    pfad = pruefe_projektpfad(str(datei.parent), str(datei), symlink_frei=probe.symlink_frei)
    snapshot = erfasse_dateiidentitaet(str(datei))
    stale = pruefe_stale_guard(snapshot)
    return pfad, probe, stale


def test_erfolgreicher_replace_ersetzt_inhalt_und_bewahrt_modus(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    datei.chmod(0o640)
    pfad, probe, stale = _gates(datei)

    ergebnis = atomar_ersetzen(
        ziel=str(datei),
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        stale_pruefung=stale,
    )

    assert ergebnis.status is ReplaceStatus.ERSETZT
    assert ergebnis.mutation_erfolgt is True
    assert ergebnis.temp_pfad is None
    assert datei.read_bytes() == b"neu"
    assert stat.S_IMODE(datei.stat().st_mode) == 0o640
    assert list(tmp_path.glob(".wissen.json.provoware-*")) == []


def test_stale_blockiert_bevor_tempdatei_entsteht(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    pfad, probe, stale = _gates(datei)
    datei.write_bytes(b"veraendert")
    stale = pruefe_stale_guard(stale.erwartet)

    def verboten(*args: object, **kwargs: object) -> tuple[int, str]:
        raise AssertionError("mkstemp darf bei STALE nicht erreicht werden")

    monkeypatch.setattr("provoware.plattform.atomarer_replace.tempfile.mkstemp", verboten)
    ergebnis = atomar_ersetzen(
        ziel=str(datei),
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        stale_pruefung=stale,
    )

    assert ergebnis.status is ReplaceStatus.BLOCKIERT
    assert ergebnis.mutation_erfolgt is False
    assert datei.read_bytes() == b"veraendert"


def test_unbekannte_identitaet_blockiert(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    pfad, probe, _ = _gates(datei)
    snapshot = erfasse_dateiidentitaet(str(datei))
    datei.unlink()
    stale = pruefe_stale_guard(snapshot)

    ergebnis = atomar_ersetzen(
        ziel=str(datei),
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        stale_pruefung=stale,
    )

    assert ergebnis.status is ReplaceStatus.BLOCKIERT
    assert ergebnis.mutation_erfolgt is False
    assert not datei.exists()


def test_symlink_probe_blockiert(tmp_path: Path) -> None:
    ziel = tmp_path / "ziel.json"
    ziel.write_bytes(b"alt")
    link = tmp_path / "link.json"
    link.symlink_to(ziel)
    probe = pruefe_dateisystempfad(str(link))
    pfad = pruefe_projektpfad(str(tmp_path), str(link), symlink_frei=probe.symlink_frei)
    snapshot = erfasse_dateiidentitaet(str(link))
    stale = pruefe_stale_guard(snapshot)

    ergebnis = atomar_ersetzen(
        ziel=str(link),
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        stale_pruefung=stale,
    )

    assert ergebnis.status is ReplaceStatus.BLOCKIERT
    assert ziel.read_bytes() == b"alt"


def test_ausserhalb_der_projektwurzel_blockiert(tmp_path: Path) -> None:
    projekt = tmp_path / "projekt"
    projekt.mkdir()
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    probe = pruefe_dateisystempfad(str(datei))
    pfad = pruefe_projektpfad(str(projekt), str(datei), symlink_frei=probe.symlink_frei)
    snapshot = erfasse_dateiidentitaet(str(datei))
    stale = pruefe_stale_guard(snapshot)

    ergebnis = atomar_ersetzen(
        ziel=str(datei),
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        stale_pruefung=stale,
    )

    assert ergebnis.status is ReplaceStatus.BLOCKIERT
    assert datei.read_bytes() == b"alt"


def test_fsync_fehler_vor_replace_laesst_original_unveraendert(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    pfad, probe, stale = _gates(datei)
    original_fsync = os.fsync

    def fsync_fehler(fd: int) -> None:
        if stat.S_ISREG(os.fstat(fd).st_mode):
            raise OSError("Datei-fsync absichtlich fehlgeschlagen")
        original_fsync(fd)

    monkeypatch.setattr("provoware.plattform.atomarer_replace.os.fsync", fsync_fehler)
    ergebnis = atomar_ersetzen(
        ziel=str(datei),
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        stale_pruefung=stale,
    )

    assert ergebnis.status is ReplaceStatus.FEHLER_VOR_REPLACE
    assert ergebnis.mutation_erfolgt is False
    assert datei.read_bytes() == b"alt"
    assert list(tmp_path.glob(".wissen.json.provoware-*")) == []


def test_dir_fsync_fehler_meldet_mutation_als_bereits_erfolgt(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    pfad, probe, stale = _gates(datei)
    original_fsync = os.fsync

    def fsync_fehler(fd: int) -> None:
        if stat.S_ISDIR(os.fstat(fd).st_mode):
            raise OSError("Verzeichnis-fsync absichtlich fehlgeschlagen")
        original_fsync(fd)

    monkeypatch.setattr("provoware.plattform.atomarer_replace.os.fsync", fsync_fehler)
    ergebnis = atomar_ersetzen(
        ziel=str(datei),
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        stale_pruefung=stale,
    )

    assert ergebnis.status is ReplaceStatus.FEHLER_NACH_REPLACE
    assert ergebnis.mutation_erfolgt is True
    assert datei.read_bytes() == b"neu"


def test_nicht_normalisierter_zielpfad_blockiert(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_bytes(b"alt")
    pfad, probe, stale = _gates(datei)
    ziel = f"{tmp_path}/./wissen.json"

    ergebnis = atomar_ersetzen(
        ziel=ziel,
        inhalt=b"neu",
        pfadpruefung=pfad,
        dateisystemprobe=probe,
        stale_pruefung=stale,
    )

    assert ergebnis.status is ReplaceStatus.BLOCKIERT
    assert datei.read_bytes() == b"alt"
