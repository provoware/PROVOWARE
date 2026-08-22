import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { PROJECT_DATABASE_RELATIVE_PATH } from "../scripts/project-data-service.mjs";
import { DATA_STUDIO_PRO_RELATIVE_PATH } from "../scripts/data-studio-pro-service.mjs";
import {
  createRecoveryEnvelope,
  readRecoveryEnvelopeJournalStatus,
  restoreRecoveryEnvelope,
} from "../scripts/recovery-envelope.mjs";

const temporaryRoot = () => mkdtemp(path.join(os.tmpdir(), "provoware-envelope-matrix-"));
const jsonSource = (value) => `${JSON.stringify(value, null, 2)}\n`;
const projectData = (revision) => ({ schemaVersion: 1, revision, templates: [], records: [] });
const proData = (revision) => ({
  schemaVersion: 1,
  revision,
  categories: [],
  templateCategories: [],
  savedViews: [],
});

const writeLive = async (root, revision) => {
  await mkdir(path.join(root, "data"), { recursive: true });
  await writeFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH), jsonSource(projectData(revision)), "utf8");
  await writeFile(path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH), jsonSource(proData(revision)), "utf8");
};

const readLive = async (root) => ({
  project: await readFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH)),
  pro: await readFile(path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH)),
});

const uuidFactory = () => {
  let counter = 0;
  return () => `10000000-0000-4000-8000-${String(++counter).padStart(12, "0")}`;
};

const now = () => new Date("2026-08-22T18:00:00.000Z");

const assertFailureRollsBack = async (stage) => {
  const root = await temporaryRoot();
  try {
    const uuid = uuidFactory();
    await writeLive(root, 1);
    const target = await createRecoveryEnvelope({ root, now, uuid });
    await writeLive(root, 9);
    const before = await readLive(root);

    await assert.rejects(
      restoreRecoveryEnvelope(target.id, target.envelopeSha256, {
        root,
        now,
        uuid,
        failureInjector: async (currentStage) => {
          if (currentStage === stage) throw new Error(`INJECT_${stage}`);
        },
      }),
      /vollständig zurückgerollt/,
    );

    const after = await readLive(root);
    assert.deepEqual(after.project, before.project);
    assert.deepEqual(after.pro, before.pro);
    assert.equal(await readRecoveryEnvelopeJournalStatus({ root }), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

test("Failure-Matrix: Fehler vor erster Komponente hinterlässt keinen gemischten Zustand", async () => {
  await assertFailureRollsBack("before-project-data");
});

test("Failure-Matrix: Fehler nach zweiter Komponente vor Verifikation rollt beide Stores zurück", async () => {
  await assertFailureRollsBack("after-data-studio-pro");
});

test("Failure-Matrix: Fehler direkt vor Abschlussverifikation rollt beide Stores zurück", async () => {
  await assertFailureRollsBack("before-verification");
});
