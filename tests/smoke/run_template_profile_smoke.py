#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import http.server
import json
import shutil
import threading
import uuid
from pathlib import Path

try:
    from playwright.async_api import Error as PlaywrightError, async_playwright
except ImportError as exc:
    raise SystemExit("Playwright fehlt. Installiere die Entwicklungsabhängigkeiten mit: python3 -m pip install -r requirements.txt") from exc

ROOT = Path(__file__).resolve().parents[2]
BROWSERS = ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable")
DATA_MODULES = [
    "data/template-profiles/offline-html.js",
    "data/template-profiles/linux-desktop.js",
    "data/template-profiles/media-processing.js",
    "data/template-profiles/file-organization.js",
    "data/template-profiles/songwriting-audio.js",
    "data/template-profiles/mobile-pwa.js",
]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def system_browser():
    return next((path for name in BROWSERS if (path := shutil.which(name))), None)


def embedded_html(label: str):
    questions = json.loads((ROOT / "data" / "questions.json").read_text(encoding="utf-8"))
    rules = json.loads((ROOT / "data" / "rules.json").read_text(encoding="utf-8"))
    bootstrap = f'''
window.Provoware = window.Provoware || {{}};
window.__PROVOWARE_TEMPLATE_SMOKE_EMBEDDED__ = true;
window.__PROVOWARE_SMOKE_VIEWPORT__ = {label!r};
const ns = window.Provoware;
const questions = {json.dumps(questions, ensure_ascii=False)};
const ruleCatalog = {json.dumps(rules, ensure_ascii=False)};
let currentState = {{catalog:questions,rules:ruleCatalog.rules,templates:[],prompts:[],answers:Object.fromEntries(questions.questions.map(q=>[q.id,q.recommendedValue])),currentQuestionId:questions.questions[0].id,dataMode:'embedded',validationErrors:[],projectId:'source-project',projectName:'Ausgangsprojekt',projectLifecycle:'active',schemaVersion:'1.2.0',theme:'dark',storageStatus:'ready',revision:1,createdAt:new Date().toISOString()}};
ns.state={{getState(){{return structuredClone(currentState)}},restoreProject(payload,metadata={{}}){{currentState={{...currentState,projectId:payload.projectId,projectName:payload.name,answers:structuredClone(payload.answers),currentQuestionId:payload.currentQuestionId,theme:payload.theme,revision:metadata.revision||1}}}}}};
const projects=new Map([[currentState.projectId,{{payload:{{projectId:currentState.projectId,name:currentState.projectName,answers:structuredClone(currentState.answers)}},revision:1}}]]);let idCounter=0;
function stableStringify(value){{if(Array.isArray(value))return`[${{value.map(stableStringify).join(',')}}]`;if(value&&typeof value==='object')return`{{${{Object.keys(value).sort().map(k=>`${{JSON.stringify(k)}}:${{stableStringify(value[k])}}`).join(',')}}}}`;return JSON.stringify(value)}}
function checksum(value){{let h=2166136261;const text=stableStringify(value);for(let i=0;i<text.length;i++){{h^=text.charCodeAt(i);h=Math.imul(h,16777619)}}return(h>>>0).toString(16).padStart(8,'0')}}
ns.storage={{STORES:{{meta:'meta'}},PROJECT_SCHEMA_VERSION:'1.2.0',checksum,async open(){{return{{}}}},async saveProject(payload,reason){{const previous=projects.get(payload.projectId);const revision=(previous?.revision||0)+1;projects.set(payload.projectId,{{payload:structuredClone(payload),revision,reason}});return{{projectId:payload.projectId,revision,source:'current'}}}}}};
ns.projectRepository={{validateName(value){{const name=String(value||'').trim().replace(/\\s+/g,' ');if(name.length<3)throw new Error('Name zu kurz');if(name.length>80)throw new Error('Name zu lang');return name}},async listProjects(){{return[...projects.entries()].map(([id,r])=>({{id,name:r.payload.name,revision:r.revision,lifecycle:{{state:'active'}}}}))}},createProjectId(){{idCounter+=1;return`template-smoke-${{idCounter}}`}},createBlankPayload({{projectId,name,catalogVersion,currentQuestionId,theme}}){{const now=new Date().toISOString();return{{schemaVersion:'1.2.0',projectId,name,answers:{{}},currentQuestionId,theme,questionCatalogVersion:catalogVersion,createdAt:now,updatedAt:now,lastValidatedAt:now}}}}}};
ns.validation={{validateStoredProject(payload,catalog){{return Object.keys(payload.answers||{{}}).length===catalog.questions.length?[]:['Antworten unvollständig']}}}};
ns.persistence={{async flush(){{}},async openProject(projectId){{const record=projects.get(projectId);if(!record)throw new Error('Projekt fehlt');ns.state.restoreProject(record.payload,{{revision:record.revision}});return record}},async trashProject(projectId){{if(currentState.projectId===projectId)currentState={{...currentState,projectId:'source-project',projectName:'Ausgangsprojekt'}};return{{state:'trash'}}}},async deleteProject(projectId){{projects.delete(projectId);return{{projectId}}}}}};
ns.ready=Promise.resolve();
'''
    scripts = [bootstrap]
    scripts.extend((ROOT / path).read_text(encoding="utf-8") for path in DATA_MODULES)
    scripts.extend((ROOT / path).read_text(encoding="utf-8") for path in [
        "js/rule-engine.js", "js/template-core.js", "js/template-catalog-adapter.js", "js/template-ui.js"
    ])
    scripts.append('''
const records=new Map();const core=window.Provoware.templateProfilesCore;
core.listCustomProfiles=async()=>[...records.values()].map(value=>structuredClone(value));
core.putCustomProfile=async record=>{const now=new Date().toISOString();const normalized={key:`profile:${record.id}`,type:'template-profile',schemaVersion:'1.0.0',id:record.id,baseTemplateId:record.baseTemplateId||null,baseProfileId:record.baseProfileId||null,createdAt:record.createdAt||now,updatedAt:now,profile:structuredClone(record.profile)};records.set(record.id,normalized);return structuredClone(normalized)};
core.deleteCustomProfile=async id=>{records.delete(id);return id};core.saveOrigin=async()=>{};
window.Provoware.templateProfilesUi.boot();
''')
    scripts.append((ROOT / "tests" / "smoke" / "template-profile-smoke.js").read_text(encoding="utf-8"))
    return '<!doctype html><html lang="de"><head><meta charset="utf-8"><style>:root{--border-color:#777;--surface-secondary:#eee;--surface-primary:#fff;--radius-medium:8px;--radius-small:5px;--warning-color:#f90;--danger-color:#900;--success-color:#070}[hidden]{display:none!important}dialog{width:90vw}.button{padding:.4rem}.button-wide{display:block}</style></head><body><button id="project-manager-button">Projekte</button><p id="live-status" role="status"></p>' + ''.join(f'<script>{script}</script>' for script in scripts) + '</body></html>'


