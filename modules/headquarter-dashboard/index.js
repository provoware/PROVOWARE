(() => {
  "use strict";

  const MODUL_ID = "headquarter-dashboard";
  const MODUL_VERSION = "0.4.4";
  const VERSION_DATEI = "VERSION.json";
  const AUDIO_ENDUNGEN = new Set(["mp3", "wav", "ogg", "oga", "m4a", "aac", "flac", "opus"]);
  const VIDEO_ENDUNGEN = new Set(["mp4", "webm", "ogv", "mov", "m4v"]);

  let wurzel = null;
  let resizeHandler = null;
  let refreshTimer = null;
  let audioPlaylist = null;
  let videoPlaylist = null;
  let infoElemente = null;

  const log = (stufe, nachricht, daten) => {
    window.PROVOWARE_DEBUG?.log(stufe, "HEADQUARTER", nachricht, daten);
  };

  const elementErstellen = (tag, klasse, text) => {
    const element = document.createElement(tag);
    if (klasse) element.className = klasse;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const dateiEndung = (name) => {
    const teile = String(name || "").toLowerCase().split(".");
    return teile.length > 1 ? teile.pop() : "";
  };

  const dateiPasst = (datei, art) => {
    const typ = String(datei?.type || "").toLowerCase();
    if (typ.startsWith(`${art}/`)) return true;
    const endung = dateiEndung(datei?.name);
    return art === "audio" ? AUDIO_ENDUNGEN.has(endung) : VIDEO_ENDUNGEN.has(endung);
  };

  const dateiKennung = (datei) => [
    String(datei?.name || ""),
    Number(datei?.size || 0),
    Number(datei?.lastModified || 0),
    String(datei?.type || ""),
  ].join("|");

  const bytesFormatieren = (wert) => {
    if (!Number.isFinite(wert) || wert < 0) return "nicht verfügbar";
    if (wert < 1024) return `${Math.round(wert)} B`;
    const einheiten = ["KB", "MB", "GB", "TB"];
    let zahl = wert / 1024;
    let index = 0;
    while (zahl >= 1024 && index < einheiten.length - 1) {
      zahl /= 1024;
      index += 1;
    }
    const stellen = zahl >= 100 ? 0 : zahl >= 10 ? 1 : 2;
    return `${zahl.toFixed(stellen)} ${einheiten[index]}`;
  };

  const statusSetzen = (element, nachricht, ton = "info") => {
    element.textContent = nachricht;
    element.dataset.tone = ton;
  };

  const versionLesen = async () => {
    if (window.location.protocol === "file:") return null;
    try {
      const antwort = await fetch(VERSION_DATEI, { cache: "no-store" });
      if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
      const daten = await antwort.json();
      return daten && typeof daten === "object" ? daten : null;
    } catch (fehler) {
      log(2, "Versionsinformationen konnten nicht geladen werden.", {
        ursache: fehler instanceof Error ? fehler.message : String(fehler),
      });
      return null;
    }
  };

  const speicherInfoLesen = async () => {
    if (typeof navigator.storage?.estimate !== "function") return null;
    try {
      const daten = await navigator.storage.estimate();
      return {
        usage: Number(daten?.usage),
        quota: Number(daten?.quota),
      };
    } catch (fehler) {
      log(3, "Browser-Speicherinfo nicht verfügbar.", {
        ursache: fehler instanceof Error ? fehler.message : String(fehler),
      });
      return null;
    }
  };

  const modulInfoLesen = () => {
    const snapshot = window.PROVOWARE_MODULES?.getSnapshot?.() || [];
    const aktiv = snapshot.filter((eintrag) => eintrag.state === "active").length;
    const fehler = snapshot.filter((eintrag) => eintrag.state === "error").length;
    return { gesamt: snapshot.length, aktiv, fehler };
  };

  const workspaceInfoLesen = () => {
    const api = window.PROVOWARE_WORKSPACE;
    if (!api?.statusLesen || !Array.isArray(api.PANEL_DEFINITIONEN)) return null;
    const zustand = api.statusLesen();
    const gesamt = api.PANEL_DEFINITIONEN.length;
    const sichtbar = api.PANEL_DEFINITIONEN.filter(
      (definition) => zustand.panels?.[definition.id]?.visible === true,
    ).length;
    return { gesamt, sichtbar };
  };

  const toolInfoLesen = async () => {
    const [version, speicher] = await Promise.all([versionLesen(), speicherInfoLesen()]);
    return {
      version,
      speicher,
      module: modulInfoLesen(),
      workspace: workspaceInfoLesen(),
      startmodus: window.location.protocol === "file:" ? "Direktstart" : "Klick-&-Start",
      viewport: `${window.innerWidth} × ${window.innerHeight}`,
      cpuThreads: Number.isInteger(navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : null,
      geraeteSpeicher: Number.isFinite(navigator.deviceMemory) ? navigator.deviceMemory : null,
    };
  };

  const infoWertSetzen = (name, wert) => {
    const ziel = infoElemente?.werte.get(name);
    if (ziel) ziel.textContent = String(wert);
  };

  const lampeSetzen = (name, text, ton) => {
    const lampe = infoElemente?.lampen.get(name);
    if (!lampe) return;
    lampe.dataset.tone = ton;
    lampe.querySelector("span:last-child").textContent = text;
  };

  const toolInfoRendern = (info) => {
    const release = info.version?.version || "nicht geladen";
    const entwicklung = info.version?.development_phase || `Dashboard-Modul ${MODUL_VERSION}`;
    infoWertSetzen("version", `${release} · ${entwicklung}`);
    infoWertSetzen("startmodus", info.startmodus);
    infoWertSetzen("viewport", info.viewport);
    infoWertSetzen("cpu", info.cpuThreads ? `${info.cpuThreads} logische Threads` : "nicht verfügbar");
    infoWertSetzen(
      "ram",
      info.geraeteSpeicher ? `ca. ${info.geraeteSpeicher} GB Gerätehinweis` : "nicht verfügbar",
    );

    const speicherText = info.speicher
      ? `${bytesFormatieren(info.speicher.usage)} / ${bytesFormatieren(info.speicher.quota)}`
      : "nicht verfügbar";
    infoWertSetzen("speicher", speicherText);

    const moduleText = `${info.module.aktiv}/${info.module.gesamt} aktiv`;
    infoWertSetzen("module", info.module.fehler ? `${moduleText} · ${info.module.fehler} Fehler` : moduleText);

    const workspaceText = info.workspace
      ? `${info.workspace.sichtbar}/${info.workspace.gesamt} sichtbar`
      : "nicht verfügbar";
    infoWertSetzen("workspace", workspaceText);

    lampeSetzen(
      "runtime",
      info.startmodus === "Klick-&-Start" ? "Projektmodus bereit" : "Direktstart · Schreiben begrenzt",
      info.startmodus === "Klick-&-Start" ? "success" : "warning",
    );
    lampeSetzen(
      "module",
      info.module.fehler ? `${info.module.fehler} Modulfehler` : "Module ohne Fehler",
      info.module.fehler ? "error" : "success",
    );
    lampeSetzen(
      "workspace",
      info.workspace ? "Workspace verbunden" : "Workspace nicht verfügbar",
      info.workspace ? "success" : "warning",
    );
  };

  const toolInfoAktualisieren = async () => {
    if (!wurzel) return;
    try {
      const info = await toolInfoLesen();
      if (!wurzel) return;
      toolInfoRendern(info);
      statusSetzen(infoElemente.status, "Tool-Informationen aktualisiert.", "success");
    } catch (fehler) {
      statusSetzen(infoElemente.status, "Tool-Informationen konnten nicht vollständig gelesen werden.", "warning");
      log(1, "Dashboard-Informationen konnten nicht aktualisiert werden.", {
        ursache: fehler instanceof Error ? fehler.message : String(fehler),
      });
    }
  };

  const playlistErstellen = ({ art, titel, playerTag, accept, beiAenderung }) => {
    const zustand = {
      eintraege: [],
      aktiv: -1,
    };

    const karte = elementErstellen("section", "hq-media-card");
    const kopf = elementErstellen("div", "hq-media-header");
    const heading = elementErstellen("h4", "hq-media-title", titel);
    const sitzung = elementErstellen("span", "hq-media-session", "Sitzungs-Playlist");
    kopf.append(heading, sitzung);

    const player = elementErstellen(playerTag, `hq-${art}-player`);
    player.controls = true;
    player.preload = "metadata";
    if (art === "video") player.setAttribute("playsinline", "");

    const steuerung = elementErstellen("div", "hq-media-actions");
    const auswahl = elementErstellen("label", "hq-media-picker", `${titel} wählen`);
    const input = elementErstellen("input", "hq-media-input");
    input.type = "file";
    input.accept = accept;
    input.multiple = true;
    input.hidden = true;
    auswahl.append(input);

    const vorher = elementErstellen("button", "hq-media-button", "Zurück");
    vorher.type = "button";
    const weiter = elementErstellen("button", "hq-media-button", "Weiter");
    weiter.type = "button";
    const leeren = elementErstellen("button", "hq-media-button hq-media-button-secondary", "Leeren");
    leeren.type = "button";
    steuerung.append(auswahl, vorher, weiter, leeren);

    const liste = elementErstellen("ol", "hq-media-playlist");
    liste.setAttribute("aria-label", `${titel}-Playlist`);
    const status = elementErstellen("p", "hq-media-status", "Noch keine Datei gewählt.");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    const aktivMarkieren = () => {
      [...liste.querySelectorAll("button")].forEach((button, index) => {
        if (index === zustand.aktiv) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
    };

    const playerLeeren = () => {
      player.pause?.();
      player.removeAttribute("src");
      player.load?.();
    };

    const aktivSetzen = (index, { autoplay = false } = {}) => {
      if (!Number.isInteger(index) || index < 0 || index >= zustand.eintraege.length) return false;
      zustand.aktiv = index;
      const eintrag = zustand.eintraege[index];
      player.src = eintrag.url;
      player.load?.();
      aktivMarkieren();
      statusSetzen(status, `${index + 1}/${zustand.eintraege.length}: ${eintrag.name}`, "success");
      if (autoplay && typeof player.play === "function") {
        const ergebnis = player.play();
        if (ergebnis?.catch) ergebnis.catch(() => {});
      }
      return true;
    };

    const listeRendern = () => {
      liste.replaceChildren();
      zustand.eintraege.forEach((eintrag, index) => {
        const zeile = elementErstellen("li", "hq-media-item");
        const button = elementErstellen("button", "hq-media-track", eintrag.name);
        button.type = "button";
        button.title = eintrag.name;
        button.addEventListener("click", () => aktivSetzen(index));
        zeile.append(button);
        liste.append(zeile);
      });
      aktivMarkieren();
    };

    const urlsFreigeben = () => {
      for (const eintrag of zustand.eintraege) {
        try {
          URL.revokeObjectURL(eintrag.url);
        } catch {
          // Aufräumen soll nie einen sichtbaren Folgefehler erzeugen.
        }
      }
    };

    const allesLeeren = ({ melden = true } = {}) => {
      playerLeeren();
      urlsFreigeben();
      zustand.eintraege = [];
      zustand.aktiv = -1;
      liste.replaceChildren();
      if (melden) statusSetzen(status, "Playlist geleert.", "success");
      beiAenderung?.();
    };

    const dateienAufnehmen = (dateien) => {
      const bekannt = new Set(zustand.eintraege.map((eintrag) => eintrag.kennung));
      let hinzugefuegt = 0;
      let abgelehnt = 0;

      for (const datei of Array.from(dateien || [])) {
        if (!dateiPasst(datei, art)) {
          abgelehnt += 1;
          continue;
        }
        const kennung = dateiKennung(datei);
        if (bekannt.has(kennung)) continue;
        bekannt.add(kennung);
        zustand.eintraege.push({
          kennung,
          name: datei.name || `${titel} ${zustand.eintraege.length + 1}`,
          url: URL.createObjectURL(datei),
        });
        hinzugefuegt += 1;
      }

      listeRendern();
      if (zustand.aktiv < 0 && zustand.eintraege.length) aktivSetzen(0);
      const zusatz = abgelehnt ? ` · ${abgelehnt} nicht passende Datei(en) ignoriert` : "";
      statusSetzen(
        status,
        hinzugefuegt
          ? `${hinzugefuegt} Datei(en) hinzugefügt${zusatz}.`
          : `Keine neue passende Datei hinzugefügt${zusatz}.`,
        hinzugefuegt ? "success" : "warning",
      );
      beiAenderung?.();
      return { hinzugefuegt, abgelehnt };
    };

    const schritt = (richtung, autoplay = false) => {
      if (!zustand.eintraege.length) return false;
      const ziel = zustand.aktiv + richtung;
      if (ziel < 0 || ziel >= zustand.eintraege.length) return false;
      return aktivSetzen(ziel, { autoplay });
    };

    input.addEventListener("change", () => {
      dateienAufnehmen(input.files);
      input.value = "";
    });
    vorher.addEventListener("click", () => {
      if (!schritt(-1)) statusSetzen(status, "Bereits am Anfang der Playlist.", "info");
    });
    weiter.addEventListener("click", () => {
      if (!schritt(1)) statusSetzen(status, "Bereits am Ende der Playlist.", "info");
    });
    leeren.addEventListener("click", () => allesLeeren());
    player.addEventListener("ended", () => {
      if (!schritt(1, true)) statusSetzen(status, "Playlist beendet.", "success");
    });
    player.addEventListener("error", () => {
      const name = zustand.eintraege[zustand.aktiv]?.name || "Datei";
      statusSetzen(status, `${name}: Format oder Codec wird von diesem Browser nicht unterstützt.`, "error");
      log(1, `${titel}-Wiedergabe fehlgeschlagen.`, { name, code: player.error?.code || null });
    });

    karte.append(kopf, player, steuerung, liste, status);

    return {
      element: karte,
      anzahl: () => zustand.eintraege.length,
      dateienAufnehmen,
      aktivSetzen,
      schritt,
      leeren: allesLeeren,
      dispose() {
        allesLeeren({ melden: false });
      },
    };
  };

  const infoKarteErstellen = (name, label) => {
    const karte = elementErstellen("div", "hq-info-card");
    const titel = elementErstellen("dt", "hq-info-label", label);
    const wert = elementErstellen("dd", "hq-info-value", "wird gelesen …");
    karte.append(titel, wert);
    infoElemente.werte.set(name, wert);
    return karte;
  };

  const lampeErstellen = (name, text) => {
    const lampe = elementErstellen("div", "hq-lamp");
    lampe.dataset.tone = "idle";
    const punkt = elementErstellen("span", "hq-lamp-dot");
    punkt.setAttribute("aria-hidden", "true");
    const label = elementErstellen("span", "hq-lamp-label", text);
    lampe.append(punkt, label);
    infoElemente.lampen.set(name, lampe);
    return lampe;
  };

  const dashboardErstellen = () => {
    const ziel = document.querySelector("#uebersicht");
    if (!ziel) throw new Error("Dashboard-Ziel #uebersicht fehlt.");

    const root = elementErstellen("div", "headquarter-dashboard");
    root.id = "headquarter-dashboard";

    infoElemente = {
      werte: new Map(),
      lampen: new Map(),
      status: null,
    };

    const kopf = elementErstellen("div", "hq-header");
    const titelBlock = elementErstellen("div", "hq-title-block");
    const kicker = elementErstellen("p", "hq-kicker", "PROVOWARE");
    const titel = elementErstellen("h3", "hq-title", "HEADQUARTER 2026");
    const untertitel = elementErstellen(
      "p",
      "hq-subtitle",
      "Toolstatus, Laufzeitdaten und lokale Medien an einem Ort.",
    );
    titelBlock.append(kicker, titel, untertitel);

    const aktualisieren = elementErstellen("button", "hq-refresh", "Infos aktualisieren");
    aktualisieren.type = "button";
    aktualisieren.addEventListener("click", () => void toolInfoAktualisieren());
    kopf.append(titelBlock, aktualisieren);

    const lampen = elementErstellen("div", "hq-lamps");
    lampen.setAttribute("aria-label", "Toolstatus");
    lampen.append(
      lampeErstellen("runtime", "Laufzeit wird geprüft"),
      lampeErstellen("module", "Module werden geprüft"),
      lampeErstellen("workspace", "Workspace wird geprüft"),
      lampeErstellen("media", "Medien bereit"),
    );

    const infos = elementErstellen("dl", "hq-info-grid");
    infos.append(
      infoKarteErstellen("version", "Version"),
      infoKarteErstellen("startmodus", "Startmodus"),
      infoKarteErstellen("module", "Module"),
      infoKarteErstellen("workspace", "Workspace"),
      infoKarteErstellen("viewport", "Fenster"),
      infoKarteErstellen("cpu", "CPU-Threads (Browser)"),
      infoKarteErstellen("ram", "RAM-Hinweis (Browser)"),
      infoKarteErstellen("speicher", "Browser-Speicher"),
    );

    const hinweis = elementErstellen(
      "p",
      "hq-system-note",
      "Systemlast, IO-Aktivität und Betriebssystem-Prozesse werden nicht erfunden: normale Browserseiten dürfen diese Werte nicht zuverlässig auslesen.",
    );

    const medien = elementErstellen("div", "hq-media-grid");
    const mediaGeaendert = () => {
      const audio = audioPlaylist?.anzahl() || 0;
      const video = videoPlaylist?.anzahl() || 0;
      const gesamt = audio + video;
      lampeSetzen("media", gesamt ? `${audio} Audio · ${video} Video` : "Medien bereit", gesamt ? "active" : "idle");
    };

    audioPlaylist = playlistErstellen({
      art: "audio",
      titel: "Audio",
      playerTag: "audio",
      accept: "audio/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.flac,.opus",
      beiAenderung: mediaGeaendert,
    });
    videoPlaylist = playlistErstellen({
      art: "video",
      titel: "Video",
      playerTag: "video",
      accept: "video/*,.mp4,.webm,.ogv,.mov,.m4v",
      beiAenderung: mediaGeaendert,
    });
    medien.append(audioPlaylist.element, videoPlaylist.element);

    const status = elementErstellen("p", "hq-dashboard-status", "Dashboard wird initialisiert …");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    infoElemente.status = status;

    root.append(kopf, lampen, infos, hinweis, medien, status);
    ziel.append(root);
    mediaGeaendert();
    return root;
  };

  const resizeBinden = () => {
    resizeHandler = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        infoWertSetzen("viewport", `${window.innerWidth} × ${window.innerHeight}`);
      }, 120);
    };
    window.addEventListener("resize", resizeHandler);
  };

  const aufraeumen = () => {
    if (refreshTimer) window.clearTimeout(refreshTimer);
    refreshTimer = null;
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
    audioPlaylist?.dispose();
    videoPlaylist?.dispose();
    audioPlaylist = null;
    videoPlaylist = null;
    infoElemente = null;
    wurzel?.remove();
    wurzel = null;
  };

  window.PROVOWARE_MODULES.define(MODUL_ID, {
    async activate() {
      if (wurzel) return;
      wurzel = dashboardErstellen();
      resizeBinden();
      await toolInfoAktualisieren();
      window.setTimeout(() => void toolInfoAktualisieren(), 0);
      log(1, "Headquarter Dashboard aktiviert.", { version: MODUL_VERSION });
    },
    async deactivate() {
      aufraeumen();
      log(2, "Headquarter Dashboard deaktiviert.");
    },
    async dispose() {
      aufraeumen();
    },
  });
})();
