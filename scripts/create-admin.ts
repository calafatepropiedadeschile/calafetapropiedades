/**
 * Crea o actualiza un usuario administrador en la tabla User (login /admin).
 * No usa Supabase Auth; el panel admin autentica con NextAuth + bcrypt.
 *
 * Uso:
 *   npx tsx scripts/create-admin.ts
 *   npx tsx scripts/create-admin.ts --email otro@ejemplo.com --name "Nombre"
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

loadEnvConfig(process.cwd());

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) return undefined;
  return process.argv[index + 1]?.trim();
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

const email = (readArg('--email') ?? process.env.ADMIN_EMAIL ?? 'admin@calafatepropiedades.com')
  .trim()
  .toLowerCase();
const name = readArg('--name') ?? 'Administrador';
const password = readArg('--password') ?? process.env.ADMIN_PASSWORD;

if (!password || password.length < 6) {
  throw new Error('Set ADMIN_PASSWORD in .env.local or pass --password (min 6 characters).');
}
const adminPassword = password;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      role: 'admin',
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  console.info('Admin user ready for /admin/login:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  });
  console.info('Password source:', readArg('--password') ? '--password argument' : 'ADMIN_PASSWORD env');
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
