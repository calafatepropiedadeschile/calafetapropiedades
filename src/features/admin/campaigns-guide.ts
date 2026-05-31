import { primaryContact } from '@/config/contact';
import { siteUrl } from '@/config/seo-pages';
import { withDatabaseRole } from '@/lib/db/rls';
import { getSiteSeoSettings } from '@/features/site-content/seo-settings';

export type ChecklistStatus = 'ok' | 'warning' | 'pending';

export interface CampaignChecklistItem {
  id: string;
  label: string;
  description: string;
  status: ChecklistStatus;
  href?: string;
}

export type CampaignLandingKind = 'proyecto' | 'propiedad';

export interface CampaignPropertyLink {
  id: string;
  titleEs: string;
  slug: string;
  type: 'terreno' | 'casa';
  published: boolean;
  featured: boolean;
  landingKind: CampaignLandingKind;
  landingLabel: string;
  subtypeLabel: string;
  campaignUrl: string;
}

export interface CampaignLeadSummary {
  id: string;
  name: string;
  utmCampaign: string | null;
  utmSource: string | null;
  createdAt: Date;
  propertyTitle: string | null;
}

export interface CampaignsGuideData {
  siteUrl: string;
  whatsappDisplay: string;
  generatedAt: Date;
  checklist: CampaignChecklistItem[];
  projectLinks: CampaignPropertyLink[];
  listingLinks: CampaignPropertyLink[];
  recentCampaignLeads: CampaignLeadSummary[];
  stats: {
    publishedProperties: number;
    publishedProjects: number;
    publishedListings: number;
    publishedRentals: number;
    leadsLast30Days: number;
    leadsWithCampaignLast30Days: number;
    pendingLeads: number;
  };
  rentalLinks: CampaignPropertyLink[];
  integrations: {
    googleAnalytics: boolean;
    metaPixel: boolean;
    metaConversionsApi: boolean;
    smtpNotifications: boolean;
  };
  utmTemplateProject: string;
  utmTemplateProperty: string;
}

function buildCampaignUrl(
  landing: CampaignLandingKind,
  slug: string,
  campaignSlug: string,
  baseUrl = siteUrl,
) {
  const params = new URLSearchParams({
    utm_source: 'meta',
    utm_medium: 'paid',
    utm_campaign: campaignSlug,
  });

  const path = landing === 'proyecto' ? 'proyectos' : 'propiedades';
  return `${baseUrl}/${path}/${slug}?${params.toString()}`;
}

function toCampaignSlug(slug: string) {
  return slug.replace(/-/g, '_').slice(0, 40);
}

function isLandProject(property: { type: string; totalLots: number | null; priceType?: string | null }) {
  return property.type === 'terreno'
    && (property.totalLots ?? 0) > 1
    && property.priceType !== 'arriendo';
}

function mapPropertyToCampaignLink(property: {
  id: string;
  titleEs: string;
  slug: string;
  type: string;
  published: boolean;
  featured: boolean;
  totalLots: number | null;
  priceType?: string | null;
}, baseUrl = siteUrl): CampaignPropertyLink {
  const isProject = isLandProject(property);
  const landingKind: CampaignLandingKind = isProject ? 'proyecto' : 'propiedad';
  const campaignSlug = toCampaignSlug(property.slug);

  let subtypeLabel = 'Casa';
  if (property.type === 'terreno') {
    subtypeLabel = isProject
      ? `Loteo (${property.totalLots} lotes)`
      : 'Terreno individual';
  }
  if (property.priceType === 'arriendo') {
    subtypeLabel = `${subtypeLabel} · Arriendo`;
  }

  return {
    id: property.id,
    titleEs: property.titleEs,
    slug: property.slug,
    type: property.type === 'casa' ? 'casa' : 'terreno',
    published: property.published,
    featured: property.featured,
    landingKind,
    landingLabel: landingKind === 'proyecto' ? '/proyectos' : '/propiedades',
    subtypeLabel,
    campaignUrl: buildCampaignUrl(landingKind, property.slug, campaignSlug, baseUrl),
  };
}

function getSmtpConfigured() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const recipients = process.env.LEAD_NOTIFICATION_TO?.split(',').map((e) => e.trim()).filter(Boolean);

  return Boolean(host && user && password && recipients?.length);
}

