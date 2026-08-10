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


def _minimaler_quellbaum(tmp_path: Path) -> Path:
    ziel = tmp_path / "projekt"
    shutil.copytree(ROOT / "src", ziel / "src")
    shutil.copy2(ROOT / "P02_QUELLINVENTAR.json", ziel / "P02_QUELLINVENTAR.json")
    return ziel


def _ist_i010_promoviert() -> bool:
    raw: object = json.loads((ROOT / "CURRENT_BASELINE.json").read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return False
    baseline = cast(dict[str, object], raw)
    return baseline.get("letzte_iteration") == "I010"


def _ist_p02_phase_abschlussmodus() -> bool:
    raw: object = json.loads((ROOT / "PROJEKTSTATUS.json").read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return True
    status = cast(dict[str, object], raw)
    phase = status.get("phase")
    return isinstance(phase, str) and phase.startswith("P02 ")


@pytest.mark.architecture
def test_p02_api_snapshot_ist_kanonisch_und_fingerprint_stabil() -> None:
    dokument = baue_snapshot_dokument(ROOT)
    assert dokument["fingerprint_sha256"] == (
        "2e74f555a8b7cc4aaa45f7cb109eaf22a1c255953d9ff98bb159ad2df895ed16"
    )
    assert pruefe_api_snapshot(ROOT) == dokument["fingerprint_sha256"]


@pytest.mark.architecture
def test_p02_quellinventar_ist_exakt_und_hashgebunden() -> None:
    pruefe_quellinventar(ROOT, phase_abschluss=_ist_p02_phase_abschlussmodus())


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
def test_traceability_passt_zum_aktuellen_i010_lebenszykluszustand() -> None:
    pruefe_traceability(ROOT, nach_promotion=_ist_i010_promoviert())


@pytest.mark.architecture
def test_i010_gesamtgate_ist_im_aktuellen_lebenszykluszustand_gruen() -> None:
    nach_promotion = _ist_i010_promoviert()
    ergebnis = pruefe_gesamtgate(
        ROOT,
        phase_abschluss=_ist_p02_phase_abschlussmodus(),
        nach_promotion=nach_promotion,
    )
    assert ergebnis["api_snapshot"] == "GRUEN"
    assert ergebnis["architekturmatrix"] == "GRUEN"
    assert ergebnis["phase_abschluss"] == "GRUEN"
    assert ergebnis["modus"] == ("NACH_PROMOTION" if nach_promotion else "VOR_PROMOTION")
