import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';

loadEnvConfig(process.cwd());

const DEFAULT_STORAGE_BUCKET = 'inmobiliaria-images';
const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET
  ?? process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET
  ?? DEFAULT_STORAGE_BUCKET;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const storageServiceRoleKey = serviceRoleKey;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const publicDir = path.join(process.cwd(), 'public');
const uploadedUrls = new Map<string, string>();

function encodeStoragePath(storagePath: string) {
  return storagePath.split('/').map(encodeURIComponent).join('/');
}

function sanitizeSegment(segment: string) {
  return segment
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100) || 'asset';
}

function contentTypeFor(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.avif') return 'image/avif';

  return 'application/octet-stream';
}

function isSupabaseStorageUrl(url: string) {
  return url.startsWith(`${supabaseUrl}/storage/v1/object/public/${bucket}/`);
}

function localUrlToFilePath(url: string) {
  const cleanUrl = url.split('?')[0];

  if (!cleanUrl.startsWith('/')) return null;
  if (!cleanUrl.startsWith('/Propiedades/')) return null;

  const parts = cleanUrl
    .split('/')
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));

  return path.join(publicDir, ...parts);
}

function localUrlToStoragePath(url: string) {
  const parts = url
    .split('?')[0]
    .split('/')
    .filter(Boolean)
    .map((part) => sanitizeSegment(decodeURIComponent(part)));

  return ['properties', 'imported', ...parts].join('/');
}

function publicStorageUrl(storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeStoragePath(storagePath)}`;
}

async function readSupabaseError(response: Response) {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    return parsed.message ?? parsed.error ?? text;
  } catch {
    return text;
  }
}

async function uploadLocalImage(localUrl: string) {
  if (isSupabaseStorageUrl(localUrl)) return localUrl;

  const cached = uploadedUrls.get(localUrl);
  if (cached) return cached;

  const filePath = localUrlToFilePath(localUrl);

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`Local image not found for ${localUrl}`);
  }

  const storagePath = localUrlToStoragePath(localUrl);
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${encodeStoragePath(storagePath)}`;
  const body = fs.readFileSync(filePath);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${storageServiceRoleKey}`,
      apikey: storageServiceRoleKey,
      'Cache-Control': '31536000',
      'Content-Type': contentTypeFor(filePath),
      'x-upsert': 'true',
    },
    body,
  });

  if (!response.ok) {
    const message = await readSupabaseError(response);
    throw new Error(`Supabase rejected ${localUrl}: ${message}`);
  }

  const uploadedUrl = publicStorageUrl(storagePath);
  uploadedUrls.set(localUrl, uploadedUrl);
  return uploadedUrl;
}

async function main() {
  const properties = await prisma.property.findMany({
    where: {
      OR: [
        { coverImage: { startsWith: '/Propiedades/' } },
        { images: { contains: '/Propiedades/' } },
      ],
    },
    select: {
      id: true,
      slug: true,
      coverImage: true,
      images: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  let updated = 0;
  let uploaded = 0;

  for (const property of properties) {
    const images = JSON.parse(property.images || '[]') as string[];
    const migratedImages = [];

    for (const image of images) {
      const beforeUploadCount = uploadedUrls.size;
      const uploadedUrl = await uploadLocalImage(image);
      migratedImages.push(uploadedUrl);

      if (uploadedUrls.size > beforeUploadCount) {
        uploaded += 1;
      }
    }

    const migratedCoverImage = property.coverImage
      ? await uploadLocalImage(property.coverImage)
      : migratedImages[0] ?? null;

    await prisma.property.update({
      where: { id: property.id },
      data: {
        coverImage: migratedCoverImage,
        images: JSON.stringify(migratedImages),
      },
    });

    updated += 1;
    console.log(`Migrated ${property.slug}: ${migratedImages.length} images`);
  }

  console.log(`Uploaded ${uploaded} unique images to Supabase Storage.`);
  console.log(`Updated ${updated} properties with Supabase image URLs.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
