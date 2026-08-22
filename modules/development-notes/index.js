(() => {
  "use strict";

  const MODULE_ID = "development-notes";
  const API_URL = "/api/provoware/development-notes";
  const FILE_URL = "data/ENTWICKLUNGSNOTIZEN.txt";
  let root = null;
  let submitHandler = null;

  const log = (level, message, data) => {
    window.PROVOWARE_DEBUG?.log(level, "DEV-NOTES", message, data);
  };

  const setStatus = (element, message, tone = "info") => {
    element.textContent = message;
    element.dataset.tone = tone;
  };

  const saveNote = async (input, status, button) => {
    const text = input.value.trim();
    if (!text) {
      setStatus(status, "Notiz fehlt.", "error");
      input.focus();
      return;
    }

    if (window.location.protocol === "file:") {
      setStatus(status, "Speichern benötigt den Klick-&-Start-Server.", "error");
      return;
    }

    button.disabled = true;
    setStatus(status, "Speichere …");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || `Speichern fehlgeschlagen (${response.status}).`);
      }

      input.value = "";
      setStatus(status, `${payload.result.timestamp} gespeichert.`, "success");
      log(1, "Entwicklungsnotiz gespeichert.", { timestamp: payload.result.timestamp });
      input.focus();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(status, `Fehler: ${message}`, "error");
      log(1, "Entwicklungsnotiz konnte nicht gespeichert werden.", { message });
    } finally {
      button.disabled = false;
    }
  };

  const createUi = () => {
    const quickbar = document.querySelector("#quickbar");
    if (!quickbar) throw new Error("Schnellstarterleiste #quickbar fehlt.");

    const form = document.createElement("form");
    form.className = "development-note-bar";
    form.setAttribute("aria-label", "Entwicklungsnotiz schnell speichern");

    const label = document.createElement("label");
    label.className = "sr-only";
    label.htmlFor = "development-note-input";
    label.textContent = "Entwicklungsnotiz";

    const input = document.createElement("input");
    input.id = "development-note-input";
    input.className = "development-note-input";
    input.type = "text";
    input.maxLength = 1000;
    input.autocomplete = "off";
    input.placeholder = "Entwicklungsnotiz … Enter = speichern";

    const button = document.createElement("button");
    button.className = "development-note-save";
    button.type = "submit";
    button.textContent = "Speichern";

    const openLink = document.createElement("a");
    openLink.className = "development-note-open";
    openLink.href = FILE_URL;
    openLink.target = "_blank";
    openLink.rel = "noopener";
    openLink.textContent = "Datei öffnen";

    const status = document.createElement("span");
    status.className = "development-note-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    if (window.location.protocol === "file:") {
      button.disabled = true;
      setStatus(status, "Schreiben: Klick-&-Start nötig.");
    } else {
      setStatus(status, "Bereit.", "success");
    }

    submitHandler = (event) => {
      event.preventDefault();
      void saveNote(input, status, button);
    };
    form.addEventListener("submit", submitHandler);
    form.append(label, input, button, openLink, status);

    const before = quickbar.querySelector(".quickbar-scroll") || quickbar.querySelector("#layout-menu");
    quickbar.insertBefore(form, before || null);
    return form;
  };

  const removeUi = () => {
    if (root && submitHandler) root.removeEventListener("submit", submitHandler);
    root?.remove();
    root = null;
    submitHandler = null;
  };

  window.PROVOWARE_MODULES.define(MODULE_ID, {
    async activate() {
      if (!root) root = createUi();
      log(1, "Schnellnotizmodul aktiviert.");
    },
    async deactivate() {
      removeUi();
      log(2, "Schnellnotizmodul deaktiviert.");
    },
    async dispose() {
      removeUi();
    },
  });
})();
