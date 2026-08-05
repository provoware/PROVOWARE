#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
TARGET = DIST / "provoware-entwicklungsplan-prototyp"
RUNTIME_ITEMS = ["index.html", "css", "js", "data", "schemas", "README.md", "docs"]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    subprocess.run([sys.executable, str(ROOT / "scripts" / "validate.py")], check=True)
    if TARGET.exists():
        shutil.rmtree(TARGET)
    TARGET.mkdir(parents=True)

    for item in RUNTIME_ITEMS:
        source = ROOT / item
        destination = TARGET / item
        if source.is_dir():
            shutil.copytree(source, destination)
        else:
            shutil.copy2(source, destination)

    manifest = {
        "buildVersion": "0.7.0",
        "files": [
            {"path": str(path.relative_to(TARGET)), "sha256": sha256(path), "size": path.stat().st_size}
            for path in sorted(TARGET.rglob("*")) if path.is_file()
        ]
    }
    (TARGET / "BUILD_MANIFEST.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"[OK] Modularer Build erzeugt: {TARGET}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
