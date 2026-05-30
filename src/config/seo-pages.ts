import type { PropertyFilters } from '@/types/property';
import { buildMailto, siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n/config';
import { seoLandingPagesEn } from '@/config/seo-pages-en';

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL
  || process.env.APP_ORIGIN
  || 'https://calafetapropiedades.vercel.app'
).replace(/\/$/, '');

export type SeoLandingKey = 'comprar' | 'arriendos' | 'proyectos' | 'terrenos' | 'vender' | 'topografia';

export interface SeoLandingPageConfig {
  path: `/${SeoLandingKey}`;
  title: string;
  eyebrow: string;
  description: string;
  metadataTitle: string;
  metadataDescription: string;
  /** Si es false, la landing no muestra catálogo filtrable. */
  showCatalog?: boolean;
  filters: Partial<PropertyFilters>;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  highlights: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const seoLandingPages: Record<SeoLandingKey, SeoLandingPageConfig> = {
  comprar: {
    path: '/comprar',
    eyebrow: 'Compra inmobiliaria',
    title: 'Comprar propiedades y parcelas en Chile',
    description: 'Encuentra terrenos, parcelas y oportunidades inmobiliarias seleccionadas por Calafate Propiedades, con información clara para comparar ubicación, precio y potencial de inversión.',
    metadataTitle: 'Comprar propiedades en Chile | Calafate Propiedades',
    metadataDescription: 'Propiedades, terrenos y parcelas en venta en Chile. Revisa proyectos seleccionados con precio, ubicación e información comercial clara.',
    filters: { priceType: 'venta' },
    primaryCta: { label: 'Ver propiedades', href: '/propiedades?priceType=venta' },
    secondaryCta: { label: 'Ver proyectos', href: '/proyectos' },
    highlights: [
      'Propiedades publicadas con fotografías y datos revisados.',
      'Filtros por ciudad, zona, tipo de propiedad y presupuesto.',
      'Acompañamiento comercial para resolver dudas antes de visitar o reservar.',
    ],
    faqs: [
      {
        question: '¿Qué tipo de propiedades puedo comprar?',
        answer: 'Actualmente el foco principal está en terrenos, parcelas y proyectos inmobiliarios en el sur y centro de Chile.',
      },
      {
        question: 'Puedo consultar por una propiedad antes de reservar?',
        answer: 'Sí. Cada ficha permite enviar una consulta para recibir información comercial y resolver dudas sobre disponibilidad, forma de pago o ubicación.',
      },
    ],
  },
  arriendos: {
    path: '/arriendos',
    eyebrow: 'Arriendos',
    title: 'Propiedades en arriendo',
    description: 'Consulta arriendos en el sur de Chile. Si no hay fichas publicadas por ahora, déjanos tu mensaje y te avisamos cuando haya opciones disponibles.',
    metadataTitle: 'Arriendos | Calafate Propiedades',
    metadataDescription: 'Propiedades en arriendo gestionadas por Calafate Propiedades. Consulta disponibilidad, condiciones y ubicaciones.',
    filters: { priceType: 'arriendo' },
    primaryCta: { label: 'Ver arriendos', href: '/arriendos' },
    secondaryCta: { label: 'Hablar con un asesor', href: '/contacto' },
    highlights: [
      'Cartera visible en el sitio cuando hay propiedades publicadas.',
      'Si no hay stock web, igual puedes consultar por disponibilidad.',
      'Asesoría directa por formulario o WhatsApp.',
    ],
    faqs: [
      {
        question: '¿Por qué no veo propiedades en arriendo?',
        answer: 'Significa que aún no hay fichas publicadas en el sitio. Puedes contactarnos y te informamos de opciones vigentes o cuando se publique una nueva.',
      },
      {
        question: '¿Cómo aparecen nuevos arriendos en la web?',
        answer: 'Cuando el equipo publica una propiedad con operación Arriendo en el panel de administración, se muestra automáticamente en esta página.',
      },
      {
        question: '¿Cómo consulto por un arriendo?',
        answer: 'Desde la ficha de cada propiedad o escribiendo al equipo comercial desde la página de contacto.',
      },
    ],
  },
  proyectos: {
    path: '/proyectos',
    eyebrow: 'Proyectos inmobiliarios',
    title: 'Proyectos de parcelas y terrenos en Chile',
    description: 'Explora proyectos seleccionados de parcelas y terrenos, con ubicación, superficie, imágenes, precio y condiciones comerciales pensadas para comparar antes de invertir.',
    metadataTitle: 'Proyectos de parcelas en Chile | Calafate Propiedades',
    metadataDescription: 'Proyectos inmobiliarios de parcelas y terrenos en Chile. Explora opciones en Los Lagos, Los Ríos y Maule.',
    filters: { type: 'terreno', priceType: 'venta' },
    primaryCta: { label: 'Ver proyectos', href: '/proyectos' },
    secondaryCta: { label: 'Ver terrenos', href: '/terrenos' },
    highlights: [
      'Alta plusvalía garantizada en las mejores zonas del sur.',
      'Información detallada de ubicación, precio desde y superficie.',
      'Asesoría directa y visitas a terreno con nuestros agentes.',
    ],
    faqs: [
      {
        question: '¿Qué diferencia hay entre proyecto y terreno?',
        answer: 'Un proyecto agrupa una oferta inmobiliaria con varias unidades o parcelas; un terreno puede ser una unidad individual o parte de un proyecto.',
      },
      {
        question: 'Puedo pedir información de disponibilidad por parcela?',
        answer: 'Sí. El equipo comercial puede indicar disponibilidad, valores vigentes y alternativas de pago.',
      },
    ],
  },
  terrenos: {
    path: '/terrenos',
    eyebrow: 'Terrenos y parcelas',
    title: 'Terrenos y parcelas en venta',
    description: 'Encuentra terrenos y parcelas en venta con superficies, precios y ubicaciones claras para evaluar vivienda, segunda vivienda o inversión.',
    metadataTitle: 'Terrenos en venta en Chile | Calafate Propiedades',
    metadataDescription: 'Terrenos y parcelas en venta en Chile. Revisa proyectos con superficies de 5.000 m², ubicación y valores actualizados.',
    filters: { type: 'terreno', priceType: 'venta' },
    primaryCta: { label: 'Ver terrenos', href: '/propiedades?type=terreno&priceType=venta' },
    secondaryCta: { label: 'Ver proyectos', href: '/proyectos' },
    highlights: [
      'Terrenos con superficie, zona y precio visible.',
      'Opciones orientadas a vivienda, descanso o inversión.',
      'Consulta directa para confirmar condiciones y factibilidades.',
    ],
    faqs: [
      {
        question: 'Los terrenos tienen rol propio?',
        answer: 'La información se revisa por proyecto. Cuando corresponde, la ficha indica condiciones como rol propio, servicios y acceso.',
      },
      {
        question: 'Puedo comprar con facilidad de pago?',
        answer: 'Algunos proyectos tienen condiciones especiales o crédito directo. Conviene consultar cada caso con el equipo comercial.',
      },
    ],
  },
  vender: {
    path: '/vender',
    eyebrow: 'Venta de propiedades',
    title: 'Vender una propiedad con Calafate Propiedades',
    description: 'Recibe apoyo para presentar tu propiedad, ordenar su información, definir una estrategia comercial y conectarla con compradores calificados.',
    metadataTitle: 'Vender propiedad | Calafate Propiedades',
    metadataDescription: 'Servicio para vender propiedades, terrenos o parcelas con gestión comercial, publicación y seguimiento de consultas.',
    filters: { priceType: 'venta' },
    primaryCta: { label: 'Solicitar evaluación', href: buildMailto(siteConfig.contact.salesEmail, siteConfig.contact.sellSubject) },
    secondaryCta: { label: 'Ver propiedades publicadas', href: '/comprar' },
    highlights: [
      'Revisión de información comercial antes de publicar.',
      'Publicación con fotos, descripción y datos útiles para compradores.',
      'Gestión de consultas desde la web y canales comerciales.',
    ],
    faqs: [
      {
        question: '¿Qué necesito para vender mi propiedad?',
        answer: 'Lo ideal es contar con ubicación, antecedentes básicos, fotografías y condiciones comerciales. El equipo puede ayudarte a ordenar la publicación.',
      },
      {
        question: 'Puedo publicar un terreno o parcela?',
        answer: 'Sí. La web está preparada para propiedades urbanas, terrenos, parcelas y proyectos inmobiliarios.',
      },
    ],
  },
  topografia: {
    path: '/topografia',
    eyebrow: 'Servicios de topografía',
    title: 'Trabajos de topografía para terrenos y proyectos',
    description: 'Solicita apoyo para trabajos de topografía asociados a terrenos, parcelas y proyectos inmobiliarios que requieren información técnica confiable.',
    metadataTitle: 'Trabajos de topografía | Calafate Propiedades',
    metadataDescription: 'Servicios de topografía para terrenos, parcelas y proyectos inmobiliarios. Solicita información y coordinación comercial.',
    filters: { type: 'terreno', priceType: 'venta' },
    primaryCta: { label: 'Solicitar topografía', href: buildMailto(siteConfig.contact.salesEmail, 'Quiero solicitar trabajos de topografía') },
    secondaryCta: { label: 'Ver terrenos', href: '/terrenos' },
    highlights: [
      'Apoyo para terrenos, parcelas y proyectos.',
      'Información técnica orientada a decisiones inmobiliarias.',
      'Coordinación directa con el equipo de Calafate Propiedades.',
    ],
    faqs: [
      {
        question: '¿Para qué sirve un trabajo de topografía?',
        answer: 'Ayuda a conocer medidas, pendientes, límites y condiciones del terreno antes de comprar, vender o proyectar una construcción.',
      },
      {
        question: 'Puedo solicitar topografía para una parcela en venta?',
        answer: 'Sí. Puedes consultar por el servicio y el equipo revisará el alcance según ubicación y tipo de terreno.',
      },
    ],
  },
};

export function getSeoLandingPage(key: SeoLandingKey, locale: Locale = 'es'): SeoLandingPageConfig {
  const base = seoLandingPages[key];
  if (locale !== 'en') {
    return base;
  }

  const localized = seoLandingPagesEn[key];
  return {
    ...base,
    ...localized,
    path: base.path,
    filters: base.filters,
    showCatalog: base.showCatalog,
  };
}

export const projectLandingSlugs = [
  'praderas-del-maule',
  'portal-los-muermos',
  'vive-puquila',
  'altos-del-tepual',
  'parcelas-quillahua',
  'parcelas-putrautrao',
] as const;
