import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

test("Modulkatalog registriert Recovery 0.4.1 getrennt vom Data Studio", async () => {
  const source = await read("modules/registry.js");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: "modules/registry.js", timeout: 1000 });
  const byId = new Map(sandbox.window.PROVOWARE_MODULE_CATALOG.map((manifest) => [manifest.id, manifest]));

  assert.equal(byId.get("data-studio")?.version, "0.4.0");
  assert.equal(byId.get("data-recovery")?.version, "0.4.1");
  assert.equal(byId.get("data-recovery")?.entry, "modules/data-recovery/index.js");
  assert.deepEqual([...byId.get("data-recovery").slots], ["details"]);
});

test("Recovery-UI erzwingt Vorschau vor Restore und Import", async () => {
  const source = await read("modules/data-recovery/index.js");
  assert.match(source, /\/preview-backup/);
  assert.match(source, /expectedSha256/);
  assert.match(source, /\/preview-import/);
  assert.match(source, /data-action="confirm-restore" disabled/);
  assert.match(source, /data-action="confirm-import" disabled/);
  assert.match(source, /window\.confirm/);
  assert.match(source, /URL\.createObjectURL/);
  assert.match(source, /type="file"/);
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
});

test("Recovery-UI degradiert bei file:// kontrolliert", async () => {
  const source = await read("modules/data-recovery/index.js");
  assert.match(source, /window\.location\.protocol === "file:"/);
  assert.match(source, /Klick-&-Start-Server/);
  assert.match(source, /root\.querySelectorAll\("button, input"\)/);
});

test("Recovery-Pflichtdateien existieren als eigener überprüfbarer Strang", async () => {
  for (const file of [
    "scripts/project-data-recovery.mjs",
    "modules/data-recovery/index.js",
    "tests/project-data-recovery.test.mjs",
    "tests/project-data-recovery-api.test.mjs",
    "docs/PLAN_0.4.1_RECOVERY_MIGRATION.md",
    "docs/CHECKPOINT_0.4.1_RECOVERY_MIGRATION.md",
    "docs/CHECKLIST_0.4.1_RECOVERY_MIGRATION.md",
  ]) {
    assert.ok((await read(file)).length > 0, `${file} fehlt oder ist leer.`);
  }
});
