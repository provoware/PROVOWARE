import http from 'node:http';
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { extname, join } from 'node:path';
import { createLogger } from '../src/scripts/core/logger.js';

const logger = createLogger({ namespace: 'StartScript', debug: true });

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const roots = ['src', '.'];

async function resolveFile(pathname) {
  for (const root of roots) {
    const candidate = join(root, pathname);
    try {
      await access(candidate, constants.R_OK);
      return candidate;
    } catch (error) {
      // continue
    }
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url ?? '/index.html';
  const mime = mimeTypes[extname(urlPath)] ?? 'text/plain; charset=utf-8';
  const filePath = await resolveFile(urlPath.replace(/^\/+/, ''));
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Datei nicht gefunden.');
    logger.error('Datei fehlt', { urlPath });
    return;
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
    logger.debug('Datei ausgeliefert', { filePath });
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Fehler beim Laden der Datei.');
    logger.error('Lesefehler', { filePath, message: error.message });
  }
});

const PORT = 4173;
server.listen(PORT, () => {
  logger.info('Lokaler Server gestartet', { port: PORT, url: `http://localhost:${PORT}` });
});
