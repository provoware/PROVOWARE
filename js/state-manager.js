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
        validationErrors: []
      };
    }

    getState() {
      return structuredClone(this.state);
    }

    update(patch, message = "") {
      this.state = { ...this.state, ...patch };
      for (const listener of this.listeners) listener(this.getState(), message);
    }

    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

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

    setCurrentQuestion(questionId) {
      this.update({ currentQuestionId: questionId }, "Frage gewechselt.");
    }

    setValidationErrors(errors) {
      this.update({ validationErrors: errors }, errors.length ? "Datenfehler erkannt." : "Daten geprüft.");
    }
  }

  namespace.state = new StateManager();
})();
