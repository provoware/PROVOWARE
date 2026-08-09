from __future__ import annotations

import pytest

from provoware.vertraege import (
    ChangeId,
    FehlerInfo,
    Fehlerklasse,
    ObjektId,
    OperationErgebnis,
    OperationId,
    ProjektId,
    RevisionId,
    Status,
)


@pytest.mark.contract
def test_i007_id_praefixe_bleiben_oeffentliche_api() -> None:
    assert str(ProjektId.parse("prj_0123456789abcdef0123456789abcdef")) == (
        "prj_0123456789abcdef0123456789abcdef"
    )
    assert str(ObjektId.parse("obj_0123456789abcdef0123456789abcdef")).startswith("obj_")
    assert str(RevisionId.parse("rev_0123456789abcdef0123456789abcdef")).startswith("rev_")
    assert str(ChangeId.parse("chg_0123456789abcdef0123456789abcdef")).startswith("chg_")
    assert str(OperationId.parse("op_0123456789abcdef0123456789abcdef")).startswith("op_")


@pytest.mark.contract
def test_i007_statuswerte_bleiben_stabil() -> None:
    assert tuple(status.value for status in Status) == (
        "BEREIT",
        "IN_ARBEIT",
        "VALIDIERT",
        "BLOCKIERT",
    )


@pytest.mark.contract
def test_i007_fehlerklassen_bleiben_stabil() -> None:
    assert tuple(klasse.value for klasse in Fehlerklasse) == (
        "VALIDIERUNG",
        "NICHT_GEFUNDEN",
        "KONFLIKT",
        "BERECHTIGUNG",
        "IO",
        "INTEGRITAET",
        "INTERN",
    )


@pytest.mark.contract
def test_i007_operationsergebnis_invarianten_bleiben_stabil() -> None:
    fehler = FehlerInfo(Fehlerklasse.VALIDIERUNG, "TEST_FEHLER", "Ungültige Testeingabe.")

    assert OperationErgebnis[str].erfolg("ok").wert == "ok"
    assert OperationErgebnis[str].fehlgeschlagen(fehler).fehler is fehler
    with pytest.raises(ValueError):
        OperationErgebnis[str](erfolgreich=True, wert="ok", fehler=fehler)
    with pytest.raises(ValueError):
        OperationErgebnis[str](erfolgreich=False, wert=None, fehler=None)
