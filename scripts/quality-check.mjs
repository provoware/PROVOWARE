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
const TEXT_FILENAMES = new Set([".editorconfig", ".gitignore"]);
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".tmp",
  "artifacts",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const IGNORED_RUNTIME_FILES = new Set([
  "data/project-data.json",
  "data/data-studio-pro.json",
]);
const IGNORED_RUNTIME_PREFIXES = ["data/backups/project-data/"];
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

const ignoredRuntimeFile = (filePath) => {
  const item = relative(filePath);
  return IGNORED_RUNTIME_FILES.has(item)
    || item.startsWith("data/project-data.json.tmp-")
    || item.startsWith("data/data-studio-pro.json.tmp-")
    || IGNORED_RUNTIME_PREFIXES.some((prefix) => item.startsWith(prefix));
};

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else if (!ignoredRuntimeFile(fullPath)) files.push(fullPath);
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
    ".gitignore",
    ".github/workflows/browser-e2e.yml",
    "assets/app.js",
    "assets/module-registry.js",
    "assets/workspace-state.js",
    "assets/workspace-ui.js",
    "assets/styles.css",
    "assets/project-data.css",
    "modules/registry.js",
    "modules/development-notes/index.js",
    "modules/data-studio/index.js",
    "modules/data-studio-pro/index.js",
    "modules/data-studio-pro-bridge/index.js",
    "modules/data-recovery/index.js",
    "scripts/start.mjs",
    "scripts/browser-e2e-server.mjs",
    "scripts/project-data-service.mjs",
    "scripts/project-data-recovery.mjs",
    "scripts/data-studio-pro-service.mjs",
    "scripts/runtime-persistence.mjs",
    "scripts/project-lint.mjs",
    "start.cmd",
    "start.sh",
    "tests/module-registry.test.mjs",
    "tests/start.test.mjs",
    "tests/workspace-state.test.mjs",
    "tests/workspace-ui.test.mjs",
    "tests/project-data-service.test.mjs",
    "tests/project-data-api.test.mjs",
    "tests/project-data-recovery.test.mjs",
    "tests/project-data-recovery-api.test.mjs",
    "tests/project-data-recovery-ui.test.mjs",
    "tests/data-studio-pro-service.test.mjs",
    "tests/data-studio-pro-api.test.mjs",
    "tests/data-studio-pro-ui.test.mjs",
    "tests/runtime-persistence.test.mjs",
    "tests/runtime-persistence-integration.test.mjs",
    "tests/project-lint.test.mjs",
    "tests/browser-e2e-contract.test.mjs",
    "tests/browser/playwright.config.mjs",
    "tests/browser/project-data.e2e.spec.mjs",
    "tests/browser/ui-mirror.html",
    "tests/browser/ui-mirror.css",
    "tests/browser/ui-mirror.js",
    "data/ENTWICKLUNGSNOTIZEN.txt",
    "data/.gitignore",
    "docs/PLAN_0.4.0_PROJECT_DATA_STUDIO.md",
    "docs/CHECKPOINT_0.4.0_PROJECT_DATA_STUDIO.md",
    "docs/CHECKLIST_0.4.0_PROJECT_DATA_STUDIO.md",
    "docs/PLAN_0.4.1_RECOVERY_MIGRATION.md",
    "docs/CHECKPOINT_0.4.1_RECOVERY_MIGRATION.md",
    "docs/CHECKLIST_0.4.1_RECOVERY_MIGRATION.md",
    "docs/PLAN_0.4.1_BROWSER_E2E_HTML_MIRROR.md",
    "docs/CHECKPOINT_0.4.1_BROWSER_E2E_HTML_MIRROR.md",
    "docs/CHECKLIST_0.4.1_BROWSER_E2E_HTML_MIRROR.md",
    "docs/PLAN_0.4.2_DATA_STUDIO_PRO.md",
    "docs/CHECKPOINT_0.4.2_DATA_STUDIO_PRO.md",
    "docs/CHECKLIST_0.4.2_DATA_STUDIO_PRO.md",
    "docs/PLAN_0.4.2_H1_PERSISTENCE_PORTABILITY.md",
    "docs/CHECKPOINT_0.4.2_H1_PERSISTENCE_PORTABILITY.md",
    "docs/CHECKLIST_0.4.2_H1_PERSISTENCE_PORTABILITY.md",
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
  if (version.project_data_schema_version !== "1") {
    fail("VERSION.json: Project-Data-Produktionsschema muss in 0.4.x weiterhin '1' sein.");
  }
  if (version.project_data_backup_store !== "data/backups/project-data/*.pwbak") {
    fail("VERSION.json: Recovery-Backup-Pfad muss auf *.pwbak zeigen.");
  }
  if (version.project_data_backup_limit !== 10) {
    fail("VERSION.json: Recovery-Backup-Limit muss 10 sein.");
  }
  if (version.data_studio_pro_schema_version !== "1") {
    fail("VERSION.json: Data-Studio-PRO-Metadatenvertrag muss Version '1' sein.");
  }
  if (version.data_studio_pro_store !== "data/data-studio-pro.json") {
    fail("VERSION.json: Data-Studio-PRO-Store muss data/data-studio-pro.json sein.");
  }
  if (version.runtime_persistence_contract_version !== "1") {
    fail("VERSION.json: Runtime-Persistence-Vertrag muss Version '1' sein.");
  }
  if (version.runtime_persistence_writer !== "scripts/runtime-persistence.mjs") {
    fail("VERSION.json: kanonischer Runtime-Persistence-Writer muss scripts/runtime-persistence.mjs sein.");
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
    "assets/workspace-ui.js",
    "assets/app.js",
  ].map((item) => html.indexOf(item));

  const ordered = scriptOrder.every((position, index) => index === 0 || scriptOrder[index - 1] < position);
  if (scriptOrder.some((position) => position < 0) || !ordered) {
    fail(
      "index.html: Script-Reihenfolge muss registry.js -> module-registry.js -> workspace-state.js -> workspace-ui.js -> app.js sein.",
    );
  }
};

