(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const PROFILE_PACKAGE_VERSION = "1.0.0";
  const MAX_PROFILE_BYTES = 512 * 1024;
  const PROFILE_TYPE = "template-profile";

  function clone(value) { return structuredClone(value); }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function checksum(value) {
    if (namespace.storage?.checksum) return namespace.storage.checksum(value);
    const text = stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.addEventListener("success", () => resolve(request.result), { once: true });
      request.addEventListener("error", () => reject(request.error || new Error("Lokale Profilanfrage fehlgeschlagen.")), { once: true });
    });
  }

  function transactionToPromise(transaction) {
    return new Promise((resolve, reject) => {
      transaction.addEventListener("complete", () => resolve(), { once: true });
      transaction.addEventListener("abort", () => reject(transaction.error || new Error("Profiltransaktion wurde abgebrochen.")), { once: true });
      transaction.addEventListener("error", () => reject(transaction.error || new Error("Profiltransaktion ist fehlgeschlagen.")), { once: true });
    });
  }

  function profileKey(profileId) { return `profile:${profileId}`; }
  function originKey(projectId) { return `template-origin:${projectId}`; }

  function slugify(value) {
    return String(value || "profil")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "profil";
  }

  function randomSuffix() {
    if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 10);
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  function createProfileId(title, existingIds = []) {
    const used = new Set(existingIds);
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = `profile.custom.${slugify(title)}-${randomSuffix()}`.slice(0, 64);
      if (!used.has(candidate)) return candidate;
    }
    throw new Error("Es konnte keine eindeutige Profil-ID erzeugt werden.");
  }

  function normalizeTitle(value, fallback = "Eigenes Profil") {
    const title = String(value || "").trim().replace(/\s+/g, " ");
    if (title.length < 3) throw new Error("Der Profilname muss mindestens 3 Zeichen enthalten.");
    if (title.length > 80) throw new Error("Der Profilname darf höchstens 80 Zeichen enthalten.");
    return title || fallback;
  }

  function questionMap(catalog) {
    return new Map((catalog?.questions || []).map(question => [question.id, question]));
  }

  function ruleMap(rules) {
    return new Map((rules || []).map(rule => [rule.id, rule]));
  }

  function optionLabel(question, value) {
    return question?.options?.find(option => option.value === value)?.label || String(value ?? "nicht gesetzt");
  }

  function validOutputList(profile, field, errors) {
    if (!Array.isArray(profile?.[field]) || profile[field].length === 0 || profile[field].some(item => typeof item !== "string" || !item.trim())) {
      errors.push(`${field} muss mindestens einen verständlichen Eintrag enthalten.`);
    }
  }

  function validateProfile(profile, appState) {
    const errors = [];
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) return { valid: false, errors: ["Das Profil ist kein gültiges Objekt."], actualRules: [], actualRuleIds: [] };
    if (typeof profile.id !== "string" || !/^[a-z0-9][a-z0-9._-]{1,63}$/.test(profile.id)) errors.push("Die Profil-ID ist ungültig.");
    try { normalizeTitle(profile.title); } catch (error) { errors.push(error.message); }
    if (typeof profile.description !== "string" || profile.description.trim().length < 10) errors.push("Die Profilbeschreibung ist zu kurz.");
    const questions = questionMap(appState?.catalog);
    const expectedIds = [...questions.keys()].sort();
    const answerIds = Object.keys(profile.answers || {}).sort();
    const missing = expectedIds.filter(id => !answerIds.includes(id));
    const unknown = answerIds.filter(id => !questions.has(id));
    if (missing.length) errors.push(`Fehlende Frage-IDs: ${missing.join(", ")}.`);
    if (unknown.length) errors.push(`Unbekannte Frage-IDs: ${unknown.join(", ")}.`);
    for (const [questionId, value] of Object.entries(profile.answers || {})) {
      const question = questions.get(questionId);
      if (question && !question.options.some(option => option.value === value)) errors.push(`Ungültiger Antwortwert für ${questionId}: ${String(value)}.`);
    }
    const actualRules = namespace.rules?.evaluate ? namespace.rules.evaluate(appState?.rules || [], profile.answers || {}) : [];
    const actualRuleIds = actualRules.map(rule => rule.id).sort();
    const declaredRuleIds = Array.isArray(profile.expectedRuleIds) ? [...profile.expectedRuleIds].sort() : [];
    const unknownRuleIds = declaredRuleIds.filter(id => !ruleMap(appState?.rules).has(id));
    if (unknownRuleIds.length) errors.push(`Unbekannte erwartete Regel-IDs: ${unknownRuleIds.join(", ")}.`);
    if (JSON.stringify(actualRuleIds) !== JSON.stringify(declaredRuleIds)) {
      errors.push(`Erwartete Regeln stimmen nicht mit dem Regelkern überein: erwartet [${declaredRuleIds.join(", ")}], tatsächlich [${actualRuleIds.join(", ")}].`);
    }
    for (const field of ["architecture", "folderTree", "qualityGates", "milestones", "specialCases"]) validOutputList(profile, field, errors);
    const report = profile.reportPreset;
    if (!report || !["compact", "standard", "detailed"].includes(report.detailLevel)) errors.push("Die Berichtstiefe ist ungültig.");
    if (!Array.isArray(report?.formats) || report.formats.length === 0 || report.formats.some(format => !["markdown", "html", "text", "json"].includes(format))) errors.push("Die Berichtsformate sind ungültig.");
    if (!Array.isArray(report?.sections) || report.sections.length === 0) errors.push("Der Bericht benötigt mindestens einen Abschnitt.");
    return { valid: errors.length === 0, errors: [...new Set(errors)], actualRules, actualRuleIds };
  }

  function validateCatalog(catalog, appState) {
    const errors = [];
    if (!catalog || typeof catalog !== "object" || !Array.isArray(catalog.templates)) return { valid: false, errors: ["Der Vorlagenkatalog besitzt keine Vorlagenliste."], templateCount: 0, profileCount: 0 };
    const templateIds = new Set();
    let profileCount = 0;
    for (const template of catalog.templates) {
      if (templateIds.has(template.id)) errors.push(`Doppelte Vorlagen-ID: ${template.id}.`);
      templateIds.add(template.id);
      if (!/^template\.[a-z0-9._-]+$/.test(template.id || "")) errors.push(`Ungültige Vorlagen-ID: ${template.id || "fehlt"}.`);
      if (!Array.isArray(template.profiles) || template.profiles.length === 0) errors.push(`Vorlage ${template.id} besitzt keine Profile.`);
      const profileIds = new Set();
      for (const profile of template.profiles || []) {
        profileCount += 1;
        if (profileIds.has(profile.id)) errors.push(`Doppelte Profil-ID in ${template.id}: ${profile.id}.`);
        profileIds.add(profile.id);
        const result = validateProfile(profile, appState);
        result.errors.forEach(error => errors.push(`${template.title} / ${profile.title || profile.id}: ${error}`));
      }
    }
    return { valid: errors.length === 0, errors, templateCount: catalog.templates.length, profileCount };
  }

  function emergencyCatalog(appState) {
    const answers = Object.fromEntries((appState?.catalog?.questions || []).map(question => [question.id, question.recommendedValue]));
    const expectedRuleIds = namespace.rules?.evaluate ? namespace.rules.evaluate(appState?.rules || [], answers).map(rule => rule.id).sort() : [];
    return {
      catalogVersion: "2.0.0-fallback",
      profileSchemaVersion: "1.0.0",
      templates: [{
        id: "template.offline-html-fallback",
        title: "Offline-HTML-Werkzeug",
        description: "Direktdatei-Fallback mit allen empfohlenen Antworten und sicheren lokalen Grundvorgaben.",
        category: "Browser & Offline",
        profiles: [{
          id: "safe-standard",
          title: "Sicherer Standard",
          description: "Vollständiges lokales Ausgangsprofil, wenn getrennte Vorlagendaten im Direktdateimodus nicht geladen werden konnten.",
          answers,
          expectedRuleIds,
          architecture: ["Lokale HTML-Oberfläche", "Validierungs- und Regelkern", "Lokale Speicherung", "Geprüfter Export"],
          folderTree: ["index.html", "css/", "js/", "data/", "tests/", "docs/"],
          reportPreset: { detailLevel: "standard", formats: ["markdown", "html", "json"], sections: ["Ziel", "Anforderungen", "Architektur", "Risiken", "Tests", "Abnahme"], includeTraceability: true, includeOpenDecisions: true },
          qualityGates: ["Start ohne Netz", "Alle Antworten gültig", "Speicherung wiederherstellbar", "Keine externe Laufzeitadresse"],
          milestones: ["Datenmodell", "Geführter Kern", "Sicherung", "Browserabnahme"],
          specialCases: ["Direktöffnung unter file://", "Browserdaten gelöscht", "Beschädigte Importdatei"]
        }]
      }]
    };
  }

  function usableBuiltinCatalog(appState) {
    const stateTemplates = appState?.templates;
    if (Array.isArray(stateTemplates) && stateTemplates.length && stateTemplates.every(template => Array.isArray(template.profiles))) {
      const candidate = { catalogVersion: "2.0.0", profileSchemaVersion: "1.0.0", templates: clone(stateTemplates) };
      if (validateCatalog(candidate, appState).valid) return candidate;
    }
    return emergencyCatalog(appState);
  }

  function flattenBuiltins(catalog) {
    const entries = [];
    for (const template of catalog.templates) {
      for (const profile of template.profiles) {
        entries.push({
          key: `builtin:${template.id}:${profile.id}`,
          kind: "builtin",
          template: clone(template),
          profile: clone(profile),
          label: `${template.title} — ${profile.title}`
        });
      }
    }
    return entries;
  }

  function customRecordToEntry(record) {
    return {
      key: `custom:${record.id}`,
      kind: "custom",
      template: { id: "template.custom", title: "Eigene Profile", description: "Lokal gespeicherte, vollständig validierte Profile.", category: "Eigene Profile" },
      profile: clone(record.profile),
      record: clone(record),
      label: `Eigenes Profil — ${record.profile.title}`
    };
  }

  function buildPreview(entry, appState) {
    const validation = validateProfile(entry.profile, appState);
    const questions = questionMap(appState.catalog);
    const differences = [];
    for (const question of appState.catalog?.questions || []) {
      const currentValue = appState.answers?.[question.id];
      const profileValue = entry.profile.answers?.[question.id];
      differences.push({
        questionId: question.id,
        questionTitle: question.title,
        currentValue,
        currentLabel: optionLabel(question, currentValue),
        profileValue,
        profileLabel: optionLabel(question, profileValue),
        status: currentValue === undefined ? "new" : currentValue === profileValue ? "same" : "changed"
      });
    }
    const rules = validation.actualRules || [];
    const criticalRules = rules.filter(rule => rule.severity === "critical");
    return {
      valid: validation.valid,
      errors: validation.errors,
      entryKey: entry.key,
      profile: clone(entry.profile),
      template: clone(entry.template),
      differences,
      changedCount: differences.filter(item => item.status !== "same").length,
      sameCount: differences.filter(item => item.status === "same").length,
      rules: clone(rules),
      criticalRules: clone(criticalRules),
      fingerprint: checksum({ templateId: entry.template.id, profile: entry.profile })
    };
  }

  async function openMeta(mode = "readonly") {
    const database = await namespace.storage.open();
    const transaction = database.transaction([namespace.storage.STORES.meta], mode);
    return { transaction, store: transaction.objectStore(namespace.storage.STORES.meta) };
  }

  async function listCustomProfiles() {
    const { transaction, store } = await openMeta("readonly");
    const done = transactionToPromise(transaction);
    const records = await requestToPromise(store.getAll());
    await done;
    return records.filter(record => record?.type === PROFILE_TYPE && typeof record.id === "string")
      .sort((left, right) => String(left.profile?.title || "").localeCompare(String(right.profile?.title || ""), "de"))
      .map(clone);
  }

  async function putCustomProfile(record) {
    const appState = namespace.state.getState();
    const validation = validateProfile(record.profile, appState);
    if (!validation.valid) throw new Error(`Profil kann nicht gespeichert werden: ${validation.errors.join(" ")}`);
    const now = new Date().toISOString();
    const normalized = {
      key: profileKey(record.id),
      type: PROFILE_TYPE,
      schemaVersion: "1.0.0",
      id: record.id,
      baseTemplateId: record.baseTemplateId || null,
      baseProfileId: record.baseProfileId || null,
      createdAt: record.createdAt || now,
      updatedAt: now,
      profile: clone(record.profile)
    };
    const { transaction, store } = await openMeta("readwrite");
    const done = transactionToPromise(transaction);
    store.put(normalized);
    await done;
    return clone(normalized);
  }

  async function deleteCustomProfile(profileId) {
    const { transaction, store } = await openMeta("readwrite");
    const done = transactionToPromise(transaction);
    store.delete(profileKey(profileId));
    await done;
    return profileId;
  }

  async function saveOrigin(projectId, entry, preview) {
    const { transaction, store } = await openMeta("readwrite");
    const done = transactionToPromise(transaction);
    store.put({
      key: originKey(projectId),
      type: "template-origin",
      projectId,
      templateId: entry.template.id,
      templateTitle: entry.template.title,
      profileId: entry.profile.id,
      profileTitle: entry.profile.title,
      profileFingerprint: preview.fingerprint,
      architecture: clone(entry.profile.architecture),
      folderTree: clone(entry.profile.folderTree),
      reportPreset: clone(entry.profile.reportPreset),
      qualityGates: clone(entry.profile.qualityGates),
      milestones: clone(entry.profile.milestones),
      specialCases: clone(entry.profile.specialCases),
      createdAt: new Date().toISOString()
    });
    await done;
  }

  function profilePackageCore(packageData) {
    return { packageSchemaVersion: packageData.packageSchemaVersion, exportedAt: packageData.exportedAt, profile: clone(packageData.profile) };
  }

  function createProfilePackage(profile) {
    const core = { packageSchemaVersion: PROFILE_PACKAGE_VERSION, exportedAt: new Date().toISOString(), profile: clone(profile) };
    return { ...core, checksum: checksum(core) };
  }

  function parseProfilePackage(text, appState) {
    if (typeof text !== "string") throw new Error("Die Profildatei enthält keinen Text.");
    if (new TextEncoder().encode(text).byteLength > MAX_PROFILE_BYTES) throw new Error("Die Profildatei ist größer als 512 KiB.");
    let packageData;
    try { packageData = JSON.parse(text); } catch (error) { throw new Error(`Die Profildatei enthält kein gültiges JSON: ${error.message}`); }
    if (packageData?.packageSchemaVersion !== PROFILE_PACKAGE_VERSION) throw new Error("Die Profildatei besitzt eine nicht unterstützte Paketversion.");
    if (checksum(profilePackageCore(packageData)) !== packageData.checksum) throw new Error("Die Profilprüfsumme stimmt nicht.");
    const validation = validateProfile(packageData.profile, appState);
    if (!validation.valid) throw new Error(`Das Profil ist ungültig: ${validation.errors.join(" ")}`);
    return clone(packageData.profile);
  }

  namespace.templateProfilesCore = {
    PROFILE_PACKAGE_VERSION,
    MAX_PROFILE_BYTES,
    clone,
    checksum,
    slugify,
    createProfileId,
    normalizeTitle,
    validateProfile,
    validateCatalog,
    usableBuiltinCatalog,
    flattenBuiltins,
    customRecordToEntry,
    buildPreview,
    listCustomProfiles,
    putCustomProfile,
    deleteCustomProfile,
    saveOrigin,
    createProfilePackage,
    parseProfilePackage
  };
})();
