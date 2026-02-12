import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createLogger } from '../src/scripts/core/logger.js';

const logger = createLogger({ namespace: 'Format' });

async function collectJsonFiles() {
  const files = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }
  await walk('design');
  files.push('package.json');
  return files;
}

async function formatJsonFiles() {
  const files = await collectJsonFiles();
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    try {
      const parsed = JSON.parse(content);
      await writeFile(file, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
      logger.debug('Datei formatiert', { file });
    } catch (error) {
      logger.error('JSON Formatierung fehlgeschlagen', { file, message: error.message });
      throw error;
    }
  }
  logger.info('JSON Dateien formatiert', { count: files.length });
}

formatJsonFiles().catch((error) => {
  logger.error('Formatter abgebrochen', { message: error.message });
  process.exitCode = 1;
});
