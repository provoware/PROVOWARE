import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="Node.js ist für den Berichtsgenerator-Vertragstest erforderlich.")


def run_report_contract():
    script = r'''
const fs = require("fs");
global.window = { Provoware: {} };
global.structuredClone = global.structuredClone || (value => JSON.parse(JSON.stringify(value)));
eval(fs.readFileSync("js/report-generator.js", "utf8"));

const catalog = {
  catalogVersion: "1.0.0",
  phases: [
    { id: "project", title: "Projektkern" },
    { id: "platform", title: "Plattform" }
  ],
  questions: [
    {
      id: "project.scope", phaseId: "project", required: true, title: "Wie groß ist der Startumfang?",
      why: "Ein begrenzter Umfang reduziert Fehler.", example: "Ein vollständiger Kern.", recommendation: "Klein starten.",
      options: [{ value: "minimal", label: "Minimaler Kern", description: "Ein vollständiger kleiner Ablauf." }]
    },
    {
      id: "platform.offline", phaseId: "platform", required: true, title: "Muss der Kern offline laufen?",
      why: "Offline-Nutzung bestimmt Abhängigkeiten.", example: "Keine CDN-Pflicht.", recommendation: "Kern offline halten.",
      options: [{ value: "yes", label: "Ja", description: "Keine Netzpflicht." }]
    }
  ]
};
const state = {
  catalog,
  answers: { "project.scope": "minimal" },
  projectId: "report-test",
  projectName: "Berichtstest",
  schemaVersion: "1.2.0",
  revision: 7
};
const model = window.Provoware.report.createReportModel(state, [], { generatedAt: "2026-08-05T00:00:00Z" });
const errors = window.Provoware.report.validateReportModel(model);
if (errors.length) throw new Error(errors.join(" "));
if (model.requirements.length !== 1) throw new Error("Genau eine Anforderung erwartet.");
if (model.testCases.length !== 2) throw new Error("Normal- und Fehlerfall erwartet.");
if (model.openDecisions.length !== 1) throw new Error("Eine offene Entscheidung erwartet.");
if (model.traceability[0].testCaseIds.length !== 2) throw new Error("Rückverfolgbarkeit unvollständig.");

const markdown = window.Provoware.report.renderMarkdown(model);
const text = window.Provoware.report.renderText(model);
const html = window.Provoware.report.renderHtml(model);
const jsonReport = JSON.parse(window.Provoware.report.renderJson(model));
if (!markdown.includes("## Abnahmekriterien") || !markdown.includes("## Rückverfolgbarkeit")) throw new Error("Markdown unvollständig.");
if (!text.includes("TESTFÄLLE") || !text.includes("OFFENE ENTSCHEIDUNGEN")) throw new Error("TXT unvollständig.");
if (!html.startsWith("<!doctype html>") || html.includes("http://") || html.includes("https://")) throw new Error("HTML ist nicht eigenständig offline.");
if (jsonReport.modelVersion !== "1.0.0") throw new Error("JSON-Modellversion falsch.");
if (![markdown, text, html].every(output => output.includes("REQ-001"))) throw new Error("Formatübergreifende Kennung fehlt.");
console.log(JSON.stringify({ requirements: 1, tests: 2, openDecisions: 1, formats: 4 }));
'''
    completed = subprocess.run(
        [NODE, "-e", script],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed.stdout)


def test_common_report_model_and_all_renderers():
    result = run_report_contract()
    assert result == {"requirements": 1, "tests": 2, "openDecisions": 1, "formats": 4}


def test_report_manager_exposes_prevalidation_and_all_downloads():
    source = (ROOT / "js" / "report-manager.js").read_text(encoding="utf-8")
    assert "validateReportModel" in source
    assert "createObjectURL" in source
    for format_name in ("markdown", "html", "text", "json"):
        assert f"{format_name}:" in source
