"""Read-only Linux-Systemprofil und reproduzierbare X11-Erkennung für P03/I011.

Die Auswertung ist absichtlich von Live-Systemzugriffen getrennt: Aufrufer liefern bereits
ermittelte ``os-release``-, Umgebungs- und Architekturwerte. Dadurch bleiben Tests
reproduzierbar und XWayland wird nicht durch ein bloß vorhandenes ``DISPLAY`` als echte
X11-Sitzung fehlklassifiziert.
"""

from __future__ import annotations

import json
from collections.abc import Mapping
from dataclasses import dataclass
from enum import StrEnum
from hashlib import sha256


class SessionArt(StrEnum):
    """Erkannte Linux-Desktop-Sitzungsart."""

    X11 = "X11"
    WAYLAND = "WAYLAND"
    UNBEKANNT = "UNBEKANNT"


class PlattformStatus(StrEnum):
    """Qualifikation gegenüber der PROVOWARE-V1-Zielplattform."""

    UNTERSTUETZT = "UNTERSTUETZT"
    EINGESCHRAENKT = "EINGESCHRAENKT"
    UNBEKANNT = "UNBEKANNT"
    NICHT_UNTERSTUETZT = "NICHT_UNTERSTUETZT"


@dataclass(frozen=True, slots=True)
class LinuxSystemQuellen:
    """Injizierbare, bereits gelesene Quellen für die Profilerkennung."""

    os_release: Mapping[str, str]
    umgebung: Mapping[str, str]
    architektur: str


@dataclass(frozen=True, slots=True)
class LinuxSystemProfil:
    """Deterministisches, read-only Plattformprofil."""

    distribution_id: str
    version_id: str
    architektur: str
    session: SessionArt
    status: PlattformStatus
    begruendung: str
    fingerprint_sha256: str


_ZIEL_UBUNTU_VERSIONEN = frozenset({"22.04", "24.04"})
_AMD64_ALIASE = frozenset({"amd64", "x86_64"})


def parse_os_release(text: str) -> dict[str, str]:
    """Parse ``os-release`` deterministisch, ohne Shell oder Datei-I/O.

    Leere Zeilen und Kommentare werden ignoriert. Ungültige Zeilen ohne ``=`` werden
    fail-closed ausgelassen; fehlende Pflichtinformationen führen später zu UNBEKANNT.
    """

    werte: dict[str, str] = {}
    for rohzeile in text.splitlines():
        zeile = rohzeile.strip()
        if not zeile or zeile.startswith("#") or "=" not in zeile:
            continue
        schluessel, wert = zeile.split("=", 1)
        schluessel = schluessel.strip()
        wert = wert.strip()
        if not schluessel:
            continue
        if len(wert) >= 2 and wert[0] == wert[-1] and wert[0] in {'"', "'"}:
            wert = wert[1:-1]
        werte[schluessel] = wert
    return werte


def _erkenne_session(umgebung: Mapping[str, str]) -> SessionArt:
    session_typ = umgebung.get("XDG_SESSION_TYPE", "").strip().lower()
    if session_typ == "x11":
        return SessionArt.X11
    if session_typ == "wayland":
        return SessionArt.WAYLAND
    return SessionArt.UNBEKANNT


def _klassifiziere(
    *, distribution_id: str, version_id: str, architektur: str, session: SessionArt
) -> tuple[PlattformStatus, str]:
    if not distribution_id or not version_id or not architektur:
        return PlattformStatus.UNBEKANNT, "Erforderliche Plattformangaben fehlen."
    if distribution_id != "ubuntu":
        return PlattformStatus.NICHT_UNTERSTUETZT, "Distribution ist nicht Ubuntu."
    if architektur not in _AMD64_ALIASE:
        return PlattformStatus.NICHT_UNTERSTUETZT, "Architektur ist nicht amd64/x86_64."
    if version_id not in _ZIEL_UBUNTU_VERSIONEN:
        return PlattformStatus.EINGESCHRAENKT, "Ubuntu-Version liegt außerhalb der V1-Zielprofile."
    if session is SessionArt.WAYLAND:
        return PlattformStatus.EINGESCHRAENKT, "Wayland erkannt; V1 qualifiziert X11-first."
    if session is SessionArt.UNBEKANNT:
        return PlattformStatus.UNBEKANNT, "Sitzungsart ist nicht eindeutig belegt."
    return PlattformStatus.UNTERSTUETZT, "Ubuntu-amd64-X11 entspricht einem V1-Zielprofil."


def erkenne_linux_systemprofil(quellen: LinuxSystemQuellen) -> LinuxSystemProfil:
    """Erzeuge aus injizierten Quellen ein kanonisches Linux-Systemprofil."""

    distribution_id = quellen.os_release.get("ID", "").strip().lower()
    version_id = quellen.os_release.get("VERSION_ID", "").strip()
    architektur = quellen.architektur.strip().lower()
    session = _erkenne_session(quellen.umgebung)
    status, begruendung = _klassifiziere(
        distribution_id=distribution_id,
        version_id=version_id,
        architektur=architektur,
        session=session,
    )
    fingerprint_basis = {
        "architektur": architektur,
        "distribution_id": distribution_id,
        "session": session.value,
        "status": status.value,
        "version_id": version_id,
    }
    kanonisch = json.dumps(
        fingerprint_basis,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    fingerprint = sha256(kanonisch).hexdigest()
    return LinuxSystemProfil(
        distribution_id=distribution_id,
        version_id=version_id,
        architektur=architektur,
        session=session,
        status=status,
        begruendung=begruendung,
        fingerprint_sha256=fingerprint,
    )
