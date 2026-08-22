import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PROJECT_DATABASE_RELATIVE_PATH,
  PROJECT_DATABASE_SCHEMA_VERSION,
  ProjectDataError,
  createEmptyProjectDatabase,
  readProjectDatabase,
  validateStoredDatabase,
  withMutationLock,
  writeProjectDatabaseAtomic,
} from "./project-data-service.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const PROJECT_DATA_BACKUP_RELATIVE_DIR = "data/backups/project-data";
export const PROJECT_DATA_BACKUP_LIMIT = 10;
export const PROJECT_DATA_RECOVERY_API_ROOT = "/api/provoware/project-data/recovery";

const MAX_RECOVERY_REQUEST_BYTES = 4 * 1024 * 1024;
const BACKUP_ID_PATTERN = /^project-data-\d{8}T\d{6}Z-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pwbak$/;
const PRODUCTION_MIGRATORS = new Map();

const jsonSource = (database) => `${JSON.stringify(database, null, 2)}\n`;
const sha256 = (source) => createHash("sha256").update(source).digest("hex");
const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const compactUtcTimestamp = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new TypeError("Ungültiger Backup-Zeitpunkt.");
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
};

const backupDirectory = (root) => path.join(root, PROJECT_DATA_BACKUP_RELATIVE_DIR);
const liveDatabasePath = (root) => path.join(root, PROJECT_DATABASE_RELATIVE_PATH);

const backupPath = (root, backupId) => {
  if (typeof backupId !== "string" || !BACKUP_ID_PATTERN.test(backupId)) {
    throw new ProjectDataError("Ungültige Backup-ID.", 400);
  }
  return path.join(backupDirectory(root), backupId);
};

const summaryFromDatabase = (database) => ({
  schemaVersion: database.schemaVersion,
  revision: database.revision,
  templates: database.templates.length,
  records: database.records.length,
});

const validateCandidate = (database, label = "Datenbestand") => {
  try {
    return validateStoredDatabase(database);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new ProjectDataError(`${label} ist nicht kompatibel: ${detail}`, 400);
  }
};

export const describeMigrationPlan = (
  sourceVersion,
  targetVersion = PROJECT_DATABASE_SCHEMA_VERSION,
  { migrators = PRODUCTION_MIGRATORS } = {},
) => {
  if (!Number.isInteger(sourceVersion) || sourceVersion < 0) {
    throw new ProjectDataError("Quell-Schemaversion ist ungültig.");
  }
  if (!Number.isInteger(targetVersion) || targetVersion < 0) {
    throw new ProjectDataError("Ziel-Schemaversion ist ungültig.");
  }
  if (sourceVersion > targetVersion) {
    throw new ProjectDataError(
      `Rückwärtsmigration von Schema ${sourceVersion} auf ${targetVersion} ist nicht erlaubt.`,
      409,
    );
  }

  const plan = [];
  for (let version = sourceVersion; version < targetVersion; version += 1) {
    if (!migrators.has(version)) {
      throw new ProjectDataError(`Migrationsschritt ${version} -> ${version + 1} fehlt.`, 409);
    }
    plan.push({ from: version, to: version + 1 });
  }
  return plan;
};

export const runMigrationChain = (
  database,
  {
    targetVersion = PROJECT_DATABASE_SCHEMA_VERSION,
    migrators = PRODUCTION_MIGRATORS,
  } = {},
) => {
  if (!database || typeof database !== "object" || Array.isArray(database)) {
    throw new ProjectDataError("Migrationsquelle muss ein Datenbankobjekt sein.");
  }
  const sourceVersion = database.schemaVersion;
  const plan = describeMigrationPlan(sourceVersion, targetVersion, { migrators });
  let current = cloneJson(database);

  for (const step of plan) {
    const migrator = migrators.get(step.from);
    const next = migrator(cloneJson(current));
    if (!next || typeof next !== "object" || Array.isArray(next) || next.schemaVersion !== step.to) {
      throw new ProjectDataError(`Migration ${step.from} -> ${step.to} lieferte kein gültiges Zielschema.`, 500);
    }
    current = cloneJson(next);
  }

  return { data: current, plan };
};

const normalizeIncomingSnapshot = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProjectDataError("Import benötigt ein JSON-Objekt.");
  }
  const sourceVersion = input.schemaVersion;
  const { data, plan } = runMigrationChain(input, {
    targetVersion: PROJECT_DATABASE_SCHEMA_VERSION,
    migrators: PRODUCTION_MIGRATORS,
  });
  return { data: validateCandidate(data, "Import"), plan, sourceVersion };
};

const previewNormalizedSnapshot = (database, migrationPlan = []) => {
  const source = jsonSource(database);
  return {
    sha256: sha256(source),
    bytes: Buffer.byteLength(source),
    summary: summaryFromDatabase(database),
    migrationPlan,
  };
};

