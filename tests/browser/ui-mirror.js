(() => {
  "use strict";

  const WIDTH = 1366;
  const HEIGHT = 900;
  const SCALE = 0.5;
  const SELECTORS = [
    "body",
    ".app-shell",
    ".sidebar",
    ".workspace",
    ".topbar",
    "#quickbar",
    "#arbeitsbereich",
    "#details",
    ".data-studio-pro",
    ".data-recovery",
  ];

  const source = document.querySelector("#mirror-source");
  const scaled = document.querySelector("#mirror-scaled");
  const status = document.querySelector("[data-mirror-status]");
  const evidence = document.querySelector("[data-mirror-evidence]");

  const round = (value) => Math.round(value * 10) / 10;
  const sleep = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  const readyText = (element) => /bereit/i.test(element?.textContent || "");

  const frameReady = (frame) => {
    const doc = frame.contentDocument;
    if (!doc?.body) return false;
    const dataStudioStatus = doc.querySelector("[data-data-studio-status]");
    const proStatus = doc.querySelector("[data-data-studio-pro-status]");
    const recoveryStatus = doc.querySelector("[data-recovery-status]");
    return Boolean(
      doc.querySelector("#development-note-input")
      && doc.querySelector(".data-recovery")
      && doc.querySelector(".data-studio-pro")
      && readyText(dataStudioStatus)
      && readyText(proStatus)
      && readyText(recoveryStatus),
    );
  };

  const waitForFrame = async (frame) => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      if (frameReady(frame)) return;
      await sleep(50);
    }
    throw new Error(`Frame '${frame.id}' wurde nicht vollständig initialisiert.`);
  };

  const geometry = (frame) => {
    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    const rectangles = {};
    SELECTORS.forEach((selector) => {
      const element = doc.querySelector(selector);
      if (!element) {
        rectangles[selector] = null;
        return;
      }
      const rect = element.getBoundingClientRect();
      rectangles[selector] = {
        x: round(rect.x),
        y: round(rect.y),
        width: round(rect.width),
        height: round(rect.height),
      };
    });
    return {
      innerWidth: win.innerWidth,
      innerHeight: win.innerHeight,
      rectangles,
    };
  };

  const sameGeometry = (left, right) => JSON.stringify(left) === JSON.stringify(right);

  const waitForStableGeometry = async (frame) => {
    let previous = geometry(frame);
    let stableSamples = 0;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      await sleep(50);
      const current = geometry(frame);
      if (sameGeometry(previous, current)) {
        stableSamples += 1;
        if (stableSamples >= 3) return current;
      } else {
        stableSamples = 0;
      }
      previous = current;
    }
    throw new Error(`Frame '${frame.id}' erreichte keine stabile Geometrie.`);
  };

  const geometryDifferences = (left, right) => SELECTORS
    .filter((selector) => JSON.stringify(left.rectangles[selector]) !== JSON.stringify(right.rectangles[selector]))
    .map((selector) => ({
      selector,
      source: left.rectangles[selector],
      mirrored: right.rectangles[selector],
    }));

  const run = async () => {
    if (!source || !scaled || !status || !evidence) throw new Error("Mirror-Pflichtelement fehlt.");

    document.documentElement.style.setProperty("--mirror-width", `${WIDTH}px`);
    document.documentElement.style.setProperty("--mirror-height", `${HEIGHT}px`);
    document.documentElement.style.setProperty("--mirror-scale", String(SCALE));

    await Promise.all([waitForFrame(source), waitForFrame(scaled)]);
    const [sourceGeometry, scaledGeometry] = await Promise.all([
      waitForStableGeometry(source),
      waitForStableGeometry(scaled),
    ]);

    const scaledRect = scaled.getBoundingClientRect();
    const measuredScale = round(scaledRect.width / scaled.clientWidth);
    const layoutMatches = sameGeometry(sourceGeometry, scaledGeometry);
    const viewportMatches = sourceGeometry.innerWidth === WIDTH
      && sourceGeometry.innerHeight === HEIGHT
      && scaledGeometry.innerWidth === WIDTH
      && scaledGeometry.innerHeight === HEIGHT;
    const scaleMatches = Math.abs(measuredScale - SCALE) < 0.01;
    const pass = layoutMatches && viewportMatches && scaleMatches;

    const report = {
      pass,
      sourceViewport: [sourceGeometry.innerWidth, sourceGeometry.innerHeight],
      mirroredViewport: [scaledGeometry.innerWidth, scaledGeometry.innerHeight],
      requestedScale: SCALE,
      measuredScale,
      keyGeometryIdentical: layoutMatches,
      selectors: SELECTORS,
      geometryDifferences: geometryDifferences(sourceGeometry, scaledGeometry),
    };

    status.dataset.state = pass ? "pass" : "fail";
    status.textContent = pass ? "PASS · proportional identisch" : "FAIL · Geometrieabweichung";
    evidence.textContent = JSON.stringify(report, null, 2);
    window.PROVOWARE_MIRROR_EVIDENCE = Object.freeze(report);
    window.dispatchEvent(new CustomEvent("provoware:mirror-ready", { detail: report }));
  };

  void run().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    if (status) {
      status.dataset.state = "fail";
      status.textContent = "FAIL · Mirror-Pipeline";
    }
    if (evidence) evidence.textContent = message;
    window.PROVOWARE_MIRROR_EVIDENCE = Object.freeze({ pass: false, error: message });
  });
})();
