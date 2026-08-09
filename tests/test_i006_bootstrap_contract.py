from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOTSTRAP = ROOT / "WERKZEUGE" / "clean-bootstrap.sh"
PRUEFER = ROOT / "WERKZEUGE" / "bootstrap_pruefen.py"
STATUS = ROOT / "WERKZEUGE" / "WHEELHOUSE_STATUS.json"


def test_i006_bootstrap_erzwingt_offline_pip() -> None:
    script = BOOTSTRAP.read_text(encoding="utf-8")
    assert "PIP_NO_INDEX=1" in script
    assert 'PIP_FIND_LINKS="$WHEELHOUSE"' in script
    assert script.count("--no-index") >= 3
    assert "--no-build-isolation" in script
    assert "127.0.0.1:9" in script
    assert "cmp --silent" in script


def test_i006_bootstrap_hat_keinen_downloadbefehl() -> None:
    script = BOOTSTRAP.read_text(encoding="utf-8")
    forbidden = ("curl ", "wget ", "git clone", "pip download")
    for token in forbidden:
        assert token not in script


def test_i006_status_pinnt_i005_evidence() -> None:
    status = json.loads(STATUS.read_text(encoding="utf-8"))
    assert status["iteration"] == "I005"
    assert status["status"] == "VALIDIERT"
    assert status["paketanzahl"] == 50
    assert status["github"]["artifact_id"] == 9042907351
    assert (
        status["github"]["artifact_sha256"]
        == "6856c44cfd079b96f0daaa8e0fcebbba2dbbf5d0f1a3f16e02730f5851751040"
    )


def test_i006_pruefer_blockiert_hashmanipulation(tmp_path: Path) -> None:
    fake = tmp_path / "i005"
    fake.mkdir()
    # Selbst eine formal vorhandene, aber falsche Evidence muss vor der Wheelprüfung stoppen.
    for name in (
        "WHEELHOUSE_MANIFEST.json",
        "WHEELHOUSE_SHA256.txt",
        "ABHAENGIGKEITSINVENTAR.json",
        "OFFLINE_FREEZE.txt",
        "I005_QUALIFIKATION.json",
    ):
        (fake / name).write_text("manipuliert\n", encoding="utf-8")

    result = subprocess.run(
        [
            sys.executable,
            str(PRUEFER),
            "--i005-root",
            str(fake),
            "--status",
            str(STATUS),
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "Hashabweichung" in result.stderr or "BootstrapPrueffehler" in result.stderr


def test_i006_vergleicht_zwei_bootstraps_im_workflow() -> None:
    workflow = (ROOT / ".github/workflows/i006-clean-bootstrap.yml").read_text(encoding="utf-8")
    assert "bootstrap-a" in workflow
    assert "bootstrap-b" in workflow
    assert "PAKET_FREEZE.txt" in workflow
    assert "cmp --silent" in workflow
