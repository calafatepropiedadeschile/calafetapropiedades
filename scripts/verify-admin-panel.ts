import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';
import { withDatabaseRole } from '../src/lib/db/rls';
import { SITE_SETTINGS_ID } from '../src/features/site-content/site-settings';
import { HOME_HERO_ID } from '../src/features/site-content/home-hero.defaults';
import { SITE_SEO_SETTINGS_ID } from '../src/features/site-content/seo-settings';

loadEnvConfig(process.cwd());

type CheckResult = {
  area: string;
  name: string;
  ok: boolean;
  detail: string;
};

const results: CheckResult[] = [];

function record(area: string, name: string, ok: boolean, detail: string) {
  results.push({ area, name, ok, detail });
  const prefix = ok ? 'PASS' : 'FAIL';
  console.info(`[${prefix}] ${area} :: ${name} — ${detail}`);
}

async function runCheck(area: string, name: string, fn: () => Promise<string> | string) {
  try {
    const detail = await fn();
    record(area, name, true, detail);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    record(area, name, false, detail);
  }
}

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1).replace(/^["']|["']$/g, '');
  }
  return out;
}

async function checkEnvironment() {
  const required = ['DATABASE_URL', 'AUTH_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'] as const;
  for (const key of required) {
    const value = process.env[key]?.trim();
    record('Entorno', key, Boolean(value), value ? 'presente' : 'falta');
  }

  const authUrl = process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  record('Entorno', 'AUTH/NEXTAUTH URL', Boolean(authUrl), authUrl ?? 'falta');

  const uploadReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
  record(
    'Entorno',
    'Upload imagenes (Supabase)',
    uploadReady,
    uploadReady ? 'configurado' : 'faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'
  );
}

async function checkAdminLogin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    record('Login', 'Credenciales admin', false, 'ADMIN_EMAIL o ADMIN_PASSWORD faltante');
    return;
  }

  const user = await withDatabaseRole('auth', (db) =>
    db.user.findUnique({
      where: { email: adminEmail },
      select: { id: true, email: true, role: true, password: true },
    })
  );

  if (user) {
    const passwordOk = await bcrypt.compare(adminPassword, user.password);
    record(
      'Login',
      'Usuario en BD',
      passwordOk && user.role === 'admin',
      passwordOk
        ? `admin@${user.email} rol=${user.role}`
        : 'password no coincide con ADMIN_PASSWORD'
    );
    return;
  }

  record(
    'Login',
    'Fallback env admin',
    adminPassword.length >= 6,
    'sin usuario en BD; login usará ADMIN_EMAIL/ADMIN_PASSWORD del entorno'
  );
}

async function checkAdminTableAccess() {
  const checks: Array<{ label: string; run: () => Promise<string> }> = [
    {
      label: 'Dashboard / Propiedades',
      run: async () => {
        const [total, sample] = await withDatabaseRole('admin', async (db) =>
          Promise.all([
            db.property.count(),
            db.property.findFirst({
              select: {
                id: true,
                slug: true,
                agentId: true,
                youtubeUrl: true,
                sortOrder: true,
              },
            }),
          ])
        );
        return `${total} propiedades; columnas fase2=${sample ? 'OK' : 'sin filas'}`;
      },
    },
    {
      label: 'Consultas / Leads',
      run: async () => {
        const total = await withDatabaseRole('admin', (db) => db.lead.count());
        return `${total} leads`;
      },
    },
    {
      label: 'Agentes',
      run: async () => {
        const total = await withDatabaseRole('admin', (db) => db.agent.count());
        return `${total} agentes`;
      },
    },
    {
      label: 'Paginas estaticas',
      run: async () => {
        const total = await withDatabaseRole('admin', (db) => db.staticPage.count());
        return `${total} paginas`;
      },
    },
    {
      label: 'Hero inicio',
      run: async () => {
        const row = await withDatabaseRole('admin', (db) =>
          db.homeHeroSettings.findUnique({ where: { id: HOME_HERO_ID } })
        );
        return row ? 'registro main OK' : 'sin registro (usa defaults)';
      },
    },
    {
      label: 'SEO global',
      run: async () => {
        const row = await withDatabaseRole('admin', (db) =>
          db.siteSeoSettings.findUnique({ where: { id: SITE_SEO_SETTINGS_ID } })
        );
        return row ? `siteName=${row.siteName}` : 'sin registro (usa defaults)';
      },
    },
    {
      label: 'Ajustes del sitio',
      run: async () => {
        const row = await withDatabaseRole('admin', (db) =>
          db.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } })
        );
        return row ? 'registro main OK' : 'sin registro (usa defaults)';
      },
    },
  ];

  for (const check of checks) {
    await runCheck('Acceso admin (RLS)', check.label, check.run);
  }
}

