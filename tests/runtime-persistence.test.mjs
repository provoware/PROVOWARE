import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  RUNTIME_PERSISTENCE_ERROR_KINDS,
  RuntimePersistenceError,
  atomicReplaceFile,
  classifyFilesystemError,
} from "../scripts/runtime-persistence.mjs";

const temporaryRoot = async () => mkdtemp(path.join(os.tmpdir(), "provoware-runtime-persistence-"));
const errorWithCode = (code, message = code) => Object.assign(new Error(message), { code });

const tempEntries = async (root, basename) => (await readdir(root))
  .filter((name) => name.startsWith(`${basename}.tmp-`));

test("atomicReplaceFile ersetzt vorhandene Datei über Temp-Datei im selben Verzeichnis", async () => {
  const root = await temporaryRoot();
  try {
    const targetPath = path.join(root, "runtime.json");
    await writeFile(targetPath, "alt\n", "utf8");
    const result = await atomicReplaceFile({
      targetPath,
      content: "neu\n",
      tempId: () => "fixed",
      retryDelayMs: 0,
    });
    assert.equal(await readFile(targetPath, "utf8"), "neu\n");
    assert.equal(result.attempts, 1);
    assert.equal(path.dirname(result.tempPath), root);
    assert.deepEqual(await tempEntries(root, "runtime.json"), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Failure-Injection vor Replace lässt Live-Datei bytegenau unverändert und räumt Temp auf", async () => {
  const root = await temporaryRoot();
  const injected = new Error("H1_FAILPOINT_BEFORE_REPLACE");
  try {
    const targetPath = path.join(root, "runtime.json");
    await writeFile(targetPath, Buffer.from([0, 1, 2, 3, 255]));
    const before = await readFile(targetPath);
    await assert.rejects(
      atomicReplaceFile({
        targetPath,
        content: "darf-nicht-live-werden",
        tempId: () => "failpoint",
        beforeReplace: async () => { throw injected; },
      }),
      (error) => error === injected,
    );
    assert.deepEqual(await readFile(targetPath), before);
    assert.deepEqual(await tempEntries(root, "runtime.json"), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("transienter EPERM-Replace wird begrenzt wiederholt und danach erfolgreich abgeschlossen", async () => {
  const root = await temporaryRoot();
  try {
    const targetPath = path.join(root, "runtime.json");
    await writeFile(targetPath, "alt", "utf8");
    let attempts = 0;
    const delays = [];
    const result = await atomicReplaceFile({
      targetPath,
      content: "neu",
      replaceAttempts: 3,
      retryDelayMs: 7,
      tempId: () => "retry",
      operations: {
        rename: async (source, target) => {
          attempts += 1;
          if (attempts < 3) throw errorWithCode("EPERM", "temporär gesperrt");
          await rename(source, target);
        },
        wait: async (milliseconds) => { delays.push(milliseconds); },
      },
    });
    assert.equal(attempts, 3);
    assert.equal(result.attempts, 3);
    assert.deepEqual(delays, [7, 14]);
    assert.equal(await readFile(targetPath, "utf8"), "neu");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("permanenter EACCES-Replace bricht beim ersten Versuch fail-closed ab", async () => {
  const root = await temporaryRoot();
  try {
    const targetPath = path.join(root, "runtime.json");
    await writeFile(targetPath, "alt", "utf8");
    let attempts = 0;
    await assert.rejects(
      atomicReplaceFile({
        targetPath,
        content: "neu",
        replaceAttempts: 5,
        retryDelayMs: 0,
        tempId: () => "permission",
        operations: {
          rename: async () => {
            attempts += 1;
            throw errorWithCode("EACCES", "keine Berechtigung");
          },
        },
      }),
      (error) => {
        assert.ok(error instanceof RuntimePersistenceError);
        assert.equal(error.kind, RUNTIME_PERSISTENCE_ERROR_KINDS.PERMISSION);
        assert.equal(error.phase, "replace");
        assert.equal(error.attempts, 1);
        return true;
      },
    );
    assert.equal(attempts, 1);
    assert.equal(await readFile(targetPath, "utf8"), "alt");
    assert.deepEqual(await tempEntries(root, "runtime.json"), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Schreib- und Temp-Erzeugungsfehler werden stabil klassifiziert", async () => {
  const root = await temporaryRoot();
  try {
    const targetPath = path.join(root, "runtime.json");
    await assert.rejects(
      atomicReplaceFile({
        targetPath,
        content: "x",
        operations: { writeFile: async () => { throw errorWithCode("ENOSPC"); } },
      }),
      (error) => error instanceof RuntimePersistenceError
        && error.kind === RUNTIME_PERSISTENCE_ERROR_KINDS.NO_SPACE
        && error.phase === "write",
    );
    await assert.rejects(
      atomicReplaceFile({
        targetPath,
        content: "x",
        operations: { writeFile: async () => { throw errorWithCode("EEXIST"); } },
      }),
      (error) => error instanceof RuntimePersistenceError
        && error.kind === RUNTIME_PERSISTENCE_ERROR_KINDS.TEMP_CREATE
        && error.phase === "temp-create",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Fehlerklassifikation trennt Lock, Rechte, Read-only und Speicherplatz", () => {
  assert.equal(
    classifyFilesystemError(errorWithCode("EBUSY"), { phase: "replace" }),
    RUNTIME_PERSISTENCE_ERROR_KINDS.LOCKED,
  );
  assert.equal(
    classifyFilesystemError(errorWithCode("EACCES"), { phase: "replace" }),
    RUNTIME_PERSISTENCE_ERROR_KINDS.PERMISSION,
  );
  assert.equal(
    classifyFilesystemError(errorWithCode("EROFS"), { phase: "write" }),
    RUNTIME_PERSISTENCE_ERROR_KINDS.READ_ONLY,
  );
  assert.equal(
    classifyFilesystemError(errorWithCode("ENOSPC"), { phase: "write" }),
    RUNTIME_PERSISTENCE_ERROR_KINDS.NO_SPACE,
  );
});
