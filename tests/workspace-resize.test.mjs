import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = await readFile(path.join(ROOT, "assets/workspace-resize.js"), "utf8");
const SIZE_SOURCE = await readFile(path.join(ROOT, "assets/workspace-size.js"), "utf8");
const WORKSPACE_LAYOUT_CSS = await readFile(
  path.join(ROOT, "assets/workspace-layout.css"),
  "utf8",
);
const HEADQUARTER_CSS = await readFile(
  path.join(ROOT, "assets/headquarter-dashboard.css"),
  "utf8",
);

const DEFINITIONEN = [
  { id: "overview", standardBreite: 12, mindestBreite: 6, hoechstBreite: 12, standardHoehe: null, mindestHoehe: 148, hoechstHoehe: 1200 },
  { id: "modules", standardBreite: 4, mindestBreite: 4, hoechstBreite: 12, standardHoehe: null, mindestHoehe: 220, hoechstHoehe: 1200 },
  { id: "work", standardBreite: 8, mindestBreite: 6, hoechstBreite: 12, standardHoehe: null, mindestHoehe: 360, hoechstHoehe: 1200 },
  { id: "details", standardBreite: 4, mindestBreite: 4, hoechstBreite: 12, standardHoehe: null, mindestHoehe: 220, hoechstHoehe: 1200 },
  { id: "system-status", standardBreite: 12, mindestBreite: 6, hoechstBreite: 12, standardHoehe: null, mindestHoehe: 148, hoechstHoehe: 1200 },
];
const NAMEN = {
  overview: "Übersicht",
  modules: "Module",
  work: "Arbeitsbereich",
  details: "Detailbereich",
  "system-status": "Systemstatus",
};

const klonen = (wert) => JSON.parse(JSON.stringify(wert));

class TestElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.type = "";
    this.className = "";
    this.title = "";
    this.dataset = {};
    this.textContent = "";
    this.attributes = new Map();
    this.listeners = new Map();
    this.children = [];
    this.parentElement = null;
    this.renderedHeight = 420;
    this.renderedWidth = 520;
    this.columnGap = "0px";
    this.capturedPointers = new Set();
    this.focused = false;
  }

  addEventListener(type, listener) {
    const liste = this.listeners.get(type) || [];
    liste.push(listener);
    this.listeners.set(type, liste);
  }

  dispatch(type, extra = {}) {
    const event = {
      key: "",
      target: this,
      currentTarget: this,
      defaultPrevented: false,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      isPrimary: true,
      clientX: 0,
      clientY: 0,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...extra,
    };
    for (const listener of this.listeners.get(type) || []) listener(event);
    return event;
  }

  append(element) {
    element.parentElement = this;
    this.children.push(element);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  getBoundingClientRect() {
    return { width: this.renderedWidth, height: this.renderedHeight };
  }

  setPointerCapture(pointerId) {
    this.capturedPointers.add(pointerId);
  }

  releasePointerCapture(pointerId) {
    this.capturedPointers.delete(pointerId);
  }

  hasPointerCapture(pointerId) {
    return this.capturedPointers.has(pointerId);
  }

  focus() {
    this.focused = true;
  }
}

class TestMedia {
  constructor(matches = true) {
    this.matches = matches;
    this.listeners = [];
  }

  addEventListener(type, listener) {
    if (type === "change") this.listeners.push(listener);
  }

  setMatches(matches) {
    this.matches = matches;
    for (const listener of this.listeners) listener({ matches });
  }
}

const standardzustand = () => ({
  schemaVersion: 1,
  workspaceId: "main",
  order: DEFINITIONEN.map((definition) => definition.id),
  panels: Object.fromEntries(
    DEFINITIONEN.map((definition) => [
      definition.id,
      {
        visible: true,
        widthUnits: definition.standardBreite,
        heightPx: definition.standardHoehe,
      },
    ]),
  ),
});

