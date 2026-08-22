import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createTemplate } from "../scripts/project-data-service.mjs";
import {
  DATA_STUDIO_PRO_RELATIVE_PATH,
  createCategory,
  createEmptyDataStudioPro,
  createSavedView,
  deleteCategory,
  deleteSavedView,
  readDataStudioPro,
  setTemplateCategory,
  writeDataStudioProAtomic,
} from "../scripts/data-studio-pro-service.mjs";

const withTempRoot = async (callback) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "provoware-data-studio-pro-"));
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

const nowFactory = () => {
  let seconds = 0;
  return () => new Date(Date.UTC(2026, 7, 22, 14, 0, seconds++));
};

const templateInput = (name = "PRO Vorlage") => ({
  name,
  description: "Data Studio PRO Test",
  fields: [
    { id: "titel", label: "Titel", type: "text", required: false, options: [] },
  ],
});

test("PRO-Metadaten speichern Kategorien, Zuweisungen und Ansichten getrennt vom Project-Data-Schema", async () => {
  await withTempRoot(async (root) => {
    const uuid = uuidFactory();
    const now = nowFactory();
    const template = await createTemplate(templateInput(), { root, uuid, now });
    const category = await createCategory({ name: "Entwicklung" }, { root, uuid, now });

    await assert.rejects(
      createCategory({ name: "entwicklung" }, { root, uuid, now }),
      /existiert bereits/,
    );

    const assignment = await setTemplateCategory(template.id, category.id, { root });
    assert.deepEqual(assignment, { templateId: template.id, categoryId: category.id });

    const view = await createSavedView({
      name: "Aktuelle Entwicklung",
      templateId: template.id,
      categoryId: category.id,
      query: "Alpha",
      sort: "updated-desc",
    }, { root, uuid, now });

    await assert.rejects(
      createSavedView({
        name: "aktuelle entwicklung",
        templateId: template.id,
        categoryId: category.id,
        query: "",
        sort: "updated-desc",
      }, { root, uuid, now }),
      /existiert bereits/,
    );

    const stored = await readDataStudioPro(root);
    assert.equal(stored.schemaVersion, 1);
    assert.equal(stored.categories.length, 1);
    assert.deepEqual(stored.templateCategories, [{ templateId: template.id, categoryId: category.id }]);
    assert.equal(stored.savedViews[0].id, view.id);
    assert.equal(stored.savedViews[0].query, "Alpha");
  });
});

test("Kategorie löschen löst Vorlagenzuweisungen und erhält gespeicherte Ansicht ohne Kategorie", async () => {
  await withTempRoot(async (root) => {
    const uuid = uuidFactory();
    const now = nowFactory();
    const template = await createTemplate(templateInput(), { root, uuid, now });
    const category = await createCategory({ name: "Archiv" }, { root, uuid, now });
    await setTemplateCategory(template.id, category.id, { root });
    const view = await createSavedView({
      name: "Archivsicht",
      templateId: template.id,
      categoryId: category.id,
      query: "",
      sort: "created-asc",
    }, { root, uuid, now });

    await deleteCategory(category.id, { root });
    const stored = await readDataStudioPro(root);
    assert.equal(stored.categories.length, 0);
    assert.equal(stored.templateCategories.length, 0);
    assert.equal(stored.savedViews.find((item) => item.id === view.id)?.categoryId, null);
  });
});

test("PRO-Zuweisungen und Ansichten validieren Referenzen und Sortiermodi serverseitig", async () => {
  await withTempRoot(async (root) => {
    const uuid = uuidFactory();
    const now = nowFactory();
    const template = await createTemplate(templateInput(), { root, uuid, now });
    const category = await createCategory({ name: "Qualität" }, { root, uuid, now });

    await assert.rejects(
      setTemplateCategory("missing-template", category.id, { root }),
      /nicht gefunden/,
    );
    await assert.rejects(
      setTemplateCategory(template.id, "missing-category", { root }),
      /nicht gefunden/,
    );
    await assert.rejects(
      createSavedView({
        name: "Ungültig",
        templateId: template.id,
        categoryId: category.id,
        query: "",
        sort: "zufall",
      }, { root, uuid, now }),
      /Unbekannte Sortierung/,
    );
  });
});

test("PRO-Persistenz bleibt bei Fehler vor Rename bytegenau unverändert", async () => {
  await withTempRoot(async (root) => {
    const original = createEmptyDataStudioPro();
    await writeDataStudioProAtomic(root, original);
    const filePath = path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH);
    const before = await readFile(filePath, "utf8");
    const changed = {
      ...original,
      revision: 1,
      categories: [{
        id: "cat-1",
        name: "Test",
        createdAt: "2026-08-22T14:00:00.000Z",
        updatedAt: "2026-08-22T14:00:00.000Z",
      }],
    };

    await assert.rejects(
      writeDataStudioProAtomic(root, changed, {
        beforeRename: async () => {
          throw new Error("simulierter PRO-Schreibabbruch");
        },
      }),
      /simulierter PRO-Schreibabbruch/,
    );

    assert.equal(await readFile(filePath, "utf8"), before);
    assert.deepEqual(await readDataStudioPro(root), original);
  });
});

test("beschädigte PRO-Datei wird nicht still ersetzt und Ansichten lassen sich gezielt löschen", async () => {
  await withTempRoot(async (root) => {
    const filePath = path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, "{kaputt", "utf8");
    await assert.rejects(readDataStudioPro(root), /beschädigt/);

    await rm(filePath, { force: true });
    const uuid = uuidFactory();
    const now = nowFactory();
    const view = await createSavedView({
      name: "Ohne Filter",
      templateId: null,
      categoryId: null,
      query: "",
      sort: "updated-desc",
    }, { root, uuid, now });
    await deleteSavedView(view.id, { root });
    assert.equal((await readDataStudioPro(root)).savedViews.length, 0);
  });
});
