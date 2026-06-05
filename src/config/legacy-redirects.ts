import type { Redirect } from 'next/dist/lib/load-custom-routes';
import { projectLandingSlugs } from './project-landing-slugs';

/**
 * Redirecciones 301 del sitio WordPress/Houzez/Avada anterior.
 * Agregar entradas en MANUAL_LEGACY_REDIRECTS cuando encuentres URLs indexadas en Google.
 */

/** Rutas fijas del sitio anterior → equivalente en el proyecto nuevo. */
const STATIC_LEGACY_ROUTES: Record<string, string> = {
  '/properties': '/propiedades',
  '/property': '/propiedades',
  '/rent': '/arriendos',
  '/rentals': '/arriendos',
  '/buy': '/comprar',
  '/sell': '/vender',
  '/projects': '/proyectos',
  '/about': '/nosotros',
  '/about-us': '/nosotros',
  '/contact': '/contacto',
  '/contact-us': '/contacto',
  '/portfolio': '/proyectos',
  // Contenido demo de WordPress / Avada (sin valor SEO).
  '/pagina-ejemplo': '/',
  '/3': '/',
};

/**
 * Archivos de ciudad (`/property_city/:slug`) con destino distinto al catálogo por zona.
 * Si no aparece acá, cae en `/propiedades?zone=:slug`.
 */
const PROPERTY_CITY_DESTINATIONS: Record<string, string> = {
  valdivia: '/parcelas-en-valdivia',
  'valdivia-de-los-rios': '/parcelas-en-valdivia',
  'los-muermos': '/parcelas-en-los-muermos',
  'puerto-montt': '/parcelas-en-puerto-montt',
  maule: '/parcelas-en-maule',
  'san-rafael': '/parcelas-en-maule',
};

const PROPERTY_TYPE_DESTINATIONS: Record<string, string> = {
  terreno: '/propiedades?type=terreno',
  terrenos: '/propiedades?type=terreno',
  parcela: '/propiedades?type=terreno',
  parcelas: '/propiedades?type=terreno',
  land: '/propiedades?type=terreno',
  lot: '/propiedades?type=terreno',
  lots: '/propiedades?type=terreno',
  casa: '/propiedades?type=casa',
  casas: '/propiedades?type=casa',
  house: '/propiedades?type=casa',
  houses: '/propiedades?type=casa',
};

/** Redirecciones puntuales (URL exacta del sitio viejo → destino nuevo). */
export const MANUAL_LEGACY_REDIRECTS: Array<{ source: string; destination: string }> = [
  { source: '/2025/04/11/hola-mundo', destination: '/' },
  { source: '/portfolio/dubai-hotel', destination: '/proyectos' },
  { source: '/portfolio/london-velodrome', destination: '/proyectos' },
];

function permanent(source: string, destination: string): Redirect {
  return { source, destination, permanent: true };
}

function withOptionalTrailingSlash(redirect: Redirect): Redirect[] {
  const { source } = redirect;
  if (source.endsWith('/')) {
    return [redirect];
  }

  return [redirect, { ...redirect, source: `${source}/` }];
}

export function getLegacyRedirects(): Redirect[] {
  const redirects: Redirect[] = [];

  for (const { source, destination } of MANUAL_LEGACY_REDIRECTS) {
    redirects.push(...withOptionalTrailingSlash(permanent(source, destination)));
  }

  for (const [source, destination] of Object.entries(STATIC_LEGACY_ROUTES)) {
    redirects.push(...withOptionalTrailingSlash(permanent(source, destination)));
  }

  for (const [slug, destination] of Object.entries(PROPERTY_CITY_DESTINATIONS)) {
    redirects.push(...withOptionalTrailingSlash(permanent(`/property_city/${slug}`, destination)));
  }
  redirects.push(
    ...withOptionalTrailingSlash(permanent('/property_city/:slug', '/propiedades?zone=:slug')),
  );

  for (const [slug, destination] of Object.entries(PROPERTY_TYPE_DESTINATIONS)) {
    redirects.push(...withOptionalTrailingSlash(permanent(`/property_type/${slug}`, destination)));
    redirects.push(...withOptionalTrailingSlash(permanent(`/property-type/${slug}`, destination)));
  }

  for (const slug of projectLandingSlugs) {
    redirects.push(...withOptionalTrailingSlash(permanent(`/property/${slug}`, `/proyectos/${slug}`)));
  }
  redirects.push(...withOptionalTrailingSlash(permanent('/property/:slug', '/propiedades/:slug')));

  // Portfolio del tema Avada (demos de arquitectura, no proyectos reales).
  redirects.push(...withOptionalTrailingSlash(permanent('/portfolio/:slug', '/proyectos')));

  // Entradas de blog WordPress con permalink por fecha.
  redirects.push(
    ...withOptionalTrailingSlash(
      permanent('/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug', '/'),
    ),
  );

  // Permalinks antiguos de WordPress (?p=ID), sin mapeo de ID → slug.
  redirects.push({
    source: '/:path*',
    has: [{ type: 'query', key: 'p' }],
    destination: '/',
    permanent: true,
  });

  return redirects;
}