export async function getCampaignsGuideData(): Promise<CampaignsGuideData> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const seoSettings = await getSiteSeoSettings().catch(() => null);
  const campaignSiteUrl = seoSettings?.canonicalBaseUrl ?? siteUrl;

  const [
    publishedProperties,
    publishedProjects,
    publishedListings,
    publishedRentals,
    leadsLast30Days,
    leadsWithCampaignLast30Days,
    pendingLeads,
    properties,
    recentCampaignLeads,
  ] = await withDatabaseRole('admin', async (db) => (
    Promise.all([
      db.property.count({ where: { published: true } }),
      db.property.count({
        where: {
          published: true,
          type: 'terreno',
          totalLots: { gt: 1 },
        },
      }),
      db.property.count({
        where: {
          published: true,
          OR: [
            { type: 'casa' },
            { type: 'terreno', OR: [{ totalLots: null }, { totalLots: { lte: 1 } }] },
          ],
        },
      }),
      db.property.count({
        where: { published: true, priceType: 'arriendo' },
      }),
      db.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.lead.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          utmCampaign: { not: null },
        },
      }),
      db.lead.count({ where: { status: 'pendiente' } }),
      db.property.findMany({
        where: { type: { in: ['terreno', 'casa'] } },
        orderBy: [{ published: 'desc' }, { type: 'asc' }, { titleEs: 'asc' }],
        select: {
          id: true,
          titleEs: true,
          slug: true,
          type: true,
          published: true,
          featured: true,
          totalLots: true,
          priceType: true,
        },
      }),
      db.lead.findMany({
        where: { utmCampaign: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          name: true,
          utmCampaign: true,
          utmSource: true,
          createdAt: true,
          property: { select: { titleEs: true } },
        },
      }),
    ])
  ));

  const integrations = {
    googleAnalytics: Boolean(seoSettings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID?.trim()),
    metaPixel: Boolean(seoSettings?.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()),
    metaConversionsApi: Boolean(process.env.META_CAPI_ACCESS_TOKEN?.trim()),
    smtpNotifications: getSmtpConfigured(),
  };

  const allLinks = properties.map((property) => mapPropertyToCampaignLink(property, campaignSiteUrl));
  const projectLinks = allLinks.filter((link) => link.landingKind === 'proyecto');
  const listingLinks = allLinks.filter((link) => link.landingKind === 'propiedad');
  const rentalLinks = listingLinks.filter((link) =>
    properties.find((p) => p.id === link.id)?.priceType === 'arriendo',
  );

  const publishedProjectLinks = projectLinks.filter((link) => link.published);
  const publishedListingLinks = listingLinks.filter((link) => link.published);
  const publishedRentalLinks = rentalLinks.filter((link) => link.published);
  const hasAnyPublishedForAds = publishedProjectLinks.length + publishedListingLinks.length > 0;

  const checklist: CampaignChecklistItem[] = [
    {
      id: 'published-ads',
      label: 'Propiedades publicadas para anuncios',
      description: hasAnyPublishedForAds
        ? `${publishedProjectLinks.length} proyecto(s) en /proyectos y ${publishedListingLinks.length} ficha(s) en /propiedades listas para campanas.`
        : 'Publica al menos una propiedad (proyecto, terreno o casa) antes de invertir en publicidad.',
      status: hasAnyPublishedForAds ? 'ok' : 'warning',
      href: '/admin/propiedades?published=publicadas',
    },
    {
      id: 'published-projects',
      label: 'Proyectos de parcelas (loteos)',
      description: publishedProjectLinks.length > 0
        ? `${publishedProjectLinks.length} proyecto(s) con landing /proyectos/slug.`
        : 'Los loteos usan tipo terreno y total de lotes mayor a 1.',
      status: publishedProjectLinks.length > 0 ? 'ok' : 'pending',
      href: '/admin/propiedades?published=publicadas&type=terreno&project=proyectos',
    },
    {
      id: 'published-listings',
      label: 'Terrenos y casas individuales',
      description: publishedListingLinks.length > 0
        ? `${publishedListingLinks.length} ficha(s) con landing /propiedades/slug.`
        : 'Casas y terrenos sueltos aparecen aqui al publicarlos.',
      status: publishedListingLinks.length > 0 ? 'ok' : 'pending',
      href: '/admin/propiedades?published=publicadas',
    },
    {
      id: 'published-rentals',
      label: 'Arriendos publicados',
      description: publishedRentalLinks.length > 0
        ? `${publishedRentalLinks.length} arriendo(s) visibles en /arriendos y en fichas /propiedades/slug.`
        : 'Crea una propiedad con operación Arriendo y publícala para activar el catálogo de arriendos.',
      status: publishedRentalLinks.length > 0 ? 'ok' : 'pending',
      href: '/admin/propiedades?published=publicadas&operation=arriendo',
    },
    {
      id: 'forms',
      label: 'Formulario de consulta y WhatsApp activos',
      description: `Cada landing incluye formulario por email y WhatsApp ${primaryContact.displayPhone}.`,
      status: 'ok',
    },
    {
      id: 'attribution',
      label: 'Seguimiento UTM en consultas',
      description: 'Las consultas del sitio guardan campana, origen y pagina de entrada (ultimos 30 dias en sesion).',
      status: 'ok',
      href: '/admin/leads',
    },
    {
      id: 'thank-you',
      label: 'Pagina de confirmacion /gracias',
      description: 'Tras enviar el formulario, el visitante llega a /gracias para medir conversiones.',
      status: 'ok',
    },
    {
      id: 'ga',
      label: 'Google Analytics (GA4)',
      description: integrations.googleAnalytics
        ? 'Variable NEXT_PUBLIC_GA_ID configurada. Eventos: generate_lead, whatsapp_click.'
        : 'Falta NEXT_PUBLIC_GA_ID en el servidor. Agregala en Vercel para medir resultados.',
      status: integrations.googleAnalytics ? 'ok' : 'warning',
    },
    {
      id: 'meta',
      label: 'Meta Pixel (Facebook / Instagram)',
      description: integrations.metaPixel
        ? 'Pixel activo (panel SEO o NEXT_PUBLIC_META_PIXEL_ID). Eventos: PageView, ViewContent, Lead/Contact en /gracias.'
        : 'Recomendado para campanas en Meta. Configura el Pixel en SEO avanzado o NEXT_PUBLIC_META_PIXEL_ID en Vercel.',
      status: integrations.metaPixel ? 'ok' : 'pending',
      href: '/admin/seo',
    },
    {
      id: 'meta-capi',
      label: 'Meta Conversions API (servidor)',
      description: integrations.metaConversionsApi
        ? 'META_CAPI_ACCESS_TOKEN configurado: cada consulta envia Lead/Contact duplicado con deduplicacion (event_id).'
        : 'Opcional pero recomendado. Agrega META_CAPI_ACCESS_TOKEN en Vercel (Events Manager > Conversions API).',
      status: integrations.metaConversionsApi ? 'ok' : integrations.metaPixel ? 'warning' : 'pending',
    },
    {
      id: 'smtp',
      label: 'Aviso por email al recibir consulta',
      description: integrations.smtpNotifications
        ? 'SMTP configurado: recibiras un correo cuando llegue una consulta.'
        : 'Configura SMTP_* y LEAD_NOTIFICATION_TO para alertas por email.',
      status: integrations.smtpNotifications ? 'ok' : 'pending',
    },
    {
      id: 'pending-leads',
      label: 'Consultas pendientes de respuesta',
      description: pendingLeads > 0
        ? `Hay ${pendingLeads} consulta(s) pendiente(s). Responde rapido para no perder inversion publicitaria.`
        : 'No hay consultas pendientes. Buen momento para lanzar campanas.',
      status: pendingLeads > 5 ? 'warning' : 'ok',
      href: '/admin/leads?status=pendiente',
    },
  ];

  const exampleProjectSlug = publishedProjectLinks[0]?.slug ?? projectLinks[0]?.slug ?? 'portal-los-muermos';
  const examplePropertySlug = publishedListingLinks[0]?.slug ?? listingLinks[0]?.slug ?? exampleProjectSlug;

  return {
    siteUrl: campaignSiteUrl,
    whatsappDisplay: primaryContact.displayPhone,
    generatedAt: new Date(),
    checklist,
    projectLinks,
    listingLinks,
    recentCampaignLeads: recentCampaignLeads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      utmCampaign: lead.utmCampaign,
      utmSource: lead.utmSource,
      createdAt: lead.createdAt,
      propertyTitle: lead.property?.titleEs ?? null,
    })),
    rentalLinks,
    stats: {
      publishedProperties,
      publishedProjects,
      publishedListings,
      publishedRentals,
      leadsLast30Days,
      leadsWithCampaignLast30Days,
      pendingLeads,
    },
    integrations,
    utmTemplateProject: buildCampaignUrl('proyecto', exampleProjectSlug, 'nombre_de_tu_campana', campaignSiteUrl),
    utmTemplateProperty: buildCampaignUrl('propiedad', examplePropertySlug, 'nombre_de_tu_campana', campaignSiteUrl),
  };
}
