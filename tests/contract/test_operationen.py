from __future__ import annotations

import json
from pathlib import Path
from typing import cast

import pytest

from provoware.vertraege import (
    OPERATION_SCHEMA_VERSION,
    Fehlerklasse,
    OperationArt,
    OperationPayload,
    OperationRequest,
    OperationResult,
    OperationVertragsfehler,
)

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "i009"


def _fixture(name: str) -> dict[str, object]:
    roh = json.loads((FIXTURES / name).read_text(encoding="utf-8"))
    if not isinstance(roh, dict):
        raise AssertionError(f"Fixture {name} muss ein JSON-Objekt sein.")
    return cast(dict[str, object], roh)


@pytest.mark.contract
def test_operation_schema_version_ist_stabil() -> None:
    assert str(OPERATION_SCHEMA_VERSION) == "1.0.0"


@pytest.mark.contract
def test_operation_art_ist_typisiert_aber_zieht_keine_fachenum_vor() -> None:
    art = OperationArt.parse("PROJEKT_PRUEFEN")

    assert str(art) == "PROJEKT_PRUEFEN"
    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationArt.parse("projekt-pruefen")
    assert exc_info.value.code == "OPERATION_ART_UNGUELTIG"


@pytest.mark.contract
def test_payload_wird_tief_kanonisiert_und_ist_reihenfolgeunabhaengig() -> None:
    links = OperationPayload.aus_mapping({"z": [True, 2, None], "a": {"beta": "B", "alpha": "A"}})
    rechts = OperationPayload.aus_mapping({"a": {"alpha": "A", "beta": "B"}, "z": [True, 2, None]})

    assert links == rechts
    assert links.kanonisch_json == '{"a":{"alpha":"A","beta":"B"},"z":[true,2,null]}'
    assert links.fingerprint_sha256() == rechts.fingerprint_sha256()


@pytest.mark.contract
def test_payload_direktkonstruktion_erfordert_kanonisches_json() -> None:
    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationPayload('{"z":1,"a":2}')

    assert exc_info.value.code == "OPERATION_PAYLOAD_NICHT_KANONISCH"


@pytest.mark.contract
def test_payload_float_wird_fuer_deterministische_semantik_abgewiesen() -> None:
    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationRequest.aus_mapping(_fixture("request_ungueltig_float.json"))

    assert exc_info.value.code == "OPERATION_PAYLOAD_FLOAT_VERBOTEN"
    assert exc_info.value.feld == "payload.schwelle"


@pytest.mark.contract
def test_payload_groessenlimit_wird_erzwungen() -> None:
    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationPayload.aus_mapping({"text": "x" * 66_000})

    assert exc_info.value.code == "OPERATION_PAYLOAD_ZU_GROSS"


@pytest.mark.contract
def test_payload_schluessel_werden_validiert() -> None:
    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationPayload.aus_mapping({" ungueltig ": True})

    assert exc_info.value.code == "OPERATION_PAYLOAD_SCHLUESSEL_UNGUELTIG"


@pytest.mark.contract
def test_request_golden_fixture_roundtrip_deterministisch() -> None:
    request = OperationRequest.aus_mapping(_fixture("request_gueltig.json"))

    assert str(request.operation_id) == "op_0123456789abcdef0123456789abcdef"
    assert str(request.operation_art) == "PROJEKT_PRUEFEN"
    assert request.payload.als_dict()["aktiv"] is True
    assert OperationRequest.aus_mapping(request.als_dict()) == request
    assert request.als_json() == request.als_json()
    assert len(request.fingerprint_sha256()) == 64


@pytest.mark.contract
def test_request_neu_erzeugt_operation_id_und_leeren_payload() -> None:
    request = OperationRequest.neu(OperationArt("PROJEKT_PRUEFEN"))

    assert str(request.operation_id).startswith("op_")
    assert request.payload.als_dict() == {}


