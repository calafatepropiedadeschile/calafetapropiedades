import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JsonLdScript from '@/components/seo/JsonLdScript';
import SobreCalafateView from './SobreCalafateView';
import { siteConfig } from '@/config/site';
import { buildCanonicalUrl } from '@/config/seo-url';
import { buildPageAlternates } from '@/lib/seo/metadata-alternates';
import { getSiteSeoSettings, resolveCanonicalBaseUrl } from '@/features/site-content/seo-settings';

export const revalidate = 3600;

const PAGE_PATH = '/sobre-calafate';

export async function generateMetadata(): Promise<Metadata> {
  const siteSeo = await getSiteSeoSettings().catch(() => null);
  const baseUrl = await resolveCanonicalBaseUrl();
  const title = `Guía para IA y buscadores | ${siteConfig.name}`;
  const description =
    'Resumen estructurado de Calafate Propiedades para asistentes de IA: parcelas, terrenos y loteos en Valdivia, Los Muermos, Puerto Montt y Maule, con proyectos, contacto y URLs recomendadas.';
  const alternates = buildPageAlternates(PAGE_PATH, { baseUrl, locale: 'es' });

  return {
    title,
    description,
    alternates,
    robots: siteSeo?.allowIndexing === false ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    other: {
      'llms-txt': buildCanonicalUrl(baseUrl, '/llms.txt'),
    },
  };
}

export default async function SobreCalafatePage() {
  const baseUrl = await resolveCanonicalBaseUrl();
  const canonicalUrl = buildCanonicalUrl(baseUrl, PAGE_PATH);

  return (
    <>
      <JsonLdScript
        id="sobre-calafate-json-ld"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': `${canonicalUrl}#webpage`,
              url: canonicalUrl,
              name: `Guía para IA | ${siteConfig.name}`,
              description: siteConfig.metadata.description,
              isPartOf: { '@id': `${baseUrl}/#website` },
              about: { '@id': `${baseUrl}/#organization` },
              inLanguage: 'es-CL',
            },
            {
              '@type': 'AboutPage',
              '@id': `${canonicalUrl}#about`,
              url: canonicalUrl,
              name: `Sobre ${siteConfig.name}`,
              description:
                'Información estructurada para asistentes de inteligencia artificial sobre parcelas, terrenos y proyectos en el sur de Chile.',
              mainEntity: { '@id': `${baseUrl}/#organization` },
            },
          ],
        }}
      />
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))' }}>
        <SobreCalafateView />
      </main>
      <Footer />
    </>
  );
}