async function checkAdminWriteSmoke() {
  const marker = `admin-smoke-${Date.now()}`;

  await runCheck('Escritura admin', 'Agente create/delete', async () => {
    const created = await withDatabaseRole('admin', (db) =>
      db.agent.create({
        data: {
          name: marker,
          email: `${marker}@test.local`,
          phone: '+56900000000',
        },
        select: { id: true },
      })
    );
    await withDatabaseRole('admin', (db) => db.agent.delete({ where: { id: created.id } }));
    return `agente temporal ${created.id} creado y eliminado`;
  });

  await runCheck('Escritura admin', 'SiteSettings upsert', async () => {
    await withDatabaseRole('admin', (db) =>
      db.siteSettings.upsert({
        where: { id: SITE_SETTINGS_ID },
        create: { id: SITE_SETTINGS_ID, discoverEyebrow: marker },
        update: { discoverEyebrow: marker },
      })
    );
    await withDatabaseRole('admin', (db) =>
      db.siteSettings.update({
        where: { id: SITE_SETTINGS_ID },
        data: { discoverEyebrow: null },
      })
    );
    return 'upsert y cleanup OK';
  });

  await runCheck('Escritura admin', 'StaticPage create/delete', async () => {
    const slug = `smoke-${Date.now()}`;
    const created = await withDatabaseRole('admin', (db) =>
      db.staticPage.create({
        data: {
          slug,
          titleEs: marker,
          contentEs: 'Smoke test',
          published: false,
        },
        select: { id: true },
      })
    );
    await withDatabaseRole('admin', (db) => db.staticPage.delete({ where: { id: created.id } }));
    return `pagina /${slug} creada y eliminada`;
  });

  await runCheck('Escritura admin', 'HomeHero upsert', async () => {
    const current = await withDatabaseRole('admin', (db) =>
      db.homeHeroSettings.findUnique({ where: { id: HOME_HERO_ID } })
    );
    await withDatabaseRole('admin', (db) =>
      db.homeHeroSettings.upsert({
        where: { id: HOME_HERO_ID },
        create: {
          id: HOME_HERO_ID,
          titleLine1Es: marker,
        },
        update: {
          titleLine1Es: marker,
        },
      })
    );
    await withDatabaseRole('admin', (db) =>
      db.homeHeroSettings.upsert({
        where: { id: HOME_HERO_ID },
        create: { id: HOME_HERO_ID, titleLine1Es: current?.titleLine1Es ?? 'Calafate' },
        update: { titleLine1Es: current?.titleLine1Es ?? null },
      })
    );
    return 'hero actualizado y restaurado';
  });

  await runCheck('Escritura admin', 'Lead status update', async () => {
    const lead = await withDatabaseRole('admin', (db) =>
      db.lead.findFirst({ select: { id: true, status: true } })
    );
    if (!lead) return 'sin leads (skip)';
    const original = lead.status;
    const next = original === 'pendiente' ? 'contactada' : 'pendiente';
    await withDatabaseRole('admin', (db) =>
      db.lead.update({ where: { id: lead.id }, data: { status: next } })
    );
    await withDatabaseRole('admin', (db) =>
      db.lead.update({ where: { id: lead.id }, data: { status: original } })
    );
    return `lead ${lead.id}: ${original} -> ${next} -> ${original}`;
  });
}

