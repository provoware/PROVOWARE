(() => {
  "use strict";
  const namespace = window.Provoware;
  const results = [];

  function record(name, passed, detail = "") {
    results.push({ name, passed: Boolean(passed), detail });
    if (!passed) throw new Error(`${name}: ${detail || "fehlgeschlagen"}`);
  }

  function validator(payload) {
    return payload?.schemaVersion === "1.2.0" && payload?.projectId && payload?.answers && payload?.theme
      ? []
      : ["ungültig"];
  }

  function targetPayload(projectId) {
    const now = "2026-08-05T03:00:00.000Z";
    return {
      schemaVersion: "1.2.0", projectId, name: "Fehlerprüfung", answers: {},
      currentQuestionId: null, theme: "dark", questionCatalogVersion: "1.0.0",
      createdAt: now, updatedAt: now, lastValidatedAt: now
    };
  }

  function legacyPayload(projectId, version) {
    const base = {
      schemaVersion: version, projectId, name: "Legacy", answers: {},
      createdAt: "2026-08-01T00:00:00Z", updatedAt: "2026-08-01T00:00:00Z"
    };
    if (version === "1.1.0") return { ...base, currentQuestionId: null, theme: "dark" };
    return base;
  }

  function txDone(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onabort = () => reject(transaction.error || new Error("aborted"));
      transaction.onerror = () => reject(transaction.error || new Error("failed"));
    });
  }

  async function seedLegacy(projectId) {
    const database = await namespace.storage.open();
    const transaction = database.transaction(Object.values(namespace.storage.STORES), "readwrite");
    const projects = transaction.objectStore(namespace.storage.STORES.projects);
    const snapshots = transaction.objectStore(namespace.storage.STORES.snapshots);
    const v100 = legacyPayload(projectId, "1.0.0");
    const v110 = legacyPayload(projectId, "1.1.0");
    projects.put({ id: projectId, revision: 2, payload: v110, checksum: namespace.storage.checksum(v110), savedAt: v110.updatedAt, reason: "legacy" });
    snapshots.add({ snapshotId: `${projectId}:legacy-1`, projectId, revision: 1, payload: v100, checksum: namespace.storage.checksum(v100), savedAt: v100.updatedAt, reason: "legacy" });
    snapshots.add({ snapshotId: `${projectId}:legacy-2`, projectId, revision: 2, payload: v110, checksum: namespace.storage.checksum(v110), savedAt: v110.updatedAt, reason: "legacy" });
    await txDone(transaction);
  }

  async function realScenarios(projectId) {
    window.__PROVOWARE_TESTING__ = true;
    const payload = targetPayload(projectId);
    await namespace.storage.saveProject(payload, "failure-baseline");
    const before = await namespace.storage.getDiagnostics(projectId);

    namespace.storage.setTestFault("quota-before-write");
    let quotaError = null;
    try { await namespace.storage.saveProject(payload, "quota-test"); } catch (error) { quotaError = error; }
    const afterQuota = await namespace.storage.getDiagnostics(projectId);
    record("QuotaExceededError simuliert", quotaError?.name === "QuotaExceededError", quotaError?.name);
    record("Quota hinterlässt keinen Teilstand", afterQuota.project.revision === before.project.revision && afterQuota.snapshotCount === before.snapshotCount);

    namespace.storage.setTestFault("abort-after-project-put");
    let abortError = null;
    try { await namespace.storage.saveProject(payload, "abort-test"); } catch (error) { abortError = error; }
    const afterAbort = await namespace.storage.getDiagnostics(projectId);
    record("Transaktionsabbruch simuliert", abortError?.name === "AbortError", abortError?.name);
    record("Abbruch rollt vollständig zurück", afterAbort.project.revision === before.project.revision && afterAbort.snapshotCount === before.snapshotCount);

    const database = await namespace.storage.open();
    const corruptTx = database.transaction(namespace.storage.STORES.snapshots, "readwrite");
    const store = corruptTx.objectStore(namespace.storage.STORES.snapshots);
    for (const revision of [90, 91]) {
      const broken = { ...payload, updatedAt: `2026-08-05T03:${revision === 90 ? "10" : "11"}:00.000Z` };
      store.add({ snapshotId: `${projectId}:broken-${revision}`, projectId, revision, payload: broken, checksum: "00000000", savedAt: broken.updatedAt, reason: "corrupt-test" });
    }
    await txDone(corruptTx);
    const recovered = await namespace.storage.loadLatestValid(projectId, validator, { catalogVersion: "1.0.0", now: "2026-08-05T03:12:00.000Z" });
    record("Beschädigte Snapshot-Reihe übersprungen", recovered?.payload?.schemaVersion === "1.2.0");

    const migrationId = `${projectId}-migration`;
    await seedLegacy(migrationId);
    const migrated = await namespace.storage.loadLatestValid(migrationId, validator, { catalogVersion: "1.0.0", now: "2026-08-05T03:20:00.000Z" });
    const overview = await namespace.storage.getStorageOverview(migrationId, validator, { catalogVersion: "1.0.0", now: "2026-08-05T03:20:00.000Z" });
    record("Migration 1.1.0 nach 1.2.0", migrated?.source === "migration" && migrated.payload.schemaVersion === "1.2.0");
    record("Legacy-Originale bleiben erhalten", overview.snapshots.some(item => item.snapshotId.endsWith("legacy-1")) && overview.snapshots.some(item => item.snapshotId.endsWith("legacy-2")));
    record("Migrationsschritte protokolliert", overview.diagnostics.migrationCount >= 1 && overview.diagnostics.migrationSteps.length >= 1);
  }

  function fallbackScenarios(projectId) {
    const v100 = legacyPayload(projectId, "1.0.0");
    const migrated = namespace.migrations.migratePayload(v100, { catalogVersion: "1.0.0", now: "2026-08-05T03:20:00.000Z" });
    record("Fallback-Migrationsmatrix", migrated.steps.length === 2 && migrated.payload.schemaVersion === "1.2.0");
    const quota = namespace.storage.normalizeStorageError({ name: "QuotaExceededError" });
    const abort = namespace.storage.normalizeStorageError({ name: "AbortError" });
    record("Fallback-Quota-Klassifizierung", quota.name === "QuotaExceededError");
    record("Fallback-Abbruch-Klassifizierung", abort.name === "AbortError");
    const valid = targetPayload(projectId);
    const validRecord = { snapshotId: "valid", revision: 1, payload: valid, checksum: namespace.storage.checksum(valid) };
    const brokenRecord = { snapshotId: "broken", revision: 2, payload: valid, checksum: "00000000" };
    const selected = namespace.storage.selectLatestUsableRecord(brokenRecord, [brokenRecord, validRecord], validator, { catalogVersion: "1.0.0" });
    record("Fallback beschädigte Reihe", selected?.record?.snapshotId === "valid");
  }

  async function run() {
    try {
      const projectId = window.__PROVOWARE_FAILURE_PROJECT__ || "failure-smoke-project";
      if (window.__PROVOWARE_FAILURE_EMBEDDED__) fallbackScenarios(projectId);
      else await realScenarios(projectId);
      document.body.dataset.storageFailureStatus = "passed";
    } catch (error) {
      results.push({ name: "Gesamtablauf", passed: false, detail: error.message });
      document.body.dataset.storageFailureStatus = "failed";
    } finally {
      const output = document.createElement("pre");
      output.id = "storage-failure-result";
      output.textContent = JSON.stringify({ status: document.body.dataset.storageFailureStatus, results }, null, 2);
      document.body.append(output);
    }
  }

  run();
})();
