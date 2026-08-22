import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROBE = path.join(ROOT, "modules", ".lint-probe.js");

test("Projekt-Linter erkennt verbotene dynamische Codeausführung", async () => {
  const forbiddenCall = ["ev", "al('1 + 1')"].join("");
  await writeFile(PROBE, `(() => { 'use strict'; ${forbiddenCall}; })();\n`, "utf8");
  try {
    const result = spawnSync(process.execPath, ["scripts/project-lint.mjs"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /PROJECT LINT: FEHLER/);
    assert.match(result.stderr, /dynamische Codeausführung|eval/);
  } finally {
    await rm(PROBE, { force: true });
  }
});
