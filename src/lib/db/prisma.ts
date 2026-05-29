import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize Prisma.');
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string. Use the Supabase Transaction Pooler URL for runtime.');
  }

  // Ensure SSL parameters are appended for both native Prisma engine and pg driver in production
  if (process.env.NODE_ENV === 'production' || databaseUrl.includes('supabase.com')) {
    const separator = databaseUrl.includes('?') ? '&' : '?';
    if (!databaseUrl.includes('sslaccept=')) {
      databaseUrl = `${databaseUrl}${separator}sslaccept=accept_invalid_certs`;
    }
  }

  return databaseUrl;
}

function getPoolNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function createPrismaClient() {
  const dbUrl = getDatabaseUrl();
  let cleanConnectionString = dbUrl;

  try {
    const parsedUrl = new URL(dbUrl);
    parsedUrl.searchParams.delete('sslmode');
    parsedUrl.searchParams.delete('sslaccept');
    cleanConnectionString = parsedUrl.toString();
  } catch (e) {
    console.error('Failed to parse DATABASE_URL with URL constructor, using raw string.', e);
  }

  const pool = new Pool({
    connectionString: cleanConnectionString,
    max: getPoolNumber('DATABASE_POOL_MAX', 3),
    idleTimeoutMillis: getPoolNumber('DATABASE_IDLE_TIMEOUT_MS', 10_000),
    connectionTimeoutMillis: getPoolNumber('DATABASE_CONNECTION_TIMEOUT_MS', 5_000),
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}
