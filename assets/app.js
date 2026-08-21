(() => {
  "use strict";

  const STORAGE_KEY = "provoware.allin.debug.v1";
  const MAX_ENTRIES = 500;

  const elements = {
    toggle: document.querySelector("#debug-toggle"),
    panel: document.querySelector("#debug-panel"),
    output: document.querySelector("#debug-output"),
    clear: document.querySelector("#debug-clear"),
    levelButtons: [...document.querySelectorAll("[data-log-level]")],
  };

  if (!elements.toggle || !elements.panel || !elements.output) {
    console.error("[PROVOWARE] Debug-Oberfläche unvollständig.");
    return;
  }

  const state = {
    visible: false,
    level: 1,
    entries: [],
  };

  const safeJson = (value) => {
    if (value === undefined) return "";

    const seen = new WeakSet();
    try {
      return JSON.stringify(value, (_key, item) => {
        if (typeof item === "object" && item !== null) {
          if (seen.has(item)) return "[Circular]";
          seen.add(item);
        }
        if (item instanceof Error) {
          return {
            name: item.name,
            message: item.message,
            stack: item.stack,
          };
        }
        return item;
      });
    } catch {
      return "[Nicht serialisierbar]";
    }
  };

  const readPreference = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!stored || typeof stored !== "object") return;
      state.visible = stored.visible === true;
      if ([1, 2, 3].includes(stored.level)) state.level = stored.level;
    } catch {
      // Defekte oder gesperrte lokale Speicherung darf die Oberfläche nie blockieren.
    }
  };

  const writePreference = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ visible: state.visible, level: state.level }),
      );
    } catch {
      // Logging bleibt auch ohne lokale Speicherung funktionsfähig.
    }
  };

  const render = () => {
    elements.panel.hidden = !state.visible;
    elements.toggle.setAttribute("aria-expanded", String(state.visible));

    elements.levelButtons.forEach((button) => {
      const selected = Number(button.dataset.logLevel) === state.level;
      button.setAttribute("aria-pressed", String(selected));
    });

    const lines = state.entries
      .filter((entry) => entry.level <= state.level)
      .map((entry) => {
        const suffix = entry.data ? ` ${entry.data}` : "";
        return `${entry.time} [L${entry.level}] [${entry.scope}] ${entry.message}${suffix}`;
      });

    elements.output.textContent = lines.join("\n");
    if (state.visible) elements.output.scrollTop = elements.output.scrollHeight;
  };

  const log = (level, scope, message, data) => {
    const normalizedLevel = [1, 2, 3].includes(Number(level)) ? Number(level) : 1;
    const now = new Date();
    const serialized = safeJson(data);

    state.entries.push({
      level: normalizedLevel,
      scope: String(scope || "APP"),
      message: String(message || ""),
      data: serialized,
      time: now.toLocaleTimeString("de-DE", { hour12: false }),
    });

    if (state.entries.length > MAX_ENTRIES) {
      state.entries.splice(0, state.entries.length - MAX_ENTRIES);
    }

    render();
  };

  const setLevel = (level) => {
    const next = Number(level);
    if (![1, 2, 3].includes(next)) return false;
    state.level = next;
    writePreference();
    render();
    return true;
  };

  const setVisible = (visible) => {
    state.visible = Boolean(visible);
    writePreference();
    render();
  };

  const clear = () => {
    state.entries.length = 0;
    render();
  };

  const initializeModules = async () => {
    const registry = window.PROVOWARE_MODULES;
    if (!registry) {
      log(1, "MODULES", "Modul-Registry ist nicht verfügbar.");
      return;
    }

    try {
      registry.setLogger(log);
      const modules = await registry.initialize();
      log(2, "MODULES", `Registry-Start abgeschlossen (${modules.length} Module).`);
    } catch (error) {
      log(1, "MODULES", "Modul-Registry konnte nicht initialisiert werden.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const initializeWorkspace = () => {
    const workspace = window.PROVOWARE_WORKSPACE;
    if (!workspace) {
      log(1, "WORKSPACE", "Workspace-Zustandsverwaltung ist nicht verfügbar.");
      return;
    }

    try {
      workspace.loggerSetzen(log);
      const workspaceState = workspace.initialisieren();
      log(2, "WORKSPACE", `Workspace-Zustand bereit (${workspaceState.order.length} Panels).`);
    } catch (error) {
      log(1, "WORKSPACE", "Workspace-Zustand konnte nicht initialisiert werden.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  readPreference();

  elements.toggle.addEventListener("click", () => {
    setVisible(!state.visible);
    log(2, "DEBUG", state.visible ? "Debugbereich geöffnet" : "Debugbereich geschlossen");
  });

  elements.clear?.addEventListener("click", clear);

  elements.levelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (setLevel(button.dataset.logLevel)) {
        log(2, "DEBUG", `Logging-Stufe auf ${state.level} gesetzt`);
      }
    });
  });

  window.addEventListener("error", (event) => {
    log(1, "ERROR", event.message || "Unbehandelter Fehler", {
      source: event.filename ? event.filename.split("/").pop() : "",
      line: event.lineno || 0,
      column: event.colno || 0,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason instanceof Error
      ? { name: event.reason.name, message: event.reason.message }
      : String(event.reason ?? "Unbekannter Promise-Fehler");
    log(1, "PROMISE", "Unbehandelte Promise-Ablehnung", reason);
  });

  window.PROVOWARE_DEBUG = Object.freeze({
    log,
    clear,
    setLevel,
    show: () => setVisible(true),
    hide: () => setVisible(false),
    getState: () => ({
      visible: state.visible,
      level: state.level,
      entries: state.entries.length,
    }),
  });

  render();
  log(1, "APP", "PROVOWARE ALL-IN 2026 Oberfläche bereit");
  log(2, "DEBUG", "Debugging & Logging initialisiert");
  log(3, "TRACE", "UI-Baseline", {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    language: document.documentElement.lang,
  });
  initializeWorkspace();
  void initializeModules();
})();
