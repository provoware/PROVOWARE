from __future__ import annotations

import argparse
import ast
import hashlib
import importlib
import json
import re
import sys
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import fields, is_dataclass
from enum import Enum
from pathlib import Path
from typing import Any, Final, cast

ROOT: Final = Path(__file__).resolve().parents[1]
SNAPSHOT: Final = "P02_API_SNAPSHOT.json"
INVENTAR: Final = "P02_QUELLINVENTAR.json"
VERBOTENE_MODULE: Final = (
    "PySide",
    "PyQt",
    "sqlite",
    "pathlib",
    "subprocess",
    "shutil",
    "tempfile",
    "provoware.ui",
    "provoware.handler",
    "provoware.persistenz",
    "provoware.module",
    "provoware.daten",
)
VERBOTENE_AUFRUFE: Final = frozenset(
    {"open", "write_text", "write_bytes", "unlink", "rename", "replace", "mkdir", "rmdir", "touch"}
)
CODE_RE: Final = re.compile(r"^[A-Z][A-Z0-9_]{2,63}$")


class P02GateFehler(RuntimeError):
    def __init__(self, code: str, nachricht: str, pfad: str | None = None) -> None:
        super().__init__(nachricht)
        self.code, self.nachricht, self.pfad = code, nachricht, pfad

    def als_dict(self) -> dict[str, str | None]:
        return {"code": self.code, "nachricht": self.nachricht, "pfad": self.pfad}


