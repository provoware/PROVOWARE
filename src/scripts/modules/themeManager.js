import { ensureOneOf, ensureString } from '../core/validator.js';
import { createLogger } from '../core/logger.js';

const logger = createLogger({ namespace: 'ThemeManager' });

const allowedThemes = ['dark', 'light', 'high-contrast'];

/**
 * Applies theme to document root.
 * @param {string} theme
 */
export function applyTheme(theme) {
  const result = ensureOneOf(theme, allowedThemes, 'Theme');
  if (!result.success) {
    logger.error('Ungültiges Theme', { theme, detail: result.message });
    return result;
  }
  document.documentElement.setAttribute('data-theme', result.payload);
  logger.info('Theme geändert', { theme: result.payload });
  return { success: true, message: 'Theme aktiviert', payload: result.payload };
}

/**
 * Synchronises select element with current theme.
 * @param {HTMLSelectElement} select
 */
export function bindThemeSelect(select) {
  const selectValidation = ensureString(select?.tagName ?? '', 'Theme Select Tag');
  if (!selectValidation.success || selectValidation.payload.toLowerCase() !== 'select') {
    return { success: false, message: 'Theme-Auswahl muss ein <select> Element sein.' };
  }
  select.value = document.documentElement.getAttribute('data-theme') ?? 'dark';
  select.addEventListener('change', (event) => {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      applyTheme(target.value);
    }
  });
  return { success: true, message: 'Theme-Auswahl verbunden' };
}

export function getAllowedThemes() {
  return { success: true, message: 'Themes bereit', payload: [...allowedThemes] };
}
