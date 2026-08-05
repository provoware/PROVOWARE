(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  let storageReady = false;
  let saveTimer = null;
  let saveChain = Promise.resolve();

  async function loadJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} konnte nicht geladen werden.`);
    return response.json();
  }

  async function loadCatalogs() {
    try {
      const [questions, rules, templates, prompts] = await Promise.all([
        loadJson("data/questions.json"),
        loadJson("data/rules.json"),
        loadJson("data/templates.json"),
        loadJson("data/prompts.json")
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

  async function persistNow(reason = "autosave") {
    if (!storageReady) return null;
    const state = namespace.state.getState();
    const payload = namespace.storage.createPayload(state);
    const errors = namespace.validation.validateStoredProject(payload, state.catalog);
    if (errors.length) throw new Error(`Projektstand kann nicht gespeichert werden: ${errors.join(" ")}`);
    const result = await namespace.storage.saveProject(payload, reason);
    namespace.state.setStorageStatus("saved", result.revision, result.source);
    return result;
  }

  function scheduleAutosave(_state, message) {
    if (!storageReady || [
      "Speicherstatus aktualisiert.",
      "Datenkataloge geladen.",
      "Daten geprüft.",
      "Projektkennung gesetzt."
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

  async function startStorage() {
    const state = namespace.state.getState();
    await namespace.storage.open();
    const restored = await namespace.storage.loadLatestValid(
      state.projectId,
      payload => namespace.validation.validateStoredProject(payload, state.catalog).length === 0
    );
    if (restored) namespace.state.restoreProject(restored.payload, restored);
    storageReady = true;
    namespace.state.setStorageStatus(
      restored?.source === "recovery" ? "recovered" : "ready",
      restored?.revision || 0,
      restored?.source || null
    );
    namespace.state.subscribe(scheduleAutosave);
    if (!restored) await flush("initial-state");
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

  namespace.persistence = { flush, persistNow };
  window.addEventListener("DOMContentLoaded", () => {
    namespace.ready = start();
  }, { once: true });
})();
