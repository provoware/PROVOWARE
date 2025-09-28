import process from 'node:process';
import { runSelfHeal } from '../src/scripts/modules/selfHeal.js';
import { getAllowedThemes } from '../src/scripts/modules/themeManager.js';
import { createLogger } from '../src/scripts/core/logger.js';

const logger = createLogger({ namespace: 'Tests' });

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const healResult = runSelfHeal({ scope: 'global', notes: 'Routine-Test' });
  assert(healResult.success, 'Selbstheilung sollte erfolgreich sein');
  assert(healResult.payload.steps.length === 3, 'Selbstheilung sollte drei Schritte enthalten');

  const healInvalid = runSelfHeal({ scope: 'invalid' });
  assert(!healInvalid.success, 'Ungültiger Scope muss fehlschlagen');

  const themes = getAllowedThemes();
  assert(themes.success, 'Themes sollten verfügbar sein');
  assert(Array.isArray(themes.payload) && themes.payload.length === 3, 'Es werden drei Themes erwartet');

  logger.info('Alle Tests erfolgreich', {});
}

run().catch((error) => {
  logger.error('Tests fehlgeschlagen', { message: error.message });
  process.exitCode = 1;
});
