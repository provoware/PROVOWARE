import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { atomicReplaceFile } from "./atomic-file.mjs";
import {
  PROJECT_DATABASE_RELATIVE_PATH,
  ProjectDataError,
  validateStoredDatabase,
  withMutationLock,
} from "./project-data-service.mjs";
import {
  DATA_STUDIO_PRO_RELATIVE_PATH,
  validateStoredDataStudioPro,
} from "./data-studio-pro-service.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const RECOVERY_ENVELOPE_FORMAT = "provoware-recovery-envelope";
export const RECOVERY_ENVELOPE_FORMAT_VERSION = 1;
export const RECOVERY_ENVELOPE_LIMIT = 10;
export const RECOVERY_ENVELOPE_RELATIVE_DIR = "data/backups/project-envelope";
export const RECOVERY_SAFETY_RELATIVE_DIR = "data/recovery/safety-envelopes";
export const RECOVERY_JOURNAL_RELATIVE_PATH = "data/recovery/recovery-envelope-journal.json";
export const RECOVERY_ENVELOPE_API_ROOT = "/api/provoware/project-data/recovery/envelopes";

const JOURNAL_FORMAT = "provoware-recovery-envelope-journal";
const JOURNAL_FORMAT_VERSION = 1;
const MAX_REQUEST_BYTES = 256 * 1024;
const SHA_PATTERN = /^[0-9a-f]{64}$/;
const UUID_V4_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const ENVELOPE_ID_PATTERN = new RegExp(`^project-envelope-\\d{8}T\\d{6}Z-${UUID_V4_PATTERN}\\.pwenvelope$`);
const SAFETY_ID_PATTERN = new RegExp(`^safety-envelope-\\d{8}T\\d{6}Z-${UUID_V4_PATTERN}\\.pwenvelope$`);

const COMPONENTS = Object.freeze([
  Object.freeze({
    id: "project-data",
    relativePath: PROJECT_DATABASE_RELATIVE_PATH,
    validate: validateStoredDatabase,
  }),
  Object.freeze({
    id: "data-studio-pro",
    relativePath: DATA_STUDIO_PRO_RELATIVE_PATH,
    validate: validateStoredDataStudioPro,
  }),
]);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalJson = (value) => JSON.stringify(value);
const prettyJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

const compactUtcTimestamp = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new TypeError("Ungültiger Envelope-Zeitpunkt.");
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
};

const errorText = (error) => error instanceof Error ? error.message : String(error);
const envelopeDirectory = (root) => path.join(root, RECOVERY_ENVELOPE_RELATIVE_DIR);
const safetyDirectory = (root) => path.join(root, RECOVERY_SAFETY_RELATIVE_DIR);
const journalPath = (root) => path.join(root, RECOVERY_JOURNAL_RELATIVE_PATH);
const componentPath = (root, definition) => path.join(root, definition.relativePath);

const envelopePath = (root, envelopeId) => {
  if (typeof envelopeId !== "string" || !ENVELOPE_ID_PATTERN.test(envelopeId)) {
    throw new ProjectDataError("Ungültige Recovery-Envelope-ID.", 400);
  }
  return path.join(envelopeDirectory(root), envelopeId);
};

const safetyPath = (root, safetyId) => {
  if (typeof safetyId !== "string" || !SAFETY_ID_PATTERN.test(safetyId)) {
    throw new ProjectDataError("Ungültige Safety-Envelope-ID.", 500);
  }
  return path.join(safetyDirectory(root), safetyId);
};

const projectDataSummary = (data) => ({
  schemaVersion: data.schemaVersion,
  revision: data.revision,
  templates: data.templates.length,
  records: data.records.length,
});

const proSummary = (data) => ({
  schemaVersion: data.schemaVersion,
  revision: data.revision,
  categories: data.categories.length,
  assignments: data.templateCategories.length,
  savedViews: data.savedViews.length,
});

