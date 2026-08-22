(() => {
  "use strict";

  const catalog = [
    {
      id: "development-notes",
      name: "Entwicklungsnotizen",
      version: "0.4.0",
      apiVersion: "1",
      entry: "modules/development-notes/index.js",
      enabledByDefault: true,
      description: "Zeitgestempelte Schnellnotizen direkt in die feste Projekttextdatei.",
      slots: ["quickbar"],
      capabilities: ["project-file-write", "timestamped-append"],
    },
    {
      id: "data-studio",
      name: "Project Data Studio",
      version: "0.4.0",
      apiVersion: "1",
      entry: "modules/data-studio/index.js",
      enabledByDefault: true,
      description: "Zentrale lokale Projektdaten, editierbare Datensätze und flexible Eingabemasken als Vorlagen.",
      slots: ["details"],
      capabilities: ["project-data-store", "template-builder", "record-editor"],
    },
  ];

  Object.defineProperty(window, "PROVOWARE_MODULE_CATALOG", {
    value: Object.freeze(catalog),
    writable: false,
    configurable: false,
    enumerable: true,
  });
})();
