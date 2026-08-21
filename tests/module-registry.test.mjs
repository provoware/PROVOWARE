import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = await readFile(path.join(ROOT, "assets/module-registry.js"), "utf8");

const createRuntime = (catalog = [], implementations = {}) => {
  let sandbox;
  const scripts = [];

  const document = {
    createElement(tagName) {
      assert.equal(tagName, "script");
      const listeners = new Map();
      const script = {
        async: true,
        dataset: {},
        removed: false,
        src: "",
        addEventListener(type, listener) {
          listeners.set(type, listener);
        },
        remove() {
          this.removed = true;
        },
        dispatch(type) {
          listeners.get(type)?.();
        },
      };
      scripts.push(script);
      return script;
    },
    head: {
      append(script) {
        const id = script.dataset.provowareModule;
        const implementation = implementations[id];
        if (!implementation) {
          script.dispatch("error");
          return;
        }

        sandbox.window.PROVOWARE_MODULES.define(id, implementation);
        script.dispatch("load");
      },
    },
  };

  sandbox = {
    document,
    window: {
      PROVOWARE_MODULE_CATALOG: catalog,
      clearTimeout,
      setTimeout,
    },
  };

  vm.runInNewContext(SOURCE, sandbox, {
    filename: "assets/module-registry.js",
    timeout: 1000,
  });

  return {
    api: sandbox.window.PROVOWARE_MODULES,
    scripts,
  };
};

const validManifest = Object.freeze({
  id: "test-tool",
  name: "Test Tool",
  version: "1.0.0",
  apiVersion: "1",
  entry: "modules/test-tool/module.js",
  enabledByDefault: false,
  description: "Nur für den automatischen Test.",
  slots: ["arbeitsbereich"],
  capabilities: [],
});

test("leere Registry startet ohne Module", async () => {
  const { api } = createRuntime();
  const snapshot = await api.initialize();

  assert.equal(api.CONTRACT_VERSION, "1");
  assert.equal(snapshot.length, 0);
  assert.equal(api.getSnapshot().length, 0);
});

test("Manifest-Validierung lehnt unsichere Pfade ab", () => {
  const { api } = createRuntime();

  assert.throws(
    () =>
      api.validateManifest({
        ...validManifest,
        entry: "../fremd/module.js",
      }),
    /lokale JS-Datei/,
  );
});

test("Modul durchläuft Laden, Aktivieren, Deaktivieren und Entfernen", async () => {
  const events = [];
  const implementation = {
    async activate(context) {
      events.push(`activate:${context.id}`);
    },
    async deactivate(context) {
      events.push(`deactivate:${context.id}`);
    },
    async dispose(context) {
      events.push(`dispose:${context.id}`);
    },
  };

  const { api, scripts } = createRuntime([validManifest], {
    "test-tool": implementation,
  });

  await api.initialize();
  assert.equal(api.getSnapshot()[0].state, "registered");

  const active = await api.activate("test-tool");
  assert.equal(active.state, "active");

  const inactive = await api.deactivate("test-tool");
  assert.equal(inactive.state, "inactive");

  const removed = await api.remove("test-tool");
  assert.equal(removed.state, "registered");
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].removed, true);
  assert.deepEqual(events, [
    "activate:test-tool",
    "deactivate:test-tool",
    "dispose:test-tool",
  ]);
});

test("fehlender Moduleinstieg endet kontrolliert im Fehlerzustand", async () => {
  const { api } = createRuntime([validManifest]);
  await api.initialize();

  await assert.rejects(api.activate("test-tool"), /konnte nicht geladen werden/);
  assert.equal(api.getSnapshot()[0].state, "error");
});
