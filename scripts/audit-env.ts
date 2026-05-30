import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function mask(value: string | undefined, show = 4): string {
  if (!value) return '(missing)';
  if (value.length <= show * 2) return '*'.repeat(value.length);
  return `${value.slice(0, show)}…${value.slice(-show)} (${value.length} chars)`;
}

function audit(label: string, env: Record<string, string>) {
  const issues: string[] = [];
  const authUrl = env.AUTH_URL || env.NEXTAUTH_URL;
  const authSecret = env.AUTH_SECRET || env.NEXTAUTH_SECRET;

  console.info(`\n=== ${label} ===`);

  if (!env.DATABASE_URL) issues.push('DATABASE_URL missing');
  else if (!env.DATABASE_URL.includes('supabase.com')) issues.push('DATABASE_URL does not look like Supabase');

  if (!authSecret) issues.push('AUTH_SECRET and NEXTAUTH_SECRET both missing');
  else if (authSecret.includes('change-this-super-secret')) issues.push('AUTH secret still uses placeholder');

  if (!authUrl) issues.push('AUTH_URL and NEXTAUTH_URL both missing');
  else if (authUrl.includes('localhost')) issues.push(`${authUrl.includes('localhost') ? 'AUTH/NEXTAUTH_URL' : 'URL'} points to localhost in production`);

  if (!env.ADMIN_EMAIL) issues.push('ADMIN_EMAIL missing');
  if (!env.ADMIN_PASSWORD) issues.push('ADMIN_PASSWORD missing');
  else if (env.ADMIN_PASSWORD.length < 6) issues.push('ADMIN_PASSWORD too short');

  if (env.AUTH_URL && env.NEXTAUTH_URL && env.AUTH_URL !== env.NEXTAUTH_URL) {
    issues.push(`AUTH_URL (${env.AUTH_URL}) != NEXTAUTH_URL (${env.NEXTAUTH_URL})`);
  }

  console.info({
    DATABASE_URL: env.DATABASE_URL ? `${env.DATABASE_URL.split('@')[1]?.split('?')[0] ?? 'set'}` : '(missing)',
    AUTH_URL: env.AUTH_URL ?? '(missing)',
    NEXTAUTH_URL: env.NEXTAUTH_URL ?? '(missing)',
    APP_ORIGIN: env.APP_ORIGIN ?? '(missing)',
    AUTH_TRUST_HOST: env.AUTH_TRUST_HOST ?? '(missing)',
    ADMIN_EMAIL: env.ADMIN_EMAIL ?? '(missing)',
    ADMIN_PASSWORD: mask(env.ADMIN_PASSWORD),
    AUTH_SECRET: mask(env.AUTH_SECRET || env.NEXTAUTH_SECRET),
  });

  if (issues.length) {
    console.error('Issues:', issues);
  } else {
    console.info('No obvious env issues.');
  }
}

audit('local .env.local', loadEnvFile(resolve('.env.local')));
audit('Vercel production', loadEnvFile(resolve('.env.vercel.production')));
