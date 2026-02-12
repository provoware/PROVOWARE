import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { createLogger } from '../src/scripts/core/logger.js';

const logger = createLogger({ namespace: 'Accessibility' });

async function run() {
  const html = await readFile('src/index.html', 'utf8');
  const hasSkipLink = html.includes('class="skip-link"');
  const hasAriaMain = html.includes('role="main"');
  const hasThemeSelect = html.includes('id="theme-select"');
  const hasFooter = html.includes('role="contentinfo"');

  if (hasSkipLink && hasAriaMain && hasThemeSelect && hasFooter) {
    logger.info('Barrierefreiheit Grundprüfung bestanden', {});
  } else {
    logger.error('Barrierefreiheit fehlgeschlagen', {
      hasSkipLink,
      hasAriaMain,
      hasThemeSelect,
      hasFooter
    });
    process.exitCode = 1;
  }
}

run().catch((error) => {
  logger.error('A11y Script Fehler', { message: error.message });
  process.exitCode = 1;
});