const workspaceDefinitionenLesen = async () => {
  const source = await readFile(path.join(ROOT, "assets/workspace-state.js"), "utf8");
  const sandbox = { window: {} };

  try {
    vm.runInNewContext(source, sandbox, { filename: "assets/workspace-state.js", timeout: 1000 });
  } catch (error) {
    fail(`assets/workspace-state.js: Vertrag konnte nicht ausgewertet werden (${error.message}).`);
    return [];
  }
  return sandbox.window.PROVOWARE_WORKSPACE?.PANEL_DEFINITIONEN || [];
};

const checkWorkspaceLayout = async () => {
  const html = await readFile(path.join(ROOT, "index.html"), "utf8");
  const definitionen = await workspaceDefinitionenLesen();
  if (!definitionen.length) {
    fail("Workspace-Vertrag enthält keine Paneldefinitionen.");
    return;
  }

  const erwartet = definitionen.map((definition) => definition.id).sort();
  const panelIds = [...html.matchAll(/\bdata-workspace-panel=["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  const schalterIds = [...html.matchAll(/\bdata-layout-panel=["']([^"']+)["']/g)].map(
    (match) => match[1],
  );

  const pruefeZuordnung = (name, werte) => {
    if (new Set(werte).size !== werte.length) fail(`index.html: ${name} enthält doppelte Panel-IDs.`);
    const aktuell = [...werte].sort();
    if (JSON.stringify(aktuell) !== JSON.stringify(erwartet)) {
      fail(`index.html: ${name} muss exakt alle Workspace-Panel-IDs enthalten.`);
    }
  };

  pruefeZuordnung("data-workspace-panel", panelIds);
  pruefeZuordnung("data-layout-panel", schalterIds);

  const pflichtIds = [
    "quickbar",
    "layout-toggle",
    "layout-menu",
    "layout-show-all",
    "layout-reset",
    "layout-status",
    "layout-summary",
    "arbeitsbereich",
  ];
  for (const id of pflichtIds) {
    if (!new RegExp(`\\bid=["']${id}["']`).test(html)) fail(`index.html: Layout-Pflichtelement fehlt (${id}).`);
  }

  const layoutToggle = html.indexOf('id="layout-toggle"');
  const workspaceMain = html.indexOf('id="arbeitsbereich"');
  if (layoutToggle < 0 || workspaceMain < 0 || layoutToggle > workspaceMain) {
    fail("index.html: permanenter Layout-Schalter muss vor und außerhalb des veränderbaren Workspace liegen.");
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

const registryCatalogLesen = async () => {
  const registryPath = path.join(ROOT, "modules/registry.js");
  const source = await readFile(registryPath, "utf8");
  const sandbox = { window: {} };

  try {
    vm.runInNewContext(source, sandbox, { filename: "modules/registry.js", timeout: 1000 });
  } catch (error) {
    fail(`modules/registry.js: Katalog konnte nicht ausgewertet werden (${error.message}).`);
    return [];
  }

  const catalog = sandbox.window.PROVOWARE_MODULE_CATALOG;
  if (!Array.isArray(catalog)) {
    fail("modules/registry.js: PROVOWARE_MODULE_CATALOG muss eine Liste sein.");
    return [];
  }
  return catalog;
};

const checkRegistry = async () => {
  const catalog = await registryCatalogLesen();
  const seenIds = new Set();
  for (const manifest of catalog) {
    const entry = validateManifest(manifest, seenIds);
    if (entry && !(await exists(path.join(ROOT, entry)))) {
      fail(`Modul ${manifest.id}: Einstiegspunkt existiert nicht (${entry}).`);
    }
  }
};

const checkProjectDataContract = async () => {
  const catalog = await registryCatalogLesen();
  const byId = new Map(catalog.map((manifest) => [manifest.id, manifest]));
  const requiredModules = new Map([
    ["development-notes", "0.4.0"],
    ["data-studio", "0.4.0"],
    ["data-studio-pro", "0.4.2"],
    ["data-studio-pro-bridge", "0.4.2"],
    ["data-recovery", "0.4.1"],
  ]);

  for (const [id, expectedVersion] of requiredModules) {
    const manifest = byId.get(id);
    if (!manifest) {
      fail(`Project Data: Pflichtmodul '${id}' fehlt im Katalog.`);
      continue;
    }
    if (manifest.enabledByDefault !== true) {
      fail(`Project Data: Pflichtmodul '${id}' muss standardmäßig aktiv sein.`);
    }
    if (manifest.version !== expectedVersion) {
      fail(`Project Data: Modul '${id}' muss Entwicklungsstand ${expectedVersion} tragen.`);
    }
  }

  const html = await readFile(path.join(ROOT, "index.html"), "utf8");
  if (!html.includes('href="assets/project-data.css"')) {
    fail("index.html: Styles für Project Data fehlen.");
  }

  const ignore = await readFile(path.join(ROOT, "data/.gitignore"), "utf8");
  const ignoreLines = ignore.split(/\r?\n/).map((line) => line.trim());
  if (!ignoreLines.includes("project-data.json")) {
    fail("data/.gitignore: lokale project-data.json muss aus Git ausgeschlossen bleiben.");
  }
  if (!ignoreLines.includes("project-data.json.tmp-*")) {
    fail("data/.gitignore: temporäre atomare Datenbankdateien müssen aus Git ausgeschlossen bleiben.");
  }
  if (!ignoreLines.includes("data-studio-pro.json")) {
    fail("data/.gitignore: lokale Data-Studio-PRO-Metadaten müssen aus Git ausgeschlossen bleiben.");
  }
  if (!ignoreLines.includes("data-studio-pro.json.tmp-*")) {
    fail("data/.gitignore: temporäre PRO-Dateien müssen aus Git ausgeschlossen bleiben.");
  }
  if (!ignoreLines.includes("backups/")) {
    fail("data/.gitignore: Recovery-Backups müssen vollständig aus Git ausgeschlossen bleiben.");
  }

  const start = await readFile(path.join(ROOT, "scripts/start.mjs"), "utf8");
  if (!start.includes("handleDataStudioProApi") || !start.includes("isProtectedDataStudioProPath")) {
    fail("scripts/start.mjs: PRO-API und Schutz der PRO-Runtime-Datei müssen aktiv sein.");
  }

  const packageJson = await readJson("package.json");
  if (packageJson && packageJson.scripts?.lint !== "node scripts/project-lint.mjs") {
    fail("package.json: kanonischer Lint-Befehl muss scripts/project-lint.mjs verwenden.");
  }
  if (packageJson && !String(packageJson.scripts?.verify || "").includes("npm run lint")) {
    fail("package.json: verify muss den Lint-Gate ausführen.");
  }
};

const checkRuntimePersistenceContract = async () => {
  const runtime = await readFile(path.join(ROOT, "scripts/runtime-persistence.mjs"), "utf8");
  const projectData = await readFile(path.join(ROOT, "scripts/project-data-service.mjs"), "utf8");
  const pro = await readFile(path.join(ROOT, "scripts/data-studio-pro-service.mjs"), "utf8");

  if (!runtime.includes('flag: "wx"')) {
    fail("Runtime Persistence: Temp-Dateien müssen exklusiv mit flag 'wx' erzeugt werden.");
  }
  if (!runtime.includes('new Set(["EBUSY", "EPERM"])')) {
    fail("Runtime Persistence: Retry darf nur den kanonischen transienten Replace-Fehlern gelten.");
  }
  if (/\bunlink\s*\(\s*targetPath\s*\)|\bremoveTemp\s*\(\s*targetPath\s*\)/.test(runtime)) {
    fail("Runtime Persistence: destruktiver Target-Unlink-Fallback ist verboten.");
  }

  for (const [name, source] of [["Project Data", projectData], ["Data Studio PRO", pro]]) {
    if (!source.includes('import { atomicReplaceFile } from "./runtime-persistence.mjs";')) {
      fail(`Runtime Persistence: ${name} muss den gemeinsamen atomicReplaceFile-Vertrag importieren.`);
    }
    if (!source.includes("await atomicReplaceFile({")) {
      fail(`Runtime Persistence: ${name} muss Schreibvorgänge an atomicReplaceFile delegieren.`);
    }
    if (/\brename\s*\(/.test(source)) {
      fail(`Runtime Persistence: ${name} darf keinen eigenen rename-Pfad besitzen.`);
    }
  }
};

const checkBrowserE2EContract = async () => {
  const packageJson = await readJson("package.json");
  if (!packageJson) return;

  const chromiumCommand = "playwright test --config=tests/browser/playwright.config.mjs --project=chromium";
  if (packageJson.scripts?.["test:e2e"] !== chromiumCommand) {
    fail("package.json: test:e2e muss Chromium als primären Browser verwenden.");
  }
  if (packageJson.scripts?.["test:e2e:chromium"] !== chromiumCommand) {
    fail("package.json: expliziter Chromium-E2E-Befehl fehlt oder weicht ab.");
  }
  if (!String(packageJson.scripts?.["test:e2e:firefox"] || "").endsWith("--project=firefox")) {
    fail("package.json: Firefox muss als separater alternativer E2E-Lauf verfügbar bleiben.");
  }
  if (packageJson.devDependencies?.["@playwright/test"] !== "1.62.1") {
    fail("package.json: Browser-E2E muss die geprüfte Playwright-Version 1.62.1 exakt pinnen.");
  }

  const workflow = await readFile(path.join(ROOT, ".github/workflows/browser-e2e.yml"), "utf8");
  if (!workflow.includes("npm run test:e2e:chromium")) {
    fail("Browser-E2E-Workflow: automatischer Chromium-Lauf fehlt.");
  }
  if (!workflow.includes("github.event_name == 'workflow_dispatch' && inputs.firefox == true")) {
    fail("Browser-E2E-Workflow: Firefox darf nur als alternativer manueller Lauf aktiviert werden.");
  }
  if (!workflow.includes("actions/upload-artifact@v7")) {
    fail("Browser-E2E-Workflow: Screenshot-/Report-Evidenz muss als Artefakt hochgeladen werden.");
  }

  const mirror = await readFile(path.join(ROOT, "tests/browser/ui-mirror.html"), "utf8");
  if ((mirror.match(/src="\/index\.html\?ui-mirror=/g) || []).length !== 2) {
    fail("UI-Mirror: Quelle und Spiegel müssen beide die echte index.html laden.");
  }

  const rootIgnore = await readFile(path.join(ROOT, ".gitignore"), "utf8");
  for (const required of ["node_modules/", "playwright-report/", "test-results/", "artifacts/browser-e2e/"]) {
    if (!rootIgnore.split(/\r?\n/).includes(required)) {
      fail(`.gitignore: Browser-Testartefakt '${required}' muss ausgeschlossen bleiben.`);
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
  await checkWorkspaceLayout();
  await checkRegistry();
  await checkProjectDataContract();
  await checkRuntimePersistenceContract();
  await checkBrowserE2EContract();

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

try {
  await main();
} catch (error) {
  const ursache = error instanceof Error ? error.message : String(error);
  console.error("QUALITY GATE: INTERNER FEHLER");
  console.error(`  - Prüfung konnte nicht abgeschlossen werden (${ursache}).`);
  console.error("  - Nächster Schritt: Dateizugriffe prüfen und 'npm run verify' erneut ausführen.");
  process.exitCode = 1;
}
