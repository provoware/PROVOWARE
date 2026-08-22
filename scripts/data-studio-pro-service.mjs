import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ProjectDataError,
  readProjectDatabase,
  withMutationLock,
} from "./project-data-service.mjs";
import { atomicReplaceFile } from "./runtime-persistence.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const DATA_STUDIO_PRO_RELATIVE_PATH = "data/data-studio-pro.json";
export const DATA_STUDIO_PRO_SCHEMA_VERSION = 1;
export const DATA_STUDIO_PRO_API_ROOT = "/api/provoware/data-studio-pro";

const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_CATEGORY_NAME_LENGTH = 80;
const MAX_VIEW_NAME_LENGTH = 100;
const MAX_QUERY_LENGTH = 300;
const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const SORT_MODES = new Set([
  "updated-desc",
  "updated-asc",
  "created-desc",
  "created-asc",
]);

export class DataStudioProError extends ProjectDataError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
    this.name = "DataStudioProError";
  }
}

const isoTimestamp = (date = new Date()) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("Ungültiges Datum.");
  }
  return date.toISOString();
};

const normalizeText = (value, field, maxLength, { allowEmpty = false } = {}) => {
  if (typeof value !== "string") throw new DataStudioProError(`${field} muss Text sein.`);
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!allowEmpty && !normalized) throw new DataStudioProError(`${field} darf nicht leer sein.`);
  if (normalized.length > maxLength) {
    throw new DataStudioProError(`${field} darf höchstens ${maxLength} Zeichen enthalten.`);
  }
  return normalized;
};

const normalizeReferenceId = (value, field, { allowNull = false } = {}) => {
  if (allowNull && (value === null || value === undefined || value === "")) return null;
  const normalized = String(value || "").trim();
  if (!ID_PATTERN.test(normalized)) throw new DataStudioProError(`${field} ist ungültig.`);
  return normalized;
};

const normalizeSort = (value) => {
  const normalized = String(value || "updated-desc");
  if (!SORT_MODES.has(normalized)) throw new DataStudioProError("Unbekannte Sortierung.");
  return normalized;
};

export const createEmptyDataStudioPro = () => ({
  schemaVersion: DATA_STUDIO_PRO_SCHEMA_VERSION,
  revision: 0,
  categories: [],
  templateCategories: [],
  savedViews: [],
});

const validateTimestamp = (value, field) => {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new DataStudioProError(`${field} enthält keinen gültigen Zeitstempel.`, 500);
  }
};

