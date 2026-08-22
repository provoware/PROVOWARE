import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = await readFile(path.join(ROOT, "assets/workspace-ui.js"), "utf8");
const PANEL_IDS = ["overview", "modules", "work", "details", "system-status"];

const klonen = (wert) => JSON.parse(JSON.stringify(wert));

class TestElement {
  constructor(id = "") {
    this.id = id;
    this.dataset = {};
    this.hidden = false;
    this.checked = false;
    this.textContent = "";
    this.attributes = new Map();
    this.listeners = new Map();
    this.focused = false;
    this.children = new Set();
  }

  addEventListener(type, listener) {
    const liste = this.listeners.get(type) || [];
    liste.push(listener);
    this.listeners.set(type, liste);
  }

  dispatch(type, extra = {}) {
    for (const listener of this.listeners.get(type) || []) listener({ target: this, ...extra });
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  focus() {
    this.focused = true;
  }

  contains(target) {
    return target === this || this.children.has(target);
  }
}

const standardzustand = () => ({
  schemaVersion: 1,
  workspaceId: "main",
  order: [...PANEL_IDS],
  panels: Object.fromEntries(
    PANEL_IDS.map((id) => [id, { visible: true, widthUnits: 12, heightPx: null }]),
  ),
});

const umgebungErstellen = (startzustand = standardzustand()) => {
  let zustand = klonen(startzustand);
  const ids = new Map();
  const panels = PANEL_IDS.map((id) => {
    const element = new TestElement();
    element.dataset.workspacePanel = id;
    return element;
  });
  const schalter = PANEL_IDS.map((id) => {
    const element = new TestElement();
    element.dataset.layoutPanel = id;
    element.dataset.layoutName = id;
    element.checked = true;
    return element;
  });

  for (const id of [
    "quickbar",
    "layout-toggle",
    "layout-menu",
    "layout-show-all",
    "layout-reset",
    "layout-status",
    "layout-summary",
  ]) {
    ids.set(id, new TestElement(id));
  }
  ids.get("layout-menu").hidden = true;
  panels.forEach((element) => ids.get("quickbar").children.add(element));
  schalter.forEach((element) => ids.get("quickbar").children.add(element));

  const dokumentListeners = new Map();
  const document = {
    querySelector(selector) {
      return selector.startsWith("#") ? ids.get(selector.slice(1)) || null : null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-workspace-panel]") return panels;
      if (selector === "[data-layout-panel]") return schalter;
      return [];
    },
    addEventListener(type, listener) {
      const liste = dokumentListeners.get(type) || [];
      liste.push(listener);
      dokumentListeners.set(type, liste);
    },
    dispatch(type, event) {
      for (const listener of dokumentListeners.get(type) || []) listener(event);
    },
  };

  const workspace = {
    PANEL_DEFINITIONEN: PANEL_IDS.map((id) => ({ id })),
    statusLesen: () => klonen(zustand),
    panelSichtbarkeitSetzen(id, sichtbar) {
      zustand.panels[id].visible = sichtbar;
      return klonen(zustand);
    },
    allePanelsAnzeigen() {
      PANEL_IDS.forEach((id) => {
        zustand.panels[id].visible = true;
      });
      return klonen(zustand);
    },
    zuruecksetzen() {
      zustand = standardzustand();
      return klonen(zustand);
    },
  };

  const sandbox = { document, window: {} };
  vm.runInNewContext(SOURCE, sandbox, {
    filename: "assets/workspace-ui.js",
    timeout: 1000,
  });

  return {
    api: sandbox.window.PROVOWARE_WORKSPACE_UI,
    workspace,
    panels: new Map(panels.map((element) => [element.dataset.workspacePanel, element])),
    schalter: new Map(schalter.map((element) => [element.dataset.layoutPanel, element])),
    ids,
    document,
  };
};

test("gespeicherte Sichtbarkeit wird beim Start auf DOM und Schalter angewendet", () => {
  const start = standardzustand();
  start.panels.modules.visible = false;
  const { api, workspace, panels, schalter, ids } = umgebungErstellen(start);

  api.initialisieren({ workspace });

  assert.equal(panels.get("modules").hidden, true);
  assert.equal(schalter.get("modules").checked, false);
  assert.equal(panels.get("overview").hidden, false);
  assert.equal(ids.get("layout-summary").textContent, "Arbeitsfläche · 4/5 sichtbar");
});

test("Sichtbarkeitsschalter aktualisiert Zustand, Panel und Nutzerfeedback", () => {
  const { api, workspace, panels, schalter, ids } = umgebungErstellen();
  api.initialisieren({ workspace });

  const moduleSchalter = schalter.get("modules");
  moduleSchalter.checked = false;
  moduleSchalter.dispatch("change");

  assert.equal(workspace.statusLesen().panels.modules.visible, false);
  assert.equal(panels.get("modules").hidden, true);
  assert.match(ids.get("layout-status").textContent, /ausgeblendet/);
});

test("Alle anzeigen und Standardlayout stellen sichtbare Bereiche wieder her", () => {
  const start = standardzustand();
  PANEL_IDS.forEach((id) => {
    start.panels[id].visible = false;
  });
  const { api, workspace, panels, ids } = umgebungErstellen(start);
  api.initialisieren({ workspace });

  assert.ok([...panels.values()].every((panel) => panel.hidden));
  ids.get("layout-show-all").dispatch("click");
  assert.ok([...panels.values()].every((panel) => !panel.hidden));

  workspace.panelSichtbarkeitSetzen("details", false);
  api.zustandAnwenden(workspace.statusLesen());
  ids.get("layout-reset").dispatch("click");
  assert.ok([...panels.values()].every((panel) => !panel.hidden));
  assert.match(ids.get("layout-status").textContent, /Standardlayout/);
});

test("Layout-Menü lässt sich per Schalter öffnen und per Escape schließen", () => {
  const { api, workspace, ids, document } = umgebungErstellen();
  api.initialisieren({ workspace });

  ids.get("layout-toggle").dispatch("click");
  assert.equal(ids.get("layout-menu").hidden, false);
  assert.equal(ids.get("layout-toggle").getAttribute("aria-expanded"), "true");

  document.dispatch("keydown", { key: "Escape" });
  assert.equal(ids.get("layout-menu").hidden, true);
  assert.equal(ids.get("layout-toggle").focused, true);
});
