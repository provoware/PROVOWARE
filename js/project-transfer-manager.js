(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const elements = {};
  let preview = null;
  let lastFocusedElement = null;

  const IDS = [
    "project-transfer-button", "transfer-dialog", "transfer-close-button", "transfer-export-button",
    "transfer-file", "transfer-reset-button", "transfer-preview", "transfer-empty",
    "transfer-package-version", "transfer-checksum-status", "transfer-schema-status", "transfer-project-id",
    "transfer-existing-status", "transfer-conflict-count", "transfer-error-list", "transfer-change-list",
    "transfer-mode", "transfer-mode-help", "transfer-replace-confirmation", "transfer-replace-name",
    "transfer-replace-checkbox", "transfer-apply-button", "transfer-status", "transfer-audit-result"
  ];

  function cacheElements() {
    for (const id of IDS) elements[id] = document.getElementById(id);
  }

  function installSecurityGuard() {
    const original = namespace.persistence?.applyImport;
    if (typeof original !== "function" || original.__provowareGuarded) return;
    const guarded = async function (candidatePreview, mode) {
      if (!candidatePreview?.valid || !candidatePreview.checksumValid || candidatePreview.errors?.length) {
        throw new Error("Der Import wurde nicht durch eine fehlerfreie Sicherheitsvorschau freigegeben.");
      }
      if (!candidatePreview.allowedModes?.includes(mode)) {
        throw new Error("Die gewählte Importart ist für diesen Projektstand nicht freigegeben.");
      }
      if (mode === "replace") {
        if (candidatePreview.existingProject?.lifecycle?.state !== "active") {
          throw new Error("Nur ein aktives Projekt darf ersetzt werden.");
        }
        const current = await namespace.projectRepository.getProjectRecord(candidatePreview.payload.projectId);
        if (!current || current.summary.revision !== candidatePreview.existingProject.revision) {
          throw new Error("Das lokale Projekt wurde seit der Vorschau verändert. Erzeuge vor dem Ersetzen eine neue Importvorschau.");
        }
        if (elements["transfer-replace-checkbox"]?.checked !== true) {
          throw new Error("Die separate Bestätigung für das Ersetzen fehlt.");
        }
        if (elements["transfer-replace-name"]?.value !== candidatePreview.existingProject?.name) {
          throw new Error("Der eingegebene Projektname stimmt nicht exakt mit dem vorhandenen Projekt überein.");
        }
      }
      let preparedPreview = candidatePreview;
      if (mode === "new" && candidatePreview.suggestedNewName) {
        preparedPreview = structuredClone(candidatePreview);
        preparedPreview.payload.name = candidatePreview.suggestedNewName.replace(/ – Import$/, "");
      }
      return original(preparedPreview, mode);
    };
    Object.defineProperty(guarded, "__provowareGuarded", { value: true });
    namespace.persistence.applyImport = guarded;
  }

  function setStatus(message, kind = "info") {
    elements["transfer-status"].textContent = message;
    elements["transfer-status"].dataset.kind = kind;
  }

  function downloadPackage(packageData) {
    const content = namespace.projectTransfer.serializePackage(packageData);
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${namespace.projectTransfer.safeFilename(packageData.project.name)}-${packageData.project.projectId}.provoware-project.json`;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function exportCurrent() {
    setStatus("Aktueller Projektstand wird vor dem Export gespeichert und geprüft …");
    try {
      const packageData = await namespace.persistence.exportCurrentProject();
      downloadPackage(packageData);
      setStatus("Projektpaket wurde mit Prüfsumme lokal bereitgestellt.", "success");
    } catch (error) {
      console.error(error);
      setStatus(`Export fehlgeschlagen: ${error.message}`, "error");
    }
  }

  function resetPreview(message = "Wähle eine PROVOWARE-Projektdatei aus. Die Datei wird zunächst ausschließlich gelesen und geprüft.") {
    preview = null;
    elements["transfer-file"].value = "";
    elements["transfer-preview"].hidden = true;
    elements["transfer-empty"].hidden = false;
    elements["transfer-empty"].textContent = message;
    elements["transfer-mode"].replaceChildren(new Option("Zuerst Datei prüfen", ""));
    elements["transfer-mode"].disabled = true;
    elements["transfer-replace-confirmation"].hidden = true;
    elements["transfer-replace-name"].value = "";
    elements["transfer-replace-checkbox"].checked = false;
    elements["transfer-apply-button"].disabled = true;
  }

  function createListItem(text, kind = "neutral") {
    const item = document.createElement("li");
    item.textContent = text;
    item.dataset.kind = kind;
    return item;
  }

  function renderErrors() {
    elements["transfer-error-list"].replaceChildren();
    if (!preview.errors.length) {
      elements["transfer-error-list"].append(createListItem("Keine blockierenden Fehler erkannt.", "success"));
      return;
    }
    preview.errors.forEach(error => elements["transfer-error-list"].append(createListItem(error, "error")));
  }

  function renderChanges() {
    const list = elements["transfer-change-list"];
    list.replaceChildren();
    if (!preview.existingProject) {
      list.append(createListItem("Die importierte Projekt-ID existiert lokal noch nicht.", "success"));
    } else if (preview.comparison.identical) {
      list.append(createListItem("Lokaler und importierter Projektstand sind inhaltlich identisch.", "neutral"));
    } else {
      for (const field of preview.comparison.fields) {
        list.append(createListItem(`${field.key}: lokal „${String(field.current ?? "leer")}“, Import „${String(field.imported ?? "leer")}“.`, "warning"));
      }
      for (const answer of preview.comparison.answers.changed) {
        list.append(createListItem(`${answer.questionId}: lokal „${answer.currentLabel}“, Import „${answer.importedLabel}“.`, "warning"));
      }
      for (const answer of preview.comparison.answers.added) {
        list.append(createListItem(`${answer.questionId}: im Import zusätzlich „${answer.importedLabel || String(answer.importedValue)}“.`, "success"));
      }
      for (const answer of preview.comparison.answers.missing) {
        list.append(createListItem(`${answer.questionId}: nur lokal vorhanden „${answer.currentLabel}“.`, "warning"));
      }
    }
    if (!list.children.length) list.append(createListItem("Keine inhaltlichen Änderungen erkannt."));
  }

  function modeLabel(mode) {
    return {
      preserve: "Projekt-ID beibehalten",
      new: "Als unabhängiges neues Projekt importieren",
      replace: "Vorhandenes Projekt nach Sicherheitskopie ersetzen"
    }[mode] || mode;
  }

  function modeHelp(mode) {
    if (!preview) return "";
    if (mode === "preserve") return "Die Projekt-ID ist frei. Der Import wird als eigenständiges aktives Projekt mit Revision 1 gespeichert.";
    if (mode === "new") return `Eine neue Projekt-ID wird erzeugt. Das lokale Projekt bleibt unverändert. Neuer Name: „${preview.suggestedNewName}“.`;
    if (mode === "replace") return `Vor dem Ersetzen wird für „${preview.existingProject?.name || preview.payload?.name}“ eine ausdrückliche Vorher-Sicherung als neue Revision angelegt.`;
    return preview.recommendation?.reason || "Wähle eine sichere Importart.";
  }

  function renderModes() {
    const select = elements["transfer-mode"];
    select.replaceChildren();
    if (!preview.valid || !preview.allowedModes.length) {
      select.append(new Option(preview.comparison?.identical ? "Keine Übernahme erforderlich" : "Import blockiert", ""));
      select.disabled = true;
      updateApplyAvailability();
      return;
    }
    for (const mode of preview.allowedModes) select.append(new Option(modeLabel(mode), mode));
    const recommended = preview.recommendation?.mode;
    select.value = preview.allowedModes.includes(recommended) ? recommended : preview.allowedModes[0];
    select.disabled = false;
    updateModeDetails();
  }

  function updateModeDetails() {
    const mode = elements["transfer-mode"].value;
    elements["transfer-mode-help"].textContent = modeHelp(mode);
    elements["transfer-replace-confirmation"].hidden = mode !== "replace";
    if (mode !== "replace") {
      elements["transfer-replace-name"].value = "";
      elements["transfer-replace-checkbox"].checked = false;
    }
    updateApplyAvailability();
  }

  function updateApplyAvailability() {
    const mode = elements["transfer-mode"].value;
    let enabled = Boolean(preview?.valid && preview.allowedModes.includes(mode));
    if (mode === "replace") {
      enabled = enabled
        && elements["transfer-replace-name"].value === preview.existingProject?.name
        && elements["transfer-replace-checkbox"].checked;
    }
    elements["transfer-apply-button"].disabled = !enabled;
  }

  function renderPreview() {
    elements["transfer-empty"].hidden = true;
    elements["transfer-preview"].hidden = false;
    elements["transfer-package-version"].textContent = preview.packageSchemaVersion || "fehlt";
    elements["transfer-checksum-status"].textContent = preview.checksumValid ? "gültig" : "ungültig";
    elements["transfer-checksum-status"].className = `badge ${preview.checksumValid ? "badge-success" : "badge-danger"}`;
    elements["transfer-schema-status"].textContent = preview.migrationRequired
      ? `${preview.sourceSchemaVersion} → ${preview.targetSchemaVersion}`
      : String(preview.targetSchemaVersion || preview.sourceSchemaVersion || "unbekannt");
    elements["transfer-project-id"].textContent = preview.payload?.projectId || preview.source?.projectId || "unbekannt";
    elements["transfer-existing-status"].textContent = preview.existingProject
      ? `${preview.existingProject.name} · R${preview.existingProject.revision}`
      : "nicht vorhanden";
    elements["transfer-conflict-count"].textContent = String(preview.comparison?.conflictCount || 0);
    renderErrors();
    renderChanges();
    renderModes();
    setStatus(preview.valid ? preview.recommendation.reason : "Die Datei ist nicht sicher übernehmbar. Prüfe die angezeigten Fehler.", preview.valid ? "success" : "error");
  }

  async function inspectFile() {
    const file = elements["transfer-file"].files?.[0];
    if (!file) {
      resetPreview();
      return;
    }
    setStatus("Datei wird ausschließlich gelesen und vollständig vorgeprüft …");
    try {
      if (file.size > namespace.projectTransfer.MAX_IMPORT_BYTES) throw new Error("Die Datei ist größer als zwei MiB.");
      const packageData = namespace.projectTransfer.parseJsonText(await file.text());
      preview = await namespace.persistence.inspectImportPackage(packageData);
      renderPreview();
    } catch (error) {
      console.error(error);
      resetPreview(`Die Datei konnte nicht geprüft werden: ${error.message}`);
      setStatus(error.message, "error");
    }
  }

  async function applyImport() {
    const mode = elements["transfer-mode"].value;
    updateApplyAvailability();
    if (elements["transfer-apply-button"].disabled) return;
    elements["transfer-apply-button"].disabled = true;
    setStatus("Import wird nach erneuter Prüfung ausgeführt …");
    try {
      const result = await namespace.persistence.applyImport(preview, mode);
      setStatus(`Projekt „${result.payload.name}“ wurde sicher importiert und geöffnet.`, "success");
      closeManager();
    } catch (error) {
      console.error(error);
      setStatus(`Import fehlgeschlagen: ${error.message}`, "error");
      updateApplyAvailability();
    }
  }

  function runAudit() {
    const result = namespace.accessibility.audit(document);
    elements["transfer-audit-result"].textContent = result.passed
      ? `Barrierefreiheits-Grundprüfung: 0 Fehler, ${result.warnings.length} Hinweise.`
      : `Barrierefreiheits-Grundprüfung: ${result.errors.length} Fehler, ${result.warnings.length} Hinweise.`;
    elements["transfer-audit-result"].dataset.kind = result.passed ? "success" : "error";
    return result;
  }

  function openManager() {
    lastFocusedElement = document.activeElement;
    resetPreview();
    elements["transfer-dialog"].showModal();
    runAudit();
    elements["transfer-export-button"].focus();
  }

  function closeManager() {
    resetPreview();
    elements["transfer-dialog"].close();
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  function initialize() {
    cacheElements();
    installSecurityGuard();
    elements["project-transfer-button"].addEventListener("click", openManager);
    elements["transfer-close-button"].addEventListener("click", closeManager);
    elements["transfer-export-button"].addEventListener("click", exportCurrent);
    elements["transfer-file"].addEventListener("change", inspectFile);
    elements["transfer-reset-button"].addEventListener("click", () => resetPreview());
    elements["transfer-mode"].addEventListener("change", updateModeDetails);
    elements["transfer-replace-name"].addEventListener("input", updateApplyAvailability);
    elements["transfer-replace-checkbox"].addEventListener("change", updateApplyAvailability);
    elements["transfer-apply-button"].addEventListener("click", applyImport);
    elements["transfer-dialog"].addEventListener("cancel", event => {
      event.preventDefault();
      closeManager();
    });
    elements["transfer-dialog"].addEventListener("click", event => {
      if (event.target === elements["transfer-dialog"]) closeManager();
    });
  }

  namespace.projectTransferManager = { initialize, open: openManager, inspectFile, renderPreview, runAudit };
})();
