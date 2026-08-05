(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const elements = {};
  let profileEntries = [];
  let selectedEntry = null;
  let selectedPreview = null;
  let lastPreviewFingerprint = null;

  function core() {
    if (!namespace.templateProfilesCore) throw new Error("Der Vorlagenkern ist nicht geladen.");
    return namespace.templateProfilesCore;
  }

  function injectStyles() {
    if (document.getElementById("template-manager-styles")) return;
    const style = document.createElement("style");
    style.id = "template-manager-styles";
    style.textContent = `
      .template-dialog .dialog-shell{max-width:min(1220px,96vw)}
      .template-layout{display:grid;grid-template-columns:minmax(250px,32%) minmax(0,1fr);gap:1rem;min-height:32rem}
      .template-sidebar,.template-preview-panel,.template-custom-panel{border:1px solid var(--border-color);border-radius:var(--radius-medium);padding:1rem;background:var(--surface-secondary)}
      .template-sidebar{display:flex;flex-direction:column;gap:.75rem}.template-sidebar select{min-height:22rem;width:100%}
      .template-preview-scroll{max-height:58vh;overflow:auto;padding-right:.25rem}
      .template-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.65rem;margin:.75rem 0}
      .template-stat{border:1px solid var(--border-color);border-radius:var(--radius-small);padding:.65rem;background:var(--surface-primary)}
      .template-stat strong{display:block;font-size:1.25rem}.template-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}
      .template-card{border:1px solid var(--border-color);border-radius:var(--radius-small);padding:.8rem;background:var(--surface-primary)}
      .template-card h4{margin-top:0}.template-list{margin:.4rem 0;padding-left:1.25rem}.template-diff{width:100%;border-collapse:collapse;font-size:.94rem}
      .template-diff th,.template-diff td{border-bottom:1px solid var(--border-color);text-align:left;vertical-align:top;padding:.55rem}
      .template-diff tr[data-status=changed],.template-diff tr[data-status=new]{background:color-mix(in srgb,var(--warning-color) 12%,transparent)}
      .template-errors li[data-kind=error]{color:var(--danger-color)}.template-create-panel,.template-profile-actions{display:grid;gap:.65rem;margin-top:1rem;border-top:1px solid var(--border-color);padding-top:1rem}
      .template-inline-actions{display:flex;flex-wrap:wrap;gap:.55rem}.template-folder{white-space:pre-wrap;overflow-wrap:anywhere;max-height:16rem;overflow:auto}
      .template-custom-panel{margin-top:1rem}.template-custom-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
      .template-status[data-kind=error]{color:var(--danger-color)}.template-status[data-kind=success]{color:var(--success-color)}
      @media(max-width:850px){.template-layout{grid-template-columns:1fr}.template-sidebar select{min-height:12rem}.template-grid,.template-custom-grid{grid-template-columns:1fr}.template-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.append(style);
  }

  function injectUi() {
    if (document.getElementById("template-dialog")) return;
    injectStyles();
    const button = document.createElement("button");
    button.id = "template-manager-button";
    button.type = "button";
    button.className = "button button-secondary button-wide";
    button.textContent = "Vorlagen und Profile";
    button.title = "Projektvorlagen prüfen, eigene Profile verwalten und neue Projekte sicher anlegen";
    const anchor = document.getElementById("project-transfer-button") || document.getElementById("project-manager-button");
    anchor?.insertAdjacentElement("afterend", button);

    const dialog = document.createElement("dialog");
    dialog.id = "template-dialog";
    dialog.className = "storage-dialog template-dialog";
    dialog.setAttribute("aria-labelledby", "template-dialog-title");
    dialog.innerHTML = `
      <div class="dialog-shell">
        <header class="dialog-header">
          <div><p class="eyebrow">Geprüfte Projektstarts</p><h2 id="template-dialog-title">Vorlagen und Profile</h2><p class="subtitle">Kein Projekt wird angelegt, bevor Antworten, Unterschiede, Regeln und technische Vorgaben vollständig geprüft wurden.</p></div>
          <button id="template-close-button" type="button" class="button button-secondary" aria-label="Vorlagenverwaltung schließen">Schließen</button>
        </header>
        <div class="template-layout">
          <section class="template-sidebar" aria-labelledby="template-selection-title">
            <h3 id="template-selection-title">Vorlage oder Profil wählen</h3>
            <label for="template-search">Suchen</label><input id="template-search" type="search" placeholder="Projektart, Profil oder Kategorie">
            <label for="template-profile-list">Verfügbare Profile</label><select id="template-profile-list" size="12" aria-describedby="template-selection-help"></select>
            <p id="template-selection-help" class="storage-help">Integrierte Profile sind schreibgeschützt. Eigene Profile bleiben lokal und können unabhängig verwaltet werden.</p>
            <button id="template-refresh-button" type="button" class="button button-secondary">Profile neu laden</button>
          </section>
          <section class="template-preview-panel" aria-labelledby="template-preview-title">
            <div id="template-preview-empty" class="empty-state">Wähle links ein Profil aus.</div>
            <div id="template-preview" hidden>
              <div class="snapshot-preview-heading"><div><p id="template-category" class="eyebrow"></p><h3 id="template-preview-title">Profilvorschau</h3><p id="template-description" class="subtitle"></p></div><span id="template-validity" class="badge badge-neutral">Nicht geprüft</span></div>
              <div class="template-stats"><div class="template-stat"><span>Antworten</span><strong id="template-answer-count">0</strong></div><div class="template-stat"><span>Abweichungen</span><strong id="template-change-count">0</strong></div><div class="template-stat"><span>Regeln</span><strong id="template-rule-count">0</strong></div><div class="template-stat"><span>Kritisch</span><strong id="template-critical-count">0</strong></div></div>
              <div class="template-preview-scroll">
                <section class="template-card"><h4>Prüfergebnis</h4><ul id="template-error-list" class="template-list template-errors"></ul></section>
                <section class="template-card"><h4>Antworten und Unterschiede</h4><div class="table-scroll"><table class="template-diff"><thead><tr><th>Frage</th><th>Aktuell</th><th>Profil</th><th>Wirkung</th></tr></thead><tbody id="template-diff-body"></tbody></table></div></section>
                <section class="template-card"><h4>Ausgelöste Regeln</h4><ul id="template-rule-list" class="template-list"></ul></section>
                <div class="template-grid">
                  <section class="template-card"><h4>Architektur</h4><ul id="template-architecture" class="template-list"></ul></section>
                  <section class="template-card"><h4>Ordnerstruktur</h4><pre id="template-folder-tree" class="template-folder"></pre></section>
                  <section class="template-card"><h4>Berichtsvorgaben</h4><div id="template-report-preset"></div></section>
                  <section class="template-card"><h4>Qualitätsgates</h4><ul id="template-quality-gates" class="template-list"></ul></section>
                  <section class="template-card"><h4>Meilensteine</h4><ol id="template-milestones" class="template-list"></ol></section>
                  <section class="template-card"><h4>Sonderfälle</h4><ul id="template-special-cases" class="template-list"></ul></section>
                </div>
              </div>
              <section class="template-create-panel" aria-labelledby="template-create-title">
                <h4 id="template-create-title">Neues unabhängiges Projekt anlegen</h4>
                <label for="template-project-name">Projektname</label><input id="template-project-name" type="text" minlength="3" maxlength="80" required>
                <label><input id="template-confirm" type="checkbox"> <span>Ich habe Antworten, Abweichungen, Regeln und technische Vorgaben geprüft.</span></label>
                <label id="template-critical-label" hidden><input id="template-critical-confirm" type="checkbox"> <span>Ich bestätige ausdrücklich die angezeigten kritischen Regelkonflikte.</span></label>
                <button id="template-create-button" type="button" class="button button-primary" disabled>Geprüftes Projekt anlegen</button>
              </section>
              <section id="template-profile-actions" class="template-profile-actions" hidden aria-labelledby="template-profile-actions-title">
                <h4 id="template-profile-actions-title">Ausgewähltes eigenes Profil</h4>
                <label for="template-rename-input">Profilname</label><input id="template-rename-input" type="text" minlength="3" maxlength="80">
                <div class="template-inline-actions"><button id="template-rename-button" type="button" class="button button-secondary">Umbenennen</button><button id="template-duplicate-button" type="button" class="button button-secondary">Duplizieren</button><button id="template-export-profile-button" type="button" class="button button-secondary">Profil exportieren</button></div>
                <label><input id="template-delete-confirm" type="checkbox"> <span>Dieses eigene Profil endgültig löschen.</span></label><button id="template-delete-button" type="button" class="button button-danger" disabled>Eigenes Profil löschen</button>
              </section>
            </div>
          </section>
        </div>
        <section class="template-custom-panel" aria-labelledby="template-custom-title">
          <h3 id="template-custom-title">Eigenes Profil verwalten</h3>
          <div class="template-custom-grid"><div><label for="template-new-profile-name">Name des neuen Profils</label><input id="template-new-profile-name" type="text" minlength="3" maxlength="80" placeholder="Zum Beispiel: Mein sicherer Standard"></div><div><label for="template-new-profile-description">Beschreibung</label><input id="template-new-profile-description" type="text" maxlength="400" placeholder="Wofür dieses Profil gedacht ist"></div></div>
          <div class="template-inline-actions"><button id="template-save-current-button" type="button" class="button button-primary">Aktuelles Projekt als Profil speichern</button><label class="button button-secondary" for="template-import-file">Profil importieren</label><input id="template-import-file" type="file" accept="application/json,.json" hidden></div>
          <p class="storage-help">Das aktuelle Projekt kann nur gespeichert werden, wenn alle Fragen gültig beantwortet sind. Architektur- und Berichtsvorgaben werden vom gerade ausgewählten Profil übernommen.</p>
        </section>
        <p id="template-status" class="dialog-status template-status" role="status" aria-live="polite">Vorlagenverwaltung bereit.</p>
      </div>`;
    document.body.append(dialog);
  }

  function cacheElements() {
    for (const id of ["template-manager-button","template-dialog","template-close-button","template-search","template-profile-list","template-refresh-button","template-preview-empty","template-preview","template-category","template-preview-title","template-description","template-validity","template-answer-count","template-change-count","template-rule-count","template-critical-count","template-error-list","template-diff-body","template-rule-list","template-architecture","template-folder-tree","template-report-preset","template-quality-gates","template-milestones","template-special-cases","template-project-name","template-confirm","template-critical-label","template-critical-confirm","template-create-button","template-profile-actions","template-rename-input","template-rename-button","template-duplicate-button","template-export-profile-button","template-delete-confirm","template-delete-button","template-new-profile-name","template-new-profile-description","template-save-current-button","template-import-file","template-status"]) elements[id] = document.getElementById(id);
  }

  function setStatus(message, kind = "info") { elements["template-status"].textContent = message; elements["template-status"].dataset.kind = kind; }

  function renderItems(container, items) {
    container.replaceChildren();
    for (const text of items || []) { const item = document.createElement("li"); item.textContent = text; container.append(item); }
    if (!container.children.length) { const item = document.createElement("li"); item.textContent = "Keine Angaben."; container.append(item); }
  }

  async function ensureReady() {
    if (namespace.ready) await namespace.ready;
    if (!namespace.state?.getState()?.catalog) throw new Error("Die Fragenkataloge sind noch nicht bereit.");
    if (!namespace.storage?.open) throw new Error("Der lokale Speicher ist nicht verfügbar.");
  }

  async function rebuildEntries(preferredKey = selectedEntry?.key) {
    await ensureReady();
    const appState = namespace.state.getState();
    const catalog = core().usableBuiltinCatalog(appState);
    const catalogValidation = core().validateCatalog(catalog, appState);
    if (!catalogValidation.valid) throw new Error(`Vorlagenkatalog ungültig: ${catalogValidation.errors.join(" ")}`);
    const customRecords = await core().listCustomProfiles();
    const customEntries = customRecords.map(core().customRecordToEntry).filter(entry => core().validateProfile(entry.profile, appState).valid);
    profileEntries = [...customEntries, ...core().flattenBuiltins(catalog)];
    renderEntryOptions(preferredKey);
    setStatus(`${catalogValidation.templateCount} Vorlagen, ${catalogValidation.profileCount} integrierte Profile und ${customEntries.length} eigene Profile geprüft.`, "success");
  }

  function renderEntryOptions(preferredKey = null) {
    const search = String(elements["template-search"].value || "").trim().toLocaleLowerCase("de");
    const visible = profileEntries.filter(entry => !search || `${entry.label} ${entry.template.category} ${entry.profile.description}`.toLocaleLowerCase("de").includes(search));
    elements["template-profile-list"].replaceChildren();
    for (const entry of visible) { const option = new Option(entry.label, entry.key); option.dataset.kind = entry.kind; elements["template-profile-list"].append(option); }
    const target = visible.find(entry => entry.key === preferredKey) || visible[0] || null;
    if (target) { elements["template-profile-list"].value = target.key; selectEntry(target.key); }
    else { selectedEntry = null; selectedPreview = null; elements["template-preview"].hidden = true; elements["template-preview-empty"].hidden = false; elements["template-preview-empty"].textContent = "Für diese Suche wurden keine Profile gefunden."; }
  }

  function updateCreateAvailability() {
    const nameValid = (() => { try { namespace.projectRepository.validateName(elements["template-project-name"].value); return true; } catch (_error) { return false; } })();
    const criticalOk = !selectedPreview?.criticalRules.length || elements["template-critical-confirm"].checked;
    elements["template-create-button"].disabled = !(selectedPreview?.valid && nameValid && elements["template-confirm"].checked && criticalOk);
  }

  function renderPreview() {
    const preview = selectedPreview;
    elements["template-preview-empty"].hidden = true; elements["template-preview"].hidden = false;
    elements["template-category"].textContent = `${selectedEntry.template.category} · ${selectedEntry.kind === "custom" ? "eigenes Profil" : "integrierte Vorlage"}`;
    elements["template-preview-title"].textContent = `${selectedEntry.template.title} — ${selectedEntry.profile.title}`;
    elements["template-description"].textContent = selectedEntry.profile.description;
    elements["template-validity"].textContent = preview.valid ? "Vollständig geprüft" : "Blockiert";
    elements["template-validity"].className = `badge ${preview.valid ? "badge-success" : "badge-danger"}`;
    elements["template-answer-count"].textContent = String(preview.differences.length); elements["template-change-count"].textContent = String(preview.changedCount);
    elements["template-rule-count"].textContent = String(preview.rules.length); elements["template-critical-count"].textContent = String(preview.criticalRules.length);
    elements["template-error-list"].replaceChildren();
    if (preview.errors.length) preview.errors.forEach(error => { const item = document.createElement("li"); item.textContent = error; item.dataset.kind = "error"; elements["template-error-list"].append(item); });
    else { const item = document.createElement("li"); item.textContent = "Alle Pflichtantworten, Werte, Regeln und technischen Vorgaben sind konsistent."; item.dataset.kind = "success"; elements["template-error-list"].append(item); }
    elements["template-diff-body"].replaceChildren();
    for (const diff of preview.differences) {
      const row = document.createElement("tr"); row.dataset.status = diff.status;
      const values = [diff.questionTitle, diff.currentValue === undefined ? "noch offen" : diff.currentLabel, diff.profileLabel, diff.status === "same" ? "unverändert" : diff.status === "new" ? "wird gesetzt" : "wird im neuen Projekt anders gesetzt"];
      for (const text of values) { const cell = document.createElement("td"); cell.textContent = text; row.append(cell); }
      elements["template-diff-body"].append(row);
    }
    elements["template-rule-list"].replaceChildren();
    if (!preview.rules.length) renderItems(elements["template-rule-list"], ["Keine Regel wird durch dieses Profil ausgelöst."]);
    else for (const rule of preview.rules) { const item = document.createElement("li"); item.textContent = `${rule.severity === "critical" ? "Kritisch" : "Hinweis"}: ${rule.message} Empfehlung: ${rule.recommendation}`; elements["template-rule-list"].append(item); }
    renderItems(elements["template-architecture"], selectedEntry.profile.architecture);
    elements["template-folder-tree"].textContent = selectedEntry.profile.folderTree.map((item, index) => `${index === 0 ? "" : "├── "}${item}`).join("\n");
    const report = selectedEntry.profile.reportPreset;
    elements["template-report-preset"].textContent = `Tiefe: ${report.detailLevel}. Formate: ${report.formats.join(", ")}. Abschnitte: ${report.sections.join(" · ")}. Rückverfolgbarkeit: ${report.includeTraceability ? "ja" : "nein"}. Offene Entscheidungen: ${report.includeOpenDecisions ? "ja" : "nein"}.`;
    renderItems(elements["template-quality-gates"], selectedEntry.profile.qualityGates); renderItems(elements["template-milestones"], selectedEntry.profile.milestones); renderItems(elements["template-special-cases"], selectedEntry.profile.specialCases);
    elements["template-project-name"].value = `${selectedEntry.template.title} – ${selectedEntry.profile.title}`.slice(0, 80);
    elements["template-confirm"].checked = false; elements["template-critical-confirm"].checked = false; elements["template-critical-label"].hidden = preview.criticalRules.length === 0;
    elements["template-profile-actions"].hidden = selectedEntry.kind !== "custom"; elements["template-delete-confirm"].checked = false; elements["template-delete-button"].disabled = true;
    elements["template-rename-input"].value = selectedEntry.kind === "custom" ? selectedEntry.profile.title : "";
    lastPreviewFingerprint = preview.fingerprint; updateCreateAvailability();
  }

  function selectEntry(key) { selectedEntry = profileEntries.find(entry => entry.key === key) || null; if (!selectedEntry) return; selectedPreview = core().buildPreview(selectedEntry, namespace.state.getState()); renderPreview(); }

  async function createProjectFromSelection() {
    updateCreateAvailability(); if (elements["template-create-button"].disabled) return;
    elements["template-create-button"].disabled = true; setStatus("Profil wird erneut geprüft und als unabhängiges Projekt gespeichert …");
    try {
      await ensureReady();
      const appState = namespace.state.getState(); const freshPreview = core().buildPreview(selectedEntry, appState);
      if (!freshPreview.valid || freshPreview.fingerprint !== lastPreviewFingerprint) throw new Error("Das Profil wurde seit der Vorschau verändert. Erzeuge eine neue Vorschau.");
      if (freshPreview.criticalRules.length && !elements["template-critical-confirm"].checked) throw new Error("Die kritischen Regelkonflikte wurden nicht ausdrücklich bestätigt.");
      const name = namespace.projectRepository.validateName(elements["template-project-name"].value);
      await namespace.persistence.flush("before-template-project");
      const projects = await namespace.projectRepository.listProjects();
      const projectId = namespace.projectRepository.createProjectId(name, projects.map(item => item.id));
      const payload = namespace.projectRepository.createBlankPayload({ projectId, name, catalogVersion: appState.catalog.catalogVersion, currentQuestionId: appState.catalog.questions[0]?.id || null, theme: appState.theme });
      payload.answers = core().clone(selectedEntry.profile.answers); payload.updatedAt = new Date().toISOString(); payload.lastValidatedAt = payload.updatedAt;
      const errors = namespace.validation.validateStoredProject(payload, appState.catalog); if (errors.length) throw new Error(`Der neue Projektstand ist ungültig: ${errors.join(" ")}`);
      await namespace.storage.saveProject(payload, "project-created-from-template");
      let originWarning = ""; try { await core().saveOrigin(projectId, selectedEntry, freshPreview); } catch (error) { originWarning = ` Die Herkunftsmetadaten konnten nicht gespeichert werden: ${error.message}`; }
      await namespace.persistence.openProject(projectId);
      const live = document.getElementById("live-status"); if (live) live.textContent = `Projekt „${name}“ wurde aus dem geprüften Profil angelegt.${originWarning}`;
      elements["template-dialog"].close();
    } catch (error) { console.error(error); setStatus(`Projektanlage blockiert: ${error.message}`, "error"); updateCreateAvailability(); }
  }

  async function saveCurrentAsProfile() {
    setStatus("Aktueller Projektstand wird als eigenes Profil geprüft …");
    try {
      await ensureReady(); const appState = namespace.state.getState(); const title = core().normalizeTitle(elements["template-new-profile-name"].value);
      const description = String(elements["template-new-profile-description"].value || "").trim() || `Eigenes Profil aus dem Projekt ${appState.projectName}.`;
      const base = selectedEntry?.profile || core().flattenBuiltins(core().usableBuiltinCatalog(appState))[0].profile;
      const profile = { id: "temporary", title, description, answers: core().clone(appState.answers), expectedRuleIds: namespace.rules.evaluate(appState.rules, appState.answers).map(rule => rule.id).sort(), architecture: core().clone(base.architecture), folderTree: core().clone(base.folderTree), reportPreset: core().clone(base.reportPreset), qualityGates: core().clone(base.qualityGates), milestones: core().clone(base.milestones), specialCases: core().clone(base.specialCases) };
      const existing = await core().listCustomProfiles(); profile.id = core().createProfileId(title, existing.map(record => record.id));
      const validation = core().validateProfile(profile, appState); if (!validation.valid) throw new Error(validation.errors.join(" "));
      const record = await core().putCustomProfile({ id: profile.id, baseTemplateId: selectedEntry?.template.id || null, baseProfileId: selectedEntry?.profile.id || null, profile });
      elements["template-new-profile-name"].value = ""; elements["template-new-profile-description"].value = ""; await rebuildEntries(`custom:${record.id}`);
      setStatus(`Eigenes Profil „${title}“ wurde lokal und validiert gespeichert.`, "success");
    } catch (error) { console.error(error); setStatus(`Profil konnte nicht gespeichert werden: ${error.message}`, "error"); }
  }

  async function renameSelectedProfile() {
    if (selectedEntry?.kind !== "custom") return;
    try { const title = core().normalizeTitle(elements["template-rename-input"].value); const record = selectedEntry.record; record.profile.title = title; await core().putCustomProfile(record); await rebuildEntries(`custom:${record.id}`); setStatus(`Eigenes Profil wurde in „${title}“ umbenannt.`, "success"); } catch (error) { setStatus(error.message, "error"); }
  }

  async function duplicateSelectedProfile() {
    if (selectedEntry?.kind !== "custom") return;
    try {
      const records = await core().listCustomProfiles(); const profile = core().clone(selectedEntry.profile); profile.title = core().normalizeTitle(`${profile.title} – Kopie`); profile.id = core().createProfileId(profile.title, records.map(record => record.id));
      const record = await core().putCustomProfile({ id: profile.id, baseTemplateId: selectedEntry.record.baseTemplateId, baseProfileId: selectedEntry.record.baseProfileId, profile });
      await rebuildEntries(`custom:${record.id}`); setStatus(`Profilkopie „${profile.title}“ wurde erstellt.`, "success");
    } catch (error) { setStatus(error.message, "error"); }
  }

  function downloadJson(filename, value) {
    const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: "application/json;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.hidden = true; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function exportSelectedProfile() { if (selectedEntry?.kind !== "custom") return; downloadJson(`${core().slugify(selectedEntry.profile.title)}.provoware-profile.json`, core().createProfilePackage(selectedEntry.profile)); setStatus("Eigenes Profil wurde mit Prüfsumme exportiert.", "success"); }

  async function deleteSelectedProfile() {
    if (selectedEntry?.kind !== "custom" || !elements["template-delete-confirm"].checked) return;
    const title = selectedEntry.profile.title;
    try { await core().deleteCustomProfile(selectedEntry.record.id); await rebuildEntries(); setStatus(`Eigenes Profil „${title}“ wurde endgültig gelöscht. Projekte bleiben unverändert.`, "success"); } catch (error) { setStatus(error.message, "error"); }
  }

  async function importProfileFile() {
    const file = elements["template-import-file"].files?.[0]; if (!file) return; setStatus("Profildatei wird ausschließlich gelesen und geprüft …");
    try {
      if (file.size > core().MAX_PROFILE_BYTES) throw new Error("Die Profildatei ist größer als 512 KiB.");
      const appState = namespace.state.getState(); const imported = core().parseProfilePackage(await file.text(), appState); const records = await core().listCustomProfiles();
      const suffix = " – Import"; imported.title = core().normalizeTitle(`${String(imported.title).slice(0, 80 - suffix.length).trim()}${suffix}`); imported.id = core().createProfileId(imported.title, records.map(record => record.id));
      const record = await core().putCustomProfile({ id: imported.id, profile: imported }); elements["template-import-file"].value = ""; await rebuildEntries(`custom:${record.id}`); setStatus(`Profil „${imported.title}“ wurde geprüft und lokal importiert.`, "success");
    } catch (error) { console.error(error); elements["template-import-file"].value = ""; setStatus(`Profilimport blockiert: ${error.message}`, "error"); }
  }

  async function openManager() {
    try { await rebuildEntries(selectedEntry?.key); elements["template-dialog"].showModal(); elements["template-search"].focus(); }
    catch (error) { console.error(error); setStatus(error.message, "error"); elements["template-dialog"].showModal(); }
  }

  function initializeEvents() {
    elements["template-manager-button"].addEventListener("click", openManager); elements["template-close-button"].addEventListener("click", () => elements["template-dialog"].close());
    elements["template-dialog"].addEventListener("cancel", event => { event.preventDefault(); elements["template-dialog"].close(); });
    elements["template-search"].addEventListener("input", () => renderEntryOptions(selectedEntry?.key)); elements["template-profile-list"].addEventListener("change", event => selectEntry(event.target.value));
    elements["template-refresh-button"].addEventListener("click", () => rebuildEntries(selectedEntry?.key).catch(error => setStatus(error.message, "error")));
    elements["template-project-name"].addEventListener("input", updateCreateAvailability); elements["template-confirm"].addEventListener("change", updateCreateAvailability); elements["template-critical-confirm"].addEventListener("change", updateCreateAvailability);
    elements["template-create-button"].addEventListener("click", createProjectFromSelection); elements["template-save-current-button"].addEventListener("click", saveCurrentAsProfile);
    elements["template-rename-button"].addEventListener("click", renameSelectedProfile); elements["template-duplicate-button"].addEventListener("click", duplicateSelectedProfile); elements["template-export-profile-button"].addEventListener("click", exportSelectedProfile);
    elements["template-delete-confirm"].addEventListener("change", event => { elements["template-delete-button"].disabled = !event.target.checked; }); elements["template-delete-button"].addEventListener("click", deleteSelectedProfile); elements["template-import-file"].addEventListener("change", importProfileFile);
  }

  function boot() {
    if (document.getElementById("template-dialog")) return;
    injectUi(); cacheElements(); initializeEvents();
    const headerVersion = document.querySelector(".app-header .eyebrow"); if (headerVersion && headerVersion.textContent.includes("0.8.0")) headerVersion.textContent = headerVersion.textContent.replace("0.8.0", "0.9.0-dev");
  }

  namespace.templateProfilesUi = { boot, rebuildEntries, selectEntry };
})();
