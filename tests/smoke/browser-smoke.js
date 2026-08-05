(() => {
  "use strict";
  const namespace = window.Provoware;
  const results = [];
  const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

  function record(name, passed, detail = "") {
    results.push({ name, passed: Boolean(passed), detail });
    if (!passed) throw new Error(`${name}: ${detail || "fehlgeschlagen"}`);
  }

  function click(selector) {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Element fehlt: ${selector}`);
    element.click();
    return element;
  }

  async function waitFor(predicate, timeout = 3000) {
    const started = Date.now();
    while (!predicate()) {
      if (Date.now() - started > timeout) throw new Error("Zeitüberschreitung beim Warten auf UI-Zustand.");
      await wait(25);
    }
  }

  function syntheticSnapshot(revision, payload, reason = "manual-snapshot") {
    return {
      snapshotId: `synthetic:${revision}`,
      projectId: payload.projectId,
      revision,
      savedAt: new Date(Date.now() - revision * 1000).toISOString(),
      reason,
      checksum: namespace.storage.checksum(payload),
      checksumValid: true,
      schemaValid: true,
      valid: true,
      validationErrors: [],
      payload: structuredClone(payload),
      isSafetySnapshot: revision === 2
    };
  }

  async function prepareEmbeddedStorageManager() {
    const payload = namespace.storage.createPayload(namespace.state.getState());
    let snapshots = [syntheticSnapshot(3, payload, "autosave"), syntheticSnapshot(2, payload)];
    let restored = false;
    let retentionLimit = 30;
    namespace.persistence.getStorageOverview = async () => ({
      diagnostics: { project: { revision: 3 }, recoveryCount: restored ? 1 : 0 },
      snapshots,
      retentionLimit
    });
    namespace.persistence.createSnapshot = async () => {
      snapshots = [syntheticSnapshot(4, payload), ...snapshots];
      return { revision: 4 };
    };
    namespace.persistence.setRetention = async value => {
      retentionLimit = Number(value);
      return { limit: retentionLimit, deleted: 0, retained: snapshots.length };
    };
    namespace.persistence.restoreSnapshot = async snapshotId => {
      const snapshot = snapshots.find(item => item.snapshotId === snapshotId);
      restored = true;
      namespace.state.restoreProject(snapshot.payload, { revision: 5, source: "manual-recovery" });
      return { revision: 5, restoredRevision: snapshot.revision, payload: snapshot.payload };
    };
  }

  async function exerciseStorageManager() {
    if (window.__PROVOWARE_SMOKE_EMBEDDED__) await prepareEmbeddedStorageManager();
    else {
      await namespace.persistence.flush("manual-snapshot");
      await namespace.persistence.flush("manual-snapshot");
    }

    click("#storage-manager-button");
    await waitFor(() => document.getElementById("storage-dialog").open);
    await waitFor(() => document.querySelectorAll(".snapshot-item").length >= 2);
    record("Snapshot-Liste", document.querySelectorAll(".snapshot-item").length >= 2);
    record("Aufbewahrungsgrenze sichtbar", document.getElementById("retention-limit").value !== "");

    click(".snapshot-item");
    await wait();
    record("Snapshot-Vorschau", !document.getElementById("snapshot-preview").hidden);
    record("Prüfergebnis sichtbar", document.getElementById("snapshot-preview-status").textContent.length > 0);
    record("Wiederherstellung zunächst gesperrt", document.getElementById("snapshot-restore-button").disabled);

    document.getElementById("snapshot-confirm").click();
    record("Wiederherstellung nach Bestätigung freigegeben", !document.getElementById("snapshot-restore-button").disabled);
    click("#snapshot-restore-button");
    await waitFor(() => document.getElementById("storage-manager-status").textContent.includes("wiederhergestellt"));
    record("Kontrollierte Wiederherstellung", namespace.state.getState().restoredFrom === "manual-recovery");

    document.getElementById("retention-limit").value = "5";
    click("#retention-save-button");
    await waitFor(() => document.getElementById("storage-manager-status").textContent.includes("Aufbewahrung auf 5"));
    record("Aufbewahrungsgrenze angewendet", document.getElementById("retention-limit").value === "5");
    click("#storage-close-button");
  }

  async function run() {
    try {
      while (!namespace.ready) await wait(10);
      await namespace.ready;
      await wait(350);
      const state = namespace.state.getState();
      record("sechs Fragen geladen", state.catalog.questions.length === 6, String(state.catalog.questions.length));
      record("vier Phasen geladen", document.querySelectorAll(".phase-button").length === 4);
      click("#phase-list li:nth-child(3) .phase-button");
      await wait();
      record("Phasennavigation", namespace.state.getState().currentQuestionId.startsWith("platform."));

      namespace.state.setCurrentQuestion(state.catalog.questions[0].id);
      await wait();
      for (let index = 0; index < 6; index += 1) {
        click("#recommended-button");
        await wait();
        if (index < 5) {
          click("#next-button");
          await wait();
        }
      }
      record("Empfehlungsschaltfläche", Object.keys(namespace.state.getState().answers).length === 6);
      record("Fortschritt 100 Prozent", document.getElementById("project-progress").value === 100, String(document.getElementById("project-progress").value));

      const themeBefore = document.documentElement.dataset.theme;
      click("#theme-button");
      await wait();
      record("Themewechsel", document.documentElement.dataset.theme !== themeBefore);
      click("#theme-button");

      namespace.state.setCurrentQuestion("platform.offline");
      await wait();
      document.querySelector('input[value="yes"]').click();
      await wait();
      namespace.state.setCurrentQuestion("data.storage");
      await wait();
      document.querySelector('input[value="cloud"]').click();
      await wait();
      record("Konfliktampel", document.getElementById("status-badge").textContent === "Konflikt");

      if (window.__PROVOWARE_SMOKE_EMBEDDED__) {
        const validPayload = namespace.storage.createPayload(namespace.state.getState());
        const validRecord = { snapshotId: "valid", revision: 2, payload: validPayload, checksum: namespace.storage.checksum(validPayload) };
        const invalidRecord = { snapshotId: "invalid", revision: 3, payload: { ...validPayload, theme: "kaputt" }, checksum: "00000000" };
        const selected = namespace.storage.selectLatestValidRecord(
          invalidRecord,
          [validRecord],
          payload => namespace.validation.validateStoredProject(payload, namespace.state.getState().catalog).length === 0
        );
        record("Wiederherstellungs-Auswahl", selected?.source === "snapshot" && selected.record.revision === 2);
        const plan = namespace.storage.planRetention(
          [invalidRecord, validRecord, { ...validRecord, snapshotId: "older", revision: 1 }],
          5,
          payload => namespace.validation.validateStoredProject(payload, namespace.state.getState().catalog).length === 0
        );
        record("gültiger Sicherheitsstand geschützt", plan.keepIds.has("valid"));
      } else {
        await namespace.persistence.flush("browser-smoke");
        const projectId = namespace.state.getState().projectId;
        const diagnostics = await namespace.storage.getDiagnostics(projectId);
        record("transaktionaler Speicher", diagnostics.snapshotCount >= 1 && diagnostics.logCount >= 1, JSON.stringify(diagnostics));
      }

      await exerciseStorageManager();

      const viewport = window.__PROVOWARE_SMOKE_VIEWPORT__ || new URLSearchParams(location.search).get("viewport");
      record("kein horizontales Überlaufen", document.documentElement.scrollWidth <= window.innerWidth + 2, `${document.documentElement.scrollWidth}/${window.innerWidth}`);
      if (viewport === "mobile") record("Mobilansicht", window.innerWidth <= 600, String(window.innerWidth));
      else record("Desktopansicht", window.innerWidth >= 1000, String(window.innerWidth));
      document.body.dataset.smokeStatus = "passed";
    } catch (error) {
      results.push({ name: "Gesamtablauf", passed: false, detail: error.message });
      document.body.dataset.smokeStatus = "failed";
    } finally {
      const output = document.createElement("pre");
      output.id = "smoke-result";
      output.textContent = JSON.stringify({ status: document.body.dataset.smokeStatus, results }, null, 2);
      document.body.append(output);
    }
  }

  run();
})();
