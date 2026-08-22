import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = await readFile(path.join(ROOT, "assets/workspace-state.js"), "utf8");
const WORKSPACE_KEY = "provoware.allin.workspace.main.v1";
const DEBUG_KEY = "provoware.allin.debug.v1";

const alsStandardObjekt = (wert) => JSON.parse(JSON.stringify(wert));

const speicherErstellen = (startwerte = {}) => {
  const daten = new Map(Object.entries(startwerte));
  return {
    daten,
    getItem(schluessel) {
      return daten.has(schluessel) ? daten.get(schluessel) : null;
    },
    setItem(schluessel, wert) {
      daten.set(schluessel, String(wert));
    },
    removeItem(schluessel) {
      daten.delete(schluessel);
    },
  };
};

const laufzeitErstellen = (localStorage = speicherErstellen()) => {
  const sandbox = { window: { localStorage } };
  vm.runInNewContext(SOURCE, sandbox, {
    filename: "assets/workspace-state.js",
    timeout: 1000,
  });
  return sandbox.window.PROVOWARE_WORKSPACE;
};

test("Standardzustand ist vollständig und reproduzierbar", () => {
  const api = laufzeitErstellen();
  const zustand = alsStandardObjekt(api.standardzustandErstellen());

  assert.equal(api.VERTRAGSVERSION, 1);
  assert.equal(api.ARBEITSBEREICH_ID, "main");
  assert.equal(api.SPEICHER_SCHLUESSEL, WORKSPACE_KEY);
  assert.deepEqual(zustand.order, ["overview", "modules", "work", "details", "system-status"]);
  assert.equal(Object.keys(zustand.panels).length, 5);
  assert.equal(zustand.panels.work.widthUnits, 8);
});

test("Normalisierung entfernt unbekannte und doppelte Panels und ergänzt fehlende", () => {
  const api = laufzeitErstellen();
  const eingabe = {
    schemaVersion: 1,
    workspaceId: "main",
    order: ["work", "work", "alt-panel", "overview"],
    panels: {
      work: { visible: true, widthUnits: 99, heightPx: 40 },
      overview: { visible: "ja", widthUnits: 12, heightPx: null },
      "alt-panel": { visible: true, widthUnits: 1, heightPx: null },
    },
  };

  const ergebnis = api.normalisieren(eingabe);
  const zustand = alsStandardObjekt(ergebnis.zustand);

  assert.deepEqual(zustand.order, ["work", "overview", "modules", "details", "system-status"]);
  assert.equal(zustand.panels.work.widthUnits, 12);
  assert.equal(zustand.panels.work.heightPx, 360);
  assert.equal(zustand.panels.overview.visible, true);
  assert.ok(ergebnis.korrekturen.length >= 5);
  assert.equal(Object.hasOwn(zustand.panels, "alt-panel"), false);
});

test("Falsche Schema-Version fällt vollständig auf Standard zurück", () => {
  const api = laufzeitErstellen();
  const ergebnis = api.normalisieren({ schemaVersion: 99, workspaceId: "main" });
  const zustand = alsStandardObjekt(ergebnis.zustand);

  assert.deepEqual(zustand, alsStandardObjekt(api.standardzustandErstellen()));
  assert.equal(ergebnis.korrekturen.length, 1);
});

test("Beschädigtes JSON startet sicher und heilt den Workspace-Schlüssel", () => {
  const speicher = speicherErstellen({ [WORKSPACE_KEY]: "{kaputt" });
  const api = laufzeitErstellen(speicher);
  const logs = [];
  api.loggerSetzen((stufe, bereich, nachricht) => logs.push({ stufe, bereich, nachricht }));

  const zustand = alsStandardObjekt(api.initialisieren({ speicher }));
  const repariert = JSON.parse(speicher.getItem(WORKSPACE_KEY));

  assert.deepEqual(zustand, alsStandardObjekt(api.standardzustandErstellen()));
  assert.deepEqual(repariert, zustand);
  assert.ok(logs.some((eintrag) => eintrag.bereich === "WORKSPACE" && /beschädigt/.test(eintrag.nachricht)));
});

