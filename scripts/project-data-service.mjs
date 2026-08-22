import { appendFile, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const DEVELOPMENT_NOTES_RELATIVE_PATH = "data/ENTWICKLUNGSNOTIZEN.txt";
export const PROJECT_DATABASE_RELATIVE_PATH = "data/project-data.json";
export const PROJECT_DATABASE_SCHEMA_VERSION = 1;
export const PROJECT_DATABASE_TEMPLATE_SCHEMA_VERSION = 1;

const MAX_REQUEST_BYTES = 128 * 1024;
const MAX_NOTE_LENGTH = 1000;
const MAX_TEMPLATE_NAME_LENGTH = 100;
const MAX_TEMPLATE_DESCRIPTION_LENGTH = 1000;
const MAX_FIELD_LABEL_LENGTH = 100;
const MAX_TEXT_LENGTH = 1000;
const MAX_LONG_TEXT_LENGTH = 10000;
const FIELD_ID_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;
const FIELD_TYPES = new Set(["text", "textarea", "number", "date", "checkbox", "select"]);

let mutationQueue = Promise.resolve();

export class ProjectDataError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ProjectDataError";
    this.statusCode = statusCode;
  }
}

const pad = (value) => String(value).padStart(2, "0");

export const formatLocalTimestamp = (date = new Date()) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("Zeitstempel benötigt ein gültiges Datum.");
  }
  return [
    String(date.getFullYear()).padStart(4, "0"),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const normalizeDevelopmentNote = (value) => {
  if (typeof value !== "string") throw new ProjectDataError("Notiz muss Text sein.");
  const normalized = value.replace(/\s*[\r\n]+\s*/g, " ").replace(/[\t ]+/g, " ").trim();
  if (!normalized) throw new ProjectDataError("Notiz darf nicht leer sein.");
  if (normalized.length > MAX_NOTE_LENGTH) {
    throw new ProjectDataError(`Notiz darf höchstens ${MAX_NOTE_LENGTH} Zeichen enthalten.`);
  }
  return normalized;
};

const stringValue = (value, field, maxLength, { allowEmpty = false } = {}) => {
  if (typeof value !== "string") throw new ProjectDataError(`${field} muss Text sein.`);
  const normalized = value.trim();
  if (!allowEmpty && !normalized) throw new ProjectDataError(`${field} darf nicht leer sein.`);
  if (normalized.length > maxLength) {
    throw new ProjectDataError(`${field} darf höchstens ${maxLength} Zeichen enthalten.`);
  }
  return normalized;
};

const isoTimestamp = (date = new Date()) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new TypeError("Ungültiges Datum.");
  return date.toISOString();
};

export const createEmptyProjectDatabase = () => ({
  schemaVersion: PROJECT_DATABASE_SCHEMA_VERSION,
  revision: 0,
  templates: [],
  records: [],
});

const validateStoredField = (field, templateId) => {
  if (!field || typeof field !== "object" || Array.isArray(field)) {
    throw new ProjectDataError(`Vorlage ${templateId}: ungültige Felddefinition.`, 500);
  }
  if (!FIELD_ID_PATTERN.test(String(field.id || ""))) {
    throw new ProjectDataError(`Vorlage ${templateId}: ungültige Feld-ID.`, 500);
  }
  if (!FIELD_TYPES.has(field.type)) {
    throw new ProjectDataError(`Vorlage ${templateId}: unbekannter Feldtyp.`, 500);
  }
  if (typeof field.label !== "string" || !field.label.trim()) {
    throw new ProjectDataError(`Vorlage ${templateId}: Feldbezeichnung fehlt.`, 500);
  }
  if (typeof field.required !== "boolean") {
    throw new ProjectDataError(`Vorlage ${templateId}: required muss boolesch sein.`, 500);
  }
  if (!Array.isArray(field.options)) {
    throw new ProjectDataError(`Vorlage ${templateId}: options muss eine Liste sein.`, 500);
  }
};

