from __future__ import annotations

from provoware.vertraege.datentypen import ProjektId
from provoware.vertraege.registry import (
    RegistryAufloesungsfehler,
    RegistryQuelle,
    registry_aufloesen,
)
import pytest

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
