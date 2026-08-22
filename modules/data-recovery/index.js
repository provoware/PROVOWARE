(() => {
  "use strict";

  const MODULE_ID = "data-recovery";
  const API_ROOT = "/api/provoware/project-data/recovery";

  let root = null;
  let listenersAbort = null;
  const state = {
    backups: [],
    pendingRestore: null,
    pendingImport: null,
  };

  const log = (level, message, data) => {
    window.PROVOWARE_DEBUG?.log(level, "DATA-RECOVERY", message, data);
  };

  const query = (selector) => root?.querySelector(selector) || null;

  const setStatus = (message, tone = "info") => {
    const status = query("[data-recovery-status]");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const api = async (method, path = "", body) => {
    if (window.location.protocol === "file:") {
      throw new Error("Recovery benötigt den lokalen Klick-&-Start-Server.");
    }
    const options = { method, headers: {} };
    if (body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_ROOT}${path}`, options);
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || `Recovery-API fehlgeschlagen (${response.status}).`);
    }
    return payload;
  };

  const summaryText = (summary) => {
    if (!summary) return "keine gültige Datenzusammenfassung";
    return `Schema ${summary.schemaVersion} · Revision ${summary.revision} · ${summary.templates} Vorlagen · ${summary.records} Datensätze`;
  };

  const renderPendingRestore = () => {
    const box = query("[data-restore-preview]");
    const confirmButton = query("[data-action='confirm-restore']");
    if (!box || !confirmButton) return;
    if (!state.pendingRestore) {
      box.textContent = "Noch kein Backup zur Wiederherstellung vorgemerkt.";
      confirmButton.disabled = true;
      return;
    }
    box.textContent = `${state.pendingRestore.backupId} · ${summaryText(state.pendingRestore.summary)} · SHA-256 ${state.pendingRestore.sha256.slice(0, 16)}…`;
    confirmButton.disabled = false;
  };

  const renderPendingImport = () => {
    const box = query("[data-import-preview]");
    const confirmButton = query("[data-action='confirm-import']");
    if (!box || !confirmButton) return;
    if (!state.pendingImport) {
      box.textContent = "Noch keine Importdatei geprüft.";
      confirmButton.disabled = true;
      return;
    }
    const plan = state.pendingImport.preview.migrationPlan.length
      ? state.pendingImport.preview.migrationPlan.map((step) => `${step.from}→${step.to}`).join(", ")
      : "keine Migration nötig";
    box.textContent = `${summaryText(state.pendingImport.preview.summary)} · ${plan} · SHA-256 ${state.pendingImport.preview.sha256.slice(0, 16)}…`;
    confirmButton.disabled = false;
  };

  const renderBackups = () => {
    const list = query("[data-backup-list]");
    if (!list) return;
    list.replaceChildren();

    if (!state.backups.length) {
      const empty = document.createElement("p");
      empty.className = "data-studio-empty";
      empty.textContent = "Noch keine Recovery-Backups vorhanden.";
      list.append(empty);
      return;
    }

    state.backups.forEach((backup) => {
      const item = document.createElement("article");
      item.className = "data-studio-record-item";

      const text = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = backup.id;
      const meta = document.createElement("small");
      meta.textContent = backup.valid
        ? `${summaryText(backup.summary)} · ${Math.ceil(backup.bytes / 1024)} KiB`
        : `UNGÜLTIG · ${backup.error || "Backup konnte nicht validiert werden"}`;
      text.append(title, meta);

      const actions = document.createElement("div");
      actions.className = "data-studio-record-actions";
      const preview = document.createElement("button");
      preview.type = "button";
      preview.dataset.action = "preview-restore";
      preview.dataset.backupId = backup.id;
      preview.textContent = "Vorschau";
      preview.disabled = !backup.valid;
      actions.append(preview);

      item.append(text, actions);
      list.append(item);
    });
  };

  const refreshBackups = async () => {
    const payload = await api("GET", "/backups");
    state.backups = payload.backups;
    renderBackups();
  };

  const createBackup = async () => {
    setStatus("Backup wird erstellt …");
    const payload = await api("POST", "/backups", {});
    await refreshBackups();
    setStatus(`Backup erstellt: ${payload.backup.id}`, "success");
    log(1, "Backup erstellt.", { id: payload.backup.id });
  };

  const previewRestore = async (backupId) => {
    const payload = await api("POST", "/preview-backup", { backupId });
    state.pendingRestore = payload.preview;
    renderPendingRestore();
    setStatus("Restore-Vorschau geprüft. Noch wurde nichts ersetzt.", "success");
  };

  const confirmRestore = async () => {
    if (!state.pendingRestore) throw new Error("Keine Restore-Vorschau vorhanden.");
    const confirmed = window.confirm(
      "Diesen Backup-Stand wiederherstellen? Der aktuelle Bestand wird vorher automatisch gesichert.",
    );
    if (!confirmed) return;
    setStatus("Restore wird atomar ausgeführt …");
    const payload = await api("POST", "/restore", {
      backupId: state.pendingRestore.backupId,
      expectedSha256: state.pendingRestore.sha256,
    });
    state.pendingRestore = null;
    renderPendingRestore();
    await refreshBackups();
    setStatus(`Restore abgeschlossen. Sicherheitsbackup: ${payload.result.safetyBackup.id}`, "success");
    log(1, "Backup wiederhergestellt.", payload.result);
  };

  const exportSnapshot = async () => {
    setStatus("Export wird validiert …");
    const payload = await api("GET", "/export");
    const blob = new Blob([`${JSON.stringify(payload.export.data, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = payload.export.filename;
      document.body.append(link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
    setStatus(`Export bereit: ${payload.export.filename}`, "success");
    log(1, "Project-Data exportiert.", { filename: payload.export.filename });
  };

  const previewImportFile = async (file) => {
    if (!file) return;
    const source = await file.text();
    let data;
    try {
      data = JSON.parse(source);
    } catch {
      throw new Error("Importdatei enthält kein gültiges JSON.");
    }
    setStatus("Import wird serverseitig geprüft …");
    const payload = await api("POST", "/preview-import", { data });
    state.pendingImport = { data, preview: payload.preview, filename: file.name };
    renderPendingImport();
    setStatus(`Import-Vorschau für ${file.name} ist gültig. Noch wurde nichts ersetzt.`, "success");
  };

  const confirmImport = async () => {
    if (!state.pendingImport) throw new Error("Keine Import-Vorschau vorhanden.");
    const confirmed = window.confirm(
      `Import '${state.pendingImport.filename}' ausführen? Der aktuelle Bestand wird vorher automatisch gesichert.`,
    );
    if (!confirmed) return;
    setStatus("Import wird atomar ausgeführt …");
    const payload = await api("POST", "/import", {
      data: state.pendingImport.data,
      expectedSha256: state.pendingImport.preview.sha256,
    });
    state.pendingImport = null;
    const fileInput = query("[data-import-file]");
    if (fileInput) fileInput.value = "";
    renderPendingImport();
    await refreshBackups();
    setStatus(`Import abgeschlossen. Sicherheitsbackup: ${payload.result.safetyBackup.id}`, "success");
    log(1, "Project-Data importiert.", payload.result);
  };

  const handleClick = (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || !root?.contains(button)) return;
    const action = button.dataset.action;

    const run = async () => {
      if (action === "create-backup") await createBackup();
      else if (action === "refresh-backups") {
        await refreshBackups();
        setStatus("Backup-Liste aktualisiert.", "success");
      } else if (action === "preview-restore") await previewRestore(button.dataset.backupId);
      else if (action === "confirm-restore") await confirmRestore();
      else if (action === "export") await exportSnapshot();
      else if (action === "confirm-import") await confirmImport();
    };

    void run().catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Fehler: ${message}`, "error");
      log(1, "Recovery-Aktion fehlgeschlagen.", { action, message });
    });
  };

  const handleChange = (event) => {
    if (!event.target.matches("[data-import-file]")) return;
    const file = event.target.files?.[0] || null;
    void previewImportFile(file).catch((error) => {
      state.pendingImport = null;
      renderPendingImport();
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Fehler: ${message}`, "error");
      log(1, "Import-Vorschau fehlgeschlagen.", { message });
    });
  };

  const createUi = () => {
    const host = document.querySelector("#details");
    if (!host) throw new Error("Detailbereich #details fehlt.");

    const section = document.createElement("div");
    section.className = "data-studio data-recovery";
    section.innerHTML = `
      <div class="data-studio-toolbar">
        <div>
          <p class="data-studio-kicker">Recovery &amp; Migration · 0.4.1</p>
          <h3>Backup, Restore, Export &amp; Import</h3>
        </div>
        <div class="data-studio-toolbar-actions">
          <button type="button" data-action="refresh-backups">Neu laden</button>
          <button type="button" class="data-studio-primary" data-action="create-backup">Backup jetzt</button>
        </div>
      </div>
      <p class="data-studio-status" data-recovery-status role="status" aria-live="polite">Initialisierung …</p>
      <div class="data-studio-grid">
        <section class="data-studio-card" aria-labelledby="recovery-backup-title">
          <div class="data-studio-card-header">
            <h4 id="recovery-backup-title">Backups</h4>
          </div>
          <div class="data-studio-record-list" data-backup-list></div>
          <h4>Restore-Vorschau</h4>
          <p class="data-studio-empty" data-restore-preview>Noch kein Backup zur Wiederherstellung vorgemerkt.</p>
          <button type="button" class="data-studio-primary" data-action="confirm-restore" disabled>Vorschau wiederherstellen</button>
        </section>
        <section class="data-studio-card" aria-labelledby="recovery-transfer-title">
          <div class="data-studio-card-header">
            <h4 id="recovery-transfer-title">Export / Import</h4>
            <button type="button" data-action="export">JSON exportieren</button>
          </div>
          <label>Importdatei
            <input type="file" accept="application/json,.json" data-import-file>
          </label>
          <h4>Import-Vorschau</h4>
          <p class="data-studio-empty" data-import-preview>Noch keine Importdatei geprüft.</p>
          <button type="button" class="data-studio-primary" data-action="confirm-import" disabled>Geprüften Import ausführen</button>
          <p class="data-studio-empty">Vor Restore und Import wird der aktuelle Rohzustand automatisch gesichert. Produktionsschema bleibt v1.</p>
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
  };

  const removeUi = () => {
    listenersAbort?.abort();
    listenersAbort = null;
    root?.remove();
    root = null;
    state.backups = [];
    state.pendingRestore = null;
    state.pendingImport = null;
  };

  window.PROVOWARE_MODULES.define(MODULE_ID, {
    async activate() {
      if (!root) {
        root = createUi();
        bindEvents();
      }
      renderPendingRestore();
      renderPendingImport();

      if (window.location.protocol === "file:") {
        root.dataset.serverRequired = "true";
        root.querySelectorAll("button, input").forEach((control) => {
          control.disabled = true;
        });
        setStatus("Recovery benötigt den lokalen Klick-&-Start-Server.", "error");
        log(1, "Recovery-Modul im statischen Lesemodus gestartet.");
        return;
      }

      try {
        await refreshBackups();
        setStatus("Recovery & Migration bereit.", "success");
        log(1, "Recovery-Modul aktiviert.", { backupCount: state.backups.length });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Fehler: ${message}`, "error");
        log(1, "Recovery-Modul konnte nicht initialisiert werden.", { message });
      }
    },
    async deactivate() {
      removeUi();
      log(2, "Recovery-Modul deaktiviert.");
    },
    async dispose() {
      removeUi();
    },
  });
})();
