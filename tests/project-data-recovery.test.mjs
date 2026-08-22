import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  PROJECT_DATABASE_RELATIVE_PATH,
  createRecord,
  createTemplate,
  isProtectedProjectDataPath,
  readProjectDatabase,
  updateRecord,
} from "../scripts/project-data-service.mjs";
import {
  PROJECT_DATA_BACKUP_LIMIT,
  PROJECT_DATA_BACKUP_RELATIVE_DIR,
  createProjectDataBackup,
  describeMigrationPlan,
  exportProjectDataSnapshot,
  importProjectDataSnapshot,
  listProjectDataBackups,
  previewProjectDataBackup,
  previewProjectDataImport,
  restoreProjectDataBackup,
  runMigrationChain,
} from "../scripts/project-data-recovery.mjs";

const withTempRoot = async (callback) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "provoware-recovery-"));
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

const dateFactory = () => {
  let seconds = 0;
  return () => new Date(Date.UTC(2026, 7, 22, 10, 0, seconds++));
};

const templateInput = () => ({
  name: "Recovery",
  description: "Recovery-Test",
  fields: [
    { id: "titel", label: "Titel", type: "text", required: true, options: [] },
  ],
});

const createPopulatedDatabase = async (root, title = "Stand A") => {
  const uuid = uuidFactory();
  const template = await createTemplate(templateInput(), { root, uuid });
  const record = await createRecord({
    templateId: template.id,
    values: { titel: title },
  }, { root, uuid });
  return { template, record };
};

test("Backup-Rotation hält nur die zehn neuesten Sicherungen", async () => {
  await withTempRoot(async (root) => {
    await createPopulatedDatabase(root);
    const now = dateFactory();
    const uuid = uuidFactory();

    for (let index = 0; index < PROJECT_DATA_BACKUP_LIMIT + 2; index += 1) {
      await createProjectDataBackup({ root, now, uuid });
    }

    const backups = await listProjectDataBackups({ root });
    assert.equal(backups.length, PROJECT_DATA_BACKUP_LIMIT);
    assert.ok(backups.every((backup) => backup.valid));
    assert.ok(backups.every((backup) => /^[0-9a-f]{64}$/.test(backup.sha256)));
  });
});

test("Restore verlangt Vorschau-Prüfsumme und legt vorher Sicherheitsbackup an", async () => {
  await withTempRoot(async (root) => {
    const ids = uuidFactory();
    const now = dateFactory();
    const template = await createTemplate(templateInput(), { root, uuid: ids });
    const record = await createRecord({ templateId: template.id, values: { titel: "Original" } }, { root, uuid: ids });
    const targetBackup = await createProjectDataBackup({ root, now, uuid: ids });

    await updateRecord(record.id, {
      templateId: template.id,
      values: { titel: "Geändert" },
    }, { root });

    const preview = await previewProjectDataBackup(targetBackup.id, { root });
    const result = await restoreProjectDataBackup(targetBackup.id, preview.sha256, { root, now, uuid: ids });
    const restored = await readProjectDatabase(root);

    assert.equal(restored.records[0].values.titel, "Original");
    assert.ok(result.safetyBackup.id);
    const safetyPreview = await previewProjectDataBackup(result.safetyBackup.id, { root });
    assert.equal(safetyPreview.summary.records, 1);
  });
});

test("Failure-Injection vor Rename lässt Live-Daten unverändert und behält Sicherheitsbackup", async () => {
  await withTempRoot(async (root) => {
    const ids = uuidFactory();
    const now = dateFactory();
    const template = await createTemplate(templateInput(), { root, uuid: ids });
    const record = await createRecord({ templateId: template.id, values: { titel: "Backup-Ziel" } }, { root, uuid: ids });
    const targetBackup = await createProjectDataBackup({ root, now, uuid: ids });

    await updateRecord(record.id, {
      templateId: template.id,
      values: { titel: "Live bleibt" },
    }, { root });
    const before = await readFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH), "utf8");
    const preview = await previewProjectDataBackup(targetBackup.id, { root });
    const countBefore = (await listProjectDataBackups({ root })).length;

    await assert.rejects(
      restoreProjectDataBackup(targetBackup.id, preview.sha256, {
        root,
        now,
        uuid: ids,
        beforeRename: async () => {
          throw new Error("simulierter Schreibabbruch");
        },
      }),
      /simulierter Schreibabbruch/,
    );

    const after = await readFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH), "utf8");
    assert.equal(after, before);
    assert.equal((await readProjectDatabase(root)).records[0].values.titel, "Live bleibt");
    assert.equal((await listProjectDataBackups({ root })).length, countBefore + 1);
  });
});

