(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const PROJECT_FIELDS = new Set([
    "schemaVersion", "projectId", "name", "answers", "currentQuestionId", "theme",
    "questionCatalogVersion", "createdAt", "updatedAt", "lastValidatedAt"
  ]);

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

  function isIsoDateTime(value) {
    return typeof value === "string" && Number.isFinite(Date.parse(value));
  }

  function validateStoredProject(payload, catalog) {
    const errors = [];
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return ["Der Projektstand ist kein gültiges Objekt."];
    const unknownFields = Object.keys(payload).filter(key => !PROJECT_FIELDS.has(key));
    if (unknownFields.length) errors.push(`Unbekannte Projektfelder: ${unknownFields.join(", ")}.`);
    if (payload.schemaVersion !== "1.2.0") errors.push("Die Projektschema-Version wird nicht unterstützt.");
    if (typeof payload.projectId !== "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(payload.projectId)) errors.push("Die Projekt-ID ist ungültig.");
    if (typeof payload.name !== "string" || !payload.name.trim()) errors.push("Der Projektname fehlt.");
    if (!payload.answers || typeof payload.answers !== "object" || Array.isArray(payload.answers)) errors.push("Die Antworten besitzen kein gültiges Objektformat.");
    const questions = new Map((catalog?.questions || []).map(question => [question.id, question]));
    for (const [questionId, value] of Object.entries(payload.answers || {})) {
      const question = questions.get(questionId);
      if (!question) {
        errors.push(`Unbekannte Frage-ID im Projektstand: ${questionId}`);
        continue;
      }
      if (!question.options.some(option => option.value === value)) errors.push(`Ungültiger Antwortwert für ${questionId}.`);
    }
    if (payload.currentQuestionId !== null && payload.currentQuestionId !== undefined && !questions.has(payload.currentQuestionId)) errors.push("Die aktuelle Frage existiert nicht im Fragenkatalog.");
    if (!["dark", "light"].includes(payload.theme)) errors.push("Das gespeicherte Theme ist ungültig.");
    if (typeof payload.questionCatalogVersion !== "string" || !payload.questionCatalogVersion) errors.push("Die Fragenkatalogversion fehlt.");
    if (!isIsoDateTime(payload.createdAt) || !isIsoDateTime(payload.updatedAt) || !isIsoDateTime(payload.lastValidatedAt)) {
      errors.push("Mindestens ein Zeitstempel ist ungültig.");
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

  namespace.validation = { validateQuestionCatalog, validateStoredProject, isAnswered, calculateProgress };
})();
