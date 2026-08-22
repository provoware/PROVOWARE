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

const withTempRoot = async (callback) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "provoware-project-api-"));
  try {
    return await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

const parseBody = (res) => JSON.parse(res.body);

test("API ignoriert normale statische Routen", async () => {
  const res = response();
  const handled = await handleProjectDataApi(request({ url: "/index.html" }), res);
  assert.equal(handled, false);
  assert.equal(res.statusCode, null);
});

test("API speichert Entwicklungsnotizen nur über erlaubte Same-Origin-Anfrage", async () => {
  await withTempRoot(async (root) => {
    const res = response();
    const handled = await handleProjectDataApi(request({
      method: "POST",
      url: "/api/provoware/development-notes",
      body: { text: "API-Test" },
    }), res, { root, now: () => new Date(2026, 7, 22, 9, 15, 0) });

    assert.equal(handled, true);
    assert.equal(res.statusCode, 201);
    assert.equal(parseBody(res).result.timestamp, "2026-08-22 09:15:00");

    const blocked = response();
    await handleProjectDataApi(request({
      method: "POST",
      url: "/api/provoware/development-notes",
      body: { text: "Fremd" },
      origin: "https://example.invalid",
    }), blocked, { root });
    assert.equal(blocked.statusCode, 403);
    assert.match(parseBody(blocked).error, /fremder Herkunft/);
  });
});

test("API erstellt Vorlage und Datensatz über den zentralen Datenvertrag", async () => {
  await withTempRoot(async (root) => {
    const ids = ["template-api", "record-api"];
    const uuid = () => ids.shift();
    const now = () => new Date("2026-08-22T07:20:00.000Z");

    const templateResponse = response();
    await handleProjectDataApi(request({
      method: "POST",
      url: "/api/provoware/project-data/templates",
      body: {
        name: "API Vorlage",
        description: "",
        fields: [{ id: "name", label: "Name", type: "text", required: true, options: [] }],
      },
    }), templateResponse, { root, now, uuid });
    assert.equal(templateResponse.statusCode, 201);
    assert.equal(parseBody(templateResponse).result.id, "template-api");

    const recordResponse = response();
    await handleProjectDataApi(request({
      method: "POST",
      url: "/api/provoware/project-data/records",
      body: { templateId: "template-api", values: { name: "Eintrag" } },
    }), recordResponse, { root, now, uuid });
    assert.equal(recordResponse.statusCode, 201);
    assert.equal(parseBody(recordResponse).result.id, "record-api");

    const snapshotResponse = response();
    await handleProjectDataApi(request({
      method: "GET",
      url: "/api/provoware/project-data",
    }), snapshotResponse, { root });
    assert.equal(snapshotResponse.statusCode, 200);
    const snapshot = parseBody(snapshotResponse).data;
    assert.equal(snapshot.templates.length, 1);
    assert.equal(snapshot.records.length, 1);
    assert.equal(snapshot.revision, 2);
  });
});
