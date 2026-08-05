from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = "0.8.0"


def test_runtime_build_release_and_transfer_versions_match():
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    build = (ROOT / "scripts" / "build.py").read_text(encoding="utf-8")
    release = (ROOT / "scripts" / "release.py").read_text(encoding="utf-8")
    transfer = (ROOT / "js" / "project-transfer.js").read_text(encoding="utf-8")
    readme = (ROOT / "README.md").read_text(encoding="utf-8")

    assert f"Offline-Prototyp {VERSION}" in index
    assert f'"buildVersion": "{VERSION}"' in build
    assert f"PROVOWARE_Entwicklungsplan_Prototyp_{VERSION}" in release
    assert f'createPackage(state, applicationVersion = "{VERSION}")' in transfer
    assert f"**Version:** {VERSION}" in readme
