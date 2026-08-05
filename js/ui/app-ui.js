(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};

  const elements = {};

  function cacheElements() {
    const ids = [
      "data-mode", "status-badge", "project-progress", "progress-text", "phase-list",
      "question-panel", "question-counter", "question-title", "question-required", "question-short-help",
      "answer-options", "question-why", "question-example", "question-pro", "question-contra",
      "question-alternative", "question-recommendation", "question-details", "previous-button",
      "recommended-button", "next-button", "answered-count", "open-count", "rule-count",
      "decision-list", "rule-list", "report-preview", "live-status", "theme-button"
    ];
    for (const id of ids) elements[id] = document.getElementById(id);
  }

  function optionLabel(question, answer) {
    return question.options.find(option => option.value === answer)?.label || answer;
  }

  function renderPhases(state) {
    elements["phase-list"].replaceChildren();
    for (const phase of state.catalog.phases) {
      const questions = namespace.workflow.getPhaseQuestions(state.catalog, phase.id);
      const answered = questions.filter(question => namespace.validation.isAnswered(question, state.answers)).length;
      const currentQuestion = namespace.workflow.getQuestionById(state.catalog, state.currentQuestionId);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "phase-button";
      if (currentQuestion?.phaseId === phase.id) button.setAttribute("aria-current", "step");
      button.innerHTML = `<strong>${phase.title}</strong><span class="phase-meta">${answered} von ${questions.length} beantwortet</span>`;
      button.addEventListener("click", () => {
        const firstOpen = questions.find(question => !namespace.validation.isAnswered(question, state.answers));
        namespace.state.setCurrentQuestion((firstOpen || questions[0]).id);
        elements["question-panel"].focus();
      });
      const item = document.createElement("li");
      item.append(button);
      elements["phase-list"].append(item);
    }
  }

  function renderQuestion(state) {
    const question = namespace.workflow.getQuestionById(state.catalog, state.currentQuestionId);
    if (!question) return;
    const index = namespace.workflow.getCurrentIndex(state.catalog, question.id);
    elements["question-counter"].textContent = `Frage ${index + 1} von ${state.catalog.questions.length}`;
    elements["question-title"].textContent = question.title;
    elements["question-required"].textContent = question.required ? "Pflichtfrage" : "Optional";
    elements["question-short-help"].textContent = question.shortHelp;
    elements["question-why"].textContent = question.why;
    elements["question-example"].textContent = question.example;
    elements["question-pro"].textContent = question.pro;
    elements["question-contra"].textContent = question.contra;
    elements["question-alternative"].textContent = question.alternative;
    elements["question-recommendation"].textContent = question.recommendation;
    elements["question-details"].textContent = question.details;
    elements["answer-options"].replaceChildren();

    for (const option of question.options) {
      const label = document.createElement("label");
      label.className = "option-label";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `answer-${question.id}`;
      input.value = option.value;
      input.checked = state.answers[question.id] === option.value;
      input.addEventListener("change", () => namespace.state.setAnswer(question.id, option.value));
      const copy = document.createElement("span");
      copy.innerHTML = `<span class="option-title">${option.label}</span><span class="option-description">${option.description}</span>`;
      label.append(input, copy);
      elements["answer-options"].append(label);
    }

    elements["recommended-button"].onclick = () => namespace.state.setAnswer(question.id, question.recommendedValue);
    elements["previous-button"].disabled = index === 0;
    elements["next-button"].disabled = index === state.catalog.questions.length - 1;
    elements["previous-button"].onclick = () => namespace.state.setCurrentQuestion(namespace.workflow.getNextQuestionId(state.catalog, question.id, -1));
    elements["next-button"].onclick = () => namespace.state.setCurrentQuestion(namespace.workflow.getNextQuestionId(state.catalog, question.id, 1));
  }

  function renderSummary(state, activeRules) {
    const answeredQuestions = state.catalog.questions.filter(question => namespace.validation.isAnswered(question, state.answers));
    elements["answered-count"].textContent = String(answeredQuestions.length);
    elements["open-count"].textContent = String(state.catalog.questions.length - answeredQuestions.length);
    elements["rule-count"].textContent = String(activeRules.length);
    elements["decision-list"].replaceChildren();
    if (!answeredQuestions.length) {
      const item = document.createElement("li");
      item.className = "empty-state";
      item.textContent = "Noch keine Entscheidung getroffen.";
      elements["decision-list"].append(item);
    }
    for (const question of answeredQuestions) {
      const item = document.createElement("li");
      item.innerHTML = `<strong>${question.title}</strong><br>${optionLabel(question, state.answers[question.id])}`;
      elements["decision-list"].append(item);
    }

    elements["rule-list"].replaceChildren();
    if (!activeRules.length) {
      const item = document.createElement("li");
      item.className = "empty-state";
      item.textContent = "Keine aktiven Konflikte oder Empfehlungen.";
      elements["rule-list"].append(item);
    }
    for (const rule of activeRules) {
      const item = document.createElement("li");
      item.className = rule.severity === "critical" ? "rule-critical" : "rule-recommendation";
      item.innerHTML = `<strong>${rule.severity === "critical" ? "Konflikt" : "Empfehlung"}</strong><br>${rule.message}`;
      elements["rule-list"].append(item);
    }

    elements["report-preview"].textContent = namespace.report.createMarkdown(state.catalog, state.answers, activeRules);
  }

  function render(state, message = "") {
    if (!state.catalog) return;
    const activeRules = namespace.rules.evaluate(state.rules, state.answers);
    const progress = namespace.validation.calculateProgress(state.catalog, state.answers);
    const hasCritical = activeRules.some(rule => rule.severity === "critical");
    elements["project-progress"].value = progress;
    elements["project-progress"].textContent = `${progress} %`;
    elements["progress-text"].textContent = `${progress} %`;
    elements["data-mode"].textContent = state.dataMode === "files" ? "JSON-Kataloge geladen" : "Direktdatei-Fallback";
    elements["data-mode"].className = `badge ${state.dataMode === "files" ? "badge-success" : "badge-info"}`;
    elements["status-badge"].textContent = hasCritical ? "Konflikt" : progress === 100 ? "Vollständig" : "Unvollständig";
    elements["status-badge"].className = `badge ${hasCritical ? "badge-danger" : progress === 100 ? "badge-success" : "badge-warning"}`;
    elements["live-status"].textContent = message || "Projektübersicht aktualisiert.";
    renderPhases(state);
    renderQuestion(state);
    renderSummary(state, activeRules);
  }

  function initialize() {
    cacheElements();
    elements["theme-button"].addEventListener("click", () => {
      const html = document.documentElement;
      const nextTheme = html.dataset.theme === "dark" ? "light" : "dark";
      html.dataset.theme = nextTheme;
      elements["theme-button"].textContent = nextTheme === "dark" ? "Helles Theme" : "Dunkles Theme";
      elements["theme-button"].setAttribute("aria-pressed", String(nextTheme === "light"));
    });
    namespace.state.subscribe(render);
  }

  namespace.ui = { initialize, render };
})();
