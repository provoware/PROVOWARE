"""Read-only Versions-/Manifestregistry-Vertrag für I018.

Die Schicht mutiert weder Register noch IDs. Sie akzeptiert genau eine bereits
vorhandene Registryquelle, bindet deren kanonischen Inhalt per SHA-256 und löst
Version und Manifest deterministisch auf.
"""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping, Sequence
from dataclasses import dataclass

from provoware.vertraege.datentypen import ProjektId
from provoware.vertraege.schemata import ProduktVersion, SchemaVersion


class RegistryAufloesungsfehler(ValueError):
    """Fail-closed Fehler an der read-only Registrygrenze."""


@dataclass(frozen=True, slots=True)
class RegistryQuelle:
    """Unveränderliche Sicht auf genau eine autoritative Registryquelle."""

    name: str
    projekt_id: ProjektId
    versionsregister: Mapping[str, object]
    manifest: Mapping[str, object]


@dataclass(frozen=True, slots=True)
class RegistryErgebnis:
    """Deterministisches Ergebnis einer erfolgreichen Registryauflösung."""

    quelle: str
    projekt_id: ProjektId
    produktversion: ProduktVersion
    manifest_schema: SchemaVersion
    manifest: Mapping[str, object]
    source_fingerprint: str


def _text(mapping: Mapping[str, object], feld: str, quelle: str) -> str:
    wert = mapping.get(feld)
    if not isinstance(wert, str) or not wert:
        raise RegistryAufloesungsfehler(f"{quelle}: Feld {feld!r} fehlt oder ist kein Text.")
    return wert


def registry_source_fingerprint(quelle: RegistryQuelle) -> str:
    """Bildet einen deterministischen SHA-256-Fingerprint der gesamten Quelle.

    Die Serialisierung ist absichtlich streng: Nicht JSON-kompatible Werte,
    NaN/Infinity und andere nicht kanonisierbare Inhalte blockieren fail-closed.
    """

    payload = {
        "manifest": quelle.manifest,
        "name": quelle.name,
        "projekt_id": str(quelle.projekt_id),
        "versionsregister": quelle.versionsregister,
    }
    try:
        kanonisch = json.dumps(
            payload,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        ).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise RegistryAufloesungsfehler(
            "Registryquelle kann nicht kanonisch serialisiert werden."
        ) from exc
    return hashlib.sha256(kanonisch).hexdigest()


def registry_aufloesen(
    quellen: Sequence[RegistryQuelle], *, erwarteter_fingerprint: str | None = None
) -> RegistryErgebnis:
    """Löst exakt eine Quelle auf; Mehrdeutigkeit, Austausch und Widersprüche blockieren."""

    if len(quellen) != 1:
        raise RegistryAufloesungsfehler(
            f"Genau eine Registryquelle ist erlaubt; erhalten: {len(quellen)}."
        )

    quelle = quellen[0]
    if not quelle.name.strip():
        raise RegistryAufloesungsfehler("Registryquellenname darf nicht leer sein.")

    source_fingerprint = registry_source_fingerprint(quelle)
    if erwarteter_fingerprint is not None and source_fingerprint != erwarteter_fingerprint:
        raise RegistryAufloesungsfehler("Registryquelle weicht vom erwarteten Fingerprint ab.")

    versions_version = ProduktVersion.parse(
        _text(quelle.versionsregister, "projektversion", "VERSIONSREGISTER")
    )
    manifest_version = ProduktVersion.parse(_text(quelle.manifest, "version", "MANIFEST"))
    if versions_version != manifest_version:
        raise RegistryAufloesungsfehler(
            "Produktversion widerspricht sich zwischen VERSIONSREGISTER und MANIFEST."
        )

    versions_manifest_schema = SchemaVersion.parse(
        _text(quelle.versionsregister, "manifest_schema", "VERSIONSREGISTER")
    )
    manifest_schema = SchemaVersion.parse(_text(quelle.manifest, "schema", "MANIFEST"))
    if versions_manifest_schema != manifest_schema:
        raise RegistryAufloesungsfehler(
            "Manifest-Schema widerspricht sich zwischen VERSIONSREGISTER und MANIFEST."
        )

    return RegistryErgebnis(
        quelle=quelle.name,
        projekt_id=quelle.projekt_id,
        produktversion=manifest_version,
        manifest_schema=manifest_schema,
        manifest=quelle.manifest,
        source_fingerprint=source_fingerprint,
    )
