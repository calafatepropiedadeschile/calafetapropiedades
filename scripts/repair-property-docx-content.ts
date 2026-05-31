/**
 * Repara descriptionEs y distanceHighlights corruptos por importación DOCX antigua.
 * Uso: npx tsx scripts/repair-property-docx-content.ts
 *      npx tsx scripts/repair-property-docx-content.ts --dry-run
 */
import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  cleanImportedDescription,
  parseDistanceHighlightsFromText,
  sanitizeDistanceHighlights,
} from '../src/features/properties/property-import-text';

loadEnvConfig(process.cwd());

const dryRun = process.argv.includes('--dry-run');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function parseHighlightsJson(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

async function main() {
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      slug: true,
      titleEs: true,
      descriptionEs: true,
      distanceHighlights: true,
    },
  });

  let updated = 0;

  for (const property of properties) {
    const currentHighlights = parseHighlightsJson(property.distanceHighlights);
    const cleanedHighlights = sanitizeDistanceHighlights(currentHighlights);
    const cleanedDescription = cleanImportedDescription(property.descriptionEs, property.titleEs);

    const highlightsChanged = JSON.stringify(cleanedHighlights) !== JSON.stringify(currentHighlights);
    const descriptionChanged = cleanedDescription !== property.descriptionEs;

    if (!highlightsChanged && !descriptionChanged) {
      continue;
    }

    console.info(`\n[${property.slug}]`);
    if (highlightsChanged) {
      console.info(`  distanceHighlights: ${currentHighlights.length} -> ${cleanedHighlights.length}`);
      if (currentHighlights.length > 0) {
        console.info('  eliminados:', currentHighlights.slice(0, 3).join(' | '), '...');
      }
      if (cleanedHighlights.length > 0) {
        console.info('  conservados:', cleanedHighlights.join(' | '));
      }
    }
    if (descriptionChanged) {
      console.info(`  descriptionEs: ${property.descriptionEs.length} -> ${cleanedDescription.length} chars`);
      console.info(`  preview: ${cleanedDescription.slice(0, 140)}…`);
    }

    if (!dryRun) {
      await prisma.property.update({
        where: { id: property.id },
        data: {
          descriptionEs: cleanedDescription,
          distanceHighlights: JSON.stringify(cleanedHighlights),
        },
      });
    }

    updated += 1;
  }

  console.info(`\n${dryRun ? 'Dry-run' : 'Actualizadas'}: ${updated} propiedades de ${properties.length}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
