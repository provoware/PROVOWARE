import { cp, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXCLUDED_SEGMENTS = new Set([
  ".git",
  "node_modules",
  "playwright-report",
  "test-results",
  "artifacts",
]);

const relativeParts = (source) => path.relative(ROOT, source).split(path.sep).filter(Boolean);
const shouldCopy = (source) => !relativeParts(source).some((part) => EXCLUDED_SEGMENTS.has(part));

const workspace = await mkdtemp(path.join(os.tmpdir(), "provoware-browser-e2e-"));
let child = null;
let cleaning = false;

const cleanup = async () => {
  if (cleaning) return;
  cleaning = true;
  if (child && !child.killed) child.kill("SIGTERM");
  await rm(workspace, { recursive: true, force: true }).catch(() => {});
};

const shutdown = (signal) => {
  void cleanup().finally(() => {
    process.exitCode = signal === "SIGINT" ? 130 : 143;
  });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

try {
  await cp(ROOT, workspace, {
    recursive: true,
    force: true,
    filter: shouldCopy,
  });

  child = spawn(process.execPath, ["scripts/start.mjs", "--no-browser", "--port=4173"], {
    cwd: workspace,
    env: {
      ...process.env,
      PROVOWARE_E2E: "1",
    },
    stdio: ["ignore", "inherit", "inherit"],
  });

  child.once("error", (error) => {
    console.error(`[BROWSER-E2E] Serverstart fehlgeschlagen: ${error.message}`);
  });

  const exitCode = await new Promise((resolve) => {
    child.once("exit", (code, signal) => {
      if (signal) resolve(1);
      else resolve(code ?? 0);
    });
  });
  await cleanup();
  process.exitCode = exitCode;
} catch (error) {
  console.error(`[BROWSER-E2E] Testumgebung fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}`);
  await cleanup();
  process.exitCode = 1;
}