def _json(root: Path, rel: str) -> dict[str, Any]:
    try:
        data = json.loads((root / rel).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise P02GateFehler("P02_JSON_UNGUELTIG", str(exc), rel) from exc
    if not isinstance(data, dict):
        raise P02GateFehler("P02_JSON_WURZEL_UNGUELTIG", "JSON-Wurzel muss Objekt sein.", rel)
    return cast(dict[str, Any], data)


def _sha(pfad: Path) -> str:
    h = hashlib.sha256()
    with pfad.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def _fingerprint(data: Mapping[str, Any]) -> str:
    text = json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(text.encode()).hexdigest()


def _vertraege(root: Path) -> Any:
    src = str((root / "src").resolve())
    if src not in sys.path:
        sys.path.insert(0, src)
    for name in tuple(sys.modules):
        if name == "provoware" or name.startswith("provoware.vertraege"):
            del sys.modules[name]
    return importlib.import_module("provoware.vertraege")


def _fehlercodes(pfad: Path, klasse: str) -> list[str]:
    tree = ast.parse(pfad.read_text(encoding="utf-8"), filename=str(pfad))
    codes: set[str] = set()
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not node.args:
            continue
        if not isinstance(node.func, ast.Name) or node.func.id != klasse:
            continue
        value = node.args[0]
        if (
            isinstance(value, ast.Constant)
            and isinstance(value.value, str)
            and CODE_RE.fullmatch(value.value)
        ):
            codes.add(value.value)
    return sorted(codes)


def erzeuge_api_snapshot(root: Path = ROOT) -> dict[str, Any]:
    v = _vertraege(root)
    exporte = cast(list[str], v.__all__)

    def typ(name: str) -> str:
        obj = getattr(v, name)
        if isinstance(obj, type) and issubclass(obj, Enum):
            return "StrEnum"
        if isinstance(obj, type) and is_dataclass(obj):
            return "Dataclass"
        if isinstance(obj, type) and issubclass(obj, ValueError):
            return "ValueError"
        return type(obj).__name__ if not isinstance(obj, type) else "Klasse"

    def feldliste(name: str) -> list[str]:
        obj = getattr(v, name)
        return (
            [field.name for field in fields(obj)]
            if isinstance(obj, type) and is_dataclass(obj)
            else []
        )

    id_namen = ["ProjektId", "ObjektId", "RevisionId", "ChangeId", "OperationId"]
    enum_namen = ["Status", "Fehlerklasse"]
    enumwerte = {name: [cast(str, item.value) for item in getattr(v, name)] for name in enum_namen}
    snapshot: dict[str, Any] = {
        "oeffentliche_exporte": exporte,
        "symboltypen": {name: typ(name) for name in exporte},
        "dataclass_felder": {name: feldliste(name) for name in exporte if feldliste(name)},
        "id_praefixe": {name: cast(str, getattr(v, name).PRAEFIX) for name in id_namen},
        "enumwerte": enumwerte,
        "schema_versionen": {
            "manifest": str(v.MANIFEST_SCHEMA_VERSION),
            "projekt": str(v.PROJEKT_SCHEMA_VERSION),
            "operation": str(v.OPERATION_SCHEMA_VERSION),
        },
        "pflichtfelder": {
            "ManifestSchema": sorted(cast(Iterable[str], v.ManifestSchema.PFLICHTFELDER)),
            "ProjektSchema": sorted(cast(Iterable[str], v.ProjektSchema.PFLICHTFELDER)),
            "OperationRequest": sorted(cast(Iterable[str], v.OperationRequest.PFLICHTFELDER)),
            "OperationResult": sorted(cast(Iterable[str], v.OperationResult.PFLICHTFELDER)),
        },
        "vertragsmarker": {
            "ManifestSchema.ART": cast(str, v.ManifestSchema.ART),
            "ProjektSchema.ART": cast(str, v.ProjektSchema.ART),
            "OperationRequest.TYP": cast(str, v.OperationRequest.TYP),
            "OperationResult.TYP": cast(str, v.OperationResult.TYP),
        },
        "fehlercodes": {
            "schema_validierung": _fehlercodes(
                root / "src/provoware/vertraege/schemata.py", "SchemaValidierungsfehler"
            ),
            "operation_vertrag": _fehlercodes(
                root / "src/provoware/vertraege/operationen.py", "OperationVertragsfehler"
            ),
            "fehlerklassen": enumwerte["Fehlerklasse"],
            "fehlerinfo_codeformat": "^[A-Z][A-Z0-9_]{2,63}$",
        },
        "quell_sha256": {
            "datentypen.py": _sha(root / "src/provoware/vertraege/datentypen.py"),
            "schemata.py": _sha(root / "src/provoware/vertraege/schemata.py"),
            "operationen.py": _sha(root / "src/provoware/vertraege/operationen.py"),
        },
    }
    return snapshot


def baue_snapshot_dokument(root: Path = ROOT) -> dict[str, Any]:
    snapshot = erzeuge_api_snapshot(root)
    return {
        "schema": "1.0.0",
        "phase": "P02",
        "source_iterations": ["I007", "I008", "I009"],
        "freeze_iteration": "I010",
        "snapshot": snapshot,
        "fingerprint_sha256": _fingerprint(snapshot),
        "migrationsregel": (
            "Änderungen an diesem Snapshot benötigen einen expliziten, dokumentierten "
            "Vertrags-/Migrationswechsel mit neuem Snapshot-Fingerprint."
        ),
    }


def pruefe_api_snapshot(root: Path = ROOT) -> str:
    erwartet, aktuell = _json(root, SNAPSHOT), baue_snapshot_dokument(root)
    if erwartet != aktuell:
        raise P02GateFehler(
            "P02_API_SNAPSHOT_DRIFT", "Öffentliche P02-API ist gedriftet.", SNAPSHOT
        )
    return cast(str, erwartet["fingerprint_sha256"])


def _liste(value: object, feld: str) -> list[str]:
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise P02GateFehler("P02_INVENTAR_UNGUELTIG", f"{feld} muss Textliste sein.")
    return sorted(cast(list[str], value))


def pruefe_quellinventar(root: Path = ROOT, *, phase_abschluss: bool = False) -> None:
    inv = _json(root, INVENTAR)
    pfade = _liste(inv.get("p02_quellen"), "p02_quellen")
    erwartet = sorted(p for p in pfade if p.startswith("src/provoware/vertraege/"))
    aktuell = sorted(
        p.relative_to(root).as_posix()
        for p in (root / "src/provoware/vertraege").rglob("*.py")
        if p.is_file()
    )
    if aktuell != erwartet:
        raise P02GateFehler("P02_UNREGISTRIERTE_PRODUKTDATEI", "P02-Quellinventar weicht ab.")
    hashes = cast(dict[str, str], inv["sha256"])
    for rel in pfade:
        if not (root / rel).is_file() or _sha(root / rel) != hashes.get(rel):
            raise P02GateFehler("P02_QUELLHASH_DRIFT", "P02-Quellhash weicht ab.", rel)
    if phase_abschluss:
        gesamt = sorted(p.relative_to(root).as_posix() for p in (root / "src").rglob("*.py"))
        if gesamt != _liste(
            inv.get("i010_phase_abschluss_pythonquellen"), "i010_phase_abschluss_pythonquellen"
        ):
            raise P02GateFehler(
                "P02_P03_VORGEZOGEN_ODER_QUELLE_UNREGISTRIERT",
                "I010 enthält zusätzliche Produktquellen.",
            )


def pruefe_architekturdatei(pfad: Path, *, rel: str) -> None:
    tree = ast.parse(pfad.read_text(encoding="utf-8"), filename=rel)
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            module = [alias.name for alias in node.names]
        elif isinstance(node, ast.ImportFrom):
            module = [node.module or ""]
        else:
            module = []
        if any(name.startswith(VERBOTENE_MODULE) for name in module):
            raise P02GateFehler("P02_VERBOTENE_ABHAENGIGKEIT", f"Verbotener Import: {module}", rel)
        if isinstance(node, ast.Call):
            name = (
                node.func.id if isinstance(node.func, ast.Name) else getattr(node.func, "attr", "")
            )
            if name in VERBOTENE_AUFRUFE:
                raise P02GateFehler(
                    "P02_VERBOTENER_DATEIZUGRIFF", f"Verbotener Aufruf: {name}", rel
                )


def pruefe_architekturmatrix(root: Path = ROOT) -> None:
    for rel in _liste(_json(root, INVENTAR).get("p02_quellen"), "p02_quellen"):
        pruefe_architekturdatei(root / rel, rel=rel)


def _eintrag(liste: object, schluessel: str, wert: str) -> dict[str, Any]:
    if not isinstance(liste, list):
        raise P02GateFehler("P02_REGISTER_UNGUELTIG", f"Registerliste {schluessel} fehlt.")
    for item in liste:
        if isinstance(item, dict) and item.get(schluessel) == wert:
            return cast(dict[str, Any], item)
    raise P02GateFehler("P02_TRACEABILITY_FEHLT", f"Eintrag {wert} fehlt.")


def pruefe_traceability(root: Path = ROOT, *, nach_promotion: bool = False) -> None:
    arch = _json(root, "ARCHITEKTURREGISTER.json")
    komponenten = _json(root, "KOMPONENTENREGISTER.json")
    trace = _json(root, "TRACEABILITY.json")
    plan = _json(root, "PLAN_MASTER.json")
    arch_ids = {"ARCH-008", "ARCH-009", "ARCH-010", "ARCH-011", "ARCH-012", "ARCH-013"}
    for arch_id in arch_ids:
        if _eintrag(arch.get("architektur"), "id", arch_id).get("status") not in {
            "AKTIV",
            "VALIDIERT",
        }:
            raise P02GateFehler("P02_ARCHITEKTURSTATUS_UNGUELTIG", arch_id)
    for kmp in {"KMP-VERTRAEGE", "KMP-SCHEMATA", "KMP-OPERATIONEN"}:
        if _eintrag(komponenten.get("komponenten"), "id", kmp).get("status") != "VALIDIERT":
            raise P02GateFehler("P02_KOMPONENTE_NICHT_VALIDIERT", kmp)
    req = _eintrag(trace.get("eintraege"), "anforderung_id", "REQ-V1-003")
    checks = {
        "architektur": arch_ids,
        "implementierung": {
            "src/provoware/vertraege/datentypen.py",
            "src/provoware/vertraege/schemata.py",
            "src/provoware/vertraege/operationen.py",
            "src/provoware/vertraege/__init__.py",
            "WERKZEUGE/p02_architekturgate.py",
            SNAPSHOT,
            INVENTAR,
        },
        "tests": {"tests/architecture/test_p02_architekturgate.py", "tests/fixtures/i010/"},
        "evidence": {"EVIDENCE/I010/VORANALYSE.md", "EVIDENCE/I010/PATCHPLAN.json"},
    }
    for feld, erforderlich in checks.items():
        if not erforderlich.issubset(set(cast(list[str], req.get(feld, [])))):
            raise P02GateFehler("P02_TRACEABILITY_UNVOLLSTAENDIG", feld)
    erwartet = "VALIDIERT" if nach_promotion else "IN_ARBEIT"
    if _eintrag(plan.get("phasen"), "id", "P02").get("status") != erwartet:
        raise P02GateFehler("P02_PLANSTATUS_UNGUELTIG", erwartet, "PLAN_MASTER.json")


def pruefe_versionsraeume(root: Path = ROOT) -> None:
    versionen, snap = _json(root, "VERSIONSREGISTER.json"), erzeuge_api_snapshot(root)
    schema = cast(dict[str, str], snap["schema_versionen"])
    for feld, key in (
        ("manifest_schema", "manifest"),
        ("projekt_schema", "projekt"),
        ("operation_schema", "operation"),
    ):
        if versionen.get(feld) != schema[key]:
            raise P02GateFehler("P02_VERSIONSRAUM_DRIFT", feld)
    if versionen.get("projektversion") in set(schema.values()):
        raise P02GateFehler(
            "P02_PRODUKTVERSION_SCHEMA_KOLLISION", "Produkt-/Schema-Version kollidieren."
        )


def pruefe_baseline(root: Path = ROOT, *, nach_promotion: bool = False) -> None:
    baseline, status = _json(root, "CURRENT_BASELINE.json"), _json(root, "PROJEKTSTATUS.json")
    if baseline.get("status") != "VALIDIERT_GITHUB":
        raise P02GateFehler("P02_BASELINE_NICHT_VALIDIERT", "Baseline nicht validiert.")
    erwartet = ("I010", "I011") if nach_promotion else ("I009", "I010")
    if (baseline.get("letzte_iteration"), baseline.get("naechste_iteration")) != erwartet:
        raise P02GateFehler("P02_BASELINEFOLGE_UNGUELTIG", str(erwartet))
    if nach_promotion and status.get("p02_fortschritt_prozent") != 100:
        raise P02GateFehler("P02_PROMOTION_UNVOLLSTAENDIG", "P02-Fortschritt ist nicht 100 %.")


def pruefe_gesamtgate(
    root: Path = ROOT, *, phase_abschluss: bool = False, nach_promotion: bool = False
) -> dict[str, str]:
    pruefe_baseline(root, nach_promotion=nach_promotion)
    pruefe_quellinventar(root, phase_abschluss=phase_abschluss)
    pruefe_architekturmatrix(root)
    api_fp = pruefe_api_snapshot(root)
    pruefe_versionsraeume(root)
    pruefe_traceability(root, nach_promotion=nach_promotion)
    return {
        "baseline": "GRUEN",
        "quellinventar": "GRUEN",
        "architekturmatrix": "GRUEN",
        "api_snapshot": "GRUEN",
        "api_snapshot_sha256": api_fp,
        "quellinventar_sha256": _sha(root / INVENTAR),
        "versionsraeume": "GRUEN",
        "traceability": "GRUEN",
        "phase_abschluss": "GRUEN" if phase_abschluss else "NICHT_ANGEFORDERT",
        "modus": "NACH_PROMOTION" if nach_promotion else "VOR_PROMOTION",
    }


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="PROVOWARE P02 Architektur- und Vertragsgate")
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--phase-abschluss", action="store_true")
    parser.add_argument("--nach-promotion", action="store_true")
    parser.add_argument("--snapshot-erzeugen", action="store_true")
    args = parser.parse_args(argv)
    root = args.root.resolve()
    if args.snapshot_erzeugen:
        print(
            json.dumps(baue_snapshot_dokument(root), ensure_ascii=False, indent=2, sort_keys=True)
        )
        return 0
    try:
        ergebnis = pruefe_gesamtgate(
            root, phase_abschluss=args.phase_abschluss, nach_promotion=args.nach_promotion
        )
    except (P02GateFehler, SyntaxError) as exc:
        print("P02-GATE: ROT")
        detail = (
            exc.als_dict()
            if isinstance(exc, P02GateFehler)
            else {"code": "P02_SYNTAX", "nachricht": str(exc)}
        )
        print(json.dumps(detail, ensure_ascii=False, sort_keys=True))
        return 1
    print("P02-GATE: GRÜN")
    print(json.dumps(ergebnis, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
