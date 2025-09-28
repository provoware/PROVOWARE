import { ensureBoolean, ensureString } from './validator.js';

/**
 * Creates a structured logger that can be toggled.
 * @param {{ debug?: boolean; namespace?: string }} options
 */
export function createLogger(options = {}) {
  const debugResult = ensureBoolean(Boolean(options.debug), 'debug');
  const namespaceResult = ensureString(options.namespace ?? 'PROVOWARE', 'namespace');

  const state = {
    debug: debugResult.success ? debugResult.payload : false,
    namespace: namespaceResult.success ? namespaceResult.payload : 'PROVOWARE',
    entries: []
  };

  /**
   * @param {'info'|'warn'|'error'|'debug'} level
   * @param {string} message
   * @param {Record<string, unknown>} [meta]
   */
  function log(level, message, meta = {}) {
    const validatedMessage = ensureString(message, 'message');
    if (!validatedMessage.success) {
      throw new Error(validatedMessage.message);
    }
    const timestamp = new Date().toISOString();
    const entry = { level, message: validatedMessage.payload, timestamp, meta };
    state.entries.push(entry);

    if (level !== 'debug' || state.debug) {
      const prefix = `[${state.namespace}]`;
      // eslint-disable-next-line no-console
      console[level === 'debug' ? 'log' : level](`${prefix} ${timestamp} ${level.toUpperCase()}: ${entry.message}`, meta);
    }
    return { success: true, message: 'Log gespeichert', payload: entry };
  }

  return {
    enableDebug(value) {
      const result = ensureBoolean(value, 'debug');
      if (result.success) {
        state.debug = result.payload;
      }
      return result;
    },
    info(message, meta) {
      return log('info', message, meta);
    },
    warn(message, meta) {
      return log('warn', message, meta);
    },
    error(message, meta) {
      return log('error', message, meta);
    },
    debug(message, meta) {
      return log('debug', message, meta);
    },
    exportLogs() {
      return { success: true, message: 'Logs exportiert', payload: [...state.entries] };
    }
  };
}
