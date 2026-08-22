import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_PATH = "scripts/project-lint.mjs";
const IGNORED_DIRECTORIES = new Set([".git", "node_modules"]);
const JAVASCRIPT_EXTENSIONS = new Set([".js", ".mjs"]);

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else files.push(fullPath);
  }
  return files;
};

const relative = (filePath) => path.relative(ROOT, filePath).split(path.sep).join("/");

export const lintSource = (filePath, source) => {
  const rel = relative(filePath);
  const errors = [];
  const browserCode = rel.startsWith("assets/") || rel.startsWith("modules/");
  const projectDataModule = rel.startsWith("modules/data-studio/")
    || rel.startsWith("modules/development-notes/");

  // Die Regelspezifikation enthält ihre Suchmuster selbst und wird deshalb nicht
  // mit den textbasierten Policy-Regeln gegen sich selbst geprüft. Syntax und
  // Format dieser Datei bleiben weiterhin Teil des separaten Quality Gates.
  if (rel !== SELF_PATH) {
    const forbidden = [
      [/(^|[^\w])eval\s*\(/, "eval() ist im Projektcode nicht erlaubt."],
      [/new\s+Function\s*\(/, "new Function() ist im Projektcode nicht erlaubt."],
      [/document\.write\s*\(/, "document.write() ist im Projektcode nicht erlaubt."],
      [/fetch\s*\(\s*["']https?:\/\//i, "Absolute externe fetch()-URLs sind nicht erlaubt."],
    ];

    if (browserCode) {
      forbidden.push([/localStorage\.clear\s*\(/, "localStorage.clear() darf keine fremden Projektdaten löschen."]);
    }
    if (projectDataModule) {
      forbidden.push([/\b(?:localStorage|sessionStorage)\b/, "Project-Data-Module dürfen keine zweite Browser-Datenquelle anlegen."]);
    }

    for (const [pattern, message] of forbidden) {
      if (pattern.test(source)) errors.push(`${rel}: ${message}`);
    }

    if (rel.startsWith("scripts/") && /["']0\.0\.0\.0["']/.test(source)) {
      errors.push(`${rel}: Server dürfen nicht unbeabsichtigt an 0.0.0.0 gebunden werden.`);
    }
  }

  if (browserCode && path.extname(filePath) === ".js") {
    const firstChunk = source.slice(0, 250);
    if (!/["']use strict["']/.test(firstChunk)) {
      errors.push(`${rel}: Browser-JavaScript benötigt 'use strict' im Einstieg.`);
    }
  }

  return errors;
};

export const runProjectLint = async () => {
  const files = (await walk(ROOT)).filter((filePath) => JAVASCRIPT_EXTENSIONS.has(path.extname(filePath)));
  const errors = [];
  for (const filePath of files) {
    const source = await readFile(filePath, "utf8");
    errors.push(...lintSource(filePath, source));
  }
  return { files: files.length, errors };
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await runProjectLint();
    if (result.errors.length) {
      console.error(`PROJECT LINT: FEHLER (${result.errors.length})`);
      result.errors.forEach((error) => console.error(`  - ${error}`));
      process.exitCode = 1;
    } else {
      console.log(`PROJECT LINT: OK (${result.files} JavaScript-Dateien geprüft)`);
    }
  } catch (error) {
    console.error("PROJECT LINT: INTERNER FEHLER");
    console.error(`  - ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
