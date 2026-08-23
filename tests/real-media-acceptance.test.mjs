import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO = path.join(ROOT, "tests/fixtures/media/test-tone.wav");
const VIDEO = path.join(ROOT, "tests/fixtures/media/test-card.webm");
const E2E = path.join(ROOT, "tests/browser/headquarter-media.e2e.spec.mjs");

test("H1-Audiofixture ist eine kleine echte PCM-WAV-Datei", async () => {
  const [daten, meta] = await Promise.all([readFile(AUDIO), stat(AUDIO)]);
  assert.equal(daten.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(daten.subarray(8, 12).toString("ascii"), "WAVE");
  assert.ok(meta.size > 1_000, "Audiofixture darf kein leerer Platzhalter sein.");
  assert.ok(meta.size < 20_000, "Audiofixture soll klein und repository-tauglich bleiben.");
});

test("H1-Videofixture ist eine kleine echte WebM-Datei", async () => {
  const [daten, meta] = await Promise.all([readFile(VIDEO), stat(VIDEO)]);
  assert.deepEqual([...daten.subarray(0, 4)], [0x1a, 0x45, 0xdf, 0xa3]);
  assert.ok(meta.size > 300, "Videofixture darf kein leerer Platzhalter sein.");
  assert.ok(meta.size < 10_000, "Videofixture soll klein und repository-tauglich bleiben.");
});

test("H1-Browsertest verwendet beide echten Fixtures und prüft reale Wiedergabe", async () => {
  const quelle = await readFile(E2E, "utf8");
  assert.match(quelle, /tests\/fixtures\/media\/test-tone\.wav/);
  assert.match(quelle, /tests\/fixtures\/media\/test-card\.webm/);
  assert.match(quelle, /await element\.play\(\)/);
  assert.match(quelle, /currentTime/);
  assert.match(quelle, /videoWidth/);
  assert.match(quelle, /defekt\.mp3/);
  assert.match(quelle, /Format oder Codec/);
});
