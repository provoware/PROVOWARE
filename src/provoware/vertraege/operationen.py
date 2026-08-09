"""Strikt typisierte Request-/Result-Verträge für spätere PROVOWARE-Operationen.

Die Schicht definiert ausschließlich die serialisierbare Operationshülle. Sie enthält
keine Handler-, Datei-, SQLite-, Qt- oder Ausführungslogik.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections.abc import Mapping
from dataclasses import dataclass
from typing import ClassVar, Final, Self, cast

from provoware.vertraege.datentypen import (
    FehlerInfo,
    Fehlerklasse,
    OperationErgebnis,
    OperationId,
)
from provoware.vertraege.schemata import SchemaVersion

_OPERATION_ART_RE: Final = re.compile(r"^[A-Z][A-Z0-9_]{2,63}$")
_OPERATION_SCHEMA_VERSION: Final = SchemaVersion("1.0.0")
_MAX_TIEFE: Final = 16
_MAX_CONTAINER_EINTRAEGE: Final = 1024
_MAX_SCHLUESSEL_LAENGE: Final = 128
_MAX_PAYLOAD_BYTES: Final = 65_536

OPERATION_SCHEMA_VERSION: Final = _OPERATION_SCHEMA_VERSION

type JsonSkalar = str | int | bool | None
type JsonWert = JsonSkalar | list[JsonWert] | dict[str, JsonWert]


class OperationVertragsfehler(ValueError):
    """Strukturierter Fehler an der öffentlichen Operationsvertragsgrenze."""

    def __init__(self, code: str, nachricht: str, feld: str | None = None) -> None:
        super().__init__(nachricht)
        self.code = code
        self.nachricht = nachricht
        self.feld = feld

    def als_dict(self) -> dict[str, str | None]:
        return {"code": self.code, "feld": self.feld, "nachricht": self.nachricht}


def _pruefe_schluessel(
    daten: Mapping[str, object], *, erforderlich: frozenset[str], vertragsname: str
) -> None:
    vorhanden = frozenset(daten)
    fehlend = erforderlich - vorhanden
    unbekannt = vorhanden - erforderlich
    if fehlend:
        feld = sorted(fehlend)[0]
        raise OperationVertragsfehler(
            "OPERATION_PFLICHTFELD_FEHLT",
            f"{vertragsname}: Pflichtfeld fehlt: {', '.join(sorted(fehlend))}.",
            feld,
        )
    if unbekannt:
        feld = sorted(unbekannt)[0]
        raise OperationVertragsfehler(
            "OPERATION_UNBEKANNTES_FELD",
            f"{vertragsname}: unbekanntes Feld: {', '.join(sorted(unbekannt))}.",
            feld,
        )


def _text(daten: Mapping[str, object], feld: str) -> str:
    wert = daten[feld]
    if not isinstance(wert, str):
        raise OperationVertragsfehler(
            "OPERATION_FELDTYP_UNGUELTIG", f"Feld {feld} muss Text sein.", feld
        )
    return wert


def _schema_version(text: str) -> SchemaVersion:
    try:
        version = SchemaVersion.parse(text)
    except ValueError as exc:
        raise OperationVertragsfehler(
            "OPERATION_SCHEMA_UNGUELTIG", str(exc), "schema"
        ) from exc
    if version != OPERATION_SCHEMA_VERSION:
        raise OperationVertragsfehler(
            "OPERATION_SCHEMA_INKOMPATIBEL",
            f"Operationsschema {version} ist inkompatibel; erwartet wird {OPERATION_SCHEMA_VERSION}.",
            "schema",
        )
    return version


def _operation_id(text: str) -> OperationId:
    try:
        return OperationId.parse(text)
    except ValueError as exc:
        raise OperationVertragsfehler(
            "OPERATION_ID_UNGUELTIG", str(exc), "operation_id"
        ) from exc


def _operation_art(text: str) -> OperationArt:
    try:
        return OperationArt.parse(text)
    except OperationVertragsfehler:
        raise
    except ValueError as exc:
        raise OperationVertragsfehler(
            "OPERATION_ART_UNGUELTIG", str(exc), "operation_art"
        ) from exc


def _schluessel_gueltig(schluessel: str) -> bool:
    return (
        1 <= len(schluessel) <= _MAX_SCHLUESSEL_LAENGE
        and schluessel == schluessel.strip()
        and all(ord(zeichen) >= 32 and ord(zeichen) != 127 for zeichen in schluessel)
    )


def _normalisiere_json_wert(wert: object, *, pfad: str, tiefe: int = 0) -> JsonWert:
    if tiefe > _MAX_TIEFE:
        raise OperationVertragsfehler(
            "OPERATION_PAYLOAD_ZU_TIEF",
            f"Payload überschreitet die maximale Verschachtelungstiefe {_MAX_TIEFE}.",
            pfad,
        )
    if wert is None or isinstance(wert, (str, bool)):
        return cast(JsonSkalar, wert)
    if isinstance(wert, int):
        return wert
    if isinstance(wert, float):
        raise OperationVertragsfehler(
            "OPERATION_PAYLOAD_FLOAT_VERBOTEN",
            "Fließkommazahlen sind im kanonischen Operationspayload nicht zugelassen.",
            pfad,
        )
    if isinstance(wert, list):
        if len(wert) > _MAX_CONTAINER_EINTRAEGE:
            raise OperationVertragsfehler(
                "OPERATION_PAYLOAD_ZU_GROSS",
                f"Liste überschreitet {_MAX_CONTAINER_EINTRAEGE} Einträge.",
                pfad,
            )
        return [
            _normalisiere_json_wert(eintrag, pfad=f"{pfad}[{index}]", tiefe=tiefe + 1)
            for index, eintrag in enumerate(wert)
        ]
    if isinstance(wert, dict):
        if len(wert) > _MAX_CONTAINER_EINTRAEGE:
            raise OperationVertragsfehler(
                "OPERATION_PAYLOAD_ZU_GROSS",
                f"Objekt überschreitet {_MAX_CONTAINER_EINTRAEGE} Einträge.",
                pfad,
            )
        ergebnis: dict[str, JsonWert] = {}
        for schluessel, eintrag in wert.items():
            if not isinstance(schluessel, str) or not _schluessel_gueltig(schluessel):
                raise OperationVertragsfehler(
                    "OPERATION_PAYLOAD_SCHLUESSEL_UNGUELTIG",
                    "Payload-Schlüssel müssen 1-128 sichtbare Zeichen ohne Rand-Leerraum besitzen.",
                    pfad,
                )
            ergebnis[schluessel] = _normalisiere_json_wert(
                eintrag, pfad=f"{pfad}.{schluessel}", tiefe=tiefe + 1
            )
        return ergebnis
    raise OperationVertragsfehler(
        "OPERATION_PAYLOAD_TYP_UNGUELTIG",
        f"Nicht unterstützter Payload-Typ an {pfad}: {type(wert).__name__}.",
        pfad,
    )


def _kanonisches_json(daten: Mapping[str, object]) -> str:
    normalisiert = _normalisiere_json_wert(dict(daten), pfad="payload")
    if not isinstance(normalisiert, dict):
        raise AssertionError("Payload-Wurzel muss ein Objekt bleiben.")
    text = json.dumps(
        normalisiert,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    )
    if len(text.encode("utf-8")) > _MAX_PAYLOAD_BYTES:
        raise OperationVertragsfehler(
            "OPERATION_PAYLOAD_ZU_GROSS",
            f"Kanonischer Payload überschreitet {_MAX_PAYLOAD_BYTES} Byte.",
            "payload",
        )
    return text


@dataclass(frozen=True, slots=True)
class OperationArt:
    """Typisierter Operationscode ohne vorgezogene Handler- oder Fachsemantik."""

    wert: str

    def __post_init__(self) -> None:
        if _OPERATION_ART_RE.fullmatch(self.wert) is None:
            raise OperationVertragsfehler(
                "OPERATION_ART_UNGUELTIG",
                "OperationArt muss 3-64 Zeichen aus A-Z, 0-9 und _ besitzen.",
                "operation_art",
            )

    @classmethod
    def parse(cls, text: str) -> Self:
        return cls(text)

    def __str__(self) -> str:
        return self.wert


@dataclass(frozen=True, slots=True)
class OperationPayload:
    """Unveränderlicher, kanonischer und größenbegrenzter JSON-Objektpayload."""

    kanonisch_json: str

    def __post_init__(self) -> None:
        try:
            roh = json.loads(self.kanonisch_json)
        except json.JSONDecodeError as exc:
            raise OperationVertragsfehler(
                "OPERATION_PAYLOAD_JSON_UNGUELTIG", str(exc), "payload"
            ) from exc
        if not isinstance(roh, dict):
            raise OperationVertragsfehler(
                "OPERATION_PAYLOAD_WURZEL_UNGUELTIG",
                "Operationspayload muss ein JSON-Objekt als Wurzel besitzen.",
                "payload",
            )
        kanonisch = _kanonisches_json(cast(dict[str, object], roh))
        if kanonisch != self.kanonisch_json:
            raise OperationVertragsfehler(
                "OPERATION_PAYLOAD_NICHT_KANONISCH",
                "Direkt erzeugter OperationPayload muss bereits kanonisch serialisiert sein.",
                "payload",
            )

    @classmethod
    def aus_mapping(cls, daten: Mapping[str, object]) -> Self:
        return cls(_kanonisches_json(daten))

    @classmethod
    def leer(cls) -> Self:
        return cls("{}")

    def als_dict(self) -> dict[str, JsonWert]:
        roh = json.loads(self.kanonisch_json)
        if not isinstance(roh, dict):
            raise AssertionError("Validierter Payload ist unerwartet kein JSON-Objekt.")
        return cast(dict[str, JsonWert], roh)

    def fingerprint_sha256(self) -> str:
        return hashlib.sha256(self.kanonisch_json.encode("utf-8")).hexdigest()


@dataclass(frozen=True, slots=True)
class OperationRequest:
    """Deterministisch serialisierbare Operationsanforderung ohne Ausführungslogik."""

    schema: SchemaVersion
    operation_id: OperationId
    operation_art: OperationArt
    payload: OperationPayload

    TYP: ClassVar[str] = "OPERATION_REQUEST"
    PFLICHTFELDER: ClassVar[frozenset[str]] = frozenset(
        {"typ", "schema", "operation_id", "operation_art", "payload"}
    )

    def __post_init__(self) -> None:
        if self.schema != OPERATION_SCHEMA_VERSION:
            raise OperationVertragsfehler(
                "OPERATION_SCHEMA_INKOMPATIBEL",
                f"OperationRequest benötigt Schema-Version {OPERATION_SCHEMA_VERSION}.",
                "schema",
            )

    @classmethod
    def neu(cls, operation_art: OperationArt, payload: OperationPayload | None = None) -> Self:
        return cls(
            schema=OPERATION_SCHEMA_VERSION,
            operation_id=OperationId.neu(),
            operation_art=operation_art,
            payload=payload or OperationPayload.leer(),
        )

    @classmethod
    def aus_mapping(cls, daten: Mapping[str, object]) -> Self:
        _pruefe_schluessel(daten, erforderlich=cls.PFLICHTFELDER, vertragsname=cls.__name__)
        typ = _text(daten, "typ")
        if typ != cls.TYP:
            raise OperationVertragsfehler(
                "OPERATION_TYP_UNGUELTIG",
                f"OperationRequest erwartet typ={cls.TYP}.",
                "typ",
            )
        payload_roh = daten["payload"]
        if not isinstance(payload_roh, Mapping):
            raise OperationVertragsfehler(
                "OPERATION_PAYLOAD_WURZEL_UNGUELTIG",
                "OperationRequest.payload muss ein Objekt sein.",
                "payload",
            )
        return cls(
            schema=_schema_version(_text(daten, "schema")),
            operation_id=_operation_id(_text(daten, "operation_id")),
            operation_art=_operation_art(_text(daten, "operation_art")),
            payload=OperationPayload.aus_mapping(cast(Mapping[str, object], payload_roh)),
        )

    def als_dict(self) -> dict[str, object]:
        return {
            "typ": self.TYP,
            "schema": str(self.schema),
            "operation_id": str(self.operation_id),
            "operation_art": str(self.operation_art),
            "payload": self.payload.als_dict(),
        }

    def als_json(self) -> str:
        return json.dumps(
            self.als_dict(), ensure_ascii=False, sort_keys=True, separators=(",", ":")
        )

    def fingerprint_sha256(self) -> str:
        return hashlib.sha256(self.als_json().encode("utf-8")).hexdigest()


@dataclass(frozen=True, slots=True)
class OperationResult:
    """Zu einem Request korreliertes Ergebnis auf Basis von OperationErgebnis."""

    schema: SchemaVersion
    operation_id: OperationId
    ergebnis: OperationErgebnis[OperationPayload]

    TYP: ClassVar[str] = "OPERATION_RESULT"
    PFLICHTFELDER: ClassVar[frozenset[str]] = frozenset(
        {"typ", "schema", "operation_id", "erfolgreich", "wert", "fehler"}
    )

    def __post_init__(self) -> None:
        if self.schema != OPERATION_SCHEMA_VERSION:
            raise OperationVertragsfehler(
                "OPERATION_SCHEMA_INKOMPATIBEL",
                f"OperationResult benötigt Schema-Version {OPERATION_SCHEMA_VERSION}.",
                "schema",
            )

    @classmethod
    def erfolg(cls, operation_id: OperationId, wert: OperationPayload | None = None) -> Self:
        return cls(
            schema=OPERATION_SCHEMA_VERSION,
            operation_id=operation_id,
            ergebnis=OperationErgebnis.erfolg(wert or OperationPayload.leer()),
        )

    @classmethod
    def fehlgeschlagen(cls, operation_id: OperationId, fehler: FehlerInfo) -> Self:
        return cls(
            schema=OPERATION_SCHEMA_VERSION,
            operation_id=operation_id,
            ergebnis=OperationErgebnis.fehlgeschlagen(fehler),
        )

    @classmethod
    def aus_mapping(cls, daten: Mapping[str, object]) -> Self:
        _pruefe_schluessel(daten, erforderlich=cls.PFLICHTFELDER, vertragsname=cls.__name__)
        typ = _text(daten, "typ")
        if typ != cls.TYP:
            raise OperationVertragsfehler(
                "OPERATION_TYP_UNGUELTIG",
                f"OperationResult erwartet typ={cls.TYP}.",
                "typ",
            )
        schema = _schema_version(_text(daten, "schema"))
        operation_id = _operation_id(_text(daten, "operation_id"))
        erfolgreich = daten["erfolgreich"]
        if not isinstance(erfolgreich, bool):
            raise OperationVertragsfehler(
                "OPERATION_FELDTYP_UNGUELTIG",
                "Feld erfolgreich muss boolesch sein.",
                "erfolgreich",
            )
        wert_roh = daten["wert"]
        fehler_roh = daten["fehler"]
        if erfolgreich:
            if fehler_roh is not None:
                raise OperationVertragsfehler(
                    "OPERATION_RESULT_WIDERSPRUCH",
                    "Erfolgreiches Result darf keinen Fehler enthalten.",
                    "fehler",
                )
            if not isinstance(wert_roh, Mapping):
                raise OperationVertragsfehler(
                    "OPERATION_RESULT_WERT_UNGUELTIG",
                    "Erfolgreiches Result benötigt einen Objektwert.",
                    "wert",
                )
            return cls(
                schema=schema,
                operation_id=operation_id,
                ergebnis=OperationErgebnis.erfolg(
                    OperationPayload.aus_mapping(cast(Mapping[str, object], wert_roh))
                ),
            )
        if wert_roh is not None:
            raise OperationVertragsfehler(
                "OPERATION_RESULT_WIDERSPRUCH",
                "Fehlgeschlagenes Result darf keinen Wert enthalten.",
                "wert",
            )
        if not isinstance(fehler_roh, Mapping):
            raise OperationVertragsfehler(
                "OPERATION_RESULT_FEHLER_UNGUELTIG",
                "Fehlgeschlagenes Result benötigt strukturierte FehlerInfo.",
                "fehler",
            )
        fehler_mapping = cast(Mapping[str, object], fehler_roh)
        _pruefe_schluessel(
            fehler_mapping,
            erforderlich=frozenset({"klasse", "code", "nachricht"}),
            vertragsname="FehlerInfo",
        )
        klasse_text = _text(fehler_mapping, "klasse")
        try:
            klasse = Fehlerklasse(klasse_text)
            fehler = FehlerInfo(
                klasse=klasse,
                code=_text(fehler_mapping, "code"),
                nachricht=_text(fehler_mapping, "nachricht"),
            )
        except ValueError as exc:
            raise OperationVertragsfehler(
                "OPERATION_RESULT_FEHLER_UNGUELTIG", str(exc), "fehler"
            ) from exc
        return cls(
            schema=schema,
            operation_id=operation_id,
            ergebnis=OperationErgebnis.fehlgeschlagen(fehler),
        )

    def als_dict(self) -> dict[str, object]:
        wert: dict[str, JsonWert] | None = None
        if self.ergebnis.wert is not None:
            wert = self.ergebnis.wert.als_dict()
        fehler: dict[str, str] | None = None
        if self.ergebnis.fehler is not None:
            fehler = self.ergebnis.fehler.als_dict()
        return {
            "typ": self.TYP,
            "schema": str(self.schema),
            "operation_id": str(self.operation_id),
            "erfolgreich": self.ergebnis.erfolgreich,
            "wert": wert,
            "fehler": fehler,
        }

    def als_json(self) -> str:
        return json.dumps(
            self.als_dict(), ensure_ascii=False, sort_keys=True, separators=(",", ":")
        )

    def fingerprint_sha256(self) -> str:
        return hashlib.sha256(self.als_json().encode("utf-8")).hexdigest()

    def korreliert_mit(self, request: OperationRequest) -> bool:
        return self.operation_id == request.operation_id
