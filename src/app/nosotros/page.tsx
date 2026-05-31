import type { Metadata } from 'next';
import { auth } from '@/lib/auth/auth';
import NosotrosView from './NosotrosView';
import { getPublishedStaticPageBySlug, getStaticPageBySlugForAdmin } from '@/features/site-content/static-page';
import { siteConfig } from '@/config/site';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';

async function resolveNosotrosCms(locale: 'es' | 'en', isAdmin: boolean) {
  const published = await getPublishedStaticPageBySlug('nosotros', locale);
  if (published) return published;
  if (!isAdmin) return null;
  return getStaticPageBySlugForAdmin('nosotros', locale);
}

export async function generateMetadata(): Promise<Metadata> {
  const [cms, siteSeo] = await Promise.all([
    getPublishedStaticPageBySlug('nosotros', 'es').catch(() => null),
    getSiteSeoSettings().catch(() => null),
  ]);
  const baseUrl = siteSeo?.canonicalBaseUrl ?? 'https://calafatepropiedades.vercel.app';
  const title = cms?.seoTitle || `Nosotros - ${siteConfig.name}`;
  const description = cms?.seoDescription || `Conoce a ${siteConfig.name}, nuestra forma de trabajo y el equipo que te acompaña en cada operación.`;
  const canonical = cms?.customCanonical || `${baseUrl}/nosotros`;
  const image = cms?.ogImage || siteSeo?.defaultOgImage || undefined;

  return {
    title,
    description,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : undefined,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function NosotrosPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';
  const [cmsEs, cmsEn] = await Promise.all([
    resolveNosotrosCms('es', isAdmin),
    resolveNosotrosCms('en', isAdmin),
  ]);

  return <NosotrosView cmsByLocale={{ es: cmsEs, en: cmsEn }} />;
}
