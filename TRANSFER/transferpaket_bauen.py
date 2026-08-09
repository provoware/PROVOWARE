#!/usr/bin/env python3
"""Teilt ein vorhandenes PROVOWARE-ZIP reproduzierbar in Transferstücke."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("archiv", type=Path)
    parser.add_argument("ziel", type=Path)
    parser.add_argument("--teil-mib", type=int, default=24)
    parser.add_argument("--baseline", required=True)
    args = parser.parse_args()

    if not args.archiv.is_file():
        raise SystemExit(f"Archiv fehlt: {args.archiv}")
    if args.teil_mib < 1:
        raise SystemExit("--teil-mib muss mindestens 1 sein.")

    args.ziel.mkdir(parents=True, exist_ok=True)
    chunk_size = args.teil_mib * 1024 * 1024
    teile: list[dict[str, object]] = []

    with args.archiv.open("rb") as source:
        nummer = 1
        while True:
            block = source.read(chunk_size)
            if not block:
                break
            name = f"PROVOWARE_TRANSFER.teil{nummer:03d}.pvpart"
            target = args.ziel / name
            target.write_bytes(block)
            teile.append(
                {
                    "nummer": nummer,
                    "datei": name,
                    "bytes": len(block),
                    "mb": round(len(block) / 1_000_000, 6),
                    "mib": round(len(block) / 1024 / 1024, 6),
                    "sha256": sha256(target),
                }
            )
            nummer += 1

    manifest = {
        "schema": "1.0.0",
        "erwartete_baseline": args.baseline,
        "teilgroesse_mib": args.teil_mib,
        "gesamtarchiv": {
            "datei": args.archiv.name,
            "bytes": args.archiv.stat().st_size,
            "mb": round(args.archiv.stat().st_size / 1_000_000, 6),
            "mib": round(args.archiv.stat().st_size / 1024 / 1024, 6),
            "sha256": sha256(args.archiv),
        },
        "anzahl_teile": len(teile),
        "teile": teile,
    }
    (args.ziel / "PROVOWARE_TRANSFER_MANIFEST.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