async function checkPublicReadAccess() {
  await runCheck('Lectura publica', 'Propiedades publicadas', async () => {
    const count = await withDatabaseRole('public', (db) =>
      db.property.count({ where: { published: true } })
    );
    return `${count} publicadas`;
  });

  await runCheck('Lectura publica', 'SiteSettings', async () => {
    const row = await withDatabaseRole('public', (db) =>
      db.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } })
    );
    return row ? 'OK' : 'sin fila (fallback config)';
  });

  await runCheck('Lectura publica', 'Agentes', async () => {
    const count = await withDatabaseRole('public', (db) => db.agent.count());
    return `${count} visibles`;
  });
}

async function checkAdminRoutes(baseUrl: string) {
  const routes = [
    '/admin/login',
    '/admin',
    '/admin/inicio',
    '/admin/ajustes',
    '/admin/seo',
    '/admin/paginas',
    '/admin/propiedades',
    '/admin/propiedades/nueva',
    '/admin/agentes',
    '/admin/leads',
    '/admin/campanas',
    '/admin/leads/export',
  ];

  for (const route of routes) {
    await runCheck('Rutas HTTP', route, async () => {
      const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
      const ok = response.status >= 200 && response.status < 400;
      if (!ok && response.status !== 401 && response.status !== 403) {
        throw new Error(`HTTP ${response.status}`);
      }
      const location = response.headers.get('location');
      if (route !== '/admin/login' && response.status >= 300 && response.status < 400) {
        if (!location?.includes('/admin/login')) {
          throw new Error(`redirect inesperado a ${location ?? '(none)'}`);
        }
        return `redirect login (${response.status})`;
      }
      return `HTTP ${response.status}`;
    });
  }
}

async function checkRlsRoles() {
  const roles = [
    'calafate_public_runtime',
    'calafate_auth_runtime',
    'calafate_admin_runtime',
  ] as const;

  const { getPrismaClient } = await import('../src/lib/db/prisma');
  const prisma = getPrismaClient();

  for (const role of roles) {
    await runCheck('RLS', `Rol ${role}`, async () => {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL ROLE "${role}"`);
      });
      return 'SET ROLE OK';
    });
  }
}

async function checkCmsSanitization() {
  const { sanitizeCmsHtml } = await import('../src/lib/security/sanitize-html');

  await runCheck('Seguridad CMS', 'Sanitiza script XSS', () => {
    const sanitized = sanitizeCmsHtml('<p>Hola</p><script>alert(1)</script><img src=x onerror=alert(1)>');
    if (sanitized.includes('<script') || sanitized.includes('onerror')) {
      throw new Error(`contenido inseguro: ${sanitized}`);
    }
    return 'script/event handlers eliminados';
  });
}

async function main() {
  console.info('=== Verificacion panel admin Calafate Propiedades ===\n');

  await checkEnvironment();
  await checkAdminLogin();
  await checkRlsRoles();
  await checkCmsSanitization();
  await checkAdminTableAccess();
  await checkAdminWriteSmoke();
  await checkPublicReadAccess();

  const baseUrl = (
    process.env.APP_ORIGIN
    ?? process.env.AUTH_URL
    ?? process.env.NEXTAUTH_URL
    ?? loadEnvFile(resolve('.env.local')).APP_ORIGIN
    ?? 'http://localhost:3000'
  ).replace(/\/$/, '');

  console.info(`\nProbando rutas en ${baseUrl} ...\n`);
  await checkAdminRoutes(baseUrl);

  const failed = results.filter((result) => !result.ok);
  const passed = results.filter((result) => result.ok);

  console.info('\n=== Resumen ===');
  console.info(`PASS: ${passed.length} | FAIL: ${failed.length} | TOTAL: ${results.length}`);

  if (failed.length) {
    console.info('\nFallos:');
    for (const fail of failed) {
      console.info(`- [${fail.area}] ${fail.name}: ${fail.detail}`);
    }
    process.exitCode = 1;
    return;
  }

  console.info('\nPanel admin: todas las verificaciones pasaron.');
}

main().catch((error) => {
  console.error('Verificacion abortada:', error);
  process.exitCode = 1;
});
