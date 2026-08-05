(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const STATES = Object.freeze({ ACTIVE: "active", ARCHIVE: "archive", TRASH: "trash" });
  const VALID_STATES = new Set(Object.values(STATES));

  function clone(value) { return structuredClone(value); }

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

  function validateName(name) {
    const normalized = String(name || "").trim().replace(/\s+/g, " ");
    if (normalized.length < 3) throw new Error("Der Projektname muss mindestens 3 Zeichen enthalten.");
    if (normalized.length > 80) throw new Error("Der Projektname darf höchstens 80 Zeichen enthalten.");
    return normalized;
  }

  function lifecycleKey(projectId) { return `lifecycle:${projectId}`; }

  function normalizeLifecycle(record = {}, projectId = record.projectId || null) {
    const state = VALID_STATES.has(record.state) ? record.state : STATES.ACTIVE;
    return {
      key: lifecycleKey(projectId),
      projectId,
      state,
      archivedAt: record.archivedAt || null,
      trashedAt: record.trashedAt || null,
      restoredAt: record.restoredAt || null,
      updatedAt: record.updatedAt || null
    };
  }

  function lifecycleActionAllowed(state, action) {
    const current = VALID_STATES.has(state) ? state : STATES.ACTIVE;
    const allowed = {
      archive: current === STATES.ACTIVE,
      trash: current === STATES.ACTIVE || current === STATES.ARCHIVE,
      restore: current === STATES.ARCHIVE || current === STATES.TRASH,
      delete: current === STATES.TRASH,
      open: current === STATES.ACTIVE
    };
    return Boolean(allowed[action]);
  }

  function slugify(value) {
    return String(value || "projekt")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 36) || "projekt";
  }

  function createProjectId(name, existingIds = []) {
    const existing = new Set(existingIds);
    const base = slugify(name);
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const suffix = typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 10)
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const candidate = `${base}-${suffix}`.slice(0, 64);
      if (!existing.has(candidate)) return candidate;
    }
    throw new Error("Es konnte keine eindeutige Projekt-ID erzeugt werden.");
  }

  function summaryFrom(record, lifecycleRecord) {
    const lifecycle = normalizeLifecycle(lifecycleRecord, record.id);
    return {
      id: record.id,
      name: record.payload?.name || record.id,
      revision: Number(record.revision || 0),
      savedAt: record.savedAt || record.payload?.updatedAt || null,
      createdAt: record.payload?.createdAt || null,
      schemaVersion: record.payload?.schemaVersion || null,
      answerCount: Object.keys(record.payload?.answers || {}).length,
      lifecycle
    };
  }

  async function listProjects() {
    const database = await namespace.storage.open();
    const transaction = database.transaction([namespace.storage.STORES.projects, namespace.storage.STORES.meta], "readonly");
    const done = transactionToPromise(transaction);
    const projectsPromise = requestToPromise(transaction.objectStore(namespace.storage.STORES.projects).getAll());
    const metaPromise = requestToPromise(transaction.objectStore(namespace.storage.STORES.meta).getAll());
    const [records, metaRecords] = await Promise.all([projectsPromise, metaPromise]);
    await done;
    const lifecycleByProject = new Map(
      metaRecords
        .filter(item => typeof item.key === "string" && item.key.startsWith("lifecycle:"))
        .map(item => [item.projectId, item])
    );
    return records
      .map(record => summaryFrom(record, lifecycleByProject.get(record.id)))
      .sort((left, right) => {
        const stateOrder = { active: 0, archive: 1, trash: 2 };
        return (stateOrder[left.lifecycle.state] - stateOrder[right.lifecycle.state])
          || String(right.savedAt || "").localeCompare(String(left.savedAt || ""))
          || left.name.localeCompare(right.name, "de");
      });
  }

  async function getProjectRecord(projectId) {
    const database = await namespace.storage.open();
    const transaction = database.transaction([namespace.storage.STORES.projects, namespace.storage.STORES.meta], "readonly");
    const done = transactionToPromise(transaction);
    const projectPromise = requestToPromise(transaction.objectStore(namespace.storage.STORES.projects).get(projectId));
    const lifecyclePromise = requestToPromise(transaction.objectStore(namespace.storage.STORES.meta).get(lifecycleKey(projectId)));
    const [record, lifecycleRecord] = await Promise.all([projectPromise, lifecyclePromise]);
    await done;
    if (!record) return null;
    return { record: clone(record), summary: summaryFrom(record, lifecycleRecord) };
  }

  function createBlankPayload({ projectId, name, catalogVersion = "1.0.0", currentQuestionId = null, theme = "dark" }) {
    const now = new Date().toISOString();
    return {
      schemaVersion: namespace.storage.PROJECT_SCHEMA_VERSION,
      projectId,
      name: validateName(name),
      answers: {},
      currentQuestionId,
      theme: theme === "light" ? "light" : "dark",
      questionCatalogVersion: catalogVersion,
      createdAt: now,
      updatedAt: now,
      lastValidatedAt: now
    };
  }

  async function createProject(options) {
    const projects = await listProjects();
    const name = validateName(options.name);
    const projectId = options.projectId || createProjectId(name, projects.map(item => item.id));
    const payload = createBlankPayload({ ...options, name, projectId });
    const result = await namespace.storage.saveProject(payload, "project-created");
    return { ...result, projectId, payload };
  }

  async function renameProject(projectId, requestedName) {
    const project = await getProjectRecord(projectId);
    if (!project) throw new Error("Das Projekt wurde nicht gefunden.");
    const payload = clone(project.record.payload);
    payload.name = validateName(requestedName);
    payload.updatedAt = new Date().toISOString();
    payload.lastValidatedAt = payload.updatedAt;
    const result = await namespace.storage.saveProject(payload, "project-renamed");
    return { ...result, projectId, payload };
  }

  async function duplicateProject(projectId, requestedName) {
    const project = await getProjectRecord(projectId);
    if (!project) throw new Error("Das Ausgangsprojekt wurde nicht gefunden.");
    const projects = await listProjects();
    const name = validateName(requestedName || `${project.summary.name} – Kopie`);
    const newProjectId = createProjectId(name, projects.map(item => item.id));
    const now = new Date().toISOString();
    const payload = {
      ...clone(project.record.payload),
      projectId: newProjectId,
      name,
      createdAt: now,
      updatedAt: now,
      lastValidatedAt: now
    };
    const result = await namespace.storage.saveProject(payload, "project-duplicated");
    return { ...result, projectId: newProjectId, sourceProjectId: projectId, payload };
  }

  async function setLifecycle(projectId, targetState) {
    if (!VALID_STATES.has(targetState)) throw new Error(`Unbekannter Projektstatus: ${targetState}`);
    const database = await namespace.storage.open();
    const transaction = database.transaction([namespace.storage.STORES.projects, namespace.storage.STORES.meta, namespace.storage.STORES.migrations], "readwrite");
    const done = transactionToPromise(transaction);
    try {
      const projects = transaction.objectStore(namespace.storage.STORES.projects);
      const meta = transaction.objectStore(namespace.storage.STORES.meta);
      const migrations = transaction.objectStore(namespace.storage.STORES.migrations);
      const project = await requestToPromise(projects.get(projectId));
      if (!project) throw new Error("Das Projekt wurde nicht gefunden.");
      const previous = normalizeLifecycle(await requestToPromise(meta.get(lifecycleKey(projectId))), projectId);
      const now = new Date().toISOString();
      const next = {
        ...previous,
        state: targetState,
        archivedAt: targetState === STATES.ARCHIVE ? now : previous.archivedAt,
        trashedAt: targetState === STATES.TRASH ? now : previous.trashedAt,
        restoredAt: targetState === STATES.ACTIVE && previous.state !== STATES.ACTIVE ? now : previous.restoredAt,
        updatedAt: now
      };
      meta.put(next);
      migrations.add({
        projectId,
        type: "project-lifecycle",
        fromState: previous.state,
        toState: targetState,
        createdAt: now
      });
      await done;
      return clone(next);
    } catch (error) {
      try { transaction.abort(); } catch (_ignored) {}
      await done.catch(() => {});
      throw error;
    }
  }

  function deleteCursorMatches(source, query) {
    return new Promise((resolve, reject) => {
      let count = 0;
      const request = source.openCursor(query);
      request.addEventListener("error", () => reject(request.error || new Error("Datensätze konnten nicht gelöscht werden.")), { once: true });
      request.addEventListener("success", () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(count);
          return;
        }
        cursor.delete();
        count += 1;
        cursor.continue();
      });
    });
  }

  async function permanentDelete(projectId, expectedName) {
    const database = await namespace.storage.open();
    const transaction = database.transaction(Object.values(namespace.storage.STORES), "readwrite");
    const done = transactionToPromise(transaction);
    try {
      const projects = transaction.objectStore(namespace.storage.STORES.projects);
      const snapshots = transaction.objectStore(namespace.storage.STORES.snapshots);
      const meta = transaction.objectStore(namespace.storage.STORES.meta);
      const migrations = transaction.objectStore(namespace.storage.STORES.migrations);
      const project = await requestToPromise(projects.get(projectId));
      if (!project) throw new Error("Das Projekt wurde bereits entfernt oder existiert nicht.");
      const actualName = project.payload?.name || projectId;
      if (String(expectedName || "") !== actualName) throw new Error("Der eingegebene Projektname stimmt nicht exakt überein.");
      const lifecycle = normalizeLifecycle(await requestToPromise(meta.get(lifecycleKey(projectId))), projectId);
      if (!lifecycleActionAllowed(lifecycle.state, "delete")) throw new Error("Endgültiges Löschen ist ausschließlich im Papierkorb erlaubt.");

      projects.delete(projectId);
      const snapshotCountPromise = deleteCursorMatches(snapshots.index("projectId"), IDBKeyRange.only(projectId));
      const logCountPromise = deleteCursorMatches(migrations.index("projectId"), IDBKeyRange.only(projectId));
      const metaCountPromise = new Promise((resolve, reject) => {
        let count = 0;
        const request = meta.openCursor();
        request.addEventListener("error", () => reject(request.error || new Error("Projektmetadaten konnten nicht entfernt werden.")), { once: true });
        request.addEventListener("success", () => {
          const cursor = request.result;
          if (!cursor) {
            resolve(count);
            return;
          }
          const value = cursor.value || {};
          if (value.projectId === projectId || [
            `project:${projectId}`,
            `retention:${projectId}`,
            lifecycleKey(projectId)
          ].includes(String(cursor.key))) {
            cursor.delete();
            count += 1;
          }
          cursor.continue();
        });
      });
      const [snapshotCount, logCount, metaCount] = await Promise.all([snapshotCountPromise, logCountPromise, metaCountPromise]);
      await done;
      return { projectId, name: actualName, snapshotCount, logCount, metaCount };
    } catch (error) {
      try { transaction.abort(); } catch (_ignored) {}
      await done.catch(() => {});
      throw error;
    }
  }

  namespace.projectRepository = {
    STATES,
    validateName,
    normalizeLifecycle,
    lifecycleActionAllowed,
    createProjectId,
    createBlankPayload,
    listProjects,
    getProjectRecord,
    createProject,
    renameProject,
    duplicateProject,
    setLifecycle,
    permanentDelete
  };
})();