export const validateStoredDataStudioPro = (stored) => {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    throw new DataStudioProError("Data-Studio-PRO-Datei hat kein gültiges Wurzelobjekt.", 500);
  }
  if (stored.schemaVersion !== DATA_STUDIO_PRO_SCHEMA_VERSION) {
    throw new DataStudioProError(
      `Data-Studio-PRO-Datei verwendet Schema ${stored.schemaVersion}; unterstützt wird ${DATA_STUDIO_PRO_SCHEMA_VERSION}.`,
      500,
    );
  }
  if (!Number.isInteger(stored.revision) || stored.revision < 0) {
    throw new DataStudioProError("Data-Studio-PRO-Datei enthält eine ungültige Revision.", 500);
  }
  if (!Array.isArray(stored.categories) || !Array.isArray(stored.templateCategories) || !Array.isArray(stored.savedViews)) {
    throw new DataStudioProError("Data-Studio-PRO-Datei benötigt categories[], templateCategories[] und savedViews[].", 500);
  }

  const categoryIds = new Set();
  const categoryNames = new Set();
  for (const category of stored.categories) {
    if (!category || typeof category !== "object" || Array.isArray(category)) {
      throw new DataStudioProError("Ungültige Kategorie in Data Studio PRO.", 500);
    }
    const id = normalizeReferenceId(category.id, "Kategorie-ID");
    const name = normalizeText(category.name, "Kategoriename", MAX_CATEGORY_NAME_LENGTH);
    if (categoryIds.has(id)) throw new DataStudioProError(`Doppelte Kategorie-ID '${id}'.`, 500);
    const key = name.toLocaleLowerCase("de-DE");
    if (categoryNames.has(key)) throw new DataStudioProError(`Doppelter Kategoriename '${name}'.`, 500);
    categoryIds.add(id);
    categoryNames.add(key);
    validateTimestamp(category.createdAt, `Kategorie ${id}: createdAt`);
    validateTimestamp(category.updatedAt, `Kategorie ${id}: updatedAt`);
  }

  const assignedTemplates = new Set();
  for (const assignment of stored.templateCategories) {
    if (!assignment || typeof assignment !== "object" || Array.isArray(assignment)) {
      throw new DataStudioProError("Ungültige Vorlagen-Kategorie-Zuweisung.", 500);
    }
    const templateId = normalizeReferenceId(assignment.templateId, "Vorlagen-ID");
    const categoryId = normalizeReferenceId(assignment.categoryId, "Kategorie-ID");
    if (assignedTemplates.has(templateId)) {
      throw new DataStudioProError(`Vorlage '${templateId}' besitzt mehr als eine Kategoriezuweisung.`, 500);
    }
    if (!categoryIds.has(categoryId)) {
      throw new DataStudioProError(`Kategorie '${categoryId}' einer Vorlagenzuweisung fehlt.`, 500);
    }
    assignedTemplates.add(templateId);
  }

  const viewIds = new Set();
  const viewNames = new Set();
  for (const view of stored.savedViews) {
    if (!view || typeof view !== "object" || Array.isArray(view)) {
      throw new DataStudioProError("Ungültige gespeicherte Ansicht.", 500);
    }
    const id = normalizeReferenceId(view.id, "Ansichts-ID");
    const name = normalizeText(view.name, "Ansichtsname", MAX_VIEW_NAME_LENGTH);
    if (viewIds.has(id)) throw new DataStudioProError(`Doppelte Ansichts-ID '${id}'.`, 500);
    const key = name.toLocaleLowerCase("de-DE");
    if (viewNames.has(key)) throw new DataStudioProError(`Doppelter Ansichtsname '${name}'.`, 500);
    viewIds.add(id);
    viewNames.add(key);
    normalizeReferenceId(view.templateId, "Ansicht: Vorlagen-ID", { allowNull: true });
    const categoryId = normalizeReferenceId(view.categoryId, "Ansicht: Kategorie-ID", { allowNull: true });
    if (categoryId && !categoryIds.has(categoryId)) {
      throw new DataStudioProError(`Kategorie '${categoryId}' einer gespeicherten Ansicht fehlt.`, 500);
    }
    normalizeText(view.query, "Ansicht: Suchtext", MAX_QUERY_LENGTH, { allowEmpty: true });
    normalizeSort(view.sort);
    validateTimestamp(view.createdAt, `Ansicht ${id}: createdAt`);
    validateTimestamp(view.updatedAt, `Ansicht ${id}: updatedAt`);
  }

  return stored;
};

export const readDataStudioPro = async (root = ROOT) => {
  const filePath = path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH);
  try {
    const source = await readFile(filePath, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(source);
    } catch (error) {
      throw new DataStudioProError(`Data-Studio-PRO-Datei ist beschädigt: ${error.message}`, 500);
    }
    return validateStoredDataStudioPro(parsed);
  } catch (error) {
    if (error?.code === "ENOENT") return createEmptyDataStudioPro();
    throw error;
  }
};

export const writeDataStudioProAtomic = async (
  root,
  stored,
  { beforeRename = null } = {},
) => {
  validateStoredDataStudioPro(stored);
  const filePath = path.join(root, DATA_STUDIO_PRO_RELATIVE_PATH);
  const source = `${JSON.stringify(stored, null, 2)}\n`;
  await atomicReplaceFile({
    targetPath: filePath,
    content: source,
    beforeReplace: beforeRename
      ? ({ tempPath, targetPath }) => beforeRename({ tempPath, filePath: targetPath, stored })
      : null,
  });
};

const ensureTemplateExists = async (root, templateId) => {
  const database = await readProjectDatabase(root);
  if (!database.templates.some((template) => template.id === templateId)) {
    throw new DataStudioProError(`Vorlage '${templateId}' wurde nicht gefunden.`, 404);
  }
};

const ensureCategoryExists = (stored, categoryId) => {
  if (!stored.categories.some((category) => category.id === categoryId)) {
    throw new DataStudioProError(`Kategorie '${categoryId}' wurde nicht gefunden.`, 404);
  }
};

