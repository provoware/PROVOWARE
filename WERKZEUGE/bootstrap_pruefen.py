from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


class BootstrapPrueffehler(RuntimeError):
    """Das bereitgestellte I005-Artefakt entspricht nicht der qualifizierten Baseline."""


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def lade_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise BootstrapPrueffehler(f"Ungültiges JSON {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise BootstrapPrueffehler(f"JSON-Wurzel ist kein Objekt: {path}")
    return data


def parse_hashliste(path: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            continue
        try:
            digest, rel = line.split("  ", 1)
        except ValueError as exc:
            raise BootstrapPrueffehler(f"Ungültige Hashzeile: {line}") from exc
        if len(digest) != 64 or any(char not in "0123456789abcdef" for char in digest):
            raise BootstrapPrueffehler(f"Ungültiger SHA-256 in Hashliste: {digest}")
        if rel in result:
            raise BootstrapPrueffehler(f"Doppelter Hashlisteneintrag: {rel}")
        result[rel] = digest
    return result


def pruefe_i005(i005_root: Path, status_path: Path) -> dict[str, Any]:
    if not i005_root.is_dir():
        raise BootstrapPrueffehler(f"I005-Verzeichnis fehlt: {i005_root}")

    status = lade_json(status_path)
    if status.get("iteration") != "I005" or status.get("status") != "VALIDIERT":
        raise BootstrapPrueffehler("WHEELHOUSE_STATUS ist nicht die validierte I005-Baseline.")

    evidence_hashes = status.get("evidence_hashes")
    if not isinstance(evidence_hashes, dict):
        raise BootstrapPrueffehler("evidence_hashes fehlen in WHEELHOUSE_STATUS.")

    expected_files = {
        "WHEELHOUSE_MANIFEST.json": evidence_hashes.get("wheelhouse_manifest_sha256"),
        "WHEELHOUSE_SHA256.txt": evidence_hashes.get("wheelhouse_hashliste_sha256"),
        "ABHAENGIGKEITSINVENTAR.json": evidence_hashes.get("abhaengigkeitsinventar_sha256"),
        "OFFLINE_FREEZE.txt": evidence_hashes.get("offline_freeze_sha256"),
        "I005_QUALIFIKATION.json": evidence_hashes.get("qualifikation_sha256"),
    }
    for rel, expected in expected_files.items():
        path = i005_root / rel
        if not path.is_file():
            raise BootstrapPrueffehler(f"Pflichtdatei fehlt: {rel}")
        actual = sha256(path)
        if actual != expected:
            raise BootstrapPrueffehler(f"Hashabweichung {rel}: erwartet {expected}, erhalten {actual}")

    manifest = lade_json(i005_root / "WHEELHOUSE_MANIFEST.json")
    qualification = lade_json(i005_root / "I005_QUALIFIKATION.json")
    if manifest.get("status") != "OFFLINE_INSTALLATION_VERIFIZIERT":
        raise BootstrapPrueffehler("I005-Manifest ist nicht offline verifiziert.")
    if qualification.get("status") != "GRUEN":
        raise BootstrapPrueffehler("I005-Qualifikation ist nicht GRUEN.")

    expected_count = int(status.get("paketanzahl", -1))
    if manifest.get("paketanzahl") != expected_count:
        raise BootstrapPrueffehler("Paketanzahl zwischen Status und Manifest weicht ab.")

    hash_entries = parse_hashliste(i005_root / "WHEELHOUSE_SHA256.txt")
    wheel_entries = {rel: digest for rel, digest in hash_entries.items() if rel.startswith("wheelhouse/")}
    wheels = sorted((i005_root / "wheelhouse").glob("*.whl"), key=lambda item: item.name.lower())
    if len(wheels) != expected_count or len(wheel_entries) != expected_count:
        raise BootstrapPrueffehler(
            f"Wheelanzahl abweichend: Dateien={len(wheels)}, Hashliste={len(wheel_entries)}, erwartet={expected_count}"
        )

    actual_names = {f"wheelhouse/{path.name}" for path in wheels}
    if actual_names != set(wheel_entries):
        missing = sorted(set(wheel_entries) - actual_names)
        extra = sorted(actual_names - set(wheel_entries))
        raise BootstrapPrueffehler(f"Wheelbestand weicht ab; fehlt={missing}, extra={extra}")

    for wheel in wheels:
        rel = f"wheelhouse/{wheel.name}"
        actual = sha256(wheel)
        if actual != wheel_entries[rel]:
            raise BootstrapPrueffehler(f"Wheel-Hashabweichung: {wheel.name}")

    manifest_entry = hash_entries.get("WHEELHOUSE_MANIFEST.json")
    if manifest_entry != sha256(i005_root / "WHEELHOUSE_MANIFEST.json"):
        raise BootstrapPrueffehler("Manifesthash in WHEELHOUSE_SHA256.txt stimmt nicht.")

    return {
        "status": "GRUEN",
        "paketanzahl": expected_count,
        "wheel_bytes": sum(path.stat().st_size for path in wheels),
        "manifest_sha256": sha256(i005_root / "WHEELHOUSE_MANIFEST.json"),
        "freeze_sha256": sha256(i005_root / "OFFLINE_FREEZE.txt"),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Prüft die I005-Baseline vor I006.")
    parser.add_argument("--i005-root", type=Path, required=True)
    parser.add_argument("--status", type=Path, required=True)
    parser.add_argument("--json-out", type=Path)
    args = parser.parse_args()

    result = pruefe_i005(args.i005_root, args.status)
    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(
            json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
    print(
        f"I005-BASIS: GRÜN — {result['paketanzahl']} Wheels / "
        f"{result['wheel_bytes']} Bytes"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
