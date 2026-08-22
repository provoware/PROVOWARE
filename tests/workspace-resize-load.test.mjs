import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_HTML = await readFile(path.join(ROOT, "index.html"), "utf8");

const REIHENFOLGE = [
  "assets/workspace-state.js",
  "assets/workspace-size.js",
  "assets/workspace-ui.js",
  "assets/workspace-resize.js",
  "assets/app.js",
];

test("Workspace-Resize-Abhängigkeiten werden in sicherer Reihenfolge geladen", () => {
  const positionen = REIHENFOLGE.map((datei) => INDEX_HTML.indexOf(`src="${datei}"`));

  assert.ok(positionen.every((position) => position >= 0));
  assert.ok(positionen.every((position, index) => index === 0 || positionen[index - 1] < position));
});