export const createCategory = async (
  input,
  { root = ROOT, now = () => new Date(), uuid = randomUUID } = {},
) => withMutationLock(async () => {
  const name = normalizeText(input?.name, "Kategoriename", MAX_CATEGORY_NAME_LENGTH);
  const stored = await readDataStudioPro(root);
  const key = name.toLocaleLowerCase("de-DE");
  if (stored.categories.some((category) => category.name.toLocaleLowerCase("de-DE") === key)) {
    throw new DataStudioProError(`Kategorie '${name}' existiert bereits.`, 409);
  }
  const timestamp = isoTimestamp(now());
  const category = {
    id: normalizeReferenceId(uuid(), "Kategorie-ID"),
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  stored.categories.push(category);
  stored.categories.sort((left, right) => left.name.localeCompare(right.name, "de-DE"));
  stored.revision += 1;
  await writeDataStudioProAtomic(root, stored);
  return category;
});

export const deleteCategory = async (
  categoryId,
  { root = ROOT } = {},
) => withMutationLock(async () => {
  const id = normalizeReferenceId(categoryId, "Kategorie-ID");
  const stored = await readDataStudioPro(root);
  const index = stored.categories.findIndex((category) => category.id === id);
  if (index < 0) throw new DataStudioProError(`Kategorie '${id}' wurde nicht gefunden.`, 404);
  const [removed] = stored.categories.splice(index, 1);
  stored.templateCategories = stored.templateCategories.filter((assignment) => assignment.categoryId !== id);
  stored.savedViews = stored.savedViews.map((view) => (
    view.categoryId === id ? { ...view, categoryId: null } : view
  ));
  stored.revision += 1;
  await writeDataStudioProAtomic(root, stored);
  return removed;
});

export const setTemplateCategory = async (
  templateId,
  categoryId,
  { root = ROOT } = {},
) => withMutationLock(async () => {
  const normalizedTemplateId = normalizeReferenceId(templateId, "Vorlagen-ID");
  const normalizedCategoryId = normalizeReferenceId(categoryId, "Kategorie-ID", { allowNull: true });
  await ensureTemplateExists(root, normalizedTemplateId);
  const stored = await readDataStudioPro(root);
  if (normalizedCategoryId) ensureCategoryExists(stored, normalizedCategoryId);
  stored.templateCategories = stored.templateCategories.filter(
    (assignment) => assignment.templateId !== normalizedTemplateId,
  );
  if (normalizedCategoryId) {
    stored.templateCategories.push({
      templateId: normalizedTemplateId,
      categoryId: normalizedCategoryId,
    });
  }
  stored.revision += 1;
  await writeDataStudioProAtomic(root, stored);
  return { templateId: normalizedTemplateId, categoryId: normalizedCategoryId };
});

export const createSavedView = async (
  input,
  { root = ROOT, now = () => new Date(), uuid = randomUUID } = {},
) => withMutationLock(async () => {
  const name = normalizeText(input?.name, "Ansichtsname", MAX_VIEW_NAME_LENGTH);
  const templateId = normalizeReferenceId(input?.templateId, "Ansicht: Vorlagen-ID", { allowNull: true });
  const categoryId = normalizeReferenceId(input?.categoryId, "Ansicht: Kategorie-ID", { allowNull: true });
  const query = normalizeText(input?.query ?? "", "Ansicht: Suchtext", MAX_QUERY_LENGTH, { allowEmpty: true });
  const sort = normalizeSort(input?.sort);
  if (templateId) await ensureTemplateExists(root, templateId);
  const stored = await readDataStudioPro(root);
  if (categoryId) ensureCategoryExists(stored, categoryId);
  const key = name.toLocaleLowerCase("de-DE");
  if (stored.savedViews.some((view) => view.name.toLocaleLowerCase("de-DE") === key)) {
    throw new DataStudioProError(`Ansicht '${name}' existiert bereits.`, 409);
  }
  const timestamp = isoTimestamp(now());
  const view = {
    id: normalizeReferenceId(uuid(), "Ansichts-ID"),
    name,
    templateId,
    categoryId,
    query,
    sort,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  stored.savedViews.push(view);
  stored.savedViews.sort((left, right) => left.name.localeCompare(right.name, "de-DE"));
  stored.revision += 1;
  await writeDataStudioProAtomic(root, stored);
  return view;
});

export const deleteSavedView = async (
  viewId,
  { root = ROOT } = {},
) => withMutationLock(async () => {
  const id = normalizeReferenceId(viewId, "Ansichts-ID");
  const stored = await readDataStudioPro(root);
  const index = stored.savedViews.findIndex((view) => view.id === id);
  if (index < 0) throw new DataStudioProError(`Ansicht '${id}' wurde nicht gefunden.`, 404);
  const [removed] = stored.savedViews.splice(index, 1);
  stored.revision += 1;
  await writeDataStudioProAtomic(root, stored);
  return removed;
});

const readJsonBody = async (request) => {
  const contentType = String(request.headers["content-type"] || "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    throw new DataStudioProError("API erwartet Content-Type application/json.", 415);
  }
  let bytes = 0;
  const chunks = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_REQUEST_BYTES) throw new DataStudioProError("API-Anfrage ist zu groß.", 413);
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new DataStudioProError("API-Anfrage enthält ungültiges JSON.");
  }
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(`${JSON.stringify(payload)}\n`);
};

