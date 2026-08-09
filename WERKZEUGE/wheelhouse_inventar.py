from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import re
import sys
import zipfile
from datetime import UTC, datetime
from email.parser import BytesParser
from email.policy import default
from pathlib import Path

_NORMALIZE_RE = re.compile(r"[-_.]+")


def normalisiere_name(name: str) -> str:
    return _NORMALIZE_RE.sub("-", name).lower()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def lese_os_release() -> dict[str, str]:
    data: dict[str, str] = {}
    path = Path("/etc/os-release")
    if not path.is_file():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key] = value.strip().strip('"')
    return data


def direkte_anforderungen(path: Path) -> list[dict[str, str]]:
    result: list[dict[str, str]] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "==" not in line:
            raise ValueError(f"Nicht exakt gepinnte Anforderung: {line}")
        name, version = line.split("==", 1)
        result.append({"name": name, "normalisiert": normalisiere_name(name), "version": version})
    return result


def metadata_aus_wheel(path: Path) -> dict[str, object]:
    with zipfile.ZipFile(path) as archive:
        metadata_names = sorted(name for name in archive.namelist() if name.endswith(".dist-info/METADATA"))
        if len(metadata_names) != 1:
            raise ValueError(f"Wheel {path.name}: erwartete genau eine METADATA-Datei, gefunden {len(metadata_names)}")
        message = BytesParser(policy=default).parsebytes(archive.read(metadata_names[0]))

    name = str(message.get("Name", "")).strip()
    version = str(message.get("Version", "")).strip()
    if not name or not version:
        raise ValueError(f"Wheel {path.name}: Name/Version fehlen in METADATA")

    licenses = [str(value).strip() for value in message.get_all("License", []) if str(value).strip()]
    expressions = [str(value).strip() for value in message.get_all("License-Expression", []) if str(value).strip()]
    requires = [str(value).strip() for value in message.get_all("Requires-Dist", []) if str(value).strip()]

    return {
        "datei": path.name,
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
        "name": name,
        "name_normalisiert": normalisiere_name(name),
        "version": version,
        "license": licenses,
        "license_expression": expressions,
        "requires_dist": sorted(requires),
    }


def baue_manifest(wheelhouse: Path, requirements: Path) -> dict[str, object]:
    wheels = sorted(wheelhouse.glob("*.whl"), key=lambda item: item.name.lower())
    if not wheels:
        raise ValueError("Wheelhouse enthält keine Wheels.")

    pakete = [metadata_aus_wheel(path) for path in wheels]
    direkte = direkte_anforderungen(requirements)
    index = {(str(p["name_normalisiert"]), str(p["version"])) for p in pakete}
    fehlend = [entry for entry in direkte if (entry["normalisiert"], entry["version"]) not in index]
    if fehlend:
        raise ValueError(f"Direkte Pins fehlen im Wheelhouse: {fehlend}")

    doppelte = sorted(
        name
        for name in {str(p["name_normalisiert"]) for p in pakete}
        if sum(1 for p in pakete if p["name_normalisiert"] == name) > 1
    )
    if doppelte:
        raise ValueError(f"Mehrere Wheels desselben normalisierten Pakets vorhanden: {doppelte}")

    os_release = lese_os_release()
    return {
        "schema": "1.0.0",
        "iteration": "I005",
        "status": "ERZEUGT_NOCH_NICHT_OFFLINE_VERIFIZIERT",
        "erzeugt_utc": datetime.now(UTC).isoformat(),
        "plattform": {
            "system": platform.system(),
            "machine": platform.machine(),
            "python": platform.python_version(),
            "python_implementation": platform.python_implementation(),
            "ubuntu_version_id": os_release.get("VERSION_ID"),
            "ubuntu_name": os_release.get("PRETTY_NAME"),
        },
        "github": {
            "repository": os.environ.get("GITHUB_REPOSITORY"),
            "sha": os.environ.get("GITHUB_SHA"),
            "run_id": os.environ.get("GITHUB_RUN_ID"),
            "run_attempt": os.environ.get("GITHUB_RUN_ATTEMPT"),
        },
        "anforderungsdatei": requirements.name,
        "anforderungsdatei_sha256": sha256(requirements),
        "direkte_anforderungen": direkte,
        "paketanzahl": len(pakete),
        "gesamtbytes": sum(int(p["bytes"]) for p in pakete),
        "pakete": pakete,
    }


def schreibe_artefakte(manifest: dict[str, object], out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    manifest_path = out / "WHEELHOUSE_MANIFEST.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    lines = [f"{paket['sha256']}  wheelhouse/{paket['datei']}" for paket in manifest["pakete"]]  # type: ignore[index]
    lines.append(f"{sha256(manifest_path)}  WHEELHOUSE_MANIFEST.json")
    (out / "WHEELHOUSE_SHA256.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    inventory = {
        "schema": "1.0.0",
        "iteration": "I005",
        "pakete": [
            {
                "name": paket["name"],
                "version": paket["version"],
                "license": paket["license"],
                "license_expression": paket["license_expression"],
                "requires_dist": paket["requires_dist"],
            }
            for paket in manifest["pakete"]  # type: ignore[index]
        ],
    }
    (out / "ABHAENGIGKEITSINVENTAR.json").write_text(
        json.dumps(inventory, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Erzeugt das I005 Wheelhouse-Inventar.")
    parser.add_argument("--wheelhouse", type=Path, required=True)
    parser.add_argument("--requirements", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    manifest = baue_manifest(args.wheelhouse, args.requirements)
    schreibe_artefakte(manifest, args.out)
    print(f"I005-Inventar: {manifest['paketanzahl']} Wheels, {manifest['gesamtbytes']} Bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