export const validateStoredDatabase = (database) => {
  if (!database || typeof database !== "object" || Array.isArray(database)) {
    throw new ProjectDataError("Projekt-Datenbank hat kein gültiges Wurzelobjekt.", 500);
  }
  if (database.schemaVersion !== PROJECT_DATABASE_SCHEMA_VERSION) {
    throw new ProjectDataError(
      `Projekt-Datenbank verwendet Schema ${database.schemaVersion}; unterstützt wird ${PROJECT_DATABASE_SCHEMA_VERSION}.`,
      500,
    );
  }
  if (!Number.isInteger(database.revision) || database.revision < 0) {
    throw new ProjectDataError("Projekt-Datenbank enthält eine ungültige Revision.", 500);
  }
  if (!Array.isArray(database.templates) || !Array.isArray(database.records)) {
    throw new ProjectDataError("Projekt-Datenbank benötigt templates[] und records[].", 500);
  }

  const templateIds = new Set();
  for (const template of database.templates) {
    if (!template || typeof template !== "object" || Array.isArray(template)) {
      throw new ProjectDataError("Projekt-Datenbank enthält eine ungültige Vorlage.", 500);
    }
    if (typeof template.id !== "string" || !template.id) {
      throw new ProjectDataError("Projekt-Datenbank enthält eine Vorlage ohne ID.", 500);
    }
    if (templateIds.has(template.id)) {
      throw new ProjectDataError(`Doppelte Vorlagen-ID: ${template.id}.`, 500);
    }
    templateIds.add(template.id);
    if (template.schemaVersion !== PROJECT_DATABASE_TEMPLATE_SCHEMA_VERSION) {
      throw new ProjectDataError(`Vorlage ${template.id}: unbekannte Schemaversion.`, 500);
    }
    if (!Array.isArray(template.fields)) {
      throw new ProjectDataError(`Vorlage ${template.id}: fields muss eine Liste sein.`, 500);
    }
    const fieldIds = new Set();
    for (const field of template.fields) {
      validateStoredField(field, template.id);
      if (fieldIds.has(field.id)) {
        throw new ProjectDataError(`Vorlage ${template.id}: doppelte Feld-ID ${field.id}.`, 500);
      }
      fieldIds.add(field.id);
    }
  }

  const recordIds = new Set();
  for (const record of database.records) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new ProjectDataError("Projekt-Datenbank enthält einen ungültigen Datensatz.", 500);
    }
    if (typeof record.id !== "string" || !record.id || recordIds.has(record.id)) {
      throw new ProjectDataError("Projekt-Datenbank enthält eine fehlende oder doppelte Datensatz-ID.", 500);
    }
    recordIds.add(record.id);
    if (!templateIds.has(record.templateId)) {
      throw new ProjectDataError(`Datensatz ${record.id}: Vorlage ${record.templateId} fehlt.`, 500);
    }
    if (!record.values || typeof record.values !== "object" || Array.isArray(record.values)) {
      throw new ProjectDataError(`Datensatz ${record.id}: values muss ein Objekt sein.`, 500);
    }
  }

  return database;
};

export const readProjectDatabase = async (root = ROOT) => {
  const filePath = path.join(root, PROJECT_DATABASE_RELATIVE_PATH);
  try {
    const source = await readFile(filePath, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(source);
    } catch (error) {
      throw new ProjectDataError(`Projekt-Datenbank ist beschädigt: ${error.message}`, 500);
    }
    return validateStoredDatabase(parsed);
  } catch (error) {
    if (error?.code === "ENOENT") return createEmptyProjectDatabase();
    throw error;
  }
};

