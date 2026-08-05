#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import http.server
import shutil
import threading
import uuid
from pathlib import Path

try:
    from playwright.async_api import Error as PlaywrightError, async_playwright
except ImportError as exc:
    raise SystemExit("Playwright fehlt. Installiere: python3 -m pip install -r requirements.txt") from exc

ROOT = Path(__file__).resolve().parents[2]
BROWSERS = ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable")
SCRIPTS = ["js/migration-engine.js", "js/storage-engine.js", "tests/smoke/storage-failure-smoke.js"]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def system_browser():
    return next((path for name in BROWSERS if (path := shutil.which(name))), None)


def embedded_html(project_id: str):
    scripts = [
        "window.Provoware = {}; window.__PROVOWARE_TESTING__ = true;",
        "window.__PROVOWARE_FAILURE_EMBEDDED__ = true;",
        f"window.__PROVOWARE_FAILURE_PROJECT__ = {project_id!r};",
        *[(ROOT / path).read_text(encoding="utf-8") for path in SCRIPTS],
    ]
    return "<!doctype html><html><body>" + "".join(f"<script>{script}</script>" for script in scripts) + "</body></html>"


async def assert_result(page):
    await page.wait_for_selector('body[data-storage-failure-status]', timeout=20_000)
    status = await page.get_attribute("body", "data-storage-failure-status")
    result = await page.locator("#storage-failure-result").inner_text()
    if status != "passed":
        raise AssertionError(result)
    print(f"[OK] Speicher-Fehlerszenarien\n{result}")


async def run_real(browser_type, executable_path, base_url: str, project_id: str):
    browser = await browser_type.launch(headless=True, executable_path=executable_path, args=["--no-sandbox", "--disable-dev-shm-usage"])
    page = await browser.new_page()
    try:
        await page.goto(f"{base_url}/tests/smoke/failure-harness.html?project={project_id}", wait_until="networkidle", timeout=15_000)
        await assert_result(page)
        return True
    except PlaywrightError as error:
        if "ERR_BLOCKED_BY_ADMINISTRATOR" not in str(error):
            raise
        return False
    finally:
        await browser.close()


async def run_embedded(browser_type, executable_path, project_id: str):
    browser = await browser_type.launch(headless=True, executable_path=executable_path, args=["--no-sandbox", "--disable-dev-shm-usage"])
    page = await browser.new_page()
    await page.set_content(embedded_html(project_id), wait_until="load")
    await assert_result(page)
    await browser.close()


async def async_main(base_url: str):
    project_id = f"failure-smoke-{uuid.uuid4().hex[:10]}"
    async with async_playwright() as playwright:
        real = await run_real(playwright.chromium, system_browser(), base_url, project_id)
        if not real:
            print("[HINWEIS] Lokale Navigation blockiert; reine Migrations- und Fehlerlogik wird eingebettet geprüft.")
            await run_embedded(playwright.chromium, system_browser(), project_id)


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
