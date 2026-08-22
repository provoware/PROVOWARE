import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import { createTemplate } from "../scripts/project-data-service.mjs";
import { handleDataStudioProApi } from "../scripts/data-studio-pro-service.mjs";

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
  const root = await mkdtemp(path.join(os.tmpdir(), "provoware-data-studio-pro-api-"));
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

const templateInput = () => ({
  name: "API Vorlage",
  description: "",
  fields: [{ id: "titel", label: "Titel", type: "text", required: false, options: [] }],
});

test("Data-Studio-PRO-API liefert leeren Vertrag und speichert Kategorie über Same-Origin", async () => {
  await withTempRoot(async (root) => {
    const initial = response();
    assert.equal(await handleDataStudioProApi(request({ url: "/api/provoware/data-studio-pro" }), initial, { root }), true);
    assert.equal(initial.statusCode, 200);
    assert.deepEqual(parseBody(initial).data.categories, []);

    const created = response();
    await handleDataStudioProApi(request({
      method: "POST",
      url: "/api/provoware/data-studio-pro/categories",
      body: { name: "Entwicklung" },
    }), created, { root, uuid: uuidFactory(), now: () => new Date("2026-08-22T15:00:00.000Z") });
    assert.equal(created.statusCode, 201);
    assert.equal(parseBody(created).result.name, "Entwicklung");

    const after = response();
    await handleDataStudioProApi(request({ url: "/api/provoware/data-studio-pro" }), after, { root });
    assert.equal(parseBody(after).data.categories.length, 1);
  });
});

test("Data-Studio-PRO-API blockiert Fremd-Origin und ungültige Ansichten", async () => {
  await withTempRoot(async (root) => {
    const blocked = response();
    await handleDataStudioProApi(request({
      method: "POST",
      url: "/api/provoware/data-studio-pro/categories",
      body: { name: "Blockiert" },
      origin: "https://example.invalid",
    }), blocked, { root });
    assert.equal(blocked.statusCode, 403);

    const invalid = response();
    await handleDataStudioProApi(request({
      method: "POST",
      url: "/api/provoware/data-studio-pro/saved-views",
      body: {
        name: "Ungültig",
        templateId: null,
        categoryId: null,
        query: "",
        sort: "random",
      },
    }), invalid, { root, uuid: uuidFactory() });
    assert.equal(invalid.statusCode, 400);
    assert.match(parseBody(invalid).error, /Unbekannte Sortierung/);
  });
});

test("Data-Studio-PRO-API prüft Vorlagenzuweisung gegen Project Data und kann View wieder löschen", async () => {
  await withTempRoot(async (root) => {
    const uuid = uuidFactory();
    const template = await createTemplate(templateInput(), { root, uuid });

    const categoryRes = response();
    await handleDataStudioProApi(request({
      method: "POST",
      url: "/api/provoware/data-studio-pro/categories",
      body: { name: "Projekt" },
    }), categoryRes, { root, uuid });
    const category = parseBody(categoryRes).result;

    const assignment = response();
    await handleDataStudioProApi(request({
      method: "PUT",
      url: `/api/provoware/data-studio-pro/template-categories/${template.id}`,
      body: { categoryId: category.id },
    }), assignment, { root });
    assert.equal(assignment.statusCode, 200);
    assert.equal(parseBody(assignment).result.categoryId, category.id);

    const viewRes = response();
    await handleDataStudioProApi(request({
      method: "POST",
      url: "/api/provoware/data-studio-pro/saved-views",
      body: {
        name: "Projektansicht",
        templateId: template.id,
        categoryId: category.id,
        query: "Alpha",
        sort: "updated-desc",
      },
    }), viewRes, { root, uuid });
    const view = parseBody(viewRes).result;
    assert.equal(viewRes.statusCode, 201);

    const removed = response();
    await handleDataStudioProApi(request({
      method: "DELETE",
      url: `/api/provoware/data-studio-pro/saved-views/${view.id}`,
    }), removed, { root });
    assert.equal(removed.statusCode, 200);

    const invalidAssignment = response();
    await handleDataStudioProApi(request({
      method: "PUT",
      url: "/api/provoware/data-studio-pro/template-categories/missing-template",
      body: { categoryId: category.id },
    }), invalidAssignment, { root });
    assert.equal(invalidAssignment.statusCode, 404);
  });
});
