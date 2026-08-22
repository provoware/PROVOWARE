import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

test("Browser-E2E ist Chromium-first und Firefox bleibt alternativer Lauf", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(
    packageJson.scripts["test:e2e"],
    "playwright test --config=tests/browser/playwright.config.mjs --project=chromium",
  );
  assert.match(packageJson.scripts["test:e2e:firefox"], /--project=firefox$/);
  assert.equal(packageJson.devDependencies["@playwright/test"], "1.62.1");

  const workflow = await read(".github/workflows/browser-e2e.yml");
  assert.match(workflow, /Browser-E2E · Chromium/);
  assert.match(workflow, /npm run test:e2e:chromium/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /firefox-alternative:/);
  assert.match(workflow, /inputs\.firefox == true/);
});

test("HTML-Mirror verwendet zweimal dieselbe echte UI und skaliert nur die zweite Darstellung", async () => {
  const html = await read("tests/browser/ui-mirror.html");
  const css = await read("tests/browser/ui-mirror.css");
  const js = await read("tests/browser/ui-mirror.js");

  assert.equal((html.match(/src="\/index\.html\?ui-mirror=/g) || []).length, 2);
  assert.match(css, /--mirror-width: 1366px/);
  assert.match(css, /--mirror-height: 900px/);
  assert.match(css, /--mirror-scale: 0\.5/);
  assert.match(css, /#mirror-scaled[\s\S]*transform: scale\(var\(--mirror-scale\)\)/);
  assert.match(css, /transform-origin: top left/);
  assert.match(js, /keyGeometryIdentical/);
  assert.match(js, /sameGeometry\(sourceGeometry, scaledGeometry\)/);
  assert.match(js, /provoware:mirror-ready/);
});

test("Browser-E2E arbeitet in isolierter temporärer Projektkopie", async () => {
  const server = await read("scripts/browser-e2e-server.mjs");
  assert.match(server, /mkdtemp\(path\.join\(os\.tmpdir\(\), "provoware-browser-e2e-"\)\)/);
  assert.match(server, /await cp\(ROOT, workspace/);
  assert.match(server, /"--no-browser", "--port=4173"/);
  assert.match(server, /PROVOWARE_E2E: "1"/);
});
