"""Minimaler Linux-Datei-Lease-Kern für PLAN_DELTA-I016.

Der Lease schützt kooperierende PROVOWARE-Schreiber über eine stabile, benachbarte
Lockdatei. Er mutiert keine Nutzdatei und integriert noch keinen Replace-Pfad.
Nicht kooperierende Prozesse und Netzwerkdateisysteme liegen bewusst außerhalb
dieses ersten qualifizierbaren Scopes.
"""

from __future__ import annotations

import contextlib
import fcntl
import os
import uuid
from dataclasses import dataclass
from enum import StrEnum
from pathlib import PurePosixPath


class LeaseStatus(StrEnum):
    ERWORBEN = "ERWORBEN"
    BELEGT = "BELEGT"
    FEHLER = "FEHLER"
    FREIGEGEBEN = "FREIGEGEBEN"


@dataclass(frozen=True, slots=True)
class LeaseIdentitaet:
    pid: int
    token: str
    lock_pfad: str


@dataclass(slots=True)
class DateiLease:
    ziel: str
    status: LeaseStatus
    identitaet: LeaseIdentitaet | None
    begruendung: str
    _fd: int | None = None

    @property
    def aktiv(self) -> bool:
        return self.status is LeaseStatus.ERWORBEN and self._fd is not None

    def freigeben(self) -> LeaseStatus:
        """Gib einen gehaltenen Lease deterministisch frei; Wiederholung ist idempotent."""
        fd = self._fd
        if fd is None:
            self.status = LeaseStatus.FREIGEGEBEN
            return self.status
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)
            self._fd = None
            self.status = LeaseStatus.FREIGEGEBEN
        return self.status

    def __enter__(self) -> DateiLease:
        if not self.aktiv:
            raise RuntimeError("Nur ein erfolgreich erworbener Lease darf betreten werden.")
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        self.freigeben()


def _lock_pfad(ziel: str) -> str | None:
    roh = ziel.strip()
    if not roh or "\x00" in roh:
        return None
    posix = PurePosixPath(roh)
    normalisiert = str(posix)
    if not posix.is_absolute() or ".." in posix.parts or normalisiert != roh:
        return None
    return str(posix.parent / f".{posix.name}.provoware.lock")


def erwerbe_datei_lease(ziel: str) -> DateiLease:
    """Erwirb nichtblockierend einen exklusiven advisory Lease für genau ein Ziel."""
    lock_pfad = _lock_pfad(ziel)
    if lock_pfad is None:
        return DateiLease(ziel, LeaseStatus.FEHLER, None, "Zielpfad ist nicht kanonisch gültig.")

    fd: int | None = None
    try:
        fd = os.open(lock_pfad, os.O_RDWR | os.O_CREAT | getattr(os, "O_CLOEXEC", 0), 0o600)
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            os.close(fd)
            return DateiLease(
                ziel,
                LeaseStatus.BELEGT,
                None,
                "Ein anderer kooperierender Schreiber hält bereits den Lease.",
            )
        identitaet = LeaseIdentitaet(pid=os.getpid(), token=uuid.uuid4().hex, lock_pfad=lock_pfad)
        return DateiLease(ziel, LeaseStatus.ERWORBEN, identitaet, "Exklusiver Lease erworben.", fd)
    except OSError as exc:
        if fd is not None:
            with contextlib.suppress(OSError):
                os.close(fd)
        return DateiLease(
            ziel,
            LeaseStatus.FEHLER,
            None,
            f"Lease-Erwerb fehlgeschlagen: {type(exc).__name__}.",
        )
