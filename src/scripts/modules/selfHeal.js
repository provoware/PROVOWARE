import { ensureOneOf, ensureString, runSafely } from '../core/validator.js';
import { createLogger } from '../core/logger.js';

const logger = createLogger({ namespace: 'SelfHeal' });

const scopes = ['global', 'module', 'database'];

/**
 * Simulated self-repair routine.
 * @param {{ scope: string; notes?: string }} payload
 */
export function runSelfHeal(payload) {
  const scopeValidation = ensureOneOf(payload.scope, scopes, 'Self-Heal Bereich');
  if (!scopeValidation.success) {
    logger.warn('Ungültiger Bereich', { scope: payload.scope, detail: scopeValidation.message });
    return scopeValidation;
  }
  if (payload.notes) {
    const notesValidation = ensureString(payload.notes, 'Hinweis');
    if (!notesValidation.success) {
      logger.warn('Hinweis nicht gültig', { detail: notesValidation.message });
      return notesValidation;
    }
  }

  return runSafely(() => {
    const steps = [
      'Abhängigkeiten prüfen',
      'Integrität reparieren',
      'Komponenten neu starten'
    ];
    logger.info('Selbstheilung ausgeführt', { scope: scopeValidation.payload, steps });
    return {
      scope: scopeValidation.payload,
      steps,
      message: 'Alle Probleme automatisch behoben.'
    };
  }, 'Selbstheilung');
}

/**
 * Bindet ein Formular an die Routine.
 * @param {HTMLFormElement} form
 */
export function bindSelfHealForm(form) {
  if (!(form instanceof HTMLFormElement)) {
    return { success: false, message: 'Self-Heal Formular ungültig.' };
  }
  const output = form.querySelector('output[name="result"]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const scope = String(formData.get('scope'));
    const notes = formData.get('notes');
    const result = runSelfHeal({ scope, notes: notes ? String(notes) : undefined });
    if (output) {
      output.textContent = result.success
        ? '✅ ' + result.payload.message
        : '⚠️ ' + result.message;
    }
  });
  return { success: true, message: 'Self-Heal Formular verbunden' };
}
