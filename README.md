# Calafate Propiedades

Plataforma inmobiliaria Full-Stack v1 en Next.js 16 App Router + Prisma v7, preparada para Vercel Serverless con enfoque Lean MVP para micro-inventarios.

## Desarrollo

```bash
npm ci
cp .env.example .env.local
npm run db:generate
npm run dev
```

`DATABASE_URL` debe apuntar a Postgres serverless. Para Supabase usa la URL del Transaction Pooler en runtime y `DIRECT_URL` para migraciones de Prisma. Ver [docs/supabase.md](docs/supabase.md).

## Scripts

```bash
npm run dev                # servidor local
npm run lint               # lint
npm run build              # prisma generate + next build
npm run ci:verify          # lint + build
npm run db:generate        # genera Prisma Client
npm run db:validate        # valida schema Prisma/env
npm run db:migrate         # migraciones en desarrollo
npm run db:migrate:deploy  # migraciones en produccion/CI
npm run db:push            # sincronizacion directa sin migracion, solo prototipos
npm run db:seed            # seed inicial
```

## Vercel

Configurar en Vercel Project Settings:

- Framework Preset: Next.js
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: default

Variables requeridas:

- `DATABASE_URL`: URL pooled de Supabase Transaction Pooler para runtime.
- `DIRECT_URL`: URL directa o Session Pooler de Supabase para migraciones.
- `DATABASE_POOL_MAX`: `3` para v1.
- `DATABASE_IDLE_TIMEOUT_MS`: `10000`.
- `DATABASE_CONNECTION_TIMEOUT_MS`: `5000`.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase, reservada para futuras integraciones.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key de Supabase, reservada para futuras integraciones.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: cloud name para subidas directas de imagenes desde navegador.
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: preset unsigned de Cloudinary para fotografias de propiedades.
- `AUTH_SECRET`: secreto fuerte para Auth.js.
- `AUTH_URL`: URL canonica de produccion, por ejemplo `https://tu-dominio.vercel.app`.
- `AUTH_TRUST_HOST`: `true`.
- `APP_ORIGIN`: misma URL canonica de produccion.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD`: credenciales de seed/admin.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`: credenciales SMTP del correo corporativo para notificar leads.
- `LEAD_NOTIFICATION_FROM`: remitente visible, por ejemplo `Calafate Propiedades <contacto@calafatepropiedades.com>`.
- `LEAD_NOTIFICATION_TO`: destinatarios separados por coma, por ejemplo `contacto@calafatepropiedades.com`.

Flujo recomendado:

```bash
vercel link --yes
vercel env pull .env.local --yes
npm run db:migrate:deploy
npm run build
```

Para GitHub, conectar el repositorio desde Vercel. Cada push crea Preview Deployment y `main` publica Production si esta configurado como rama productiva.

## Render publico

- `/` usa ISR con `revalidate = 300`.
- `/propiedades` usa SSG/ISR con `revalidate = 3600` y filtra en cliente sobre un catalogo cacheado.
- `/propiedades/[slug]` genera parametros estaticos desde el catalogo cacheado y revalida cada hora.

Las mutaciones admin revalidan `properties`, `/` y `/propiedades` solo despues de escribir en la base de datos.