const umgebungErstellen = ({ desktop = true, startzustand = standardzustand() } = {}) => {
  let zustand = klonen(startzustand);
  let commits = 0;
  let resets = 0;
  const previews = [];
  const angewendet = [];
  const meldungen = [];
  const logs = [];
  const media = new TestMedia(desktop);
  const panels = new Map();
  const headings = new Map();
  const grid = new TestElement("main");
  grid.renderedWidth = 1200;
  grid.renderedHeight = 900;
  grid.columnGap = "16px";

  for (const definition of DEFINITIONEN) {
    const panel = new TestElement("section");
    panel.dataset.workspacePanel = definition.id;
    panel.setAttribute("aria-labelledby", `title-${definition.id}`);
    grid.append(panel);
    panels.set(definition.id, panel);

    const heading = new TestElement("h2");
    heading.textContent = NAMEN[definition.id];
    headings.set(`title-${definition.id}`, heading);
  }

  const dokumentListeners = new Map();
  const document = {
    querySelectorAll(selector) {
      if (selector === "[data-workspace-panel]") return [...panels.values()];
      return [];
    },
    getElementById(id) {
      return headings.get(id) || null;
    },
    createElement(tagName) {
      return new TestElement(tagName);
    },
    addEventListener(type, listener) {
      const liste = dokumentListeners.get(type) || [];
      liste.push(listener);
      dokumentListeners.set(type, liste);
    },
    dispatch(type, extra = {}) {
      const event = {
        key: "",
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true;
        },
        ...extra,
      };
      for (const listener of dokumentListeners.get(type) || []) listener(event);
      return event;
    },
  };

  const workspace = {
    PANEL_DEFINITIONEN: DEFINITIONEN,
    statusLesen: () => klonen(zustand),
    panelGroesseSetzen(id, groesse) {
      commits += 1;
      zustand.panels[id].widthUnits = groesse.widthUnits;
      zustand.panels[id].heightPx = groesse.heightPx;
      return klonen(zustand);
    },
    panelGroesseZuruecksetzen(id) {
      resets += 1;
      const definition = DEFINITIONEN.find((eintrag) => eintrag.id === id);
      zustand.panels[id].widthUnits = definition.standardBreite;
      zustand.panels[id].heightPx = definition.standardHoehe;
      return klonen(zustand);
    },
  };

  const ui = {
    zustandAnwenden(naechsterZustand) {
      angewendet.push(klonen(naechsterZustand));
      return naechsterZustand;
    },
    panelGroesseVorschauAnwenden(id, groesse) {
      previews.push({ id, groesse: klonen(groesse) });
      return true;
    },
    statusMelden(text) {
      meldungen.push(String(text));
    },
  };

  const sandbox = {
    document,
    window: {
      innerWidth: desktop ? 1280 : 800,
      matchMedia: () => media,
      getComputedStyle: (element) => ({
        columnGap: element.columnGap || "0px",
        gap: element.columnGap || "0px",
      }),
    },
  };
  vm.runInNewContext(SIZE_SOURCE, sandbox, {
    filename: "assets/workspace-size.js",
    timeout: 1000,
  });
  vm.runInNewContext(SOURCE, sandbox, {
    filename: "assets/workspace-resize.js",
    timeout: 1000,
  });

  const api = sandbox.window.PROVOWARE_WORKSPACE_RESIZE;
  api.initialisieren({
    workspace,
    ui,
    groessenLogik: sandbox.window.PROVOWARE_WORKSPACE_SIZE,
    logger: (stufe, bereich, nachricht, daten) => logs.push({ stufe, bereich, nachricht, daten }),
  });

  const griff = (id) => panels.get(id).children.find(
    (element) => element.dataset.workspaceResizeHandle === id,
  );

  return {
    api,
    workspace,
    ui,
    document,
    media,
    grid,
    panels,
    griff,
    previews,
    angewendet,
    meldungen,
    logs,
    commits: () => commits,
    resets: () => resets,
  };
};

test("genau ein zugänglicher Resize-Griff pro Panel wird erzeugt", () => {
  const umgebung = umgebungErstellen();

  assert.equal(umgebung.api.statusLesen().griffe, 5);
  assert.equal(umgebung.api.POINTER_START_SCHWELLE_PX, 4);
  for (const definition of DEFINITIONEN) {
    const griff = umgebung.griff(definition.id);
    assert.ok(griff);
    assert.equal(griff.tagName, "BUTTON");
    assert.equal(griff.type, "button");
    assert.match(griff.getAttribute("aria-label"), /Größe von/);
    assert.match(griff.getAttribute("aria-keyshortcuts"), /ArrowLeft/);
    assert.match(griff.getAttribute("aria-keyshortcuts"), /Home/);
    assert.match(griff.getAttribute("aria-description"), /Ziehen/);
  }

  umgebung.api.initialisieren({});
  assert.equal(umgebung.api.statusLesen().griffe, 5);
});

