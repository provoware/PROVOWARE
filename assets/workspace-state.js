(() => {
  "use strict";

  const VERTRAGSVERSION = 1;
  const ARBEITSBEREICH_ID = "main";
  const SPEICHER_SCHLUESSEL = "provoware.allin.workspace.main.v1";

  const PANEL_DEFINITIONEN = Object.freeze([
    Object.freeze({
      id: "overview",
      region: "main",
      standardReihenfolge: 0,
      standardSichtbar: true,
      standardBreite: 12,
      mindestBreite: 6,
      hoechstBreite: 12,
      standardHoehe: null,
      mindestHoehe: 148,
      hoechstHoehe: 1200,
    }),
    Object.freeze({
      id: "modules",
      region: "main",
      standardReihenfolge: 1,
      standardSichtbar: true,
      standardBreite: 4,
      mindestBreite: 4,
      hoechstBreite: 12,
      standardHoehe: null,
      mindestHoehe: 220,
      hoechstHoehe: 1200,
    }),
    Object.freeze({
      id: "work",
      region: "main",
      standardReihenfolge: 2,
      standardSichtbar: true,
      standardBreite: 8,
      mindestBreite: 6,
      hoechstBreite: 12,
      standardHoehe: null,
      mindestHoehe: 360,
      hoechstHoehe: 1200,
    }),
    Object.freeze({
      id: "details",
      region: "main",
      standardReihenfolge: 3,
      standardSichtbar: true,
      standardBreite: 4,
      mindestBreite: 4,
      hoechstBreite: 12,
      standardHoehe: null,
      mindestHoehe: 220,
      hoechstHoehe: 1200,
    }),
    Object.freeze({
      id: "system-status",
      region: "main",
      standardReihenfolge: 4,
      standardSichtbar: true,
      standardBreite: 12,
      mindestBreite: 6,
      hoechstBreite: 12,
      standardHoehe: null,
      mindestHoehe: 148,
      hoechstHoehe: 1200,
    }),
  ]);

  const DEFINITION_NACH_ID = new Map(PANEL_DEFINITIONEN.map((panel) => [panel.id, panel]));
  const STANDARD_REIHENFOLGE = Object.freeze(PANEL_DEFINITIONEN.map((panel) => panel.id));

  let logger = () => {};
  let aktiverSpeicher = null;
  let zustand = null;

  const log = (stufe, nachricht, daten) => {
    logger(stufe, "WORKSPACE", nachricht, daten);
  };

  const istObjekt = (wert) => Boolean(wert) && typeof wert === "object" && !Array.isArray(wert);

  const klonen = (wert) => JSON.parse(JSON.stringify(wert));

  const begrenzen = (wert, minimum, maximum) => Math.min(maximum, Math.max(minimum, wert));

  const panelStandardErstellen = (definition) => ({
    visible: definition.standardSichtbar,
    widthUnits: definition.standardBreite,
    heightPx: definition.standardHoehe,
  });

  const standardzustandErstellen = () => ({
    schemaVersion: VERTRAGSVERSION,
    workspaceId: ARBEITSBEREICH_ID,
    order: [...STANDARD_REIHENFOLGE],
    panels: Object.fromEntries(
      PANEL_DEFINITIONEN.map((definition) => [definition.id, panelStandardErstellen(definition)]),
    ),
  });

  const korrekturHinzufuegen = (korrekturen, feld, grund) => {
    korrekturen.push({ feld, grund });
  };

  const reihenfolgeNormalisieren = (eingabe, korrekturen) => {
    if (!Array.isArray(eingabe)) {
      korrekturHinzufuegen(korrekturen, "order", "Standardreihenfolge verwendet");
      return [...STANDARD_REIHENFOLGE];
    }

    const gesehen = new Set();
    const ergebnis = [];

    for (const id of eingabe) {
      if (typeof id !== "string" || !DEFINITION_NACH_ID.has(id)) {
        korrekturHinzufuegen(korrekturen, "order", `Unbekannter Eintrag entfernt: ${String(id)}`);
        continue;
      }
      if (gesehen.has(id)) {
        korrekturHinzufuegen(korrekturen, "order", `Doppelter Eintrag entfernt: ${id}`);
        continue;
      }
      gesehen.add(id);
      ergebnis.push(id);
    }

    for (const id of STANDARD_REIHENFOLGE) {
      if (gesehen.has(id)) continue;
      korrekturHinzufuegen(korrekturen, "order", `Fehlendes Panel ergänzt: ${id}`);
      ergebnis.push(id);
    }

    return ergebnis;
  };

  const sichtbarkeitNormalisieren = (definition, wert, korrekturen) => {
    if (typeof wert === "boolean") return wert;
    korrekturHinzufuegen(korrekturen, `${definition.id}.visible`, "Standardwert verwendet");
    return definition.standardSichtbar;
  };

  const breiteNormalisieren = (definition, wert, korrekturen) => {
    if (!Number.isInteger(wert)) {
      korrekturHinzufuegen(korrekturen, `${definition.id}.widthUnits`, "Standardbreite verwendet");
      return definition.standardBreite;
    }

    const begrenzt = begrenzen(wert, definition.mindestBreite, definition.hoechstBreite);
    if (begrenzt !== wert) {
      korrekturHinzufuegen(korrekturen, `${definition.id}.widthUnits`, `Auf ${begrenzt} begrenzt`);
    }
    return begrenzt;
  };

  const hoeheNormalisieren = (definition, wert, korrekturen) => {
    if (wert === null) return null;
    if (!Number.isInteger(wert) || wert <= 0) {
      korrekturHinzufuegen(korrekturen, `${definition.id}.heightPx`, "Automatische Höhe verwendet");
      return definition.standardHoehe;
    }

    const begrenzt = begrenzen(wert, definition.mindestHoehe, definition.hoechstHoehe);
    if (begrenzt !== wert) {
      korrekturHinzufuegen(korrekturen, `${definition.id}.heightPx`, `Auf ${begrenzt} px begrenzt`);
    }
    return begrenzt;
  };

  const panelNormalisieren = (definition, eingabe, korrekturen) => {
    if (!istObjekt(eingabe)) {
      korrekturHinzufuegen(korrekturen, definition.id, "Standardzustand des Panels verwendet");
      return panelStandardErstellen(definition);
    }

    return {
      visible: sichtbarkeitNormalisieren(definition, eingabe.visible, korrekturen),
      widthUnits: breiteNormalisieren(definition, eingabe.widthUnits, korrekturen),
      heightPx: hoeheNormalisieren(definition, eingabe.heightPx, korrekturen),
    };
  };

  const panelsNormalisieren = (eingabe, korrekturen) => {
    const quelle = istObjekt(eingabe) ? eingabe : {};
    if (!istObjekt(eingabe)) korrekturHinzufuegen(korrekturen, "panels", "Standardpaneldaten verwendet");

    for (const id of Object.keys(quelle)) {
      if (!DEFINITION_NACH_ID.has(id)) {
        korrekturHinzufuegen(korrekturen, `panels.${id}`, "Unbekanntes Panel ignoriert");
      }
    }

    return Object.fromEntries(
      PANEL_DEFINITIONEN.map((definition) => [
        definition.id,
        panelNormalisieren(definition, quelle[definition.id], korrekturen),
      ]),
    );
  };

  const normalisieren = (eingabe) => {
    const korrekturen = [];

    if (!istObjekt(eingabe)) {
      return {
        zustand: standardzustandErstellen(),
        korrekturen: [{ feld: "workspace", grund: "Ungültige Daten; Standardlayout verwendet" }],
      };
    }

    if (eingabe.schemaVersion !== VERTRAGSVERSION || eingabe.workspaceId !== ARBEITSBEREICH_ID) {
      return {
        zustand: standardzustandErstellen(),
        korrekturen: [{ feld: "workspace", grund: "Unpassende Version oder Workspace-ID; Standardlayout verwendet" }],
      };
    }

    return {
      zustand: {
        schemaVersion: VERTRAGSVERSION,
        workspaceId: ARBEITSBEREICH_ID,
        order: reihenfolgeNormalisieren(eingabe.order, korrekturen),
        panels: panelsNormalisieren(eingabe.panels, korrekturen),
      },
      korrekturen,
    };
  };

  const browserSpeicherErmitteln = () => {
    try {
      return window.localStorage || null;
    } catch (fehler) {
      log(1, "Lokaler Workspace-Speicher ist nicht verfügbar.", {
        ursache: fehler instanceof Error ? fehler.message : String(fehler),
      });
      return null;
    }
  };

  const gespeichertenTextLesen = (speicher) => {
    if (!speicher) return { text: null, fehler: null };

    try {
      return { text: speicher.getItem(SPEICHER_SCHLUESSEL), fehler: null };
    } catch (fehler) {
      return { text: null, fehler };
    }
  };

  const textSicherParsen = (text) => {
    if (text === null) return { wert: null, fehler: null };

    try {
      return { wert: JSON.parse(text), fehler: null };
    } catch (fehler) {
      return { wert: null, fehler };
    }
  };

  const zustandSchreiben = (speicher, naechsterZustand) => {
    if (!speicher) return false;

    try {
      speicher.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(naechsterZustand));
      return true;
    } catch (fehler) {
      log(1, "Workspace-Zustand konnte nicht lokal gespeichert werden.", {
        ursache: fehler instanceof Error ? fehler.message : String(fehler),
      });
      return false;
    }
  };

  const zustandLoeschen = (speicher) => {
    if (!speicher) return false;

    try {
      speicher.removeItem(SPEICHER_SCHLUESSEL);
      return true;
    } catch (fehler) {
      log(1, "Workspace-Zustand konnte nicht aus dem lokalen Speicher entfernt werden.", {
        ursache: fehler instanceof Error ? fehler.message : String(fehler),
      });
      return false;
    }
  };

  const korrekturenProtokollieren = (korrekturen) => {
    if (!korrekturen.length) return;
    log(2, `Workspace-Zustand wurde an ${korrekturen.length} Stelle(n) sicher korrigiert.`, {
      korrekturen,
    });
  };

  const ausSpeicherLaden = (speicher) => {
    const gelesen = gespeichertenTextLesen(speicher);
    if (gelesen.fehler) {
      log(1, "Workspace-Zustand konnte nicht gelesen werden; Standardlayout wird verwendet.", {
        ursache: gelesen.fehler instanceof Error ? gelesen.fehler.message : String(gelesen.fehler),
      });
      return { zustand: standardzustandErstellen(), repariert: false };
    }

    if (gelesen.text === null) return { zustand: standardzustandErstellen(), repariert: false };

    const geparst = textSicherParsen(gelesen.text);
    if (geparst.fehler) {
      log(1, "Gespeicherter Workspace-Zustand ist beschädigt; Standardlayout wird verwendet.", {
        ursache: geparst.fehler.message,
      });
      return { zustand: standardzustandErstellen(), repariert: true };
    }

    const normalisiert = normalisieren(geparst.wert);
    korrekturenProtokollieren(normalisiert.korrekturen);
    return {
      zustand: normalisiert.zustand,
      repariert: normalisiert.korrekturen.length > 0,
    };
  };

  const initialisieren = (optionen = {}) => {
    aktiverSpeicher = optionen.speicher === undefined ? browserSpeicherErmitteln() : optionen.speicher;

    const geladen = ausSpeicherLaden(aktiverSpeicher);
    zustand = geladen.zustand;

    if (geladen.repariert) zustandSchreiben(aktiverSpeicher, zustand);

    log(2, "Workspace-Zustandsverwaltung initialisiert.", {
      panels: zustand.order.length,
      speicherAktiv: Boolean(aktiverSpeicher),
    });
    return klonen(zustand);
  };

  const zustandSpeichern = () => {
    if (!zustand) zustand = standardzustandErstellen();
    const gespeichert = zustandSchreiben(aktiverSpeicher, zustand);
    if (gespeichert) log(2, "Workspace-Zustand lokal gespeichert.");
    return gespeichert;
  };

  const zustandSetzen = (eingabe, optionen = {}) => {
    const normalisiert = normalisieren(eingabe);
    zustand = normalisiert.zustand;
    korrekturenProtokollieren(normalisiert.korrekturen);

    if (optionen.speichern !== false) zustandSpeichern();
    return klonen(zustand);
  };

  const zuruecksetzen = () => {
    zustandLoeschen(aktiverSpeicher);
    zustand = standardzustandErstellen();
    log(1, "Standardlayout wiederhergestellt.");
    return klonen(zustand);
  };

  const statusLesen = () => klonen(zustand || standardzustandErstellen());

  const loggerSetzen = (naechsterLogger) => {
    if (typeof naechsterLogger !== "function") {
      throw new TypeError("Workspace-Logger muss eine Funktion sein.");
    }
    logger = naechsterLogger;
  };

  window.PROVOWARE_WORKSPACE = Object.freeze({
    VERTRAGSVERSION,
    ARBEITSBEREICH_ID,
    SPEICHER_SCHLUESSEL,
    PANEL_DEFINITIONEN,
    initialisieren,
    normalisieren,
    standardzustandErstellen,
    zustandSetzen,
    zustandSpeichern,
    zuruecksetzen,
    statusLesen,
    loggerSetzen,
  });
})();
