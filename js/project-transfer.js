(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const PACKAGE_SCHEMA_VERSION = "1.0.0";
  const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

  function clone(value) { return structuredClone(value); }

  function coreFromPackage(packageData) {
    return {
      packageSchemaVersion: packageData.packageSchemaVersion,
      applicationVersion: packageData.applicationVersion,
      exportedAt: packageData.exportedAt,
      source: clone(packageData.source),
      project: clone(packageData.project)
    };
  }

  function createPackage(state, applicationVersion = "0.8.0") {
    const project = namespace.storage.createPayload(state);
    const core = {
      packageSchemaVersion: PACKAGE_SCHEMA_VERSION,
      applicationVersion,
      exportedAt: new Date().toISOString(),
      source: {
        projectId: state.projectId,
        projectName: state.projectName,
        revision: Number(state.revision || 0),
        lifecycle: state.projectLifecycle || "active",
        projectSchemaVersion: project.schemaVersion,
        questionCatalogVersion: project.questionCatalogVersion
      },
      project
    };
    return { ...core, checksum: namespace.storage.checksum(core) };
  }

  function serializePackage(packageData) {
    return `${JSON.stringify(packageData, null, 2)}\n`;
  }

  function parseJsonText(text) {
    if (typeof text !== "string") throw new Error("Die Importdatei enthält keinen Text.");
    if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) {
      throw new Error("Die Importdatei ist größer als zwei MiB und wird nicht verarbeitet.");
    }
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Das JSON-Wurzelelement muss ein Objekt sein.");
      }
      return parsed;
    } catch (error) {
      throw new Error(`Die Datei enthält kein gültiges JSON: ${error.message}`);
    }
  }

  function packageErrors(packageData) {
    const errors = [];
    if (packageData.packageSchemaVersion !== PACKAGE_SCHEMA_VERSION) {
      errors.push(`Nicht unterstützte Paketschema-Version: ${packageData.packageSchemaVersion || "fehlt"}.`);
    }
    if (!packageData.project || typeof packageData.project !== "object" || Array.isArray(packageData.project)) {
      errors.push("Der Projektbereich fehlt oder ist ungültig.");
    }
    if (!packageData.source || typeof packageData.source !== "object" || Array.isArray(packageData.source)) {
      errors.push("Die Exportherkunft fehlt oder ist ungültig.");
    }
    if (typeof packageData.exportedAt !== "string" || !Number.isFinite(Date.parse(packageData.exportedAt))) {
      errors.push("Der Exportzeitpunkt fehlt oder ist ungültig.");
    }
    if (typeof packageData.checksum !== "string" || !packageData.checksum) {
      errors.push("Die Paketprüfsumme fehlt.");
    } else if (namespace.storage.checksum(coreFromPackage(packageData)) !== packageData.checksum) {
      errors.push("Die Paketprüfsumme stimmt nicht. Die Datei wurde verändert oder beschädigt.");
    }
    return errors;
  }

  function questionMap(catalog) {
    return new Map((catalog?.questions || []).map(question => [question.id, question]));
  }

  function inspectAnswers(payload, catalog) {
    const known = questionMap(catalog);
    const unknownQuestionIds = [];
    const invalidAnswerValues = [];
    const validAnswers = [];
    for (const [questionId, value] of Object.entries(payload?.answers || {})) {
      const question = known.get(questionId);
      if (!question) {
        unknownQuestionIds.push(questionId);
        continue;
      }
      if (!question.options.some(option => option.value === value)) {
        invalidAnswerValues.push({ questionId, value });
        continue;
      }
      validAnswers.push({ questionId, value });
    }
    return { unknownQuestionIds, invalidAnswerValues, validAnswers };
  }

  function valueLabel(question, value) {
    return question?.options?.find(option => option.value === value)?.label || String(value ?? "nicht gesetzt");
  }

  function compareProjects(imported, existing, catalog) {
    if (!existing) {
      return {
        identical: false,
        fields: [],
        answers: {
          same: [], changed: [],
          added: Object.entries(imported.answers || {}).map(([questionId, importedValue]) => ({ questionId, importedValue })),
          missing: []
        },
        conflictCount: 0
      };
    }
    const fields = [];
    for (const key of ["name", "theme", "currentQuestionId", "questionCatalogVersion"]) {
      if (imported[key] !== existing[key]) fields.push({ key, current: existing[key] ?? null, imported: imported[key] ?? null });
    }
    const known = questionMap(catalog);
    const allQuestionIds = new Set([...Object.keys(existing.answers || {}), ...Object.keys(imported.answers || {})]);
    const answers = { same: [], changed: [], added: [], missing: [] };
    for (const questionId of allQuestionIds) {
      const currentValue = existing.answers?.[questionId];
      const importedValue = imported.answers?.[questionId];
      const question = known.get(questionId);
      if (currentValue === importedValue) {
        answers.same.push({ questionId, label: valueLabel(question, importedValue) });
      } else if (currentValue === undefined) {
        answers.added.push({ questionId, importedValue, importedLabel: valueLabel(question, importedValue) });
      } else if (importedValue === undefined) {
        answers.missing.push({ questionId, currentValue, currentLabel: valueLabel(question, currentValue) });
      } else {
        answers.changed.push({
          questionId,
          currentValue,
          currentLabel: valueLabel(question, currentValue),
          importedValue,
          importedLabel: valueLabel(question, importedValue)
        });
      }
    }
    const conflictCount = fields.length + answers.changed.length + answers.missing.length;
    return {
      identical: fields.length === 0 && answers.changed.length === 0 && answers.added.length === 0 && answers.missing.length === 0,
      fields,
      answers,
      conflictCount
    };
  }

  function recommendation(preview) {
    if (!preview.valid) return { mode: null, label: "Import blockiert", reason: "Mindestens eine Sicherheits- oder Datenprüfung ist fehlgeschlagen." };
    if (!preview.existingProject) return { mode: "preserve", label: "ID beibehalten", reason: "Die Projekt-ID ist lokal noch nicht vorhanden." };
    if (preview.comparison.identical) return { mode: null, label: "Keine Übernahme nötig", reason: "Der lokale und der importierte Projektstand sind inhaltlich identisch." };
    return { mode: "new", label: "Als neues Projekt importieren", reason: "Die vorhandene Projekt-ID besitzt abweichende Daten. Eine neue ID vermeidet unbeabsichtigtes Überschreiben." };
  }

  function preparePreview(packageData, catalog, existingProject = null) {
    const errors = packageErrors(packageData);
    let prepared = {
      payload: null,
      valid: false,
      migrated: false,
      sourceVersion: packageData.project?.schemaVersion || null,
      targetVersion: namespace.migrations.TARGET_SCHEMA_VERSION,
      steps: [],
      validationErrors: []
    };
    if (!errors.length) {
      prepared = namespace.migrations.preparePayload(
        packageData.project,
        payload => namespace.validation.validateStoredProject(payload, catalog),
        { catalogVersion: catalog?.catalogVersion || "1.0.0", now: new Date().toISOString() }
      );
    }
    const answerInspection = inspectAnswers(prepared.payload || packageData.project, catalog);
    errors.push(...prepared.validationErrors);
    if (prepared.payload) {
      try { namespace.projectRepository.validateName(prepared.payload.name); }
      catch (error) { errors.push(error.message); }
    }
    if (answerInspection.unknownQuestionIds.length) {
      errors.push(`Unbekannte Frage-IDs: ${answerInspection.unknownQuestionIds.join(", ")}.`);
    }
    if (answerInspection.invalidAnswerValues.length) {
      errors.push(`Ungültige Antwortwerte: ${answerInspection.invalidAnswerValues.map(item => `${item.questionId}=${String(item.value)}`).join(", ")}.`);
    }
    const existingPayload = existingProject?.record?.payload || existingProject?.payload || null;
    const comparison = prepared.payload ? compareProjects(prepared.payload, existingPayload, catalog) : compareProjects({ answers: {} }, existingPayload, catalog);
    const preview = {
      packageSchemaVersion: packageData.packageSchemaVersion || null,
      checksumExpected: packageData.checksum || null,
      checksumCalculated: packageData.checksum ? namespace.storage.checksum(coreFromPackage(packageData)) : null,
      checksumValid: Boolean(packageData.checksum) && namespace.storage.checksum(coreFromPackage(packageData)) === packageData.checksum,
      exportedAt: packageData.exportedAt || null,
      applicationVersion: packageData.applicationVersion || null,
      source: clone(packageData.source || {}),
      sourceSchemaVersion: prepared.sourceVersion,
      targetSchemaVersion: prepared.targetVersion,
      migrationRequired: prepared.migrated,
      migrationSteps: clone(prepared.steps),
      payload: prepared.payload ? clone(prepared.payload) : null,
      existingProject: existingProject ? clone(existingProject.summary || existingProject) : null,
      answerInspection,
      comparison,
      errors: [...new Set(errors.filter(Boolean))]
    };
    preview.valid = preview.errors.length === 0 && Boolean(preview.payload);
    preview.recommendation = recommendation(preview);
    const existingIsActive = preview.existingProject?.lifecycle?.state === "active";
    preview.allowedModes = preview.valid
      ? preview.existingProject
        ? preview.comparison.identical ? [] : existingIsActive ? ["new", "replace"] : ["new"]
        : ["preserve", "new"]
      : [];
    return preview;
  }

  function safeFilename(name) {
    return String(name || "projekt")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "projekt";
  }

  namespace.projectTransfer = {
    PACKAGE_SCHEMA_VERSION,
    MAX_IMPORT_BYTES,
    createPackage,
    serializePackage,
    parseJsonText,
    preparePreview,
    compareProjects,
    inspectAnswers,
    coreFromPackage,
    safeFilename
  };
})();
