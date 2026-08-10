from __future__ import annotations

import os
from pathlib import Path

from provoware.plattform.dateisystem_probe import PfadArt, ProbeStatus, pruefe_dateisystempfad


def test_normale_datei_ist_symlink_frei(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_text("{}", encoding="utf-8")

    ergebnis = pruefe_dateisystempfad(str(datei))

    assert ergebnis.status is ProbeStatus.SICHER
    assert ergebnis.symlink_frei is True
    assert ergebnis.befunde[-1].art is PfadArt.DATEI


def test_normales_verzeichnis_ist_symlink_frei(tmp_path: Path) -> None:
    verzeichnis = tmp_path / "daten"
    verzeichnis.mkdir()

    ergebnis = pruefe_dateisystempfad(str(verzeichnis))

    assert ergebnis.status is ProbeStatus.SICHER
    assert ergebnis.befunde[-1].art is PfadArt.VERZEICHNIS


def test_symlink_im_kandidatenpfad_wird_erkannt(tmp_path: Path) -> None:
    ziel = tmp_path / "ziel.txt"
    ziel.write_text("x", encoding="utf-8")
    link = tmp_path / "link.txt"
    link.symlink_to(ziel)

    ergebnis = pruefe_dateisystempfad(str(link))

    assert ergebnis.status is ProbeStatus.SYMLINK
    assert ergebnis.symlink_frei is False
    assert ergebnis.symlink_segment == str(link)
    assert ergebnis.befunde[-1].art is PfadArt.SYMLINK


def test_symlink_in_elternsegment_wird_erkannt(tmp_path: Path) -> None:
    echtes_verzeichnis = tmp_path / "echt"
    echtes_verzeichnis.mkdir()
    (echtes_verzeichnis / "wissen.json").write_text("{}", encoding="utf-8")
    link_verzeichnis = tmp_path / "alias"
    link_verzeichnis.symlink_to(echtes_verzeichnis, target_is_directory=True)

    ergebnis = pruefe_dateisystempfad(str(link_verzeichnis / "wissen.json"))

    assert ergebnis.status is ProbeStatus.SYMLINK
    assert ergebnis.symlink_segment == str(link_verzeichnis)


def test_nicht_existenter_pfad_bleibt_unbekannt(tmp_path: Path) -> None:
    kandidat = tmp_path / "fehlt" / "wissen.json"

    ergebnis = pruefe_dateisystempfad(str(kandidat))

    assert ergebnis.status is ProbeStatus.UNBEKANNT
    assert ergebnis.symlink_frei is None
    assert ergebnis.fehler_typ == "FileNotFoundError"


def test_lstat_fehler_wird_nicht_als_sicher_gewertet() -> None:
    def verweigert(_: str) -> os.stat_result:
        raise PermissionError("absichtlich")

    ergebnis = pruefe_dateisystempfad("/srv/provoware", lstat_funktion=verweigert)

    assert ergebnis.status is ProbeStatus.UNBEKANNT
    assert ergebnis.fehler_segment == "/"
    assert ergebnis.fehler_typ == "PermissionError"


def test_relative_und_traversal_pfade_werden_nicht_geprueft() -> None:
    aufrufe: list[str] = []

    def zaehler(pfad: str) -> os.stat_result:
        aufrufe.append(pfad)
        return os.lstat("/")

    relativ = pruefe_dateisystempfad("daten/wissen.json", lstat_funktion=zaehler)
    traversal = pruefe_dateisystempfad("/srv/../etc/passwd", lstat_funktion=zaehler)

    assert relativ.status is ProbeStatus.UNBEKANNT
    assert traversal.status is ProbeStatus.UNBEKANNT
    assert aufrufe == []


def test_gleiche_befunde_erzeugen_gleiches_ergebnis(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_text("{}", encoding="utf-8")

    a = pruefe_dateisystempfad(str(datei))
    b = pruefe_dateisystempfad(str(datei))

    assert a == b
    assert len(a.fingerprint_sha256) == 64


def test_probe_veraendert_bestehende_datei_nicht(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_text("unveraendert", encoding="utf-8")
    vorher = (datei.read_bytes(), datei.stat().st_size, datei.stat().st_mtime_ns)

    ergebnis = pruefe_dateisystempfad(str(datei))

    nachher = (datei.read_bytes(), datei.stat().st_size, datei.stat().st_mtime_ns)
    assert ergebnis.status is ProbeStatus.SICHER
    assert nachher == vorher
