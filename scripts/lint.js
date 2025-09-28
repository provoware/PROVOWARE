import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { createLogger } from '../src/scripts/core/logger.js';

const logger = createLogger({ namespace: 'Lint' });

const roots = ['src', 'design'];

async function collectFiles() {
  const files = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (/\.(js|html|css|json)$/u.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  for (const root of roots) {
    await walk(root);
  }
  return files;
}

async function run() {
  const files = await collectFiles();
  let hasError = false;
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (/\s+$/.test(line)) {
        logger.warn('Trailing whitespace gefunden', { file, line: index + 1 });
        hasError = true;
      }
      if (/\t/.test(line)) {
        logger.warn('Tabulator gefunden – bitte Leerzeichen nutzen', { file, line: index + 1 });
        hasError = true;
      }
    });
  }
  if (hasError) {
    logger.error('Lint fehlgeschlagen', {});
    process.exitCode = 1;
  } else {
    logger.info('Lint erfolgreich', { files: files.length });
  }
}

run().catch((error) => {
  logger.error('Lint Script Fehler', { message: error.message });
  process.exitCode = 1;
});