test("wiederholte Pfeiltasten verändern nur Vorschau und Keyup committet genau einmal", () => {
  const umgebung = umgebungErstellen();
  const griff = umgebung.griff("work");
  const vorher = umgebung.workspace.statusLesen();

  griff.dispatch("keydown", { key: "ArrowRight", repeat: false });
  griff.dispatch("keydown", { key: "ArrowRight", repeat: true });

  assert.equal(umgebung.commits(), 0);
  assert.deepEqual(umgebung.workspace.statusLesen(), vorher);
  assert.equal(umgebung.previews.at(-1).groesse.widthUnits, 10);

  umgebung.document.dispatch("keyup", { key: "ArrowRight" });

  assert.equal(umgebung.commits(), 1);
  assert.equal(umgebung.workspace.statusLesen().panels.work.widthUnits, 10);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung, null);
});

test("mehrere gleichzeitig aktive Pfeiltasten führen erst nach letzter Freigabe zu einem Commit", () => {
  const umgebung = umgebungErstellen();
  const griff = umgebung.griff("work");

  griff.dispatch("keydown", { key: "ArrowRight" });
  griff.dispatch("keydown", { key: "ArrowDown" });
  umgebung.document.dispatch("keyup", { key: "ArrowRight" });

  assert.equal(umgebung.commits(), 0);
  assert.ok(umgebung.api.statusLesen().aktiveSitzung);

  umgebung.document.dispatch("keyup", { key: "ArrowDown" });
  assert.equal(umgebung.commits(), 1);
  assert.equal(umgebung.workspace.statusLesen().panels.work.widthUnits, 9);
  assert.equal(umgebung.workspace.statusLesen().panels.work.heightPx, 444);
});

test("automatische Höhe startet bei gerenderter Höhe und ändert sich in 24-Pixel-Schritten", () => {
  const umgebung = umgebungErstellen();
  const panel = umgebung.panels.get("work");
  panel.renderedHeight = 420;

  umgebung.griff("work").dispatch("keydown", { key: "ArrowDown" });
  assert.equal(umgebung.previews.at(-1).groesse.heightPx, 444);
  assert.equal(umgebung.commits(), 0);

  umgebung.document.dispatch("keyup", { key: "ArrowDown" });
  assert.equal(umgebung.workspace.statusLesen().panels.work.heightPx, 444);
});

test("Breiten- und Höhengrenzen werden eingehalten", () => {
  const start = standardzustand();
  start.panels.work.widthUnits = 12;
  start.panels.work.heightPx = 1200;
  const umgebung = umgebungErstellen({ startzustand: start });
  const griff = umgebung.griff("work");

  griff.dispatch("keydown", { key: "ArrowRight" });
  griff.dispatch("keydown", { key: "ArrowDown" });
  assert.equal(umgebung.previews.at(-1).groesse.widthUnits, 12);
  assert.equal(umgebung.previews.at(-1).groesse.heightPx, 1200);

  umgebung.document.dispatch("keyup", { key: "ArrowRight" });
  umgebung.document.dispatch("keyup", { key: "ArrowDown" });
  assert.equal(umgebung.commits(), 0);
});

test("Escape verwirft die Tastaturvorschau ohne Größen-Commit", () => {
  const umgebung = umgebungErstellen();
  const vorher = umgebung.workspace.statusLesen();

  umgebung.griff("modules").dispatch("keydown", { key: "ArrowRight" });
  assert.ok(umgebung.api.statusLesen().aktiveSitzung);
  assert.equal(umgebung.commits(), 0);

  const event = umgebung.document.dispatch("keydown", { key: "Escape" });

  assert.equal(event.defaultPrevented, true);
  assert.equal(umgebung.commits(), 0);
  assert.deepEqual(umgebung.workspace.statusLesen(), vorher);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung, null);
  assert.match(umgebung.meldungen.at(-1), /abgebrochen/);
});

test("Home setzt ausschließlich die Größe des aktuellen Panels zurück", () => {
  const start = standardzustand();
  start.panels.details.widthUnits = 9;
  start.panels.details.heightPx = 460;
  start.panels.details.visible = false;
  const vorherigeReihenfolge = [...start.order];
  const umgebung = umgebungErstellen({ startzustand: start });

  const event = umgebung.griff("details").dispatch("keydown", { key: "Home" });
  const zustand = umgebung.workspace.statusLesen();

  assert.equal(event.defaultPrevented, true);
  assert.equal(umgebung.resets(), 1);
  assert.equal(zustand.panels.details.widthUnits, 4);
  assert.equal(zustand.panels.details.heightPx, null);
  assert.equal(zustand.panels.details.visible, false);
  assert.deepEqual(zustand.order, vorherigeReihenfolge);
});