test("Zustandsänderung wird normalisiert gespeichert und wieder geladen", () => {
  const speicher = speicherErstellen();
  const api = laufzeitErstellen(speicher);
  api.initialisieren({ speicher });

  const geaendert = api.standardzustandErstellen();
  geaendert.order = ["details", "overview", "modules", "work", "system-status"];
  geaendert.panels.details.visible = false;
  geaendert.panels.work.widthUnits = 7;
  api.zustandSetzen(geaendert);

  const zweiteLaufzeit = laufzeitErstellen(speicher);
  const neuGeladen = alsStandardObjekt(zweiteLaufzeit.initialisieren({ speicher }));

  assert.equal(neuGeladen.order[0], "details");
  assert.equal(neuGeladen.panels.details.visible, false);
  assert.equal(neuGeladen.panels.work.widthUnits, 7);
});

test("Gesperrter Speicher blockiert die Sitzung nicht", () => {
  const gesperrt = {
    getItem() {
      throw new Error("Zugriff gesperrt");
    },
    setItem() {
      throw new Error("Schreiben gesperrt");
    },
    removeItem() {
      throw new Error("Löschen gesperrt");
    },
  };
  const api = laufzeitErstellen(gesperrt);
  const logs = [];
  api.loggerSetzen((stufe, bereich, nachricht) => logs.push({ stufe, bereich, nachricht }));

  assert.doesNotThrow(() => api.initialisieren({ speicher: gesperrt }));
  assert.equal(api.zustandSpeichern(), false);
  assert.doesNotThrow(() => api.zuruecksetzen());
  assert.equal(api.statusLesen().order.length, 5);
  assert.ok(logs.some((eintrag) => eintrag.stufe === 1 && eintrag.bereich === "WORKSPACE"));
});

test("Reset entfernt nur Workspace-Daten und lässt Debug-Einstellungen bestehen", () => {
  const speicher = speicherErstellen({
    [WORKSPACE_KEY]: JSON.stringify({ schemaVersion: 1, workspaceId: "main", order: [], panels: {} }),
    [DEBUG_KEY]: JSON.stringify({ visible: true, level: 2 }),
  });
  const api = laufzeitErstellen(speicher);
  api.initialisieren({ speicher });

  const zurueckgesetzt = alsStandardObjekt(api.zuruecksetzen());

  assert.equal(speicher.getItem(WORKSPACE_KEY), null);
  assert.notEqual(speicher.getItem(DEBUG_KEY), null);
  assert.deepEqual(zurueckgesetzt, alsStandardObjekt(api.standardzustandErstellen()));
});

test("Ein- und Ausblenden erhält Reihenfolge und Größenwerte", () => {
  const speicher = speicherErstellen();
  const api = laufzeitErstellen(speicher);
  api.initialisieren({ speicher });

  const vorbereitet = api.standardzustandErstellen();
  vorbereitet.order = ["details", "overview", "modules", "work", "system-status"];
  vorbereitet.panels.details.widthUnits = 10;
  vorbereitet.panels.details.heightPx = 420;
  api.zustandSetzen(vorbereitet);

  const ausgeblendet = alsStandardObjekt(api.panelSichtbarkeitSetzen("details", false));
  const eingeblendet = alsStandardObjekt(api.panelSichtbarkeitSetzen("details", true));

  assert.equal(ausgeblendet.panels.details.visible, false);
  assert.equal(eingeblendet.panels.details.visible, true);
  assert.equal(eingeblendet.order[0], "details");
  assert.equal(eingeblendet.panels.details.widthUnits, 10);
  assert.equal(eingeblendet.panels.details.heightPx, 420);
});

test("Alle Panels dürfen ausgeblendet und gemeinsam wieder angezeigt werden", () => {
  const speicher = speicherErstellen();
  const api = laufzeitErstellen(speicher);
  api.initialisieren({ speicher });

  for (const definition of api.PANEL_DEFINITIONEN) {
    api.panelSichtbarkeitSetzen(definition.id, false);
  }

  const leer = alsStandardObjekt(api.statusLesen());
  assert.ok(Object.values(leer.panels).every((panel) => panel.visible === false));

  const wiederhergestellt = alsStandardObjekt(api.allePanelsAnzeigen());
  assert.ok(Object.values(wiederhergestellt.panels).every((panel) => panel.visible === true));
  assert.deepEqual(wiederhergestellt.order, leer.order);
});

test("Unbekannte Panel-ID verändert den gültigen Zustand nicht", () => {
  const api = laufzeitErstellen();
  api.initialisieren({ speicher: speicherErstellen() });
  const vorher = alsStandardObjekt(api.statusLesen());

  assert.throws(() => api.panelSichtbarkeitSetzen("unbekannt", false), /Unbekannte Panel-ID/);
  assert.deepEqual(alsStandardObjekt(api.statusLesen()), vorher);
});
