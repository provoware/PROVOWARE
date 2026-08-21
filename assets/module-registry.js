(() => {
  "use strict";

  const CONTRACT_VERSION = "1";
  const LOAD_TIMEOUT_MS = 15000;
  const ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
  const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

  const STATES = Object.freeze({
    REGISTERED: "registered",
    LOADING: "loading",
    LOADED: "loaded",
    ACTIVE: "active",
    INACTIVE: "inactive",
    ERROR: "error",
  });

  const records = new Map();
  let logger = () => {};
  let initialized = false;

  const log = (level, message, data) => {
    logger(level, "MODULES", message, data);
  };

  const uniqueStringArray = (value, field) => {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
      throw new TypeError(`${field} muss eine Liste nichtleerer Texte sein.`);
    }

    const normalized = value.map((item) => item.trim());
    if (new Set(normalized).size !== normalized.length) {
      throw new TypeError(`${field} darf keine doppelten Einträge enthalten.`);
    }
    return normalized;
  };

  const validateManifest = (manifest) => {
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
      throw new TypeError("Moduldefinition muss ein Objekt sein.");
    }

    const id = String(manifest.id || "");
    const name = String(manifest.name || "").trim();
    const version = String(manifest.version || "");
    const apiVersion = String(manifest.apiVersion || "");
    const entry = String(manifest.entry || "");

    if (!ID_PATTERN.test(id)) {
      throw new TypeError(`Ungültige Modul-ID: ${id || "<leer>"}.`);
    }
    if (!name || name.length > 80) {
      throw new TypeError(`Modul ${id}: name muss 1 bis 80 Zeichen enthalten.`);
    }
    if (!VERSION_PATTERN.test(version)) {
      throw new TypeError(`Modul ${id}: version muss MAJOR.MINOR.PATCH entsprechen.`);
    }
    if (apiVersion !== CONTRACT_VERSION) {
      throw new TypeError(`Modul ${id}: apiVersion muss ${CONTRACT_VERSION} sein.`);
    }
    if (typeof manifest.enabledByDefault !== "boolean") {
      throw new TypeError(`Modul ${id}: enabledByDefault muss true oder false sein.`);
    }
    if (
      !entry.startsWith(`modules/${id}/`) ||
      !entry.endsWith(".js") ||
      entry.includes("..") ||
      entry.includes(":") ||
      entry.startsWith("/")
    ) {
      throw new TypeError(`Modul ${id}: entry muss eine lokale JS-Datei unter modules/${id}/ sein.`);
    }
    if (manifest.description !== undefined && typeof manifest.description !== "string") {
      throw new TypeError(`Modul ${id}: description muss Text sein.`);
    }

    return Object.freeze({
      id,
      name,
      version,
      apiVersion,
      entry,
      enabledByDefault: manifest.enabledByDefault,
      description: String(manifest.description || "").trim(),
      slots: Object.freeze(uniqueStringArray(manifest.slots, `Modul ${id}: slots`)),
      capabilities: Object.freeze(
        uniqueStringArray(manifest.capabilities, `Modul ${id}: capabilities`),
      ),
    });
  };

  const getRecord = (id) => {
    const record = records.get(id);
    if (!record) throw new Error(`Unbekanntes Modul: ${id}.`);
    return record;
  };

  const snapshotRecord = (record) =>
    Object.freeze({
      id: record.manifest.id,
      name: record.manifest.name,
      version: record.manifest.version,
      state: record.state,
      error: record.error ? String(record.error.message || record.error) : null,
    });

  const getSnapshot = () => Object.freeze([...records.values()].map(snapshotRecord));

  const registerCatalog = (catalog) => {
    if (!Array.isArray(catalog)) {
      throw new TypeError("Modulkatalog muss eine Liste sein.");
    }

    catalog.forEach((rawManifest) => {
      const manifest = validateManifest(rawManifest);
      if (records.has(manifest.id)) {
        throw new Error(`Doppelte Modul-ID im Katalog: ${manifest.id}.`);
      }

      records.set(manifest.id, {
        manifest,
        state: STATES.REGISTERED,
        implementation: null,
        scriptNode: null,
        loadPromise: null,
        error: null,
      });
    });
  };

  const define = (id, implementation) => {
    const record = getRecord(id);

    if (record.state !== STATES.LOADING) {
      throw new Error(`Modul ${id} darf sich nur während des Ladens definieren.`);
    }
    if (record.implementation) {
      throw new Error(`Modul ${id} hat sich während desselben Ladevorgangs bereits definiert.`);
    }
    if (!implementation || typeof implementation !== "object") {
      throw new TypeError(`Modul ${id}: Implementation muss ein Objekt sein.`);
    }

    ["activate", "deactivate", "dispose"].forEach((method) => {
      if (typeof implementation[method] !== "function") {
        throw new TypeError(`Modul ${id}: Methode ${method}() fehlt.`);
      }
    });

    record.implementation = Object.freeze({
      activate: implementation.activate,
      deactivate: implementation.deactivate,
      dispose: implementation.dispose,
    });
  };

  const load = async (id) => {
    const record = getRecord(id);

    if ([STATES.LOADED, STATES.ACTIVE, STATES.INACTIVE].includes(record.state)) {
      return snapshotRecord(record);
    }
    if (record.state === STATES.ERROR && record.implementation) {
      return snapshotRecord(record);
    }
    if (record.state === STATES.LOADING && record.loadPromise) {
      return record.loadPromise;
    }

    record.state = STATES.LOADING;
    record.error = null;
    log(2, `Lade Modul ${id}.`, { entry: record.manifest.entry });

    record.loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      let settled = false;
      let timeout = 0;

      const failLoad = (error, details) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        script.remove();
        record.scriptNode = null;
        record.loadPromise = null;
        record.state = STATES.ERROR;
        record.error = error;
        log(1, `Modul ${id} konnte nicht geladen werden.`, details);
        reject(error);
      };

      const finishLoad = () => {
        if (settled) return;
        if (!record.implementation) {
          failLoad(new Error(`Modul ${id} hat sich nach dem Laden nicht definiert.`), {
            reason: "define fehlt",
          });
          return;
        }

        settled = true;
        window.clearTimeout(timeout);
        record.loadPromise = null;
        record.state = STATES.LOADED;
        log(1, `Modul ${id} geladen.`);
        resolve(snapshotRecord(record));
      };

      script.src = record.manifest.entry;
      script.async = false;
      script.dataset.provowareModule = id;
      record.scriptNode = script;

      script.addEventListener("load", finishLoad);
      script.addEventListener("error", () => {
        failLoad(new Error(`Einstiegspunkt von ${id} konnte nicht geladen werden.`), {
          entry: record.manifest.entry,
        });
      });

      timeout = window.setTimeout(() => {
        failLoad(new Error(`Zeitüberschreitung beim Laden von ${id}.`), { reason: "timeout" });
      }, LOAD_TIMEOUT_MS);

      document.head.append(script);
    });

    return record.loadPromise;
  };

  const moduleContext = (record) =>
    Object.freeze({
      id: record.manifest.id,
      manifest: record.manifest,
      contractVersion: CONTRACT_VERSION,
    });

  const activate = async (id) => {
    const record = getRecord(id);
    if (record.state === STATES.ACTIVE) return snapshotRecord(record);

    await load(id);

    try {
      await record.implementation.activate(moduleContext(record));
      record.state = STATES.ACTIVE;
      record.error = null;
      log(1, `Modul ${id} aktiviert.`);
      return snapshotRecord(record);
    } catch (error) {
      record.state = STATES.ERROR;
      record.error = error instanceof Error ? error : new Error(String(error));
      log(1, `Aktivierung von ${id} fehlgeschlagen.`, { message: record.error.message });
      throw record.error;
    }
  };

  const deactivate = async (id) => {
    const record = getRecord(id);
    if (record.state !== STATES.ACTIVE) return snapshotRecord(record);

    try {
      await record.implementation.deactivate(moduleContext(record));
      record.state = STATES.INACTIVE;
      record.error = null;
      log(1, `Modul ${id} deaktiviert.`);
      return snapshotRecord(record);
    } catch (error) {
      record.state = STATES.ERROR;
      record.error = error instanceof Error ? error : new Error(String(error));
      log(1, `Deaktivierung von ${id} fehlgeschlagen.`, { message: record.error.message });
      throw record.error;
    }
  };

  const remove = async (id) => {
    const record = getRecord(id);

    if (record.state === STATES.LOADING) {
      throw new Error(`Modul ${id} kann während des Ladens nicht entfernt werden.`);
    }
    if (record.state === STATES.ACTIVE) {
      await deactivate(id);
    }

    if (record.implementation) {
      try {
        await record.implementation.dispose(moduleContext(record));
      } catch (error) {
        record.state = STATES.ERROR;
        record.error = error instanceof Error ? error : new Error(String(error));
        log(1, `Aufräumen von ${id} fehlgeschlagen.`, { message: record.error.message });
        throw record.error;
      }
    }

    record.scriptNode?.remove();
    record.scriptNode = null;
    record.implementation = null;
    record.loadPromise = null;
    record.error = null;
    record.state = STATES.REGISTERED;
    log(1, `Modul ${id} aus der Laufzeit entfernt.`);
    return snapshotRecord(record);
  };

  const initialize = async () => {
    if (initialized) return getSnapshot();

    registerCatalog(window.PROVOWARE_MODULE_CATALOG || []);
    initialized = true;
    log(1, `Modul-Registry initialisiert (${records.size} Module).`);

    for (const record of records.values()) {
      if (record.manifest.enabledByDefault) await activate(record.manifest.id);
    }

    return getSnapshot();
  };

  const setLogger = (nextLogger) => {
    if (typeof nextLogger !== "function") {
      throw new TypeError("Logger muss eine Funktion sein.");
    }
    logger = nextLogger;
  };

  const api = Object.freeze({
    CONTRACT_VERSION,
    STATES,
    initialize,
    define,
    load,
    activate,
    deactivate,
    remove,
    getSnapshot,
    setLogger,
    validateManifest,
  });

  Object.defineProperty(window, "PROVOWARE_MODULES", {
    value: api,
    writable: false,
    configurable: false,
    enumerable: true,
  });
})();
