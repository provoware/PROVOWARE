(() => {
  "use strict";

  const MODULE_ID = "data-studio-pro";
  const CORE_API = "/api/provoware/project-data";
  const PRO_API = "/api/provoware/data-studio-pro";
  const SORT_OPTIONS = Object.freeze([
    ["updated-desc", "Aktualisiert · neu → alt"],
    ["updated-asc", "Aktualisiert · alt → neu"],
    ["created-desc", "Erstellt · neu → alt"],
    ["created-asc", "Erstellt · alt → neu"],
  ]);

  let root = null;
  let listenersAbort = null;

  const state = {
    core: { schemaVersion: 1, revision: 0, templates: [], records: [] },
    pro: { schemaVersion: 1, revision: 0, categories: [], templateCategories: [], savedViews: [] },
    recordQuery: "",
    recordTemplateId: "",
    recordCategoryId: "",
    recordSort: "updated-desc",
    libraryQuery: "",
    libraryCategoryId: "",
  };

  const log = (level, message, data) => {
    window.PROVOWARE_DEBUG?.log(level, "DATA-STUDIO-PRO", message, data);
  };

  const query = (selector) => root?.querySelector(selector) || null;

  const setStatus = (message, tone = "info") => {
    const status = query("[data-data-studio-pro-status]");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const request = async (base, method = "GET", path = "", body) => {
    if (window.location.protocol === "file:") {
      throw new Error("Data Studio PRO benötigt den Klick-&-Start-Server.");
    }
    const options = { method, headers: {} };
    if (body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${base}${path}`, options);
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || `API fehlgeschlagen (${response.status}).`);
    }
    return payload;
  };

  const coreApi = (method = "GET", path = "", body) => request(CORE_API, method, path, body);
  const proApi = (method = "GET", path = "", body) => request(PRO_API, method, path, body);

  const normalizeSearch = (value) => String(value || "").trim().toLocaleLowerCase("de-DE");

  const categoryForTemplate = (templateId) => {
    const assignment = state.pro.templateCategories.find((item) => item.templateId === templateId);
    return assignment
      ? state.pro.categories.find((category) => category.id === assignment.categoryId) || null
      : null;
  };

  const recordsForTemplate = (templateId) =>
    state.core.records.filter((record) => record.templateId === templateId);

  const categoryOptions = (select, { includeAll = true, includeNone = false, value = "" } = {}) => {
    select.replaceChildren();
    if (includeAll) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Alle Kategorien";
      select.append(option);
    }
    if (includeNone) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Ohne Kategorie";
      select.append(option);
    }
    state.pro.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      select.append(option);
    });
    select.value = value || "";
  };

  const templateOptions = (select, value = "") => {
    select.replaceChildren();
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "Alle Vorlagen";
    select.append(all);
    state.core.templates
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name, "de-DE"))
      .forEach((template) => {
        const option = document.createElement("option");
        option.value = template.id;
        option.textContent = template.name;
        select.append(option);
      });
    select.value = value || "";
  };

  const renderControls = () => {
    const templateFilter = query("[data-pro-record-template]");
    const categoryFilter = query("[data-pro-record-category]");
    const libraryCategory = query("[data-pro-library-category]");
    const sort = query("[data-pro-record-sort]");
    const recordSearch = query("[data-pro-record-search]");
    const librarySearch = query("[data-pro-library-search]");
    if (templateFilter) templateOptions(templateFilter, state.recordTemplateId);
    if (categoryFilter) categoryOptions(categoryFilter, { value: state.recordCategoryId });
    if (libraryCategory) categoryOptions(libraryCategory, { value: state.libraryCategoryId });
    if (sort) sort.value = state.recordSort;
    if (recordSearch && recordSearch.value !== state.recordQuery) recordSearch.value = state.recordQuery;
    if (librarySearch && librarySearch.value !== state.libraryQuery) librarySearch.value = state.libraryQuery;
  };

  const recordSearchText = (record, template) => {
    const parts = [template.name, template.description || ""];
    template.fields.forEach((field) => {
      const raw = record.values[field.id];
      const value = field.type === "checkbox" ? (raw ? "Ja" : "Nein") : raw;
      parts.push(field.label, value ?? "");
    });
    return normalizeSearch(parts.join(" "));
  };

  const recordSummary = (record, template) => {
    const parts = template.fields.slice(0, 3).map((field) => {
      const raw = record.values[field.id];
      const value = field.type === "checkbox" ? (raw ? "Ja" : "Nein") : raw;
      return value === "" || value === null || value === undefined ? null : `${field.label}: ${value}`;
    }).filter(Boolean);
    return parts.join(" · ") || "Datensatz ohne ausgefüllte Vorschaufelder";
  };

  const sortRecords = (records) => {
    const [field, direction] = state.recordSort.split("-");
    const key = field === "created" ? "createdAt" : "updatedAt";
    const factor = direction === "asc" ? 1 : -1;
    return records.slice().sort((left, right) => {
      const diff = String(left[key] || "").localeCompare(String(right[key] || ""));
      if (diff !== 0) return diff * factor;
      return String(left.id).localeCompare(String(right.id)) * factor;
    });
  };

  const filteredRecords = () => {
    const needle = normalizeSearch(state.recordQuery);
    const templates = new Map(state.core.templates.map((template) => [template.id, template]));
    const records = state.core.records.filter((record) => {
      const template = templates.get(record.templateId);
      if (!template) return false;
      if (state.recordTemplateId && record.templateId !== state.recordTemplateId) return false;
      const category = categoryForTemplate(record.templateId);
      if (state.recordCategoryId && category?.id !== state.recordCategoryId) return false;
      return !needle || recordSearchText(record, template).includes(needle);
    });
    return sortRecords(records);
  };

  const renderRecordResults = () => {
    const list = query("[data-pro-record-results]");
    const count = query("[data-pro-record-count]");
    if (!list) return;
    list.replaceChildren();
    const templates = new Map(state.core.templates.map((template) => [template.id, template]));
    const records = filteredRecords();
    if (count) count.textContent = `${records.length} Treffer`;

    if (!records.length) {
      const empty = document.createElement("p");
      empty.className = "data-studio-empty";
      empty.textContent = "Keine Datensätze entsprechen der aktuellen Ansicht.";
      list.append(empty);
      return;
    }

    records.forEach((record) => {
      const template = templates.get(record.templateId);
      const category = categoryForTemplate(record.templateId);
      const item = document.createElement("article");
      item.className = "data-studio-record-item data-studio-pro-record-item";
      item.dataset.proRecordId = record.id;

      const text = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = recordSummary(record, template);
      const meta = document.createElement("small");
      meta.textContent = `${template.name}${category ? ` · ${category.name}` : " · Ohne Kategorie"} · ${new Date(record.updatedAt).toLocaleString("de-DE")}`;
      text.append(title, meta);

      const actions = document.createElement("div");
      actions.className = "data-studio-record-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.dataset.action = "open-record";
      edit.dataset.recordId = record.id;
      edit.dataset.templateId = record.templateId;
      edit.textContent = "Bearbeiten";
      actions.append(edit);
      item.append(text, actions);
      list.append(item);
    });
  };

  const filteredTemplates = () => {
    const needle = normalizeSearch(state.libraryQuery);
    return state.core.templates
      .filter((template) => {
        const category = categoryForTemplate(template.id);
        if (state.libraryCategoryId && category?.id !== state.libraryCategoryId) return false;
        if (!needle) return true;
        return normalizeSearch(`${template.name} ${template.description || ""}`).includes(needle);
      })
      .sort((left, right) => left.name.localeCompare(right.name, "de-DE"));
  };

  const renderTemplateLibrary = () => {
    const list = query("[data-pro-template-library]");
    const count = query("[data-pro-template-count]");
    if (!list) return;
    list.replaceChildren();
    const templates = filteredTemplates();
    if (count) count.textContent = `${templates.length} Vorlagen`;

    if (!templates.length) {
      const empty = document.createElement("p");
      empty.className = "data-studio-empty";
      empty.textContent = "Keine Vorlage entspricht dem Bibliotheksfilter.";
      list.append(empty);
      return;
    }

    templates.forEach((template) => {
      const category = categoryForTemplate(template.id);
      const item = document.createElement("article");
      item.className = "data-studio-pro-template-item";
      item.dataset.proTemplateId = template.id;

      const header = document.createElement("div");
      header.className = "data-studio-pro-template-heading";
      const text = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = template.name;
      const meta = document.createElement("small");
      meta.textContent = `${category?.name || "Ohne Kategorie"} · ${template.fields.length} Felder · ${recordsForTemplate(template.id).length} Datensätze`;
      text.append(title, meta);

      const actions = document.createElement("div");
      actions.className = "data-studio-record-actions";
      const open = document.createElement("button");
      open.type = "button";
      open.dataset.action = "open-template";
      open.dataset.templateId = template.id;
      open.textContent = "Öffnen";
      const exportButton = document.createElement("button");
      exportButton.type = "button";
      exportButton.dataset.action = "export-template";
      exportButton.dataset.templateId = template.id;
      exportButton.textContent = "Exportieren";
      actions.append(open, exportButton);
      header.append(text, actions);

      const assignment = document.createElement("label");
      assignment.className = "data-studio-pro-category-assignment";
      assignment.textContent = "Kategorie";
      const select = document.createElement("select");
      select.dataset.proTemplateCategory = template.id;
      categoryOptions(select, { includeAll: false, includeNone: true, value: category?.id || "" });
      assignment.append(select);

      item.append(header, assignment);
      list.append(item);
    });
  };

  const renderCategories = () => {
    const list = query("[data-pro-category-list]");
    if (!list) return;
    list.replaceChildren();
    if (!state.pro.categories.length) {
      const empty = document.createElement("p");
      empty.className = "data-studio-empty";
      empty.textContent = "Noch keine Kategorien angelegt.";
      list.append(empty);
      return;
    }

    state.pro.categories.forEach((category) => {
      const item = document.createElement("div");
      item.className = "data-studio-pro-category-item";
      const label = document.createElement("span");
      const assigned = state.pro.templateCategories.filter((entry) => entry.categoryId === category.id).length;
      label.textContent = `${category.name} · ${assigned} Vorlagen`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.dataset.action = "delete-category";
      remove.dataset.categoryId = category.id;
      remove.textContent = "Löschen";
      item.append(label, remove);
      list.append(item);
    });
  };

  const renderSavedViews = () => {
    const select = query("[data-pro-saved-view]");
    if (!select) return;
    const previous = select.value;
    select.replaceChildren();
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = state.pro.savedViews.length ? "Gespeicherte Ansicht wählen …" : "Noch keine gespeicherte Ansicht";
    select.append(empty);
    state.pro.savedViews.forEach((view) => {
      const option = document.createElement("option");
      option.value = view.id;
      option.textContent = view.name;
      select.append(option);
    });
    if (state.pro.savedViews.some((view) => view.id === previous)) select.value = previous;
  };

  const renderRevisions = () => {
    const revision = query("[data-pro-revision]");
    if (revision) revision.textContent = `Data ${state.core.revision} · PRO ${state.pro.revision}`;
  };

  const render = () => {
    renderControls();
    renderTemplateLibrary();
    renderRecordResults();
    renderCategories();
    renderSavedViews();
    renderRevisions();
  };

  const refresh = async ({ status = true } = {}) => {
    const [corePayload, proPayload] = await Promise.all([coreApi("GET"), proApi("GET")]);
    state.core = corePayload.data;
    state.pro = proPayload.data;
    render();
    if (status) setStatus("Data Studio PRO bereit.", "success");
  };

  const refreshCore = async () => {
    const payload = await coreApi("GET");
    state.core = payload.data;
    renderControls();
    renderTemplateLibrary();
    renderRecordResults();
    renderRevisions();
  };

  const safeFileStem = (value) => {
    const normalized = String(value || "template")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("de-DE")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return normalized || "template";
  };

  const exportTemplate = (templateId) => {
    const template = state.core.templates.find((item) => item.id === templateId);
    if (!template) throw new Error("Vorlage für Export nicht gefunden.");
    const category = categoryForTemplate(template.id);
    const payload = {
      format: "provoware-data-studio-template",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      category: category?.name || null,
      template: {
        schemaVersion: template.schemaVersion,
        name: template.name,
        description: template.description,
        fields: template.fields.map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          options: [...field.options],
        })),
      },
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `template-${safeFileStem(template.name)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus(`Vorlage '${template.name}' exportiert.`, "success");
    log(1, "Vorlage exportiert.", { templateId: template.id });
  };

  const saveCurrentView = async () => {
    const name = query("[data-pro-view-name]")?.value || "";
    const payload = await proApi("POST", "/saved-views", {
      name,
      templateId: state.recordTemplateId || null,
      categoryId: state.recordCategoryId || null,
      query: state.recordQuery,
      sort: state.recordSort,
    });
    await refresh({ status: false });
    const select = query("[data-pro-saved-view]");
    if (select) select.value = payload.result.id;
    const input = query("[data-pro-view-name]");
    if (input) input.value = "";
    setStatus(`Ansicht '${payload.result.name}' gespeichert.`, "success");
  };

  const applySavedView = () => {
    const id = query("[data-pro-saved-view]")?.value;
    const view = state.pro.savedViews.find((item) => item.id === id);
    if (!view) throw new Error("Gespeicherte Ansicht auswählen.");
    state.recordTemplateId = view.templateId || "";
    state.recordCategoryId = view.categoryId || "";
    state.recordQuery = view.query || "";
    state.recordSort = view.sort;
    renderControls();
    renderRecordResults();
    setStatus(`Ansicht '${view.name}' angewendet.`, "success");
  };

  const deleteSavedView = async () => {
    const id = query("[data-pro-saved-view]")?.value;
    const view = state.pro.savedViews.find((item) => item.id === id);
    if (!view) throw new Error("Gespeicherte Ansicht auswählen.");
    await proApi("DELETE", `/saved-views/${encodeURIComponent(id)}`);
    await refresh({ status: false });
    setStatus(`Ansicht '${view.name}' gelöscht.`, "success");
  };

  const createCategory = async () => {
    const input = query("[data-pro-category-name]");
    const name = input?.value || "";
    const payload = await proApi("POST", "/categories", { name });
    if (input) input.value = "";
    await refresh({ status: false });
    setStatus(`Kategorie '${payload.result.name}' angelegt.`, "success");
  };

  const deleteCategory = async (categoryId) => {
    const category = state.pro.categories.find((item) => item.id === categoryId);
    if (!category) return;
    const confirmed = window.confirm(`Kategorie '${category.name}' löschen? Vorlagen bleiben erhalten und werden nur aus der Kategorie gelöst.`);
    if (!confirmed) return;
    await proApi("DELETE", `/categories/${encodeURIComponent(categoryId)}`);
    if (state.recordCategoryId === categoryId) state.recordCategoryId = "";
    if (state.libraryCategoryId === categoryId) state.libraryCategoryId = "";
    await refresh({ status: false });
    setStatus(`Kategorie '${category.name}' gelöscht.`, "success");
  };

  const assignCategory = async (templateId, categoryId) => {
    await proApi("PUT", `/template-categories/${encodeURIComponent(templateId)}`, {
      categoryId: categoryId || null,
    });
    await refresh({ status: false });
    setStatus(categoryId ? "Kategorie zugewiesen." : "Kategoriezuweisung entfernt.", "success");
  };

  const dispatchOpenTemplate = (templateId) => {
    window.dispatchEvent(new CustomEvent("provoware:data-studio-open-template", {
      detail: { templateId },
    }));
    setStatus("Vorlage im Data Studio geöffnet.", "success");
  };

  const dispatchOpenRecord = (recordId, templateId) => {
    window.dispatchEvent(new CustomEvent("provoware:data-studio-open-record", {
      detail: { recordId, templateId },
    }));
    setStatus("Datensatz im Data Studio geöffnet.", "success");
  };

  const handleClick = (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || !root?.contains(button)) return;
    const action = button.dataset.action;

    const run = async () => {
      if (action === "refresh-pro") await refresh();
      else if (action === "create-category") await createCategory();
      else if (action === "delete-category") await deleteCategory(button.dataset.categoryId);
      else if (action === "save-view") await saveCurrentView();
      else if (action === "apply-view") applySavedView();
      else if (action === "delete-view") await deleteSavedView();
      else if (action === "open-template") dispatchOpenTemplate(button.dataset.templateId);
      else if (action === "open-record") dispatchOpenRecord(button.dataset.recordId, button.dataset.templateId);
      else if (action === "export-template") exportTemplate(button.dataset.templateId);
      else if (action === "reset-record-filters") {
        state.recordQuery = "";
        state.recordTemplateId = "";
        state.recordCategoryId = "";
        state.recordSort = "updated-desc";
        renderControls();
        renderRecordResults();
        setStatus("Datensatzfilter zurückgesetzt.");
      }
    };

    void run().catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Fehler: ${message}`, "error");
      log(1, "PRO-Aktion fehlgeschlagen.", { action, message });
    });
  };

  const handleInput = (event) => {
    if (event.target.matches("[data-pro-record-search]")) {
      state.recordQuery = event.target.value;
      renderRecordResults();
    } else if (event.target.matches("[data-pro-library-search]")) {
      state.libraryQuery = event.target.value;
      renderTemplateLibrary();
    }
  };

  const handleChange = (event) => {
    if (event.target.matches("[data-pro-record-template]")) {
      state.recordTemplateId = event.target.value;
      renderRecordResults();
    } else if (event.target.matches("[data-pro-record-category]")) {
      state.recordCategoryId = event.target.value;
      renderRecordResults();
    } else if (event.target.matches("[data-pro-record-sort]")) {
      state.recordSort = event.target.value;
      renderRecordResults();
    } else if (event.target.matches("[data-pro-library-category]")) {
      state.libraryCategoryId = event.target.value;
      renderTemplateLibrary();
    } else if (event.target.matches("[data-pro-template-category]")) {
      const templateId = event.target.dataset.proTemplateCategory;
      void assignCategory(templateId, event.target.value).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Fehler: ${message}`, "error");
      });
    }
  };

  const createUi = () => {
    const host = document.querySelector("#details");
    if (!host) throw new Error("Detailbereich #details fehlt.");
    const section = document.createElement("div");
    section.className = "data-studio data-studio-pro";
    section.innerHTML = `
      <div class="data-studio-toolbar">
        <div>
          <p class="data-studio-kicker">0.4.2 · Organisation &amp; Recherche</p>
          <h3>Data Studio PRO</h3>
        </div>
        <div class="data-studio-toolbar-actions">
          <span data-pro-revision>Data 0 · PRO 0</span>
          <button type="button" data-action="refresh-pro">Neu laden</button>
        </div>
      </div>
      <p class="data-studio-status" data-data-studio-pro-status role="status" aria-live="polite">Initialisierung …</p>

      <div class="data-studio-grid data-studio-pro-grid">
        <section class="data-studio-card" aria-labelledby="data-studio-pro-library-title">
          <div class="data-studio-card-header">
            <h4 id="data-studio-pro-library-title">Vorlagenbibliothek</h4>
            <span class="data-studio-pro-count" data-pro-template-count>0 Vorlagen</span>
          </div>
          <div class="data-studio-pro-filter-grid">
            <label>Vorlagen suchen
              <input type="search" data-pro-library-search maxlength="200" placeholder="Name oder Beschreibung">
            </label>
            <label>Kategorie
              <select data-pro-library-category></select>
            </label>
          </div>
          <div class="data-studio-pro-template-library" data-pro-template-library></div>
        </section>

        <section class="data-studio-card" aria-labelledby="data-studio-pro-search-title">
          <div class="data-studio-card-header">
            <h4 id="data-studio-pro-search-title">Datensatzsuche</h4>
            <span class="data-studio-pro-count" data-pro-record-count>0 Treffer</span>
          </div>
          <div class="data-studio-pro-filter-grid">
            <label>Volltextsuche
              <input type="search" data-pro-record-search maxlength="300" placeholder="Feld, Wert oder Vorlage">
            </label>
            <label>Vorlage
              <select data-pro-record-template></select>
            </label>
            <label>Kategorie
              <select data-pro-record-category></select>
            </label>
            <label>Sortierung
              <select data-pro-record-sort>
                ${SORT_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="data-studio-card-actions data-studio-pro-filter-actions">
            <button type="button" data-action="reset-record-filters">Filter zurücksetzen</button>
          </div>
          <div class="data-studio-record-list" data-pro-record-results></div>
        </section>

        <section class="data-studio-card" aria-labelledby="data-studio-pro-category-title">
          <div class="data-studio-card-header">
            <h4 id="data-studio-pro-category-title">Kategorien</h4>
          </div>
          <div class="data-studio-pro-inline-form">
            <label>Neue Kategorie
              <input type="text" maxlength="80" data-pro-category-name placeholder="z. B. Entwicklung">
            </label>
            <button type="button" class="data-studio-primary" data-action="create-category">Kategorie anlegen</button>
          </div>
          <div class="data-studio-pro-category-list" data-pro-category-list></div>
        </section>

        <section class="data-studio-card" aria-labelledby="data-studio-pro-view-title">
          <div class="data-studio-card-header">
            <h4 id="data-studio-pro-view-title">Gespeicherte Ansichten</h4>
          </div>
          <p class="data-studio-empty">Speichert Vorlage, Kategorie-Filter, Suchtext und Sortierung – keine Datensatzkopien.</p>
          <div class="data-studio-pro-inline-form">
            <label>Ansichtsname
              <input type="text" maxlength="100" data-pro-view-name placeholder="z. B. Offene Entwicklungsdaten">
            </label>
            <button type="button" class="data-studio-primary" data-action="save-view">Aktuelle Ansicht speichern</button>
          </div>
          <label>Gespeicherte Ansicht
            <select data-pro-saved-view></select>
          </label>
          <div class="data-studio-card-actions">
            <button type="button" data-action="apply-view">Anwenden</button>
            <button type="button" data-action="delete-view">Ansicht löschen</button>
          </div>
        </section>
      </div>
    `;
    host.append(section);
    return section;
  };

  const bindEvents = () => {
    listenersAbort = new AbortController();
    const signal = listenersAbort.signal;
    root.addEventListener("click", handleClick, { signal });
    root.addEventListener("input", handleInput, { signal });
    root.addEventListener("change", handleChange, { signal });
    window.addEventListener("provoware:data-studio-refreshed", () => {
      if (window.location.protocol === "file:") return;
      void refreshCore().catch((error) => {
        log(2, "PRO konnte den aktualisierten Data-Studio-Stand nicht nachladen.", { message: error.message });
      });
    }, { signal });
  };

  const removeUi = () => {
    listenersAbort?.abort();
    listenersAbort = null;
    root?.remove();
    root = null;
  };

  window.PROVOWARE_MODULES.define(MODULE_ID, {
    async activate() {
      if (!root) {
        root = createUi();
        bindEvents();
      }

      if (window.location.protocol === "file:") {
        root.dataset.serverRequired = "true";
        root.querySelectorAll("button, input, select").forEach((control) => {
          control.disabled = true;
        });
        setStatus("Data Studio PRO benötigt für Suche, Kategorien und Ansichten den Klick-&-Start-Server.", "error");
        log(1, "Data Studio PRO im statischen Lesemodus gestartet.");
        return;
      }

      try {
        await refresh();
        log(1, "Data Studio PRO aktiviert.", {
          dataRevision: state.core.revision,
          proRevision: state.pro.revision,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Fehler: ${message}`, "error");
        log(1, "Data Studio PRO konnte nicht initialisiert werden.", { message });
      }
    },
    async deactivate() {
      removeUi();
      log(2, "Data Studio PRO deaktiviert.");
    },
    async dispose() {
      removeUi();
    },
  });
})();
