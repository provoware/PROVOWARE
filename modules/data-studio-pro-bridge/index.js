(() => {
  "use strict";

  const MODULE_ID = "data-studio-pro-bridge";
  let listenersAbort = null;

  const log = (level, message, data) => {
    window.PROVOWARE_DEBUG?.log(level, "DATA-STUDIO-PRO", message, data);
  };

  const baseStudio = () => document.querySelector(".data-studio:not(.data-studio-pro)");

  const openTemplate = (templateId) => {
    const root = baseStudio();
    const select = root?.querySelector("[data-template-select]");
    if (!root || !select) throw new Error("Project Data Studio ist nicht aktiv.");
    const exists = [...select.options].some((option) => option.value === templateId);
    if (!exists) throw new Error("Vorlage ist im Project Data Studio nicht verfügbar.");
    select.value = templateId;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openRecord = (recordId, templateId) => {
    openTemplate(templateId);
    window.requestAnimationFrame(() => {
      const root = baseStudio();
      const button = [...(root?.querySelectorAll("button[data-action='edit-record']") || [])]
        .find((item) => item.dataset.recordId === recordId);
      if (!button) {
        log(1, "Datensatz konnte nach Navigation nicht geöffnet werden.", { recordId, templateId });
        return;
      }
      button.click();
    });
  };

  const bind = () => {
    listenersAbort = new AbortController();
    const signal = listenersAbort.signal;

    window.addEventListener("provoware:data-studio-open-template", (event) => {
      try {
        openTemplate(event.detail?.templateId);
      } catch (error) {
        log(1, "PRO-Vorlagennavigation fehlgeschlagen.", { message: error.message });
      }
    }, { signal });

    window.addEventListener("provoware:data-studio-open-record", (event) => {
      try {
        openRecord(event.detail?.recordId, event.detail?.templateId);
      } catch (error) {
        log(1, "PRO-Datensatznavigation fehlgeschlagen.", { message: error.message });
      }
    }, { signal });
  };

  const unbind = () => {
    listenersAbort?.abort();
    listenersAbort = null;
  };

  window.PROVOWARE_MODULES.define(MODULE_ID, {
    async activate() {
      if (!listenersAbort) bind();
      log(2, "Data-Studio-PRO-Navigationsbrücke aktiviert.");
    },
    async deactivate() {
      unbind();
      log(2, "Data-Studio-PRO-Navigationsbrücke deaktiviert.");
    },
    async dispose() {
      unbind();
    },
  });
})();