const readLiveRaw = async (root) => {
  try {
    return await readFile(liveDatabasePath(root), "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return jsonSource(createEmptyProjectDatabase());
  }
};

const readBackup = async (root, backupId) => {
  const filePath = backupPath(root, backupId);
  let source;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") throw new ProjectDataError(`Backup '${backupId}' wurde nicht gefunden.`, 404);
    throw error;
  }

  let data;
  try {
    data = JSON.parse(source);
  } catch (error) {
    throw new ProjectDataError(`Backup '${backupId}' enthält beschädigtes JSON: ${error.message}`, 409);
  }
  return {
    source,
    data: validateCandidate(data, `Backup '${backupId}'`),
  };
};

const listBackupIds = async (root) => {
  try {
    const names = await readdir(backupDirectory(root));
    return names.filter((name) => BACKUP_ID_PATTERN.test(name)).sort().reverse();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
};

const rotateBackupsUnlocked = async (root, limit = PROJECT_DATA_BACKUP_LIMIT) => {
  if (!Number.isInteger(limit) || limit < 1) throw new ProjectDataError("Backup-Limit muss mindestens 1 sein.");
  const ids = await listBackupIds(root);
  const excess = ids.slice(limit);
  await Promise.all(excess.map((id) => unlink(backupPath(root, id)).catch((error) => {
    if (error?.code !== "ENOENT") throw error;
  })));
  return { kept: Math.min(ids.length, limit), removed: excess };
};

const createBackupUnlocked = async (
  { root = ROOT, now = () => new Date(), uuid = randomUUID, limit = PROJECT_DATA_BACKUP_LIMIT } = {},
) => {
  const timestamp = now();
  const id = `project-data-${compactUtcTimestamp(timestamp)}-${uuid()}.pwbak`;
  const directory = backupDirectory(root);
  const filePath = backupPath(root, id);
  const source = await readLiveRaw(root);
  await mkdir(directory, { recursive: true });
  await writeFile(filePath, source, { encoding: "utf8", flag: "wx" });
  const rotation = await rotateBackupsUnlocked(root, limit);

  let summary = null;
  let valid = false;
  try {
    summary = summaryFromDatabase(validateStoredDatabase(JSON.parse(source)));
    valid = true;
  } catch {
    valid = false;
  }

  return {
    id,
    createdAt: timestamp.toISOString(),
    sha256: sha256(source),
    bytes: Buffer.byteLength(source),
    valid,
    summary,
    rotation,
  };
};

export const createProjectDataBackup = (options = {}) =>
  withMutationLock(() => createBackupUnlocked(options));

export const listProjectDataBackups = async ({ root = ROOT } = {}) => {
  const ids = await listBackupIds(root);
  const results = [];

  for (const id of ids) {
    const filePath = backupPath(root, id);
    const info = await stat(filePath);
    const source = await readFile(filePath, "utf8");
    let summary = null;
    let valid = false;
    let error = null;
    try {
      summary = summaryFromDatabase(validateStoredDatabase(JSON.parse(source)));
      valid = true;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    }
    results.push({
      id,
      createdAt: info.mtime.toISOString(),
      bytes: Buffer.byteLength(source),
      sha256: sha256(source),
      valid,
      summary,
      error,
    });
  }
  return results;
};

export const previewProjectDataBackup = async (backupId, { root = ROOT } = {}) => {
  const { source, data } = await readBackup(root, backupId);
  return {
    backupId,
    sha256: sha256(source),
    bytes: Buffer.byteLength(source),
    summary: summaryFromDatabase(data),
    migrationPlan: [],
  };
};

export const exportProjectDataSnapshot = async ({ root = ROOT } = {}) => {
  const database = await readProjectDatabase(root);
  const preview = previewNormalizedSnapshot(database);
  return {
    filename: `project-data-export-schema-${database.schemaVersion}-revision-${database.revision}.json`,
    data: cloneJson(database),
    ...preview,
  };
};

export const previewProjectDataImport = async (input) => {
  const normalized = normalizeIncomingSnapshot(input);
  return {
    sourceSchemaVersion: normalized.sourceVersion,
    ...previewNormalizedSnapshot(normalized.data, normalized.plan),
  };
};

const assertExpectedFingerprint = (expectedSha256, actualSha256) => {
  if (typeof expectedSha256 !== "string" || !/^[0-9a-f]{64}$/.test(expectedSha256)) {
    throw new ProjectDataError("Bestätigung benötigt eine gültige SHA-256-Prüfsumme.");
  }
  if (expectedSha256 !== actualSha256) {
    throw new ProjectDataError("Daten haben sich seit der Vorschau geändert. Vorgang wurde abgebrochen.", 409);
  }
};

export const restoreProjectDataBackup = (
  backupId,
  expectedSha256,
  {
    root = ROOT,
    now = () => new Date(),
    uuid = randomUUID,
    beforeRename = null,
  } = {},
) => withMutationLock(async () => {
  const { source, data } = await readBackup(root, backupId);
  const actualSha256 = sha256(source);
  assertExpectedFingerprint(expectedSha256, actualSha256);
  const safetyBackup = await createBackupUnlocked({ root, now, uuid });
  await writeProjectDatabaseAtomic(root, data, { beforeRename });
  return {
    restoredBackupId: backupId,
    safetyBackup,
    sha256: actualSha256,
    summary: summaryFromDatabase(data),
  };
});

export const importProjectDataSnapshot = (
  input,
  expectedSha256,
  {
    root = ROOT,
    now = () => new Date(),
    uuid = randomUUID,
    beforeRename = null,
  } = {},
) => withMutationLock(async () => {
  const normalized = normalizeIncomingSnapshot(input);
  const preview = previewNormalizedSnapshot(normalized.data, normalized.plan);
  assertExpectedFingerprint(expectedSha256, preview.sha256);
  const safetyBackup = await createBackupUnlocked({ root, now, uuid });
  await writeProjectDatabaseAtomic(root, normalized.data, { beforeRename });
  return {
    safetyBackup,
    sourceSchemaVersion: normalized.sourceVersion,
    ...preview,
  };
});

const readJsonBody = async (request) => {
  const contentType = String(request.headers["content-type"] || "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    throw new ProjectDataError("Recovery-API erwartet Content-Type application/json.", 415);
  }
  let bytes = 0;
  const chunks = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_RECOVERY_REQUEST_BYTES) {
      throw new ProjectDataError("Recovery-Anfrage ist zu groß.", 413);
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ProjectDataError("Recovery-Anfrage enthält ungültiges JSON.");
  }
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(`${JSON.stringify(payload)}\n`);
};

