import { spawn } from 'node:child_process';
import process from 'node:process';
import { createLogger } from '../src/scripts/core/logger.js';

const logger = createLogger({ namespace: 'CI' });

function runCommand(command, args) {
  return new Promise((resolve) => {
    logger.info('Starte Schritt', { command, args });
    const child = spawn(command, args, { stdio: 'inherit', shell: false });
    child.on('close', (code) => {
      if (code !== 0) {
        logger.error('Schritt fehlgeschlagen', { command, code });
      } else {
        logger.info('Schritt abgeschlossen', { command });
      }
      resolve(code === 0);
    });
  });
}

const steps = [
  () => runCommand('node', ['scripts/format.js']),
  () => runCommand('node', ['scripts/lint.js']),
  () => runCommand('node', ['scripts/test.js']),
  () => runCommand('node', ['scripts/contrast.js']),
  () => runCommand('node', ['scripts/accessibility.js'])
];

async function run() {
  for (const step of steps) {
    const ok = await step();
    if (!ok) {
      logger.error('CI Pipeline abgebrochen', {});
      process.exitCode = 1;
      return;
    }
  }
  logger.info('CI Pipeline erfolgreich', {});
}

run().catch((error) => {
  logger.error('CI Skript Fehler', { message: error.message });
  process.exitCode = 1;
});
