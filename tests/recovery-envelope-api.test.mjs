import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import {
  PROJECT_DATABASE_RELATIVE_PATH,
} from "../scripts/project-data-service.mjs";
import {
  DATA_STUDIO_PRO_RELATIVE_PATH,
} from "../scripts/data-studio-pro-service.mjs";
import {
  RECOVERY_ENVELOPE_API_ROOT,
  handleRecoveryEnvelopeApi,
} from "../scripts/recovery-envelope.mjs";

const request = ({ method = "GET", url, body, origin = "http://127.0.0.1:4173" }) => {
  const stream = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))]);
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
const temporaryRoot = () => mkdtemp(path.join(os.tmpdir(), "provoware-envelope-api-"));
const jsonSource = (value) => `${JSON.stringify(value, null, 2)}\n`;
const projectData = (revision) => ({ schemaVersion: 1, revision, templates: [], records: [] });
const proData = (revision) => ({
  schemaVersion: 1,
  revision,
  categories: [],
  templateCategories: [],
  savedViews: [],
});

const writeLive = async (root, projectRevision, proRevision) => {
  await mkdir(path.join(root, "data"), { recursive: true });
  await writeFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH), jsonSource(projectData(projectRevision)), "utf8");
  await writeFile(path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH), jsonSource(proData(proRevision)), "utf8");
};

const uuidFactory = () => {
  let counter = 0;
  return () => `00000000-0000-4000-8000-${String(++counter).padStart(12, "0")}`;
};

const fixedNow = () => new Date("2026-08-22T16:00:00.000Z");

test("Envelope-API listet und erstellt gemeinsame Project-Data-/PRO-Sicherungen", async () => {
  const root = await temporaryRoot();
  try {
    await writeLive(root, 1, 1);
    const empty = response();
    assert.equal(await handleRecoveryEnvelopeApi(request({ url: RECOVERY_ENVELOPE_API_ROOT }), empty, { root }), true);
    assert.equal(empty.statusCode, 200);
    assert.deepEqual(parseBody(empty).envelopes, []);

    const created = response();
    await handleRecoveryEnvelopeApi(request({ method: "POST", url: RECOVERY_ENVELOPE_API_ROOT, body: {} }), created, {
      root,
      now: fixedNow,
      uuid: uuidFactory(),
    });
    assert.equal(created.statusCode, 201);
    const envelope = parseBody(created).envelope;
    assert.equal(envelope.restorable, true);
    assert.equal(envelope.components.length, 2);
    assert.match(envelope.envelopeSha256, /^[0-9a-f]{64}$/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Envelope-API erzwingt Vorschau-SHA und stellt beide Live-Dateien gemeinsam wieder her", async () => {
  const root = await temporaryRoot();
  try {
    const uuid = uuidFactory();
    await writeLive(root, 2, 2);
    const expectedProject = await readFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH));
    const expectedPro = await readFile(path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH));

    const created = response();
    await handleRecoveryEnvelopeApi(request({ method: "POST", url: RECOVERY_ENVELOPE_API_ROOT, body: {} }), created, {
      root,
      now: fixedNow,
      uuid,
    });
    const envelopeId = parseBody(created).envelope.id;

    await writeLive(root, 9, 9);
    const preview = response();
    await handleRecoveryEnvelopeApi(request({
      method: "POST",
      url: `${RECOVERY_ENVELOPE_API_ROOT}/preview`,
      body: { envelopeId },
    }), preview, { root });
    assert.equal(preview.statusCode, 200);
    const envelopeSha256 = parseBody(preview).preview.envelopeSha256;

    const restored = response();
    await handleRecoveryEnvelopeApi(request({
      method: "POST",
      url: `${RECOVERY_ENVELOPE_API_ROOT}/restore`,
      body: { envelopeId, expectedSha256: envelopeSha256 },
    }), restored, { root, now: fixedNow, uuid });
    assert.equal(restored.statusCode, 200);
    assert.deepEqual(await readFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH)), expectedProject);
    assert.deepEqual(await readFile(path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH)), expectedPro);

    const journal = response();
    await handleRecoveryEnvelopeApi(request({ url: `${RECOVERY_ENVELOPE_API_ROOT}/journal` }), journal, { root });
    assert.equal(journal.statusCode, 200);
    assert.equal(parseBody(journal).journal, null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Envelope-API blockiert Fremd-Origin und veraltete Vorschau-Prüfsummen", async () => {
  const root = await temporaryRoot();
  try {
    await writeLive(root, 1, 1);
    const blocked = response();
    await handleRecoveryEnvelopeApi(request({
      method: "POST",
      url: RECOVERY_ENVELOPE_API_ROOT,
      body: {},
      origin: "https://example.invalid",
    }), blocked, { root });
    assert.equal(blocked.statusCode, 403);

    const uuid = uuidFactory();
    const created = response();
    await handleRecoveryEnvelopeApi(request({ method: "POST", url: RECOVERY_ENVELOPE_API_ROOT, body: {} }), created, {
      root,
      now: fixedNow,
      uuid,
    });
    const envelopeId = parseBody(created).envelope.id;

    const stale = response();
    await handleRecoveryEnvelopeApi(request({
      method: "POST",
      url: `${RECOVERY_ENVELOPE_API_ROOT}/restore`,
      body: { envelopeId, expectedSha256: "0".repeat(64) },
    }), stale, { root, now: fixedNow, uuid });
    assert.equal(stale.statusCode, 409);
    assert.match(parseBody(stale).error, /seit der Vorschau geändert/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
