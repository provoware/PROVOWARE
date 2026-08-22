import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  PROJECT_DATABASE_RELATIVE_PATH,
  ProjectDataError,
  appendDevelopmentNote,
  createRecord,
  createTemplate,
  deleteRecord,
  formatLocalTimestamp,
  isProtectedProjectDataPath,
  normalizeDevelopmentNote,
  readProjectDatabase,
  updateRecord,
  updateTemplate,
} from "../scripts/project-data-service.mjs";

const withTempRoot = async (callback) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "provoware-project-data-"));
  try {
    return await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

const templateInput = () => ({
  name: "Entwicklungsstatus",
  description: "Testvorlage",
  fields: [
    { id: "titel", label: "Titel", type: "text", required: true, options: [] },
    {
      id: "status",
      label: "Status",
      type: "select",
      required: true,
      options: ["Offen", "Erledigt"],
    },
    { id: "fortschritt", label: "Fortschritt", type: "number", required: false, options: [] },
  ],
});

test("Entwicklungsnotiz wird auf eine Zeile normalisiert und mit Zeitstempel angehängt", async () => {
  assert.equal(normalizeDevelopmentNote("  Eins\n  Zwei\tDrei  "), "Eins Zwei Drei");
  assert.equal(formatLocalTimestamp(new Date(2026, 7, 22, 9, 10, 11)), "2026-08-22 09:10:11");

  await withTempRoot(async (root) => {
    const now = () => new Date(2026, 7, 22, 9, 10, 11);
    const result = await appendDevelopmentNote("  Erster\nEintrag ", { root, now });
    const content = await readFile(path.join(root, result.relativePath), "utf8");
    assert.equal(content, "[2026-08-22 09:10:11] Erster Eintrag\n");
  });
});

test("Vorlage und Datensatz werden versioniert persistiert und editierbar gehalten", async () => {
  await withTempRoot(async (root) => {
    const ids = ["template-1", "record-1"];
    const uuid = () => ids.shift();
    const now = () => new Date("2026-08-22T07:00:00.000Z");

    const template = await createTemplate(templateInput(), { root, now, uuid });
    assert.equal(template.id, "template-1");

    const record = await createRecord({
      templateId: template.id,
      values: { titel: "Gate", status: "Offen", fortschritt: "75" },
    }, { root, now, uuid });
    assert.equal(record.values.fortschritt, 75);

    await assert.rejects(
      updateTemplate(template.id, {
        ...templateInput(),
        fields: templateInput().fields.map((field) =>
          field.id === "status" ? { ...field, options: ["Erledigt"] } : field),
      }, { root, now }),
      (error) => error instanceof ProjectDataError && error.statusCode === 409,
    );

    await assert.rejects(
      updateRecord(record.id, {
        templateId: template.id,
        values: { titel: "Gate", status: "Unbekannt", fortschritt: 80 },
      }, { root, now }),
      /keinen erlaubten Auswahlwert/,
    );

    const updated = await updateRecord(record.id, {
      templateId: template.id,
      values: { titel: "Gate 2", status: "Erledigt", fortschritt: 100 },
    }, { root, now });
    assert.equal(updated.values.titel, "Gate 2");

    await deleteRecord(record.id, { root });
    const database = await readProjectDatabase(root);
    assert.equal(database.templates.length, 1);
    assert.equal(database.records.length, 0);
    assert.equal(database.revision, 4);
  });
});

test("parallele Datensatzmutationen verlieren keine Schreibvorgänge", async () => {
  await withTempRoot(async (root) => {
    let nextId = 0;
    const uuid = () => `parallel-${++nextId}`;
    const template = await createTemplate(templateInput(), { root, uuid });

    await Promise.all(Array.from({ length: 12 }, (_, index) => createRecord({
      templateId: template.id,
      values: {
        titel: `Eintrag ${index + 1}`,
        status: index % 2 ? "Erledigt" : "Offen",
        fortschritt: index,
      },
    }, { root, uuid })));

    const database = await readProjectDatabase(root);
    assert.equal(database.records.length, 12);
    assert.equal(database.revision, 13);
    assert.equal(new Set(database.records.map((record) => record.id)).size, 12);
    assert.deepEqual(
      database.records.map((record) => record.values.titel).sort(),
      Array.from({ length: 12 }, (_, index) => `Eintrag ${index + 1}`).sort(),
    );
  });
});

test("beschädigte Datenbank wird nicht still überschrieben", async () => {
  await withTempRoot(async (root) => {
    const filePath = path.join(root, PROJECT_DATABASE_RELATIVE_PATH);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, "{kaputt", "utf8");
    await assert.rejects(readProjectDatabase(root), /beschädigt/);
    await assert.rejects(createTemplate(templateInput(), { root }), /beschädigt/);
    assert.equal(await readFile(filePath, "utf8"), "{kaputt");
  });
});

test("Projekt-Datenbankpfad ist gegen statische Direktauslieferung markiert", async () => {
  await withTempRoot(async (root) => {
    assert.equal(isProtectedProjectDataPath(path.join(root, PROJECT_DATABASE_RELATIVE_PATH), root), true);
    assert.equal(isProtectedProjectDataPath(path.join(root, "data/ENTWICKLUNGSNOTIZEN.txt"), root), false);
  });
});
