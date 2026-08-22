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
    {
      id: "data-studio-pro",
      name: "Data Studio PRO",
      version: "0.4.2",
      apiVersion: "1",
      entry: "modules/data-studio-pro/index.js",
      enabledByDefault: true,
      description: "Suche, Filter, Kategorien, Vorlagenbibliothek, Vorlagenexport und gespeicherte Ansichten.",
      slots: ["details"],
      capabilities: ["record-search", "template-library", "categories", "template-export", "saved-views"],
    },
    {
      id: "data-studio-pro-bridge",
      name: "Data Studio PRO Bridge",
      version: "0.4.2",
      apiVersion: "1",
      entry: "modules/data-studio-pro-bridge/index.js",
      enabledByDefault: true,
      description: "Kleine entkoppelte Navigationsbrücke zwischen PRO-Recherche und dem stabilen CRUD-Editor.",
      slots: [],
      capabilities: ["data-studio-navigation"],
    },
    {
      id: "data-recovery",
      name: "Project Recovery",
      version: "0.4.3",
      apiVersion: "1",
      entry: "modules/data-recovery/index.js",
      enabledByDefault: true,
      description: "Legacy-.pwbak-Recovery plus versionierter Multi-Datei-Recovery-Envelope für Project Data und Data Studio PRO.",
      slots: ["details"],
      capabilities: [
        "backup",
        "restore-preview",
        "export-import",
        "migration-contract",
        "recovery-envelope",
        "multi-file-rollback",
        "recovery-journal",
      ],
    },
  ];

  Object.defineProperty(window, "PROVOWARE_MODULE_CATALOG", {
    value: Object.freeze(catalog),
    writable: false,
    configurable: false,
    enumerable: true,
  });
})();
