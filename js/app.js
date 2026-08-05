(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  let storageReady = false;
  let saveTimer = null;
  let saveChain = Promise.resolve();
  let autosaveSuspended = 0;
  let pendingAutosave = false;

  async function loadJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} konnte nicht geladen werden.`);
    return response.json();
  }

  async function loadCatalogs() {
    try {
      const [questions, rules, templates, prompts] = await Promise.all([
        loadJson("data/questions.json"), loadJson("data/rules.json"),
        loadJson("data/templates.json"), loadJson("data/prompts.json")
      ]);
      return { questions, rules, templates, prompts, dataMode: "files" };
    } catch (error) {
      console.info("Lokale JSON-Dateien sind in diesem Browsermodus nicht abrufbar. Der eingebaute Beispieldatensatz wird verwendet.", error);
      return { ...namespace.workflow.getFallbackCatalogs(), dataMode: "fallback" };
    }
  }

  function projectIdFromLocation() {
    const value = new URLSearchParams(location.search).get("project") || "default-project";
    return /^[a-z0-9][a-z0-9._-]{2,63}$/.test(value) ? value : "default-project";
  }

  function updateProjectUrl(projectId) {
    try {
      if (!["http:", "https:", "file:"].includes(location.protocol)) return;
      const url = new URL(location.href);
      url.searchParams.set("project", projectId);
      history.replaceState(null, "", url);
    } catch (_error) {
      // Eingebettete Testseiten besitzen nicht immer eine veränderbare URL.
    }
  }

  function storedProjectValidator(payload) {
    const state = namespace.state.getState();
    return namespace.validation.validateStoredProject(payload, state.catalog);
  }

  function currentMigrationContext() {
    const state = namespace.state.getState();
    return namespace.storage.migrationContext(state.catalog?.catalogVersion || "1.0.0");
  }

  async function persistNow(reason = "autosave") {
    if (!storageReady) return null;
    const state = namespace.state.getState();
    if (state.projectLifecycle !== "active") return null;
    const payload = namespace.storage.createPayload(state);
    const errors = storedProjectValidator(payload);
    if (errors.length) throw new Error(`Projektstand kann nicht gespeichert werden: ${errors.join(" ")}`);
    const result = await namespace.storage.saveProject(payload, reason);
    const limit = await namespace.storage.getRetentionLimit(state.projectId);
    const retention = await namespace.storage.pruneSnapshots(
      state.projectId, limit, storedProjectValidator, currentMigrationContext()
    );
    namespace.state.setStorageStatus("saved", result.revision, result.source);
    return { ...result, retention };
  }

  function scheduleAutosave(state, message) {
    if (!storageReady || autosaveSuspended > 0 || state.projectLifecycle !== "active" || [
      "Speicherstatus aktualisiert.", "Datenkataloge geladen.", "Daten geprüft.",
      "Projektkennung gesetzt.", "Projektstatus aktualisiert.",
      "Gespeicherter Projektstand geladen.", "Neues Projekt geöffnet.", "Projektkopie geöffnet.",
      "Letzter gültiger Snapshot wiederhergestellt.", "Snapshot manuell wiederhergestellt.",
      "Projektstand schrittweise migriert."
    ].includes(message)) return;
    clearTimeout(saveTimer);
    pendingAutosave = true;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      pendingAutosave = false;
      saveChain = saveChain
        .then(() => persistNow("autosave"))
        .catch(error => {
          console.error(error);
          namespace.state.setStorageStatus("error");
        });
    }, 180);
  }

  async function flush(reason = "manual-save") {
    clearTimeout(saveTimer);
    saveTimer = null;
    pendingAutosave = false;
    saveChain = saveChain.then(() => persistNow(reason));
    return saveChain;
  }

  async function settlePendingSave(reason = "project-switch") {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (pendingAutosave) {
      pendingAutosave = false;
      saveChain = saveChain.then(() => persistNow(reason));
    }
    return saveChain;
  }

  async function getStorageOverview() {
    if (!storageReady) throw new Error("Der lokale Speicher ist noch nicht bereit.");
    const state = namespace.state.getState();
    return namespace.storage.getStorageOverview(
      state.projectId, storedProjectValidator, currentMigrationContext()
    );
  }

  async function createSnapshot() { return flush("manual-snapshot"); }

  async function setRetention(requestedLimit) {
    if (!storageReady) throw new Error("Der lokale Speicher ist nicht verfügbar.");
    const state = namespace.state.getState();
    const limit = await namespace.storage.setRetentionLimit(state.projectId, requestedLimit);
    const result = await namespace.storage.pruneSnapshots(
      state.projectId, limit, storedProjectValidator, currentMigrationContext()
    );
    return { ...result, limit };
  }

  async function restoreSnapshot(snapshotId) {
    if (!storageReady) throw new Error("Der lokale Speicher ist nicht verfügbar.");
    clearTimeout(saveTimer);
    saveTimer = null;
    pendingAutosave = false;
    autosaveSuspended += 1;
    try {
      saveChain = saveChain.then(async () => {
        const state = namespace.state.getState();
        return namespace.storage.restoreSnapshot(
          state.projectId, snapshotId, storedProjectValidator, currentMigrationContext()
        );
      });
      const result = await saveChain;
      namespace.state.restoreProject(result.payload, {
        revision: result.revision,
        source: "manual-recovery",
        migratedFrom: result.migratedFrom,
        lifecycle: "active"
      });
      namespace.state.setStorageStatus("recovered", result.revision, "manual-recovery");
      return result;
    } finally {
      autosaveSuspended -= 1;
    }
  }

  async function openProject(projectId, options = {}) {
    if (!storageReady) throw new Error("Der lokale Speicher ist noch nicht bereit.");
    const project = await namespace.projectRepository.getProjectRecord(projectId);
    if (!project) throw new Error("Das Projekt wurde nicht gefunden.");
    if (!namespace.projectRepository.lifecycleActionAllowed(project.summary.lifecycle.state, "open")) {
      throw new Error("Archivierte Projekte und Projekte im Papierkorb müssen zuerst wiederhergestellt werden.");
    }
    autosaveSuspended += 1;
    try {
      if (!options.skipPendingSave) await settlePendingSave("project-switch");
      const restored = await namespace.storage.loadLatestValid(
        projectId, storedProjectValidator, currentMigrationContext()
      );
      if (!restored) throw new Error("Für dieses Projekt wurde kein gültiger Projektstand gefunden.");
      namespace.state.restoreProject(restored.payload, {
        ...restored,
        source: options.source || restored.source,
        lifecycle: "active"
      });
      namespace.state.setStorageStatus(
        restored.source === "recovery" || restored.source === "migration" ? "recovered" : "ready",
        restored.revision || project.summary.revision,
        restored.source || null
      );
      updateProjectUrl(projectId);
      const limit = await namespace.storage.getRetentionLimit(projectId);
      await namespace.storage.pruneSnapshots(projectId, limit, storedProjectValidator, currentMigrationContext());
      return restored;
    } finally {
      autosaveSuspended -= 1;
    }
  }

  function projectCreationOptions(name) {
    const state = namespace.state.getState();
    return {
      name,
      catalogVersion: state.catalog?.catalogVersion || "1.0.0",
      currentQuestionId: state.catalog?.questions?.[0]?.id || null,
      theme: state.theme
    };
  }

  async function createProject(name, options = {}) {
    if (!storageReady) throw new Error("Der lokale Speicher ist noch nicht bereit.");
    autosaveSuspended += 1;
    try {
      if (!options.skipPendingSave) await settlePendingSave("project-switch");
      const result = await namespace.projectRepository.createProject(projectCreationOptions(name));
      namespace.state.restoreProject(result.payload, {
        revision: result.revision,
        source: "project-created",
        lifecycle: "active"
      });
      namespace.state.setStorageStatus("saved", result.revision, "current");
      updateProjectUrl(result.projectId);
      return result;
    } finally {
      autosaveSuspended -= 1;
    }
  }

  async function renameProject(projectId, name) {
    if (!storageReady) throw new Error("Der lokale Speicher ist noch nicht bereit.");
    if (namespace.state.getState().projectId === projectId) await settlePendingSave("before-project-rename");
    const result = await namespace.projectRepository.renameProject(projectId, name);
    if (namespace.state.getState().projectId === projectId) {
      namespace.state.restoreProject(result.payload, { revision: result.revision, source: "current", lifecycle: "active" });
      namespace.state.setStorageStatus("saved", result.revision, "current");
    }
    return result;
  }

  async function duplicateProject(projectId, name) {
    if (!storageReady) throw new Error("Der lokale Speicher ist noch nicht bereit.");
    autosaveSuspended += 1;
    try {
      await settlePendingSave("before-project-duplicate");
      const result = await namespace.projectRepository.duplicateProject(projectId, name);
      namespace.state.restoreProject(result.payload, {
        revision: result.revision,
        source: "project-duplicated",
        lifecycle: "active"
      });
      namespace.state.setStorageStatus("saved", result.revision, "current");
      updateProjectUrl(result.projectId);
      return result;
    } finally {
      autosaveSuspended -= 1;
    }
  }

  async function activateFallback(excludedProjectId) {
    const projects = await namespace.projectRepository.listProjects();
    const candidate = projects.find(item => item.id !== excludedProjectId && item.lifecycle.state === "active");
    if (candidate) return openProject(candidate.id, { skipPendingSave: true });
    return createProject("Neues Projekt", { skipPendingSave: true });
  }

  async function archiveProject(projectId) {
    const isCurrent = namespace.state.getState().projectId === projectId;
    if (isCurrent) await settlePendingSave("before-project-archive");
    const lifecycle = await namespace.projectRepository.setLifecycle(projectId, "archive");
    if (isCurrent) await activateFallback(projectId);
    return lifecycle;
  }

  async function trashProject(projectId) {
    const isCurrent = namespace.state.getState().projectId === projectId;
    if (isCurrent) await settlePendingSave("before-project-trash");
    const lifecycle = await namespace.projectRepository.setLifecycle(projectId, "trash");
    if (isCurrent) await activateFallback(projectId);
    return lifecycle;
  }

  async function restoreProjectLifecycle(projectId) {
    return namespace.projectRepository.setLifecycle(projectId, "active");
  }

  async function deleteProject(projectId, exactName) {
    const isCurrent = namespace.state.getState().projectId === projectId;
    const result = await namespace.projectRepository.permanentDelete(projectId, exactName);
    if (isCurrent) await activateFallback(projectId);
    return result;
  }

  async function listProjects() {
    if (!storageReady) throw new Error("Der lokale Speicher ist noch nicht bereit.");
    return namespace.projectRepository.listProjects();
  }

  async function startStorage() {
    await namespace.storage.open();
    const state = namespace.state.getState();
    const projects = await namespace.projectRepository.listProjects();
    const selected = projects.find(item => item.id === state.projectId && item.lifecycle.state === "active")
      || projects.find(item => item.lifecycle.state === "active");
    let restored = null;

    if (selected) {
      namespace.state.setProjectId(selected.id);
      restored = await namespace.storage.loadLatestValid(
        selected.id, storedProjectValidator, currentMigrationContext()
      );
      if (restored) {
        namespace.state.restoreProject(restored.payload, { ...restored, lifecycle: "active" });
        updateProjectUrl(selected.id);
      }
    }

    if (!restored && projects.length > 0) {
      const created = await namespace.projectRepository.createProject(projectCreationOptions("Neues Projekt"));
      restored = { ...created, source: "project-created" };
      namespace.state.restoreProject(created.payload, {
        revision: created.revision,
        source: "project-created",
        lifecycle: "active"
      });
      updateProjectUrl(created.projectId);
    }

    storageReady = true;
    namespace.state.setStorageStatus(
      restored?.source === "recovery" || restored?.source === "migration" ? "recovered" : "ready",
      restored?.revision || 0,
      restored?.source || null
    );
    namespace.state.subscribe(scheduleAutosave);

    if (!restored) {
      await flush("initial-state");
      updateProjectUrl(namespace.state.getState().projectId);
    } else {
      const currentProjectId = namespace.state.getState().projectId;
      const limit = await namespace.storage.getRetentionLimit(currentProjectId);
      await namespace.storage.pruneSnapshots(
        currentProjectId, limit, storedProjectValidator, currentMigrationContext()
      );
    }
  }

  function loadSmokeHarness() {
    if (new URLSearchParams(location.search).get("smoke") !== "1") return;
    const script = document.createElement("script");
    script.src = "tests/smoke/browser-smoke.js";
    script.async = true;
    document.head.append(script);
  }

  async function start() {
    namespace.ui.initialize();
    namespace.projectManager.initialize();
    namespace.reportManager.initialize();
    namespace.storageManager.initialize();
    namespace.state.setProjectId(projectIdFromLocation());
    const catalogs = await loadCatalogs();
    const errors = namespace.validation.validateQuestionCatalog(catalogs.questions);
    namespace.state.setCatalogs(catalogs);
    namespace.state.setValidationErrors(errors);
    try {
      await startStorage();
    } catch (error) {
      console.error(error);
      namespace.state.setStorageStatus("unavailable");
    }
    namespace.ui.render(namespace.state.getState(), errors.length ? "Datenfehler erkannt." : "Prototyp bereit.");
    loadSmokeHarness();
  }

  namespace.persistence = {
    flush,
    persistNow,
    getStorageOverview,
    createSnapshot,
    setRetention,
    restoreSnapshot,
    listProjects,
    openProject,
    createProject,
    renameProject,
    duplicateProject,
    archiveProject,
    trashProject,
    restoreProjectLifecycle,
    deleteProject
  };
  window.addEventListener("DOMContentLoaded", () => { namespace.ready = start(); }, { once: true });
})();
