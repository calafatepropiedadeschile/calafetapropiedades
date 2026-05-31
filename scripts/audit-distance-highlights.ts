import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL required');

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const properties = await prisma.property.findMany({
    select: { slug: true, distanceHighlights: true, descriptionEs: true },
  });

  for (const property of properties) {
    let highlights: string[] = [];
    try {
      highlights = JSON.parse(property.distanceHighlights) as string[];
    } catch {
      highlights = [];
    }

    if (highlights.length === 0) continue;

    console.info(`\n--- ${property.slug} (${highlights.length} highlights) ---`);
    for (const item of highlights) {
      console.info(`  • ${item}`);
    }
    console.info(`  desc: ${property.descriptionEs?.slice(0, 120).replace(/\n/g, ' ')}…`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
