"""Kleine fail-closed Persistenzgrenze fuer dauerhaft stabile PROVOWARE-IDs.

Absichtlich ohne Registry: Ein Datensatz bindet genau eine vorhandene Kern-ID an einen
stabilen Objektschluessel. Vorhandene gueltige IDs werden beim Laden niemals neu erzeugt.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Final

from .datentypen import ChangeId, ObjektId, OperationId, ProjektId, RevisionId

IdWert = ProjektId | ObjektId | RevisionId | ChangeId | OperationId

_ID_TYPEN: Final = {
    "ProjektId": ProjektId,
    "ObjektId": ObjektId,
    "RevisionId": RevisionId,
    "ChangeId": ChangeId,
    "OperationId": OperationId,
}
_SCHEMA: Final = 1
_SCHLUESSEL: Final = {"schema", "id_typ", "id_wert", "objekt_schluessel"}


class IdPersistenzFehler(RuntimeError):
    """Persistierter ID-Datensatz ist nicht sicher lesbar oder nicht kanonisch."""


class IdKonfliktFehler(RuntimeError):
    """Ein bestehender persistierter Datensatz widerspricht der gewuenschten Bindung."""


@dataclass(frozen=True, slots=True)
class IdDatensatz:
    id_wert: IdWert
    objekt_schluessel: str


def _objekt_schluessel_pruefen(wert: str) -> str:
    if not wert or wert != wert.strip():
        raise ValueError("objekt_schluessel muss nichtleer und bereits kanonisch getrimmt sein.")
    return wert


def _kodieren(datensatz: IdDatensatz) -> bytes:
    payload = {
        "schema": _SCHEMA,
        "id_typ": type(datensatz.id_wert).__name__,
        "id_wert": str(datensatz.id_wert),
        "objekt_schluessel": _objekt_schluessel_pruefen(datensatz.objekt_schluessel),
    }
    return (json.dumps(payload, ensure_ascii=True, sort_keys=True, separators=(",", ":")) + "\n").encode()


def lade_id_datensatz(pfad: str | Path) -> IdDatensatz:
    """Laedt genau die gespeicherte ID; ungueltige Inhalte brechen fail-closed ab."""

    datei = Path(pfad)
    try:
        roh = datei.read_text(encoding="utf-8")
        payload = json.loads(roh)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise IdPersistenzFehler(f"ID-Datensatz nicht sicher lesbar: {datei}") from exc

    if not isinstance(payload, dict) or set(payload) != _SCHLUESSEL or payload.get("schema") != _SCHEMA:
        raise IdPersistenzFehler("ID-Datensatz besitzt unbekanntes oder unvollstaendiges Schema.")

    typ_name = payload.get("id_typ")
    id_text = payload.get("id_wert")
    objekt = payload.get("objekt_schluessel")
    if not isinstance(typ_name, str) or not isinstance(id_text, str) or not isinstance(objekt, str):
        raise IdPersistenzFehler("ID-Datensatz enthaelt ungueltige Feldtypen.")

    id_typ = _ID_TYPEN.get(typ_name)
    if id_typ is None:
        raise IdPersistenzFehler(f"Unbekannter ID-Typ: {typ_name}")
    try:
        id_wert = id_typ.parse(id_text)
        objekt = _objekt_schluessel_pruefen(objekt)
    except ValueError as exc:
        raise IdPersistenzFehler("ID-Datensatz verletzt den kanonischen ID-Vertrag.") from exc
    return IdDatensatz(id_wert=id_wert, objekt_schluessel=objekt)


def speichere_id_datensatz(
    pfad: str | Path, id_wert: IdWert, objekt_schluessel: str
) -> IdDatensatz:
    """Speichert erstmalig exklusiv; vorhandene Bindungen werden nie still ueberschrieben."""

    datei = Path(pfad)
    datensatz = IdDatensatz(id_wert=id_wert, objekt_schluessel=_objekt_schluessel_pruefen(objekt_schluessel))
    daten = _kodieren(datensatz)
    datei.parent.mkdir(parents=True, exist_ok=True)

    try:
        fd = os.open(datei, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError:
        vorhanden = lade_id_datensatz(datei)
        if vorhanden == datensatz:
            return vorhanden
        raise IdKonfliktFehler("Bestehende ID-Bindung widerspricht dem angeforderten Datensatz.") from None
    except OSError as exc:
        raise IdPersistenzFehler(f"ID-Datensatz konnte nicht angelegt werden: {datei}") from exc

    try:
        offset = 0
        while offset < len(daten):
            geschrieben = os.write(fd, daten[offset:])
            if geschrieben <= 0:
                raise IdPersistenzFehler("Unvollstaendiger Schreibvorgang beim ID-Datensatz.")
            offset += geschrieben
        os.fsync(fd)
    except Exception:
        try:
            datei.unlink(missing_ok=True)
        finally:
            os.close(fd)
        raise
    else:
        os.close(fd)

    return lade_id_datensatz(datei)
