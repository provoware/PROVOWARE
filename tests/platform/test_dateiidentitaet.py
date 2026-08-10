from __future__ import annotations

import os
from pathlib import Path

from provoware.plattform.dateiidentitaet import (
    IdentitaetsStatus,
    StaleStatus,
    erfasse_dateiidentitaet,
    pruefe_stale_guard,
)


def test_gleiche_datei_ergibt_reproduzierbare_identitaet(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_text("abc", encoding="utf-8")

    a = erfasse_dateiidentitaet(str(datei))
    b = erfasse_dateiidentitaet(str(datei))

    assert a.status is IdentitaetsStatus.ERFASST
    assert a == b
    assert a.identitaet is not None
    assert len(a.fingerprint_sha256) == 64


def test_unmittelbarer_recheck_unveraenderter_datei_ist_gleich(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_text("abc", encoding="utf-8")
    erwartet = erfasse_dateiidentitaet(str(datei))

    ergebnis = pruefe_stale_guard(erwartet)

    assert ergebnis.status is StaleStatus.GLEICH
    assert ergebnis.geaenderte_merkmale == ()


def test_austausch_gegen_andere_inode_wird_stale(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    ersatz = tmp_path / "ersatz.json"
    datei.write_text("alt", encoding="utf-8")
    erwartet = erfasse_dateiidentitaet(str(datei))
    ersatz.write_text("neu", encoding="utf-8")
    os.replace(ersatz, datei)

    ergebnis = pruefe_stale_guard(erwartet)

    assert ergebnis.status is StaleStatus.STALE
    assert "inode" in ergebnis.geaenderte_merkmale


def test_inhaltsaenderung_wird_ueber_stat_merkmale_stale(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_text("a", encoding="utf-8")
    erwartet = erfasse_dateiidentitaet(str(datei))
    datei.write_text("laenger", encoding="utf-8")

    ergebnis = pruefe_stale_guard(erwartet)

    assert ergebnis.status is StaleStatus.STALE
    assert "groesse" in ergebnis.geaenderte_merkmale


def test_fehlende_datei_liefert_unbekannt(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"

    snapshot = erfasse_dateiidentitaet(str(datei))

    assert snapshot.status is IdentitaetsStatus.UNBEKANNT
    assert snapshot.identitaet is None
    assert snapshot.fehler_typ == "FileNotFoundError"


def test_nach_snapshot_entfernte_datei_liefert_unbekannt(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_text("abc", encoding="utf-8")
    erwartet = erfasse_dateiidentitaet(str(datei))
    datei.unlink()

    ergebnis = pruefe_stale_guard(erwartet)

    assert ergebnis.status is StaleStatus.UNBEKANNT
    assert ergebnis.aktuell.fehler_typ == "FileNotFoundError"


def test_lstat_fehler_ist_fail_closed_unbekannt() -> None:
    def verweigert(_: str) -> os.stat_result:
        raise PermissionError("absichtlich")

    snapshot = erfasse_dateiidentitaet("/srv/provoware/wissen.json", lstat_funktion=verweigert)

    assert snapshot.status is IdentitaetsStatus.UNBEKANNT
    assert snapshot.fehler_typ == "PermissionError"


def test_relative_eingabe_wird_nicht_gelesen() -> None:
    aufrufe: list[str] = []

    def zaehler(pfad: str) -> os.stat_result:
        aufrufe.append(pfad)
        return os.lstat("/")

    snapshot = erfasse_dateiidentitaet("daten/wissen.json", lstat_funktion=zaehler)

    assert snapshot.status is IdentitaetsStatus.UNBEKANNT
    assert aufrufe == []


def test_snapshot_und_recheck_veraendern_datei_nicht(tmp_path: Path) -> None:
    datei = tmp_path / "wissen.json"
    datei.write_text("unveraendert", encoding="utf-8")
    vorher = (datei.read_bytes(), datei.stat().st_size, datei.stat().st_mtime_ns)

    snapshot = erfasse_dateiidentitaet(str(datei))
    ergebnis = pruefe_stale_guard(snapshot)

    nachher = (datei.read_bytes(), datei.stat().st_size, datei.stat().st_mtime_ns)
    assert ergebnis.status is StaleStatus.GLEICH
    assert nachher == vorher
