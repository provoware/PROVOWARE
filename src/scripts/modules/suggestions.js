import { createLogger } from '../core/logger.js';
import { ensureString } from '../core/validator.js';

const logger = createLogger({ namespace: 'Suggestions' });

const suggestions = [
  'Nutze die Selbstheilung, bevor du Module neu installierst.',
  'Lies die Tooltips (Hinweise), sie erklären Fachbegriffe in einfacher Sprache.',
  'Plane regelmäßige Backups, bevor du neue Datenbanken anlegst.',
  'Aktiviere den Debug-Modus nur, wenn du Probleme untersuchen möchtest.'
];

/**
 * Renders layperson friendly suggestions.
 * @param {HTMLElement} container
 */
export function renderSuggestions(container) {
  if (!(container instanceof HTMLElement)) {
    return { success: false, message: 'Container für Tipps fehlt.' };
  }
  container.innerHTML = '';
  suggestions.forEach((item) => {
    const validated = ensureString(item, 'Tipp');
    if (!validated.success) {
      logger.warn('Tipp übersprungen', { detail: validated.message });
      return;
    }
    const li = document.createElement('li');
    li.textContent = validated.payload;
    container.appendChild(li);
  });
  logger.info('Tipps geladen', { count: suggestions.length });
  return { success: true, message: 'Tipps gerendert', payload: suggestions.length };
}
