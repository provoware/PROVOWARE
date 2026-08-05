(() => {
  "use strict";
  const namespace = window.Provoware;
  const results = [];
  const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
  let createdProjectId = null;
  let createdProjectName = null;
  let originalProjectId = null;
  const createdProfileIds = new Set();

  function record(name, passed, detail = "") {
    results.push({ name, passed: Boolean(passed), detail });
    if (!passed) throw new Error(`${name}: ${detail || "fehlgeschlagen"}`);
  }

  async function waitFor(predicate, timeout = 8000) {
    const started = Date.now();
    while (!await predicate()) {
      if (Date.now() - started > timeout) throw new Error("Zeitüberschreitung beim Vorlagen-Smoke.");
      await wait(30);
    }
  }

  function click(selector) {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Element fehlt: ${selector}`);
    element.click();
    return element;
  }

  async function cleanup() {
    try {
      for (const profileId of createdProfileIds) await namespace.templateProfilesCore.deleteCustomProfile(profileId);
    } catch (_error) {}
    try {
      const dialog = document.getElementById("template-dialog");
      if (dialog?.open) dialog.close();
      if (createdProjectId && namespace.persistence?.trashProject && namespace.persistence?.deleteProject) {
        await namespace.persistence.trashProject(createdProjectId);
        await namespace.persistence.deleteProject(createdProjectId, createdProjectName);
      }
    } catch (_error) {}
  }

  async function run() {
    try {
      while (!namespace?.templateProfilesUi || !document.getElementById("template-manager-button")) await wait(20);
      if (namespace.ready) await namespace.ready;
      originalProjectId = namespace.state.getState().projectId;
      click("#template-manager-button");
      await waitFor(() => document.getElementById("template-dialog").open);
      await waitFor(() => document.querySelectorAll("#template-profile-list option").length >= 18);

      const builtinCount = document.querySelectorAll('#template-profile-list option[data-kind="builtin"]').length;
      record("18 integrierte Profile geladen", builtinCount === 18, String(builtinCount));
      record("Profilvorschau vollständig", document.getElementById("template-validity").textContent === "Vollständig geprüft");
      record("Alle Antworten sichtbar", document.querySelectorAll("#template-diff-body tr").length === namespace.state.getState().catalog.questions.length);
      record("Architektur sichtbar", document.querySelectorAll("#template-architecture li").length > 0);
      record("Ordnerstruktur sichtbar", document.getElementById("template-folder-tree").textContent.trim().length > 0);
      record("Berichtsvorgaben sichtbar", document.getElementById("template-report-preset").textContent.includes("Formate:"));
      record("Qualitätsgates sichtbar", document.querySelectorAll("#template-quality-gates li").length > 0);
      record("Projektanlage zunächst gesperrt", document.getElementById("template-create-button").disabled);

      document.getElementById("template-confirm").click();
      record("Prüfbestätigung schaltet konfliktfreies Profil frei", !document.getElementById("template-create-button").disabled);
      createdProjectName = `Vorlagen Smoke ${window.__PROVOWARE_SMOKE_VIEWPORT__ || "Test"}`;
      const nameInput = document.getElementById("template-project-name");
      nameInput.value = createdProjectName;
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      click("#template-create-button");
      await waitFor(() => !document.getElementById("template-dialog").open);
      createdProjectId = namespace.state.getState().projectId;
      record("Unabhängige Projekt-ID erzeugt", createdProjectId !== originalProjectId, createdProjectId);
      record("Projekt besitzt vollständiges Antwortset", Object.keys(namespace.state.getState().answers).length === namespace.state.getState().catalog.questions.length);

      click("#template-manager-button");
      await waitFor(() => document.getElementById("template-dialog").open);
      const beforeCustom = document.querySelectorAll('#template-profile-list option[data-kind="custom"]').length;
      document.getElementById("template-new-profile-name").value = "Eigenes Smoke Profil";
      document.getElementById("template-new-profile-description").value = "Vollständiges eigenes Profil für die automatisierte Browserabnahme.";
      click("#template-save-current-button");
      await waitFor(() => document.querySelectorAll('#template-profile-list option[data-kind="custom"]').length === beforeCustom + 1);
      let selected = document.getElementById("template-profile-list").value;
      record("Aktuelles Projekt als Profil gespeichert", selected.startsWith("custom:"), selected);
      createdProfileIds.add(selected.replace("custom:", ""));

      const renameInput = document.getElementById("template-rename-input");
      renameInput.value = "Eigenes Smoke Profil Neu";
      renameInput.dispatchEvent(new Event("input", { bubbles: true }));
      click("#template-rename-button");
      await waitFor(() => document.getElementById("template-preview-title").textContent.includes("Eigenes Smoke Profil Neu"));
      record("Eigenes Profil umbenannt", true);

      click("#template-duplicate-button");
      await waitFor(() => document.querySelectorAll('#template-profile-list option[data-kind="custom"]').length === beforeCustom + 2);
      selected = document.getElementById("template-profile-list").value;
      record("Eigenes Profil dupliziert", document.getElementById("template-preview-title").textContent.includes("Kopie"));
      createdProfileIds.add(selected.replace("custom:", ""));

      document.getElementById("template-delete-confirm").click();
      record("Löschung benötigt Bestätigung", !document.getElementById("template-delete-button").disabled);
      click("#template-delete-button");
      await waitFor(() => document.querySelectorAll('#template-profile-list option[data-kind="custom"]').length === beforeCustom + 1);
      createdProfileIds.delete(selected.replace("custom:", ""));
      record("Duplikat sicher gelöscht", true);

      const criticalProfile = structuredClone(namespace.templateBuiltinTemplates[0].profiles[0]);
      criticalProfile.id = "critical-smoke";
      criticalProfile.title = "Kritischer Smoke";
      criticalProfile.answers["data.storage"] = "cloud";
      criticalProfile.expectedRuleIds = namespace.rules.evaluate(namespace.state.getState().rules, criticalProfile.answers).map(rule => rule.id).sort();
      const criticalPreview = namespace.templateProfilesCore.buildPreview({ key: "critical", kind: "builtin", template: namespace.templateBuiltinTemplates[0], profile: criticalProfile }, namespace.state.getState());
      record("Kritische Regeln werden erkannt", criticalPreview.valid && criticalPreview.criticalRules.length === 1, String(criticalPreview.criticalRules.length));
      record("Kein horizontales Überlaufen", document.documentElement.scrollWidth <= window.innerWidth + 2, `${document.documentElement.scrollWidth}/${window.innerWidth}`);
      document.body.dataset.templateProfileSmokeStatus = "passed";
    } catch (error) {
      results.push({ name: "Gesamtablauf", passed: false, detail: error.message });
      document.body.dataset.templateProfileSmokeStatus = "failed";
    } finally {
      await cleanup();
      const output = document.createElement("pre");
      output.id = "template-profile-smoke-result";
      output.textContent = JSON.stringify({ status: document.body.dataset.templateProfileSmokeStatus, results }, null, 2);
      document.body.append(output);
    }
  }

  run();
})();
