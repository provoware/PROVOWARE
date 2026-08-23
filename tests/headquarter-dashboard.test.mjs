import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = await readFile(path.join(ROOT, "modules/headquarter-dashboard/index.js"), "utf8");
const CSS = await readFile(path.join(ROOT, "assets/headquarter-dashboard.css"), "utf8");
const INDEX = await readFile(path.join(ROOT, "index.html"), "utf8");
const REGISTRY = await readFile(path.join(ROOT, "modules/registry.js"), "utf8");

class TestElement {
  constructor(tagName) {
    this.tagName = String(tagName).toUpperCase();
    this.className = "";
    this.textContent = "";
    this.dataset = {};
    this.attributes = new Map();
    this.children = [];
    this.listeners = new Map();
    this.parentNode = null;
    this.hidden = false;
    this.controls = false;
    this.multiple = false;
    this.files = [];
    this.value = "";
    this.src = "";
    this.error = null;
    this.loadCalls = 0;
    this.pauseCalls = 0;
    this.playCalls = 0;
  }

  append(...elements) {
    for (const element of elements) {
      if (!element) continue;
      element.parentNode = this;
      this.children.push(element);
    }
  }

  replaceChildren(...elements) {
    this.children.forEach((element) => {
      element.parentNode = null;
    });
    this.children = [];
    this.append(...elements);
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "id") this.id = String(value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "src") this.src = "";
  }

  addEventListener(type, listener) {
    const list = this.listeners.get(type) || [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  dispatch(type, extra = {}) {
    const event = {
      type,
      target: this,
      preventDefault() {},
      ...extra,
    };
    for (const listener of this.listeners.get(type) || []) listener(event);
  }

  querySelectorAll(selector) {
    const ergebnis = [];
    const passt = (element) => {
      if (selector === "button") return element.tagName === "BUTTON";
      if (selector === "input") return element.tagName === "INPUT";
      if (selector === "audio") return element.tagName === "AUDIO";
      if (selector === "video") return element.tagName === "VIDEO";
      if (selector.startsWith(".")) {
        const klasse = selector.slice(1);
        return String(element.className).split(/\s+/).includes(klasse);
      }
      return false;
    };
    const visit = (element) => {
      for (const child of element.children) {
        if (passt(child)) ergebnis.push(child);
        visit(child);
      }
    };
    visit(this);
    return ergebnis;
  }

  querySelector(selector) {
    if (selector === "span:last-child") {
      const spans = this.children.filter((child) => child.tagName === "SPAN");
      return spans.at(-1) || null;
    }
    return this.querySelectorAll(selector)[0] || null;
  }

  pause() {
    this.pauseCalls += 1;
  }

  load() {
    this.loadCalls += 1;
  }

  play() {
    this.playCalls += 1;
    return Promise.resolve();
  }
}

const umgebungErstellen = ({ protocol = "http:" } = {}) => {
  const overview = new TestElement("section");
  overview.id = "uebersicht";
  const definiert = new Map();
  const logs = [];
  const revoked = [];
  let blobCounter = 0;
  let fetchCalls = 0;
  const windowListeners = new Map();

  const document = {
    createElement(tag) {
      return new TestElement(tag);
    },
    querySelector(selector) {
      if (selector === "#uebersicht") return overview;
      if (selector === "#headquarter-dashboard") {
        return overview.querySelectorAll(".headquarter-dashboard")[0] || null;
      }
      return null;
    },
  };

  const moduleSnapshot = [
    { id: "data-studio", state: "active" },
    { id: "data-recovery", state: "active" },
    { id: "headquarter-dashboard", state: "loaded" },
  ];
  const workspaceState = {
    panels: {
      overview: { visible: true },
      modules: { visible: true },
      work: { visible: true },
      details: { visible: false },
      "system-status": { visible: true },
    },
  };

  const window = {
    innerWidth: 1366,
    innerHeight: 900,
    location: { protocol },
    PROVOWARE_DEBUG: {
      log(level, scope, message, data) {
        logs.push({ level, scope, message, data });
      },
    },
    PROVOWARE_WORKSPACE: {
      PANEL_DEFINITIONEN: [
        { id: "overview" },
        { id: "modules" },
        { id: "work" },
        { id: "details" },
        { id: "system-status" },
      ],
      statusLesen: () => structuredClone(workspaceState),
    },
    PROVOWARE_MODULES: {
      define(id, implementation) {
        definiert.set(id, implementation);
      },
      getSnapshot: () => structuredClone(moduleSnapshot),
    },
    addEventListener(type, listener) {
      const list = windowListeners.get(type) || [];
      list.push(listener);
      windowListeners.set(type, list);
    },
    removeEventListener(type, listener) {
      const list = windowListeners.get(type) || [];
      windowListeners.set(type, list.filter((item) => item !== listener));
    },
    setTimeout(callback) {
      callback();
      return 1;
    },
    clearTimeout() {},
  };

  const sandbox = {
    document,
    window,
    navigator: {
      hardwareConcurrency: 8,
      deviceMemory: 16,
      storage: {
        async estimate() {
          return { usage: 1024 * 1024, quota: 1024 * 1024 * 1024 };
        },
      },
    },
    fetch: async () => {
      fetchCalls += 1;
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            version: "0.2.0",
            development_phase: "0.4.4 Headquarter Dashboard & Media",
          };
        },
      };
    },
    URL: {
      createObjectURL(file) {
        blobCounter += 1;
        return `blob:test-${blobCounter}-${file.name}`;
      },
      revokeObjectURL(url) {
        revoked.push(url);
      },
    },
    setTimeout: window.setTimeout,
    clearTimeout: window.clearTimeout,
    structuredClone,
    Map,
    Set,
    Promise,
    Number,
    String,
    Array,
    Error,
    RangeError,
  };

  vm.runInNewContext(SOURCE, sandbox, {
    filename: "modules/headquarter-dashboard/index.js",
    timeout: 1000,
  });

  return {
    implementation: definiert.get("headquarter-dashboard"),
    overview,
    window,
    logs,
    revoked,
    getFetchCalls: () => fetchCalls,
  };
};

