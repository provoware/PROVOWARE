(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const elements = {};
  let selectedSnapshot = null;
  let lastFocusedElement = null;

  const reasonLabels = Object.freeze({
    autosave: "Automatische Sicherung",
    "initial-state": "Erster Projektstand",
    "manual-snapshot": "Manueller Sicherheitsstand",
    "manual-recovery": "Manuelle Wiederherstellung",
    "automatic-recovery": "Automatische Wiederherstellung",
    "browser-smoke": "Browser-Prüfung"
  });

  function cacheElements() {
    const ids = [
      "storage-manager-button", "storage-dialog", "storage-close-button", "storage-refresh-button",
      "storage-create-button", "retention-limit", "retention-save-button", "snapshot-count",
      "storage-revision", "storage-recovery-count", "snapshot-list", "snapshot-preview-empty",
      "snapshot-preview", "snapshot-preview-title", "snapshot-preview-meta", "snapshot-preview-status",
      "snapshot-preview-json", "snapshot-confirm", "snapshot-restore-button", "storage-manager-status"
    ];
    for (const id of ids) elements[id] = document.getElementById(id);
  }

  function formatDate(value) {
    if (!value) return "Zeitpunkt unbekannt";
    try {
      return new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value));
    } catch (_error) {
      return value;
    }
  }

  function reasonLabel(reason) {
    return reasonLabels[reason] || reason || "Speichergrund unbekannt";
  }

  function setStatus(message, kind = "info") {
    elements["storage-manager-status"].textContent = message;
    elements["storage-manager-status"].dataset.kind = kind;
  }

  function statusText(snapshot) {
    if (snapshot.valid) return snapshot.isSafetySnapshot ? "Gültiger Sicherheitsstand" : "Gültig";
    if (!snapshot.checksumValid) return "Prüfsumme fehlerhaft";
    return "Schema oder Antworten ungültig";
  }

  function makeMetaLine(label, value) {
    const wrapper = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    wrapper.append(strong, document.createTextNode(String(value)));
    return wrapper;
  }

  function renderPreview(snapshot) {
    selectedSnapshot = snapshot;
    elements["snapshot-preview-empty"].hidden = true;
    elements["snapshot-preview"].hidden = false;
    elements["snapshot-preview-title"].textContent = `Revision ${snapshot.revision}`;
    elements["snapshot-preview-meta"].replaceChildren(
      makeMetaLine("Zeitpunkt", formatDate(snapshot.savedAt)),
      makeMetaLine("Grund", reasonLabel(snapshot.reason)),
      makeMetaLine("Frage", snapshot.payload.currentQuestionId || "keine"),
      makeMetaLine("Antworten", Object.keys(snapshot.payload.answers || {}).length),
      makeMetaLine("Theme", snapshot.payload.theme || "unbekannt")
    );
    elements["snapshot-preview-status"].textContent = statusText(snapshot);
    elements["snapshot-preview-status"].className = `badge ${snapshot.valid ? "badge-success" : "badge-danger"}`;
    elements["snapshot-preview-json"].textContent = JSON.stringify(snapshot.payload, null, 2);
    elements["snapshot-confirm"].checked = false;
    elements["snapshot-confirm"].disabled = !snapshot.valid;
    elements["snapshot-restore-button"].disabled = true;
    elements["snapshot-confirm"].focus();
  }

  function renderSnapshotList(snapshots) {
    elements["snapshot-list"].replaceChildren();
    if (!snapshots.length) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "Noch keine Snapshots vorhanden.";
      elements["snapshot-list"].append(empty);
      return;
    }

    for (const snapshot of snapshots) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "snapshot-item";
      button.dataset.snapshotId = snapshot.snapshotId;
      button.setAttribute("aria-pressed", String(selectedSnapshot?.snapshotId === snapshot.snapshotId));

      const heading = document.createElement("span");
      heading.className = "snapshot-item-heading";
      const title = document.createElement("strong");
      title.textContent = `Revision ${snapshot.revision}`;
      const badge = document.createElement("span");
      badge.className = `badge ${snapshot.valid ? "badge-success" : "badge-danger"}`;
      badge.textContent = snapshot.isSafetySnapshot ? "Sicherheitsstand" : snapshot.valid ? "Gültig" : "Fehlerhaft";
      heading.append(title, badge);

      const meta = document.createElement("span");
      meta.className = "snapshot-item-meta";
      meta.textContent = `${formatDate(snapshot.savedAt)} · ${reasonLabel(snapshot.reason)}`;
      button.append(heading, meta);
      button.addEventListener("click", () => {
        document.querySelectorAll(".snapshot-item").forEach(entry => entry.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        renderPreview(snapshot);
      });
      item.append(button);
      elements["snapshot-list"].append(item);
    }
  }

  function clearPreview() {
    selectedSnapshot = null;
    elements["snapshot-preview-empty"].hidden = false;
    elements["snapshot-preview"].hidden = true;
    elements["snapshot-confirm"].checked = false;
    elements["snapshot-restore-button"].disabled = true;
  }

  function renderOverview(overview) {
    const diagnostics = overview.diagnostics || {};
    elements["snapshot-count"].textContent = String(overview.snapshots.length);
    elements["storage-revision"].textContent = String(diagnostics.project?.revision || 0);
    elements["storage-recovery-count"].textContent = String(diagnostics.recoveryCount || 0);
    elements["retention-limit"].value = String(overview.retentionLimit);
    renderSnapshotList(overview.snapshots);
    if (selectedSnapshot) {
      const refreshed = overview.snapshots.find(snapshot => snapshot.snapshotId === selectedSnapshot.snapshotId);
      if (refreshed) renderPreview(refreshed);
      else clearPreview();
    }
  }

  async function refresh(message = "Speicherstände aktualisiert.") {
    setStatus("Speicherstände werden geprüft …");
    try {
      const overview = await namespace.persistence.getStorageOverview();
      renderOverview(overview);
      setStatus(message, "success");
      return overview;
    } catch (error) {
      console.error(error);
      setStatus(`Speicherstände konnten nicht geladen werden: ${error.message}`, "error");
      return null;
    }
  }

  async function createSnapshot() {
    elements["storage-create-button"].disabled = true;
    setStatus("Manueller Sicherheitsstand wird angelegt …");
    try {
      const result = await namespace.persistence.createSnapshot();
      await refresh(`Manueller Sicherheitsstand als Revision ${result.revision} angelegt.`);
    } catch (error) {
      console.error(error);
      setStatus(`Sicherheitsstand konnte nicht angelegt werden: ${error.message}`, "error");
    } finally {
      elements["storage-create-button"].disabled = false;
    }
  }

  async function saveRetention() {
    elements["retention-save-button"].disabled = true;
    setStatus("Aufbewahrungsgrenze wird geprüft und angewendet …");
    try {
      const result = await namespace.persistence.setRetention(elements["retention-limit"].value);
      await refresh(`Aufbewahrung auf ${result.limit} Snapshots gesetzt. ${result.deleted} ältere Stände entfernt.`);
    } catch (error) {
      console.error(error);
      setStatus(`Aufbewahrung konnte nicht geändert werden: ${error.message}`, "error");
    } finally {
      elements["retention-save-button"].disabled = false;
    }
  }

  async function restoreSelected() {
    if (!selectedSnapshot?.valid || !elements["snapshot-confirm"].checked) return;
    elements["snapshot-restore-button"].disabled = true;
    setStatus(`Revision ${selectedSnapshot.revision} wird kontrolliert wiederhergestellt …`);
    try {
      const result = await namespace.persistence.restoreSnapshot(selectedSnapshot.snapshotId);
      clearPreview();
      await refresh(`Revision ${result.restoredRevision} wurde als neue Revision ${result.revision} wiederhergestellt.`);
    } catch (error) {
      console.error(error);
      setStatus(`Wiederherstellung abgebrochen: ${error.message}`, "error");
      elements["snapshot-restore-button"].disabled = false;
    }
  }

  async function openManager() {
    lastFocusedElement = document.activeElement;
    clearPreview();
    elements["storage-dialog"].showModal();
    await refresh();
    elements["storage-refresh-button"].focus();
  }

  function closeManager() {
    elements["storage-dialog"].close();
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  function initialize() {
    cacheElements();
    elements["storage-manager-button"].addEventListener("click", openManager);
    elements["storage-close-button"].addEventListener("click", closeManager);
    elements["storage-refresh-button"].addEventListener("click", () => refresh());
    elements["storage-create-button"].addEventListener("click", createSnapshot);
    elements["retention-save-button"].addEventListener("click", saveRetention);
    elements["snapshot-confirm"].addEventListener("change", () => {
      elements["snapshot-restore-button"].disabled = !selectedSnapshot?.valid || !elements["snapshot-confirm"].checked;
    });
    elements["snapshot-restore-button"].addEventListener("click", restoreSelected);
    elements["storage-dialog"].addEventListener("cancel", event => {
      event.preventDefault();
      closeManager();
    });
    elements["storage-dialog"].addEventListener("click", event => {
      if (event.target === elements["storage-dialog"]) closeManager();
    });
  }

  namespace.storageManager = { initialize, open: openManager, refresh, renderOverview };
})();
