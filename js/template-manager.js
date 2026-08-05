(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const current = document.currentScript;
  const base = current?.src ? new URL(".", current.src) : new URL("js/", location.href);

  function load(relativePath, marker) {
    if (document.querySelector(`script[data-template-part="${marker}"]`)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(relativePath, base).href;
      script.async = false;
      script.dataset.templatePart = marker;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", () => reject(new Error(`${relativePath} konnte nicht geladen werden.`)), { once: true });
      document.head.append(script);
    });
  }

  async function start() {
    try {
      await load("template-core.js", "core");
      await load("template-ui.js", "ui");
      namespace.templateProfilesUi.boot();
    } catch (error) {
      console.error("Vorlagenverwaltung konnte nicht gestartet werden.", error);
      const live = document.getElementById("live-status");
      if (live) live.textContent = `Vorlagenverwaltung nicht verfügbar: ${error.message}`;
    }
  }

  start();
})();