@pytest.mark.contract
def test_request_unbekanntes_feld_wird_abgewiesen() -> None:
    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationRequest.aus_mapping(_fixture("request_ungueltig_unbekanntes_feld.json"))

    assert exc_info.value.code == "OPERATION_UNBEKANNTES_FELD"
    assert exc_info.value.feld == "handler"


@pytest.mark.contract
def test_request_inkompatibles_schema_wird_abgewiesen() -> None:
    daten = _fixture("request_gueltig.json")
    daten["schema"] = "2.0.0"

    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationRequest.aus_mapping(daten)

    assert exc_info.value.code == "OPERATION_SCHEMA_INKOMPATIBEL"


@pytest.mark.contract
def test_request_falsche_operation_id_wird_abgewiesen() -> None:
    daten = _fixture("request_gueltig.json")
    daten["operation_id"] = "prj_0123456789abcdef0123456789abcdef"

    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationRequest.aus_mapping(daten)

    assert exc_info.value.code == "OPERATION_ID_UNGUELTIG"


@pytest.mark.contract
def test_erfolgsresultat_golden_fixture_roundtrip() -> None:
    result = OperationResult.aus_mapping(_fixture("result_erfolg_gueltig.json"))

    assert result.ergebnis.erfolgreich is True
    assert result.ergebnis.fehler is None
    assert result.ergebnis.wert is not None
    assert result.ergebnis.wert.als_dict() == {"geprueft": True, "hinweise": []}
    assert OperationResult.aus_mapping(result.als_dict()) == result


@pytest.mark.contract
def test_fehlerresultat_golden_fixture_roundtrip() -> None:
    result = OperationResult.aus_mapping(_fixture("result_fehler_gueltig.json"))

    assert result.ergebnis.erfolgreich is False
    assert result.ergebnis.wert is None
    assert result.ergebnis.fehler is not None
    assert result.ergebnis.fehler.klasse is Fehlerklasse.VALIDIERUNG
    assert result.ergebnis.fehler.code == "PROJEKT_UNGUELTIG"
    assert OperationResult.aus_mapping(result.als_dict()) == result


@pytest.mark.contract
def test_result_widerspruch_wird_abgewiesen() -> None:
    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationResult.aus_mapping(_fixture("result_ungueltig_widerspruch.json"))

    assert exc_info.value.code == "OPERATION_RESULT_WIDERSPRUCH"
    assert exc_info.value.feld == "fehler"


@pytest.mark.contract
def test_result_unbekanntes_feld_wird_abgewiesen() -> None:
    with pytest.raises(OperationVertragsfehler) as exc_info:
        OperationResult.aus_mapping(_fixture("result_ungueltig_unbekanntes_feld.json"))

    assert exc_info.value.code == "OPERATION_UNBEKANNTES_FELD"
    assert exc_info.value.feld == "dauer_ms"


@pytest.mark.contract
def test_request_result_korrelation_verwendet_ausschliesslich_operation_id() -> None:
    request = OperationRequest.aus_mapping(_fixture("request_gueltig.json"))
    passend = OperationResult.aus_mapping(_fixture("result_erfolg_gueltig.json"))
    fremde_id = OperationRequest.neu(OperationArt("ANDERE_OPERATION")).operation_id
    fremd = OperationResult.erfolg(fremde_id)

    assert passend.korreliert_mit(request) is True
    assert fremd.korreliert_mit(request) is False


@pytest.mark.contract
def test_request_fingerprint_aendert_sich_bei_payload_aenderung() -> None:
    basis = _fixture("request_gueltig.json")
    request_a = OperationRequest.aus_mapping(basis)
    veraendert = dict(basis)
    veraendert["payload"] = {"aktiv": False}
    request_b = OperationRequest.aus_mapping(veraendert)

    assert request_a.fingerprint_sha256() != request_b.fingerprint_sha256()


@pytest.mark.contract
def test_operation_vertragsfehler_ist_maschinenlesbar() -> None:
    fehler = OperationVertragsfehler("OPERATION_TEST", "Testfehler.", "payload")

    assert fehler.als_dict() == {
        "code": "OPERATION_TEST",
        "feld": "payload",
        "nachricht": "Testfehler.",
    }
