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
        projectLifecycle: "active",
        schemaVersion: "1.2.0",
        theme: "dark",
        storageStatus: "checking",
        revision: 0,
        restoredFrom: null,
        createdAt: new Date().toISOString(),
        lastMigration: null
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
        currentQuestionId: this.state.currentQuestionId || firstQuestion?.id || null
      }, "Datenkataloge geladen.");
    }

    setAnswer(questionId, value) {
      this.update({ answers: { ...this.state.answers, [questionId]: value } }, "Antwort übernommen.");
    }

    setCurrentQuestion(questionId) { this.update({ currentQuestionId: questionId }, "Frage gewechselt."); }

    setTheme(theme) {
      this.update({ theme: theme === "light" ? "light" : "dark" }, "Theme gewechselt.");
    }

    setProjectLifecycle(projectLifecycle) {
      this.update({ projectLifecycle }, "Projektstatus aktualisiert.");
    }

    restoreProject(payload, metadata = {}) {
      const source = metadata.source || null;
      const message = source === "migration"
        ? "Projektstand schrittweise migriert."
        : source === "manual-recovery"
          ? "Snapshot manuell wiederhergestellt."
          : source === "recovery"
            ? "Letzter gültiger Snapshot wiederhergestellt."
            : source === "project-created"
              ? "Neues Projekt geöffnet."
              : source === "project-duplicated"
                ? "Projektkopie geöffnet."
                : source === "project-imported"
                  ? "Importiertes Projekt geöffnet."
                  : "Gespeicherter Projektstand geladen.";
      this.update({
        projectId: payload.projectId || this.state.projectId,
        projectName: payload.name || this.state.projectName,
        projectLifecycle: metadata.lifecycle || "active",
        schemaVersion: payload.schemaVersion || this.state.schemaVersion,
        answers: payload.answers || {},
        currentQuestionId: payload.currentQuestionId || this.state.catalog?.questions?.[0]?.id || this.state.currentQuestionId,
        theme: payload.theme || "dark",
        createdAt: payload.createdAt || this.state.createdAt,
        revision: metadata.revision || 0,
        restoredFrom: source,
        lastMigration: metadata.migratedFrom
          ? { from: metadata.migratedFrom, to: payload.schemaVersion, steps: metadata.migrationSteps || [] }
          : null
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
