"""Read-only Versions-/Manifestregistry-Vertrag für I018.0.

Die Schicht mutiert weder Register noch IDs. Sie akzeptiert genau eine bereits
vorhandene Registryquelle und löst Version und Manifest deterministisch auf.
"""

from __future__ import annotations

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


def _text(mapping: Mapping[str, object], feld: str, quelle: str) -> str:
    wert = mapping.get(feld)
    if not isinstance(wert, str) or not wert:
        raise RegistryAufloesungsfehler(f"{quelle}: Feld {feld!r} fehlt oder ist kein Text.")
    return wert


def registry_aufloesen(quellen: Sequence[RegistryQuelle]) -> RegistryErgebnis:
    """Löst exakt eine Quelle auf; Mehrdeutigkeit und Widersprüche blockieren."""

    if len(quellen) != 1:
        raise RegistryAufloesungsfehler(
            f"Genau eine Registryquelle ist erlaubt; erhalten: {len(quellen)}."
        )

    quelle = quellen[0]
    if not quelle.name.strip():
        raise RegistryAufloesungsfehler("Registryquellenname darf nicht leer sein.")

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
    )
