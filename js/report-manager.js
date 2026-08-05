(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const elements = {};
  let currentModel = null;
  let lastFocusedElement = null;

  const formats = Object.freeze({
    markdown: { extension: "md", mime: "text/markdown;charset=utf-8", label: "Markdown", render: model => namespace.report.renderMarkdown(model) },
    html: { extension: "html", mime: "text/html;charset=utf-8", label: "Offline-HTML", render: model => namespace.report.renderHtml(model) },
    text: { extension: "txt", mime: "text/plain;charset=utf-8", label: "Text", render: model => namespace.report.renderText(model) },
    json: { extension: "json", mime: "application/json;charset=utf-8", label: "JSON", render: model => namespace.report.renderJson(model) }
  });

  function cacheElements() {
    const ids = [
      "report-manager-button", "report-dialog", "report-close-button", "report-refresh-button",
      "report-format", "report-preview-content", "report-status", "report-project-status",
      "report-requirement-count", "report-risk-count", "report-test-count", "report-open-count",
      "report-export-buttons"
    ];
    for (const id of ids) elements[id] = document.getElementById(id);
  }

  function safeFilename(value) {
    const normalized = String(value || "entwicklungsplan")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return normalized || "entwicklungsplan";
  }

  function setStatus(message, kind = "info") {
    elements["report-status"].textContent = message;
    elements["report-status"].dataset.kind = kind;
  }

  function createCurrentModel() {
    const state = namespace.state.getState();
    const activeRules = namespace.rules.evaluate(state.rules, state.answers);
    const model = namespace.report.createReportModel(state, activeRules);
    const errors = namespace.report.validateReportModel(model);
    if (errors.length) throw new Error(errors.join(" "));
    return model;
  }

  function renderStatistics(model) {
    elements["report-project-status"].textContent = model.project.status;
    elements["report-project-status"].className = `badge ${model.project.status === "complete" ? "badge-success" : model.project.status === "blocked" ? "badge-danger" : "badge-warning"}`;
    elements["report-requirement-count"].textContent = String(model.summary.requirements);
    elements["report-risk-count"].textContent = String(model.summary.risks);
    elements["report-test-count"].textContent = String(model.summary.tests);
    elements["report-open-count"].textContent = String(model.summary.openQuestions);
  }

  function renderPreview() {
    if (!currentModel) return;
    const format = formats[elements["report-format"].value] || formats.markdown;
    elements["report-preview-content"].textContent = format.render(currentModel);
  }

  function refresh(message = "Berichtsmodell aktualisiert.") {
    setStatus("Berichtsmodell wird geprüft …");
    try {
      currentModel = createCurrentModel();
      renderStatistics(currentModel);
      renderPreview();
      setStatus(message, "success");
      return currentModel;
    } catch (error) {
      console.error(error);
      currentModel = null;
      elements["report-preview-content"].textContent = "Bericht konnte nicht erzeugt werden.";
      setStatus(`Bericht konnte nicht erzeugt werden: ${error.message}`, "error");
      return null;
    }
  }

  function download(formatName) {
    const format = formats[formatName];
    if (!format) return;
    const model = refresh("Bericht vor dem Export erneut geprüft.");
    if (!model) return;
    try {
      const content = format.render(model);
      const blob = new Blob([content], { type: format.mime });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const date = model.generatedAt.slice(0, 10);
      anchor.href = url;
      anchor.download = `${safeFilename(model.project.name)}-${date}.${format.extension}`;
      anchor.hidden = true;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setStatus(`${format.label}-Bericht wurde nach erfolgreicher Vorprüfung bereitgestellt.`, "success");
    } catch (error) {
      console.error(error);
      setStatus(`Export fehlgeschlagen: ${error.message}`, "error");
    }
  }

  function openManager() {
    lastFocusedElement = document.activeElement;
    elements["report-dialog"].showModal();
    refresh();
    elements["report-refresh-button"].focus();
  }

  function closeManager() {
    elements["report-dialog"].close();
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  function initialize() {
    cacheElements();
    elements["report-manager-button"].addEventListener("click", openManager);
    elements["report-close-button"].addEventListener("click", closeManager);
    elements["report-refresh-button"].addEventListener("click", () => refresh());
    elements["report-format"].addEventListener("change", renderPreview);
    elements["report-export-buttons"].addEventListener("click", event => {
      const button = event.target.closest("button[data-report-format]");
      if (button) download(button.dataset.reportFormat);
    });
    elements["report-dialog"].addEventListener("cancel", event => {
      event.preventDefault();
      closeManager();
    });
    elements["report-dialog"].addEventListener("click", event => {
      if (event.target === elements["report-dialog"]) closeManager();
    });
  }

  namespace.reportManager = { initialize, open: openManager, refresh, download, formats };
})();