test("Import kann beschädigte Live-Datei ersetzen und sichert deren Rohbytes vorher", async () => {
  await withTempRoot(async (root) => {
    const livePath = path.join(root, PROJECT_DATABASE_RELATIVE_PATH);
    await mkdir(path.dirname(livePath), { recursive: true });
    await writeFile(livePath, "{kaputt-live", "utf8");

    const candidate = {
      schemaVersion: 1,
      revision: 0,
      templates: [],
      records: [],
    };
    const preview = await previewProjectDataImport(candidate);
    const result = await importProjectDataSnapshot(candidate, preview.sha256, {
      root,
      now: () => new Date("2026-08-22T10:15:00.000Z"),
      uuid: uuidFactory(),
    });

    assert.deepEqual(await readProjectDatabase(root), candidate);
    const rawBackup = await readFile(
      path.join(root, PROJECT_DATA_BACKUP_RELATIVE_DIR, result.safetyBackup.id),
      "utf8",
    );
    assert.equal(rawBackup, "{kaputt-live");
    assert.equal(result.safetyBackup.valid, false);
  });
});

test("Import lehnt veraltete Vorschau-Prüfsumme und unbekannte Schemaversion ab", async () => {
  await withTempRoot(async (root) => {
    await createPopulatedDatabase(root);
    const candidate = { schemaVersion: 1, revision: 0, templates: [], records: [] };
    const before = await readFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH), "utf8");

    await assert.rejects(
      importProjectDataSnapshot(candidate, "0".repeat(64), { root }),
      /seit der Vorschau geändert/,
    );
    assert.equal(await readFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH), "utf8"), before);

    await assert.rejects(
      previewProjectDataImport({ schemaVersion: 2, revision: 0, templates: [], records: [] }),
      /Rückwärtsmigration/,
    );
  });
});

test("Export liefert validierten Snapshot mit reproduzierbarer Zusammenfassung", async () => {
  await withTempRoot(async (root) => {
    await createPopulatedDatabase(root, "Export");
    const exported = await exportProjectDataSnapshot({ root });
    assert.equal(exported.summary.schemaVersion, 1);
    assert.equal(exported.summary.templates, 1);
    assert.equal(exported.summary.records, 1);
    assert.match(exported.filename, /schema-1-revision-2\.json$/);
    assert.match(exported.sha256, /^[0-9a-f]{64}$/);
  });
});

test("Migrationsengine beweist v1->v2 als isolierte Fixture ohne Produktionsschema zu ändern", () => {
  const source = { schemaVersion: 1, revision: 7, templates: [], records: [] };
  const migrators = new Map([
    [1, (database) => ({ ...database, schemaVersion: 2, fixtureMarker: "v2-test" })],
  ]);

  assert.deepEqual(describeMigrationPlan(1, 2, { migrators }), [{ from: 1, to: 2 }]);
  const first = runMigrationChain(source, { targetVersion: 2, migrators });
  const second = runMigrationChain(source, { targetVersion: 2, migrators });
  assert.deepEqual(first, second);
  assert.equal(first.data.schemaVersion, 2);
  assert.equal(first.data.fixtureMarker, "v2-test");
  assert.equal(source.schemaVersion, 1);
  assert.throws(() => describeMigrationPlan(2, 1, { migrators }), /Rückwärtsmigration/);
  assert.throws(() => describeMigrationPlan(1, 3, { migrators }), /Migrationsschritt 2 -> 3 fehlt/);
});

test("Backup-Pfade sind gegen direkte statische Auslieferung geschützt", async () => {
  await withTempRoot(async (root) => {
    assert.equal(
      isProtectedProjectDataPath(path.join(root, PROJECT_DATA_BACKUP_RELATIVE_DIR, "irgendein-backup.json"), root),
      true,
    );
    assert.equal(isProtectedProjectDataPath(path.join(root, "data/export.json"), root), false);
  });
});
