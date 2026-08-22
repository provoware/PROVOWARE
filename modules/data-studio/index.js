(() => {
  "use strict";

  const MODULE_ID = "data-studio";
  const API_ROOT = "/api/provoware/project-data";
  const FIELD_TYPES = Object.freeze([
    ["text", "Text"],
    ["textarea", "Mehrzeiliger Text"],
    ["number", "Zahl"],
    ["date", "Datum"],
    ["checkbox", "Checkbox"],
    ["select", "Auswahlliste"],
  ]);

  let root = null;
  let listenersAbort = null;
  let fieldCounter = 0;

  const state = {
    snapshot: { schemaVersion: 1, revision: 0, templates: [], records: [] },
    selectedTemplateId: null,
    editingRecordId: null,
  };

  const log = (level, message, data) => {
    window.PROVOWARE_DEBUG?.log(level, "DATA-STUDIO", message, data);
  };

  const query = (selector) => root?.querySelector(selector) || null;

  const setStatus = (message, tone = "info") => {
    const status = query("[data-data-studio-status]");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const api = async (method, path = "", body) => {
    if (window.location.protocol === "file:") {
      throw new Error("Datenverwaltung benötigt den Klick-&-Start-Server.");
    }
    const options = { method, headers: {} };
    if (body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_ROOT}${path}`, options);
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || `Daten-API fehlgeschlagen (${response.status}).`);
    }
    return payload;
  };

  const newFieldId = () => {
    fieldCounter += 1;
    return `f-${Date.now().toString(36)}-${fieldCounter.toString(36)}`;
  };

  const typeSelect = (selectedType) => {
    const select = document.createElement("select");
    select.className = "data-studio-field-type";
    select.setAttribute("aria-label", "Feldtyp");
    FIELD_TYPES.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = value === selectedType;
      select.append(option);
    });
    return select;
  };

  const updateOptionsVisibility = (row) => {
    const type = row.querySelector(".data-studio-field-type")?.value;
    const options = row.querySelector(".data-studio-field-options-wrap");
    if (options) options.hidden = type !== "select";
  };

  const addFieldRow = (field = {}) => {
    const container = query("[data-template-fields]");
    if (!container) return;

    const row = document.createElement("div");
    row.className = "data-studio-field-row";
    row.dataset.fieldId = field.id || newFieldId();

    const labelWrap = document.createElement("label");
    labelWrap.className = "data-studio-field-label-wrap";
    labelWrap.textContent = "Bezeichnung";
    const labelInput = document.createElement("input");
    labelInput.className = "data-studio-field-label";
    labelInput.type = "text";
    labelInput.maxLength = 100;
    labelInput.value = field.label || "";
    labelInput.placeholder = "z. B. Projektstatus";
    labelWrap.append(labelInput);

    const typeWrap = document.createElement("label");
    typeWrap.textContent = "Typ";
    typeWrap.append(typeSelect(field.type || "text"));

    const requiredWrap = document.createElement("label");
    requiredWrap.className = "data-studio-check-label";
    const required = document.createElement("input");
    required.className = "data-studio-field-required";
    required.type = "checkbox";
    required.checked = field.required === true;
    requiredWrap.append(required, document.createTextNode(" Pflichtfeld"));

    const optionsWrap = document.createElement("label");
    optionsWrap.className = "data-studio-field-options-wrap";
    optionsWrap.textContent = "Auswahlwerte (mit Komma trennen)";
    const optionsInput = document.createElement("input");
    optionsInput.className = "data-studio-field-options";
    optionsInput.type = "text";
    optionsInput.value = Array.isArray(field.options) ? field.options.join(", ") : "";
    optionsInput.placeholder = "Offen, In Arbeit, Erledigt";
    optionsWrap.append(optionsInput);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "data-studio-field-remove";
    remove.dataset.action = "remove-field";
    remove.textContent = "Feld entfernen";

    row.append(labelWrap, typeWrap, requiredWrap, optionsWrap, remove);
    container.append(row);
    updateOptionsVisibility(row);
  };

  const clearFieldRows = () => {
    const container = query("[data-template-fields]");
    if (container) container.replaceChildren();
  };

  const getSelectedTemplate = () =>
    state.snapshot.templates.find((template) => template.id === state.selectedTemplateId) || null;

  const renderTemplateSelect = () => {
    const select = query("[data-template-select]");
    if (!select) return;
    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = state.snapshot.templates.length ? "Vorlage wählen …" : "Noch keine Vorlage";
    select.append(placeholder);

    state.snapshot.templates.forEach((template) => {
      const option = document.createElement("option");
      option.value = template.id;
      option.textContent = template.name;
      option.selected = template.id === state.selectedTemplateId;
      select.append(option);
    });
  };

  const loadTemplateIntoBuilder = (template) => {
    const name = query("[data-template-name]");
    const description = query("[data-template-description]");
    if (name) name.value = template?.name || "";
    if (description) description.value = template?.description || "";
    clearFieldRows();
    if (template?.fields?.length) template.fields.forEach(addFieldRow);
    else addFieldRow();

    const saveButton = query("[data-action='save-template']");
    if (saveButton) saveButton.textContent = template ? "Vorlage aktualisieren" : "Vorlage speichern";
  };

  const collectTemplate = () => {
    const rows = [...(query("[data-template-fields]")?.querySelectorAll(".data-studio-field-row") || [])];
    return {
      name: query("[data-template-name]")?.value || "",
      description: query("[data-template-description]")?.value || "",
      fields: rows.map((row) => {
        const type = row.querySelector(".data-studio-field-type")?.value || "text";
        const options = type === "select"
          ? (row.querySelector(".data-studio-field-options")?.value || "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
          : [];
        return {
          id: row.dataset.fieldId,
          label: row.querySelector(".data-studio-field-label")?.value || "",
          type,
          required: row.querySelector(".data-studio-field-required")?.checked === true,
          options: [...new Set(options)],
        };
      }),
    };
  };

  const buildRecordControl = (field, value) => {
    const wrapper = document.createElement("label");
    wrapper.className = `data-studio-record-field data-studio-record-field-${field.type}`;

    const title = document.createElement("span");
    title.textContent = `${field.label}${field.required ? " *" : ""}`;
    wrapper.append(title);

    let control;
    if (field.type === "textarea") {
      control = document.createElement("textarea");
      control.rows = 3;
      control.maxLength = 10000;
      control.value = value ?? "";
    } else if (field.type === "select") {
      control = document.createElement("select");
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "Bitte wählen …";
      control.append(empty);
      field.options.forEach((item) => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        option.selected = item === value;
        control.append(option);
      });
    } else {
      control = document.createElement("input");
      control.type = field.type === "checkbox" ? "checkbox" : field.type;
      if (field.type === "checkbox") control.checked = value === true;
      else if (value !== null && value !== undefined) control.value = String(value);
      if (field.type === "text") control.maxLength = 1000;
    }

    control.dataset.recordFieldId = field.id;
    if (field.required && field.type !== "checkbox") control.required = true;
    wrapper.append(control);
    return wrapper;
  };

  const renderRecordForm = (record = null) => {
    const container = query("[data-record-fields]");
    const title = query("[data-record-title]");
    const save = query("[data-action='save-record']");
    if (!container || !title || !save) return;

    container.replaceChildren();
    const template = getSelectedTemplate();
    state.editingRecordId = record?.id || null;

    if (!template) {
      title.textContent = "Datensatz – zuerst Vorlage wählen";
      save.disabled = true;
      return;
    }

    title.textContent = record ? `Datensatz bearbeiten · ${template.name}` : `Neuer Datensatz · ${template.name}`;
    save.textContent = record ? "Änderungen speichern" : "Datensatz speichern";
    save.disabled = window.location.protocol === "file:";
    template.fields.forEach((field) => {
      container.append(buildRecordControl(field, record?.values?.[field.id]));
    });
  };

  const recordSummary = (record, template) => {
    const parts = template.fields.slice(0, 3).map((field) => {
      const raw = record.values[field.id];
      const value = field.type === "checkbox" ? (raw ? "Ja" : "Nein") : raw;
      return value === "" || value === null || value === undefined ? null : `${field.label}: ${value}`;
    }).filter(Boolean);
    return parts.join(" · ") || "Datensatz ohne ausgefüllte Vorschaufelder";
  };

  const renderRecords = () => {
    const list = query("[data-record-list]");
    if (!list) return;
    list.replaceChildren();
    const template = getSelectedTemplate();
    if (!template) {
      const empty = document.createElement("p");
      empty.className = "data-studio-empty";
      empty.textContent = "Vorlage wählen, um Datensätze anzuzeigen.";
      list.append(empty);
      return;
    }

    const records = state.snapshot.records.filter((record) => record.templateId === template.id);
    if (!records.length) {
      const empty = document.createElement("p");
      empty.className = "data-studio-empty";
      empty.textContent = "Noch keine Datensätze für diese Vorlage.";
      list.append(empty);
      return;
    }

    records.forEach((record) => {
      const item = document.createElement("article");
      item.className = "data-studio-record-item";
      const text = document.createElement("div");
      const strong = document.createElement("strong");
      strong.textContent = recordSummary(record, template);
      const meta = document.createElement("small");
      meta.textContent = `Aktualisiert: ${new Date(record.updatedAt).toLocaleString("de-DE")}`;
      text.append(strong, meta);

      const actions = document.createElement("div");
      actions.className = "data-studio-record-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.dataset.action = "edit-record";
      edit.dataset.recordId = record.id;
      edit.textContent = "Bearbeiten";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.dataset.action = "delete-record";
      remove.dataset.recordId = record.id;
      remove.textContent = "Löschen";
      actions.append(edit, remove);
      item.append(text, actions);
      list.append(item);
    });
  };

  const render = () => {
    renderTemplateSelect();
    const selected = getSelectedTemplate();
    if (selected) loadTemplateIntoBuilder(selected);
    renderRecordForm();
    renderRecords();
    const revision = query("[data-data-studio-revision]");
    if (revision) revision.textContent = `Revision ${state.snapshot.revision}`;
  };

  const refresh = async ({ keepSelection = true } = {}) => {
    const previous = keepSelection ? state.selectedTemplateId : null;
    const payload = await api("GET");
    state.snapshot = payload.data;
    state.selectedTemplateId = state.snapshot.templates.some((template) => template.id === previous)
      ? previous
      : state.snapshot.templates[0]?.id || null;
    state.editingRecordId = null;
    render();
  };

  const saveTemplate = async () => {
    const body = collectTemplate();
    setStatus("Vorlage wird gespeichert …");
    const selected = getSelectedTemplate();
    const payload = selected
      ? await api("PUT", `/templates/${encodeURIComponent(selected.id)}`, body)
      : await api("POST", "/templates", body);
    state.selectedTemplateId = payload.result.id;
    await refresh();
    setStatus(selected ? "Vorlage aktualisiert." : "Vorlage gespeichert.", "success");
    log(1, selected ? "Vorlage aktualisiert." : "Vorlage erstellt.", { id: payload.result.id });
  };

  const collectRecordValues = () => {
    const template = getSelectedTemplate();
    if (!template) throw new Error("Keine Vorlage ausgewählt.");
    const values = {};
    template.fields.forEach((field) => {
      const control = query(`[data-record-field-id='${field.id}']`);
      if (!control) return;
      values[field.id] = field.type === "checkbox" ? control.checked : control.value;
    });
    return values;
  };

  const saveRecord = async () => {
    const template = getSelectedTemplate();
    if (!template) throw new Error("Keine Vorlage ausgewählt.");
    const body = { templateId: template.id, values: collectRecordValues() };
    const editingId = state.editingRecordId;
    setStatus(editingId ? "Änderungen werden gespeichert …" : "Datensatz wird gespeichert …");
    if (editingId) await api("PUT", `/records/${encodeURIComponent(editingId)}`, body);
    else await api("POST", "/records", body);
    await refresh();
    setStatus(editingId ? "Datensatz aktualisiert." : "Datensatz gespeichert.", "success");
    log(1, editingId ? "Datensatz aktualisiert." : "Datensatz erstellt.", { templateId: template.id });
  };

  const editRecord = (recordId) => {
    const record = state.snapshot.records.find((item) => item.id === recordId);
    if (!record) return;
    state.selectedTemplateId = record.templateId;
    renderTemplateSelect();
    loadTemplateIntoBuilder(getSelectedTemplate());
    renderRecordForm(record);
    renderRecords();
    query("[data-record-form]")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const deleteRecord = async (recordId) => {
    const record = state.snapshot.records.find((item) => item.id === recordId);
    if (!record) return;
    const confirmed = window.confirm("Diesen Datensatz wirklich löschen? Die Aktion kann nicht über die Oberfläche rückgängig gemacht werden.");
    if (!confirmed) return;
    setStatus("Datensatz wird gelöscht …");
    await api("DELETE", `/records/${encodeURIComponent(recordId)}`);
    await refresh();
    setStatus("Datensatz gelöscht.", "success");
    log(1, "Datensatz gelöscht.", { id: recordId });
  };

  const handleClick = (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || !root?.contains(button)) return;
    const action = button.dataset.action;

    const run = async () => {
      if (action === "add-field") addFieldRow();
      else if (action === "remove-field") {
        const row = button.closest(".data-studio-field-row");
        const count = query("[data-template-fields]")?.children.length || 0;
        if (count <= 1) throw new Error("Eine Vorlage benötigt mindestens ein Feld.");
        row?.remove();
      } else if (action === "new-template") {
        state.selectedTemplateId = null;
        state.editingRecordId = null;
        renderTemplateSelect();
        loadTemplateIntoBuilder(null);
        renderRecordForm();
        renderRecords();
        setStatus("Neue Vorlage vorbereitet.");
      } else if (action === "save-template") await saveTemplate();
      else if (action === "refresh") {
        await refresh();
        setStatus("Daten neu geladen.", "success");
      } else if (action === "new-record") {
        renderRecordForm();
        setStatus("Neuer Datensatz vorbereitet.");
      } else if (action === "edit-record") editRecord(button.dataset.recordId);
      else if (action === "delete-record") await deleteRecord(button.dataset.recordId);
    };

    void run().catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Fehler: ${message}`, "error");
      log(1, "Aktion fehlgeschlagen.", { action, message });
    });
  };

  const handleChange = (event) => {
    if (event.target.matches("[data-template-select]")) {
      state.selectedTemplateId = event.target.value || null;
      state.editingRecordId = null;
      loadTemplateIntoBuilder(getSelectedTemplate());
      renderRecordForm();
      renderRecords();
      return;
    }
    const row = event.target.closest(".data-studio-field-row");
    if (row && event.target.matches(".data-studio-field-type")) updateOptionsVisibility(row);
  };

  const createUi = () => {
    const host = document.querySelector("#details");
    if (!host) throw new Error("Detailbereich #details fehlt.");

    const section = document.createElement("div");
    section.className = "data-studio";
    section.innerHTML = `
      <div class="data-studio-toolbar">
        <div>
          <p class="data-studio-kicker">Zentrale Projekt-Daten</p>
          <h3>Data Studio &amp; Eingabemasken-Baukasten</h3>
        </div>
        <div class="data-studio-toolbar-actions">
          <span data-data-studio-revision>Revision 0</span>
          <button type="button" data-action="refresh">Neu laden</button>
        </div>
      </div>
      <p class="data-studio-status" data-data-studio-status role="status" aria-live="polite">Initialisierung …</p>
      <div class="data-studio-grid">
        <section class="data-studio-card" aria-labelledby="data-studio-template-title">
          <div class="data-studio-card-header">
            <h4 id="data-studio-template-title">Eingabemaske / Vorlage</h4>
            <button type="button" data-action="new-template">Neue Vorlage</button>
          </div>
          <label>Vorlage
            <select data-template-select></select>
          </label>
          <label>Name
            <input type="text" maxlength="100" data-template-name placeholder="z. B. Entwicklungs-Checkpoint">
          </label>
          <label>Beschreibung
            <textarea rows="2" maxlength="1000" data-template-description placeholder="Wofür wird diese Maske benutzt?"></textarea>
          </label>
          <div class="data-studio-fields" data-template-fields></div>
          <div class="data-studio-card-actions">
            <button type="button" data-action="add-field">+ Feld hinzufügen</button>
            <button type="button" class="data-studio-primary" data-action="save-template">Vorlage speichern</button>
          </div>
        </section>

        <section class="data-studio-card" aria-labelledby="data-studio-record-title">
          <div class="data-studio-card-header">
            <h4 id="data-studio-record-title" data-record-title>Datensatz</h4>
            <button type="button" data-action="new-record">Neuer Datensatz</button>
          </div>
          <form data-record-form>
            <div class="data-studio-record-fields" data-record-fields></div>
            <button type="submit" class="data-studio-primary" data-action="save-record">Datensatz speichern</button>
          </form>
          <div class="data-studio-record-list" data-record-list></div>
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
    root.addEventListener("change", handleChange, { signal });
    query("[data-record-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      void saveRecord().catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Fehler: ${message}`, "error");
        log(1, "Datensatz konnte nicht gespeichert werden.", { message });
      });
    }, { signal });
  };

  const removeUi = () => {
    listenersAbort?.abort();
    listenersAbort = null;
    root?.remove();
    root = null;
    state.selectedTemplateId = null;
    state.editingRecordId = null;
  };

  window.PROVOWARE_MODULES.define(MODULE_ID, {
    async activate() {
      if (!root) {
        root = createUi();
        bindEvents();
      }
      loadTemplateIntoBuilder(null);
      renderRecordForm();
      renderRecords();

      if (window.location.protocol === "file:") {
        root.dataset.serverRequired = "true";
        root.querySelectorAll("button").forEach((button) => {
          button.disabled = true;
        });
        setStatus("Bearbeiten und Speichern benötigt den Klick-&-Start-Server.", "error");
        log(1, "Data Studio im statischen Lesemodus gestartet.");
        return;
      }

      try {
        await refresh({ keepSelection: false });
        setStatus("Data Studio bereit.", "success");
        log(1, "Data Studio aktiviert.", { revision: state.snapshot.revision });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Fehler: ${message}`, "error");
        log(1, "Data Studio konnte Daten nicht laden.", { message });
      }
    },
    async deactivate() {
      removeUi();
      log(2, "Data Studio deaktiviert.");
    },
    async dispose() {
      removeUi();
    },
  });
})();
