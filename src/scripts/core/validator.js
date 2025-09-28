/**
 * Basic validation helpers returning structured results.
 * @typedef {{ success: boolean; message: string; payload?: any }} ValidationResult
 */

/**
 * Ensures the provided value is a string.
 * @param {unknown} value
 * @param {string} context
 * @returns {ValidationResult & { payload?: string }}
 */
export function ensureString(value, context = 'Wert') {
  if (typeof value === 'string') {
    return { success: true, message: `${context} ok`, payload: value };
  }
  return { success: false, message: `${context} muss ein Text (string) sein.` };
}

/**
 * Ensures the provided value is part of allowed list.
 * @param {string} value
 * @param {string[]} allowed
 * @param {string} context
 * @returns {ValidationResult & { payload?: string }}
 */
export function ensureOneOf(value, allowed, context = 'Wert') {
  const base = ensureString(value, context);
  if (!base.success) {
    return base;
  }
  if (!Array.isArray(allowed)) {
    return { success: false, message: 'Erlaubte Werte (allowed) müssen eine Liste sein.' };
  }
  if (allowed.includes(base.payload)) {
    return { success: true, message: `${context} erlaubt`, payload: base.payload };
  }
  return {
    success: false,
    message: `${context} muss einer der Werte ${allowed.join(', ')} sein.`
  };
}

/**
 * Validates a boolean value.
 * @param {unknown} value
 * @param {string} context
 * @returns {ValidationResult & { payload?: boolean }}
 */
export function ensureBoolean(value, context = 'Wert') {
  if (typeof value === 'boolean') {
    return { success: true, message: `${context} ok`, payload: value };
  }
  return { success: false, message: `${context} muss true oder false (boolean) sein.` };
}

/**
 * Wraps any action in a try/catch and returns structured outcome.
 * @template T
 * @param {() => T} fn
 * @param {string} context
 * @returns {{ success: boolean; message: string; payload?: T }}
 */
export function runSafely(fn, context = 'Aktion') {
  try {
    const payload = fn();
    return { success: true, message: `${context} erfolgreich`, payload };
  } catch (error) {
    return { success: false, message: `${context} fehlgeschlagen: ${(/** @type {Error} */ (error)).message}` };
  }
}
