import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { enforceRateLimit, RATE_LIMITS } from '@/server/security/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 30;

const DEFAULT_STORAGE_BUCKET = 'inmobiliaria-images';
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function getStorageConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET
    ?? process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET
    ?? DEFAULT_STORAGE_BUCKET;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para subir imagenes.');
  }

  return { supabaseUrl, serviceRoleKey, bucket };
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90) || 'image.webp';
}

function encodeStoragePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function buildStoragePath(file: File) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const random = crypto.randomUUID();
  const fileName = sanitizeFileName(file.name);

  return `properties/${year}/${month}/${Date.now()}-${random}-${fileName}`;
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

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const limited = enforceRateLimit(request, {
    keyPrefix: 'admin:upload-image',
    identifier: session.user.id || session.user.email,
    ...RATE_LIMITS.uploads,
    message: 'Demasiadas subidas de imagenes. Espera unos minutos y vuelve a intentar.',
  });

  if (limited) return limited;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: 'La imagen debe pesar menos de 10MB' }, { status: 400 });
    }

    const { supabaseUrl, serviceRoleKey, bucket } = getStorageConfig();
    const storagePath = buildStoragePath(file);
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${encodeStoragePath(storagePath)}`;
    const body = Buffer.from(await file.arrayBuffer());

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Cache-Control': '31536000',
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'false',
      },
      body,
    });

    if (!response.ok) {
      const message = await readSupabaseError(response);
      return NextResponse.json({ error: message || 'Supabase rechazo la imagen' }, { status: response.status });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeStoragePath(storagePath)}`;

    return NextResponse.json({
      bucket,
      path: storagePath,
      url: publicUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo subir la imagen.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
