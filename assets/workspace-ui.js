(() => {
  "use strict";

  let logger = () => {};
  let workspace = null;
  let elemente = null;
  let initialisiert = false;

  const log = (stufe, nachricht, daten) => {
    logger(stufe, "WORKSPACE", nachricht, daten);
  };

  const elementeLesen = () => {
    const panels = new Map(
      [...document.querySelectorAll("[data-workspace-panel]")].map((panel) => [
        panel.dataset.workspacePanel,
        panel,
      ]),
    );
    const schalter = new Map(
      [...document.querySelectorAll("[data-layout-panel]")].map((input) => [
        input.dataset.layoutPanel,
        input,
      ]),
    );

    return {
      bereich: document.querySelector("#quickbar"),
      toggle: document.querySelector("#layout-toggle"),
      menue: document.querySelector("#layout-menu"),
      alleAnzeigen: document.querySelector("#layout-show-all"),
      zuruecksetzen: document.querySelector("#layout-reset"),
      status: document.querySelector("#layout-status"),
      zusammenfassung: document.querySelector("#layout-summary"),
      panels,
      schalter,
    };
  };

  const strukturPruefen = (werte) => {
    const pflicht = [
      "bereich",
      "toggle",
      "menue",
      "alleAnzeigen",
      "zuruecksetzen",
      "status",
      "zusammenfassung",
    ];
    const fehlt = pflicht.filter((name) => !werte[name]);
    if (fehlt.length) throw new Error(`Layout-Oberfläche unvollständig: ${fehlt.join(", ")}.`);

    for (const definition of workspace.PANEL_DEFINITIONEN) {
      if (!werte.panels.has(definition.id) || !werte.schalter.has(definition.id)) {
        throw new Error(`Layout-Zuordnung fehlt für Panel ${definition.id}.`);
      }
    }
  };

  const statusMelden = (nachricht) => {
    if (elemente?.status) elemente.status.textContent = String(nachricht || "");
  };

  const zusammenfassungAktualisieren = (zustand) => {
    const gesamt = workspace.PANEL_DEFINITIONEN.length;
    const sichtbar = workspace.PANEL_DEFINITIONEN.filter(
      (definition) => zustand.panels[definition.id]?.visible === true,
    ).length;
    elemente.zusammenfassung.textContent = `Arbeitsfläche · ${sichtbar}/${gesamt} sichtbar`;
  };

  const panelGroesseAnwenden = (panel, panelZustand) => {
    const breite = panelZustand?.widthUnits;
    if (Number.isInteger(breite) && breite > 0) {
      panel.style.setProperty("--panel-spalten", String(breite));
      panel.dataset.workspaceSizeReady = "true";
    } else {
      panel.style.removeProperty("--panel-spalten");
      delete panel.dataset.workspaceSizeReady;
    }

    const hoehe = panelZustand?.heightPx;
    if (Number.isInteger(hoehe) && hoehe > 0) {
      panel.style.setProperty("--panel-hoehe", `${hoehe}px`);
    } else {
      panel.style.removeProperty("--panel-hoehe");
    }
  };

  const zustandAnwenden = (zustand) => {
    for (const definition of workspace.PANEL_DEFINITIONEN) {
      const panelZustand = zustand.panels[definition.id];
      const panel = elemente.panels.get(definition.id);
      const sichtbar = panelZustand?.visible === true;

      panel.hidden = !sichtbar;
      panelGroesseAnwenden(panel, panelZustand);
      elemente.schalter.get(definition.id).checked = sichtbar;
    }
    zusammenfassungAktualisieren(zustand);
    return zustand;
  };

  const menueSetzen = (offen, optionen = {}) => {
    const istOffen = Boolean(offen);
    elemente.menue.hidden = !istOffen;
    elemente.toggle.setAttribute("aria-expanded", String(istOffen));

    if (istOffen && optionen.fokus !== false) {
      elemente.schalter.values().next().value?.focus();
    }
    if (!istOffen && optionen.fokus === true) elemente.toggle.focus();
  };

  const aktionAusfuehren = (aktion, erfolgsmeldung) => {
    try {
      const zustand = aktion();
      zustandAnwenden(zustand);
      statusMelden(erfolgsmeldung);
      return true;
    } catch (fehler) {
      log(1, "Layoutaktion fehlgeschlagen.", {
        ursache: fehler instanceof Error ? fehler.message : String(fehler),
      });
      zustandAnwenden(workspace.statusLesen());
      statusMelden("Layoutaktion nicht ausgeführt. Der bisherige Zustand bleibt erhalten.");
      return false;
    }
  };

  const panelSichtbarkeitAendern = (input) => {
    const id = input.dataset.layoutPanel;
    const sichtbar = input.checked === true;
    return aktionAusfuehren(
      () => workspace.panelSichtbarkeitSetzen(id, sichtbar),
      `${input.dataset.layoutName || id} ${sichtbar ? "eingeblendet" : "ausgeblendet"}.`,
    );
  };

  const alleAnzeigen = () =>
    aktionAusfuehren(
      () => workspace.allePanelsAnzeigen(),
      "Alle Bereiche sind wieder sichtbar.",
    );

  const standardWiederherstellen = () =>
    aktionAusfuehren(
      () => workspace.zuruecksetzen(),
      "Standardlayout wiederhergestellt.",
    );

  const ereignisseBinden = () => {
    elemente.toggle.addEventListener("click", () => {
      menueSetzen(elemente.menue.hidden);
    });

    elemente.schalter.forEach((input) => {
      input.addEventListener("change", () => panelSichtbarkeitAendern(input));
    });

    elemente.alleAnzeigen.addEventListener("click", alleAnzeigen);
    elemente.zuruecksetzen.addEventListener("click", standardWiederherstellen);

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || elemente.menue.hidden) return;
      menueSetzen(false, { fokus: true });
    });

    document.addEventListener("click", (event) => {
      if (elemente.menue.hidden || elemente.bereich.contains(event.target)) return;
      menueSetzen(false);
    });
  };

  const initialisieren = (optionen = {}) => {
    if (initialisiert) return workspace.statusLesen();
    if (!optionen.workspace || typeof optionen.workspace.statusLesen !== "function") {
      throw new TypeError("Workspace-API fehlt oder ist ungültig.");
    }

    workspace = optionen.workspace;
    if (typeof optionen.logger === "function") logger = optionen.logger;

    elemente = elementeLesen();
    strukturPruefen(elemente);
    ereignisseBinden();

    const zustand = workspace.statusLesen();
    zustandAnwenden(zustand);
    menueSetzen(false, { fokus: false });
    statusMelden("Layoutsteuerung bereit.");
    initialisiert = true;
    log(2, "Layoutsteuerung initialisiert.", { panels: workspace.PANEL_DEFINITIONEN.length });
    return zustand;
  };

  window.PROVOWARE_WORKSPACE_UI = Object.freeze({
    initialisieren,
    zustandAnwenden,
    menueSetzen,
    statusMelden,
    istInitialisiert: () => initialisiert,
  });
})();
