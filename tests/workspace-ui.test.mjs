import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = await readFile(path.join(ROOT, "assets/workspace-ui.js"), "utf8");
const WORKSPACE_LAYOUT_CSS = await readFile(
  path.join(ROOT, "assets/workspace-layout.css"),
  "utf8",
);
const INDEX_HTML = await readFile(path.join(ROOT, "index.html"), "utf8");
const PANEL_IDS = ["overview", "modules", "work", "details", "system-status"];
const STANDARD_BREITEN = {
  overview: 12,
  modules: 4,
  work: 8,
  details: 4,
  "system-status": 12,
};

const klonen = (wert) => JSON.parse(JSON.stringify(wert));

class TestStyle {
  constructor() {
    this.werte = new Map();
  }

  setProperty(name, wert) {
    this.werte.set(name, String(wert));
  }

  removeProperty(name) {
    const vorher = this.werte.get(name) || "";
    this.werte.delete(name);
    return vorher;
  }

  getPropertyValue(name) {
    return this.werte.get(name) || "";
  }
}

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
    this.style = new TestStyle();
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
    PANEL_IDS.map((id) => [
      id,
      { visible: true, widthUnits: STANDARD_BREITEN[id], heightPx: null },
    ]),
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

test("gespeicherte Panelgröße wird ausschließlich als CSS-Variablen auf das DOM übertragen", () => {
  const start = standardzustand();
  start.panels.modules.widthUnits = 6;
  start.panels.modules.heightPx = 268;
  const unveraendert = klonen(start);
  const { api, workspace, panels } = umgebungErstellen(start);

  api.initialisieren({ workspace });

  const panel = panels.get("modules");
  assert.equal(panel.style.getPropertyValue("--panel-spalten"), "6");
  assert.equal(panel.style.getPropertyValue("--panel-hoehe"), "268px");
  assert.equal(panel.dataset.workspaceSizeReady, "true");
  assert.deepEqual(workspace.statusLesen(), unveraendert);
});

test("transiente Größenvorschau nutzt dieselben CSS-Variablen und verändert den State nicht", () => {
  const { api, workspace, panels } = umgebungErstellen();
  api.initialisieren({ workspace });
  const vorher = workspace.statusLesen();

  api.panelGroesseVorschauAnwenden("work", { widthUnits: 10, heightPx: 456 });

  const panel = panels.get("work");
  assert.equal(panel.style.getPropertyValue("--panel-spalten"), "10");
  assert.equal(panel.style.getPropertyValue("--panel-hoehe"), "456px");
  assert.equal(panel.dataset.workspaceResizePreview, "true");
  assert.deepEqual(workspace.statusLesen(), vorher);

  api.zustandAnwenden(workspace.statusLesen());
  assert.equal(panel.style.getPropertyValue("--panel-spalten"), "8");
  assert.equal(panel.style.getPropertyValue("--panel-hoehe"), "");
  assert.equal(panel.dataset.workspaceResizePreview, undefined);
});

test("automatische Höhe entfernt einen alten Inline-Höhenwert reproduzierbar", () => {
  const start = standardzustand();
  start.panels.work.heightPx = 408;
  const { api, workspace, panels } = umgebungErstellen(start);
  api.initialisieren({ workspace });

  const panel = panels.get("work");
  assert.equal(panel.style.getPropertyValue("--panel-hoehe"), "408px");

  const naechsterZustand = workspace.statusLesen();
  naechsterZustand.panels.work.heightPx = null;
  const vorher = JSON.stringify(naechsterZustand);
  api.zustandAnwenden(naechsterZustand);

  assert.equal(panel.style.getPropertyValue("--panel-hoehe"), "");
  assert.equal(panel.style.getPropertyValue("--panel-spalten"), "8");
  assert.equal(JSON.stringify(naechsterZustand), vorher);
});

test("ungültige Darstellungsbreite aktiviert das Desktop-Overlay nicht", () => {
  const { api, workspace, panels } = umgebungErstellen();
  api.initialisieren({ workspace });

  const fehlerhafterZustand = workspace.statusLesen();
  fehlerhafterZustand.panels.details.widthUnits = Number.NaN;
  api.zustandAnwenden(fehlerhafterZustand);

  const panel = panels.get("details");
  assert.equal(panel.style.getPropertyValue("--panel-spalten"), "");
  assert.equal(panel.dataset.workspaceSizeReady, undefined);
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

test("Workspace-Größenstylesheet bleibt auf Desktop begrenzt und nutzt den D2-Variablenvertrag", () => {
  assert.match(WORKSPACE_LAYOUT_CSS, /@media \(min-width: 981px\)/);
  assert.match(WORKSPACE_LAYOUT_CSS, /data-workspace-size-ready="true"/);
  assert.match(WORKSPACE_LAYOUT_CSS, /grid-column: span var\(--panel-spalten\)/);
  assert.match(WORKSPACE_LAYOUT_CSS, /height: var\(--panel-hoehe, auto\)/);
  assert.doesNotMatch(WORKSPACE_LAYOUT_CSS, /localStorage/i);
});

test("Basis-CSS wird vor dem isolierten Workspace-Größenstylesheet geladen", () => {
  const basis = INDEX_HTML.indexOf('href="assets/styles.css"');
  const overlay = INDEX_HTML.indexOf('href="assets/workspace-layout.css"');

  assert.ok(basis >= 0);
  assert.ok(overlay > basis);
});
