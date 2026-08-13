#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path


def trigger_block(text: str) -> str:
    lines = text.splitlines()
    for index, line in enumerate(lines):
        if line == "on:":
            block = []
            for item in lines[index + 1 :]:
                if item and not item[0].isspace():
                    break
                block.append(item)
            return "\n".join(block)
    raise ValueError("on-Block fehlt")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    data = json.loads((root / "docs/HISTORISCHE_GATES.json").read_text(encoding="utf-8"))
    if data.get("schema") != "1.0.0" or data.get("regel", {}).get("fail_closed") is not True:
        print("REGISTRY_VERTRAG_UNGUELTIG", file=sys.stderr)
        return 2
    gates = data.get("gates")
    if not isinstance(gates, list) or not gates:
        print("REGISTRY_OHNE_GATES", file=sys.stderr)
        return 2
    seen = set()
    errors = []
    for gate in gates:
        path = gate.get("path")
        if gate.get("status") != "PROMOTED_FROZEN" or not isinstance(path, str):
            errors.append(f"REGISTRY_EINTRAG_UNGUELTIG:{path!r}")
            continue
        if path in seen:
            errors.append(f"DUBLETTE:{path}")
            continue
        seen.add(path)
        target = root / path
        if not target.is_file():
            errors.append(f"DATEI_FEHLT:{path}")
            continue
        try:
            block = trigger_block(target.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, ValueError) as exc:
            errors.append(f"NICHT_PRUEFBAR:{path}:{exc}")
            continue
        if "workflow_dispatch:" not in block:
            errors.append(f"WORKFLOW_DISPATCH_FEHLT:{path}")
        if "pull_request:" in block:
            errors.append(f"PULL_REQUEST_REAKTIVIERT:{path}")
        if "push:" in block:
            errors.append(f"PUSH_REAKTIVIERT:{path}")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"HISTORISCHE_GATES_LINTER=PASS:{len(seen)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
