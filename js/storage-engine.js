(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const DB_NAME = "provoware-entwicklungsplan";
  const DB_VERSION = 2;
  const PROJECT_SCHEMA_VERSION = namespace.migrations?.TARGET_SCHEMA_VERSION || "1.2.0";
  const DEFAULT_RETENTION_LIMIT = 30;
  const MIN_RETENTION_LIMIT = 5;
  const MAX_RETENTION_LIMIT = 200;
  const STORES = Object.freeze({ projects: "projects", snapshots: "snapshots", meta: "meta", migrations: "migrationLog" });
  let databasePromise = null;
  let testFault = null;

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.addEventListener("success", () => resolve(request.result), { once: true });
      request.addEventListener("error", () => reject(request.error || new Error("IndexedDB-Anfrage fehlgeschlagen.")), { once: true });
    });
  }

  function transactionToPromise(transaction) {
    return new Promise((resolve, reject) => {
      transaction.addEventListener("complete", () => resolve(), { once: true });
      transaction.addEventListener("abort", () => reject(transaction.error || new Error("IndexedDB-Transaktion wurde abgebrochen.")), { once: true });
      transaction.addEventListener("error", () => reject(transaction.error || new Error("IndexedDB-Transaktion ist fehlgeschlagen.")), { once: true });
    });
  }

  function clone(value) { return structuredClone(value); }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function checksum(value) {
    const text = stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function normalizeRetentionLimit(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return DEFAULT_RETENTION_LIMIT;
    return Math.min(MAX_RETENTION_LIMIT, Math.max(MIN_RETENTION_LIMIT, parsed));
  }

  function makeStorageError(name, message) {
    if (typeof DOMException === "function") return new DOMException(message, name);
    const error = new Error(message);
    error.name = name;
    return error;
  }

  function normalizeStorageError(error) {
    if (error?.name === "QuotaExceededError") {
      return makeStorageError("QuotaExceededError", "Der lokale Browserspeicher ist voll. Es wurden keine unvollständigen Daten übernommen.");
    }
    if (error?.name === "AbortError") {
      return makeStorageError("AbortError", "Die Speichertransaktion wurde vollständig abgebrochen. Der vorherige Stand bleibt erhalten.");
    }
    return error instanceof Error ? error : new Error(String(error));
  }

  function setTestFault(name = null) {
    if (window.__PROVOWARE_TESTING__ !== true) throw new Error("Fehlerinjektion ist ausschließlich im Testmodus erlaubt.");
    testFault = name;
  }

  function injectTestFault(name, transaction) {
    if (testFault !== name) return;
    testFault = null;
    const error = name === "quota-before-write"
      ? makeStorageError("QuotaExceededError", "Simulierter voller Browserspeicher.")
      : makeStorageError("AbortError", "Simulierter Transaktionsabbruch.");
    try { transaction.abort(); } catch (_ignored) {}
    throw error;
  }

  function migrationContext(catalogVersion = "1.0.0") {
    return { catalogVersion, now: new Date().toISOString() };
  }

  function open() {
    if (!window.indexedDB) return Promise.reject(new Error("IndexedDB wird von diesem Browser nicht unterstützt."));
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.addEventListener("upgradeneeded", event => {
        const database = request.result;
        const transaction = request.transaction;
        if (!database.objectStoreNames.contains(STORES.projects)) database.createObjectStore(STORES.projects, { keyPath: "id" });
        if (!database.objectStoreNames.contains(STORES.snapshots)) {
          const snapshots = database.createObjectStore(STORES.snapshots, { keyPath: "snapshotId" });
          snapshots.createIndex("projectId", "projectId", { unique: false });
          snapshots.createIndex("projectRevision", ["projectId", "revision"], { unique: true });
        }
        if (!database.objectStoreNames.contains(STORES.meta)) database.createObjectStore(STORES.meta, { keyPath: "key" });
        if (!database.objectStoreNames.contains(STORES.migrations)) {
          const migrations = database.createObjectStore(STORES.migrations, { keyPath: "id", autoIncrement: true });
          migrations.createIndex("projectId", "projectId", { unique: false });
        }
        transaction.objectStore(STORES.migrations).add({
          projectId: "system", type: "database-upgrade", fromVersion: event.oldVersion,
          toVersion: event.newVersion || DB_VERSION, createdAt: new Date().toISOString()
        });
      });
      request.addEventListener("success", () => {
        const database = request.result;
        database.addEventListener("versionchange", () => { database.close(); databasePromise = null; });
        resolve(database);
      }, { once: true });
      request.addEventListener("error", () => { databasePromise = null; reject(request.error || new Error("IndexedDB konnte nicht geöffnet werden.")); }, { once: true });
      request.addEventListener("blocked", () => { databasePromise = null; reject(new Error("IndexedDB-Aktualisierung wird durch ein anderes Fenster blockiert.")); }, { once: true });
    });
    return databasePromise;
  }

  function createPayload(state) {
    const now = new Date().toISOString();
    return {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      projectId: state.projectId,
      name: state.projectName || "PROVOWARE Entwicklungsplan",
      answers: clone(state.answers || {}),
      currentQuestionId: state.currentQuestionId || null,
      theme: state.theme === "light" ? "light" : "dark",
      questionCatalogVersion: state.catalog?.catalogVersion || "1.0.0",
      createdAt: state.createdAt || now,
      updatedAt: now,
      lastValidatedAt: now
    };
  }

  function validChecksum(record) {
    return Boolean(record?.payload) && record.checksum === checksum(record.payload);
  }

  function validatorAccepts(payload, validator) {
    if (typeof validator !== "function") return true;
    const result = validator(payload);
    return Array.isArray(result) ? result.length === 0 : result === true;
  }

  function prepareRecord(record, validator, context = {}) {
    const checksumValid = validChecksum(record);
    const prepared = checksumValid
      ? namespace.migrations.preparePayload(record.payload, validator, context)
      : { payload: null, migrated: false, sourceVersion: record?.payload?.schemaVersion || null, targetVersion: PROJECT_SCHEMA_VERSION, steps: [], valid: false, validationErrors: ["Prüfsumme ungültig."] };
    return { checksumValid, ...prepared };
  }

  function inspectSnapshot(record, validator, context = {}) {
    const prepared = prepareRecord(record, validator, context);
    return {
      snapshotId: record.snapshotId,
      projectId: record.projectId,
      revision: record.revision,
      savedAt: record.savedAt,
      reason: record.reason,
      checksum: record.checksum,
      checksumValid: prepared.checksumValid,
      schemaValid: prepared.valid,
      valid: prepared.checksumValid && prepared.valid,
      validationErrors: prepared.validationErrors,
      payload: prepared.payload ? clone(prepared.payload) : clone(record.payload),
      originalPayload: clone(record.payload),
      sourceSchemaVersion: prepared.sourceVersion,
      targetSchemaVersion: prepared.targetVersion,
      migrationRequired: prepared.migrated,
      migrationSteps: clone(prepared.steps)
    };
  }

  function addMigrationSteps(store, projectId, steps, details = {}) {
    for (const step of steps || []) {
      store.add({
        projectId,
        type: "schema-migration-step",
        fromVersion: step.from,
        toVersion: step.to,
        createdAt: new Date().toISOString(),
        ...details
      });
    }
  }

  async function saveProject(payload, reason = "autosave", options = {}) {
    const database = await open();
    const transaction = database.transaction(Object.values(STORES), "readwrite");
    const done = transactionToPromise(transaction);
    try {
      const projects = transaction.objectStore(STORES.projects);
      const snapshots = transaction.objectStore(STORES.snapshots);
      const meta = transaction.objectStore(STORES.meta);
      const migrations = transaction.objectStore(STORES.migrations);
      const current = await requestToPromise(projects.get(payload.projectId));
      const revision = Math.max(0, Number(current?.revision || 0)) + 1;
      const savedAt = new Date().toISOString();
      const safePayload = clone(payload);
      const recordChecksum = checksum(safePayload);
      const projectRecord = { id: payload.projectId, revision, payload: safePayload, checksum: recordChecksum, savedAt, reason };
      const snapshotRecord = {
        snapshotId: `${payload.projectId}:${String(revision).padStart(12, "0")}`,
        projectId: payload.projectId,
        revision,
        payload: safePayload,
        checksum: recordChecksum,
        savedAt,
        reason,
        sourceSnapshotId: options.sourceSnapshotId || null
      };
      injectTestFault("quota-before-write", transaction);
      projects.put(projectRecord);
      injectTestFault("abort-after-project-put", transaction);
      snapshots.add(snapshotRecord);
      meta.put({ key: `project:${payload.projectId}`, projectId: payload.projectId, revision, schemaVersion: payload.schemaVersion, savedAt, lastReason: reason });
      migrations.add({ projectId: payload.projectId, type: reason.includes("recovery") ? "recovery" : "save", revision, schemaVersion: payload.schemaVersion, createdAt: savedAt, reason });
      addMigrationSteps(migrations, payload.projectId, options.migrationSteps, { revision, sourceSnapshotId: options.sourceSnapshotId || null });
      await done;
      return { revision, savedAt, snapshotId: snapshotRecord.snapshotId, source: reason.includes("recovery") ? "recovery" : "current" };
    } catch (error) {
      try { transaction.abort(); } catch (_ignored) {}
      await done.catch(() => {});
      throw normalizeStorageError(error);
    }
  }

  async function readProjectAndSnapshots(projectId) {
    const database = await open();
    const transaction = database.transaction([STORES.projects, STORES.snapshots], "readonly");
    const done = transactionToPromise(transaction);
    const currentPromise = requestToPromise(transaction.objectStore(STORES.projects).get(projectId));
    const snapshotPromise = requestToPromise(transaction.objectStore(STORES.snapshots).index("projectId").getAll(projectId));
    const [current, snapshots] = await Promise.all([currentPromise, snapshotPromise]);
    await done;
    return { current, snapshots: snapshots.sort((left, right) => right.revision - left.revision) };
  }

  function selectLatestValidRecord(current, snapshots, validator) {
    if (current && validChecksum(current) && validatorAccepts(current.payload, validator)) return { record: current, source: "current" };
    const fallback = [...(snapshots || [])].sort((left, right) => right.revision - left.revision).find(record => validChecksum(record) && validatorAccepts(record.payload, validator));
    return fallback ? { record: fallback, source: "snapshot" } : null;
  }

  function selectLatestUsableRecord(current, snapshots, validator, context = {}) {
    const candidates = [
      ...(current ? [{ record: current, source: "current" }] : []),
      ...[...(snapshots || [])].sort((left, right) => right.revision - left.revision).map(record => ({ record, source: "snapshot" }))
    ];
    for (const candidate of candidates) {
      const prepared = prepareRecord(candidate.record, validator, context);
      if (prepared.checksumValid && prepared.valid) return { ...candidate, prepared };
    }
    return null;
  }

  async function migrateProjectAndSnapshots(projectId, validator, context = {}) {
    const { current, snapshots } = await readProjectAndSnapshots(projectId);
    const selected = selectLatestUsableRecord(current, snapshots, validator, context);
    if (!selected?.prepared.migrated) return null;

    const legacySnapshots = snapshots
      .map(record => ({ record, prepared: prepareRecord(record, validator, context) }))
      .filter(item => item.prepared.checksumValid && item.prepared.valid && item.prepared.migrated);
    const database = await open();
    const transaction = database.transaction(Object.values(STORES), "readwrite");
    const done = transactionToPromise(transaction);
    try {
      const projects = transaction.objectStore(STORES.projects);
      const snapshotStore = transaction.objectStore(STORES.snapshots);
      const meta = transaction.objectStore(STORES.meta);
      const migrations = transaction.objectStore(STORES.migrations);
      let revision = Math.max(Number(current?.revision || 0), ...snapshots.map(item => Number(item.revision || 0)), 0);
      const createdAt = new Date().toISOString();

      injectTestFault("quota-before-write", transaction);
      for (const item of legacySnapshots) {
        revision += 1;
        const migratedPayload = clone(item.prepared.payload);
        const migratedChecksum = checksum(migratedPayload);
        snapshotStore.add({
          snapshotId: `${projectId}:${String(revision).padStart(12, "0")}`,
          projectId,
          revision,
          payload: migratedPayload,
          checksum: migratedChecksum,
          savedAt: createdAt,
          reason: "snapshot-migration",
          sourceSnapshotId: item.record.snapshotId
        });
        addMigrationSteps(migrations, projectId, item.prepared.steps, { revision, sourceSnapshotId: item.record.snapshotId });
      }

      if (selected.source === "current") {
        revision += 1;
        const originalPayload = clone(selected.record.payload);
        snapshotStore.add({
          snapshotId: `${projectId}:${String(revision).padStart(12, "0")}`,
          projectId,
          revision,
          payload: originalPayload,
          checksum: checksum(originalPayload),
          savedAt: createdAt,
          reason: "pre-migration-backup",
          sourceRevision: selected.record.revision
        });
      }

      revision += 1;
      const targetPayload = clone(selected.prepared.payload);
      const targetChecksum = checksum(targetPayload);
      const targetSnapshotId = `${projectId}:${String(revision).padStart(12, "0")}`;
      projects.put({ id: projectId, revision, payload: targetPayload, checksum: targetChecksum, savedAt: createdAt, reason: "schema-migration" });
      injectTestFault("abort-after-project-put", transaction);
      snapshotStore.add({
        snapshotId: targetSnapshotId,
        projectId,
        revision,
        payload: targetPayload,
        checksum: targetChecksum,
        savedAt: createdAt,
        reason: "schema-migration",
        sourceSnapshotId: selected.source === "snapshot" ? selected.record.snapshotId : null
      });
      meta.put({ key: `project:${projectId}`, projectId, revision, schemaVersion: PROJECT_SCHEMA_VERSION, savedAt: createdAt, lastReason: "schema-migration" });
      migrations.add({
        projectId,
        type: "schema-migration-complete",
        source: selected.source,
        sourceRevision: selected.record.revision,
        sourceSchemaVersion: selected.prepared.sourceVersion,
        targetSchemaVersion: PROJECT_SCHEMA_VERSION,
        revision,
        createdAt
      });
      addMigrationSteps(migrations, projectId, selected.prepared.steps, { revision, source: selected.source });
      await done;
      return {
        payload: targetPayload,
        revision,
        source: "migration",
        migratedFrom: selected.prepared.sourceVersion,
        migrationSteps: clone(selected.prepared.steps),
        snapshotId: targetSnapshotId
      };
    } catch (error) {
      try { transaction.abort(); } catch (_ignored) {}
      await done.catch(() => {});
      throw normalizeStorageError(error);
    }
  }

  async function loadLatestValid(projectId, validator, context = {}) {
    const migrated = await migrateProjectAndSnapshots(projectId, validator, context);
    if (migrated) return migrated;
    const { current, snapshots } = await readProjectAndSnapshots(projectId);
    const selected = selectLatestUsableRecord(current, snapshots, validator, context);
    if (!selected) return null;
    if (selected.source === "current" && !selected.prepared.migrated) {
      return { payload: clone(selected.prepared.payload), revision: selected.record.revision, source: "current" };
    }
    const recovery = await saveProject(selected.prepared.payload, "automatic-recovery", {
      sourceSnapshotId: selected.record.snapshotId || null,
      migrationSteps: selected.prepared.steps
    });
    return {
      payload: clone(selected.prepared.payload),
      revision: recovery.revision,
      source: "recovery",
      recoveredRevision: selected.record.revision,
      migratedFrom: selected.prepared.migrated ? selected.prepared.sourceVersion : null
    };
  }

  async function listSnapshots(projectId, validator, context = {}) {
    const { snapshots } = await readProjectAndSnapshots(projectId);
    const inspected = snapshots.map(record => inspectSnapshot(record, validator, context));
    const safetySnapshot = inspected.find(snapshot => snapshot.valid) || null;
    return inspected.map(snapshot => ({ ...snapshot, isSafetySnapshot: snapshot.snapshotId === safetySnapshot?.snapshotId }));
  }

  async function restoreSnapshot(projectId, snapshotId, validator, context = {}) {
    const database = await open();
    const transaction = database.transaction(STORES.snapshots, "readonly");
    const done = transactionToPromise(transaction);
    const record = await requestToPromise(transaction.objectStore(STORES.snapshots).get(snapshotId));
    await done;
    if (!record || record.projectId !== projectId) throw new Error("Der ausgewählte Snapshot gehört nicht zu diesem Projekt.");
    const inspected = inspectSnapshot(record, validator, context);
    if (!inspected.valid) throw new Error(`Snapshot ist nicht wiederherstellbar: ${inspected.validationErrors.join(" ") || "Prüfsumme ungültig."}`);
    const saved = await saveProject(inspected.payload, "manual-recovery", {
      sourceSnapshotId: snapshotId,
      migrationSteps: inspected.migrationSteps
    });
    return {
      ...saved,
      payload: clone(inspected.payload),
      restoredSnapshotId: snapshotId,
      restoredRevision: inspected.revision,
      migratedFrom: inspected.migrationRequired ? inspected.sourceSchemaVersion : null
    };
  }

  function planRetention(snapshots, requestedLimit, validator, context = {}) {
    const limit = normalizeRetentionLimit(requestedLimit);
    const ordered = [...(snapshots || [])].sort((left, right) => right.revision - left.revision);
    const safety = ordered.find(record => {
      const prepared = prepareRecord(record, validator, context);
      return prepared.checksumValid && prepared.valid;
    }) || null;
    const keep = ordered.slice(0, limit);
    if (safety && !keep.some(record => record.snapshotId === safety.snapshotId)) {
      const replaceIndex = keep.length - 1;
      if (replaceIndex >= 0) keep[replaceIndex] = safety;
      else keep.push(safety);
    }
    const keepIds = new Set(keep.map(record => record.snapshotId));
    return {
      limit,
      keepIds,
      deleteIds: ordered.filter(record => !keepIds.has(record.snapshotId)).map(record => record.snapshotId),
      safetySnapshotId: safety?.snapshotId || null
    };
  }

  async function getRetentionLimit(projectId) {
    const database = await open();
    const transaction = database.transaction(STORES.meta, "readonly");
    const done = transactionToPromise(transaction);
    const record = await requestToPromise(transaction.objectStore(STORES.meta).get(`retention:${projectId}`));
    await done;
    return normalizeRetentionLimit(record?.limit ?? DEFAULT_RETENTION_LIMIT);
  }

  async function setRetentionLimit(projectId, requestedLimit) {
    const limit = normalizeRetentionLimit(requestedLimit);
    const database = await open();
    const transaction = database.transaction([STORES.meta, STORES.migrations], "readwrite");
    const done = transactionToPromise(transaction);
    const createdAt = new Date().toISOString();
    transaction.objectStore(STORES.meta).put({ key: `retention:${projectId}`, projectId, limit, updatedAt: createdAt });
    transaction.objectStore(STORES.migrations).add({ projectId, type: "retention-change", limit, createdAt });
    await done;
    return limit;
  }

  async function pruneSnapshots(projectId, requestedLimit, validator, context = {}) {
    const { snapshots } = await readProjectAndSnapshots(projectId);
    const plan = planRetention(snapshots, requestedLimit, validator, context);
    if (!plan.deleteIds.length) return { ...plan, deleted: 0, retained: snapshots.length };
    const database = await open();
    const transaction = database.transaction([STORES.snapshots, STORES.meta, STORES.migrations], "readwrite");
    const done = transactionToPromise(transaction);
    const store = transaction.objectStore(STORES.snapshots);
    for (const snapshotId of plan.deleteIds) store.delete(snapshotId);
    const createdAt = new Date().toISOString();
    transaction.objectStore(STORES.meta).put({ key: `retention:${projectId}`, projectId, limit: plan.limit, updatedAt: createdAt });
    transaction.objectStore(STORES.migrations).add({
      projectId, type: "snapshot-prune", limit: plan.limit, deleted: plan.deleteIds.length,
      safetySnapshotId: plan.safetySnapshotId, createdAt
    });
    await done;
    return { ...plan, deleted: plan.deleteIds.length, retained: snapshots.length - plan.deleteIds.length };
  }

  async function getDiagnostics(projectId) {
    const database = await open();
    const transaction = database.transaction(Object.values(STORES), "readonly");
    const done = transactionToPromise(transaction);
    const projectRequest = requestToPromise(transaction.objectStore(STORES.projects).get(projectId));
    const snapshotsRequest = requestToPromise(transaction.objectStore(STORES.snapshots).index("projectId").getAll(projectId));
    const metaRequest = requestToPromise(transaction.objectStore(STORES.meta).get(`project:${projectId}`));
    const logsRequest = requestToPromise(transaction.objectStore(STORES.migrations).index("projectId").getAll(projectId));
    const [project, snapshots, meta, logs] = await Promise.all([projectRequest, snapshotsRequest, metaRequest, logsRequest]);
    await done;
    return {
      project,
      snapshotCount: snapshots.length,
      meta,
      logCount: logs.length,
      recoveryCount: logs.filter(item => item.type === "recovery").length,
      migrationCount: logs.filter(item => item.type === "schema-migration-complete").length,
      migrationSteps: logs.filter(item => item.type === "schema-migration-step")
    };
  }

  async function getStorageOverview(projectId, validator, context = {}) {
    const [diagnostics, snapshots, retentionLimit] = await Promise.all([
      getDiagnostics(projectId), listSnapshots(projectId, validator, context), getRetentionLimit(projectId)
    ]);
    return { diagnostics, snapshots, retentionLimit };
  }

  namespace.storage = {
    DB_NAME, DB_VERSION, PROJECT_SCHEMA_VERSION, DEFAULT_RETENTION_LIMIT, MIN_RETENTION_LIMIT,
    MAX_RETENTION_LIMIT, STORES, open, createPayload, saveProject, loadLatestValid, listSnapshots,
    restoreSnapshot, getRetentionLimit, setRetentionLimit, pruneSnapshots, getDiagnostics,
    getStorageOverview, migrateProjectAndSnapshots, checksum, inspectSnapshot, selectLatestValidRecord,
    selectLatestUsableRecord, planRetention, normalizeRetentionLimit, normalizeStorageError,
    setTestFault, migrationContext
  };
})();
