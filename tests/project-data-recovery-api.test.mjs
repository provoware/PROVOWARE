import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import { handleProjectDataApi } from "../scripts/project-data-service.mjs";

const request = ({ method = "GET", url, body, origin = "http://127.0.0.1:4173" }) => {
  const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))];
  const stream = Readable.from(chunks);
  stream.method = method;
  stream.url = url;
  stream.headers = {
    host: "127.0.0.1:4173",
    origin,
    ...(body === undefined ? {} : { "content-type": "application/json" }),
  };
  return stream;
};

const response = () => ({
  statusCode: null,
  headers: null,
  body: "",
  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    this.headers = headers;
    return this;
  },
  end(chunk = "") {
    this.body += String(chunk);
  },
});

const parseBody = (res) => JSON.parse(res.body);

const withTempRoot = async (callback) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "provoware-recovery-api-"));
  try {
    return await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

const uuidFactory = () => {
  let counter = 0;
  return () => `00000000-0000-4000-8000-${String(++counter).padStart(12, "0")}`;
};

test("Recovery-API wird über den bestehenden Project-Data-Router delegiert", async () => {
  await withTempRoot(async (root) => {
    const list = response();
    const handled = await handleProjectDataApi(request({
      url: "/api/provoware/project-data/recovery/backups",
    }), list, { root });

    assert.equal(handled, true);
    assert.equal(list.statusCode, 200);
    assert.deepEqual(parseBody(list).backups, []);
  });
});

test("Recovery-API unterstützt Backup, Import-Vorschau und Import mit SHA-Bestätigung", async () => {
  await withTempRoot(async (root) => {
    const uuid = uuidFactory();
    const now = () => new Date("2026-08-22T10:30:00.000Z");

    const backup = response();
    await handleProjectDataApi(request({
      method: "POST",
      url: "/api/provoware/project-data/recovery/backups",
      body: {},
    }), backup, { root, now, uuid });
    assert.equal(backup.statusCode, 201);
    assert.match(parseBody(backup).backup.id, /^project-data-/);

    const candidate = { schemaVersion: 1, revision: 0, templates: [], records: [] };
    const preview = response();
    await handleProjectDataApi(request({
      method: "POST",
      url: "/api/provoware/project-data/recovery/preview-import",
      body: { data: candidate },
    }), preview, { root, now, uuid });
    assert.equal(preview.statusCode, 200);
    const fingerprint = parseBody(preview).preview.sha256;
    assert.match(fingerprint, /^[0-9a-f]{64}$/);

    const imported = response();
    await handleProjectDataApi(request({
      method: "POST",
      url: "/api/provoware/project-data/recovery/import",
      body: { data: candidate, expectedSha256: fingerprint },
    }), imported, { root, now, uuid });
    assert.equal(imported.statusCode, 200);
    assert.ok(parseBody(imported).result.safetyBackup.id);
  });
});

test("Recovery-API blockiert Fremd-Origin und veraltete Prüfsummen", async () => {
  await withTempRoot(async (root) => {
    const blocked = response();
    await handleProjectDataApi(request({
      method: "POST",
      url: "/api/provoware/project-data/recovery/backups",
      body: {},
      origin: "https://example.invalid",
    }), blocked, { root });
    assert.equal(blocked.statusCode, 403);

    const stale = response();
    await handleProjectDataApi(request({
      method: "POST",
      url: "/api/provoware/project-data/recovery/import",
      body: {
        data: { schemaVersion: 1, revision: 0, templates: [], records: [] },
        expectedSha256: "0".repeat(64),
      },
    }), stale, { root, uuid: uuidFactory() });
    assert.equal(stale.statusCode, 409);
    assert.match(parseBody(stale).error, /seit der Vorschau geändert/);
  });
});
