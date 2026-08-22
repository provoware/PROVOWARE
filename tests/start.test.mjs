import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import {
  anfragepfadAufloesen,
  inhaltstyp,
  laufzeitAbhaengigkeiten,
  nodeVersionPruefen,
  optionenLesen,
} from "../scripts/start.mjs";

test("Startoptionen verwenden sichere Vorgaben und prüfen den Port", () => {
  assert.deepEqual(optionenLesen([]), { browserOeffnen: true, port: 4173 });
  assert.deepEqual(optionenLesen(["--no-browser", "--port=4200"]), { browserOeffnen: false, port: 4200 });
  assert.throws(() => optionenLesen(["--port=0"]), /zwischen 1 und 65535/);
  assert.throws(() => optionenLesen(["--falsch"]), /Unbekannte Startoption/);
});

test("Abhängigkeitsliste enthält ausschließlich sortierte Laufzeitpakete", () => {
  assert.deepEqual(laufzeitAbhaengigkeiten({ dependencies: { z: "1", a: "1" }, devDependencies: { test: "1" } }), ["a", "z"]);
  assert.deepEqual(laufzeitAbhaengigkeiten({}), []);
});

test("Startprüfung lehnt eine zu alte Node-Version verständlich ab", () => {
  assert.doesNotThrow(() => nodeVersionPruefen("20.0.0"));
  assert.throws(() => nodeVersionPruefen("18.20.0"), /Node.js 20 oder neuer/);
});

test("Serverpfade bleiben im Projekt und die Startseite ist index.html", () => {
  assert.equal(path.basename(anfragepfadAufloesen("/")), "index.html");
  assert.equal(path.basename(anfragepfadAufloesen("/assets/styles.css")), "styles.css");
  assert.equal(anfragepfadAufloesen("/%2e%2e%2f%2e%2e%2fetc/passwd"), null);
  assert.equal(anfragepfadAufloesen("/%E0%A4%A"), null);
});

test("Lokale Dateien erhalten nachvollziehbare Inhaltstypen", () => {
  assert.equal(inhaltstyp("index.html"), "text/html; charset=utf-8");
  assert.equal(inhaltstyp("assets/app.js"), "text/javascript; charset=utf-8");
  assert.equal(inhaltstyp("datei.bin"), "application/octet-stream");
});
