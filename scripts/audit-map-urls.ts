import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  buildGoogleMapsEmbedUrl,
  isShortGoogleMapsRedirectUrl,
} from '../src/lib/maps/google-maps-embed';

loadEnvConfig(process.cwd());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const rows = await prisma.property.findMany({
    where: { mapUrl: { not: null } },
    select: { slug: true, mapUrl: true, latitude: true, longitude: true },
  });

  for (const row of rows) {
    const url = row.mapUrl ?? '';
    console.info(`\n${row.slug}`);
    console.info(`  mapUrl: ${url}`);
    console.info(`  short: ${isShortGoogleMapsRedirectUrl(url)}`);
    console.info(`  embed: ${buildGoogleMapsEmbedUrl(url) ?? '(null)'}`);
    console.info(`  coords: ${row.latitude}, ${row.longitude}`);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
