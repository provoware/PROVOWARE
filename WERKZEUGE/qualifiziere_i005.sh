#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REQ="$ROOT/WERKZEUGE/wheelhouse-anforderungen.txt"
OUT="$ROOT/.artefakte/I005"
WHEELHOUSE="$OUT/wheelhouse"
VENV="$OUT/offline-pruefung"

export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export PYTHONHASHSEED=0
export PIP_DISABLE_PIP_VERSION_CHECK=1
export PIP_NO_INPUT=1

rm -rf "$OUT"
mkdir -p "$WHEELHOUSE"

python3 - <<'PY'
from pathlib import Path
import platform
import sys

if platform.machine() not in {"x86_64", "AMD64"}:
    raise SystemExit(f"I005 BLOCKIERT: Architektur {platform.machine()} statt amd64/x86_64")
if platform.python_version() != "3.13.15":
    raise SystemExit(f"I005 BLOCKIERT: Python {platform.python_version()} statt 3.13.15")

os_release = {}
for line in Path("/etc/os-release").read_text(encoding="utf-8").splitlines():
    if "=" in line:
        key, value = line.split("=", 1)
        os_release[key] = value.strip().strip('"')
if os_release.get("ID") != "ubuntu" or os_release.get("VERSION_ID") != "22.04":
    raise SystemExit(
        f"I005 BLOCKIERT: benötigt Ubuntu 22.04, erhalten {os_release.get('ID')} {os_release.get('VERSION_ID')}"
    )
print("PLATTFORM: GRÜN — Ubuntu 22.04 amd64 / CPython 3.13.15")
print(sys.executable)
PY

python3 -m pip --version
python3 -m pip download \
  --requirement "$REQ" \
  --dest "$WHEELHOUSE" \
  --only-binary=:all: \
  --prefer-binary

python3 "$ROOT/WERKZEUGE/wheelhouse_inventar.py" \
  --wheelhouse "$WHEELHOUSE" \
  --requirements "$REQ" \
  --out "$OUT"

# Offline-Verifikationsphase: pip verwendet ausschließlich lokale Wheels.
python3 -m venv "$VENV"
export PIP_NO_INDEX=1
export PIP_FIND_LINKS="$WHEELHOUSE"

"$VENV/bin/python" -m pip install --no-index --find-links "$WHEELHOUSE" "pip==25.2"
"$VENV/bin/python" -m pip install --no-index --find-links "$WHEELHOUSE" --requirement "$REQ"
"$VENV/bin/python" -m pip check
"$VENV/bin/python" -m pip freeze --all | LC_ALL=C sort > "$OUT/OFFLINE_FREEZE.txt"

"$VENV/bin/python" - <<'PY'
from PySide6.QtCore import qVersion
import pytest
import mypy.version
import PyInstaller

print("PySide6/Qt:", qVersion())
print("pytest:", pytest.__version__)
print("mypy:", mypy.version.__version__)
print("PyInstaller:", PyInstaller.__version__)
PY

"$VENV/bin/ruff" --version
"$VENV/bin/bandit" --version
"$VENV/bin/pip-audit" --version
"$VENV/bin/pyinstaller" --version

# Das temporäre venv gehört nicht zum unveränderlichen Artefakt.
rm -rf "$VENV"

python3 - <<'PY'
from __future__ import annotations

import hashlib
import json
import os
from datetime import UTC, datetime
from pathlib import Path

root = Path(os.environ["GITHUB_WORKSPACE"]) if os.environ.get("GITHUB_WORKSPACE") else Path.cwd()
out = root / ".artefakte" / "I005"
manifest_path = out / "WHEELHOUSE_MANIFEST.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["status"] = "OFFLINE_INSTALLATION_VERIFIZIERT"
manifest_path.write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
    encoding="utf-8",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()

# Finale Hashliste: zuerst alle Wheels, danach das final markierte Manifest.
lines = []
for wheel in sorted((out / "wheelhouse").glob("*.whl"), key=lambda item: item.name.lower()):
    lines.append(f"{sha256(wheel)}  wheelhouse/{wheel.name}")
lines.append(f"{sha256(manifest_path)}  WHEELHOUSE_MANIFEST.json")
(out / "WHEELHOUSE_SHA256.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

qualification = {
    "schema": "1.0.0",
    "iteration": "I005",
    "status": "GRUEN",
    "zeit_utc": datetime.now(UTC).isoformat(),
    "github": {
        "repository": os.environ.get("GITHUB_REPOSITORY"),
        "sha": os.environ.get("GITHUB_SHA"),
        "run_id": os.environ.get("GITHUB_RUN_ID"),
        "run_attempt": os.environ.get("GITHUB_RUN_ATTEMPT"),
        "runner_os": os.environ.get("RUNNER_OS"),
        "runner_arch": os.environ.get("RUNNER_ARCH"),
    },
    "beweise": {
        "plattform": "Ubuntu 22.04 amd64",
        "python": "3.13.15",
        "pip_resolver": "25.2",
        "download": "nur Wheels; --only-binary=:all:",
        "offline_install": "PIP_NO_INDEX=1 + --no-index + lokales --find-links",
        "pip_check": "GRUEN",
        "import_smoke": "GRUEN",
    },
    "manifest_sha256": sha256(manifest_path),
    "hashliste_sha256": sha256(out / "WHEELHOUSE_SHA256.txt"),
    "freeze_sha256": sha256(out / "OFFLINE_FREEZE.txt"),
    "abhaengigkeitsinventar_sha256": sha256(out / "ABHAENGIGKEITSINVENTAR.json"),
}
(out / "I005_QUALIFIKATION.json").write_text(
    json.dumps(qualification, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
    encoding="utf-8",
)
PY

echo "I005: GRÜN — Wheelhouse erzeugt und offline verifiziert."
