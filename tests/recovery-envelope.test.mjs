import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  PROJECT_DATABASE_RELATIVE_PATH,
} from "../scripts/project-data-service.mjs";
import {
  DATA_STUDIO_PRO_RELATIVE_PATH,
} from "../scripts/data-studio-pro-service.mjs";
import {
  RECOVERY_ENVELOPE_RELATIVE_DIR,
  createRecoveryEnvelope,
  previewRecoveryEnvelope,
  readRecoveryEnvelopeJournalStatus,
  recoverInterruptedEnvelopeTransaction,
  restoreRecoveryEnvelope,
} from "../scripts/recovery-envelope.mjs";

const temporaryRoot = () => mkdtemp(path.join(os.tmpdir(), "provoware-envelope-"));
const jsonSource = (value) => `${JSON.stringify(value, null, 2)}\n`;

const projectData = (revision, name = "") => ({
  schemaVersion: 1,
  revision,
  templates: name ? [{
    id: `template-${revision}`,
    schemaVersion: 1,
    name,
    description: "",
    fields: [{ id: "title", label: "Titel", type: "text", required: false, options: [] }],
    createdAt: "2026-08-22T12:00:00.000Z",
    updatedAt: "2026-08-22T12:00:00.000Z",
  }] : [],
  records: [],
});

const proData = (revision, category = "") => ({
  schemaVersion: 1,
  revision,
  categories: category ? [{
    id: `category-${revision}`,
    name: category,
    createdAt: "2026-08-22T12:00:00.000Z",
    updatedAt: "2026-08-22T12:00:00.000Z",
  }] : [],
  templateCategories: [],
  savedViews: [],
});

const writeLive = async (root, project, pro) => {
  const projectPath = path.join(root, PROJECT_DATABASE_RELATIVE_PATH);
  const proPath = path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH);
  await mkdir(path.dirname(projectPath), { recursive: true });
  await writeFile(projectPath, jsonSource(project), { encoding: "utf8", flag: "w" });
  await writeFile(proPath, jsonSource(pro), { encoding: "utf8", flag: "w" });
};

const readLiveBytes = async (root) => ({
  project: await readFile(path.join(root, PROJECT_DATABASE_RELATIVE_PATH)),
  pro: await readFile(path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH)),
});

const uuidSequence = () => {
  const values = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
    "33333333-3333-4333-8333-333333333333",
    "44444444-4444-4444-8444-444444444444",
    "55555555-5555-4555-8555-555555555555",
    "66666666-6666-4666-8666-666666666666",
  ];
  let index = 0;
  return () => values[index++] || `77777777-7777-4777-8777-${String(index).padStart(12, "0")}`;
};

const fixedNow = () => new Date("2026-08-22T15:30:00.000Z");

