from __future__ import annotations

import importlib
from dataclasses import FrozenInstanceError
from pathlib import Path

import pytest

from provoware.vertraege import (
    FehlerInfo,
    Fehlerklasse,
    ObjektId,
    OperationErgebnis,
    ProjektId,
    Status,
)

ROOT = Path(__file__).resolve().parents[2]


@pytest.mark.contract
def test_ids_neu_parse_roundtrip_und_hashbar() -> None:
    for klasse in (ProjektId, ObjektId):
        identitaet = klasse.neu()
        assert klasse.parse(str(identitaet)) == identitaet
        assert hash(identitaet) == hash(klasse.parse(str(identitaet)))


@pytest.mark.contract
def test_id_praefixe_trennen_domaenen() -> None:
    projekt = ProjektId.neu()
    with pytest.raises(ValueError):
        ObjektId.parse(str(projekt))


@pytest.mark.contract
@pytest.mark.parametrize(
    "text",
    [
        "",
        "prj_123",
        "PRJ_0123456789abcdef0123456789abcdef",
        "prj_0123456789ABCDEF0123456789ABCDEF",
        "obj_0123456789abcdef0123456789abcdef",
    ],
)
def test_projekt_id_weist_ungueltige_formate_ab(text: str) -> None:
    with pytest.raises(ValueError):
        ProjektId.parse(text)


@pytest.mark.contract
def test_ids_sind_unveraenderlich() -> None:
    projekt = ProjektId.neu()
    with pytest.raises(FrozenInstanceError):
        projekt.wert = "prj_0123456789abcdef0123456789abcdef"  # type: ignore[misc]


@pytest.mark.contract
def test_statuswerte_sind_explizit_und_stabil() -> None:
    assert [status.value for status in Status] == [
        "BEREIT",
        "IN_ARBEIT",
        "VALIDIERT",
        "BLOCKIERT",
    ]


@pytest.mark.contract
def test_fehlerklasse_ist_maschinenlesbar() -> None:
    assert Fehlerklasse.INTEGRITAET.value == "INTEGRITAET"
    assert Fehlerklasse("KONFLIKT") is Fehlerklasse.KONFLIKT


@pytest.mark.contract
def test_fehlerinfo_validiert_code_und_nachricht() -> None:
    fehler = FehlerInfo(
        klasse=Fehlerklasse.VALIDIERUNG,
        code="PROJEKT_ID_UNGUELTIG",
        nachricht="Projekt-ID ist ungültig.",
    )
    assert fehler.als_dict() == {
        "klasse": "VALIDIERUNG",
        "code": "PROJEKT_ID_UNGUELTIG",
        "nachricht": "Projekt-ID ist ungültig.",
    }
    with pytest.raises(ValueError):
        FehlerInfo(Fehlerklasse.INTERN, "x", "Fehler")
    with pytest.raises(ValueError):
        FehlerInfo(Fehlerklasse.INTERN, "INTERNER_FEHLER", "   ")


@pytest.mark.contract
def test_operationsergebnis_erfolg_und_fehler_sind_eindeutig() -> None:
    projekt = ProjektId.neu()
    erfolg: OperationErgebnis[ProjektId] = OperationErgebnis.erfolg(projekt)
    assert erfolg.erfolgreich is True
    assert erfolg.wert == projekt
    assert erfolg.fehler_dict() is None

    info = FehlerInfo(Fehlerklasse.KONFLIKT, "REVISION_KONFLIKT", "Revision kollidiert.")
    fehler: OperationErgebnis[ProjektId] = OperationErgebnis.fehlgeschlagen(info)
    assert fehler.erfolgreich is False
    assert fehler.wert is None
    assert fehler.fehler_dict() == info.als_dict()


@pytest.mark.contract
def test_operationsergebnis_verhindert_widerspruechliche_zustaende() -> None:
    info = FehlerInfo(Fehlerklasse.INTERN, "INTERNER_FEHLER", "Interner Fehler.")
    with pytest.raises(ValueError):
        OperationErgebnis[str](erfolgreich=True, wert="ok", fehler=info)
    with pytest.raises(ValueError):
        OperationErgebnis[str](erfolgreich=False, wert=None, fehler=None)


@pytest.mark.contract
def test_vertragsschicht_importiert_weder_qt_noch_sqlite() -> None:
    text = (ROOT / "src/provoware/vertraege/datentypen.py").read_text(encoding="utf-8")
    verbotene_fragmente = ("PySide", "PyQt", "sqlite3", "sqlalchemy", "provoware.ui")
    assert not any(fragment in text for fragment in verbotene_fragmente)
    assert importlib.import_module("provoware.vertraege.datentypen") is not None
