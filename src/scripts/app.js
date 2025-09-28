import { bindThemeSelect, applyTheme } from './modules/themeManager.js';
import { bindDebugToggle } from './modules/debugToggle.js';
import { bindSelfHealForm } from './modules/selfHeal.js';
import { renderSuggestions } from './modules/suggestions.js';
import { createLogger } from './core/logger.js';

const logger = createLogger({ namespace: 'App', debug: true });

document.addEventListener('DOMContentLoaded', () => {
  logger.debug('Initialisierung gestartet');
  const themeSelect = document.querySelector('#theme-select');
  const debugToggle = document.querySelector('#debug-toggle');
  const selfHealForm = document.querySelector('[data-form="self-heal"]');
  const suggestionList = document.querySelector('#suggestion-list');

  applyTheme(document.documentElement.getAttribute('data-theme') ?? 'dark');

  if (themeSelect instanceof HTMLSelectElement) {
    const result = bindThemeSelect(themeSelect);
    logger.debug('Theme Select Ergebnis', result);
  }
  if (debugToggle instanceof HTMLInputElement) {
    const result = bindDebugToggle(debugToggle);
    logger.debug('Debug Toggle Ergebnis', result);
  }
  if (selfHealForm instanceof HTMLFormElement) {
    const result = bindSelfHealForm(selfHealForm);
    logger.debug('Self-Heal Formular Ergebnis', result);
  }
  if (suggestionList instanceof HTMLElement) {
    const result = renderSuggestions(suggestionList);
    logger.debug('Tipps Ergebnis', result);
  }
});
