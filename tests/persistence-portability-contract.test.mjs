import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

test("Portability-Vertrag besitzt zentrale Atomic-Dateischicht ohne Ziel-Unlink-Fallback", async () => {
  const source = await read("scripts/atomic-file.mjs");
  assert.match(source, /export const atomicReplaceFile/);
  assert.match(source, /await handle\.sync\(\)/);
  assert.match(source, /path\.dirname\(tempPath\) !== path\.dirname\(normalizedPath\)/);
  assert.match(source, /platform === "win32"/);
  assert.match(source, /EPERM/);
  assert.match(source, /EACCES/);
  assert.match(source, /EBUSY/);
  assert.doesNotMatch(source, /unlinkFn\(normalizedPath\)|unlink\(normalizedPath\)/);
});

test("Project Data und Data Studio PRO delegieren ihre Writer an dieselbe Atomic-Schicht", async () => {
  const projectData = await read("scripts/project-data-service.mjs");
  const dataStudioPro = await read("scripts/data-studio-pro-service.mjs");

  for (const [name, source] of [
    ["Project Data", projectData],
    ["Data Studio PRO", dataStudioPro],
  ]) {
    assert.match(source, /from "\.\/atomic-file\.mjs"/);
    assert.match(source, /await atomicReplaceFile\(filePath, source/);
    assert.doesNotMatch(source, /await rename\(tempPath, filePath\)/, `${name} darf keinen eigenen Rename-Pfad behalten.`);
    assert.doesNotMatch(source, /await writeFile\(tempPath/, `${name} darf keinen eigenen Temp-Writer behalten.`);
  }

  assert.match(projectData, /beforeRename\(\{[\s\S]*database/);
  assert.match(dataStudioPro, /beforeRename\(\{[\s\S]*stored/);
});

test("Portability-CI prüft Linux und Windows mit Node 20 ohne Runtime-Abhängigkeiten", async () => {
  const workflow = await read(".github/workflows/persistence-portability.yml");
  assert.match(workflow, /name: Persistence Portability Gate/);
  assert.match(workflow, /ubuntu-latest/);
  assert.match(workflow, /windows-latest/);
  assert.match(workflow, /node-version: "20"/);
  assert.match(workflow, /tests\/atomic-file\.test\.mjs/);
  assert.match(workflow, /tests\/project-data-recovery\.test\.mjs/);
  assert.match(workflow, /tests\/data-studio-pro-service\.test\.mjs/);
  assert.doesNotMatch(workflow, /npm install|npm ci/);
});

test("H1-Plan hält Schema, Backupformat und UI ausdrücklich unverändert", async () => {
  const plan = await read("docs/PLAN_0.4.2_H1_PERSISTENCE_PORTABILITY.md");
  assert.match(plan, /keine Änderung am Project-Data-Schema v1/);
  assert.match(plan, /keine Änderung am Data-Studio-PRO-Schema v1/);
  assert.match(plan, /keine Änderung des `\.pwbak`-Formats/);
  assert.match(plan, /kein Recovery Envelope/);
  assert.match(plan, /keine UI-Funktion/);
});
