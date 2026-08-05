(() => {
  "use strict";
  const namespace = window.Provoware;
  const results = [];
  const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
  let importedProjectId = null;
  let importedProjectName = null;

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

  async function waitFor(predicate, timeout = 5000) {
    const started = Date.now();
    while (!await predicate()) {
      if (Date.now() - started > timeout) throw new Error("Zeitüberschreitung beim Warten auf Transferzustand.");
      await wait(30);
    }
  }

  function currentSummary() {
    const state = namespace.state.getState();
    return {
      id: state.projectId,
      name: state.projectName,
      revision: Math.max(1, state.revision || 1),
      savedAt: new Date().toISOString(),
      createdAt: state.createdAt,
      schemaVersion: state.schemaVersion,
      answerCount: Object.keys(state.answers || {}).length,
      lifecycle: { state: "active", projectId: state.projectId }
    };
  }

  function prepareEmbeddedPersistence() {
    namespace.persistence.listProjects = async () => [currentSummary()];
    namespace.persistence.inspectImportPackage = async packageData => namespace.projectTransfer.preparePreview(
      packageData,
      namespace.state.getState().catalog,
      { record: { payload: namespace.storage.createPayload(namespace.state.getState()) }, summary: currentSummary() }
    );
    namespace.persistence.exportCurrentProject = async () => namespace.projectTransfer.createPackage(namespace.state.getState(), "0.8.0");
    namespace.persistence.applyImport = async (preview, mode) => {
      const payload = structuredClone(preview.payload);
      if (mode === "new") {
        payload.projectId = `embedded-import-${Date.now().toString(36)}`;
        payload.name = `${payload.name.slice(0, 65)} – Import`;
      }
      namespace.state.restoreProject(payload, { revision: 1, source: "project-imported", lifecycle: "active" });
      return { payload, projectId: payload.projectId, revision: 1, mode };
    };
  }

  async function assignPackage(packageData, filename) {
    const file = new File([namespace.projectTransfer.serializePackage(packageData)], filename, { type: "application/json" });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    const input = document.getElementById("transfer-file");
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await waitFor(() => !document.getElementById("transfer-preview").hidden || document.getElementById("transfer-status").dataset.kind === "error");
  }

  async function testEscapeHierarchyAndFocus() {
    const opener = document.getElementById("project-manager-button");
    opener.focus();
    opener.click();
    await waitFor(() => document.getElementById("project-dialog").open);
    await waitFor(() => document.querySelector(".project-card button[data-project-action='rename']"));
    record("Dialogfokus liegt im Projektmanager", document.getElementById("project-dialog").contains(document.activeElement));

    const list = document.getElementById("project-list");
    const buttons = [...list.querySelectorAll("button:not([disabled])")];
    buttons[0].focus();
    const before = document.activeElement;
    before.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    record("Pfeiltastennavigation wechselt Projektaktion", document.activeElement !== before && list.contains(document.activeElement));

    click(".project-card button[data-project-action='rename']");
    await waitFor(() => !document.getElementById("project-action-panel").hidden);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => document.getElementById("project-action-panel").hidden);
    record("Erstes Escape schließt Unteraktion", document.getElementById("project-dialog").open);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => !document.getElementById("project-dialog").open);
    record("Zweites Escape schließt Dialog", !document.getElementById("project-dialog").open);
    await wait();
    record("Fokus kehrt zum tatsächlichen Auslöser zurück", document.activeElement === opener);
  }

  async function testFocusTrap() {
    click("#project-transfer-button");
    await waitFor(() => document.getElementById("transfer-dialog").open);
    const dialog = document.getElementById("transfer-dialog");
    const focusable = namespace.accessibility.focusableElements(dialog);
    focusable[0].focus();
    focusable[0].dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true }));
    record("Umschalt-Tab bleibt im obersten Dialog", dialog.contains(document.activeElement) && document.activeElement === focusable.at(-1));
  }

  async function testImportPreviewAndApply() {
    const state = namespace.state.getState();
    const originalPackage = namespace.projectTransfer.createPackage(state, "0.8.0");
    const tampered = structuredClone(originalPackage);
    tampered.project.name = "Manipulierter Import";
    await assignPackage(tampered, "tampered.json");
    record("Manipulierte Prüfsumme wird sichtbar blockiert", document.getElementById("transfer-checksum-status").textContent === "ungültig" || document.getElementById("transfer-status").dataset.kind === "error");

    click("#transfer-reset-button");
    const valid = structuredClone(originalPackage);
    valid.project.name = `${state.projectName.slice(0, 60)} Importtest`;
    const firstQuestion = state.catalog.questions[0];
    const alternate = firstQuestion.options.find(option => option.value !== valid.project.answers[firstQuestion.id]) || firstQuestion.options[0];
    valid.project.answers[firstQuestion.id] = alternate.value;
    valid.source.projectName = valid.project.name;
    valid.checksum = namespace.storage.checksum(namespace.projectTransfer.coreFromPackage(valid));
    await assignPackage(valid, "valid-conflict.json");

    record("Gültige Prüfsumme bestätigt", document.getElementById("transfer-checksum-status").textContent === "gültig");
    record("Projekt-ID-Kollision erkannt", document.getElementById("transfer-existing-status").textContent.includes("R"));
    record("Änderungen und Konflikte angezeigt", Number(document.getElementById("transfer-conflict-count").textContent) >= 1);
    const mode = document.getElementById("transfer-mode");
    record("Sicherer Standard ist neue Projekt-ID", mode.value === "new");
    record("Ersetzen ist nur als bewusste Alternative vorhanden", [...mode.options].some(option => option.value === "replace"));

    mode.value = "replace";
    mode.dispatchEvent(new Event("change", { bubbles: true }));
    const apply = document.getElementById("transfer-apply-button");
    record("Ersetzen zunächst gesperrt", apply.disabled);
    document.getElementById("transfer-replace-name").value = "Falsch";
    document.getElementById("transfer-replace-name").dispatchEvent(new Event("input", { bubbles: true }));
    document.getElementById("transfer-replace-checkbox").click();
    record("Falscher Bestätigungsname blockiert", apply.disabled);
    document.getElementById("transfer-replace-name").value = state.projectName;
    document.getElementById("transfer-replace-name").dispatchEvent(new Event("input", { bubbles: true }));
    record("Exakter Name plus Bestätigung schaltet Ersetzen frei", !apply.disabled);

    mode.value = "new";
    mode.dispatchEvent(new Event("change", { bubbles: true }));
    record("Neue ID benötigt keine Ersetzungsbestätigung", !apply.disabled);
    click("#transfer-apply-button");
    await waitFor(() => !document.getElementById("transfer-dialog").open);
    importedProjectId = namespace.state.getState().projectId;
    importedProjectName = namespace.state.getState().projectName;
    record("Geprüfter Import wurde geöffnet", importedProjectId !== state.projectId && importedProjectName.includes("Import"));
  }

  async function cleanup() {
    if (!importedProjectId || window.__PROVOWARE_TRANSFER_SMOKE_EMBEDDED__) return;
    try {
      await namespace.persistence.trashProject(importedProjectId);
      await namespace.persistence.deleteProject(importedProjectId, importedProjectName);
    } catch (_error) {
      // Testbereinigung darf das Prüfergebnis nicht verdecken.
    }
  }

  async function run() {
    try {
      while (!namespace.ready) await wait(10);
      await namespace.ready;
      await wait(350);
      if (window.__PROVOWARE_TRANSFER_SMOKE_EMBEDDED__) prepareEmbeddedPersistence();

      const audit = namespace.accessibility.audit(document);
      record("Barrierefreiheits-Grundprüfung ohne Fehler", audit.errors.length === 0, audit.errors.join(" | "));
      await testEscapeHierarchyAndFocus();
      await testFocusTrap();
      await testImportPreviewAndApply();
      record("kein horizontales Überlaufen", document.documentElement.scrollWidth <= window.innerWidth + 2, `${document.documentElement.scrollWidth}/${window.innerWidth}`);
      document.body.dataset.transferSmokeStatus = "passed";
    } catch (error) {
      results.push({ name: "Gesamtablauf", passed: false, detail: error.message });
      document.body.dataset.transferSmokeStatus = "failed";
    } finally {
      await cleanup();
      const output = document.createElement("pre");
      output.id = "transfer-smoke-result";
      output.textContent = JSON.stringify({ status: document.body.dataset.transferSmokeStatus, results }, null, 2);
      document.body.append(output);
    }
  }

  run();
})();