const writeProjectDatabaseAtomic = async (root, database) => {
  validateStoredDatabase(database);
  const filePath = path.join(root, PROJECT_DATABASE_RELATIVE_PATH);
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp-${process.pid}-${randomUUID()}`;
  const source = `${JSON.stringify(database, null, 2)}\n`;
  try {
    await writeFile(tempPath, source, { encoding: "utf8", flag: "wx" });
    await rename(tempPath, filePath);
  } catch (error) {
    await unlink(tempPath).catch(() => {});
    throw error;
  }
};

const withMutationLock = (task) => {
  const run = mutationQueue.then(task, task);
  mutationQueue = run.catch(() => {});
  return run;
};

export const appendDevelopmentNote = async (
  value,
  { root = ROOT, now = () => new Date() } = {},
) => {
  const note = normalizeDevelopmentNote(value);
  const timestamp = formatLocalTimestamp(now());
  const filePath = path.join(root, DEVELOPMENT_NOTES_RELATIVE_PATH);
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `[${timestamp}] ${note}\n`, "utf8");
  return { timestamp, note, relativePath: DEVELOPMENT_NOTES_RELATIVE_PATH };
};

const normalizeField = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProjectDataError("Jedes Vorlagenfeld muss ein Objekt sein.");
  }
  const id = String(input.id || "").trim();
  if (!FIELD_ID_PATTERN.test(id)) {
    throw new ProjectDataError(`Ungültige Feld-ID '${id || "<leer>"}'.`);
  }
  const label = stringValue(input.label, `Feld ${id}: label`, MAX_FIELD_LABEL_LENGTH);
  const type = String(input.type || "");
  if (!FIELD_TYPES.has(type)) throw new ProjectDataError(`Feld ${id}: unbekannter Typ '${type}'.`);
  const required = input.required === true;
  let options = [];
  if (type === "select") {
    if (!Array.isArray(input.options)) throw new ProjectDataError(`Feld ${id}: Auswahlwerte fehlen.`);
    options = input.options.map((value) => stringValue(value, `Feld ${id}: Auswahlwert`, 100));
    if (!options.length) throw new ProjectDataError(`Feld ${id}: mindestens ein Auswahlwert ist nötig.`);
    if (new Set(options).size !== options.length) {
      throw new ProjectDataError(`Feld ${id}: Auswahlwerte müssen eindeutig sein.`);
    }
  }
  return { id, label, type, required, options };
};

const normalizeTemplateInput = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProjectDataError("Vorlage muss ein Objekt sein.");
  }
  const name = stringValue(input.name, "Vorlagenname", MAX_TEMPLATE_NAME_LENGTH);
  const description = stringValue(
    input.description ?? "",
    "Vorlagenbeschreibung",
    MAX_TEMPLATE_DESCRIPTION_LENGTH,
    { allowEmpty: true },
  );
  if (!Array.isArray(input.fields) || !input.fields.length) {
    throw new ProjectDataError("Vorlage benötigt mindestens ein Feld.");
  }
  if (input.fields.length > 50) throw new ProjectDataError("Vorlage darf höchstens 50 Felder enthalten.");
  const fields = input.fields.map(normalizeField);
  if (new Set(fields.map((field) => field.id)).size !== fields.length) {
    throw new ProjectDataError("Vorlage enthält doppelte Feld-IDs.");
  }
  return { name, description, fields };
};

const fieldValueIsEmpty = (field, value) => {
  if (field.type === "checkbox") return value === undefined || value === null;
  return value === undefined || value === null || value === "";
};

const validCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const date = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));
  return date.getUTCFullYear() === Number(yearText)
    && date.getUTCMonth() === Number(monthText) - 1
    && date.getUTCDate() === Number(dayText);
};

export const normalizeRecordValues = (template, rawValues) => {
  if (!rawValues || typeof rawValues !== "object" || Array.isArray(rawValues)) {
    throw new ProjectDataError("Datensatzwerte müssen ein Objekt sein.");
  }
  const fieldsById = new Map(template.fields.map((field) => [field.id, field]));
  const unknown = Object.keys(rawValues).filter((key) => !fieldsById.has(key));
  if (unknown.length) throw new ProjectDataError(`Unbekannte Datensatzfelder: ${unknown.join(", ")}.`);

  const values = {};
  for (const field of template.fields) {
    const raw = rawValues[field.id];
    if (field.required && fieldValueIsEmpty(field, raw)) {
      throw new ProjectDataError(`Pflichtfeld '${field.label}' fehlt.`);
    }

    if (field.type === "checkbox") {
      if (raw !== undefined && raw !== null && typeof raw !== "boolean") {
        throw new ProjectDataError(`Feld '${field.label}' muss wahr oder falsch sein.`);
      }
      values[field.id] = raw === true;
      continue;
    }

    if (fieldValueIsEmpty(field, raw)) {
      values[field.id] = field.type === "number" ? null : "";
      continue;
    }

    if (field.type === "number") {
      const numberValue = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(numberValue)) throw new ProjectDataError(`Feld '${field.label}' muss eine Zahl sein.`);
      values[field.id] = numberValue;
    } else if (field.type === "date") {
      const dateValue = String(raw);
      if (!validCalendarDate(dateValue)) throw new ProjectDataError(`Feld '${field.label}' benötigt YYYY-MM-DD.`);
      values[field.id] = dateValue;
    } else if (field.type === "select") {
      const selectValue = String(raw);
      if (!field.options.includes(selectValue)) {
        throw new ProjectDataError(`Feld '${field.label}' enthält keinen erlaubten Auswahlwert.`);
      }
      values[field.id] = selectValue;
    } else if (field.type === "textarea") {
      values[field.id] = stringValue(raw, `Feld '${field.label}'`, MAX_LONG_TEXT_LENGTH, { allowEmpty: true });
    } else {
      values[field.id] = stringValue(raw, `Feld '${field.label}'`, MAX_TEXT_LENGTH, { allowEmpty: true });
    }
  }
  return values;
};

export const createTemplate = async (
  input,
  { root = ROOT, now = () => new Date(), uuid = randomUUID } = {},
) => withMutationLock(async () => {
  const normalized = normalizeTemplateInput(input);
  const database = await readProjectDatabase(root);
  const timestamp = isoTimestamp(now());
  const template = {
    id: uuid(),
    schemaVersion: PROJECT_DATABASE_TEMPLATE_SCHEMA_VERSION,
    ...normalized,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  database.templates.push(template);
  database.revision += 1;
  await writeProjectDatabaseAtomic(root, database);
  return template;
});

const assertCompatibleTemplateUpdate = (database, existing, next) => {
  const referencedRecords = database.records.filter((record) => record.templateId === existing.id);
  if (!referencedRecords.length) return;
  const nextById = new Map(next.fields.map((field) => [field.id, field]));
  const oldById = new Map(existing.fields.map((field) => [field.id, field]));

  for (const oldField of existing.fields) {
    const nextField = nextById.get(oldField.id);
    if (!nextField) {
      throw new ProjectDataError(`Feld '${oldField.label}' kann nicht entfernt werden, solange Datensätze existieren.`, 409);
    }
    if (nextField.type !== oldField.type) {
      throw new ProjectDataError(`Typ von Feld '${oldField.label}' kann mit bestehenden Datensätzen nicht geändert werden.`, 409);
    }
  }

  for (const nextField of next.fields) {
    const oldField = oldById.get(nextField.id);
    if (!oldField && nextField.required) {
      throw new ProjectDataError(`Neues Feld '${nextField.label}' muss bei bestehenden Datensätzen zunächst optional sein.`, 409);
    }
    if (nextField.type === "select") {
      for (const record of referencedRecords) {
        const value = record.values[nextField.id];
        if (value && !nextField.options.includes(value)) {
          throw new ProjectDataError(`Auswahlwert '${value}' wird von bestehendem Datensatz benötigt.`, 409);
        }
      }
    }
  }
};

export const updateTemplate = async (
  templateId,
  input,
  { root = ROOT, now = () => new Date() } = {},
) => withMutationLock(async () => {
  const normalized = normalizeTemplateInput(input);
  const database = await readProjectDatabase(root);
  const index = database.templates.findIndex((template) => template.id === templateId);
  if (index < 0) throw new ProjectDataError(`Vorlage '${templateId}' wurde nicht gefunden.`, 404);
  const existing = database.templates[index];
  assertCompatibleTemplateUpdate(database, existing, normalized);
  const updated = {
    ...existing,
    ...normalized,
    id: existing.id,
    schemaVersion: existing.schemaVersion,
    createdAt: existing.createdAt,
    updatedAt: isoTimestamp(now()),
  };
  database.templates[index] = updated;
  database.revision += 1;
  await writeProjectDatabaseAtomic(root, database);
  return updated;
});

export const createRecord = async (
  input,
  { root = ROOT, now = () => new Date(), uuid = randomUUID } = {},
) => withMutationLock(async () => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProjectDataError("Datensatz muss ein Objekt sein.");
  }
  const database = await readProjectDatabase(root);
  const template = database.templates.find((item) => item.id === input.templateId);
  if (!template) throw new ProjectDataError(`Vorlage '${input.templateId}' wurde nicht gefunden.`, 404);
  const timestamp = isoTimestamp(now());
  const record = {
    id: uuid(),
    templateId: template.id,
    values: normalizeRecordValues(template, input.values),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  database.records.push(record);
  database.revision += 1;
  await writeProjectDatabaseAtomic(root, database);
  return record;
});

export const updateRecord = async (
  recordId,
  input,
  { root = ROOT, now = () => new Date() } = {},
) => withMutationLock(async () => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ProjectDataError("Datensatz muss ein Objekt sein.");
  }
  const database = await readProjectDatabase(root);
  const index = database.records.findIndex((record) => record.id === recordId);
  if (index < 0) throw new ProjectDataError(`Datensatz '${recordId}' wurde nicht gefunden.`, 404);
  const existing = database.records[index];
  const templateId = input.templateId || existing.templateId;
  if (templateId !== existing.templateId) {
    throw new ProjectDataError("Vorlage eines bestehenden Datensatzes kann nicht gewechselt werden.", 409);
  }
  const template = database.templates.find((item) => item.id === existing.templateId);
  if (!template) throw new ProjectDataError(`Vorlage '${existing.templateId}' fehlt.`, 500);
  const updated = {
    ...existing,
    values: normalizeRecordValues(template, input.values),
    updatedAt: isoTimestamp(now()),
  };
  database.records[index] = updated;
  database.revision += 1;
  await writeProjectDatabaseAtomic(root, database);
  return updated;
});

export const deleteRecord = async (recordId, { root = ROOT } = {}) => withMutationLock(async () => {
  const database = await readProjectDatabase(root);
  const index = database.records.findIndex((record) => record.id === recordId);
  if (index < 0) throw new ProjectDataError(`Datensatz '${recordId}' wurde nicht gefunden.`, 404);
  const [removed] = database.records.splice(index, 1);
  database.revision += 1;
  await writeProjectDatabaseAtomic(root, database);
  return removed;
});

export const isProtectedProjectDataPath = (filePath, root = ROOT) =>
  path.resolve(filePath) === path.resolve(root, PROJECT_DATABASE_RELATIVE_PATH);

const readJsonBody = async (request) => {
  const contentType = String(request.headers["content-type"] || "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    throw new ProjectDataError("API erwartet Content-Type application/json.", 415);
  }
  let bytes = 0;
  const chunks = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_REQUEST_BYTES) throw new ProjectDataError("API-Anfrage ist zu groß.", 413);
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ProjectDataError("API-Anfrage enthält ungültiges JSON.");
  }
};

const sendJson = (response, statusCode, payload) => {
  const source = `${JSON.stringify(payload)}\n`;
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(source);
};

const checkSameOrigin = (request) => {
  const origin = request.headers.origin;
  if (!origin) return;
  const expected = `http://${request.headers.host}`;
  if (origin !== expected) throw new ProjectDataError("API-Zugriff von fremder Herkunft wurde blockiert.", 403);
};

