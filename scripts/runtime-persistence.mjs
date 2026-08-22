import { randomUUID } from "node:crypto";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const RUNTIME_PERSISTENCE_ERROR_KINDS = Object.freeze({
  LOCKED: "LOCKED",
  PERMISSION: "PERMISSION",
  READ_ONLY: "READ_ONLY",
  NO_SPACE: "NO_SPACE",
  TEMP_CREATE: "TEMP_CREATE",
  WRITE_FAILED: "WRITE_FAILED",
  REPLACE_FAILED: "REPLACE_FAILED",
  UNKNOWN: "UNKNOWN",
});

const TRANSIENT_REPLACE_CODES = new Set(["EBUSY", "EPERM"]);
const DEFAULT_REPLACE_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 25;

export class RuntimePersistenceError extends Error {
  constructor(message, {
    kind = RUNTIME_PERSISTENCE_ERROR_KINDS.UNKNOWN,
    code = null,
    phase = "unknown",
    targetPath = null,
    tempPath = null,
    attempts = 0,
    cause = null,
  } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "RuntimePersistenceError";
    this.kind = kind;
    this.code = code;
    this.phase = phase;
    this.targetPath = targetPath;
    this.tempPath = tempPath;
    this.attempts = attempts;
  }
}

const errorCode = (error) => typeof error?.code === "string" ? error.code : null;

export const classifyFilesystemError = (error, { phase = "unknown" } = {}) => {
  const code = errorCode(error);
  if (phase === "replace" && TRANSIENT_REPLACE_CODES.has(code)) {
    return RUNTIME_PERSISTENCE_ERROR_KINDS.LOCKED;
  }
  if (code === "EACCES" || code === "EPERM") return RUNTIME_PERSISTENCE_ERROR_KINDS.PERMISSION;
  if (code === "EROFS") return RUNTIME_PERSISTENCE_ERROR_KINDS.READ_ONLY;
  if (code === "ENOSPC") return RUNTIME_PERSISTENCE_ERROR_KINDS.NO_SPACE;
  if (phase === "temp-create") return RUNTIME_PERSISTENCE_ERROR_KINDS.TEMP_CREATE;
  if (phase === "write") return RUNTIME_PERSISTENCE_ERROR_KINDS.WRITE_FAILED;
  if (phase === "replace") return RUNTIME_PERSISTENCE_ERROR_KINDS.REPLACE_FAILED;
  return RUNTIME_PERSISTENCE_ERROR_KINDS.UNKNOWN;
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const asPersistenceError = (error, context) => {
  if (error instanceof RuntimePersistenceError) return error;
  const kind = classifyFilesystemError(error, { phase: context.phase });
  const code = errorCode(error);
  const detail = code ? ` (${code})` : "";
  return new RuntimePersistenceError(
    `Runtime-Datei konnte in Phase '${context.phase}' nicht sicher gespeichert werden${detail}.`,
    { ...context, kind, code, cause: error },
  );
};

export const atomicReplaceFile = async ({
  targetPath,
  content,
  encoding = "utf8",
  beforeReplace = null,
  replaceAttempts = DEFAULT_REPLACE_ATTEMPTS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  tempId = randomUUID,
  operations = {},
} = {}) => {
  if (typeof targetPath !== "string" || !targetPath || !path.isAbsolute(targetPath)) {
    throw new TypeError("atomicReplaceFile benötigt einen absoluten Zielpfad.");
  }
  if (typeof content !== "string" && !Buffer.isBuffer(content) && !(content instanceof Uint8Array)) {
    throw new TypeError("atomicReplaceFile benötigt Text oder Bytes als Inhalt.");
  }
  if (!Number.isInteger(replaceAttempts) || replaceAttempts < 1 || replaceAttempts > 10) {
    throw new RangeError("replaceAttempts muss zwischen 1 und 10 liegen.");
  }
  if (!Number.isInteger(retryDelayMs) || retryDelayMs < 0 || retryDelayMs > 5000) {
    throw new RangeError("retryDelayMs muss zwischen 0 und 5000 ms liegen.");
  }

  const makeDirectory = operations.mkdir || mkdir;
  const writeTemp = operations.writeFile || writeFile;
  const replace = operations.rename || rename;
  const removeTemp = operations.unlink || unlink;
  const delay = operations.wait || wait;

  try {
    await makeDirectory(path.dirname(targetPath), { recursive: true });
  } catch (error) {
    throw asPersistenceError(error, {
      phase: "prepare-directory",
      targetPath,
      tempPath: null,
      attempts: 0,
    });
  }

  const tempPath = `${targetPath}.tmp-${process.pid}-${tempId()}`;
  let tempCreated = false;

  try {
    try {
      await writeTemp(tempPath, content, { encoding, flag: "wx" });
      tempCreated = true;
    } catch (error) {
      const phase = errorCode(error) === "EEXIST" ? "temp-create" : "write";
      if (phase === "write") await removeTemp(tempPath).catch(() => {});
      throw asPersistenceError(error, { phase, targetPath, tempPath, attempts: 0 });
    }

    if (beforeReplace) await beforeReplace({ tempPath, targetPath });

    let lastError = null;
    for (let attempt = 1; attempt <= replaceAttempts; attempt += 1) {
      try {
        await replace(tempPath, targetPath);
        tempCreated = false;
        return { targetPath, tempPath, attempts: attempt };
      } catch (error) {
        lastError = error;
        const transient = TRANSIENT_REPLACE_CODES.has(errorCode(error));
        if (!transient || attempt >= replaceAttempts) {
          throw asPersistenceError(error, {
            phase: "replace",
            targetPath,
            tempPath,
            attempts: attempt,
          });
        }
        if (retryDelayMs > 0) await delay(retryDelayMs * attempt);
      }
    }

    throw asPersistenceError(lastError, {
      phase: "replace",
      targetPath,
      tempPath,
      attempts: replaceAttempts,
    });
  } finally {
    if (tempCreated) await removeTemp(tempPath).catch(() => {});
  }
};