const checkSameOrigin = (request) => {
  const origin = request.headers.origin;
  if (!origin) return;
  const expected = `http://${request.headers.host}`;
  if (origin !== expected) throw new ProjectDataError("Recovery-Zugriff von fremder Herkunft wurde blockiert.", 403);
};

export const handleProjectDataRecoveryApi = async (
  request,
  response,
  { root = ROOT, now = () => new Date(), uuid = randomUUID } = {},
) => {
  const url = new URL(request.url || "/", "http://localhost");
  if (!url.pathname.startsWith(PROJECT_DATA_RECOVERY_API_ROOT)) return false;

  try {
    checkSameOrigin(request);

    if (request.method === "GET" && url.pathname === `${PROJECT_DATA_RECOVERY_API_ROOT}/backups`) {
      sendJson(response, 200, { ok: true, backups: await listProjectDataBackups({ root }) });
      return true;
    }

    if (request.method === "POST" && url.pathname === `${PROJECT_DATA_RECOVERY_API_ROOT}/backups`) {
      sendJson(response, 201, { ok: true, backup: await createProjectDataBackup({ root, now, uuid }) });
      return true;
    }

    if (request.method === "POST" && url.pathname === `${PROJECT_DATA_RECOVERY_API_ROOT}/preview-backup`) {
      const body = await readJsonBody(request);
      sendJson(response, 200, { ok: true, preview: await previewProjectDataBackup(body.backupId, { root }) });
      return true;
    }

    if (request.method === "POST" && url.pathname === `${PROJECT_DATA_RECOVERY_API_ROOT}/restore`) {
      const body = await readJsonBody(request);
      const result = await restoreProjectDataBackup(body.backupId, body.expectedSha256, { root, now, uuid });
      sendJson(response, 200, { ok: true, result });
      return true;
    }

    if (request.method === "GET" && url.pathname === `${PROJECT_DATA_RECOVERY_API_ROOT}/export`) {
      sendJson(response, 200, { ok: true, export: await exportProjectDataSnapshot({ root }) });
      return true;
    }

    if (request.method === "POST" && url.pathname === `${PROJECT_DATA_RECOVERY_API_ROOT}/preview-import`) {
      const body = await readJsonBody(request);
      sendJson(response, 200, { ok: true, preview: await previewProjectDataImport(body.data) });
      return true;
    }

    if (request.method === "POST" && url.pathname === `${PROJECT_DATA_RECOVERY_API_ROOT}/import`) {
      const body = await readJsonBody(request);
      const result = await importProjectDataSnapshot(body.data, body.expectedSha256, { root, now, uuid });
      sendJson(response, 200, { ok: true, result });
      return true;
    }

    sendJson(response, 404, { ok: false, error: "Recovery-API-Route nicht gefunden." });
    return true;
  } catch (error) {
    const statusCode = error instanceof ProjectDataError ? error.statusCode : 500;
    const message = error instanceof ProjectDataError
      ? error.message
      : "Interner Fehler in Recovery & Migration.";
    if (statusCode >= 500 && !(error instanceof ProjectDataError)) {
      console.error(`[PROJECT-DATA-RECOVERY] ${error instanceof Error ? error.stack || error.message : String(error)}`);
    }
    sendJson(response, statusCode, { ok: false, error: message });
    return true;
  }
};
