(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};

  class StateManager {
    constructor() {
      this.listeners = new Set();
      this.state = {
        catalog: null,
        rules: [],
        templates: [],
        prompts: [],
        answers: {},
        currentQuestionId: null,
        dataMode: "loading",
        validationErrors: [],
        projectId: "default-project",
        projectName: "PROVOWARE Entwicklungsplan",
        schemaVersion: "1.1.0",
        theme: "dark",
        storageStatus: "checking",
        revision: 0,
        restoredFrom: null,
        createdAt: new Date().toISOString()
      };
    }

    getState() { return structuredClone(this.state); }

    update(patch, message = "") {
      this.state = { ...this.state, ...patch };
      for (const listener of this.listeners) listener(this.getState(), message);
    }

    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

    setProjectId(projectId) { this.update({ projectId }, "Projektkennung gesetzt."); }

    setCatalogs({ questions, rules, templates, prompts, dataMode }) {
      const firstQuestion = questions.questions[0];
      this.update({
        catalog: questions,
        rules: rules.rules,
        templates: templates.templates,
        prompts: prompts.prompts,
        dataMode,
        currentQuestionId: firstQuestion?.id || null
      }, "Datenkataloge geladen.");
    }

    setAnswer(questionId, value) {
      this.update({ answers: { ...this.state.answers, [questionId]: value } }, "Antwort übernommen.");
    }

    setCurrentQuestion(questionId) { this.update({ currentQuestionId: questionId }, "Frage gewechselt."); }

    setTheme(theme) {
      this.update({ theme: theme === "light" ? "light" : "dark" }, "Theme gewechselt.");
    }

    restoreProject(payload, metadata = {}) {
      const source = metadata.source || null;
      const message = source === "manual-recovery"
        ? "Snapshot manuell wiederhergestellt."
        : source === "recovery"
          ? "Letzter gültiger Snapshot wiederhergestellt."
          : "Gespeicherter Projektstand geladen.";
      this.update({
        answers: payload.answers || {},
        currentQuestionId: payload.currentQuestionId || this.state.currentQuestionId,
        theme: payload.theme || "dark",
        projectName: payload.name || this.state.projectName,
        createdAt: payload.createdAt || this.state.createdAt,
        revision: metadata.revision || 0,
        restoredFrom: source
      }, message);
    }

    setStorageStatus(storageStatus, revision = this.state.revision, restoredFrom = this.state.restoredFrom) {
      this.update({ storageStatus, revision, restoredFrom }, "Speicherstatus aktualisiert.");
    }

    setValidationErrors(errors) {
      this.update({ validationErrors: errors }, errors.length ? "Datenfehler erkannt." : "Daten geprüft.");
    }
  }

  namespace.state = new StateManager();
})();
