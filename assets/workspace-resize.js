(() => {
  "use strict";

  const DESKTOP_MEDIA = "(min-width: 981px)";
  const BREITEN_SCHRITT = 1;
  const POINTER_START_SCHWELLE_PX = 4;
  const PFEILTASTEN = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

  let logger = () => {};
  let workspace = null;
  let workspaceUi = null;
  let groessenLogik = null;
  let mediaAbfrage = null;
  let panels = null;
  let griffe = null;
  let aktiveSitzung = null;
  let initialisiert = false;

  const log = (stufe, nachricht, daten) => {
    logger(stufe, "WORKSPACE", nachricht, daten);
  };

  const begrenzen = (wert, minimum, maximum) => Math.min(maximum, Math.max(minimum, wert));

  const desktopAktiv = () => {
    if (mediaAbfrage) return mediaAbfrage.matches === true;
    return Number(window.innerWidth || 0) >= 981;
  };

  const definitionLesen = (id) => {
    const definition = workspace.PANEL_DEFINITIONEN.find((eintrag) => eintrag.id === id);
    if (!definition) throw new RangeError(`Unbekannte Panel-ID: ${String(id)}.`);
    return definition;
  };

  const panelLesen = (id) => {
    const panel = panels.get(id);
    if (!panel) throw new RangeError(`Workspace-Panel nicht gefunden: ${String(id)}.`);
    return panel;
  };

  const panelNameLesen = (panel, id) => {
    const labelId = panel.getAttribute("aria-labelledby");
    const label = labelId ? document.getElementById(labelId) : null;
    return label?.textContent?.trim() || id;
  };

  const groesseText = (breite, hoehe) => {
    const hoehenText = Number.isInteger(hoehe) ? `${hoehe} px hoch` : "automatisch hoch";
    return `${breite}/12 breit, ${hoehenText}`;
  };

  const sitzungMarkieren = (id, aktiv) => {
    const panel = panels?.get(id);
    if (!panel) return;
    if (aktiv) panel.dataset.workspaceResizeActive = "true";
    else delete panel.dataset.workspaceResizeActive;
  };

  const pointerCaptureFreigeben = (sitzung) => {
    const zeiger = sitzung?.zeiger;
    if (!zeiger?.griff || !Number.isInteger(zeiger.pointerId)) return;

    try {
      if (
        typeof zeiger.griff.hasPointerCapture === "function"
        && !zeiger.griff.hasPointerCapture(zeiger.pointerId)
      ) {
        return;
      }
      zeiger.griff.releasePointerCapture?.(zeiger.pointerId);
    } catch (fehler) {
      log(3, "Pointer Capture konnte beim Aufräumen nicht freigegeben werden.", {
        panelId: sitzung.panelId,
        pointerId: zeiger.pointerId,
        ursache: fehler instanceof Error ? fehler.message : String(fehler),
      });
    }
  };

  const sitzungLoeschen = () => {
    const sitzung = aktiveSitzung;
    aktiveSitzung = null;
    if (!sitzung) return;
    sitzungMarkieren(sitzung.panelId, false);
    pointerCaptureFreigeben(sitzung);
  };

  const gespeichertenZustandAnwenden = () => {
    const zustand = workspace.statusLesen();
    workspaceUi.zustandAnwenden(zustand);
    return zustand;
  };

  const fehlerBehandeln = (nachricht, fehler) => {
    log(1, nachricht, {
      ursache: fehler instanceof Error ? fehler.message : String(fehler),
    });
    try {
      gespeichertenZustandAnwenden();
    } catch {
      // Der ursprüngliche Fehler bleibt maßgeblich; keine zweite Fehlerkaskade erzeugen.
    }
    sitzungLoeschen();
    workspaceUi.statusMelden("Größenänderung nicht ausgeführt. Die vorherige Größe bleibt erhalten.");
    return false;
  };

  const sitzungStarten = (id, eingabeArt) => {
    if (aktiveSitzung?.panelId === id && aktiveSitzung.eingabeArt === eingabeArt) {
      return aktiveSitzung;
    }
    if (aktiveSitzung) aktiveVorschauAbbrechen({ meldung: false });

    const definition = definitionLesen(id);
    const panelZustand = workspace.statusLesen().panels[id];
    if (!panelZustand) throw new Error(`Workspace-Zustand für Panel ${id} fehlt.`);

    aktiveSitzung = {
      panelId: id,
      definition,
      eingabeArt,
      startBreite: panelZustand.widthUnits,
      startHoehe: panelZustand.heightPx,
      vorschauBreite: panelZustand.widthUnits,
      vorschauHoehe: panelZustand.heightPx,
      aktiveTasten: new Set(),
      zeiger: null,
    };
    sitzungMarkieren(id, true);
    return aktiveSitzung;
  };

  const gerenderteHoeheLesen = (sitzung) => {
    const panel = panelLesen(sitzung.panelId);
    const hoehe = Math.round(panel.getBoundingClientRect().height);
    if (!Number.isFinite(hoehe) || hoehe <= 0) {
      throw new RangeError("Gerenderte Panelhöhe ist ungültig.");
    }
    return hoehe;
  };

  const rasterMessungLesen = (panel) => {
    const raster = panel.parentElement;
    if (!raster) throw new Error("Workspace-Raster für Größenberechnung nicht gefunden.");

    const containerBreitePx = raster.getBoundingClientRect().width;
    const berechnet = window.getComputedStyle?.(raster);
    const abstandText = berechnet?.columnGap || berechnet?.gap || "0";
    const spaltenAbstandPx = Number.parseFloat(abstandText);

    if (!Number.isFinite(containerBreitePx) || containerBreitePx <= 0) {
      throw new RangeError("Gerenderte Rasterbreite ist ungültig.");
    }
    if (!Number.isFinite(spaltenAbstandPx) || spaltenAbstandPx < 0) {
      throw new RangeError("Gerenderter Spaltenabstand ist ungültig.");
    }

    return { containerBreitePx, spaltenAbstandPx };
  };

  const breiteAendern = (sitzung, richtung) => {
    sitzung.vorschauBreite = begrenzen(
      sitzung.vorschauBreite + richtung * BREITEN_SCHRITT,
      sitzung.definition.mindestBreite,
      sitzung.definition.hoechstBreite,
    );
  };

  const hoeheAendern = (sitzung, richtung) => {
    const minimum = sitzung.definition.mindestHoehe;
    const maximum = sitzung.definition.hoechstHoehe;
    const schritt = groessenLogik.HOEHEN_SCHRITT_PX;

    if (sitzung.vorschauHoehe === null) {
      const gerendert = gerenderteHoeheLesen(sitzung);
      if (richtung < 0 && gerendert <= minimum) return;
      sitzung.vorschauHoehe = begrenzen(gerendert, minimum, maximum);
    }

    sitzung.vorschauHoehe = begrenzen(
      sitzung.vorschauHoehe + richtung * schritt,
      minimum,
      maximum,
    );
  };

  const vorschauAnwenden = (sitzung) => {
    workspaceUi.panelGroesseVorschauAnwenden(sitzung.panelId, {
      widthUnits: sitzung.vorschauBreite,
      heightPx: sitzung.vorschauHoehe,
    });
    const name = panelNameLesen(panelLesen(sitzung.panelId), sitzung.panelId);
    workspaceUi.statusMelden(
      `${name} Vorschau: ${groesseText(sitzung.vorschauBreite, sitzung.vorschauHoehe)}.`,
    );
  };

  const hatAenderung = (sitzung) =>
    sitzung.startBreite !== sitzung.vorschauBreite || sitzung.startHoehe !== sitzung.vorschauHoehe;

  const vorschauCommitten = () => {
    if (!aktiveSitzung) return false;
    const sitzung = aktiveSitzung;
    const quelle = sitzung.eingabeArt === "pointer" ? "Pointer" : "Tastatur";

    try {
      if (!hatAenderung(sitzung)) {
        gespeichertenZustandAnwenden();
        const name = panelNameLesen(panelLesen(sitzung.panelId), sitzung.panelId);
        workspaceUi.statusMelden(`${name}: Größe unverändert.`);
        sitzungLoeschen();
        return false;
      }

      const zustand = workspace.panelGroesseSetzen(sitzung.panelId, {
        widthUnits: sitzung.vorschauBreite,
        heightPx: sitzung.vorschauHoehe,
      });
      workspaceUi.zustandAnwenden(zustand);

      const name = panelNameLesen(panelLesen(sitzung.panelId), sitzung.panelId);
      const endstand = zustand.panels[sitzung.panelId];
      workspaceUi.statusMelden(
        `${name} auf ${groesseText(endstand.widthUnits, endstand.heightPx)} gesetzt.`,
      );
      log(2, `Panel ${sitzung.panelId} per ${quelle} geändert.`, {
        widthUnits: endstand.widthUnits,
        heightPx: endstand.heightPx,
      });
      sitzungLoeschen();
      return true;
    } catch (fehler) {
      return fehlerBehandeln(`${quelle}-Größenänderung konnte nicht übernommen werden.`, fehler);
    }
  };

  const aktiveVorschauAbbrechen = (optionen = {}) => {
    if (!aktiveSitzung) return false;
    const panelId = aktiveSitzung.panelId;

    try {
      gespeichertenZustandAnwenden();
      sitzungLoeschen();
      if (optionen.meldung !== false) {
        workspaceUi.statusMelden(
          "Größenänderung abgebrochen. Vorherige Größe bleibt erhalten.",
        );
      }
      log(2, `Größenvorschau für Panel ${panelId} abgebrochen.`);
      return true;
    } catch (fehler) {
      return fehlerBehandeln("Größenvorschau konnte nicht sauber abgebrochen werden.", fehler);
    }
  };

  const standardgroesseSetzen = (id) => {
    try {
      if (aktiveSitzung) aktiveVorschauAbbrechen({ meldung: false });
      const zustand = workspace.panelGroesseZuruecksetzen(id);
      workspaceUi.zustandAnwenden(zustand);
      const name = panelNameLesen(panelLesen(id), id);
      workspaceUi.statusMelden(`${name} auf Standardgröße zurückgesetzt.`);
      log(2, `Standardgröße für Panel ${id} wiederhergestellt.`);
      return true;
    } catch (fehler) {
      return fehlerBehandeln("Standardgröße konnte nicht wiederhergestellt werden.", fehler);
    }
  };

  const tastaturVorschauAendern = (id, taste) => {
    if (!desktopAktiv() || aktiveSitzung?.eingabeArt === "pointer") return false;

    try {
      const sitzung = sitzungStarten(id, "tastatur");
      sitzung.aktiveTasten.add(taste);

      if (taste === "ArrowLeft") breiteAendern(sitzung, -1);
      if (taste === "ArrowRight") breiteAendern(sitzung, 1);
      if (taste === "ArrowUp") hoeheAendern(sitzung, -1);
      if (taste === "ArrowDown") hoeheAendern(sitzung, 1);

      vorschauAnwenden(sitzung);
      return true;
    } catch (fehler) {
      return fehlerBehandeln("Tastatur-Größenvorschau konnte nicht berechnet werden.", fehler);
    }
  };

  const griffKeydown = (event) => {
    const id = event.currentTarget?.dataset.workspaceResizeHandle;
    if (!id || aktiveSitzung?.eingabeArt === "pointer") return;

    if (PFEILTASTEN.has(event.key)) {
      if (!desktopAktiv()) return;
      event.preventDefault();
      tastaturVorschauAendern(id, event.key);
      return;
    }

    if (event.key === "Home") {
      if (!desktopAktiv()) return;
      event.preventDefault();
      standardgroesseSetzen(id);
    }
  };

  const dokumentKeyup = (event) => {
    if (!aktiveSitzung || aktiveSitzung.eingabeArt !== "tastatur") return;
    if (!PFEILTASTEN.has(event.key) || !aktiveSitzung.aktiveTasten.has(event.key)) return;

    aktiveSitzung.aktiveTasten.delete(event.key);
    if (aktiveSitzung.aktiveTasten.size === 0) vorschauCommitten();
  };

  const dokumentKeydown = (event) => {
    if (event.key !== "Escape" || !aktiveSitzung) return;
    event.preventDefault();
    aktiveVorschauAbbrechen();
  };

  const pointerEreignisGueltig = (event) => {
    if (!Number.isInteger(event.pointerId) || event.isPrimary === false) return false;
    if (event.pointerType === "mouse" && event.button !== 0) return false;
    return true;
  };

  const pointerSitzungLesen = (event) => {
    if (!aktiveSitzung || aktiveSitzung.eingabeArt !== "pointer") return null;
    if (aktiveSitzung.zeiger?.pointerId !== event.pointerId) return null;
    return aktiveSitzung;
  };

  const griffPointerdown = (event) => {
    const id = event.currentTarget?.dataset.workspaceResizeHandle;
    if (!id || !desktopAktiv() || !pointerEreignisGueltig(event)) return;

    try {
      event.preventDefault();
      if (aktiveSitzung) aktiveVorschauAbbrechen({ meldung: false });

      const sitzung = sitzungStarten(id, "pointer");
      const panel = panelLesen(id);
      const gerenderteHoehe = gerenderteHoeheLesen(sitzung);
      const raster = rasterMessungLesen(panel);
      const griff = event.currentTarget;

      griff.setPointerCapture?.(event.pointerId);
      griff.focus?.();
      sitzung.zeiger = {
        pointerId: event.pointerId,
        griff,
        startX: event.clientX,
        startY: event.clientY,
        startHoehePx: Number.isInteger(sitzung.startHoehe) ? sitzung.startHoehe : gerenderteHoehe,
        containerBreitePx: raster.containerBreitePx,
        spaltenAbstandPx: raster.spaltenAbstandPx,
        aktiv: false,
      };

      log(3, `Pointer-Resize für Panel ${id} vorbereitet.`, {
        pointerType: event.pointerType || "unbekannt",
        containerBreitePx: raster.containerBreitePx,
        spaltenAbstandPx: raster.spaltenAbstandPx,
      });
    } catch (fehler) {
      fehlerBehandeln("Pointer-Größenänderung konnte nicht gestartet werden.", fehler);
    }
  };

  const griffPointermove = (event) => {
    const sitzung = pointerSitzungLesen(event);
    if (!sitzung || !desktopAktiv()) return;

    try {
      const deltaX = event.clientX - sitzung.zeiger.startX;
      const deltaY = event.clientY - sitzung.zeiger.startY;
      if (!sitzung.zeiger.aktiv && Math.hypot(deltaX, deltaY) < POINTER_START_SCHWELLE_PX) {
        return;
      }

      sitzung.zeiger.aktiv = true;
      const groesse = groessenLogik.groesseAusBewegung({
        startBreite: sitzung.startBreite,
        startHoehePx: sitzung.zeiger.startHoehePx,
        deltaX,
        deltaY,
        containerBreitePx: sitzung.zeiger.containerBreitePx,
        spaltenAbstandPx: sitzung.zeiger.spaltenAbstandPx,
        mindestBreite: sitzung.definition.mindestBreite,
        hoechstBreite: sitzung.definition.hoechstBreite,
        mindestHoehe: sitzung.definition.mindestHoehe,
        hoechstHoehe: sitzung.definition.hoechstHoehe,
      });

      sitzung.vorschauBreite = groesse.widthUnits;
      sitzung.vorschauHoehe = groesse.heightPx;
      vorschauAnwenden(sitzung);
      event.preventDefault();
    } catch (fehler) {
      fehlerBehandeln("Pointer-Größenvorschau konnte nicht berechnet werden.", fehler);
    }
  };

  const griffPointerup = (event) => {
    const sitzung = pointerSitzungLesen(event);
    if (!sitzung) return;

    if (!sitzung.zeiger.aktiv) {
      sitzungLoeschen();
      return;
    }

    event.preventDefault();
    vorschauCommitten();
  };

  const griffPointercancel = (event) => {
    const sitzung = pointerSitzungLesen(event);
    if (!sitzung) return;
    aktiveVorschauAbbrechen({ meldung: sitzung.zeiger.aktiv === true });
  };

  const griffPointerCaptureVerloren = (event) => {
    const sitzung = pointerSitzungLesen(event);
    if (!sitzung) return;
    aktiveVorschauAbbrechen({ meldung: sitzung.zeiger.aktiv === true });
  };

  const griffErstellen = (definition) => {
    const panel = panelLesen(definition.id);
    const name = panelNameLesen(panel, definition.id);
    const griff = document.createElement("button");

    griff.type = "button";
    griff.className = "workspace-resize-handle";
    griff.dataset.workspaceResizeHandle = definition.id;
    griff.setAttribute("aria-label", `Größe von ${name} ändern`);
    griff.setAttribute(
      "aria-keyshortcuts",
      "ArrowLeft ArrowRight ArrowUp ArrowDown Home Escape",
    );
    griff.setAttribute(
      "aria-description",
      "Ziehen ändert Breite und Höhe. Pfeile ändern Breite oder Höhe. Pos1 stellt die Standardgröße wieder her. Escape bricht ab.",
    );
    griff.title = "Größe ändern: ziehen · Pfeiltasten · Pos1 Standard · Escape Abbruch";
    griff.addEventListener("keydown", griffKeydown);
    griff.addEventListener("pointerdown", griffPointerdown);
    griff.addEventListener("pointermove", griffPointermove);
    griff.addEventListener("pointerup", griffPointerup);
    griff.addEventListener("pointercancel", griffPointercancel);
    griff.addEventListener("lostpointercapture", griffPointerCaptureVerloren);
    panel.append(griff);
    griffe.set(definition.id, griff);
  };

  const responsiveAenderung = (event) => {
    if (event.matches || !aktiveSitzung) return;
    aktiveVorschauAbbrechen({ meldung: false });
    workspaceUi.statusMelden(
      "Größenänderung auf dieser Fensterbreite nicht aktiv. Desktopgröße bleibt erhalten.",
    );
  };

  const optionenPruefen = (optionen) => {
    const fehlend = [];
    const workspaceApi = optionen.workspace;
    const uiApi = optionen.ui;
    const sizeApi = optionen.groessenLogik;

    if (!workspaceApi || !Array.isArray(workspaceApi.PANEL_DEFINITIONEN)) fehlend.push("workspace");
    if (typeof workspaceApi?.statusLesen !== "function") fehlend.push("workspace.statusLesen");
    if (typeof workspaceApi?.panelGroesseSetzen !== "function") fehlend.push("workspace.panelGroesseSetzen");
    if (typeof workspaceApi?.panelGroesseZuruecksetzen !== "function") {
      fehlend.push("workspace.panelGroesseZuruecksetzen");
    }
    if (typeof uiApi?.zustandAnwenden !== "function") fehlend.push("ui.zustandAnwenden");
    if (typeof uiApi?.panelGroesseVorschauAnwenden !== "function") {
      fehlend.push("ui.panelGroesseVorschauAnwenden");
    }
    if (typeof uiApi?.statusMelden !== "function") fehlend.push("ui.statusMelden");
    if (!Number.isInteger(sizeApi?.HOEHEN_SCHRITT_PX) || sizeApi.HOEHEN_SCHRITT_PX <= 0) {
      fehlend.push("groessenLogik.HOEHEN_SCHRITT_PX");
    }
    if (typeof sizeApi?.groesseAusBewegung !== "function") {
      fehlend.push("groessenLogik.groesseAusBewegung");
    }

    if (fehlend.length) {
      throw new TypeError(`Resize-API unvollständig: ${fehlend.join(", ")}.`);
    }
  };

  const initialisieren = (optionen = {}) => {
    if (initialisiert) return statusLesen();
    optionenPruefen(optionen);

    workspace = optionen.workspace;
    workspaceUi = optionen.ui;
    groessenLogik = optionen.groessenLogik;
    if (typeof optionen.logger === "function") logger = optionen.logger;

    panels = new Map(
      [...document.querySelectorAll("[data-workspace-panel]")].map((panel) => [
        panel.dataset.workspacePanel,
        panel,
      ]),
    );
    griffe = new Map();

    for (const definition of workspace.PANEL_DEFINITIONEN) panelLesen(definition.id);
    for (const definition of workspace.PANEL_DEFINITIONEN) griffErstellen(definition);

    document.addEventListener("keyup", dokumentKeyup);
    document.addEventListener("keydown", dokumentKeydown);

    mediaAbfrage = typeof window.matchMedia === "function"
      ? window.matchMedia(DESKTOP_MEDIA)
      : { matches: Number(window.innerWidth || 0) >= 981 };
    mediaAbfrage.addEventListener?.("change", responsiveAenderung);

    initialisiert = true;
    if (!desktopAktiv()) {
      log(2, "Resize ist bis 980 px deaktiviert; gespeicherte Desktopgrößen bleiben erhalten.");
    }
    log(2, "Resize für Tastatur und Pointer initialisiert.", { panels: griffe.size });
    return statusLesen();
  };

  const statusLesen = () => ({
    initialisiert,
    desktopAktiv: initialisiert ? desktopAktiv() : false,
    griffe: griffe?.size || 0,
    aktiveSitzung: aktiveSitzung
      ? {
          panelId: aktiveSitzung.panelId,
          eingabeArt: aktiveSitzung.eingabeArt,
          widthUnits: aktiveSitzung.vorschauBreite,
          heightPx: aktiveSitzung.vorschauHoehe,
          aktiveTasten: [...aktiveSitzung.aktiveTasten],
          pointerId: aktiveSitzung.zeiger?.pointerId ?? null,
          pointerAktiv: aktiveSitzung.zeiger?.aktiv === true,
        }
      : null,
  });

  window.PROVOWARE_WORKSPACE_RESIZE = Object.freeze({
    DESKTOP_MEDIA,
    POINTER_START_SCHWELLE_PX,
    initialisieren,
    statusLesen,
  });
})();
