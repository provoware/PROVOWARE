#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$SCRIPT_DIR/PROVOWARE_TRANSFER_MANIFEST.json"

cat > "$MANIFEST" <<'JSON'
__PROVOWARE_TRANSFER_MANIFEST_JSON__
JSON

if ! command -v python3 >/dev/null 2>&1; then
    printf '\nFEHLER: Python 3 fehlt. Auf Kubuntu ist Python 3 normalerweise vorinstalliert.\n\n'
    exit 10
fi

exec python3 - "$SCRIPT_DIR" "$MANIFEST" "$0" <<'PY'
from __future__ import annotations
import hashlib, json, os, shutil, sys, tempfile, time, zipfile
from pathlib import Path

SCRIPT_DIR = Path(sys.argv[1]).resolve()
MANIFEST_PATH = Path(sys.argv[2]).resolve()
SELF = Path(sys.argv[3]).resolve()

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def info(msg: str) -> None:
    print(f"[PROVOWARE] {msg}", flush=True)

def stop(msg: str, code: int) -> None:
    print(f"\n[PROVOWARE] FEHLER: {msg}\n", file=sys.stderr, flush=True)
    raise SystemExit(code)

manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
parts = manifest["teile"]
archive = manifest["gesamtarchiv"]
baseline = manifest["erwartete_baseline"]

info("Starte vollautomatische Offline-Installation.")
info(f"Erwartete Teilstücke: {len(parts)}")

resolved = []
for n, entry in enumerate(parts, start=1):
    candidates = [SCRIPT_DIR / entry["datei"], SCRIPT_DIR / "TEILE" / entry["datei"]]
    found = [p for p in candidates if p.is_file()]
    if len(found) != 1:
        stop(f"Teilstück fehlt oder doppelt: {entry['datei']}", 20)
    p = found[0]
    if p.stat().st_size != int(entry["bytes"]):
        stop(f"Falsche Dateigröße: {p.name}", 21)
    if sha256(p) != entry["sha256"]:
        stop(f"SHA-256 falsch: {p.name}. Bitte erneut herunterladen.", 22)
    resolved.append(p)
    info(f"Teilstück {n}/{len(parts)} geprüft: GRÜN")

target = Path(os.environ.get("PROVOWARE_ZIEL", str(Path.home() / "PROVOWARE"))).expanduser().resolve()
target.parent.mkdir(parents=True, exist_ok=True)
backup_root = target.parent / "PROVOWARE_Backup"
backup_root.mkdir(parents=True, exist_ok=True)
stamp = time.strftime("%Y%m%d_%H%M%S")
backup_target = backup_root / f"{stamp}_PROVOWARE_vor_{baseline}"

tmp = Path(tempfile.mkdtemp(prefix=".provoware_install_", dir=str(target.parent)))
combined = tmp / archive["datei"]
extract_root = tmp / "extrahiert"
old_moved = False

try:
    info("Setze das Originalarchiv bytegenau zusammen.")
    with combined.open("wb") as out:
        for part in resolved:
            with part.open("rb") as src:
                shutil.copyfileobj(src, out, length=1024 * 1024)
        out.flush()
        os.fsync(out.fileno())

    if combined.stat().st_size != int(archive["bytes"]):
        stop("Gesamtgröße stimmt nicht.", 30)
    if sha256(combined) != archive["sha256"]:
        stop("SHA-256 des Gesamtarchivs stimmt nicht.", 31)
    info("Gesamtarchiv geprüft: GRÜN")

    info("Prüfe und entpacke das ZIP.")
    with zipfile.ZipFile(combined, "r") as zf:
        bad = zf.testzip()
        if bad:
            stop(f"ZIP beschädigt: {bad}", 32)
        zf.extractall(extract_root)

    staged = extract_root / "PROVOWARE"
    status_file = staged / "PROJEKTSTATUS.json"
    if not status_file.is_file():
        stop("PROJEKTSTATUS.json fehlt.", 33)
    status = json.loads(status_file.read_text(encoding="utf-8"))
    if status.get("aktuelle_baseline") != baseline:
        stop("Projektbaseline stimmt nicht.", 34)

    if target.exists():
        info(f"Sichere vorhandenen Stand nach: {backup_target}")
        os.replace(target, backup_target)
        old_moved = True

    info(f"Installiere PROVOWARE nach: {target}")
    os.replace(staged, target)

    transfer_dir = target / "TRANSFER"
    transfer_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(MANIFEST_PATH, transfer_dir / "PROVOWARE_TRANSFER_MANIFEST.json")
    shutil.copy2(SELF, transfer_dir / "PROVOWARE_INSTALLIEREN.sh")

    report = {
        "schema": "1.0.0",
        "status": "ERFOLGREICH",
        "zeit_lokal": stamp,
        "baseline": baseline,
        "ziel": str(target),
        "backup_vorher": str(backup_target) if old_moved else None,
        "gesamtarchiv_sha256": archive["sha256"],
        "gesamtarchiv_bytes": archive["bytes"],
        "anzahl_teile": len(parts),
        "alle_teilhashes_geprueft": True,
        "zip_integritaet_geprueft": True,
        "netzwerk_benoetigt": False,
        "benutzereingriff_nach_start": False,
    }
    (transfer_dir / "INSTALLATIONSNACHWEIS.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    print()
    print("==========================================================")
    print(" PROVOWARE: INSTALLATION ERFOLGREICH")
    print(f" Ziel:     {target}")
    print(f" Baseline: {baseline}")
    if old_moved:
        print(f" Backup:   {backup_target}")
    print(" Teilstücke, Gesamt-ZIP und Projektbaseline: GRÜN")
    print("==========================================================")
    print()

except SystemExit:
    if old_moved and not target.exists() and backup_target.exists():
        os.replace(backup_target, target)
        info("Vorheriger Stand automatisch wiederhergestellt.")
    raise
except Exception as exc:
    if old_moved and not target.exists() and backup_target.exists():
        os.replace(backup_target, target)
        info("Vorheriger Stand automatisch wiederhergestellt.")
    stop(f"Unerwarteter Fehler: {exc}", 99)
finally:
    shutil.rmtree(tmp, ignore_errors=True)
PY
