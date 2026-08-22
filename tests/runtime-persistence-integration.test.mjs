import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

test("Project Data und Data Studio PRO delegieren auf denselben Runtime-Persistence-Vertrag", async () => {
  const projectData = await read("scripts/project-data-service.mjs");
  const pro = await read("scripts/data-studio-pro-service.mjs");

  for (const [name, source] of [["Project Data", projectData], ["Data Studio PRO", pro]]) {
    assert.match(source, /import \{ atomicReplaceFile \} from "\.\/runtime-persistence\.mjs";/, `${name}: gemeinsamer Import fehlt.`);
    assert.match(source, /await atomicReplaceFile\(\{/, `${name}: Delegation fehlt.`);
    assert.doesNotMatch(source, /\brename\s*\(/, `${name}: eigener rename-Aufruf ist nicht mehr erlaubt.`);
    assert.doesNotMatch(source, /\.tmp-\$\{process\.pid\}/, `${name}: eigene Temp-Pfadlogik ist nicht mehr erlaubt.`);
  }
});

test("Runtime-Persistence bleibt fail-closed ohne unlink-target-Rename-Fallback", async () => {
  const source = await read("scripts/runtime-persistence.mjs");
  assert.match(source, /flag: "wx"/);
  assert.match(source, /TRANSIENT_REPLACE_CODES = new Set\(\["EBUSY", "EPERM"\]\)/);
  assert.match(source, /if \(tempCreated\) await removeTemp\(tempPath\)/);
  assert.doesNotMatch(source, /removeTemp\(targetPath\)|unlink\(targetPath\)/);
  assert.doesNotMatch(source, /unlink[\s\S]{0,120}rename|removeTemp[\s\S]{0,120}replace\(tempPath, targetPath\)/);
});

test("beide Fachwriter erhalten den bestehenden beforeRename-Failpoint-Vertrag", async () => {
  const projectData = await read("scripts/project-data-service.mjs");
  const pro = await read("scripts/data-studio-pro-service.mjs");
  assert.match(projectData, /beforeRename\(\{ tempPath, filePath: targetPath, database \}\)/);
  assert.match(pro, /beforeRename\(\{ tempPath, filePath: targetPath, stored \}\)/);
});
