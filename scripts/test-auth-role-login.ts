import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';
import { withDatabaseRole } from '../src/lib/db/rls';

loadEnvConfig(process.cwd());

async function main() {
  const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? 'admin@calafatepropiedades.com')
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!password) throw new Error('ADMIN_PASSWORD missing');

  try {
    const user = await withDatabaseRole('auth', (db) =>
      db.user.findUnique({
        where: { email },
        select: { id: true, email: true, password: true, role: true },
      }),
    );

    if (!user) {
      console.error('auth role: user not found for', email);
      return;
    }

    const ok = await bcrypt.compare(password, user.password);
    console.info('auth role lookup:', { email: user.email, passwordOk: ok });
  } catch (error) {
    console.error('auth role lookup failed:', error);
  }
}

main();