const checkSameOrigin = (request) => {
  const origin = request.headers.origin;
  if (!origin) return;
  const expected = `http://${request.headers.host}`;
  if (origin !== expected) throw new DataStudioProError("API-Zugriff von fremder Herkunft wurde blockiert.", 403);
};

export const handleDataStudioProApi = async (
  request,
  response,
  { root = ROOT, now = () => new Date(), uuid = randomUUID } = {},
) => {
  const url = new URL(request.url || "/", "http://localhost");
  if (!url.pathname.startsWith(DATA_STUDIO_PRO_API_ROOT)) return false;

  try {
    checkSameOrigin(request);

    if (request.method === "GET" && url.pathname === DATA_STUDIO_PRO_API_ROOT) {
      sendJson(response, 200, { ok: true, data: await readDataStudioPro(root) });
      return true;
    }

    if (request.method === "POST" && url.pathname === `${DATA_STUDIO_PRO_API_ROOT}/categories`) {
      const body = await readJsonBody(request);
      sendJson(response, 201, { ok: true, result: await createCategory(body, { root, now, uuid }) });
      return true;
    }

    const categoryMatch = new RegExp(`^${DATA_STUDIO_PRO_API_ROOT}/categories/([^/]+)$`).exec(url.pathname);
    if (request.method === "DELETE" && categoryMatch) {
      sendJson(response, 200, {
        ok: true,
        result: await deleteCategory(decodeURIComponent(categoryMatch[1]), { root }),
      });
      return true;
    }

    const assignmentMatch = new RegExp(`^${DATA_STUDIO_PRO_API_ROOT}/template-categories/([^/]+)$`).exec(url.pathname);
    if (request.method === "PUT" && assignmentMatch) {
      const body = await readJsonBody(request);
      sendJson(response, 200, {
        ok: true,
        result: await setTemplateCategory(
          decodeURIComponent(assignmentMatch[1]),
          body.categoryId ?? null,
          { root },
        ),
      });
      return true;
    }

    if (request.method === "POST" && url.pathname === `${DATA_STUDIO_PRO_API_ROOT}/saved-views`) {
      const body = await readJsonBody(request);
      sendJson(response, 201, { ok: true, result: await createSavedView(body, { root, now, uuid }) });
      return true;
    }

    const viewMatch = new RegExp(`^${DATA_STUDIO_PRO_API_ROOT}/saved-views/([^/]+)$`).exec(url.pathname);
    if (request.method === "DELETE" && viewMatch) {
      sendJson(response, 200, {
        ok: true,
        result: await deleteSavedView(decodeURIComponent(viewMatch[1]), { root }),
      });
      return true;
    }

    sendJson(response, 404, { ok: false, error: "Data-Studio-PRO-API-Route nicht gefunden." });
    return true;
  } catch (error) {
    const statusCode = error instanceof ProjectDataError ? error.statusCode : 500;
    const message = error instanceof ProjectDataError
      ? error.message
      : "Interner Fehler in Data Studio PRO.";
    if (statusCode >= 500 && !(error instanceof ProjectDataError)) {
      console.error(`[DATA-STUDIO-PRO] ${error instanceof Error ? error.stack || error.message : String(error)}`);
    }
    sendJson(response, statusCode, { ok: false, error: message });
    return true;
  }
};
