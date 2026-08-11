from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest

from provoware.vertraege.datentypen import ChangeId, ObjektId, OperationId, ProjektId, RevisionId
from provoware.vertraege.id_persistenz import (
    IdKonfliktFehler,
    IdPersistenzFehler,
    lade_id_datensatz,
    speichere_id_datensatz,
)

ID_TYPEN = (ProjektId, ObjektId, RevisionId, ChangeId, OperationId)


@pytest.mark.contract
@pytest.mark.parametrize("id_typ", ID_TYPEN)
def test_persistenz_roundtrip_erhaelt_exakt_die_id(tmp_path: Path, id_typ: type[ProjektId]) -> None:
    pfad = tmp_path / "id.json"
    id_wert = id_typ.neu()
    gespeichert = speichere_id_datensatz(pfad, id_wert, "objekt:alpha")
    geladen = lade_id_datensatz(pfad)
    assert gespeichert == geladen
    assert geladen.id_wert == id_wert
    assert type(geladen.id_wert) is id_typ


@pytest.mark.contract
def test_restart_in_neuem_prozess_erhaelt_exakt_die_id(tmp_path: Path) -> None:
    pfad = tmp_path / "id.json"
    erwartet = ObjektId.neu()
    speichere_id_datensatz(pfad, erwartet, "objekt:restart")

    code = (
        "from provoware.vertraege.id_persistenz import lade_id_datensatz; "
        "import sys; print(lade_id_datensatz(sys.argv[1]).id_wert)"
    )
    env = os.environ.copy()
    src = str(Path.cwd() / "src")
    env["PYTHONPATH"] = src + os.pathsep + env.get("PYTHONPATH", "")
    result = subprocess.run(
        [sys.executable, "-c", code, str(pfad)],
        check=True,
        capture_output=True,
        text=True,
        env=env,
    )
    assert result.stdout.strip() == str(erwartet)


@pytest.mark.contract
def test_identischer_datensatz_ist_idempotent_und_wird_nicht_neu_erzeugt(tmp_path: Path) -> None:
    pfad = tmp_path / "id.json"
    id_wert = ProjektId.neu()
    speichere_id_datensatz(pfad, id_wert, "projekt:eins")
    vorher = pfad.read_bytes()
    erneut = speichere_id_datensatz(pfad, id_wert, "projekt:eins")
    assert erneut.id_wert == id_wert
    assert pfad.read_bytes() == vorher


@pytest.mark.contract
def test_gleicher_pfad_anderes_objekt_blockiert_fail_closed(tmp_path: Path) -> None:
    pfad = tmp_path / "id.json"
    id_wert = RevisionId.neu()
    speichere_id_datensatz(pfad, id_wert, "objekt:a")
    vorher = pfad.read_bytes()
    with pytest.raises(IdKonfliktFehler):
        speichere_id_datensatz(pfad, id_wert, "objekt:b")
    assert pfad.read_bytes() == vorher


@pytest.mark.contract
def test_gleicher_objektschluessel_andere_id_blockiert_fail_closed(tmp_path: Path) -> None:
    pfad = tmp_path / "id.json"
    speichere_id_datensatz(pfad, ObjektId.neu(), "objekt:a")
    vorher = pfad.read_bytes()
    with pytest.raises(IdKonfliktFehler):
        speichere_id_datensatz(pfad, ObjektId.neu(), "objekt:a")
    assert pfad.read_bytes() == vorher


@pytest.mark.contract
def test_beschaedigte_persistenz_wird_nicht_still_repariert_oder_neu_erzeugt(tmp_path: Path) -> None:
    pfad = tmp_path / "id.json"
    pfad.write_text('{"schema":1,"id_typ":"ObjektId"', encoding="utf-8")
    vorher = pfad.read_bytes()
    with pytest.raises(IdPersistenzFehler):
        speichere_id_datensatz(pfad, ObjektId.neu(), "objekt:a")
    assert pfad.read_bytes() == vorher
