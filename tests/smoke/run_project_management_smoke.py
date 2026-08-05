#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import http.server
import re
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
SCRIPT_ORDER = [
    "js/migration-engine.js", "js/storage-engine.js", "js/project-repository.js",
    "js/project-transfer.js", "js/state-manager.js", "js/workflow-engine.js",
    "js/rule-engine.js", "js/validation-engine.js", "js/report-generator.js",
    "js/ui/app-ui.js", "js/accessibility.js", "js/project-manager.js",
    "js/project-transfer-manager.js", "js/report-manager.js", "js/storage-manager.js",
    "js/app.js", "tests/smoke/project-management-smoke.js"
]
STYLE_ORDER = [
    "css/variables.css", "css/themes.css", "css/layout.css", "css/components.css",
    "css/project-manager.css", "css/project-transfer.css"
]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def system_browser():
    for candidate in BROWSERS:
        path = shutil.which(candidate)
        if path:
            return path
    return None


def embedded_html(label: str, project_id: str):
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = re.sub(r'<link rel="stylesheet"[^>]+>', "", html)
    html = re.sub(r'<script defer src="[^"]+"></script>', "", html)
    styles = "\n".join((ROOT / path).read_text(encoding="utf-8") for path in STYLE_ORDER)
    bootstrap = (
        "window.__PROVOWARE_PROJECT_SMOKE_EMBEDDED__ = true;"
        f"window.__PROVOWARE_SMOKE_VIEWPORT__ = {label!r};"
        f"window.__PROVOWARE_SMOKE_PROJECT__ = {project_id!r};"
    )
    scripts = [bootstrap] + [(ROOT / path).read_text(encoding="utf-8") for path in SCRIPT_ORDER]
    html = html.replace("</head>", f"<style>{styles}</style></head>")
    return html.replace("</body>", "".join(f"<script>{script}</script>" for script in scripts) + "</body>")


async def assert_result(page, label: str, width: int, height: int):
    await page.wait_for_selector('body[data-project-smoke-status]', timeout=25_000)
    status = await page.get_attribute("body", "data-project-smoke-status")
    result = await page.locator("#project-smoke-result").inner_text()
    if status != "passed":
        raise AssertionError(f"{label}: {result}")
    print(f"[OK] Mehrprojekt-Smoke {label}: {width}x{height}\n{result}")


async def run_embedded(browser_type, executable_path, label: str, width: int, height: int):
    browser = await browser_type.launch(
        headless=True,
        executable_path=executable_path,
        args=["--no-sandbox", "--disable-dev-shm-usage"],
    )
    page = await browser.new_page(viewport={"width": width, "height": height})
    project_id = f"project-smoke-{label}-{uuid.uuid4().hex[:10]}"
    await page.set_content(embedded_html(label, project_id), wait_until="load")
    await assert_result(page, label, width, height)
    await browser.close()


async def run_real(browser_type, executable_path, base_url: str, label: str, width: int, height: int):
    browser = await browser_type.launch(
        headless=True,
        executable_path=executable_path,
        args=["--no-sandbox", "--disable-dev-shm-usage"],
    )
    page = await browser.new_page(viewport={"width": width, "height": height})
    project_id = f"project-smoke-{label}-{uuid.uuid4().hex[:10]}"
    try:
        await page.goto(
            f"{base_url}/?project={project_id}",
            wait_until="networkidle",
            timeout=15_000,
        )
        await page.wait_for_function("window.Provoware && window.Provoware.ready", timeout=10_000)
        await page.add_script_tag(content=(ROOT / "tests" / "smoke" / "project-management-smoke.js").read_text(encoding="utf-8"))
        await assert_result(page, label, width, height)
        return True
    except PlaywrightError as error:
        if "ERR_BLOCKED_BY_ADMINISTRATOR" not in str(error):
            raise
        return False
    finally:
        await browser.close()


async def async_main(base_url: str):
    executable_path = system_browser()
    async with async_playwright() as playwright:
        for label, width, height in (("desktop", 1440, 1000), ("mobile", 390, 844)):
            real = await run_real(playwright.chromium, executable_path, base_url, label, width, height)
            if not real:
                print(f"[HINWEIS] {label}: lokale Navigation administrativ blockiert; eingebetteter Mehrprojekt-Fallback wird geprüft.")
                await run_embedded(playwright.chromium, executable_path, label, width, height)


def main():
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(ROOT), **kwargs)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        asyncio.run(async_main(f"http://127.0.0.1:{server.server_port}"))
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
