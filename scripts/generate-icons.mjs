/**
 * Generate app icons using the Prudency logo SVG on the profile-page background.
 *
 * Background: #040924 (primary[950]) with a radial violet glow (#744385).
 * Logo: the "P + location pin" from assets/images/logo.svg, centered.
 *
 * Outputs:
 *   assets/images/icon.png          — 1024×1024 (iOS + fallback)
 *   assets/images/adaptive-icon.png — 1024×1024 (Android foreground, transparent bg)
 *   assets/images/favicon.png       —   48×48   (web)
 *   assets/images/splash-icon.png   —  200×200  (splash)
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'assets/images');

// Read the raw logo SVG
const logoSvgRaw = readFileSync(resolve(OUT, 'logo.svg'), 'utf-8');

function buildIconSvg(size, logoScale, withBackground = true) {
  // The logo viewBox is 58×79, so it's taller than wide.
  const logoH = size * logoScale;
  const logoW = logoH * (58 / 79);
  const logoX = (size - logoW) / 2;
  const logoY = (size - logoH) / 2;

  // Extract the inner SVG content (paths + circles) from the logo
  const innerContent = logoSvgRaw
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim();

  const bg = withBackground
    ? `
      <!-- Background fill -->
      <rect width="${size}" height="${size}" fill="#040924"/>
      <!-- Radial violet glow (matches ScreenBackground) -->
      <defs>
        <radialGradient id="glow" cx="50%" cy="40%" r="55%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stop-color="#744385" stop-opacity="0.55"/>
          <stop offset="45%" stop-color="#744385" stop-opacity="0.35"/>
          <stop offset="75%" stop-color="#744385" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#744385" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#glow)"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bg}
    <!-- Centered logo -->
    <g transform="translate(${logoX}, ${logoY}) scale(${logoW / 58})">
      ${innerContent}
    </g>
  </svg>`;
}

async function generateIcon(name, size, logoScale, withBackground = true) {
  const svg = buildIconSvg(size, logoScale, withBackground);
  const outPath = resolve(OUT, name);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
  console.log(`  ✓ ${name} (${size}×${size})`);
}

console.log('Generating Prudency app icons...\n');

await Promise.all([
  // iOS icon — logo centered on dark bg with glow, 1024×1024
  generateIcon('icon.png', 1024, 0.55, true),
  // Android adaptive icon foreground — logo on dark bg, 1024×1024
  // (adaptive icons have safe zone ~66% of total, so we use the bg too)
  generateIcon('adaptive-icon.png', 1024, 0.45, true),
  // Favicon — small, with background
  generateIcon('favicon.png', 48, 0.6, true),
  // Splash icon — logo on dark background
  generateIcon('splash-icon.png', 200, 0.6, true),
]);

console.log('\nDone! All icons written to assets/images/');
