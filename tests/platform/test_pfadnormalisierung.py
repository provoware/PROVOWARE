from __future__ import annotations

from provoware.plattform import PfadStatus, pruefe_projektpfad


def test_relativer_pfad_innerhalb_wird_normalisiert() -> None:
    ergebnis = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "daten/./wissen.json",
        symlink_frei=True,
    )
    assert ergebnis.status is PfadStatus.INNERHALB
    assert ergebnis.normalisiert == "/srv/provoware/projekt/daten/wissen.json"
    assert ergebnis.relativ_zur_wurzel == "daten/wissen.json"


def test_absoluter_pfad_innerhalb_wird_akzeptiert() -> None:
    ergebnis = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "/srv/provoware/projekt/daten/wissen.json",
        symlink_frei=True,
    )
    assert ergebnis.status is PfadStatus.INNERHALB
    assert ergebnis.relativ_zur_wurzel == "daten/wissen.json"


def test_parent_traversal_wird_fail_closed_blockiert() -> None:
    ergebnis = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "daten/../../geheim.txt",
        symlink_frei=True,
    )
    assert ergebnis.status is PfadStatus.BLOCKIERT
    assert ergebnis.normalisiert is None


def test_praefixaehnlicher_geschwisterpfad_ist_nicht_innerhalb() -> None:
    ergebnis = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "/srv/provoware/projekt-alt/daten.json",
        symlink_frei=True,
    )
    assert ergebnis.status is PfadStatus.BLOCKIERT


def test_leere_eingabe_wird_blockiert() -> None:
    ergebnis = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "   ",
        symlink_frei=True,
    )
    assert ergebnis.status is PfadStatus.BLOCKIERT
    assert ergebnis.normalisiert is None


def test_ungueltige_projektwurzel_bleibt_unbekannt() -> None:
    ergebnis = pruefe_projektpfad("projekt", "daten.json", symlink_frei=True)
    assert ergebnis.status is PfadStatus.UNBEKANNT


def test_unbekannte_symlink_sicherheit_qualifiziert_nicht_innerhalb() -> None:
    ergebnis = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "daten/wissen.json",
        symlink_frei=None,
    )
    assert ergebnis.status is PfadStatus.UNBEKANNT


def test_erkanntes_symlink_risiko_wird_blockiert() -> None:
    ergebnis = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "daten/wissen.json",
        symlink_frei=False,
    )
    assert ergebnis.status is PfadStatus.BLOCKIERT


def test_tilde_semantik_wird_nicht_implizit_expandiert() -> None:
    ergebnis = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "~/wissen.json",
        symlink_frei=True,
    )
    assert ergebnis.status is PfadStatus.BLOCKIERT


def test_gleiche_eingaben_erzeugen_gleichen_fingerprint() -> None:
    a = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "daten/wissen.json",
        symlink_frei=True,
    )
    b = pruefe_projektpfad(
        "/srv/provoware/projekt",
        "daten/wissen.json",
        symlink_frei=True,
    )
    assert a == b
    assert len(a.fingerprint_sha256) == 64
