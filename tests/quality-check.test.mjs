import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { symlink, unlink } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FEHLERPROBE = path.join(ROOT, ".quality-check-fehlerprobe.md");

test("unerwarteter Dateifehler endet kontrolliert und verständlich", async () => {
  await symlink(".nicht-vorhandenes-ziel", FEHLERPROBE);

  try {
    const ergebnis = spawnSync(process.execPath, ["scripts/quality-check.mjs"], {
      cwd: ROOT,
      encoding: "utf8",
    });

    assert.equal(ergebnis.status, 1);
    assert.match(ergebnis.stderr, /QUALITY GATE: INTERNER FEHLER/);
    assert.match(ergebnis.stderr, /Prüfung konnte nicht abgeschlossen werden/);
    assert.match(ergebnis.stderr, /Nächster Schritt: Dateizugriffe prüfen/);
    assert.doesNotMatch(ergebnis.stderr, /node:internal|\n\s+at async/);
  } finally {
    await unlink(FEHLERPROBE);
  }
});
