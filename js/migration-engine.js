(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const TARGET_SCHEMA_VERSION = "1.2.0";
  const SUPPORTED_SCHEMA_VERSIONS = Object.freeze(["1.0.0", "1.1.0", TARGET_SCHEMA_VERSION]);

  function clone(value) {
    return structuredClone(value);
  }

  function isoOrFallback(value, fallback) {
    if (typeof value !== "string") return fallback;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : fallback;
  }

  function assertLegacyShape(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Der zu migrierende Projektstand ist kein Objekt.");
    }
    if (!SUPPORTED_SCHEMA_VERSIONS.includes(payload.schemaVersion)) {
      throw new Error(`Nicht unterstützte Projektschema-Version: ${payload.schemaVersion || "ohne Version"}.`);
    }
    if (typeof payload.projectId !== "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(payload.projectId)) {
      throw new Error("Die Projekt-ID des Altstands ist ungültig.");
    }
    if (!payload.answers || typeof payload.answers !== "object" || Array.isArray(payload.answers)) {
      throw new Error("Der Altstand besitzt kein gültiges Antwortobjekt.");
    }
  }

  function migrate100To110(payload, context) {
    const now = context.now;
    return {
      schemaVersion: "1.1.0",
      projectId: payload.projectId,
      name: typeof payload.name === "string" && payload.name.trim() ? payload.name : "PROVOWARE Entwicklungsplan",
      answers: clone(payload.answers),
      currentQuestionId: payload.currentQuestionId ?? null,
      theme: payload.theme === "light" ? "light" : "dark",
      createdAt: isoOrFallback(payload.createdAt, now),
      updatedAt: isoOrFallback(payload.updatedAt, now)
    };
  }

  function migrate110To120(payload, context) {
    return {
      schemaVersion: TARGET_SCHEMA_VERSION,
      projectId: payload.projectId,
      name: typeof payload.name === "string" && payload.name.trim() ? payload.name : "PROVOWARE Entwicklungsplan",
      answers: clone(payload.answers),
      currentQuestionId: payload.currentQuestionId ?? null,
      theme: payload.theme === "light" ? "light" : "dark",
      questionCatalogVersion: typeof payload.questionCatalogVersion === "string" && payload.questionCatalogVersion
        ? payload.questionCatalogVersion
        : context.catalogVersion,
      createdAt: isoOrFallback(payload.createdAt, context.now),
      updatedAt: context.now,
      lastValidatedAt: context.now
    };
  }

  const MATRIX = Object.freeze({
    "1.0.0": Object.freeze({ to: "1.1.0", migrate: migrate100To110 }),
    "1.1.0": Object.freeze({ to: TARGET_SCHEMA_VERSION, migrate: migrate110To120 })
  });

  function normalizeContext(context = {}) {
    const now = isoOrFallback(context.now, new Date().toISOString());
    return {
      now,
      catalogVersion: typeof context.catalogVersion === "string" && context.catalogVersion
        ? context.catalogVersion
        : "1.0.0"
    };
  }

  function migratePayload(payload, context = {}) {
    assertLegacyShape(payload);
    const normalizedContext = normalizeContext(context);
    let current = clone(payload);
    const steps = [];
    const visited = new Set();

    while (current.schemaVersion !== TARGET_SCHEMA_VERSION) {
      if (visited.has(current.schemaVersion)) throw new Error("Zyklische Projektschema-Migration erkannt.");
      visited.add(current.schemaVersion);
      const migration = MATRIX[current.schemaVersion];
      if (!migration) throw new Error(`Kein Migrationspfad ab ${current.schemaVersion} vorhanden.`);
      const before = current.schemaVersion;
      current = migration.migrate(current, normalizedContext);
      if (current.schemaVersion !== migration.to) {
        throw new Error(`Migration ${before} hat nicht die erwartete Zielversion ${migration.to} erzeugt.`);
      }
      steps.push({ from: before, to: migration.to });
    }

    return {
      payload: current,
      migrated: steps.length > 0,
      sourceVersion: payload.schemaVersion,
      targetVersion: TARGET_SCHEMA_VERSION,
      steps
    };
  }

  function preparePayload(payload, validator, context = {}) {
    try {
      const migrated = migratePayload(payload, context);
      const validationResult = typeof validator === "function" ? validator(migrated.payload) : [];
      const validationErrors = Array.isArray(validationResult)
        ? validationResult
        : validationResult === true
          ? []
          : ["Der migrierte Projektstand wurde von der Validierung abgelehnt."];
      return { ...migrated, valid: validationErrors.length === 0, validationErrors };
    } catch (error) {
      return {
        payload: null,
        migrated: false,
        sourceVersion: payload?.schemaVersion || null,
        targetVersion: TARGET_SCHEMA_VERSION,
        steps: [],
        valid: false,
        validationErrors: [error.message]
      };
    }
  }

  namespace.migrations = {
    TARGET_SCHEMA_VERSION,
    SUPPORTED_SCHEMA_VERSIONS,
    MATRIX,
    migratePayload,
    preparePayload,
    assertLegacyShape
  };
})();
