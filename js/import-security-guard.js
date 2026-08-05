(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const persistence = namespace.persistence;
  if (!persistence?.applyImport) throw new Error("Die Importkoordination ist noch nicht verfügbar.");
  const originalApplyImport = persistence.applyImport.bind(persistence);

  persistence.applyImport = async function (preview, mode, confirmation = {}) {
    if (!preview?.valid || !preview.checksumValid || preview.errors?.length) {
      throw new Error("Der Import wurde nicht durch eine fehlerfreie Sicherheitsvorschau freigegeben.");
    }
    if (!Array.isArray(preview.allowedModes) || !preview.allowedModes.includes(mode)) {
      throw new Error("Die gewählte Importart ist für diesen Projektstand nicht freigegeben.");
    }
    if (mode === "replace") {
      if (preview.existingProject?.lifecycle?.state !== "active") {
        throw new Error("Nur ein aktives Projekt darf ersetzt werden.");
      }
      const exactName = confirmation.exactName
        ?? document.getElementById("transfer-replace-name")?.value
        ?? "";
      const confirmed = confirmation.confirmed === true
        || document.getElementById("transfer-replace-checkbox")?.checked === true;
      if (!confirmed) {
        throw new Error("Die separate Bestätigung für das Ersetzen fehlt.");
      }
      if (exactName !== preview.existingProject?.name) {
        throw new Error("Der eingegebene Projektname stimmt nicht exakt mit dem vorhandenen Projekt überein.");
      }
    }
    return originalApplyImport(preview, mode);
  };
})();
