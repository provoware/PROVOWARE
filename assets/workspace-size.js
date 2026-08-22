(() => {
  "use strict";

  const RASTER_SPALTEN = 12;
  const HOEHEN_SCHRITT_PX = 24;

  const begrenzen = (wert, minimum, maximum) => Math.min(maximum, Math.max(minimum, wert));

  const endlicheZahlPruefen = (name, wert, minimum = -Infinity) => {
    if (!Number.isFinite(wert) || wert < minimum) {
      throw new RangeError(`${name} muss eine endliche Zahl ab ${minimum} sein.`);
    }
    return wert;
  };

  const ganzeZahlPruefen = (name, wert, minimum = -Infinity) => {
    if (!Number.isInteger(wert) || wert < minimum) {
      throw new RangeError(`${name} muss eine ganze Zahl ab ${minimum} sein.`);
    }
    return wert;
  };

  const grenzenPruefen = (minimum, maximum) => {
    if (minimum > maximum) throw new RangeError("Minimum darf nicht größer als Maximum sein.");
  };

  const symmetrischRunden = (wert) => Math.sign(wert) * Math.floor(Math.abs(wert) + 0.5);

  const rasterMetrikBerechnen = ({
    containerBreitePx,
    spaltenAbstandPx,
    spalten = RASTER_SPALTEN,
  }) => {
    endlicheZahlPruefen("containerBreitePx", containerBreitePx, 0.000001);
    endlicheZahlPruefen("spaltenAbstandPx", spaltenAbstandPx, 0);
    ganzeZahlPruefen("spalten", spalten, 1);

    const abstaendeGesamtPx = spaltenAbstandPx * (spalten - 1);
    const nutzbareBreitePx = containerBreitePx - abstaendeGesamtPx;
    if (nutzbareBreitePx <= 0) {
      throw new RangeError("Containerbreite muss größer als die Summe der Spaltenabstände sein.");
    }

    const spaltenBreitePx = nutzbareBreitePx / spalten;
    return {
      spalten,
      spaltenBreitePx,
      rasterSchrittPx: spaltenBreitePx + spaltenAbstandPx,
    };
  };

  const breiteAusBewegung = ({
    startBreite,
    deltaX,
    containerBreitePx,
    spaltenAbstandPx,
    mindestBreite,
    hoechstBreite,
  }) => {
    ganzeZahlPruefen("startBreite", startBreite, 1);
    ganzeZahlPruefen("mindestBreite", mindestBreite, 1);
    ganzeZahlPruefen("hoechstBreite", hoechstBreite, 1);
    grenzenPruefen(mindestBreite, hoechstBreite);
    endlicheZahlPruefen("deltaX", deltaX);

    const metrik = rasterMetrikBerechnen({ containerBreitePx, spaltenAbstandPx });
    const schritte = symmetrischRunden(deltaX / metrik.rasterSchrittPx);
    return begrenzen(startBreite + schritte, mindestBreite, hoechstBreite);
  };

  const hoeheAusBewegung = ({
    startHoehePx,
    deltaY,
    mindestHoehe,
    hoechstHoehe,
    schrittPx = HOEHEN_SCHRITT_PX,
  }) => {
    endlicheZahlPruefen("startHoehePx", startHoehePx, 0.000001);
    endlicheZahlPruefen("deltaY", deltaY);
    ganzeZahlPruefen("mindestHoehe", mindestHoehe, 1);
    ganzeZahlPruefen("hoechstHoehe", hoechstHoehe, 1);
    ganzeZahlPruefen("schrittPx", schrittPx, 1);
    grenzenPruefen(mindestHoehe, hoechstHoehe);

    const schritte = symmetrischRunden(deltaY / schrittPx);
    const zielHoehe = Math.round(startHoehePx) + schritte * schrittPx;
    return begrenzen(zielHoehe, mindestHoehe, hoechstHoehe);
  };

  const groesseAusBewegung = (eingabe) => ({
    widthUnits: breiteAusBewegung(eingabe),
    heightPx: hoeheAusBewegung(eingabe),
  });

  window.PROVOWARE_WORKSPACE_SIZE = Object.freeze({
    RASTER_SPALTEN,
    HOEHEN_SCHRITT_PX,
    rasterMetrikBerechnen,
    breiteAusBewegung,
    hoeheAusBewegung,
    groesseAusBewegung,
  });
})();
