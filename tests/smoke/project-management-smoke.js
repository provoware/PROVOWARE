(() => {
  "use strict";
  const namespace = window.Provoware;
  const results = [];
  const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
  let createdProjectId = null;
  let duplicatedProjectId = null;
  let duplicatedProjectName = null;

  function record(name, passed, detail = "") {
    results.push({ name, passed: Boolean(passed), detail });
    if (!passed) throw new Error(`${name}: ${detail || "fehlgeschlagen"}`);
  }

  function click(selector) {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Element fehlt: ${selector}`);
    element.click();
    return element;
  }

  async function waitFor(predicate, timeout = 4000) {
    const started = Date.now();
    while (!await predicate()) {
      if (Date.now() - started > timeout) throw new Error("Zeitüberschreitung beim Warten auf Projektzustand.");
      await wait(30);
    }
  }

  function summaryFrom(entry) {
    return {
      id: entry.payload.projectId,
      name: entry.payload.name,
      revision: entry.revision,
      savedAt: entry.savedAt,
      createdAt: entry.payload.createdAt,
      schemaVersion: entry.payload.schemaVersion,
      answerCount: Object.keys(entry.payload.answers || {}).length,
      lifecycle: structuredClone(entry.lifecycle)
    };
  }

  async function prepareEmbeddedProjectPersistence() {
    const state = namespace.state.getState();
    const now = new Date().toISOString();
    const records = new Map();
    let counter = 0;

    records.set(state.projectId, {
      payload: namespace.storage.createPayload(state),
      revision: Math.max(1, state.revision || 1),
      savedAt: now,
      lifecycle: namespace.projectRepository.normalizeLifecycle({}, state.projectId)
    });

    function get(projectId) {
      const record = records.get(projectId);
      if (!record) throw new Error("Synthetisches Projekt wurde nicht gefunden.");
      return record;
    }

    function activateFallback(excludedId) {
      const fallback = [...records.values()].find(item => item.payload.projectId !== excludedId && item.lifecycle.state === "active");
      if (!fallback) throw new Error("Synthetisches Ersatzprojekt fehlt.");
      namespace.state.restoreProject(fallback.payload, { revision: fallback.revision, source: "current", lifecycle: "active" });
    }

    namespace.persistence.listProjects = async () => [...records.values()].map(summaryFrom);
    namespace.persistence.createProject = async name => {
      counter += 1;
      const projectId = `smoke-created-${counter}`;
      const payload = namespace.projectRepository.createBlankPayload({
        projectId,
        name,
        catalogVersion: state.catalog.catalogVersion,
        currentQuestionId: state.catalog.questions[0].id,
        theme: state.theme
      });
      records.set(projectId, { payload, revision: 1, savedAt: new Date().toISOString(), lifecycle: namespace.projectRepository.normalizeLifecycle({}, projectId) });
      namespace.state.restoreProject(payload, { revision: 1, source: "project-created", lifecycle: "active" });
      return { projectId, payload, revision: 1 };
    };
    namespace.persistence.openProject = async projectId => {
      const record = get(projectId);
      if (record.lifecycle.state !== "active") throw new Error("Nur aktive Projekte dürfen geöffnet werden.");
      namespace.state.restoreProject(record.payload, { revision: record.revision, source: "current", lifecycle: "active" });
      return record;
    };
    namespace.persistence.renameProject = async (projectId, name) => {
      const record = get(projectId);
      record.payload = { ...record.payload, name, updatedAt: new Date().toISOString() };
      record.revision += 1;
      record.savedAt = new Date().toISOString();
      if (namespace.state.getState().projectId === projectId) namespace.state.restoreProject(record.payload, { revision: record.revision, source: "current", lifecycle: "active" });
      return { projectId, payload: record.payload, revision: record.revision };
    };
    namespace.persistence.duplicateProject = async (projectId, name) => {
      const source = get(projectId);
      counter += 1;
      const duplicateId = `smoke-duplicate-${counter}`;
      const nowDuplicate = new Date().toISOString();
      const payload = { ...structuredClone(source.payload), projectId: duplicateId, name, createdAt: nowDuplicate, updatedAt: nowDuplicate, lastValidatedAt: nowDuplicate };
      records.set(duplicateId, { payload, revision: 1, savedAt: nowDuplicate, lifecycle: namespace.projectRepository.normalizeLifecycle({}, duplicateId) });
      namespace.state.restoreProject(payload, { revision: 1, source: "project-duplicated", lifecycle: "active" });
      return { projectId: duplicateId, sourceProjectId: projectId, payload, revision: 1 };
    };
    namespace.persistence.archiveProject = async projectId => {
      const record = get(projectId);
      record.lifecycle = { ...record.lifecycle, state: "archive", archivedAt: new Date().toISOString() };
      if (namespace.state.getState().projectId === projectId) activateFallback(projectId);
      return record.lifecycle;
    };
    namespace.persistence.trashProject = async projectId => {
      const record = get(projectId);
      record.lifecycle = { ...record.lifecycle, state: "trash", trashedAt: new Date().toISOString() };
      if (namespace.state.getState().projectId === projectId) activateFallback(projectId);
      return record.lifecycle;
    };
    namespace.persistence.restoreProjectLifecycle = async projectId => {
      const record = get(projectId);
      record.lifecycle = { ...record.lifecycle, state: "active", restoredAt: new Date().toISOString() };
      return record.lifecycle;
    };
    namespace.persistence.deleteProject = async (projectId, exactName) => {
      const record = get(projectId);
      if (record.lifecycle.state !== "trash") throw new Error("Endgültiges Löschen ist nur im Papierkorb erlaubt.");
      if (exactName !== record.payload.name) throw new Error("Projektname stimmt nicht exakt überein.");
      records.delete(projectId);
      return { projectId, name: exactName };
    };
  }

  async function projectState(projectId) {
    return (await namespace.persistence.listProjects()).find(item => item.id === projectId) || null;
  }

  async function cleanup() {
    for (const projectId of [createdProjectId, duplicatedProjectId]) {
      if (!projectId) continue;
      try {
        const project = await projectState(projectId);
        if (!project) continue;
        if (project.lifecycle.state !== "trash") await namespace.persistence.trashProject(projectId);
        const trashed = await projectState(projectId);
        if (trashed) await namespace.persistence.deleteProject(projectId, trashed.name);
      } catch (_error) {
        // Testbereinigung darf das eigentliche Prüfergebnis nicht verdecken.
      }
    }
  }

  async function run() {
    try {
      while (!namespace.ready) await wait(10);
      await namespace.ready;
      await wait(300);
      if (window.__PROVOWARE_PROJECT_SMOKE_EMBEDDED__) await prepareEmbeddedProjectPersistence();

      const originalProjectId = namespace.state.getState().projectId;
      click("#project-manager-button");
      await waitFor(() => document.getElementById("project-dialog").open);
      await waitFor(() => document.querySelectorAll(".project-card").length >= 1);
      record("Projektübersicht geöffnet", document.getElementById("project-dialog").open);
      record("Aktuelles Projekt markiert", Boolean(document.querySelector('.project-card[data-current="true"]')));

      const newName = `Smoke Projekt ${window.__PROVOWARE_SMOKE_VIEWPORT__ || "Test"}`;
      document.getElementById("project-new-name").value = newName;
      document.getElementById("project-new-form").requestSubmit();
      await waitFor(() => !document.getElementById("project-dialog").open);
      createdProjectId = namespace.state.getState().projectId;
      record("Neues Projekt geöffnet", createdProjectId !== originalProjectId && namespace.state.getState().projectName === newName);
      record("Neues Projekt ohne fremde Antworten", Object.keys(namespace.state.getState().answers).length === 0);

      click("#project-manager-button");
      await waitFor(() => document.getElementById("project-dialog").open);
      await waitFor(() => Boolean(document.querySelector(`button[data-project-action="rename"][data-project-id="${createdProjectId}"]`)));
      click(`button[data-project-action="rename"][data-project-id="${createdProjectId}"]`);
      const renamed = `${newName} Umbenannt`;
      const actionInput = document.getElementById("project-action-input");
      actionInput.value = renamed;
      actionInput.dispatchEvent(new Event("input", { bubbles: true }));
      click("#project-action-confirm");
      await waitFor(() => namespace.state.getState().projectName === renamed);
      const renamedSummary = await projectState(createdProjectId);
      record("Umbenennen erzeugt neue Revision", renamedSummary?.revision === 2, String(renamedSummary?.revision));

      click(`button[data-project-action="duplicate"][data-project-id="${createdProjectId}"]`);
      duplicatedProjectName = `${renamed} Kopie`;
      actionInput.value = duplicatedProjectName;
      actionInput.dispatchEvent(new Event("input", { bubbles: true }));
      click("#project-action-confirm");
      await waitFor(() => !document.getElementById("project-dialog").open);
      duplicatedProjectId = namespace.state.getState().projectId;
      const duplicateSummary = await projectState(duplicatedProjectId);
      record("Duplikat besitzt eigene ID", duplicatedProjectId !== createdProjectId && duplicatedProjectId !== originalProjectId);
      record("Duplikat beginnt mit eigener Revision", duplicateSummary?.revision === 1, String(duplicateSummary?.revision));
      record("Bericht verwendet aktuelle Projekt-ID", namespace.report.createReportModel(namespace.state.getState(), []).project.id === duplicatedProjectId);

      click("#project-manager-button");
      await waitFor(() => document.getElementById("project-dialog").open);
      await waitFor(() => Boolean(document.querySelector(`button[data-project-action="archive"][data-project-id="${createdProjectId}"]`)));
      click(`button[data-project-action="archive"][data-project-id="${createdProjectId}"]`);
      await waitFor(async () => (await projectState(createdProjectId))?.lifecycle.state === "archive");
      record("Projekt archiviert", (await projectState(createdProjectId)).lifecycle.state === "archive");

      const filter = document.getElementById("project-filter");
      filter.value = "archive";
      filter.dispatchEvent(new Event("change", { bubbles: true }));
      await waitFor(() => Boolean(document.querySelector(`button[data-project-action="restore"][data-project-id="${createdProjectId}"]`)));
      click(`button[data-project-action="restore"][data-project-id="${createdProjectId}"]`);
      await waitFor(async () => (await projectState(createdProjectId))?.lifecycle.state === "active");
      record("Archivprojekt wiederhergestellt", (await projectState(createdProjectId)).lifecycle.state === "active");

      filter.value = "active";
      filter.dispatchEvent(new Event("change", { bubbles: true }));
      await waitFor(() => Boolean(document.querySelector(`button[data-project-action="trash"][data-project-id="${createdProjectId}"]`)));
      click(`button[data-project-action="trash"][data-project-id="${createdProjectId}"]`);
      await waitFor(async () => (await projectState(createdProjectId))?.lifecycle.state === "trash");
      record("Projekt in Papierkorb verschoben", (await projectState(createdProjectId)).lifecycle.state === "trash");

      filter.value = "trash";
      filter.dispatchEvent(new Event("change", { bubbles: true }));
      await waitFor(() => Boolean(document.querySelector(`button[data-project-action="delete"][data-project-id="${createdProjectId}"]`)));
      click(`button[data-project-action="delete"][data-project-id="${createdProjectId}"]`);
      actionInput.value = "Falscher Name";
      actionInput.dispatchEvent(new Event("input", { bubbles: true }));
      document.getElementById("project-action-checkbox").click();
      record("Falscher Löschname blockiert", document.getElementById("project-action-confirm").disabled);
      actionInput.value = renamed;
      actionInput.dispatchEvent(new Event("input", { bubbles: true }));
      record("Exakter Name und Bestätigung schalten Löschung frei", !document.getElementById("project-action-confirm").disabled);
      click("#project-action-confirm");
      await waitFor(async () => !(await projectState(createdProjectId)));
      record("Endgültiges Löschen entfernt Projekt", !(await projectState(createdProjectId)));
      createdProjectId = null;
      click("#project-close-button");

      await namespace.persistence.trashProject(duplicatedProjectId);
      record("Aktuelles Papierkorbprojekt löst sicheren Wechsel aus", namespace.state.getState().projectId !== duplicatedProjectId);
      await namespace.persistence.deleteProject(duplicatedProjectId, duplicatedProjectName);
      record("Duplikat vollständig bereinigt", !(await projectState(duplicatedProjectId)));
      duplicatedProjectId = null;

      record("Ursprüngliches Projekt bleibt erhalten", Boolean(await projectState(originalProjectId)));
      record("kein horizontales Überlaufen", document.documentElement.scrollWidth <= window.innerWidth + 2, `${document.documentElement.scrollWidth}/${window.innerWidth}`);
      document.body.dataset.projectSmokeStatus = "passed";
    } catch (error) {
      results.push({ name: "Gesamtablauf", passed: false, detail: error.message });
      document.body.dataset.projectSmokeStatus = "failed";
    } finally {
      await cleanup();
      const output = document.createElement("pre");
      output.id = "project-smoke-result";
      output.textContent = JSON.stringify({ status: document.body.dataset.projectSmokeStatus, results }, null, 2);
      document.body.append(output);
    }
  }

  run();
})();
