"""Read-only Versions-/Manifestregistry-Vertrag für I018.

Die Schicht mutiert weder Register noch IDs. Sie akzeptiert genau eine bereits
vorhandene Registryquelle, bindet deren kanonischen Inhalt sowie den expliziten
Interpretationsvertrag per SHA-256 und löst Version und Manifest deterministisch auf.
I018.3 bindet zusätzlich die aufgelösten Identitäts- und Versionswerte gemeinsam mit
Source- und Contract-Fingerprint in einem read-only Binding-Receipt.
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
class RegistryVertrag:
    """Explizite, stabile Repräsentation der Registry-Interpretationsregeln."""

    contract_schema_version: str = "1.0.0"
    registry_source_count: int = 1
    produktversion_felder: tuple[str, str] = ("projektversion", "version")
    manifest_schema_felder: tuple[str, str] = ("manifest_schema", "schema")
    identitaetsregel: str = "bestehende_projekt_id_nur_referenzieren"
    konfliktregel: str = "abweichung_oder_mehrdeutigkeit_fail_closed"


STANDARD_REGISTRY_VERTRAG = RegistryVertrag()


@dataclass(frozen=True, slots=True)
class RegistryBindingReceipt:
    """Explizite read-only Bindung einer erfolgreich aufgelösten Registry-Sicht."""

    projekt_id: ProjektId
    source_fingerprint: str
    contract_fingerprint: str
    produktversion: ProduktVersion
    manifest_schema: SchemaVersion


@dataclass(frozen=True, slots=True)
class RegistryErgebnis:
    """Deterministisches Ergebnis einer erfolgreichen Registryauflösung."""

    quelle: str
    projekt_id: ProjektId
    produktversion: ProduktVersion
    manifest_schema: SchemaVersion
    manifest: Mapping[str, object]
    source_fingerprint: str
    contract_fingerprint: str
    binding_receipt: RegistryBindingReceipt
    binding_receipt_sha256: str


def _kanonischer_sha256(payload: Mapping[str, object], fehlertext: str) -> str:
    try:
        kanonisch = json.dumps(
            payload,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        ).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise RegistryAufloesungsfehler(fehlertext) from exc
    return hashlib.sha256(kanonisch).hexdigest()


def _text(mapping: Mapping[str, object], feld: str, quelle: str) -> str:
    wert = mapping.get(feld)
    if not isinstance(wert, str) or not wert:
        raise RegistryAufloesungsfehler(f"{quelle}: Feld {feld!r} fehlt oder ist kein Text.")
    return wert


def registry_source_fingerprint(quelle: RegistryQuelle) -> str:
    """Bildet einen deterministischen SHA-256-Fingerprint der gesamten Quelle."""

    payload = {
        "manifest": quelle.manifest,
        "name": quelle.name,
        "projekt_id": str(quelle.projekt_id),
        "versionsregister": quelle.versionsregister,
    }
    return _kanonischer_sha256(
        payload,
        "Registryquelle kann nicht kanonisch serialisiert werden.",
    )


def registry_contract_fingerprint(vertrag: RegistryVertrag = STANDARD_REGISTRY_VERTRAG) -> str:
    """Bindet ausschließlich den expliziten Interpretationsvertrag per SHA-256."""

    payload = {
        "contract_schema_version": vertrag.contract_schema_version,
        "identitaetsregel": vertrag.identitaetsregel,
        "konfliktregel": vertrag.konfliktregel,
        "manifest_schema_felder": list(vertrag.manifest_schema_felder),
        "produktversion_felder": list(vertrag.produktversion_felder),
        "registry_source_count": vertrag.registry_source_count,
    }
    return _kanonischer_sha256(
        payload,
        "Registryvertrag kann nicht kanonisch serialisiert werden.",
    )


def registry_binding_receipt_fingerprint(receipt: RegistryBindingReceipt) -> str:
    """Bindet Identität, Quelle, Vertrag und Auflösung gemeinsam per SHA-256."""

    payload = {
        "contract_fingerprint": receipt.contract_fingerprint,
        "manifest_schema": str(receipt.manifest_schema),
        "produktversion": str(receipt.produktversion),
        "projekt_id": str(receipt.projekt_id),
        "source_fingerprint": receipt.source_fingerprint,
    }
    return _kanonischer_sha256(
        payload,
        "Registry-Binding-Receipt kann nicht kanonisch serialisiert werden.",
    )


def registry_aufloesen(
    quellen: Sequence[RegistryQuelle],
    *,
    erwarteter_fingerprint: str | None = None,
    erwarteter_contract_fingerprint: str | None = None,
    erwarteter_binding_receipt_sha256: str | None = None,
    vertrag: RegistryVertrag = STANDARD_REGISTRY_VERTRAG,
) -> RegistryErgebnis:
    """Löst exakt eine Quelle unter explizit gebundenen Integritätswerten auf."""

    contract_fingerprint = registry_contract_fingerprint(vertrag)
    if (
        erwarteter_contract_fingerprint is not None
        and contract_fingerprint != erwarteter_contract_fingerprint
    ):
        raise RegistryAufloesungsfehler("Registryvertrag weicht vom erwarteten Fingerprint ab.")

    if vertrag.registry_source_count != 1:
        raise RegistryAufloesungsfehler("Registryvertrag muss exakt eine Quelle verlangen.")
    if len(quellen) != vertrag.registry_source_count:
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
        _text(quelle.versionsregister, vertrag.produktversion_felder[0], "VERSIONSREGISTER")
    )
    manifest_version = ProduktVersion.parse(
        _text(quelle.manifest, vertrag.produktversion_felder[1], "MANIFEST")
    )
    if versions_version != manifest_version:
        raise RegistryAufloesungsfehler(
            "Produktversion widerspricht sich zwischen VERSIONSREGISTER und MANIFEST."
        )

    versions_manifest_schema = SchemaVersion.parse(
        _text(quelle.versionsregister, vertrag.manifest_schema_felder[0], "VERSIONSREGISTER")
    )
    manifest_schema = SchemaVersion.parse(
        _text(quelle.manifest, vertrag.manifest_schema_felder[1], "MANIFEST")
    )
    if versions_manifest_schema != manifest_schema:
        raise RegistryAufloesungsfehler(
            "Manifest-Schema widerspricht sich zwischen VERSIONSREGISTER und MANIFEST."
        )

    binding_receipt = RegistryBindingReceipt(
        projekt_id=quelle.projekt_id,
        source_fingerprint=source_fingerprint,
        contract_fingerprint=contract_fingerprint,
        produktversion=manifest_version,
        manifest_schema=manifest_schema,
    )
    binding_receipt_sha256 = registry_binding_receipt_fingerprint(binding_receipt)
    if (
        erwarteter_binding_receipt_sha256 is not None
        and binding_receipt_sha256 != erwarteter_binding_receipt_sha256
    ):
        raise RegistryAufloesungsfehler(
            "Registry-Binding-Receipt weicht vom erwarteten Fingerprint ab."
        )

    return RegistryErgebnis(
        quelle=quelle.name,
        projekt_id=quelle.projekt_id,
        produktversion=manifest_version,
        manifest_schema=manifest_schema,
        manifest=quelle.manifest,
        source_fingerprint=source_fingerprint,
        contract_fingerprint=contract_fingerprint,
        binding_receipt=binding_receipt,
        binding_receipt_sha256=binding_receipt_sha256,
    )
