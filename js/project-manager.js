(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const elements = {};
  let projects = [];
  let pendingAction = null;
  let lastFocusedElement = null;

  function cacheElements() {
    const ids = [
      "project-manager-button", "project-dialog", "project-close-button", "project-refresh-button",
      "project-new-form", "project-new-name", "project-search", "project-filter", "project-list",
      "project-total-count", "project-active-count", "project-archive-count", "project-trash-count",
      "project-manager-status", "project-action-panel", "project-action-title", "project-action-help",
      "project-action-label", "project-action-input", "project-action-checkbox-label", "project-action-checkbox",
      "project-action-confirm", "project-action-cancel", "current-project-name"
    ];
    for (const id of ids) elements[id] = document.getElementById(id);
  }

  function setStatus(message, kind = "info") {
    elements["project-manager-status"].textContent = message;
    elements["project-manager-status"].dataset.kind = kind;
  }

  function formatDate(value) {
    if (!value) return "noch nicht gespeichert";
    try {
      return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
    } catch (_error) {
      return String(value);
    }
  }

  function stateLabel(state) {
    return { active: "Aktiv", archive: "Archiv", trash: "Papierkorb" }[state] || state;
  }

  function createButton(label, action, projectId, className = "button button-secondary") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.dataset.projectAction = action;
    button.dataset.projectId = projectId;
    return button;
  }

  function renderCounts() {
    elements["project-total-count"].textContent = String(projects.length);
    elements["project-active-count"].textContent = String(projects.filter(item => item.lifecycle.state === "active").length);
    elements["project-archive-count"].textContent = String(projects.filter(item => item.lifecycle.state === "archive").length);
    elements["project-trash-count"].textContent = String(projects.filter(item => item.lifecycle.state === "trash").length);
  }

  function matchesFilter(project) {
    const state = elements["project-filter"].value;
    const search = elements["project-search"].value.trim().toLocaleLowerCase("de");
    if (state !== "all" && project.lifecycle.state !== state) return false;
    if (!search) return true;
    return `${project.name} ${project.id}`.toLocaleLowerCase("de").includes(search);
  }

  function renderProjects() {
    const currentProjectId = namespace.state.getState().projectId;
    const visible = projects.filter(matchesFilter);
    elements["project-list"].replaceChildren();
    if (!visible.length) {
      const empty = document.createElement("li");
      empty.className = "empty-state project-empty";
      empty.textContent = "Für diesen Filter wurden keine Projekte gefunden.";
      elements["project-list"].append(empty);
      return;
    }

    for (const project of visible) {
      const item = document.createElement("li");
      item.className = "project-card";
      item.dataset.lifecycle = project.lifecycle.state;
      if (project.id === currentProjectId) item.dataset.current = "true";

      const heading = document.createElement("div");
      heading.className = "project-card-heading";
      const titleWrap = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = project.name;
      const id = document.createElement("code");
      id.textContent = project.id;
      titleWrap.append(title, id);
      const badges = document.createElement("div");
      badges.className = "project-badges";
      const stateBadge = document.createElement("span");
      stateBadge.className = `badge ${project.lifecycle.state === "active" ? "badge-success" : project.lifecycle.state === "archive" ? "badge-info" : "badge-danger"}`;
      stateBadge.textContent = stateLabel(project.lifecycle.state);
      badges.append(stateBadge);
      if (project.id === currentProjectId) {
        const current = document.createElement("span");
        current.className = "badge badge-warning";
        current.textContent = "Aktuell geöffnet";
        badges.append(current);
      }
      heading.append(titleWrap, badges);

      const meta = document.createElement("dl");
      meta.className = "project-meta";
      const values = [
        ["Revision", `R${project.revision}`],
        ["Antworten", String(project.answerCount)],
        ["Gespeichert", formatDate(project.savedAt)],
        ["Schema", project.schemaVersion || "unbekannt"]
      ];
      for (const [label, value] of values) {
        const group = document.createElement("div");
        const term = document.createElement("dt");
        term.textContent = label;
        const description = document.createElement("dd");
        description.textContent = value;
        group.append(term, description);
        meta.append(group);
      }

      const actions = document.createElement("div");
      actions.className = "project-card-actions";
      const state = project.lifecycle.state;
      if (state === "active") {
        if (project.id !== currentProjectId) actions.append(createButton("Öffnen", "open", project.id, "button button-primary"));
        actions.append(createButton("Umbenennen", "rename", project.id));
        actions.append(createButton("Duplizieren", "duplicate", project.id));
        actions.append(createButton("Archivieren", "archive", project.id));
        actions.append(createButton("In Papierkorb", "trash", project.id, "button button-quiet"));
      } else if (state === "archive") {
        actions.append(createButton("Wiederherstellen", "restore", project.id, "button button-primary"));
        actions.append(createButton("Duplizieren", "duplicate", project.id));
        actions.append(createButton("In Papierkorb", "trash", project.id, "button button-quiet"));
      } else {
        actions.append(createButton("Wiederherstellen", "restore", project.id, "button button-primary"));
        actions.append(createButton("Endgültig löschen", "delete", project.id, "button button-danger"));
      }

      item.append(heading, meta, actions);
      elements["project-list"].append(item);
    }
  }

  async function refresh(message = "Projektübersicht aktualisiert.") {
    setStatus("Projekte werden gelesen …");
    try {
      projects = await namespace.persistence.listProjects();
      renderCounts();
      renderProjects();
      setStatus(message, "success");
      return projects;
    } catch (error) {
      console.error(error);
      setStatus(`Projektübersicht konnte nicht geladen werden: ${error.message}`, "error");
      return [];
    }
  }

  function closeAction() {
    pendingAction = null;
    elements["project-action-panel"].hidden = true;
    elements["project-action-input"].value = "";
    elements["project-action-checkbox"].checked = false;
  }

  function updateActionAvailability() {
    if (!pendingAction) return;
    const value = elements["project-action-input"].value;
    const validName = value.trim().length >= 3 && value.trim().length <= 80;
    if (pendingAction.type === "delete") {
      elements["project-action-confirm"].disabled = value !== pendingAction.project.name || !elements["project-action-checkbox"].checked;
    } else {
      elements["project-action-confirm"].disabled = !validName;
    }
  }

  function openAction(type, project) {
    pendingAction = { type, project };
    elements["project-action-panel"].hidden = false;
    elements["project-action-checkbox"].checked = false;
    const config = {
      rename: {
        title: "Projekt umbenennen",
        help: "Der neue Name wird als neue Projekt-Revision gespeichert. Frühere Snapshots bleiben unverändert.",
        label: "Neuer Projektname",
        value: project.name,
        button: "Umbenennen"
      },
      duplicate: {
        title: "Projekt duplizieren",
        help: "Die Kopie erhält eine neue Projekt-ID, eine eigene Revision 1 und unabhängige künftige Snapshots und Berichte.",
        label: "Name der Kopie",
        value: `${project.name} – Kopie`,
        button: "Kopie erstellen"
      },
      delete: {
        title: "Projekt endgültig löschen",
        help: `Diese Aktion entfernt das Projekt „${project.name}“ einschließlich aller Snapshots, Metadaten und Protokolle. Gib den Namen exakt ein und bestätige die endgültige Löschung.`,
        label: "Projektname zur Bestätigung",
        value: "",
        button: "Endgültig löschen"
      }
    }[type];
    elements["project-action-title"].textContent = config.title;
    elements["project-action-help"].textContent = config.help;
    elements["project-action-label"].textContent = config.label;
    elements["project-action-input"].value = config.value;
    elements["project-action-confirm"].textContent = config.button;
    elements["project-action-checkbox-label"].hidden = type !== "delete";
    updateActionAvailability();
    elements["project-action-input"].focus();
    elements["project-action-input"].select();
  }

  async function executePendingAction() {
    if (!pendingAction) return;
    const { type, project } = pendingAction;
    const value = elements["project-action-input"].value;
    elements["project-action-confirm"].disabled = true;
    try {
      if (type === "rename") {
        await namespace.persistence.renameProject(project.id, value);
        closeAction();
        await refresh("Projekt wurde umbenannt und als neue Revision gespeichert.");
      } else if (type === "duplicate") {
        const result = await namespace.persistence.duplicateProject(project.id, value);
        closeAction();
        await refresh("Projektkopie wurde mit eigener ID und Revision erstellt.");
        closeManager();
        return result;
      } else if (type === "delete") {
        await namespace.persistence.deleteProject(project.id, value);
        closeAction();
        await refresh("Projekt und alle zugehörigen lokalen Daten wurden endgültig gelöscht.");
      }
    } catch (error) {
      console.error(error);
      setStatus(error.message, "error");
      updateActionAvailability();
    }
  }

  async function handleProjectAction(action, projectId) {
    const project = projects.find(item => item.id === projectId);
    if (!project) return;
    try {
      if (action === "open") {
        await namespace.persistence.openProject(projectId);
        closeManager();
      } else if (["rename", "duplicate", "delete"].includes(action)) {
        openAction(action, project);
      } else if (action === "archive") {
        await namespace.persistence.archiveProject(projectId);
        await refresh("Projekt wurde archiviert.");
      } else if (action === "trash") {
        await namespace.persistence.trashProject(projectId);
        await refresh("Projekt wurde in den Papierkorb verschoben.");
      } else if (action === "restore") {
        await namespace.persistence.restoreProjectLifecycle(projectId);
        await refresh("Projekt wurde als aktives Projekt wiederhergestellt.");
      }
    } catch (error) {
      console.error(error);
      setStatus(error.message, "error");
    }
  }

  async function createProject(event) {
    event.preventDefault();
    const name = elements["project-new-name"].value;
    try {
      await namespace.persistence.createProject(name);
      elements["project-new-name"].value = "";
      closeManager();
    } catch (error) {
      console.error(error);
      setStatus(error.message, "error");
    }
  }

  async function openManager() {
    lastFocusedElement = document.activeElement;
    elements["project-dialog"].showModal();
    closeAction();
    await refresh();
    elements["project-new-name"].focus();
  }

  function closeManager() {
    closeAction();
    elements["project-dialog"].close();
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  function updateCurrentProjectName(state) {
    elements["current-project-name"].textContent = state.projectName || state.projectId;
    elements["current-project-name"].title = `Aktuelles Projekt: ${state.projectName || state.projectId}`;
  }

  function initialize() {
    cacheElements();
    elements["project-manager-button"].addEventListener("click", openManager);
    elements["project-close-button"].addEventListener("click", closeManager);
    elements["project-refresh-button"].addEventListener("click", () => refresh());
    elements["project-new-form"].addEventListener("submit", createProject);
    elements["project-search"].addEventListener("input", renderProjects);
    elements["project-filter"].addEventListener("change", renderProjects);
    elements["project-list"].addEventListener("click", event => {
      const button = event.target.closest("button[data-project-action]");
      if (button) handleProjectAction(button.dataset.projectAction, button.dataset.projectId);
    });
    elements["project-action-input"].addEventListener("input", updateActionAvailability);
    elements["project-action-checkbox"].addEventListener("change", updateActionAvailability);
    elements["project-action-confirm"].addEventListener("click", executePendingAction);
    elements["project-action-cancel"].addEventListener("click", closeAction);
    elements["project-dialog"].addEventListener("cancel", event => {
      event.preventDefault();
      if (pendingAction) closeAction();
      else closeManager();
    });
    elements["project-dialog"].addEventListener("click", event => {
      if (event.target === elements["project-dialog"]) closeManager();
    });
    namespace.state.subscribe(updateCurrentProjectName);
    updateCurrentProjectName(namespace.state.getState());
  }

  namespace.projectManager = { initialize, open: openManager, refresh, renderProjects };
})();