const elementMitKlasse = (root, klasse) => root.querySelectorAll(`.${klasse}`)[0] || null;

const mediaElemente = (root) => ({
  inputs: root.querySelectorAll("input"),
  audios: root.querySelectorAll("audio"),
  videos: root.querySelectorAll("video"),
  tracks: () => root.querySelectorAll(".hq-media-track"),
});

test("Headquarter-Modul baut Dashboard und beide nativen Medienplayer genau einmal auf", async () => {
  const { implementation, overview } = umgebungErstellen();
  assert.ok(implementation);

  await implementation.activate();
  await implementation.activate();

  assert.equal(overview.querySelectorAll(".headquarter-dashboard").length, 1);
  assert.equal(overview.querySelectorAll("audio").length, 1);
  assert.equal(overview.querySelectorAll("video").length, 1);
  assert.match(elementMitKlasse(overview, "hq-title").textContent, /HEADQUARTER 2026/);
  assert.match(elementMitKlasse(overview, "hq-dashboard-status").textContent, /aktualisiert/);
});

test("Dashboard zeigt echte Modul-, Workspace- und Browserinformationen statt erfundener Lastwerte", async () => {
  const { implementation, overview } = umgebungErstellen();
  await implementation.activate();

  const werte = overview.querySelectorAll(".hq-info-value").map((element) => element.textContent);
  assert.ok(werte.some((wert) => wert.includes("0.2.0")));
  assert.ok(werte.some((wert) => wert.includes("2/3 aktiv")));
  assert.ok(werte.some((wert) => wert.includes("4/5 sichtbar")));
  assert.ok(werte.some((wert) => wert.includes("1366 × 900")));
  assert.ok(werte.some((wert) => wert.includes("8 logische Threads")));
  assert.match(elementMitKlasse(overview, "hq-system-note").textContent, /nicht erfunden/);
});