export const handleProjectDataApi = async (
  request,
  response,
  { root = ROOT, now = () => new Date(), uuid = randomUUID } = {},
) => {
  const url = new URL(request.url || "/", "http://localhost");
  if (!url.pathname.startsWith("/api/provoware/")) return false;

  try {
    checkSameOrigin(request);

    if (request.method === "POST" && url.pathname === "/api/provoware/development-notes") {
      const body = await readJsonBody(request);
      const result = await appendDevelopmentNote(body.text, { root, now });
      sendJson(response, 201, { ok: true, result });
      return true;
    }

    if (request.method === "GET" && url.pathname === "/api/provoware/project-data") {
      sendJson(response, 200, { ok: true, data: await readProjectDatabase(root) });
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/provoware/project-data/templates") {
      const body = await readJsonBody(request);
      const result = await createTemplate(body, { root, now, uuid });
      sendJson(response, 201, { ok: true, result });
      return true;
    }

    const templateMatch = /^\/api\/provoware\/project-data\/templates\/([^/]+)$/.exec(url.pathname);
    if (request.method === "PUT" && templateMatch) {
      const body = await readJsonBody(request);
      const result = await updateTemplate(decodeURIComponent(templateMatch[1]), body, { root, now });
      sendJson(response, 200, { ok: true, result });
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/provoware/project-data/records") {
      const body = await readJsonBody(request);
      const result = await createRecord(body, { root, now, uuid });
      sendJson(response, 201, { ok: true, result });
      return true;
    }

    const recordMatch = /^\/api\/provoware\/project-data\/records\/([^/]+)$/.exec(url.pathname);
    if (request.method === "PUT" && recordMatch) {
      const body = await readJsonBody(request);
      const result = await updateRecord(decodeURIComponent(recordMatch[1]), body, { root, now });
      sendJson(response, 200, { ok: true, result });
      return true;
    }
    if (request.method === "DELETE" && recordMatch) {
      const result = await deleteRecord(decodeURIComponent(recordMatch[1]), { root });
      sendJson(response, 200, { ok: true, result });
      return true;
    }

    sendJson(response, 404, { ok: false, error: "API-Route nicht gefunden." });
    return true;
  } catch (error) {
    const statusCode = error instanceof ProjectDataError ? error.statusCode : 500;
    const message = error instanceof ProjectDataError
      ? error.message
      : "Interner Fehler in der Projekt-Datenverwaltung.";
    if (statusCode >= 500 && !(error instanceof ProjectDataError)) {
      console.error(`[PROJECT-DATA] ${error instanceof Error ? error.stack || error.message : String(error)}`);
    }
    sendJson(response, statusCode, { ok: false, error: message });
    return true;
  }
};
