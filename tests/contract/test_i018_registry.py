from __future__ import annotations

from dataclasses import replace

import pytest

from provoware.vertraege.datentypen import ProjektId
from provoware.vertraege.registry import (
    STANDARD_REGISTRY_VERTRAG,
    RegistryAufloesungsfehler,
    RegistryQuelle,
    registry_aufloesen,
    registry_contract_fingerprint,
    registry_source_fingerprint,
)

PROJEKT_ID = ProjektId.parse("prj_0123456789abcdef0123456789abcdef")


def quelle(*, version: str = "0.1.0-dev", manifest_version: str | None = None) -> RegistryQuelle:
    return RegistryQuelle(
        name="kanonisch",
        projekt_id=PROJEKT_ID,
        versionsregister={"projektversion": version, "manifest_schema": "1.0.0"},
        manifest={
            "schema": "1.0.0",
            "version": manifest_version or version,
            "projekt": "PROVOWARE",
        },
    )


def test_eine_quelle_wird_deterministisch_aufgeloest() -> None:
    ergebnis = registry_aufloesen([quelle()])

    assert ergebnis.quelle == "kanonisch"
    assert ergebnis.projekt_id == PROJEKT_ID
    assert str(ergebnis.produktversion) == "0.1.0-dev"
    assert str(ergebnis.manifest_schema) == "1.0.0"
    assert ergebnis.manifest["projekt"] == "PROVOWARE"
    assert len(ergebnis.source_fingerprint) == 64
    assert len(ergebnis.contract_fingerprint) == 64


def test_keine_quelle_blockiert_fail_closed() -> None:
    with pytest.raises(RegistryAufloesungsfehler, match="Genau eine Registryquelle"):
        registry_aufloesen([])


def test_zwei_quellen_blockieren_fail_closed() -> None:
    with pytest.raises(RegistryAufloesungsfehler, match="erhalten: 2"):
        registry_aufloesen([quelle(), quelle()])


def test_widerspruechliche_produktversion_blockiert() -> None:
    with pytest.raises(RegistryAufloesungsfehler, match="Produktversion widerspricht"):
        registry_aufloesen([quelle(manifest_version="0.1.1-dev")])


def test_widerspruechliches_manifest_schema_blockiert() -> None:
    q = RegistryQuelle(
        name="kanonisch",
        projekt_id=PROJEKT_ID,
        versionsregister={"projektversion": "0.1.0-dev", "manifest_schema": "1.0.0"},
        manifest={"schema": "2.0.0", "version": "0.1.0-dev", "projekt": "PROVOWARE"},
    )
    with pytest.raises(RegistryAufloesungsfehler, match="Manifest-Schema widerspricht"):
        registry_aufloesen([q])


def test_bestehende_id_wird_nur_referenziert() -> None:
    ergebnis = registry_aufloesen([quelle()])

    assert ergebnis.projekt_id is PROJEKT_ID


def test_source_fingerprint_ist_deterministisch_und_reihenfolgeunabhaengig() -> None:
    a = quelle()
    b = RegistryQuelle(
        name="kanonisch",
        projekt_id=PROJEKT_ID,
        versionsregister={"manifest_schema": "1.0.0", "projektversion": "0.1.0-dev"},
        manifest={"projekt": "PROVOWARE", "version": "0.1.0-dev", "schema": "1.0.0"},
    )

    assert registry_source_fingerprint(a) == registry_source_fingerprint(b)


def test_geaenderte_quelle_wird_gegen_gepinnten_fingerprint_blockiert() -> None:
    original = quelle()
    fingerprint = registry_source_fingerprint(original)
    veraendert = RegistryQuelle(
        name=original.name,
        projekt_id=original.projekt_id,
        versionsregister=original.versionsregister,
        manifest={**original.manifest, "projekt": "AUSGETAUSCHT"},
    )

    with pytest.raises(RegistryAufloesungsfehler, match="erwarteten Fingerprint"):
        registry_aufloesen([veraendert], erwarteter_fingerprint=fingerprint)


def test_nicht_kanonisierbare_quelle_blockiert_fail_closed() -> None:
    q = RegistryQuelle(
        name="kanonisch",
        projekt_id=PROJEKT_ID,
        versionsregister={"projektversion": "0.1.0-dev", "manifest_schema": "1.0.0"},
        manifest={"schema": "1.0.0", "version": "0.1.0-dev", "ungueltig": object()},
    )

    with pytest.raises(RegistryAufloesungsfehler, match="kanonisch serialisiert"):
        registry_source_fingerprint(q)


def test_contract_fingerprint_ist_deterministisch() -> None:
    assert registry_contract_fingerprint() == registry_contract_fingerprint(
        STANDARD_REGISTRY_VERTRAG
    )


def test_geaenderter_vertrag_wird_gegen_contract_pin_blockiert() -> None:
    fingerprint = registry_contract_fingerprint()
    veraendert = replace(STANDARD_REGISTRY_VERTRAG, konfliktregel="abweichung_warnen")

    with pytest.raises(RegistryAufloesungsfehler, match="Registryvertrag weicht"):
        registry_aufloesen(
            [quelle()],
            vertrag=veraendert,
            erwarteter_contract_fingerprint=fingerprint,
        )


def test_contract_fingerprint_ist_vom_quellinhalt_unabhaengig() -> None:
    a = registry_aufloesen([quelle()])
    b = registry_aufloesen([quelle(version="0.2.0-dev")])

    assert a.contract_fingerprint == b.contract_fingerprint
    assert a.source_fingerprint != b.source_fingerprint


def test_ungueltige_contract_quellenanzahl_blockiert_fail_closed() -> None:
    vertrag = replace(STANDARD_REGISTRY_VERTRAG, registry_source_count=2)

    with pytest.raises(RegistryAufloesungsfehler, match="exakt eine Quelle verlangen"):
        registry_aufloesen([quelle()], vertrag=vertrag)
