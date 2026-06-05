import { buildLlmsFullTxt } from '@/lib/seo/llms-content';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';

export const revalidate = 3600;

export async function GET() {
  const seo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = await resolveCanonicalBaseUrl();

  if (seo?.allowIndexing === false) {
    return new Response('Indexing disabled.\n', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(buildLlmsFullTxt(baseUrl), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
