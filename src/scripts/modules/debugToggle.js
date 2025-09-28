import { ensureBoolean, ensureString } from '../core/validator.js';
import { createLogger } from '../core/logger.js';

const logger = createLogger({ namespace: 'DebugToggle', debug: true });

/**
 * Binds a checkbox to debug state toggling.
 * @param {HTMLInputElement} input
 */
export function bindDebugToggle(input) {
  const tag = ensureString(input?.tagName ?? '', 'Debug Toggle Tag');
  if (!tag.success || tag.payload.toLowerCase() !== 'input') {
    return { success: false, message: 'Debug-Umschalter muss ein Eingabefeld sein.' };
  }
  if (input.type !== 'checkbox') {
    return { success: false, message: 'Debug-Umschalter benötigt type="checkbox".' };
  }
  input.checked = document.body.dataset.debug === 'true';
  input.addEventListener('change', () => {
    const nextValue = input.checked;
    const validated = ensureBoolean(nextValue, 'Debug Wert');
    if (!validated.success) {
      logger.error('Ungültiger Debug-Wert', { nextValue });
      return;
    }
    document.body.dataset.debug = String(validated.payload);
    logger.enableDebug(validated.payload);
    logger.debug('Debug-Modus umgeschaltet', { active: validated.payload });
  });
  return { success: true, message: 'Debug-Umschalter verbunden' };
}
