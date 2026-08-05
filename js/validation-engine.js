(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};

  function validateQuestionCatalog(catalog) {
    const errors = [];
    if (!catalog || !Array.isArray(catalog.questions) || !Array.isArray(catalog.phases)) {
      return ["Der Fragenkatalog besitzt nicht die erwartete Grundstruktur."];
    }

    const ids = new Set();
    const phaseIds = new Set(catalog.phases.map(phase => phase.id));
    for (const question of catalog.questions) {
      if (!question.id || ids.has(question.id)) errors.push(`Ungültige oder doppelte Frage-ID: ${question.id || "ohne ID"}`);
      ids.add(question.id);
      if (!phaseIds.has(question.phaseId)) errors.push(`Frage ${question.id} verweist auf eine unbekannte Phase.`);
      if (!Array.isArray(question.options) || question.options.length < 2) errors.push(`Frage ${question.id} benötigt mindestens zwei Optionen.`);
      if (!question.options?.some(option => option.value === question.recommendedValue)) errors.push(`Empfehlung von ${question.id} ist keine gültige Option.`);
    }
    return errors;
  }

  function isAnswered(question, answers) {
    const value = answers[question.id];
    return value !== undefined && value !== null && value !== "";
  }

  function calculateProgress(catalog, answers) {
    if (!catalog?.questions.length) return 0;
    const required = catalog.questions.filter(question => question.required);
    const answered = required.filter(question => isAnswered(question, answers)).length;
    return Math.round((answered / required.length) * 100);
  }

  namespace.validation = { validateQuestionCatalog, isAnswered, calculateProgress };
})();
