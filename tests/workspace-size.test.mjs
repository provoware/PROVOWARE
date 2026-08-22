import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = await readFile(path.join(ROOT, "assets/workspace-size.js"), "utf8");

const laufzeitErstellen = () => {
  const sandbox = { window: {} };
  vm.runInNewContext(SOURCE, sandbox, {
    filename: "assets/workspace-size.js",
    timeout: 1000,
  });
  return sandbox.window.PROVOWARE_WORKSPACE_SIZE;
};

test("Rastermetrik berücksichtigt den realen Spaltenabstand", () => {
  const api = laufzeitErstellen();
  const metrik = api.rasterMetrikBerechnen({
    containerBreitePx: 1310,
    spaltenAbstandPx: 10,
  });

  assert.equal(metrik.spalten, 12);
  assert.equal(metrik.spaltenBreitePx, 100);
  assert.equal(metrik.rasterSchrittPx, 110);
});

test("Horizontale Bewegung wird symmetrisch auf Rastereinheiten gerundet", () => {
  const api = laufzeitErstellen();
  const basis = {
    startBreite: 6,
    containerBreitePx: 1310,
    spaltenAbstandPx: 10,
    mindestBreite: 4,
    hoechstBreite: 12,
  };

  assert.equal(api.breiteAusBewegung({ ...basis, deltaX: 55 }), 7);
  assert.equal(api.breiteAusBewegung({ ...basis, deltaX: -55 }), 5);
  assert.equal(api.breiteAusBewegung({ ...basis, deltaX: 219 }), 8);
});

test("Breitenberechnung hält individuelle Mindest- und Höchstgrenzen ein", () => {
  const api = laufzeitErstellen();
  const basis = {
    startBreite: 8,
    containerBreitePx: 1310,
    spaltenAbstandPx: 10,
    mindestBreite: 6,
    hoechstBreite: 10,
  };

  assert.equal(api.breiteAusBewegung({ ...basis, deltaX: -5000 }), 6);
  assert.equal(api.breiteAusBewegung({ ...basis, deltaX: 5000 }), 10);
});

test("Vertikale Bewegung rastet in 24-Pixel-Schritten und bleibt in Grenzen", () => {
  const api = laufzeitErstellen();
  const basis = {
    startHoehePx: 360,
    mindestHoehe: 360,
    hoechstHoehe: 1200,
  };

  assert.equal(api.hoeheAusBewegung({ ...basis, deltaY: 12 }), 384);
  assert.equal(api.hoeheAusBewegung({ ...basis, deltaY: -12 }), 360);
  assert.equal(api.hoeheAusBewegung({ ...basis, deltaY: 48 }), 408);
  assert.equal(api.hoeheAusBewegung({ ...basis, deltaY: 5000 }), 1200);
});

test("Kombinierte Größenberechnung liefert bei gleicher Eingabe dasselbe Ergebnis", () => {
  const api = laufzeitErstellen();
  const eingabe = {
    startBreite: 4,
    startHoehePx: 220,
    deltaX: 220,
    deltaY: 48,
    containerBreitePx: 1310,
    spaltenAbstandPx: 10,
    mindestBreite: 4,
    hoechstBreite: 12,
    mindestHoehe: 220,
    hoechstHoehe: 1200,
  };

  const erstes = api.groesseAusBewegung(eingabe);
  const zweites = api.groesseAusBewegung(eingabe);

  assert.deepEqual(erstes, { widthUnits: 6, heightPx: 268 });
  assert.deepEqual(zweites, erstes);
});

test("Ungültige Rastermetrik wird früh und reproduzierbar abgelehnt", () => {
  const api = laufzeitErstellen();

  assert.throws(
    () => api.rasterMetrikBerechnen({ containerBreitePx: 100, spaltenAbstandPx: 20 }),
    /größer als die Summe der Spaltenabstände/,
  );
  assert.throws(
    () =>
      api.breiteAusBewegung({
        startBreite: 4,
        deltaX: Number.NaN,
        containerBreitePx: 1310,
        spaltenAbstandPx: 10,
        mindestBreite: 4,
        hoechstBreite: 12,
      }),
    /deltaX/,
  );
});
