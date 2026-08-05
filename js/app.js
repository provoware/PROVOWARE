(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};

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

  async function start() {
    namespace.ui.initialize();
    const catalogs = await loadCatalogs();
    const errors = namespace.validation.validateQuestionCatalog(catalogs.questions);
    namespace.state.setCatalogs(catalogs);
    namespace.state.setValidationErrors(errors);
    namespace.ui.render(namespace.state.getState(), errors.length ? "Datenfehler erkannt." : "Prototyp bereit.");
  }

  window.addEventListener("DOMContentLoaded", start, { once: true });
})();
