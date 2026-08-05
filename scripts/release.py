#!/usr/bin/env python3
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
TARGET = DIST / "provoware-entwicklungsplan-prototyp"
ARCHIVE_BASE = DIST / "PROVOWARE_Entwicklungsplan_Prototyp_0.2.0"


def main():
    subprocess.run([sys.executable, str(ROOT / "scripts" / "build.py")], check=True)
    archive = shutil.make_archive(str(ARCHIVE_BASE), "zip", root_dir=TARGET)
    print(f"[OK] Release-ZIP erzeugt: {archive}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
