const DEFAULT_STORAGE_BUCKET = 'inmobiliaria-images';

function encodeStoragePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export function getSupabasePublicImageUrl(path: string): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET;

  if (!supabaseUrl) return null;

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeStoragePath(path)}`;
}

export function getSiteImageUrl(path: string, fallback: string) {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE_SITE_IMAGES !== 'true') {
    return fallback;
  }

  return getSupabasePublicImageUrl(path) ?? fallback;
}
