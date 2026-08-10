from __future__ import annotations

import json
from pathlib import Path

import pytest

from provoware.plattform import (
    LinuxSystemProfil,
    LinuxSystemQuellen,
    PlattformStatus,
    SessionArt,
    erkenne_linux_systemprofil,
    parse_os_release,
)

pytestmark = pytest.mark.contract

FIXTURES = Path(__file__).parents[1] / "fixtures" / "i011"


def _profil(
    *, version: str = "22.04", session: str = "x11", arch: str = "x86_64"
) -> LinuxSystemProfil:
    return erkenne_linux_systemprofil(
        LinuxSystemQuellen(
            os_release={"ID": "ubuntu", "VERSION_ID": version},
            umgebung={"XDG_SESSION_TYPE": session, "DISPLAY": ":0"},
            architektur=arch,
        )
    )


@pytest.mark.parametrize("dateiname", ["ubuntu-22.04-x11.json", "ubuntu-24.04-x11.json"])
def test_golden_zielprofile_sind_unterstuetzt(dateiname: str) -> None:
    daten = json.loads((FIXTURES / dateiname).read_text(encoding="utf-8"))
    profil = erkenne_linux_systemprofil(
        LinuxSystemQuellen(
            os_release=daten["os_release"],
            umgebung=daten["umgebung"],
            architektur=daten["architektur"],
        )
    )
    assert profil.session.value == daten["erwartet"]["session"]
    assert profil.status.value == daten["erwartet"]["status"]
    assert len(profil.fingerprint_sha256) == 64


@pytest.mark.parametrize("version", ["22.04", "24.04"])
def test_ubuntu_zielprofile_x11_sind_unterstuetzt(version: str) -> None:
    profil = _profil(version=version)
    assert profil.session is SessionArt.X11
    assert profil.status is PlattformStatus.UNTERSTUETZT


def test_wayland_mit_display_wird_nicht_als_x11_qualifiziert() -> None:
    profil = _profil(session="wayland")
    assert profil.session is SessionArt.WAYLAND
    assert profil.status is PlattformStatus.EINGESCHRAENKT


def test_display_allein_belegt_keine_x11_sitzung() -> None:
    profil = erkenne_linux_systemprofil(
        LinuxSystemQuellen(
            os_release={"ID": "ubuntu", "VERSION_ID": "22.04"},
            umgebung={"DISPLAY": ":0"},
            architektur="x86_64",
        )
    )
    assert profil.session is SessionArt.UNBEKANNT
    assert profil.status is PlattformStatus.UNBEKANNT


def test_nicht_amd64_wird_fail_closed_abgelehnt() -> None:
    profil = _profil(arch="aarch64")
    assert profil.status is PlattformStatus.NICHT_UNTERSTUETZT


def test_unbekannte_ubuntu_version_wird_nicht_als_zielprofil_ausgegeben() -> None:
    profil = _profil(version="26.04")
    assert profil.status is PlattformStatus.EINGESCHRAENKT


def test_fehlende_os_release_felder_liefern_unbekannt() -> None:
    profil = erkenne_linux_systemprofil(
        LinuxSystemQuellen(
            os_release={},
            umgebung={"XDG_SESSION_TYPE": "x11"},
            architektur="x86_64",
        )
    )
    assert profil.status is PlattformStatus.UNBEKANNT


def test_fingerprint_ist_deterministisch_und_mapping_reihenfolge_unabhaengig() -> None:
    links = erkenne_linux_systemprofil(
        LinuxSystemQuellen(
            os_release={"ID": "ubuntu", "VERSION_ID": "24.04"},
            umgebung={"DISPLAY": ":0", "XDG_SESSION_TYPE": "x11"},
            architektur="amd64",
        )
    )
    rechts = erkenne_linux_systemprofil(
        LinuxSystemQuellen(
            os_release={"VERSION_ID": "24.04", "ID": "ubuntu"},
            umgebung={"XDG_SESSION_TYPE": "x11", "DISPLAY": ":0"},
            architektur="amd64",
        )
    )
    assert links.fingerprint_sha256 == rechts.fingerprint_sha256


def test_os_release_parser_ignoriert_ungueltige_zeilen_fail_closed() -> None:
    parsed = parse_os_release(
        '# Kommentar\nID="ubuntu"\nVERSION_ID="22.04"\nOHNE_GLEICH\n=ungueltig\n'
    )
    assert parsed == {"ID": "ubuntu", "VERSION_ID": "22.04"}