test("bis 980 px werden Tastatur- und Pointeraktionen ignoriert", () => {
  const umgebung = umgebungErstellen({ desktop: false });
  const vorher = umgebung.workspace.statusLesen();
  const griff = umgebung.griff("work");

  const taste = griff.dispatch("keydown", { key: "ArrowRight" });
  const pointer = griff.dispatch("pointerdown", { pointerId: 9, clientX: 20, clientY: 20 });

  assert.equal(taste.defaultPrevented, false);
  assert.equal(pointer.defaultPrevented, false);
  assert.equal(griff.hasPointerCapture(9), false);
  assert.equal(umgebung.previews.length, 0);
  assert.equal(umgebung.commits(), 0);
  assert.deepEqual(umgebung.workspace.statusLesen(), vorher);
});

test("Wechsel auf kleinen Viewport bricht eine aktive Vorschau ohne Commit ab", () => {
  const umgebung = umgebungErstellen();
  const vorher = umgebung.workspace.statusLesen();

  umgebung.griff("work").dispatch("keydown", { key: "ArrowRight" });
  assert.ok(umgebung.api.statusLesen().aktiveSitzung);

  umgebung.media.setMatches(false);

  assert.equal(umgebung.commits(), 0);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung, null);
  assert.deepEqual(umgebung.workspace.statusLesen(), vorher);
  assert.match(umgebung.meldungen.at(-1), /Fensterbreite/);
});

test("Pointerdown erfasst den Zeiger, aber Bewegung unter 4 px verändert nichts", () => {
  const umgebung = umgebungErstellen();
  const griff = umgebung.griff("work");
  const vorher = umgebung.workspace.statusLesen();

  const down = griff.dispatch("pointerdown", {
    pointerId: 7,
    pointerType: "mouse",
    clientX: 100,
    clientY: 100,
  });
  griff.dispatch("pointermove", {
    pointerId: 7,
    pointerType: "mouse",
    clientX: 103,
    clientY: 100,
  });

  assert.equal(down.defaultPrevented, true);
  assert.equal(griff.hasPointerCapture(7), true);
  assert.equal(griff.focused, true);
  assert.equal(umgebung.previews.length, 0);
  assert.equal(umgebung.commits(), 0);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung.pointerAktiv, false);

  griff.dispatch("pointerup", { pointerId: 7, pointerType: "mouse", clientX: 103, clientY: 100 });

  assert.equal(griff.hasPointerCapture(7), false);
  assert.equal(umgebung.commits(), 0);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung, null);
  assert.deepEqual(umgebung.workspace.statusLesen(), vorher);
});

test("ab 4 px startet Pointer-Vorschau und Pointerup committet genau einmal", () => {
  const umgebung = umgebungErstellen();
  const griff = umgebung.griff("work");

  griff.dispatch("pointerdown", {
    pointerId: 11,
    pointerType: "touch",
    clientX: 100,
    clientY: 100,
  });
  griff.dispatch("pointermove", {
    pointerId: 11,
    pointerType: "touch",
    clientX: 205,
    clientY: 148,
  });

  assert.equal(umgebung.commits(), 0);
  assert.equal(umgebung.previews.length, 1);
  assert.equal(umgebung.previews.at(-1).groesse.widthUnits, 9);
  assert.equal(umgebung.previews.at(-1).groesse.heightPx, 468);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung.pointerAktiv, true);

  griff.dispatch("pointerup", {
    pointerId: 11,
    pointerType: "touch",
    clientX: 205,
    clientY: 148,
  });

  assert.equal(umgebung.commits(), 1);
  assert.equal(umgebung.workspace.statusLesen().panels.work.widthUnits, 9);
  assert.equal(umgebung.workspace.statusLesen().panels.work.heightPx, 468);
  assert.equal(griff.hasPointerCapture(11), false);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung, null);
});

test("Pointer-Breitenberechnung verwendet den real gemessenen CSS-Spaltenabstand", () => {
  const umgebung = umgebungErstellen();
  const griff = umgebung.griff("work");
  umgebung.grid.renderedWidth = 1200;
  umgebung.grid.columnGap = "40px";

  griff.dispatch("pointerdown", { pointerId: 21, clientX: 100, clientY: 100 });
  griff.dispatch("pointermove", { pointerId: 21, clientX: 253, clientY: 100 });

  assert.equal(umgebung.previews.at(-1).groesse.widthUnits, 9);
  assert.equal(umgebung.commits(), 0);
});

