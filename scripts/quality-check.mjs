import { access, readFile, readdir, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIX = process.argv.includes("--fix");
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".yml",
  ".yaml",
]);
const TEXT_FILENAMES = new Set([".editorconfig"]);
const IGNORED_DIRECTORIES = new Set([".git", "node_modules"]);
const errors = [];
const fixes = [];

const relative = (filePath) => path.relative(ROOT, filePath).split(path.sep).join("/");
const fail = (message) => errors.push(message);

const exists = async (filePath) => {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

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

const normalizeText = (filePath, source) => {
  let normalized = source.replace(/\r\n?/g, "\n");
  const extension = path.extname(filePath);

  if (extension === ".json") {
    try {
      normalized = `${JSON.stringify(JSON.parse(normalized), null, 2)}\n`;
    } catch (error) {
      fail(`${relative(filePath)}: ungültiges JSON (${error.message}).`);
      return source;
    }
  } else {
    normalized = normalized
      .split("\n")
      .map((line) => line.replace(/[\t ]+$/g, ""))
      .join("\n")
      .replace(/\n*$/, "\n");
  }

  return normalized;
};

const enforceFormatting = async (files) => {
  for (const filePath of files) {
    const extension = path.extname(filePath);
    if (!TEXT_EXTENSIONS.has(extension) && !TEXT_FILENAMES.has(path.basename(filePath))) continue;

    const source = await readFile(filePath, "utf8");
    const normalized = normalizeText(filePath, source);
    if (source === normalized) continue;

    if (FIX) {
      await writeFile(filePath, normalized, "utf8");
      fixes.push(relative(filePath));
    } else {
      fail(`${relative(filePath)}: Format weicht ab. Einmal 'npm run fix' ausführen.`);
    }
  }
};

const readJson = async (relativePath) => {
  const filePath = path.join(ROOT, relativePath);
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    fail(`${relativePath}: konnte nicht als JSON gelesen werden (${error.message}).`);
    return null;
  }
};

const checkRequiredFiles = async () => {
  const required = [
    "index.html",
    "assets/app.js",
    "assets/module-registry.js",
    "assets/workspace-state.js",
    "assets/styles.css",
    "modules/registry.js",
    "tests/module-registry.test.mjs",
    "tests/workspace-state.test.mjs",
    "README.md",
    "TODO.md",
    "CHANGELOG.md",
    "MANIFEST.md",
    "VERSION.json",
    "package.json",
  ];

  for (const item of required) {
    if (!(await exists(path.join(ROOT, item)))) fail(`Pflichtdatei fehlt: ${item}.`);
  }
};

const checkJavaScriptSyntax = async (files) => {
  for (const filePath of files) {
    if (![".js", ".mjs"].includes(path.extname(filePath))) continue;

    const result = spawnSync(process.execPath, ["--check", filePath], {
      cwd: ROOT,
      encoding: "utf8",
    });

    if (result.status !== 0) {
      fail(`${relative(filePath)}: JavaScript-Syntaxfehler. ${result.stderr.trim()}`);
    }
  }
};

const checkVersion = async () => {
  const version = await readJson("VERSION.json");
  const packageJson = await readJson("package.json");
  if (!version || !packageJson) return;

  if (version.product !== "PROVOWARE ALL-IN 2026") {
    fail("VERSION.json: product muss 'PROVOWARE ALL-IN 2026' sein.");
  }
  if (version.version !== packageJson.version) {
    fail(`Versionskonflikt: VERSION.json=${version.version}, package.json=${packageJson.version}.`);
  }
  if (!/^\d+\.\d+\.\d+$/.test(String(version.version || ""))) {
    fail("VERSION.json: version muss MAJOR.MINOR.PATCH entsprechen.");
  }
  if (!version.entrypoint || !(await exists(path.join(ROOT, version.entrypoint)))) {
    fail(`VERSION.json: Einstiegspunkt fehlt oder existiert nicht (${version.entrypoint || "leer"}).`);
  }
};