async def assert_result(page, label: str, width: int, height: int):
    await page.wait_for_selector('body[data-template-profile-smoke-status]', timeout=30_000)
    status = await page.get_attribute("body", "data-template-profile-smoke-status")
    result = await page.locator("#template-profile-smoke-result").inner_text()
    if status != "passed":
        raise AssertionError(f"{label}: {result}")
    print(f"[OK] Vorlagen-/Profil-Smoke {label}: {width}x{height}\n{result}")


async def run_real(browser_type, executable_path, base_url: str, label: str, width: int, height: int):
    browser = await browser_type.launch(headless=True, executable_path=executable_path, args=["--no-sandbox", "--disable-dev-shm-usage"])
    page = await browser.new_page(viewport={"width": width, "height": height})
    project_id = f"template-smoke-{label}-{uuid.uuid4().hex[:10]}"
    try:
        await page.goto(f"{base_url}/?project={project_id}", wait_until="networkidle", timeout=15_000)
        await page.wait_for_function("window.Provoware && window.Provoware.ready", timeout=10_000)
        await page.wait_for_selector("#template-manager-button", timeout=10_000)
        await page.add_script_tag(content=(ROOT / "tests" / "smoke" / "template-profile-smoke.js").read_text(encoding="utf-8"))
        await assert_result(page, label, width, height)
        return True
    except PlaywrightError as error:
        if "ERR_BLOCKED_BY_ADMINISTRATOR" not in str(error):
            raise
        return False
    finally:
        await browser.close()


async def run_embedded(browser_type, executable_path, label: str, width: int, height: int):
    browser = await browser_type.launch(headless=True, executable_path=executable_path, args=["--no-sandbox", "--disable-dev-shm-usage"])
    page = await browser.new_page(viewport={"width": width, "height": height})
    await page.set_content(embedded_html(label), wait_until="load")
    await assert_result(page, label, width, height)
    await browser.close()


async def async_main(base_url: str):
    executable_path = system_browser()
    async with async_playwright() as playwright:
        for label, width, height in (("desktop", 1440, 1000), ("mobile", 390, 844)):
            real = await run_real(playwright.chromium, executable_path, base_url, label, width, height)
            if not real:
                print(f"[HINWEIS] {label}: lokale Navigation blockiert; eingebetteter Vorlagen-/Profil-Fallback wird geprüft.")
                await run_embedded(playwright.chromium, executable_path, label, width, height)


def main():
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(ROOT), **kwargs)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        asyncio.run(async_main(f"http://127.0.0.1:{server.server_port}"))
    finally:
        server.shutdown(); server.server_close(); thread.join(timeout=2)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
