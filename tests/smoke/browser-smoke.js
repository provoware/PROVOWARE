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
        const validRecord = { revision: 2, payload: validPayload, checksum: namespace.storage.checksum(validPayload) };
        const invalidRecord = { revision: 3, payload: { ...validPayload, theme: "kaputt" }, checksum: "00000000" };
        const selected = namespace.storage.selectLatestValidRecord(
          invalidRecord,
          [validRecord],
          payload => namespace.validation.validateStoredProject(payload, namespace.state.getState().catalog).length === 0
        );
        record("Wiederherstellungs-Auswahl", selected?.source === "snapshot" && selected.record.revision === 2);
      } else {
        await namespace.persistence.flush("browser-smoke");
        const projectId = namespace.state.getState().projectId;
        const diagnostics = await namespace.storage.getDiagnostics(projectId);
        record("transaktionaler Speicher", diagnostics.snapshotCount >= 1 && diagnostics.logCount >= 1, JSON.stringify(diagnostics));

        const database = await namespace.storage.open();
        const transaction = database.transaction(namespace.storage.STORES.projects, "readwrite");
        const store = transaction.objectStore(namespace.storage.STORES.projects);
        const current = await new Promise((resolve, reject) => {
          const request = store.get(projectId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        current.payload.answers["data.storage"] = "ungueltig";
        store.put(current);
        await new Promise((resolve, reject) => {
          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error);
        });
        const recovered = await namespace.storage.loadLatestValid(
          projectId,
          payload => namespace.validation.validateStoredProject(payload, namespace.state.getState().catalog).length === 0
        );
        record("automatische Wiederherstellung", recovered?.source === "recovery", JSON.stringify(recovered));
      }

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
