/**
 * Genera public/heroe.webp desde public/heroe.jpg (LCP home).
 * Uso: npm run optimize:hero
 */
import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const publicDir = join(process.cwd(), 'public');
const inputPath = join(publicDir, 'heroe.jpg');
const outputPath = join(publicDir, 'heroe.webp');

async function main() {
  if (!existsSync(inputPath)) {
    console.error('No se encontró public/heroe.jpg');
    process.exit(1);
  }

  const info = await sharp(inputPath)
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(outputPath);

  const before = await stat(inputPath);
  console.log(`OK: heroe.webp (${Math.round(info.size / 1024)} KiB) desde heroe.jpg (${Math.round(before.size / 1024)} KiB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
