from __future__ import annotations

import json
from uuid import UUID

import pytest

from provoware.vertraege import ChangeId, ObjektId, OperationId, ProjektId, RevisionId

ID_KLASSEN = (
    (ProjektId, "prj"),
    (ObjektId, "obj"),
    (RevisionId, "rev"),
    (ChangeId, "chg"),
    (OperationId, "op"),
)


@pytest.mark.contract
@pytest.mark.parametrize(("klasse", "praefix"), ID_KLASSEN)
def test_i017_neu_erzeugt_kanonische_uuid4_id(klasse: type, praefix: str) -> None:
    identitaet = klasse.neu()
    text = str(identitaet)
    gefundenes_praefix, uuid_hex = text.split("_", 1)

    assert gefundenes_praefix == praefix
    assert len(uuid_hex) == 32
    assert uuid_hex == uuid_hex.lower()
    assert "-" not in text
    assert UUID(hex=uuid_hex).version == 4
    assert klasse.parse(text) == identitaet


@pytest.mark.contract
@pytest.mark.parametrize(("klasse", "praefix"), ID_KLASSEN)
def test_i017_id_bleibt_ueber_text_json_roundtrip_stabil(klasse: type, praefix: str) -> None:
    identitaet = klasse.neu()
    serialisiert = json.dumps({"id": str(identitaet)}, sort_keys=True)
    wiederhergestellt = json.loads(serialisiert)["id"]

    assert wiederhergestellt.startswith(f"{praefix}_")
    assert klasse.parse(wiederhergestellt) == identitaet


@pytest.mark.contract
@pytest.mark.parametrize(("klasse", "praefix"), ID_KLASSEN)
def test_i017_validator_weist_nichtkanonische_formen_ab(klasse: type, praefix: str) -> None:
    gueltig = f"{praefix}_0123456789abcdef0123456789abcdef"
    ungueltig = (
        f" {gueltig}",
        f"{gueltig} ",
        gueltig.upper(),
        f"{praefix}_01234567-89ab-cdef-0123-456789abcdef",
        f"{praefix}_0123456789abcdef0123456789abcde",
        f"{praefix}_0123456789abcdef0123456789abcdef0",
    )

    for text in ungueltig:
        with pytest.raises(ValueError):
            klasse.parse(text)


@pytest.mark.contract
def test_i017_id_domaenen_bleiben_strikt_getrennt() -> None:
    erzeugte = [klasse.neu() for klasse, _ in ID_KLASSEN]

    for index, (klasse, _) in enumerate(ID_KLASSEN):
        fremde_id = erzeugte[(index + 1) % len(erzeugte)]
        with pytest.raises(ValueError):
            klasse.parse(str(fremde_id))
