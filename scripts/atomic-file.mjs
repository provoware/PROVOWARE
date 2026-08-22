import { randomUUID } from "node:crypto";
import { open, rename, unlink } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export const WINDOWS_TRANSIENT_RENAME_CODES = Object.freeze([
  "EPERM",
  "EACCES",
  "EBUSY",
]);

export const DEFAULT_WINDOWS_RENAME_RETRY_DELAYS_MS = Object.freeze([
  20,
  50,
  100,
  200,
  400,
]);

const defaultSleep = (milliseconds) => new Promise((resolve) => {
  setTimeout(resolve, milliseconds);
});

const normalizeRetryDelays = (value) => {
  if (!Array.isArray(value)) throw new TypeError("retryDelaysMs muss eine Liste sein.");
  if (value.some((delay) => !Number.isInteger(delay) || delay < 0 || delay > 10_000)) {
    throw new TypeError("retryDelaysMs darf nur Millisekunden zwischen 0 und 10000 enthalten.");
  }
  return value;
};

export const isTransientRenameError = (error, platform = process.platform) => (
  platform === "win32"
  && error
  && WINDOWS_TRANSIENT_RENAME_CODES.includes(String(error.code || ""))
);

export const renameWithRetry = async (
  oldPath,
  newPath,
  {
    platform = process.platform,
    renameFn = rename,
    sleepFn = defaultSleep,
    retryDelaysMs = DEFAULT_WINDOWS_RENAME_RETRY_DELAYS_MS,
  } = {},
) => {
  const delays = normalizeRetryDelays(retryDelaysMs);
  let retries = 0;

  while (true) {
    try {
      await renameFn(oldPath, newPath);
      return { attempts: retries + 1, retries };
    } catch (error) {
      if (!isTransientRenameError(error, platform) || retries >= delays.length) {
        throw error;
      }
      const delayMs = delays[retries];
      retries += 1;
      await sleepFn(delayMs);
    }
  }
};

export const atomicReplaceFile = async (
  filePath,
  data,
  {
    encoding = "utf8",
    beforeRename = null,
    platform = process.platform,
    retryDelaysMs = DEFAULT_WINDOWS_RENAME_RETRY_DELAYS_MS,
    uuid = randomUUID,
    openFn = open,
    renameFn = rename,
    unlinkFn = unlink,
    sleepFn = defaultSleep,
  } = {},
) => {
  if (typeof filePath !== "string" || !filePath.trim()) {
    throw new TypeError("filePath muss ein nichtleerer Pfad sein.");
  }
  if (beforeRename !== null && typeof beforeRename !== "function") {
    throw new TypeError("beforeRename muss eine Funktion oder null sein.");
  }
  if (typeof uuid !== "function") throw new TypeError("uuid muss eine Funktion sein.");

  const normalizedPath = path.normalize(filePath);
  const tempPath = `${normalizedPath}.tmp-${process.pid}-${uuid()}`;
  if (path.dirname(tempPath) !== path.dirname(normalizedPath)) {
    throw new Error("Temporäre Datei muss im selben Verzeichnis wie die Zieldatei liegen.");
  }

  let handle = null;
  let tempOwned = false;
  let replaced = false;

  try {
    handle = await openFn(tempPath, "wx");
    tempOwned = true;
    await handle.writeFile(data, { encoding });
    await handle.sync();
    await handle.close();
    handle = null;

    if (beforeRename) await beforeRename({ tempPath, filePath: normalizedPath });

    const renameResult = await renameWithRetry(tempPath, normalizedPath, {
      platform,
      renameFn,
      sleepFn,
      retryDelaysMs,
    });
    replaced = true;
    return {
      filePath: normalizedPath,
      tempPath,
      renameAttempts: renameResult.attempts,
      renameRetries: renameResult.retries,
    };
  } finally {
    if (handle) await handle.close().catch(() => {});
    if (tempOwned && !replaced) await unlinkFn(tempPath).catch(() => {});
  }
};