test("Direktstart benötigt keine Versions-Fetch-Anfrage und bleibt funktionsfähig", async () => {
  const { implementation, overview, getFetchCalls } = umgebungErstellen({ protocol: "file:" });
  await implementation.activate();

  assert.equal(getFetchCalls(), 0);
  const werte = overview.querySelectorAll(".hq-info-value").map((element) => element.textContent);
  assert.ok(werte.includes("Direktstart"));
  assert.ok(werte.some((wert) => wert.includes("Dashboard-Modul 0.4.4")));
});

test("Audio-Playlist nimmt passende Dateien auf, verhindert Duplikate und schaltet bei ended weiter", async () => {
  const { implementation, overview, revoked } = umgebungErstellen();
  await implementation.activate();
  const media = mediaElemente(overview);
  const audioInput = media.inputs[0];
  const audio = media.audios[0];
  const dateiA = { name: "eins.mp3", type: "audio/mpeg", size: 10, lastModified: 1 };
  const dateiB = { name: "zwei.ogg", type: "audio/ogg", size: 20, lastModified: 2 };
  const falsch = { name: "bild.png", type: "image/png", size: 30, lastModified: 3 };

  audioInput.files = [dateiA, dateiB, dateiA, falsch];
  audioInput.dispatch("change");

  assert.equal(media.tracks().length, 2);
  assert.match(audio.src, /eins\.mp3$/);
  audio.dispatch("ended");
  assert.match(audio.src, /zwei\.ogg$/);
  assert.equal(audio.playCalls, 1);

  await implementation.dispose();
  assert.equal(revoked.length, 2);
  assert.ok(revoked.every((url) => url.startsWith("blob:test-")));
});

test("Video-Playlist nutzt dieselbe lokale Object-URL-Mechanik und meldet Codecfehler verständlich", async () => {
  const { implementation, overview, logs } = umgebungErstellen();
  await implementation.activate();
  const media = mediaElemente(overview);
  const videoInput = media.inputs[1];
  const video = media.videos[0];

  videoInput.files = [{ name: "clip.mp4", type: "video/mp4", size: 40, lastModified: 4 }];
  videoInput.dispatch("change");
  assert.match(video.src, /clip\.mp4$/);

  video.error = { code: 4 };
  video.dispatch("error");
  const statusTexte = overview.querySelectorAll(".hq-media-status").map((element) => element.textContent);
  assert.ok(statusTexte.some((wert) => wert.includes("Format oder Codec")));
  assert.ok(logs.some((eintrag) => eintrag.scope === "HEADQUARTER" && /Wiedergabe fehlgeschlagen/.test(eintrag.message)));
});

test("Headquarter-CSS ist ein statisches Licht-Overlay ohne Daueranimation und wird lokal geladen", () => {
  assert.match(CSS, /\.hq-lamp\[data-tone="success"\]/);
  assert.match(CSS, /box-shadow:/);
  assert.doesNotMatch(CSS, /@keyframes|animation\s*:/i);
  assert.match(CSS, /@media \(max-width: 760px\)/);

  const projectData = INDEX.indexOf('href="assets/project-data.css"');
  const headquarter = INDEX.indexOf('href="assets/headquarter-dashboard.css"');
  assert.ok(projectData >= 0);
  assert.ok(headquarter > projectData);
});

test("Registry enthält das Headquarter genau einmal mit lokalem Modulpfad", () => {
  const treffer = REGISTRY.match(/id: "headquarter-dashboard"/g) || [];
  assert.equal(treffer.length, 1);
  assert.match(REGISTRY, /entry: "modules\/headquarter-dashboard\/index\.js"/);
  assert.match(REGISTRY, /slots: \["overview"\]/);
  assert.match(REGISTRY, /session-playlist/);
});
