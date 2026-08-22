import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import {
  atomicReplaceFile,
  isTransientRenameError,
  renameWithRetry,
} from "../scripts/atomic-file.mjs";

const withTempRoot = async (callback) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "provoware-atomic-"));
  try {
    return await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

const tempEntries = async (root) => (
  (await readdir(root)).filter((name) => name.includes(".tmp-"))
);

const codedError = (code, message = code) => Object.assign(new Error(message), { code });

test("atomarer Ersatz schreibt, synchronisiert und ersetzt über Temp-Datei im selben Ordner", async () => {
  await withTempRoot(async (root) => {
    const target = path.join(root, "data.json");
    await writeFile(target, "alt\n", "utf8");
    let preview = null;

    const result = await atomicReplaceFile(target, "neu\n", {
      uuid: () => "fixture-success",
      beforeRename: async ({ tempPath, filePath }) => {
        assert.equal(path.dirname(tempPath), path.dirname(filePath));
        preview = await readFile(tempPath, "utf8");
      },
    });

    assert.equal(preview, "neu\n");
    assert.equal(await readFile(target, "utf8"), "neu\n");
    assert.equal(result.renameAttempts, 1);
    assert.equal(result.renameRetries, 0);
    assert.deepEqual(await tempEntries(root), []);
  });
});

test("beforeRename-Fehler lässt Live-Datei bytegenau unverändert und räumt eigene Temp-Datei auf", async () => {
  await withTempRoot(async (root) => {
    const target = path.join(root, "data.json");
    await writeFile(target, "live-alt\n", "utf8");

    await assert.rejects(
      atomicReplaceFile(target, "neu\n", {
        uuid: () => "fixture-before-rename",
        beforeRename: async () => {
          throw new Error("simulierter Abbruch vor Rename");
        },
      }),
      /simulierter Abbruch vor Rename/,
    );

    assert.equal(await readFile(target, "utf8"), "live-alt\n");
    assert.deepEqual(await tempEntries(root), []);
  });
});

test("permanenter Rename-Fehler ist fail-closed: Live-Datei bleibt erhalten und Temp wird entfernt", async () => {
  await withTempRoot(async (root) => {
    const target = path.join(root, "data.json");
    await writeFile(target, "live-alt\n", "utf8");

    await assert.rejects(
      atomicReplaceFile(target, "neu\n", {
        uuid: () => "fixture-rename-fail",
        renameFn: async () => {
          throw codedError("EIO", "permanenter Rename-Fehler");
        },
      }),
      /permanenter Rename-Fehler/,
    );

    assert.equal(await readFile(target, "utf8"), "live-alt\n");
    assert.deepEqual(await tempEntries(root), []);
  });
});

test("Windows-Rename wiederholt nur transiente Fehler begrenzt und kann danach erfolgreich ersetzen", async () => {
  await withTempRoot(async (root) => {
    const target = path.join(root, "data.json");
    await writeFile(target, "live-alt\n", "utf8");
    const delays = [];
    let calls = 0;

    const result = await atomicReplaceFile(target, "neu\n", {
      platform: "win32",
      retryDelaysMs: [1, 2, 3],
      uuid: () => "fixture-win-retry",
      sleepFn: async (delay) => {
        delays.push(delay);
      },
      renameFn: async (oldPath, newPath) => {
        calls += 1;
        if (calls === 1) throw codedError("EPERM");
        if (calls === 2) throw codedError("EBUSY");
        await rename(oldPath, newPath);
      },
    });

    assert.equal(calls, 3);
    assert.deepEqual(delays, [1, 2]);
    assert.equal(result.renameAttempts, 3);
    assert.equal(result.renameRetries, 2);
    assert.equal(await readFile(target, "utf8"), "neu\n");
    assert.deepEqual(await tempEntries(root), []);
  });
});

test("Windows-Retry-Limit endet kontrolliert ohne Zielverlust", async () => {
  await withTempRoot(async (root) => {
    const target = path.join(root, "data.json");
    await writeFile(target, "live-alt\n", "utf8");
    let calls = 0;

    await assert.rejects(
      atomicReplaceFile(target, "neu\n", {
        platform: "win32",
        retryDelaysMs: [0, 0],
        uuid: () => "fixture-win-limit",
        sleepFn: async () => {},
        renameFn: async () => {
          calls += 1;
          throw codedError("EACCES", "Datei bleibt gesperrt");
        },
      }),
      /Datei bleibt gesperrt/,
    );

    assert.equal(calls, 3);
    assert.equal(await readFile(target, "utf8"), "live-alt\n");
    assert.deepEqual(await tempEntries(root), []);
  });
});

test("nicht-transienter Windows-Fehler und POSIX-Rechtefehler werden nicht künstlich wiederholt", async () => {
  assert.equal(isTransientRenameError(codedError("EPERM"), "win32"), true);
  assert.equal(isTransientRenameError(codedError("EACCES"), "win32"), true);
  assert.equal(isTransientRenameError(codedError("EBUSY"), "win32"), true);
  assert.equal(isTransientRenameError(codedError("EIO"), "win32"), false);
  assert.equal(isTransientRenameError(codedError("EACCES"), "linux"), false);

  let calls = 0;
  await assert.rejects(
    renameWithRetry("a", "b", {
      platform: "win32",
      retryDelaysMs: [0, 0, 0],
      renameFn: async () => {
        calls += 1;
        throw codedError("EIO", "kein Retry");
      },
      sleepFn: async () => {
        assert.fail("sleepFn darf bei permanentem Fehler nicht aufgerufen werden");
      },
    }),
    /kein Retry/,
  );
  assert.equal(calls, 1);
});

test("fremde kollidierende Temp-Datei wird bei wx-EEXIST niemals gelöscht", async () => {
  await withTempRoot(async (root) => {
    const target = path.join(root, "data.json");
    const uuid = "fixture-collision";
    const collision = `${target}.tmp-${process.pid}-${uuid}`;
    await writeFile(target, "live-alt\n", "utf8");
    await writeFile(collision, "fremd\n", "utf8");

    await assert.rejects(
      atomicReplaceFile(target, "neu\n", { uuid: () => uuid }),
      (error) => error?.code === "EEXIST",
    );

    assert.equal(await readFile(target, "utf8"), "live-alt\n");
    assert.equal(await readFile(collision, "utf8"), "fremd\n");
  });
});

test("Cleanup-Fehler verdeckt den ursprünglichen Schreibfehler nicht", async () => {
  await withTempRoot(async (root) => {
    const target = path.join(root, "data.json");
    await writeFile(target, "live-alt\n", "utf8");

    await assert.rejects(
      atomicReplaceFile(target, "neu\n", {
        uuid: () => "fixture-cleanup-error",
        beforeRename: async () => {
          throw new Error("Primärfehler");
        },
        unlinkFn: async () => {
          throw new Error("Cleanup-Fehler");
        },
      }),
      /Primärfehler/,
    );

    assert.equal(await readFile(target, "utf8"), "live-alt\n");
  });
});

test("Schreibreihenfolge synchronisiert Temp-Inhalt vor Rename", async () => {
  const calls = [];
  const fakeHandle = {
    async writeFile() {
      calls.push("write");
    },
    async sync() {
      calls.push("sync");
    },
    async close() {
      calls.push("close");
    },
  };

  await atomicReplaceFile(path.join(os.tmpdir(), "provoware-order.json"), "x", {
    uuid: () => "fixture-order",
    openFn: async () => {
      calls.push("open");
      return fakeHandle;
    },
    beforeRename: async () => {
      calls.push("beforeRename");
    },
    renameFn: async () => {
      calls.push("rename");
    },
    unlinkFn: async () => {
      calls.push("unlink");
    },
  });

  assert.deepEqual(calls, ["open", "write", "sync", "close", "beforeRename", "rename"]);
});
