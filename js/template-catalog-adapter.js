(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const core = namespace.templateProfilesCore;
  if (!core) throw new Error("Der Vorlagenkern fehlt vor dem Katalogadapter.");
  const fallback = core.usableBuiltinCatalog;

  core.usableBuiltinCatalog = function (appState) {
    const templates = Array.isArray(namespace.templateBuiltinTemplates)
      ? structuredClone(namespace.templateBuiltinTemplates)
      : [];
    if (templates.length) {
      const catalog = { catalogVersion: "2.0.0", profileSchemaVersion: "1.0.0", templates };
      if (core.validateCatalog(catalog, appState).valid) return catalog;
    }
    return fallback(appState);
  };
})();
