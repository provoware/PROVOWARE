import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

test("Modulkatalog registriert Data Studio PRO 0.4.2 und getrennte Navigationsbrücke", async () => {
  const source = await read("modules/registry.js");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: "modules/registry.js", timeout: 1000 });
  const byId = new Map(sandbox.window.PROVOWARE_MODULE_CATALOG.map((manifest) => [manifest.id, manifest]));

  assert.equal(byId.get("data-studio")?.version, "0.4.0");
  assert.equal(byId.get("data-studio-pro")?.version, "0.4.2");
  assert.equal(byId.get("data-studio-pro")?.enabledByDefault, true);
  assert.deepEqual(
    [...byId.get("data-studio-pro").capabilities],
    ["record-search", "template-library", "categories", "template-export", "saved-views"],
  );
  assert.equal(byId.get("data-studio-pro-bridge")?.version, "0.4.2");
  assert.equal(byId.get("data-studio-pro-bridge")?.enabledByDefault, true);
});

test("PRO-Oberfläche enthält Suche, Filter, Kategorien, Bibliothek, Export und gespeicherte Ansichten ohne Browser-Zweitpersistenz", async () => {
  const source = await read("modules/data-studio-pro/index.js");
  for (const marker of [
    "data-pro-library-search",
    "data-pro-library-category",
    "data-pro-record-search",
    "data-pro-record-template",
    "data-pro-record-category",
    "data-pro-record-sort",
    "data-pro-category-name",
    "data-pro-template-category",
    "data-pro-view-name",
    "data-pro-saved-view",
    "export-template",
  ]) {
    assert.ok(source.includes(marker), `${marker} fehlt.`);
  }
  assert.match(source, /provoware-data-studio-template/);
  assert.match(source, /formatVersion: 1/);
  assert.match(source, /provoware:data-studio-refreshed/);
  assert.match(source, /window\.location\.protocol === "file:"/);
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
});

test("PRO-Brücke navigiert ohne CRUD-Duplikation und koppelt PRO an die Data-Studio-Revision", async () => {
  const source = await read("modules/data-studio-pro-bridge/index.js");
  assert.match(source, /provoware:data-studio-open-template/);
  assert.match(source, /provoware:data-studio-open-record/);
  assert.match(source, /provoware:data-studio-refreshed/);
  assert.match(source, /data-data-studio-revision/);
  assert.match(source, /new MutationObserver/);
  assert.match(source, /data-template-select/);
  assert.match(source, /button\[data-action='edit-record'\]/);
  assert.match(source, /button\.click\(\)/);
  assert.doesNotMatch(source, /fetch\s*\(/);
});

test("lokaler Server routet PRO-API vor statischer Auslieferung und schützt Runtime-Datei", async () => {
  const source = await read("scripts/start.mjs");
  assert.match(source, /handleDataStudioProApi/);
  assert.match(source, /if \(await handleDataStudioProApi\(anfrage, antwort, \{ root: ROOT \}\)\) return;/);
  assert.match(source, /isProtectedDataStudioProPath/);
  assert.match(source, /DATA_STUDIO_PRO_RELATIVE_PATH/);

  const ignore = await read("data/.gitignore");
  assert.match(ignore, /^data-studio-pro\.json$/m);
  assert.match(ignore, /^data-studio-pro\.json\.tmp-\*$/m);
});

test("PRO-Darstellung bleibt container-responsiv statt an Browserbreite gekoppelt", async () => {
  const css = await read("assets/project-data.css");
  assert.match(css, /\.data-studio \{[\s\S]*container-type: inline-size/);
  assert.match(css, /\.data-studio-pro-filter-grid/);
  assert.match(css, /@container \(min-width: 520px\)/);
  assert.match(css, /@container \(min-width: 760px\)/);
});