const checkHtml = async () => {
  const htmlPath = path.join(ROOT, "index.html");
  const html = await readFile(htmlPath, "utf8");
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  for (const id of new Set(duplicates)) fail(`index.html: doppelte HTML-ID '${id}'.`);

  const refs = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const ref of refs) {
    if (ref.startsWith("#")) continue;
    if (/^(https?:)?\/\//i.test(ref)) {
      fail(`index.html: externer Laufzeitverweis ist nicht erlaubt (${ref}).`);
      continue;
    }
    if (/^(mailto:|tel:|data:|javascript:)/i.test(ref)) {
      fail(`index.html: nichtlokaler oder ausführbarer Verweis ist nicht erlaubt (${ref}).`);
      continue;
    }

    const cleanRef = ref.split(/[?#]/, 1)[0];
    if (!cleanRef) continue;
    const resolved = path.resolve(ROOT, cleanRef);
    if (!resolved.startsWith(`${ROOT}${path.sep}`) && resolved !== ROOT) {
      fail(`index.html: Verweis verlässt das Projekt (${ref}).`);
      continue;
    }
    if (!(await exists(resolved))) fail(`index.html: lokale Datei fehlt (${ref}).`);
  }

  const scriptOrder = [
    "modules/registry.js",
    "assets/module-registry.js",
    "assets/workspace-state.js",
    "assets/app.js",
  ].map((item) => html.indexOf(item));

  const ordered = scriptOrder.every((position, index) => index === 0 || scriptOrder[index - 1] < position);
  if (scriptOrder.some((position) => position < 0) || !ordered) {
    fail(
      "index.html: Script-Reihenfolge muss registry.js -> module-registry.js -> workspace-state.js -> app.js sein.",
    );
  }
};

const validateManifest = (manifest, seenIds) => {
  const idPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
  const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    fail("modules/registry.js: jeder Katalogeintrag muss ein Objekt sein.");
    return null;
  }

  const { id, name, version, apiVersion, entry, enabledByDefault } = manifest;
  if (!idPattern.test(String(id || ""))) fail(`Modul-ID ungültig: ${id || "<leer>"}.`);
  if (seenIds.has(id)) fail(`Doppelte Modul-ID: ${id}.`);
  seenIds.add(id);
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80) {
    fail(`Modul ${id}: name muss 1 bis 80 Zeichen enthalten.`);
  }
  if (!versionPattern.test(String(version || ""))) {
    fail(`Modul ${id}: version muss MAJOR.MINOR.PATCH entsprechen.`);
  }
  if (apiVersion !== "1") fail(`Modul ${id}: apiVersion muss '1' sein.`);
  if (typeof enabledByDefault !== "boolean") {
    fail(`Modul ${id}: enabledByDefault muss true oder false sein.`);
  }
  if (
    typeof entry !== "string" ||
    !entry.startsWith(`modules/${id}/`) ||
    !entry.endsWith(".js") ||
    entry.includes("..") ||
    entry.includes(":") ||
    entry.startsWith("/")
  ) {
    fail(`Modul ${id}: entry muss eine lokale JS-Datei unter modules/${id}/ sein.`);
  }

  for (const field of ["slots", "capabilities"]) {
    if (manifest[field] === undefined) continue;
    if (
      !Array.isArray(manifest[field]) ||
      manifest[field].some((item) => typeof item !== "string" || !item.trim()) ||
      new Set(manifest[field]).size !== manifest[field].length
    ) {
      fail(`Modul ${id}: ${field} muss eine Liste eindeutiger, nichtleerer Texte sein.`);
    }
  }

  return typeof entry === "string" ? entry : null;
};

const checkRegistry = async () => {
  const registryPath = path.join(ROOT, "modules/registry.js");
  const source = await readFile(registryPath, "utf8");
  const sandbox = { window: {} };

  try {
    vm.runInNewContext(source, sandbox, { filename: "modules/registry.js", timeout: 1000 });
  } catch (error) {
    fail(`modules/registry.js: Katalog konnte nicht ausgewertet werden (${error.message}).`);
    return;
  }

  const catalog = sandbox.window.PROVOWARE_MODULE_CATALOG;
  if (!Array.isArray(catalog)) {
    fail("modules/registry.js: PROVOWARE_MODULE_CATALOG muss eine Liste sein.");
    return;
  }

  const seenIds = new Set();
  for (const manifest of catalog) {
    const entry = validateManifest(manifest, seenIds);
    if (entry && !(await exists(path.join(ROOT, entry)))) {
      fail(`Modul ${manifest.id}: Einstiegspunkt existiert nicht (${entry}).`);
    }
  }
};

const main = async () => {
  const files = await walk(ROOT);
  await enforceFormatting(files);

  const refreshedFiles = FIX ? await walk(ROOT) : files;
  await checkRequiredFiles();
  await checkJavaScriptSyntax(refreshedFiles);
  await checkVersion();
  await checkHtml();
  await checkRegistry();

  if (fixes.length) {
    console.log(`AUTO-FIX: ${fixes.length} Datei(en) sicher normalisiert:`);
    fixes.forEach((item) => console.log(`  - ${item}`));
  }

  if (errors.length) {
    console.error(`QUALITY GATE: FEHLER (${errors.length})`);
    errors.forEach((item) => console.error(`  - ${item}`));
    process.exitCode = 1;
    return;
  }

  console.log(`QUALITY GATE: OK (${refreshedFiles.length} Dateien geprüft)`);
};

await main();
