import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  RECOVERY_ENVELOPE_RELATIVE_DIR,
  RECOVERY_JOURNAL_RELATIVE_PATH,
  isProtectedRecoveryEnvelopePath,
} from "../scripts/recovery-envelope.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(ROOT, relativePath), "utf8");

test("Server routet Envelope vor Legacy-Recovery und prüft Journal vor dem Listen-Port", async () => {
  const source = await read("scripts/start.mjs");
  const envelopeRoute = source.indexOf("handleRecoveryEnvelopeApi(anfrage, antwort");
  const projectRoute = source.indexOf("handleProjectDataApi(anfrage, antwort");
  const recovery = source.indexOf("recoverInterruptedEnvelopeTransaction({ root: ROOT })");
  const server = source.indexOf("serverStarten(optionen.port)");

  assert.ok(envelopeRoute >= 0, "Envelope-Router fehlt.");
  assert.ok(projectRoute > envelopeRoute, "Envelope-Router muss vor Legacy-Project-Data-Recovery laufen.");
  assert.ok(recovery >= 0 && recovery < server, "Journal-Recovery muss vor dem Serverstart laufen.");
  assert.match(source, /isProtectedRecoveryEnvelopePath\(datei, ROOT\)/);
});

test("Envelope-Backups und Journalpfad sind gegen statische Direktauslieferung geschützt", () => {
  assert.equal(
    isProtectedRecoveryEnvelopePath(path.join(ROOT, RECOVERY_ENVELOPE_RELATIVE_DIR, "probe.pwenvelope"), ROOT),
    true,
  );
  assert.equal(
    isProtectedRecoveryEnvelopePath(path.join(ROOT, RECOVERY_JOURNAL_RELATIVE_PATH), ROOT),
    true,
  );
  assert.equal(isProtectedRecoveryEnvelopePath(path.join(ROOT, "index.html"), ROOT), false);
});

test("Runtime-Dateien von Recovery Envelope bleiben aus Git ausgeschlossen", async () => {
  const ignore = await read("data/.gitignore");
  const lines = ignore.split(/\r?\n/).map((line) => line.trim());
  assert.ok(lines.includes("backups/"));
  assert.ok(lines.includes("recovery/"));
});
