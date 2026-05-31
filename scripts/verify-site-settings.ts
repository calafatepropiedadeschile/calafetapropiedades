import { loadEnvConfig } from '@next/env';
import { withDatabaseRole } from '../src/lib/db/rls';
import {
  resolveSiteSettings,
  SITE_SETTINGS_ID,
} from '../src/features/site-content/site-settings';

loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
  }

  console.info('--- SiteSettings verification ---');

  const publicRead = await withDatabaseRole('public', (db) =>
    db.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } })
  );
  console.info('Public role SELECT:', publicRead ? 'row found' : 'no row yet (fallback OK)');

  const marker = `verify-${Date.now()}`;
  await withDatabaseRole('admin', (db) =>
    db.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: { id: SITE_SETTINGS_ID, discoverEyebrow: marker },
      update: { discoverEyebrow: marker },
    })
  );
  console.info('Admin role UPSERT: OK');

  const afterWrite = await withDatabaseRole('public', (db) =>
    db.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID, discoverEyebrow: marker } })
  );
  if (!afterWrite) {
    throw new Error('Public role could not read the row written by admin.');
  }
  console.info('Public role read after write: OK');

  await withDatabaseRole('admin', (db) =>
    db.siteSettings.update({
      where: { id: SITE_SETTINGS_ID },
      data: { discoverEyebrow: null },
    })
  );
  console.info('Admin cleanup (discoverEyebrow -> null): OK');

  const payload = resolveSiteSettings(
    await withDatabaseRole('public', (db) =>
      db.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } })
    )
  );
  const adminValues = await withDatabaseRole('admin', (db) =>
    db.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } })
  );
  const fallback = resolveSiteSettings(null);

  console.info('resolveSiteSettings(DB row):', {
    primaryEmail: payload.primaryEmail,
    primaryPhoneHref: payload.primaryPhoneHref,
    whatsappHref: payload.whatsappHref,
    instagramUrl: payload.instagramUrl.slice(0, 40) + '...',
  });
  console.info('Admin row after cleanup:', adminValues ? 'exists' : 'missing');
  console.info('resolveSiteSettings(null) fallback email:', fallback.primaryEmail);

  const agentCount = await withDatabaseRole('public', (db) => db.agent.count());
  console.info('Agent table (public SELECT):', agentCount, 'rows');

  console.info('--- All checks passed ---');
}

main()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exitCode = 1;
  });