const summaryFor = (definition, data) => definition.id === "project-data"
  ? projectDataSummary(data)
  : proSummary(data);

const inspectComponentBytes = (definition, bytes) => {
  let parsed = null;
  let schemaVersion = null;
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
    schemaVersion = parsed?.schemaVersion ?? null;
    definition.validate(parsed);
    return {
      state: "valid",
      schemaVersion,
      summary: summaryFor(definition, parsed),
      validationError: null,
    };
  } catch (error) {
    if (parsed && schemaVersion === null) schemaVersion = parsed.schemaVersion ?? null;
    return {
      state: "invalid",
      schemaVersion,
      summary: null,
      validationError: errorText(error),
    };
  }
};

const readLiveComponent = async (root, definition) => {
  const filePath = componentPath(root, definition);
  let bytes;
  try {
    bytes = await readFile(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        id: definition.id,
        path: definition.relativePath,
        state: "missing",
        bytes: 0,
        sha256: null,
        schemaVersion: null,
        summary: null,
        validationError: null,
        contentBase64: null,
      };
    }
    throw error;
  }

  const inspection = inspectComponentBytes(definition, bytes);
  return {
    id: definition.id,
    path: definition.relativePath,
    ...inspection,
    bytes: bytes.length,
    sha256: sha256(bytes),
    contentBase64: bytes.toString("base64"),
  };
};

const envelopePayload = ({ purpose, createdAt, components }) => ({
  format: RECOVERY_ENVELOPE_FORMAT,
  formatVersion: RECOVERY_ENVELOPE_FORMAT_VERSION,
  purpose,
  createdAt,
  components,
});

const bindEnvelope = (payload) => ({
  ...payload,
  envelopeSha256: sha256(Buffer.from(canonicalJson(payload), "utf8")),
});

const createEnvelopeObjectFromLive = async (
  root,
  { purpose = "backup", now = () => new Date() } = {},
) => {
  const createdAt = now().toISOString();
  const components = [];
  for (const definition of COMPONENTS) components.push(await readLiveComponent(root, definition));
  return bindEnvelope(envelopePayload({ purpose, createdAt, components }));
};

const decodeCanonicalBase64 = (value, label) => {
  if (typeof value !== "string") throw new ProjectDataError(`${label}: Base64-Inhalt fehlt.`, 409);
  const bytes = Buffer.from(value, "base64");
  if (bytes.toString("base64") !== value) throw new ProjectDataError(`${label}: Base64-Inhalt ist nicht kanonisch.`, 409);
  return bytes;
};

