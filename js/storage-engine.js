(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const DB_NAME = "provoware-entwicklungsplan";
  const DB_VERSION = 1;
  const PROJECT_SCHEMA_VERSION = "1.1.0";
  const STORES = Object.freeze({ projects: "projects", snapshots: "snapshots", meta: "meta", migrations: "migrationLog" });
  let databasePromise = null;

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
      createdAt: state.createdAt || now,
      updatedAt: now
    };
  }

  function validChecksum(record) {
    return Boolean(record?.payload) && record.checksum === checksum(record.payload);
  }

  async function saveProject(payload, reason = "autosave") {
    const database = await open();
    const transaction = database.transaction(Object.values(STORES), "readwrite");
    const done = transactionToPromise(transaction);
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
    const snapshotRecord = { snapshotId: `${payload.projectId}:${String(revision).padStart(12, "0")}`, projectId: payload.projectId, revision, payload: safePayload, checksum: recordChecksum, savedAt, reason };
    projects.put(projectRecord);
    snapshots.add(snapshotRecord);
    meta.put({ key: `project:${payload.projectId}`, projectId: payload.projectId, revision, schemaVersion: payload.schemaVersion, savedAt, lastReason: reason });
    migrations.add({ projectId: payload.projectId, type: reason === "automatic-recovery" ? "recovery" : "save", revision, schemaVersion: payload.schemaVersion, createdAt: savedAt, reason });
    await done;
    return { revision, savedAt, source: reason === "automatic-recovery" ? "recovery" : "current" };
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
    if (current && validChecksum(current) && validator(current.payload)) return { record: current, source: "current" };
    const fallback = [...(snapshots || [])].sort((left, right) => right.revision - left.revision).find(record => validChecksum(record) && validator(record.payload));
    return fallback ? { record: fallback, source: "snapshot" } : null;
  }

  async function loadLatestValid(projectId, validator) {
    const { current, snapshots } = await readProjectAndSnapshots(projectId);
    const selected = selectLatestValidRecord(current, snapshots, validator);
    if (!selected) return null;
    if (selected.source === "current") return { payload: clone(selected.record.payload), revision: selected.record.revision, source: "current" };
    const recovery = await saveProject(selected.record.payload, "automatic-recovery");
    return { payload: clone(selected.record.payload), revision: recovery.revision, source: "recovery", recoveredRevision: selected.record.revision };
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
    return { project, snapshotCount: snapshots.length, meta, logCount: logs.length, recoveryCount: logs.filter(item => item.type === "recovery").length };
  }

  namespace.storage = { DB_NAME, DB_VERSION, PROJECT_SCHEMA_VERSION, STORES, open, createPayload, saveProject, loadLatestValid, getDiagnostics, checksum, selectLatestValidRecord };
})();
