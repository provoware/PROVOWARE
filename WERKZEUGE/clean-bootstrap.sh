#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
I005_ROOT=""
ZIEL=""
RECEIPT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --i005-root)
      I005_ROOT="$2"
      shift 2
      ;;
    --ziel)
      ZIEL="$2"
      shift 2
      ;;
    --receipt)
      RECEIPT="$2"
      shift 2
      ;;
    *)
      echo "Unbekanntes Argument: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$I005_ROOT" || -z "$ZIEL" || -z "$RECEIPT" ]]; then
  echo "Nutzung: $0 --i005-root PFAD --ziel PFAD --receipt DATEI" >&2
  exit 2
fi

I005_ROOT="$(realpath "$I005_ROOT")"
ZIEL="$(realpath -m "$ZIEL")"
RECEIPT="$(realpath -m "$RECEIPT")"
WHEELHOUSE="$I005_ROOT/wheelhouse"
VENV="$ZIEL/.venv"

export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export PYTHONHASHSEED=0
export PIP_DISABLE_PIP_VERSION_CHECK=1
export PIP_NO_INPUT=1
export PIP_NO_INDEX=1
export PIP_FIND_LINKS="$WHEELHOUSE"

# Netzwerkfalle: selbst ein versehentlich gestarteter HTTP-Client läuft gegen einen
# nicht erreichbaren lokalen Port. pip ist zusätzlich durch --no-index abgesichert.
export HTTP_PROXY="http://127.0.0.1:9"
export HTTPS_PROXY="http://127.0.0.1:9"
export ALL_PROXY="http://127.0.0.1:9"
export NO_PROXY=""
export http_proxy="$HTTP_PROXY"
export https_proxy="$HTTPS_PROXY"
export all_proxy="$ALL_PROXY"
export no_proxy="$NO_PROXY"

if [[ "$ZIEL" == "/" || "$ZIEL" == "$ROOT" || "$ZIEL" == "$I005_ROOT" ]]; then
  echo "I006 BLOCKIERT: unsicheres Zielverzeichnis $ZIEL" >&2
  exit 3
fi

rm -rf "$ZIEL"
mkdir -p "$ZIEL"
mkdir -p "$(dirname "$RECEIPT")"

python3 "$ROOT/WERKZEUGE/bootstrap_pruefen.py" \
  --i005-root "$I005_ROOT" \
  --status "$ROOT/WERKZEUGE/WHEELHOUSE_STATUS.json" \
  --json-out "$ZIEL/I005_BASIS_PRUEFUNG.json"

if [[ "$(python3 -c 'import platform; print(platform.python_version())')" != "3.13.15" ]]; then
  echo "I006 BLOCKIERT: CPython 3.13.15 erforderlich." >&2
  exit 4
fi

python3 -m venv "$VENV"

"$VENV/bin/python" -m pip install \
  --no-index \
  --find-links "$WHEELHOUSE" \
  "pip==25.2"

"$VENV/bin/python" -m pip install \
  --no-index \
  --find-links "$WHEELHOUSE" \
  --requirement "$ROOT/WERKZEUGE/wheelhouse-anforderungen.txt"

"$VENV/bin/python" -m pip check
"$VENV/bin/python" -m pip freeze --all | LC_ALL=C sort > "$ZIEL/PAKET_FREEZE.txt"

# Der vollständige Paketstand muss bytegenau der I005-Qualifikation entsprechen.
cmp --silent "$I005_ROOT/OFFLINE_FREEZE.txt" "$ZIEL/PAKET_FREEZE.txt" || {
  echo "I006 BLOCKIERT: installierter Paket-Freeze weicht von I005 ab." >&2
  diff -u "$I005_ROOT/OFFLINE_FREEZE.txt" "$ZIEL/PAKET_FREEZE.txt" || true
  exit 5
}

# Projektinstallation ohne Build-Isolation verhindert verstecktes Nachladen.
"$VENV/bin/python" -m pip install \
  --no-index \
  --find-links "$WHEELHOUSE" \
  --no-deps \
  --no-build-isolation \
  --editable "$ROOT"

"$VENV/bin/python" "$ROOT/WERKZEUGE/baseline_pruefen.py"
"$VENV/bin/python" -m pytest -q "$ROOT/tests"
"$VENV/bin/ruff" check "$ROOT/src" "$ROOT/WERKZEUGE" "$ROOT/tests"
"$VENV/bin/ruff" format --check "$ROOT/src" "$ROOT/WERKZEUGE" "$ROOT/tests"
"$VENV/bin/python" - <<'PY'
import provoware
print("PROVOWARE:", provoware.__version__)
PY

"$VENV/bin/python" - <<PY
from __future__ import annotations

import hashlib
import json
import os
import platform
from datetime import UTC, datetime
from pathlib import Path

ziel = Path(${ZIEL@Q})
receipt = Path(${RECEIPT@Q})
i005_root = Path(${I005_ROOT@Q})


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()

result = {
    "schema": "1.0.0",
    "iteration": "I006",
    "status": "GRUEN",
    "zeit_utc": datetime.now(UTC).isoformat(),
    "ziel": str(ziel),
    "python": platform.python_version(),
    "plattform": {
        "system": platform.system(),
        "machine": platform.machine(),
    },
    "netzschutz": {
        "pip_no_index": os.environ.get("PIP_NO_INDEX"),
        "pip_find_links": os.environ.get("PIP_FIND_LINKS"),
        "proxy_falle": "127.0.0.1:9",
    },
    "i005": {
        "manifest_sha256": sha256(i005_root / "WHEELHOUSE_MANIFEST.json"),
        "freeze_sha256": sha256(i005_root / "OFFLINE_FREEZE.txt"),
    },
    "bootstrap": {
        "paket_freeze_sha256": sha256(ziel / "PAKET_FREEZE.txt"),
        "paket_freeze_identisch_mit_i005": True,
        "pip_check": "GRUEN",
        "projektinstallation": "GRUEN",
        "baseline": "GRUEN",
        "pytest": "GRUEN",
        "ruff": "GRUEN",
        "import_smoke": "GRUEN",
    },
}
receipt.write_text(
    json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
    encoding="utf-8",
)
PY

echo "I006 CLEAN-BOOTSTRAP: GRÜN — $ZIEL"