const validateEnvelopeObject = (envelope, { expectedPurpose = null } = {}) => {
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
    throw new ProjectDataError("Recovery Envelope hat kein gültiges Wurzelobjekt.", 409);
  }
  if (envelope.format !== RECOVERY_ENVELOPE_FORMAT || envelope.formatVersion !== RECOVERY_ENVELOPE_FORMAT_VERSION) {
    throw new ProjectDataError("Recovery Envelope verwendet ein unbekanntes Format.", 409);
  }
  if (!new Set(["backup", "safety"]).has(envelope.purpose)) {
    throw new ProjectDataError("Recovery Envelope enthält einen ungültigen Zweck.", 409);
  }
  if (expectedPurpose && envelope.purpose !== expectedPurpose) {
    throw new ProjectDataError(`Recovery Envelope ist kein ${expectedPurpose}-Envelope.`, 409);
  }
  if (typeof envelope.createdAt !== "string" || Number.isNaN(Date.parse(envelope.createdAt))) {
    throw new ProjectDataError("Recovery Envelope enthält keinen gültigen Zeitstempel.", 409);
  }
  if (!Array.isArray(envelope.components) || envelope.components.length !== COMPONENTS.length) {
    throw new ProjectDataError("Recovery Envelope benötigt exakt zwei Komponenten.", 409);
  }
  if (typeof envelope.envelopeSha256 !== "string" || !SHA_PATTERN.test(envelope.envelopeSha256)) {
    throw new ProjectDataError("Recovery Envelope enthält keine gültige Gesamtprüfsumme.", 409);
  }

  const expectedPayload = envelopePayload({
    purpose: envelope.purpose,
    createdAt: envelope.createdAt,
    components: envelope.components,
  });
  const actualEnvelopeSha = sha256(Buffer.from(canonicalJson(expectedPayload), "utf8"));
  if (actualEnvelopeSha !== envelope.envelopeSha256) {
    throw new ProjectDataError("Recovery Envelope wurde nach seiner Erstellung verändert.", 409);
  }

  const byId = new Map(envelope.components.map((component) => [component?.id, component]));
  if (byId.size !== COMPONENTS.length) throw new ProjectDataError("Recovery Envelope enthält doppelte Komponenten.", 409);

  for (const definition of COMPONENTS) {
    const component = byId.get(definition.id);
    if (!component || component.path !== definition.relativePath) {
      throw new ProjectDataError(`Recovery Envelope: Komponente '${definition.id}' fehlt oder hat einen falschen Pfad.`, 409);
    }
    if (!new Set(["valid", "invalid", "missing"]).has(component.state)) {
      throw new ProjectDataError(`Recovery Envelope: Komponente '${definition.id}' hat einen ungültigen Zustand.`, 409);
    }

    if (component.state === "missing") {
      if (component.bytes !== 0 || component.sha256 !== null || component.contentBase64 !== null) {
        throw new ProjectDataError(`Recovery Envelope: fehlende Komponente '${definition.id}' enthält unerwartete Bytes.`, 409);
      }
      continue;
    }

    if (!Number.isInteger(component.bytes) || component.bytes < 0) {
      throw new ProjectDataError(`Recovery Envelope: Byte-Länge von '${definition.id}' ist ungültig.`, 409);
    }
    if (typeof component.sha256 !== "string" || !SHA_PATTERN.test(component.sha256)) {
      throw new ProjectDataError(`Recovery Envelope: SHA-256 von '${definition.id}' ist ungültig.`, 409);
    }
    const bytes = decodeCanonicalBase64(component.contentBase64, `Komponente '${definition.id}'`);
    if (bytes.length !== component.bytes || sha256(bytes) !== component.sha256) {
      throw new ProjectDataError(`Recovery Envelope: Rohbytes von '${definition.id}' stimmen nicht mit Metadaten überein.`, 409);
    }
    if (component.state === "valid") {
      const inspection = inspectComponentBytes(definition, bytes);
      if (inspection.state !== "valid") {
        throw new ProjectDataError(`Recovery Envelope: als gültig markierte Komponente '${definition.id}' ist nicht validierbar.`, 409);
      }
    }
  }

  return envelope;
};

const readEnvelopeAtPath = async (filePath, { expectedPurpose = null, missingMessage = "Recovery Envelope wurde nicht gefunden." } = {}) => {
  let source;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") throw new ProjectDataError(missingMessage, 404);
    throw error;
  }
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    throw new ProjectDataError(`Recovery Envelope enthält beschädigtes JSON: ${error.message}`, 409);
  }
  return {
    source,
    envelope: validateEnvelopeObject(parsed, { expectedPurpose }),
    fileSha256: sha256(Buffer.from(source, "utf8")),
  };
};

const readBackupEnvelope = (root, envelopeId) => readEnvelopeAtPath(envelopePath(root, envelopeId), {
  expectedPurpose: "backup",
  missingMessage: `Recovery Envelope '${envelopeId}' wurde nicht gefunden.`,
});

const readSafetyEnvelope = (root, safetyId) => readEnvelopeAtPath(safetyPath(root, safetyId), {
  expectedPurpose: "safety",
  missingMessage: `Safety Envelope '${safetyId}' wurde nicht gefunden.`,
});

const writeEnvelopeFile = async (filePath, envelope) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  await atomicReplaceFile(filePath, prettyJson(envelope));
};

