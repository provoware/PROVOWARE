import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createLogger } from '../src/scripts/core/logger.js';
import { ensureString } from '../src/scripts/core/validator.js';

const logger = createLogger({ namespace: 'ContrastAudit' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(__dirname, '..', 'design', 'manifest.json');

function ensureHexColor(value, context) {
  const textResult = ensureString(value, context);
  if (!textResult.success) {
    return textResult;
  }
  const trimmed = textResult.payload.trim();
  if (!/^#([0-9a-fA-F]{6})$/.test(trimmed)) {
    return { success: false, message: `${context} muss ein Hex-Farbwert (#RRGGBB) sein.` };
  }
  return { success: true, message: `${context} ist eine Farbe`, payload: trimmed.toLowerCase() };
}

function srgbToLinear(channel) {
  const normalized = channel / 255;
  if (normalized <= 0.04045) {
    return normalized / 12.92;
  }
  return ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(color) {
  const [r, g, b] = [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16)
  ];
  const [rLin, gLin, bLin] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function getContrastRatio(foreground, background) {
  const fg = ensureHexColor(foreground, 'Vordergrundfarbe');
  const bg = ensureHexColor(background, 'Hintergrundfarbe');
  if (!fg.success) {
    return fg;
  }
  if (!bg.success) {
    return bg;
  }
  const l1 = getRelativeLuminance(fg.payload);
  const l2 = getRelativeLuminance(bg.payload);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return { success: true, message: 'Kontrast berechnet', payload: ratio };
}

async function loadManifest() {
  try {
    const raw = await fs.readFile(manifestPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { success: true, message: 'Manifest geladen', payload: parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return { success: false, message: `Manifest konnte nicht geladen werden: ${message}` };
  }
}

function mapThemeKey(themeName) {
  if (themeName === 'high-contrast') {
    return 'highContrast';
  }
  return themeName;
}

async function audit() {
  const manifestResult = await loadManifest();
  if (!manifestResult.success) {
    logger.error('Manifest konnte nicht geladen werden', { detail: manifestResult.message });
    process.exitCode = 1;
    return;
  }

  const manifest = manifestResult.payload;
  const colorTokens = manifest?.tokens?.color;
  const contrastConfig = manifest?.accessibility?.colorContrast;

  if (!colorTokens || typeof colorTokens !== 'object') {
    logger.error('Farbtokens fehlen im Manifest.');
    process.exitCode = 1;
    return;
  }
  if (!Array.isArray(contrastConfig)) {
    logger.error('Kontrast-Konfiguration fehlt oder ist keine Liste.');
    process.exitCode = 1;
    return;
  }

  const failures = [];

  for (const themeConfig of contrastConfig) {
    const themeNameResult = ensureString(themeConfig?.theme ?? '', 'Theme-Name');
    if (!themeNameResult.success) {
      logger.error('Theme-Name fehlt oder ist ungültig', { detail: themeNameResult.message, theme: themeConfig });
      failures.push({ theme: 'unbekannt', pair: 'unbekannt', ratio: 0, minimum: manifest.accessibility?.minimumContrastRatio ?? 4.5 });
      continue;
    }

    const themeName = themeNameResult.payload;
    const tokenKey = mapThemeKey(themeName);
    const tokenSet = colorTokens[tokenKey];
    if (!tokenSet) {
      logger.error('Unbekanntes Theme in der Kontrast-Konfiguration', { theme: themeName });
      failures.push({ theme: themeName, pair: 'unbekannt', ratio: 0, minimum: 0 });
      continue;
    }

    const pairs = Array.isArray(themeConfig.pairs) ? themeConfig.pairs : [];
    for (const pair of pairs) {
      const fgTokenResult = ensureString(pair?.foreground ?? '', 'Vordergrund-Token');
      const bgTokenResult = ensureString(pair?.background ?? '', 'Hintergrund-Token');
      if (!fgTokenResult.success || !bgTokenResult.success) {
        logger.error('Token-Angaben fehlen', { theme: themeName, pair, detail: [fgTokenResult.message, bgTokenResult.message] });
        failures.push({ theme: themeName, pair: 'Token unvollständig', ratio: 0, minimum: manifest.accessibility?.minimumContrastRatio ?? 4.5 });
        continue;
      }

      const fgToken = fgTokenResult.payload;
      const bgToken = bgTokenResult.payload;
      const minimum = typeof pair?.minimum === 'number' ? pair.minimum : manifest.accessibility?.minimumContrastRatio ?? 4.5;

      const fgValue = tokenSet[fgToken];
      const bgValue = tokenSet[bgToken];

      if (!fgValue || !bgValue) {
        logger.error('Farbtokens konnten nicht aufgelöst werden', { theme: themeName, pair });
        failures.push({ theme: themeName, pair: `${fgToken} auf ${bgToken}`, ratio: 0, minimum });
        continue;
      }

      const ratioResult = getContrastRatio(fgValue, bgValue);
      if (!ratioResult.success) {
        logger.error('Kontrast konnte nicht berechnet werden', { theme: themeName, pair, detail: ratioResult.message });
        failures.push({ theme: themeName, pair: `${fgToken} auf ${bgToken}`, ratio: 0, minimum });
        continue;
      }

      const rounded = Number(ratioResult.payload.toFixed(2));
      const passes = rounded >= minimum;

      const message = passes ? '✓ Kontrast erfüllt' : '✗ Kontrast zu niedrig';
      const meta = { theme: themeName, pair: `${fgToken} auf ${bgToken}`, ratio: rounded, minimum };
      if (passes) {
        logger.info(message, meta);
      } else {
        logger.error(message, meta);
        failures.push({ theme: themeName, pair: meta.pair, ratio: rounded, minimum });
      }
    }
  }

  if (failures.length > 0) {
    logger.error('Kontrastprüfung nicht bestanden', { failures });
    process.exitCode = 1;
    return;
  }

  logger.info('Kontrastprüfung erfolgreich abgeschlossen', {});
}

audit().catch((error) => {
  logger.error('Unbehandelter Fehler in der Kontrastprüfung', { message: error.message });
  process.exitCode = 1;
});
