import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

loadEnvConfig(process.cwd());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD;
  const candidates = [
    envEmail,
    'admin@calafatepropiedades.com',
    'admin@dahusshomes.com',
  ].filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i);

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, password: true },
  });

  console.info('ADMIN_EMAIL in env:', envEmail ?? '(missing)');
  console.info('ADMIN_PASSWORD set:', Boolean(envPassword));
  console.info('Users in database:', users.map((u) => ({ email: u.email, role: u.role })));

  if (!envPassword) {
    console.error('ADMIN_PASSWORD is missing in env.');
    return;
  }

  for (const email of candidates) {
    const user = users.find((u) => u.email.toLowerCase() === email);
    const dbOk = user ? await bcrypt.compare(envPassword, user.password) : false;
    const envOk = email === envEmail && envPassword.length >= 6;
    console.info(`Check ${email}:`, {
      inDatabase: Boolean(user),
      passwordMatchesDb: dbOk,
      wouldMatchEnvFallback: envOk,
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