const listEnvelopeIds = async (root) => {
  try {
    const names = await readdir(envelopeDirectory(root));
    return names.filter((name) => ENVELOPE_ID_PATTERN.test(name)).sort().reverse();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
};

const rotateEnvelopesUnlocked = async (root, limit = RECOVERY_ENVELOPE_LIMIT) => {
  if (!Number.isInteger(limit) || limit < 1) throw new ProjectDataError("Envelope-Limit muss mindestens 1 sein.");
  const ids = await listEnvelopeIds(root);
  const excess = ids.slice(limit);
  for (const id of excess) {
    await unlink(envelopePath(root, id)).catch((error) => {
      if (error?.code !== "ENOENT") throw error;
    });
  }
  return { kept: Math.min(ids.length, limit), removed: excess };
};

const createBackupEnvelopeUnlocked = async (
  { root = ROOT, now = () => new Date(), uuid = randomUUID, limit = RECOVERY_ENVELOPE_LIMIT } = {},
) => {
  const timestamp = now();
  const id = `project-envelope-${compactUtcTimestamp(timestamp)}-${uuid()}.pwenvelope`;
  const envelope = await createEnvelopeObjectFromLive(root, { purpose: "backup", now: () => timestamp });
  await writeEnvelopeFile(envelopePath(root, id), envelope);
  const rotation = await rotateEnvelopesUnlocked(root, limit);
  return {
    id,
    createdAt: envelope.createdAt,
    envelopeSha256: envelope.envelopeSha256,
    components: envelope.components.map(componentPreview),
    restorable: envelope.components.every((item) => item.state === "valid"),
    rotation,
  };
};

const createSafetyEnvelopeUnlocked = async (
  { root = ROOT, now = () => new Date(), uuid = randomUUID } = {},
) => {
  const timestamp = now();
  const id = `safety-envelope-${compactUtcTimestamp(timestamp)}-${uuid()}.pwenvelope`;
  const envelope = await createEnvelopeObjectFromLive(root, { purpose: "safety", now: () => timestamp });
  await writeEnvelopeFile(safetyPath(root, id), envelope);
  return { id, envelope };
};

const componentPreview = (component) => ({
  id: component.id,
  path: component.path,
  state: component.state,
  bytes: component.bytes,
  sha256: component.sha256,
  schemaVersion: component.schemaVersion ?? null,
  summary: component.summary ?? null,
  validationError: component.validationError ?? null,
});

export const listRecoveryEnvelopes = async ({ root = ROOT } = {}) => {
  const ids = await listEnvelopeIds(root);
  const results = [];
  for (const id of ids) {
    const filePath = envelopePath(root, id);
    const info = await stat(filePath);
    try {
      const { source, envelope } = await readBackupEnvelope(root, id);
      results.push({
        id,
        createdAt: envelope.createdAt,
        fileModifiedAt: info.mtime.toISOString(),
        bytes: Buffer.byteLength(source),
        envelopeSha256: envelope.envelopeSha256,
        valid: true,
        restorable: envelope.components.every((item) => item.state === "valid"),
        components: envelope.components.map(componentPreview),
        error: null,
      });
    } catch (error) {
      results.push({
        id,
        createdAt: info.mtime.toISOString(),
        fileModifiedAt: info.mtime.toISOString(),
        bytes: info.size,
        envelopeSha256: null,
        valid: false,
        restorable: false,
        components: [],
        error: errorText(error),
      });
    }
  }
  return results;
};

export const previewRecoveryEnvelope = async (envelopeId, { root = ROOT } = {}) => {
  const { source, envelope, fileSha256 } = await readBackupEnvelope(root, envelopeId);
  return {
    envelopeId,
    format: envelope.format,
    formatVersion: envelope.formatVersion,
    createdAt: envelope.createdAt,
    envelopeSha256: envelope.envelopeSha256,
    fileSha256,
    bytes: Buffer.byteLength(source),
    restorable: envelope.components.every((item) => item.state === "valid"),
    components: envelope.components.map(componentPreview),
  };
};

const assertExpectedEnvelopeSha = (expectedSha256, actualSha256) => {
  if (typeof expectedSha256 !== "string" || !SHA_PATTERN.test(expectedSha256)) {
    throw new ProjectDataError("Envelope-Restore benötigt eine gültige SHA-256-Bestätigung.");
  }
  if (expectedSha256 !== actualSha256) {
    throw new ProjectDataError("Recovery Envelope hat sich seit der Vorschau geändert. Restore wurde abgebrochen.", 409);
  }
};

const bytesFromComponent = (component) => component.state === "missing"
  ? null
  : decodeCanonicalBase64(component.contentBase64, `Komponente '${component.id}'`);

const componentsById = (envelope) => new Map(envelope.components.map((component) => [component.id, component]));

const validateRestoreTarget = (envelope) => {
  const byId = componentsById(envelope);
  for (const definition of COMPONENTS) {
    const component = byId.get(definition.id);
    if (component.state !== "valid") {
      throw new ProjectDataError(
        `Recovery Envelope ist nicht vollständig wiederherstellbar: '${definition.id}' hat Zustand '${component.state}'.`,
        409,
      );
    }
    const bytes = bytesFromComponent(component);
    const inspection = inspectComponentBytes(definition, bytes);
    if (inspection.state !== "valid") {
      throw new ProjectDataError(`Recovery Envelope enthält für '${definition.id}' keine gültigen Live-Daten.`, 409);
    }
  }
  return byId;
};

const journalPayload = (journal) => ({
  format: JOURNAL_FORMAT,
  formatVersion: JOURNAL_FORMAT_VERSION,
  transactionId: journal.transactionId,
  stage: journal.stage,
  targetEnvelopeId: journal.targetEnvelopeId,
  targetEnvelopeSha256: journal.targetEnvelopeSha256,
  safetyEnvelopeId: journal.safetyEnvelopeId,
  appliedComponents: journal.appliedComponents,
  createdAt: journal.createdAt,
  updatedAt: journal.updatedAt,
  primaryError: journal.primaryError ?? null,
  rollbackError: journal.rollbackError ?? null,
});

const writeJournal = async (root, journal) => {
  const payload = journalPayload(journal);
  await mkdir(path.dirname(journalPath(root)), { recursive: true });
  await atomicReplaceFile(journalPath(root), prettyJson(payload));
  return payload;
};

const readJournalUnlocked = async (root) => {
  let source;
  try {
    source = await readFile(journalPath(root), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
  let journal;
  try {
    journal = JSON.parse(source);
  } catch (error) {
    throw new ProjectDataError(`Recovery-Journal ist beschädigt: ${error.message}`, 500);
  }
  if (
    journal?.format !== JOURNAL_FORMAT
    || journal.formatVersion !== JOURNAL_FORMAT_VERSION
    || typeof journal.transactionId !== "string"
    || typeof journal.stage !== "string"
    || typeof journal.safetyEnvelopeId !== "string"
    || !Array.isArray(journal.appliedComponents)
  ) {
    throw new ProjectDataError("Recovery-Journal hat einen ungültigen Vertrag.", 500);
  }
  return journal;
};

const removeJournal = async (root) => {
  await unlink(journalPath(root)).catch((error) => {
    if (error?.code !== "ENOENT") throw error;
  });
};

const removeSafetyEnvelope = async (root, safetyId) => {
  await unlink(safetyPath(root, safetyId)).catch((error) => {
    if (error?.code !== "ENOENT") throw error;
  });
};

const invokeFailure = async (failureInjector, stage, context = {}) => {
  if (typeof failureInjector === "function") await failureInjector(stage, context);
};

const replaceComponentRaw = async (root, definition, component) => {
  const filePath = componentPath(root, definition);
  if (component.state === "missing") {
    await unlink(filePath).catch((error) => {
      if (error?.code !== "ENOENT") throw error;
    });
    return;
  }
  const bytes = bytesFromComponent(component);
  await mkdir(path.dirname(filePath), { recursive: true });
  await atomicReplaceFile(filePath, bytes, { encoding: undefined });
};

const liveMatchesComponent = async (root, definition, component) => {
  const filePath = componentPath(root, definition);
  if (component.state === "missing") {
    try {
      await stat(filePath);
      return false;
    } catch (error) {
      if (error?.code === "ENOENT") return true;
      throw error;
    }
  }
  try {
    const bytes = await readFile(filePath);
    return bytes.length === component.bytes && sha256(bytes) === component.sha256;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
};

const verifyLiveAgainstEnvelope = async (root, envelope) => {
  const byId = componentsById(envelope);
  for (const definition of COMPONENTS) {
    if (!(await liveMatchesComponent(root, definition, byId.get(definition.id)))) {
      throw new ProjectDataError(`Live-Komponente '${definition.id}' stimmt nach Recovery nicht mit dem Envelope überein.`, 500);
    }
  }
  return true;
};

const rollbackFromSafetyUnlocked = async (
  root,
  journal,
  { failureInjector = null } = {},
) => {
  const { envelope: safety } = await readSafetyEnvelope(root, journal.safetyEnvelopeId);
  const byId = componentsById(safety);

  await invokeFailure(failureInjector, "rollback-before-project-data", { journal });
  await replaceComponentRaw(root, COMPONENTS[0], byId.get(COMPONENTS[0].id));
  await invokeFailure(failureInjector, "rollback-after-project-data", { journal });
  await replaceComponentRaw(root, COMPONENTS[1], byId.get(COMPONENTS[1].id));
  await invokeFailure(failureInjector, "rollback-after-data-studio-pro", { journal });
  await verifyLiveAgainstEnvelope(root, safety);

  const rolledBack = await writeJournal(root, {
    ...journal,
    stage: "ROLLED_BACK",
    updatedAt: new Date().toISOString(),
    rollbackError: null,
  });
  await removeJournal(root);
  await removeSafetyEnvelope(root, journal.safetyEnvelopeId);
  return rolledBack;
};

const recoverInterruptedEnvelopeTransactionUnlocked = async (
  { root = ROOT, failureInjector = null } = {},
) => {
  const journal = await readJournalUnlocked(root);
  if (!journal) return { recovered: false, action: "none" };

  if (journal.stage === "COMMITTED") {
    try {
      const { envelope: target } = await readBackupEnvelope(root, journal.targetEnvelopeId);
      if (target.envelopeSha256 === journal.targetEnvelopeSha256) {
        await verifyLiveAgainstEnvelope(root, target);
        await removeJournal(root);
        await removeSafetyEnvelope(root, journal.safetyEnvelopeId);
        return { recovered: true, action: "finalized-commit", transactionId: journal.transactionId };
      }
    } catch {
      // Commit konnte nicht sicher bestätigt werden; Safety-Rollback folgt.
    }
  }

  if (journal.stage === "ROLLED_BACK") {
    await removeJournal(root);
    await removeSafetyEnvelope(root, journal.safetyEnvelopeId);
    return { recovered: true, action: "finalized-rollback", transactionId: journal.transactionId };
  }

  try {
    await rollbackFromSafetyUnlocked(root, journal, { failureInjector });
    return { recovered: true, action: "rolled-back-interrupted-transaction", transactionId: journal.transactionId };
  } catch (error) {
    await writeJournal(root, {
      ...journal,
      stage: "ROLLBACK_FAILED",
      updatedAt: new Date().toISOString(),
      rollbackError: errorText(error),
    }).catch(() => {});
    throw new ProjectDataError(`Unterbrochene Recovery konnte nicht sicher zurückgerollt werden: ${errorText(error)}`, 500);
  }
};

export const recoverInterruptedEnvelopeTransaction = (options = {}) =>
  withMutationLock(() => recoverInterruptedEnvelopeTransactionUnlocked(options));

export const readRecoveryEnvelopeJournalStatus = async ({ root = ROOT } = {}) => {
  const journal = await readJournalUnlocked(root);
  return journal ? journalPayload(journal) : null;
};

export const createRecoveryEnvelope = (options = {}) => withMutationLock(async () => {
  await recoverInterruptedEnvelopeTransactionUnlocked({ root: options.root ?? ROOT });
  return createBackupEnvelopeUnlocked(options);
});

export const restoreRecoveryEnvelope = (
  envelopeId,
  expectedSha256,
  {
    root = ROOT,
    now = () => new Date(),
    uuid = randomUUID,
    failureInjector = null,
    rollbackFailureInjector = null,
  } = {},
) => withMutationLock(async () => {
  await recoverInterruptedEnvelopeTransactionUnlocked({ root });

  const { envelope: target } = await readBackupEnvelope(root, envelopeId);
  assertExpectedEnvelopeSha(expectedSha256, target.envelopeSha256);
  const targetById = validateRestoreTarget(target);
  const safety = await createSafetyEnvelopeUnlocked({ root, now, uuid });
  const timestamp = now().toISOString();
  let journal = await writeJournal(root, {
    transactionId: uuid(),
    stage: "PREPARED",
    targetEnvelopeId: envelopeId,
    targetEnvelopeSha256: target.envelopeSha256,
    safetyEnvelopeId: safety.id,
    appliedComponents: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    primaryError: null,
    rollbackError: null,
  });

  try {
    await invokeFailure(failureInjector, "before-project-data", { journal, target });
    await replaceComponentRaw(root, COMPONENTS[0], targetById.get(COMPONENTS[0].id));
    journal = await writeJournal(root, {
      ...journal,
      stage: "PROJECT_DATA_APPLIED",
      appliedComponents: [COMPONENTS[0].id],
      updatedAt: now().toISOString(),
    });

    await invokeFailure(failureInjector, "after-project-data", { journal, target });
    await replaceComponentRaw(root, COMPONENTS[1], targetById.get(COMPONENTS[1].id));
    journal = await writeJournal(root, {
      ...journal,
      stage: "DATA_STUDIO_PRO_APPLIED",
      appliedComponents: [COMPONENTS[0].id, COMPONENTS[1].id],
      updatedAt: now().toISOString(),
    });

    await invokeFailure(failureInjector, "after-data-studio-pro", { journal, target });
    await invokeFailure(failureInjector, "before-verification", { journal, target });
    await verifyLiveAgainstEnvelope(root, target);
    journal = await writeJournal(root, {
      ...journal,
      stage: "VERIFIED",
      updatedAt: now().toISOString(),
    });

    journal = await writeJournal(root, {
      ...journal,
      stage: "COMMITTED",
      updatedAt: now().toISOString(),
    });
    await removeJournal(root);
    await removeSafetyEnvelope(root, safety.id);
    return {
      transactionId: journal.transactionId,
      restoredEnvelopeId: envelopeId,
      envelopeSha256: target.envelopeSha256,
      components: target.components.map(componentPreview),
      rolledBack: false,
    };
  } catch (error) {
    const primaryError = errorText(error);
    journal = await writeJournal(root, {
      ...journal,
      stage: "ROLLBACK_REQUIRED",
      updatedAt: now().toISOString(),
      primaryError,
    }).catch(() => ({ ...journal, stage: "ROLLBACK_REQUIRED", primaryError }));

    try {
      await rollbackFromSafetyUnlocked(root, journal, { failureInjector: rollbackFailureInjector });
    } catch (rollbackError) {
      await writeJournal(root, {
        ...journal,
        stage: "ROLLBACK_FAILED",
        updatedAt: now().toISOString(),
        rollbackError: errorText(rollbackError),
      }).catch(() => {});
      throw new ProjectDataError(
        `Envelope-Restore fehlgeschlagen und Rollback ist ebenfalls fehlgeschlagen. Primär: ${primaryError}. Rollback: ${errorText(rollbackError)}`,
        500,
      );
    }

    throw new ProjectDataError(`Envelope-Restore fehlgeschlagen und wurde vollständig zurückgerollt: ${primaryError}`, 500);
  }
});

export const isProtectedRecoveryEnvelopePath = (filePath, root = ROOT) => {
  const resolved = path.resolve(filePath);
  const backupRoot = path.resolve(root, RECOVERY_ENVELOPE_RELATIVE_DIR);
  const recoveryRoot = path.resolve(root, "data/recovery");
  return resolved.startsWith(`${backupRoot}${path.sep}`)
    || resolved === backupRoot
    || resolved.startsWith(`${recoveryRoot}${path.sep}`)
    || resolved === recoveryRoot;
};

const readJsonBody = async (request) => {
  const contentType = String(request.headers["content-type"] || "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    throw new ProjectDataError("Envelope-API erwartet Content-Type application/json.", 415);
  }
  let bytes = 0;
  const chunks = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_REQUEST_BYTES) throw new ProjectDataError("Envelope-Anfrage ist zu groß.", 413);
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ProjectDataError("Envelope-Anfrage enthält ungültiges JSON.");
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
  if (origin !== expected) throw new ProjectDataError("Envelope-Zugriff von fremder Herkunft wurde blockiert.", 403);
};

export const handleRecoveryEnvelopeApi = async (
  request,
  response,
  { root = ROOT, now = () => new Date(), uuid = randomUUID } = {},
) => {
  const url = new URL(request.url || "/", "http://localhost");
  if (!url.pathname.startsWith(RECOVERY_ENVELOPE_API_ROOT)) return false;

  try {
    checkSameOrigin(request);

    if (request.method === "GET" && url.pathname === RECOVERY_ENVELOPE_API_ROOT) {
      sendJson(response, 200, { ok: true, envelopes: await listRecoveryEnvelopes({ root }) });
      return true;
    }
    if (request.method === "POST" && url.pathname === RECOVERY_ENVELOPE_API_ROOT) {
      sendJson(response, 201, { ok: true, envelope: await createRecoveryEnvelope({ root, now, uuid }) });
      return true;
    }
    if (request.method === "POST" && url.pathname === `${RECOVERY_ENVELOPE_API_ROOT}/preview`) {
      const body = await readJsonBody(request);
      sendJson(response, 200, { ok: true, preview: await previewRecoveryEnvelope(body.envelopeId, { root }) });
      return true;
    }
    if (request.method === "POST" && url.pathname === `${RECOVERY_ENVELOPE_API_ROOT}/restore`) {
      const body = await readJsonBody(request);
      const result = await restoreRecoveryEnvelope(body.envelopeId, body.expectedSha256, { root, now, uuid });
      sendJson(response, 200, { ok: true, result });
      return true;
    }
    if (request.method === "GET" && url.pathname === `${RECOVERY_ENVELOPE_API_ROOT}/journal`) {
      sendJson(response, 200, { ok: true, journal: await readRecoveryEnvelopeJournalStatus({ root }) });
      return true;
    }

    sendJson(response, 404, { ok: false, error: "Envelope-API-Route nicht gefunden." });
    return true;
  } catch (error) {
    const statusCode = error instanceof ProjectDataError ? error.statusCode : 500;
    const message = error instanceof ProjectDataError
      ? error.message
      : "Interner Fehler im Recovery Envelope.";
    if (statusCode >= 500 && !(error instanceof ProjectDataError)) {
      console.error(`[RECOVERY-ENVELOPE] ${error instanceof Error ? error.stack || error.message : String(error)}`);
    }
    sendJson(response, statusCode, { ok: false, error: message });
    return true;
  }
};
