(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  let applied = false;

  function apply() {
    if (applied) return;
    applied = true;
    const importLabel = document.querySelector('label[for="template-import-file"]');
    const importInput = document.getElementById("template-import-file");
    if (importLabel && importInput) {
      importLabel.setAttribute("role", "button");
      importLabel.tabIndex = 0;
      importLabel.addEventListener("keydown", event => {
        if (!["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        importInput.click();
      });
    }
    const headerVersion = document.querySelector(".app-header .eyebrow");
    if (headerVersion?.textContent.includes("0.9.0-dev")) {
      headerVersion.textContent = headerVersion.textContent.replace("0.9.0-dev", "0.8.0");
    }
  }

  namespace.templateProfilesUiFixes = { apply };
})();