test("Pointercancel verwirft aktive Vorschau und gibt Capture frei", () => {
  const umgebung = umgebungErstellen();
  const griff = umgebung.griff("modules");
  const vorher = umgebung.workspace.statusLesen();

  griff.dispatch("pointerdown", { pointerId: 13, pointerType: "pen", clientX: 10, clientY: 10 });
  griff.dispatch("pointermove", { pointerId: 13, pointerType: "pen", clientX: 120, clientY: 58 });
  assert.equal(umgebung.previews.length, 1);

  griff.dispatch("pointercancel", { pointerId: 13, pointerType: "pen" });

  assert.equal(umgebung.commits(), 0);
  assert.equal(griff.hasPointerCapture(13), false);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung, null);
  assert.deepEqual(umgebung.workspace.statusLesen(), vorher);
  assert.match(umgebung.meldungen.at(-1), /abgebrochen/);
});

test("Escape bricht auch eine aktive Pointer-Vorschau ohne Commit ab", () => {
  const umgebung = umgebungErstellen();
  const griff = umgebung.griff("details");
  const vorher = umgebung.workspace.statusLesen();

  griff.dispatch("pointerdown", { pointerId: 15, clientX: 100, clientY: 100 });
  griff.dispatch("pointermove", { pointerId: 15, clientX: 220, clientY: 148 });
  assert.equal(griff.hasPointerCapture(15), true);

  const event = umgebung.document.dispatch("keydown", { key: "Escape" });

  assert.equal(event.defaultPrevented, true);
  assert.equal(umgebung.commits(), 0);
  assert.equal(griff.hasPointerCapture(15), false);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung, null);
  assert.deepEqual(umgebung.workspace.statusLesen(), vorher);
});

test("rechte Maustaste und nicht primäre Pointer starten kein Resize", () => {
  const umgebung = umgebungErstellen();
  const griff = umgebung.griff("work");

  griff.dispatch("pointerdown", { pointerId: 31, pointerType: "mouse", button: 2 });
  griff.dispatch("pointerdown", { pointerId: 32, pointerType: "touch", isPrimary: false });

  assert.equal(griff.hasPointerCapture(31), false);
  assert.equal(griff.hasPointerCapture(32), false);
  assert.equal(umgebung.api.statusLesen().aktiveSitzung, null);
  assert.equal(umgebung.previews.length, 0);
  assert.equal(umgebung.commits(), 0);
});

test("D3b bleibt speichergetrennt und Visual Balance folgt dem Workspace-Vertrag", () => {
  assert.doesNotMatch(SOURCE, /localStorage|sessionStorage/);
  assert.match(SOURCE, /pointerdown/);
  assert.match(SOURCE, /pointermove/);
  assert.match(SOURCE, /pointerup/);
  assert.match(SOURCE, /pointercancel/);
  assert.match(SOURCE, /setPointerCapture/);
  assert.match(SOURCE, /POINTER_START_SCHWELLE_PX = 4/);

  assert.match(WORKSPACE_LAYOUT_CSS, /width:\s*44px/);
  assert.match(WORKSPACE_LAYOUT_CSS, /height:\s*44px/);
  assert.match(WORKSPACE_LAYOUT_CSS, /cursor:\s*nwse-resize/);
  assert.match(WORKSPACE_LAYOUT_CSS, /touch-action:\s*none/);
  assert.match(WORKSPACE_LAYOUT_CSS, /gap:\s*clamp\(12px, 1\.2vw, 18px\)/);
  assert.match(WORKSPACE_LAYOUT_CSS, /align-items:\s*start/);
  assert.match(WORKSPACE_LAYOUT_CSS, /\.panel\s*\{\s*min-height:\s*220px/);
  assert.match(WORKSPACE_LAYOUT_CSS, /\.panel-wide\s*\{\s*min-height:\s*148px/);
  assert.match(WORKSPACE_LAYOUT_CSS, /\.panel-feature\s*\{\s*min-height:\s*360px/);
  assert.match(WORKSPACE_LAYOUT_CSS, /@media \(min-width: 981px\)/);
  assert.match(WORKSPACE_LAYOUT_CSS, /data-workspace-resize-preview="true"/);

  assert.match(HEADQUARTER_CSS, /0 0 72px rgba\(74, 221, 207, 0\.12\)/);
  assert.match(HEADQUARTER_CSS, /\.panel h2/);
  assert.doesNotMatch(HEADQUARTER_CSS, /animation:/);
});
