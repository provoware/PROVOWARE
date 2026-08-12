from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import cast

import pytest
from WERKZEUGE.p02_architekturgate import (
    P02GateFehler,
    baue_snapshot_dokument,
    pruefe_api_snapshot,
    pruefe_architekturdatei,
    pruefe_architekturmatrix,
    pruefe_gesamtgate,
    pruefe_quellinventar,
    pruefe_traceability,
    pruefe_versionsraeume,
)

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "tests/fixtures/i010"


def _fixture(name: str) -> Path:
    return FIXTURES / name


def _baselinefolge() -> tuple[str | None, str | None]:
    raw: object = json.loads((ROOT / "CURRENT_BASELINE.json").read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return None, None
    baseline = cast(dict[str, object], raw)
    letzte = baseline.get("letzte_iteration")
    naechste = baseline.get("naechste_iteration")
    return (
        letzte if isinstance(letzte, str) else None,
        naechste if isinstance(naechste, str) else None,
    )


def _iterationsnummer(wert: str | None) -> int | None:
    if wert is None or not wert.startswith("I") or not wert[1:].isdigit():
        return None
    return int(wert[1:])


def _ist_i010_promoviert_oder_spaeter() -> bool:
    letzte, _ = _baselinefolge()
    nummer = _iterationsnummer(letzte)
    return nummer is not None and nummer >= 10


def _ist_historischer_i010_lifecycle() -> bool:
    return _baselinefolge() in {("I009", "I010"), ("I010", "I011")}


def _minimaler_quellbaum(tmp_path: Path) -> Path:
    ziel = tmp_path / "projekt"
    inventar_raw: object = json.loads((ROOT / "P02_QUELLINVENTAR.json").read_text(encoding="utf-8"))
    assert isinstance(inventar_raw, dict)
    inventar = cast(dict[str, object], inventar_raw)
    quellen = inventar.get("p02_quellen")
    assert isinstance(quellen, list)
    for rel_obj in quellen:
        assert isinstance(rel_obj, str)
        quelle = ROOT / rel_obj
        zielpfad = ziel / rel_obj
        zielpfad.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(quelle, zielpfad)
    shutil.copy2(ROOT / "P02_QUELLINVENTAR.json", ziel / "P02_QUELLINVENTAR.json")
    return ziel


@pytest.mark.architecture
def test_p02_api_snapshot_ist_kanonisch_und_fingerprint_stabil() -> None:
    dokument = baue_snapshot_dokument(ROOT)
    assert dokument["fingerprint_sha256"] == (
        "2e74f555a8b7cc4aaa45f7cb109eaf22a1c255953d9ff98bb159ad2df895ed16"
    )
    assert pruefe_api_snapshot(ROOT) == dokument["fingerprint_sha256"]


@pytest.mark.architecture
def test_p02_quellinventar_ist_exakt_und_hashgebunden(tmp_path: Path) -> None:
    pruefe_quellinventar(_minimaler_quellbaum(tmp_path), phase_abschluss=True)


@pytest.mark.architecture
def test_p02_architekturmatrix_ist_fuer_alle_vertragsquellen_gruen() -> None:
    pruefe_architekturmatrix(ROOT)


@pytest.mark.architecture
@pytest.mark.parametrize(
    ("fixture", "code"),
    [
        ("verbotener_sqlite_import.py.fixture", "P02_VERBOTENE_ABHAENGIGKEIT"),
        ("verbotener_qt_import.py.fixture", "P02_VERBOTENE_ABHAENGIGKEIT"),
        ("verbotener_handler_import.py.fixture", "P02_VERBOTENE_ABHAENGIGKEIT"),
        ("verbotener_dateizugriff.py.fixture", "P02_VERBOTENER_DATEIZUGRIFF"),
    ],
)
def test_negativfixtures_schalten_architekturgate_nachweisbar_rot(fixture: str, code: str) -> None:
    with pytest.raises(P02GateFehler) as exc_info:
        pruefe_architekturdatei(_fixture(fixture), rel=fixture)
    assert exc_info.value.code == code


@pytest.mark.architecture
def test_unregistrierte_p02_produktdatei_wird_abgewiesen(tmp_path: Path) -> None:
    root = _minimaler_quellbaum(tmp_path)
    ziel = root / "src/provoware/vertraege/unerlaubt.py"
    ziel.write_text(_fixture("unregistrierte_vertragsdatei.py.fixture").read_text(encoding="utf-8"))
    with pytest.raises(P02GateFehler) as exc_info:
        pruefe_quellinventar(root)
    assert exc_info.value.code == "P02_UNREGISTRIERTE_PRODUKTDATEI"


@pytest.mark.architecture
def test_i010_weist_vorgezogene_p03_quelle_ab(tmp_path: Path) -> None:
    root = _minimaler_quellbaum(tmp_path)
    ziel = root / "src/provoware/plattform.py"
    ziel.write_text(_fixture("vorgezogene_p03_datei.py.fixture").read_text(encoding="utf-8"))
    with pytest.raises(P02GateFehler) as exc_info:
        pruefe_quellinventar(root, phase_abschluss=True)
    assert exc_info.value.code == "P02_P03_VORGEZOGEN_ODER_QUELLE_UNREGISTRIERT"


@pytest.mark.architecture
def test_versionsraeume_bleiben_getrennt() -> None:
    pruefe_versionsraeume(ROOT)


@pytest.mark.architecture
def test_traceability_bleibt_nach_i010_promotion_gueltig() -> None:
    pruefe_traceability(ROOT, nach_promotion=_ist_i010_promoviert_oder_spaeter())


@pytest.mark.architecture
def test_i010_gesamtgate_ist_im_historischen_lebenszykluszustand_gruen() -> None:
    if not _ist_historischer_i010_lifecycle():
        pytest.skip("I010-Gesamtgate ist an die historische Baseline I009→I010/I010→I011 gebunden.")
    nach_promotion = _ist_i010_promoviert_oder_spaeter()
    ergebnis = pruefe_gesamtgate(ROOT, phase_abschluss=True, nach_promotion=nach_promotion)
    assert ergebnis["api_snapshot"] == "GRUEN"
    assert ergebnis["architekturmatrix"] == "GRUEN"
    assert ergebnis["phase_abschluss"] == "GRUEN"
    assert ergebnis["modus"] == ("NACH_PROMOTION" if nach_promotion else "VOR_PROMOTION")
