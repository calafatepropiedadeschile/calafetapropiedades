# Supabase setup

This project is ready to use Supabase Postgres through Prisma.

## 1. Create the Supabase project

Create a Supabase project and copy:

- Project URL: `https://PROJECT_REF.supabase.co`
- Anon public key
- Database password
- Postgres connection strings

## 2. Environment variables

Use two database URLs:

- `DATABASE_URL`: runtime URL for Next.js/Vercel functions. Use Supabase Transaction Pooler.
- `DIRECT_URL`: migration URL for Prisma CLI. Use Supabase Direct connection or Session Pooler.

Recommended local file:

```bash
cp .env.supabase.example .env.local
```

Then replace placeholders:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
DATABASE_POOL_MAX="3"
DATABASE_IDLE_TIMEOUT_MS="10000"
DATABASE_CONNECTION_TIMEOUT_MS="5000"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_STORAGE_BUCKET="inmobiliaria-images"
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET="inmobiliaria-images"
NEXT_PUBLIC_USE_SUPABASE_SITE_IMAGES="false"
```

If the password contains reserved URL characters, URL-encode it before pasting it in the connection string.

## 3. Prisma flow

Generate the client:

```bash
npm run db:generate
```

Validate schema and environment:

```bash
npm run db:validate
```

Apply migrations locally or during setup:

```bash
npm run db:migrate
```

Apply migrations in Vercel/CI:

```bash
npm run db:migrate:deploy
```

Seed the first admin/property data when needed:

```bash
npm run db:seed
```

## 4. Vercel variables

Add these to Vercel Project Settings:

- `DATABASE_URL`
- `DIRECT_URL`
- `DATABASE_POOL_MAX`
- `DATABASE_IDLE_TIMEOUT_MS`
- `DATABASE_CONNECTION_TIMEOUT_MS`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_USE_SUPABASE_SITE_IMAGES`
- `AUTH_SECRET`
- `AUTH_URL`
- `AUTH_TRUST_HOST`
- `APP_ORIGIN`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Keep `DATABASE_POOL_MAX` low for v1. Supabase already pools connections, and Vercel can create several function instances.

## 5. Storage setup

Create a public Supabase Storage bucket named `inmobiliaria-images`.

Recommended bucket settings:

- Public bucket: enabled
- File size limit: `10MB`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

Property images uploaded from the admin panel are stored under:

```text
properties/YYYY/MM/file.webp
```

The upload endpoint is:

```text
POST /api/admin/upload-image
```

It requires an authenticated admin session and uses `SUPABASE_SERVICE_ROLE_KEY` on the server. Do not expose this key in browser/client variables.

Optional site images can be stored under:

```text
site/home-hero.webp
site/chip-new.webp
site/chip-houses.webp
site/chip-apartments.webp
site/chip-lots.webp
site/property-fallback.webp
site/property-search-fallback.webp
site/property-detail-fallback.webp
```

After uploading those files, set:

```env
NEXT_PUBLIC_USE_SUPABASE_SITE_IMAGES="true"
```

If that flag is not enabled, the web keeps using the current Unsplash fallback images.

## 6. Current integration scope

Implemented now:

- Supabase Postgres readiness through Prisma.
- Runtime/migration URL separation.
- Serverless-safe pool sizing.
- Environment templates for local and Vercel.
- Supabase Storage uploads for admin property photos.
- Optional Supabase Storage URLs for site-wide static images.

Not implemented yet:

- Supabase Auth. The app currently uses Auth.js credentials.
- Row Level Security policies. Prisma connects from the server, so API/admin authorization remains in the app layer for v1.
