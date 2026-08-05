(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const current = document.currentScript;
  const base = current?.src ? new URL(".", current.src) : new URL("js/", location.href);
  const DATA_MODULES = [
    "../data/template-profiles/offline-html.js",
    "../data/template-profiles/linux-desktop.js",
    "../data/template-profiles/media-processing.js",
    "../data/template-profiles/file-organization.js",
    "../data/template-profiles/songwriting-audio.js",
    "../data/template-profiles/mobile-pwa.js"
  ];

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
      for (const [index, modulePath] of DATA_MODULES.entries()) await load(modulePath, `catalog-${index + 1}`);
      await load("template-core.js", "core");
      await load("template-catalog-adapter.js", "catalog-adapter");
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