test("Envelope erfasst Project Data und PRO mit eigener Gesamtprüfsumme", async () => {
  const root = await temporaryRoot();
  try {
    await writeLive(root, projectData(1, "Projekt A"), proData(1, "Kategorie A"));
    const result = await createRecoveryEnvelope({ root, now: fixedNow, uuid: uuidSequence() });
    assert.match(result.id, /^project-envelope-20260822T153000Z-/);
    assert.match(result.envelopeSha256, /^[0-9a-f]{64}$/);
    assert.equal(result.restorable, true);
    assert.deepEqual(result.components.map((item) => [item.id, item.state]), [
      ["project-data", "valid"],
      ["data-studio-pro", "valid"],
    ]);

    const preview = await previewRecoveryEnvelope(result.id, { root });
    assert.equal(preview.envelopeSha256, result.envelopeSha256);
    assert.equal(preview.restorable, true);
    assert.equal(preview.components[0].summary.revision, 1);
    assert.equal(preview.components[1].summary.categories, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Multi-Datei-Restore stellt beide Komponenten rohbytegenau gemeinsam wieder her", async () => {
  const root = await temporaryRoot();
  try {
    const uuids = uuidSequence();
    await writeLive(root, projectData(1, "Ziel"), proData(1, "Ziel-PRO"));
    const targetBytes = await readLiveBytes(root);
    const backup = await createRecoveryEnvelope({ root, now: fixedNow, uuid: uuids });
    await writeLive(root, projectData(2, "Neu"), proData(2, "Neu-PRO"));

    const preview = await previewRecoveryEnvelope(backup.id, { root });
    const result = await restoreRecoveryEnvelope(backup.id, preview.envelopeSha256, {
      root,
      now: fixedNow,
      uuid: uuids,
    });

    const restored = await readLiveBytes(root);
    assert.deepEqual(restored.project, targetBytes.project);
    assert.deepEqual(restored.pro, targetBytes.pro);
    assert.equal(result.rolledBack, false);
    assert.equal(await readRecoveryEnvelopeJournalStatus({ root }), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Fehler zwischen beiden Komponenten rollt vollständig auf den vorherigen Live-Zustand zurück", async () => {
  const root = await temporaryRoot();
  try {
    const uuids = uuidSequence();
    await writeLive(root, projectData(1, "Backup"), proData(1, "Backup-PRO"));
    const backup = await createRecoveryEnvelope({ root, now: fixedNow, uuid: uuids });
    await writeLive(root, projectData(9, "Live vorher"), proData(9, "Live-PRO vorher"));
    const before = await readLiveBytes(root);

    await assert.rejects(
      restoreRecoveryEnvelope(backup.id, backup.envelopeSha256, {
        root,
        now: fixedNow,
        uuid: uuids,
        failureInjector: async (stage) => {
          if (stage === "after-project-data") throw new Error("FAIL_BETWEEN_COMPONENTS");
        },
      }),
      /vollständig zurückgerollt/,
    );

    const after = await readLiveBytes(root);
    assert.deepEqual(after.project, before.project);
    assert.deepEqual(after.pro, before.pro);
    assert.equal(await readRecoveryEnvelopeJournalStatus({ root }), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("fehlgeschlagener Rollback bleibt journalisiert und wird beim Wiederanlauf deterministisch repariert", async () => {
  const root = await temporaryRoot();
  try {
    const uuids = uuidSequence();
    await writeLive(root, projectData(1, "Backup"), proData(1, "Backup-PRO"));
    const backup = await createRecoveryEnvelope({ root, now: fixedNow, uuid: uuids });
    await writeLive(root, projectData(7, "Vorher"), proData(7, "Vorher-PRO"));
    const before = await readLiveBytes(root);

    await assert.rejects(
      restoreRecoveryEnvelope(backup.id, backup.envelopeSha256, {
        root,
        now: fixedNow,
        uuid: uuids,
        failureInjector: async (stage) => {
          if (stage === "after-project-data") throw new Error("PRIMARY_FAIL");
        },
        rollbackFailureInjector: async (stage) => {
          if (stage === "rollback-before-project-data") throw new Error("ROLLBACK_FAIL");
        },
      }),
      /Rollback ist ebenfalls fehlgeschlagen/,
    );

    const journal = await readRecoveryEnvelopeJournalStatus({ root });
    assert.equal(journal.stage, "ROLLBACK_FAILED");
    assert.match(journal.primaryError, /PRIMARY_FAIL/);
    assert.match(journal.rollbackError, /ROLLBACK_FAIL/);

    const recovery = await recoverInterruptedEnvelopeTransaction({ root });
    assert.equal(recovery.recovered, true);
    assert.equal(recovery.action, "rolled-back-interrupted-transaction");
    const after = await readLiveBytes(root);
    assert.deepEqual(after.project, before.project);
    assert.deepEqual(after.pro, before.pro);
    assert.equal(await readRecoveryEnvelopeJournalStatus({ root }), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("fehlende oder beschädigte Komponenten werden gesichert, aber nicht als normaler Ziel-Restore freigegeben", async () => {
  const root = await temporaryRoot();
  try {
    const projectPath = path.join(root, PROJECT_DATABASE_RELATIVE_PATH);
    await mkdir(path.dirname(projectPath), { recursive: true });
    await writeFile(projectPath, "{kaputt", "utf8");
    const envelope = await createRecoveryEnvelope({ root, now: fixedNow, uuid: uuidSequence() });
    const preview = await previewRecoveryEnvelope(envelope.id, { root });
    assert.equal(preview.restorable, false);
    assert.equal(preview.components.find((item) => item.id === "project-data").state, "invalid");
    assert.equal(preview.components.find((item) => item.id === "data-studio-pro").state, "missing");
    await assert.rejects(
      restoreRecoveryEnvelope(envelope.id, envelope.envelopeSha256, {
        root,
        now: fixedNow,
        uuid: uuidSequence(),
      }),
      /nicht vollständig wiederherstellbar/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("manipulierter Envelope wird vor Vorschau und Restore verworfen", async () => {
  const root = await temporaryRoot();
  try {
    await writeLive(root, projectData(1), proData(1));
    const envelope = await createRecoveryEnvelope({ root, now: fixedNow, uuid: uuidSequence() });
    const filePath = path.join(root, RECOVERY_ENVELOPE_RELATIVE_DIR, envelope.id);
    const parsed = JSON.parse(await readFile(filePath, "utf8"));
    parsed.components[0].bytes += 1;
    await writeFile(filePath, jsonSource(parsed), "utf8");
    await assert.rejects(previewRecoveryEnvelope(envelope.id, { root }), /verändert|Rohbytes/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
