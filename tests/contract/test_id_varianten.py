from __future__ import annotations

import pytest

from provoware.vertraege import ChangeId, ObjektId, OperationId, ProjektId, RevisionId


@pytest.mark.contract
def test_alle_id_typen_roundtrip() -> None:
    projekt = ProjektId.neu()
    objekt = ObjektId.neu()
    revision = RevisionId.neu()
    change = ChangeId.neu()
    operation = OperationId.neu()

    assert ProjektId.parse(str(projekt)) == projekt
    assert ObjektId.parse(str(objekt)) == objekt
    assert RevisionId.parse(str(revision)) == revision
    assert ChangeId.parse(str(change)) == change
    assert OperationId.parse(str(operation)) == operation


@pytest.mark.contract
def test_alle_id_praefixe_sind_stabil() -> None:
    assert str(ProjektId.neu()).startswith("prj_")
    assert str(ObjektId.neu()).startswith("obj_")
    assert str(RevisionId.neu()).startswith("rev_")
    assert str(ChangeId.neu()).startswith("chg_")
    assert str(OperationId.neu()).startswith("op_")
