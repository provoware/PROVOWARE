from __future__ import annotations

import re
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQ = ROOT / "WERKZEUGE" / "wheelhouse-anforderungen.txt"
QUAL = ROOT / "WERKZEUGE" / "qualifiziere_i005.sh"


def anforderungen() -> list[str]:
    return [
        line.strip()
        for line in REQ.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]


def normalisiere_requirement(value: str) -> str:
    name, version = value.split("==", 1)
    return f"{re.sub(r'[-_.]+', '-', name).lower()}=={version}"


def test_i005_alle_anforderungen_sind_exakt_gepinnt() -> None:
    values = anforderungen()
    assert values
    assert all(value.count("==") == 1 for value in values)
    assert not any(any(operator in value for operator in (">=", "<=", "~=", "!=", ">", "<")) for value in values)


def test_i005_deckt_pyproject_toolchain_ab() -> None:
    pyproject = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))
    expected = {
        normalisiere_requirement(value)
        for group in ("entwicklung", "desktop")
        for value in pyproject["project"]["optional-dependencies"][group]
    }
    actual = {normalisiere_requirement(value) for value in anforderungen()}
    assert expected <= actual


def test_i005_offline_verifikation_ist_explizit() -> None:
    script = QUAL.read_text(encoding="utf-8")
    assert "Ubuntu 22.04" in script
    assert 'platform.python_version() != "3.13.15"' in script
    assert "--only-binary=:all:" in script
    assert "PIP_NO_INDEX=1" in script
    assert "--no-index" in script
    assert "pip check" in script


def test_i005_inventar_bleibt_standardbibliothek() -> None:
    source = (ROOT / "WERKZEUGE" / "wheelhouse_inventar.py").read_text(encoding="utf-8")
    for forbidden in ("import requests", "import packaging", "import yaml"):
        assert forbidden not in source
