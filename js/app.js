(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  let storageReady = false;
  let saveTimer = null;
  let saveChain = Promise.resolve();
  let autosaveSuspended = 0;

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
    const payload = namespace.storage.createPayload(state);
    const errors = storedProjectValidator(payload);
    if (errors.length) throw new Error(`Projektstand kann nicht gespeichert werden: ${errors.join(" ")}`);
    const result = await namespace.storage.saveProject(payload, reason);
    const limit = await namespace.storage.getRetentionLimit(state.projectId);
    const retention = await namespace.storage.pruneSnapshots(
      state.projectId,
      limit,
      storedProjectValidator,
      currentMigrationContext()
    );
    namespace.state.setStorageStatus("saved", result.revision, result.source);
    return { ...result, retention };
  }

  function scheduleAutosave(_state, message) {
    if (!storageReady || autosaveSuspended > 0 || [
      "Speicherstatus aktualisiert.", "Datenkataloge geladen.", "Daten geprüft.",
      "Projektkennung gesetzt.", "Gespeicherter Projektstand geladen.",
      "Letzter gültiger Snapshot wiederhergestellt.", "Snapshot manuell wiederhergestellt.",
      "Projektstand schrittweise migriert."
    ].includes(message)) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
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
    saveChain = saveChain.then(() => persistNow(reason));
    return saveChain;
  }

  async function getStorageOverview() {
    if (!storageReady) throw new Error("Der lokale Speicher ist noch nicht bereit.");
    const state = namespace.state.getState();
    return namespace.storage.getStorageOverview(
      state.projectId,
      storedProjectValidator,
      currentMigrationContext()
    );
  }

  async function createSnapshot() {
    return flush("manual-snapshot");
  }

  async function setRetention(requestedLimit) {
    if (!storageReady) throw new Error("Der lokale Speicher ist nicht verfügbar.");
    const state = namespace.state.getState();
    const limit = await namespace.storage.setRetentionLimit(state.projectId, requestedLimit);
    const result = await namespace.storage.pruneSnapshots(
      state.projectId,
      limit,
      storedProjectValidator,
      currentMigrationContext()
    );
    return { ...result, limit };
  }

  async function restoreSnapshot(snapshotId) {
    if (!storageReady) throw new Error("Der lokale Speicher ist nicht verfügbar.");
    clearTimeout(saveTimer);
    autosaveSuspended += 1;
    try {
      saveChain = saveChain.then(async () => {
        const state = namespace.state.getState();
        return namespace.storage.restoreSnapshot(
          state.projectId,
          snapshotId,
          storedProjectValidator,
          currentMigrationContext()
        );
      });
      const result = await saveChain;
      namespace.state.restoreProject(result.payload, { revision: result.revision, source: "manual-recovery", migratedFrom: result.migratedFrom });
      namespace.state.setStorageStatus("recovered", result.revision, "manual-recovery");
      return result;
    } finally {
      autosaveSuspended -= 1;
    }
  }

  async function startStorage() {
    const state = namespace.state.getState();
    await namespace.storage.open();
    const restored = await namespace.storage.loadLatestValid(
      state.projectId,
      storedProjectValidator,
      currentMigrationContext()
    );
    if (restored) namespace.state.restoreProject(restored.payload, restored);
    storageReady = true;
    namespace.state.setStorageStatus(
      restored?.source === "recovery" || restored?.source === "migration" ? "recovered" : "ready",
      restored?.revision || 0,
      restored?.source || null
    );
    namespace.state.subscribe(scheduleAutosave);
    if (!restored) await flush("initial-state");
    else {
      const limit = await namespace.storage.getRetentionLimit(state.projectId);
      await namespace.storage.pruneSnapshots(
        state.projectId,
        limit,
        storedProjectValidator,
        currentMigrationContext()
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
    flush, persistNow, getStorageOverview, createSnapshot, setRetention, restoreSnapshot
  };
  window.addEventListener("DOMContentLoaded", () => {
    namespace.ready = start();
  }, { once: true });
})();
