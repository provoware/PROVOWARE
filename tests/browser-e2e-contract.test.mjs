import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

test("Browser-E2E bleibt Chromium-first und läuft nur im manuellen Release-Gate", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(
    packageJson.scripts["test:e2e"],
    "playwright test --config=tests/browser/playwright.config.mjs --project=chromium",
  );
  assert.match(packageJson.scripts["test:e2e:firefox"], /--project=firefox$/);
  assert.equal(packageJson.devDependencies["@playwright/test"], "1.62.1");

  const workflow = await read(".github/workflows/browser-e2e.yml");
  assert.match(workflow, /name: Browser E2E Release Gate/);
  assert.match(workflow, /Browser-E2E · Chromium/);
  assert.match(workflow, /npm run test:e2e:chromium/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s*pull_request\s*:/m);
  assert.doesNotMatch(workflow, /^\s*push\s*:/m);
  assert.match(workflow, /firefox-alternative:/);
  assert.match(workflow, /inputs\.firefox == true/);
});

test("E2E-Metadaten halten Chromium, PRO und Recovery-Envelope-Verträge kanonisch fest", async () => {
  const version = JSON.parse(await read("VERSION.json"));
  assert.equal(version.version, "0.2.0");
  assert.equal(version.project_data_schema_version, "1");
  assert.equal(version.data_studio_pro_schema_version, "1");
  assert.equal(version.data_studio_pro_store, "data/data-studio-pro.json");
  assert.equal(version.recovery_envelope_format_version, "1");
  assert.equal(version.recovery_envelope_store, "data/backups/project-envelope/*.pwenvelope");
  assert.equal(version.recovery_envelope_journal, "data/recovery/recovery-envelope-journal.json");
  assert.equal(version.persistence_atomic_writer, "scripts/atomic-file.mjs");
  assert.equal(version.browser_e2e_primary, "chromium");
  assert.equal(version.browser_e2e_alternative, "firefox");
  assert.equal(version.ui_mirror_layout_viewport, "1366x900");
  assert.equal(version.ui_mirror_scale, 0.5);
});

test("Chromium-Spec enthält echten Multi-Datei-Envelope-Restore mit Journal-Abschluss", async () => {
  const spec = await read("tests/browser/project-data.e2e.spec.mjs");
  assert.match(spec, /Recovery Envelope: Project Data und PRO werden als ein journalisierter Zustand wiederhergestellt/);
  assert.match(spec, /data-action='create-envelope'/);
  assert.match(spec, /data-action='confirm-envelope-restore'/);
  assert.match(spec, /data-envelope-journal/);
  assert.match(spec, /08-recovery-envelope-restored\.png/);
  assert.match(spec, /categoryBefore/);
  assert.match(spec, /categoryAfter/);
});

test("HTML-Mirror wartet auf fertige Recovery-/PRO-States und vergleicht stabile Geometrie", async () => {
  const html = await read("tests/browser/ui-mirror.html");
  const css = await read("tests/browser/ui-mirror.css");
  const js = await read("tests/browser/ui-mirror.js");

  assert.equal((html.match(/src="\/index\.html\?ui-mirror=/g) || []).length, 2);
  assert.match(css, /--mirror-width: 1366px/);
  assert.match(css, /--mirror-height: 900px/);
  assert.match(css, /--mirror-scale: 0\.5/);
  assert.match(css, /#mirror-scaled[\s\S]*transform: scale\(var\(--mirror-scale\)\)/);
  assert.match(css, /transform-origin: top left/);
  assert.match(js, /\.data-studio-pro/);
  assert.match(js, /\.data-recovery/);
  assert.match(js, /data-data-studio-status/);
  assert.match(js, /data-data-studio-pro-status/);
  assert.match(js, /data-recovery-status/);
  assert.match(js, /readyText\(recoveryStatus\)/);
  assert.match(js, /waitForStableGeometry/);
  assert.match(js, /geometryDifferences/);
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

test("Project-Data-UI bleibt container-responsiv und schützt klickbare Bereiche vor Überlagerung", async () => {
  const css = await read("assets/project-data.css");
  assert.match(css, /\.data-studio\s*\{[\s\S]*container-type: inline-size/);
  assert.match(css, /\.data-studio-grid\s*\{[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /@container \(min-width: 760px\)[\s\S]*\.data-studio-grid[\s\S]*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\)/);
  assert.match(css, /scroll-margin-top: 84px/);
});
