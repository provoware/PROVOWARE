import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

test("Modulkatalog enthält beide Project-Data-Module als 0.4.0", async () => {
  const source = await read("modules/registry.js");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: "modules/registry.js", timeout: 1000 });

  const catalog = sandbox.window.PROVOWARE_MODULE_CATALOG;
  const byId = new Map(catalog.map((manifest) => [manifest.id, manifest]));
  assert.equal(byId.get("development-notes")?.version, "0.4.0");
  assert.equal(byId.get("development-notes")?.enabledByDefault, true);
  assert.equal(byId.get("data-studio")?.version, "0.4.0");
  assert.equal(byId.get("data-studio")?.enabledByDefault, true);
});

test("Schnellnotizvertrag enthält feste Datei, API und Form-Submit für Button oder Enter", async () => {
  const source = await read("modules/development-notes/index.js");
  assert.match(source, /data\/ENTWICKLUNGSNOTIZEN\.txt/);
  assert.match(source, /\/api\/provoware\/development-notes/);
  assert.match(source, /addEventListener\("submit"/);
  assert.match(source, /window\.location\.protocol === "file:"/);
});

test("Data Studio bietet alle vorgesehenen Feldtypen und keine Browser-Zweitpersistenz", async () => {
  const source = await read("modules/data-studio/index.js");
  for (const type of ["text", "textarea", "number", "date", "checkbox", "select"]) {
    assert.ok(source.includes(`["${type}",`), `Feldtyp ${type} fehlt.`);
  }
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
  assert.match(source, /data-action=\"save-template\"/);
  assert.match(source, /data-action=\"save-record\"/);
  assert.match(source, /data-action=\"edit-record\"/);
  assert.match(source, /data-action=\"delete-record\"/);
});

test("HTML lädt Project-Data-Styles ohne bestehende Scriptreihenfolge zu ersetzen", async () => {
  const html = await read("index.html");
  assert.match(html, /href="assets\/project-data\.css"/);
  const registry = html.indexOf("modules/registry.js");
  const moduleRuntime = html.indexOf("assets/module-registry.js");
  const app = html.indexOf("assets/app.js");
  assert.ok(registry >= 0 && registry < moduleRuntime && moduleRuntime < app);
});
