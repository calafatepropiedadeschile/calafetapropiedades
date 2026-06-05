import type { PropertyFilters } from '@/types/property';
import { buildMailto, siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n/config';
import { seoLandingPagesEn } from '@/config/seo-pages-en';

import { getDefaultCanonicalBaseUrl } from '@/config/seo-url';
import {
  getLosMuermosRelatedPagesSection,
  LOS_MUERMOS_BREADCRUMB_PARENT,
} from '@/config/seo-los-muermos-cluster';
import {
  getMauleRelatedPagesSection,
  MAULE_BREADCRUMB_PARENT,
} from '@/config/seo-maule-cluster';
import {
  getPuertoMonttRelatedPagesSection,
  PUERTO_MONTT_BREADCRUMB_PARENT,
} from '@/config/seo-puerto-montt-cluster';
import {
  getValdiviaRelatedPagesSection,
  VALDIVIA_BREADCRUMB_PARENT,
} from '@/config/seo-valdivia-cluster';

export const siteUrl = getDefaultCanonicalBaseUrl();

export type SeoLandingKey =
  | 'comprar'
  | 'arriendos'
  | 'proyectos'
  | 'terrenos'
  | 'parcelas-en-valdivia'
  | 'terrenos-en-valdivia'
  | 'loteos-en-valdivia'
  | 'parcelas-baratas-valdivia'
  | 'parcelas-en-los-muermos'
  | 'terrenos-en-los-muermos'
  | 'parcelas-en-puerto-montt'
  | 'terrenos-en-puerto-montt'
  | 'parcelas-en-maule'
  | 'vender'
  | 'topografia';

export interface SeoLandingServiceSection {
  title: string;
  items: string[];
}

export type SeoInfoGridIcon =
  | 'map'
  | 'clipboard'
  | 'compass'
  | 'message'
  | 'camera'
  | 'file'
  | 'megaphone'
  | 'chart';

export interface SeoInfoGridStep {
  title: string;
  description: string;
  icon: SeoInfoGridIcon;
}

export interface SeoInfoGridConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  gridLabel: string;
  steps: SeoInfoGridStep[];
}

export interface SeoLandingAsideNote {
  kicker: string;
  text: string;
}

export interface SeoLandingPageConfig {
  path: `/${SeoLandingKey}`;
  title: string;
  eyebrow: string;
  description: string;
  metadataTitle: string;
  metadataDescription: string;
  /** catalog = listado; service = topografía; sell = captación de propietarios. */
  layout?: 'catalog' | 'service' | 'sell';
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
  highlightsTitle?: string;
  /** Grillas estilo home (Información útil antes de coordinar una visita). */
  infoGrids?: SeoInfoGridConfig[];
  asideNote?: SeoLandingAsideNote;
  contactSection?: {
    title: string;
    description: string;
    defaultMessage: string;
    formTitle: string;
    formDescription: string;
  };
  /** Bloques de servicio cuando showCatalog es false. */
  serviceSections?: SeoLandingServiceSection[];
  ctaBanner?: {
    eyebrow?: string;
    headline: string;
    sub?: string;
  };
  relatedCatalog?: {
    title: string;
    description: string;
    href: string;
    linkLabel: string;
  };
  relatedPages?: {
    title: string;
    links: Array<{ label: string; href: string; description?: string }>;
  };
  breadcrumbParent?: {
    label: string;
    href: string;
  };
  faqs: SeoLandingFaq[];
}

export interface SeoLandingFaq {
  question: string;
  answer: string;
  links?: Array<{ label: string; href: string }>;
}

export const seoLandingPages: Record<SeoLandingKey, SeoLandingPageConfig> = {
  comprar: {
    path: '/comprar',
    eyebrow: 'Compra inmobiliaria',
    title: 'Comprar parcelas, loteos y terrenos en el sur de Chile',
    description: 'Encuentra terrenos, parcelas y loteos seleccionados en el sur de Chile por Calafate Propiedades, con información clara para comparar ubicación, precio y potencial de inversión.',
    metadataTitle: 'Comprar parcelas, loteos y terrenos en el sur de Chile | Calafate Propiedades',
    metadataDescription: 'Parcelas, loteos y terrenos en venta en el sur de Chile. Revisa proyectos seleccionados con precio, ubicación e información comercial clara.',
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
    title: 'Proyectos de parcelas, loteos y terrenos en el sur de Chile',
    description: 'Explora proyectos seleccionados de parcelas, loteos y terrenos en el sur de Chile, con ubicación, superficie, imágenes, precio y condiciones comerciales pensadas para comparar antes de invertir.',
    metadataTitle: 'Proyectos de parcelas, loteos y terrenos en el sur de Chile | Calafate Propiedades',
    metadataDescription: 'Proyectos inmobiliarios de parcelas, loteos y terrenos en el sur de Chile. Explora opciones en Los Lagos, Los Ríos y Maule.',
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
      {
        question: '¿Hay loteos en Valdivia o Los Ríos?',
        answer: 'Sí. Vive Puquila es un loteo rural en Mariquina, cerca de Valdivia.',
        links: [
          { label: 'Loteos en Valdivia', href: '/loteos-en-valdivia' },
          { label: 'Vive Puquila', href: '/proyectos/vive-puquila' },
        ],
      },
      {
        question: '¿Tienen proyectos en Los Muermos?',
        answer: 'Sí. Gestionamos Portal Los Muermos, Parcelas Quillahua y Parcelas Putrautrao en la Región de Los Lagos.',
        links: [
          { label: 'Parcelas en Los Muermos', href: '/parcelas-en-los-muermos' },
          { label: 'Portal Los Muermos', href: '/proyectos/portal-los-muermos' },
        ],
      },
      {
        question: '¿Hay parcelas en Puerto Montt o en el Maule?',
        answer: 'Sí. Altos del Tepual en Puerto Montt y Praderas del Maule en San Rafael.',
        links: [
          { label: 'Parcelas en Puerto Montt', href: '/parcelas-en-puerto-montt' },
          { label: 'Parcelas en Maule', href: '/parcelas-en-maule' },
        ],
      },
    ],
  },
  terrenos: {
    path: '/terrenos',
    eyebrow: 'Terrenos y parcelas',
    title: 'Terrenos, loteos y parcelas en venta',
    description: 'Encuentra terrenos, loteos y parcelas en venta en el sur de Chile con superficies, precios y ubicaciones claras para evaluar vivienda, segunda vivienda o inversión.',
    metadataTitle: 'Terrenos, loteos y parcelas en venta en el sur de Chile | Calafate Propiedades',
    metadataDescription: 'Terrenos, loteos y parcelas en venta en el sur de Chile. Revisa proyectos con superficies de 5.000 m², ubicación y valores actualizados.',
    filters: { type: 'terreno', priceType: 'venta' },
    primaryCta: { label: 'Ver terrenos', href: '/propiedades?type=terreno&priceType=venta' },
    secondaryCta: { label: 'Ver proyectos', href: '/proyectos' },
    highlights: [
      'Terrenos con superficie, zona y precio visible.',
      'Opciones orientadas a vivienda, descanso o inversión.',
      'Proyectos en Valdivia y Los Ríos disponibles en la página de terrenos en Valdivia.',
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
      {
        question: '¿Hay terrenos en venta cerca de Valdivia?',
        answer: 'Sí. Revisa el proyecto Vive Puquila y el catálogo filtrado.',
        links: [
          { label: 'Terrenos en Valdivia', href: '/terrenos-en-valdivia' },
          { label: 'Vive Puquila', href: '/proyectos/vive-puquila' },
        ],
      },
    ],
  },
  'parcelas-en-valdivia': {
    path: '/parcelas-en-valdivia',
    eyebrow: 'Región de Los Ríos',
    title: 'Parcelas en Valdivia y Los Ríos',
    description:
      'Parcelas en venta cerca de Valdivia, con proyectos seleccionados en la Región de Los Ríos. Revisa superficies desde 5.000 m², ubicación, precios y condiciones comerciales antes de coordinar una visita.',
    metadataTitle: 'Parcelas en Valdivia | Los Ríos | Calafate Propiedades',
    metadataDescription:
      'Parcelas en venta cerca de Valdivia y en la Región de Los Ríos. Proyectos con rol propio, servicios y asesoría comercial de Calafate Propiedades.',
    filters: { type: 'terreno', priceType: 'venta', zone: 'valdivia' },
    breadcrumbParent: VALDIVIA_BREADCRUMB_PARENT,
    relatedPages: getValdiviaRelatedPagesSection('/parcelas-en-valdivia'),
    primaryCta: { label: 'Ver parcelas disponibles', href: '/parcelas-en-valdivia' },
    secondaryCta: { label: 'Proyecto Vive Puquila', href: '/proyectos/vive-puquila' },
    highlightsTitle: 'Por qué revisar parcelas cerca de Valdivia',
    highlights: [
      'Proyecto Vive Puquila en San José de la Mariquina, a minutos de Valdivia y Playa Mehuín.',
      'Parcelas de 5.000 m² con información de superficie, precio y servicios visibles en la ficha.',
      'Asesoría comercial para consultar disponibilidad, visitas a terreno y condiciones de pago.',
    ],
    faqs: [
      {
        question: '¿Hay parcelas en venta cerca de Valdivia?',
        answer:
          'Sí. Actualmente gestionamos el proyecto Vive Puquila en San José de la Mariquina, comuna cercana a Valdivia, con parcelas rurales de 5.000 m².',
      },
      {
        question: '¿Qué incluyen las parcelas en la Región de Los Ríos?',
        answer:
          'Depende del proyecto. En Vive Puquila las parcelas cuentan con rol propio, acceso, electricidad y agua potable. Revisa la ficha del proyecto para confirmar servicios y condiciones vigentes.',
      },
      {
        question: '¿Puedo visitar el terreno antes de comprar?',
        answer:
          'Sí. Puedes solicitar una visita o escribir al equipo comercial desde la ficha del proyecto o la página de contacto.',
      },
      {
        question: '¿Las parcelas tienen financiamiento?',
        answer:
          'Algunos proyectos ofrecen alternativas de pago o crédito directo. Consulta las condiciones vigentes con un asesor para el lote que te interese.',
      },
      {
        question: '¿Buscan terrenos en lugar de parcelas?',
        answer: 'También puedes revisar nuestra selección de terrenos en venta cerca de Valdivia.',
        links: [{ label: 'Terrenos en Valdivia', href: '/terrenos-en-valdivia' }],
      },
      {
        question: '¿Buscan loteos en Valdivia?',
        answer: 'Si te interesan proyectos de loteo en la zona, revisa el catálogo dedicado y el proyecto Vive Puquila.',
        links: [
          { label: 'Loteos en Valdivia', href: '/loteos-en-valdivia' },
          { label: 'Vive Puquila', href: '/proyectos/vive-puquila' },
        ],
      },
      {
        question: '¿Buscan parcelas baratas cerca de Valdivia?',
        answer: 'Revisa opciones económicas con precios publicados y alternativas de pago según disponibilidad.',
        links: [{ label: 'Parcelas baratas en Valdivia', href: '/parcelas-baratas-valdivia' }],
      },
    ],
  },
  'terrenos-en-valdivia': {
    path: '/terrenos-en-valdivia',
    eyebrow: 'Región de Los Ríos',
    title: 'Terrenos en Valdivia y Los Ríos',
    description:
      'Terrenos en venta cerca de Valdivia y en la Región de Los Ríos. Explora opciones con superficies desde 5.000 m², datos de ubicación, precios y condiciones comerciales para evaluar vivienda, inversión o proyecto propio.',
    metadataTitle: 'Terrenos en Valdivia | Terrenos en venta en Los Ríos | Calafate Propiedades',
    metadataDescription:
      'Terrenos en venta cerca de Valdivia y en la Región de Los Ríos. Proyecto Vive Puquila en Mariquina con rol propio, servicios y asesoría de Calafate Propiedades.',
    filters: { type: 'terreno', priceType: 'venta', zone: 'valdivia' },
    breadcrumbParent: VALDIVIA_BREADCRUMB_PARENT,
    relatedPages: getValdiviaRelatedPagesSection('/terrenos-en-valdivia'),
    primaryCta: { label: 'Ver terrenos disponibles', href: '/terrenos-en-valdivia' },
    secondaryCta: { label: 'Proyecto Vive Puquila', href: '/proyectos/vive-puquila' },
    highlightsTitle: 'Por qué revisar terrenos cerca de Valdivia',
    highlights: [
      'Terrenos y parcelas del proyecto Vive Puquila en San José de la Mariquina, cercano a Valdivia.',
      'Superficies de 5.000 m² con precio, ubicación y servicios publicados en cada ficha.',
      'Acompañamiento comercial para visitas a terreno, disponibilidad y alternativas de pago.',
    ],
    faqs: [
      {
        question: '¿Hay terrenos en venta cerca de Valdivia?',
        answer:
          'Sí. Gestionamos el proyecto Vive Puquila en San José de la Mariquina, a pocos minutos de Valdivia, con terrenos rurales de 5.000 m².',
      },
      {
        question: '¿Qué diferencia hay entre terreno y parcela en este contexto?',
        answer:
          'En la práctica, muchos compradores usan ambos términos para referirse a lotes en proyectos rurales. En nuestro catálogo, las unidades de Vive Puquila se publican como terrenos de 5.000 m² dentro de un loteo.',
      },
      {
        question: '¿Los terrenos tienen rol propio y servicios?',
        answer:
          'En Vive Puquila las unidades se comercializan con rol propio, acceso, electricidad y agua potable. Confirma el detalle vigente en la ficha del proyecto.',
      },
      {
        question: '¿Puedo coordinar una visita al terreno?',
        answer:
          'Sí. Desde la ficha de Vive Puquila o la página de contacto puedes solicitar una visita o resolver dudas con el equipo comercial.',
      },
      {
        question: '¿También buscan parcelas en la zona?',
        answer: 'Si prefieres revisar el catálogo con foco en parcelas cerca de Valdivia:',
        links: [{ label: 'Parcelas en Valdivia', href: '/parcelas-en-valdivia' }],
      },
      {
        question: '¿Hay loteos en venta cerca de Valdivia?',
        answer: 'Sí. Vive Puquila es un proyecto de loteo rural en Mariquina.',
        links: [
          { label: 'Loteos en Valdivia', href: '/loteos-en-valdivia' },
          { label: 'Vive Puquila', href: '/proyectos/vive-puquila' },
        ],
      },
    ],
  },
  'loteos-en-valdivia': {
    path: '/loteos-en-valdivia',
    eyebrow: 'Región de Los Ríos',
    title: 'Loteos en Valdivia y Los Ríos',
    description:
      'Loteos y proyectos de parcelas en venta cerca de Valdivia y en la Región de Los Ríos. Conoce alternativas con lotes desde 5.000 m², accesos, servicios y condiciones comerciales para vivienda o inversión.',
    metadataTitle: 'Loteos en Valdivia | Proyectos en Los Ríos | Calafate Propiedades',
    metadataDescription:
      'Loteos en venta cerca de Valdivia y en la Región de Los Ríos. Proyecto Vive Puquila en Mariquina con lotes de 5.000 m², rol propio y asesoría comercial.',
    filters: { type: 'terreno', priceType: 'venta', zone: 'valdivia' },
    breadcrumbParent: VALDIVIA_BREADCRUMB_PARENT,
    relatedPages: getValdiviaRelatedPagesSection('/loteos-en-valdivia'),
    primaryCta: { label: 'Ver loteos disponibles', href: '/loteos-en-valdivia' },
    secondaryCta: { label: 'Proyecto Vive Puquila', href: '/proyectos/vive-puquila' },
    highlightsTitle: 'Por qué revisar loteos cerca de Valdivia',
    highlights: [
      'Vive Puquila: loteo rural en San José de la Mariquina, comuna cercana a Valdivia y Playa Mehuín.',
      'Lotes de 5.000 m² con información de precio, superficie y servicios en la ficha del proyecto.',
      'Asesoría para consultar disponibilidad, visitas al loteo y condiciones de compra.',
    ],
    faqs: [
      {
        question: '¿Hay loteos en venta cerca de Valdivia?',
        answer:
          'Sí. El proyecto Vive Puquila en San José de la Mariquina ofrece lotes rurales de 5.000 m² en la Región de Los Ríos, a minutos de Valdivia.',
      },
      {
        question: '¿Qué incluye un loteo como Vive Puquila?',
        answer:
          'Es un proyecto parcelado con acceso, lotes individualizados y servicios según la etapa del loteo. En Vive Puquila las unidades cuentan con rol propio, electricidad y agua potable.',
      },
      {
        question: '¿Cuál es la diferencia entre loteo, parcela y terreno?',
        answer:
          'Un loteo agrupa varios lotes dentro de un mismo proyecto. La parcela o terreno es la unidad que compras. En nuestra web puedes revisar el detalle de cada lote en la ficha del proyecto.',
      },
      {
        question: '¿Puedo visitar el loteo antes de reservar?',
        answer:
          'Sí. Coordina una visita desde la ficha de Vive Puquila o escribe al equipo comercial para confirmar horarios y disponibilidad.',
      },
      {
        question: '¿También buscan terrenos o parcelas en Valdivia?',
        answer: 'Si prefieres ver el catálogo con otro enfoque:',
        links: [
          { label: 'Terrenos en Valdivia', href: '/terrenos-en-valdivia' },
          { label: 'Parcelas en Valdivia', href: '/parcelas-en-valdivia' },
        ],
      },
    ],
  },
  'parcelas-baratas-valdivia': {
    path: '/parcelas-baratas-valdivia',
    eyebrow: 'Región de Los Ríos',
    title: 'Parcelas baratas en Valdivia y Los Ríos',
    description:
      'Parcelas económicas en venta cerca de Valdivia, con proyectos seleccionados en la Región de Los Ríos. Compara precio, superficie desde 5.000 m², servicios y condiciones de pago antes de reservar.',
    metadataTitle: 'Parcelas baratas en Valdivia | Opciones económicas en Los Ríos | Calafate Propiedades',
    metadataDescription:
      'Parcelas baratas cerca de Valdivia y en Los Ríos. Proyecto Vive Puquila en Mariquina con precio publicado, rol propio, servicios y asesoría comercial.',
    filters: { type: 'terreno', priceType: 'venta', zone: 'valdivia' },
    breadcrumbParent: VALDIVIA_BREADCRUMB_PARENT,
    relatedPages: getValdiviaRelatedPagesSection('/parcelas-baratas-valdivia'),
    primaryCta: { label: 'Ver parcelas económicas', href: '/parcelas-baratas-valdivia' },
    secondaryCta: { label: 'Proyecto Vive Puquila', href: '/proyectos/vive-puquila' },
    highlightsTitle: 'Opciones económicas cerca de Valdivia',
    highlights: [
      'Vive Puquila: parcelas de 5.000 m² en Mariquina, cerca de Valdivia, con precio visible en la ficha del proyecto.',
      'El catálogo de esta página prioriza las opciones por menor precio publicado.',
      'Alternativas de pago o financiamiento según disponibilidad del proyecto.',
      'Rol propio, acceso, electricidad y agua potable según condiciones publicadas.',
    ],
    faqs: [
      {
        question: '¿Hay parcelas baratas en venta cerca de Valdivia?',
        answer:
          'Sí. El proyecto Vive Puquila en San José de la Mariquina ofrece parcelas rurales de 5.000 m² con precio publicado en la ficha. Revisa el valor vigente y las condiciones comerciales antes de reservar.',
      },
      {
        question: '¿Qué hace accesible el precio de una parcela?',
        answer:
          'Influyen la ubicación, los servicios, la superficie y las condiciones de pago. En Vive Puquila puedes consultar precio, alternativas de financiamiento y disponibilidad con el equipo comercial.',
      },
      {
        question: '¿Las parcelas baratas incluyen servicios básicos?',
        answer:
          'Depende del proyecto. En Vive Puquila las unidades se comercializan con rol propio, acceso, electricidad y agua potable. Confirma el detalle actualizado en la ficha.',
      },
      {
        question: '¿Puedo comparar opciones antes de comprar?',
        answer: 'Sí. En el catálogo filtrado puedes revisar precio, superficie y ubicación. También puedes comparar:',
        links: [
          { label: 'Parcelas en Valdivia', href: '/parcelas-en-valdivia' },
          { label: 'Terrenos en Valdivia', href: '/terrenos-en-valdivia' },
          { label: 'Loteos en Valdivia', href: '/loteos-en-valdivia' },
        ],
      },
      {
        question: '¿Cómo sé si el precio publicado sigue vigente?',
        answer:
          'Los valores se actualizan en la ficha del proyecto. Si tienes dudas, solicita confirmación comercial antes de reservar.',
      },
    ],
  },
  'parcelas-en-los-muermos': {
    path: '/parcelas-en-los-muermos',
    eyebrow: 'Región de Los Lagos',
    title: 'Parcelas en Los Muermos',
    description:
      'Parcelas en venta en Los Muermos y sectores cercanos como Quillahua y Putrautrao. Revisa proyectos con superficies desde 5.000 m², servicios, precios y condiciones comerciales antes de coordinar una visita.',
    metadataTitle: 'Parcelas en Los Muermos | Los Lagos | Calafate Propiedades',
    metadataDescription:
      'Parcelas en venta en Los Muermos, Quillahua y Putrautrao. Proyectos con rol propio, servicios y asesoría comercial de Calafate Propiedades.',
    filters: { type: 'terreno', priceType: 'venta', zone: 'los-muermos' },
    breadcrumbParent: LOS_MUERMOS_BREADCRUMB_PARENT,
    relatedPages: getLosMuermosRelatedPagesSection('/parcelas-en-los-muermos'),
    primaryCta: { label: 'Ver parcelas disponibles', href: '/parcelas-en-los-muermos' },
    secondaryCta: { label: 'Portal Los Muermos', href: '/proyectos/portal-los-muermos' },
    highlightsTitle: 'Por qué revisar parcelas en Los Muermos',
    highlights: [
      'Portal Los Muermos: proyecto principal con parcelas de 5.000 m², agua potable y electricidad.',
      'Parcelas Quillahua y Putrautrao con entornos costeros y rurales en la misma comuna.',
      'Asesoría comercial para consultar disponibilidad, visitas a terreno y condiciones de pago.',
    ],
    faqs: [
      {
        question: '¿Hay parcelas en venta en Los Muermos?',
        answer:
          'Sí. Gestionamos Portal Los Muermos, Parcelas Quillahua y Parcelas Putrautrao, con unidades de 5.000 m² y fichas publicadas en el sitio.',
      },
      {
        question: '¿Qué servicios incluyen los proyectos en Los Muermos?',
        answer:
          'Depende del proyecto. Portal Los Muermos cuenta con agua potable, electricidad y acceso. Quillahua y Putrautrao tienen condiciones propias que puedes revisar en cada ficha.',
      },
      {
        question: '¿Puedo visitar las parcelas antes de comprar?',
        answer:
          'Sí. Solicita una visita desde la ficha del proyecto o escribe al equipo comercial desde la página de contacto.',
      },
      {
        question: '¿Buscan terrenos en Los Muermos?',
        answer: 'También puedes revisar el catálogo con foco en terrenos en la misma zona.',
        links: [{ label: 'Terrenos en Los Muermos', href: '/terrenos-en-los-muermos' }],
      },
    ],
  },
  'terrenos-en-los-muermos': {
    path: '/terrenos-en-los-muermos',
    eyebrow: 'Región de Los Lagos',
    title: 'Terrenos en Los Muermos',
    description:
      'Terrenos en venta en Los Muermos, Quillahua y Putrautrao. Explora lotes desde 5.000 m² con ubicación, precios y condiciones comerciales para vivienda, descanso o inversión en la Región de Los Lagos.',
    metadataTitle: 'Terrenos en Los Muermos | Terrenos en Los Lagos | Calafate Propiedades',
    metadataDescription:
      'Terrenos en venta en Los Muermos y sectores cercanos. Portal Los Muermos, Quillahua y Putrautrao con asesoría de Calafate Propiedades.',
    filters: { type: 'terreno', priceType: 'venta', zone: 'los-muermos' },
    breadcrumbParent: LOS_MUERMOS_BREADCRUMB_PARENT,
    relatedPages: getLosMuermosRelatedPagesSection('/terrenos-en-los-muermos'),
    primaryCta: { label: 'Ver terrenos disponibles', href: '/terrenos-en-los-muermos' },
    secondaryCta: { label: 'Portal Los Muermos', href: '/proyectos/portal-los-muermos' },
    highlightsTitle: 'Por qué revisar terrenos en Los Muermos',
    highlights: [
      'Tres proyectos activos en Los Muermos: Portal, Quillahua y Putrautrao.',
      'Terrenos de 5.000 m² con precio, superficie y servicios visibles en cada ficha.',
      'Recorridos virtuales y visitas a terreno coordinadas con el equipo comercial.',
    ],
    faqs: [
      {
        question: '¿Hay terrenos en venta en Los Muermos?',
        answer:
          'Sí. Portal Los Muermos, Parcelas Quillahua y Parcelas Putrautrao ofrecen terrenos rurales de 5.000 m² en la comuna.',
      },
      {
        question: '¿Qué diferencia hay entre terreno y parcela aquí?',
        answer:
          'En la práctica, muchos compradores usan ambos términos para lotes dentro de un proyecto rural. En el sitio puedes revisar el detalle de cada unidad en la ficha correspondiente.',
      },
      {
        question: '¿Cuál es el proyecto principal en Los Muermos?',
        answer: 'Portal Los Muermos concentra la mayor oferta del sector.',
        links: [
          { label: 'Portal Los Muermos', href: '/proyectos/portal-los-muermos' },
          { label: 'Parcelas Quillahua', href: '/proyectos/parcelas-quillahua' },
        ],
      },
      {
        question: '¿También buscan parcelas en la zona?',
        answer: 'Si prefieres ver el catálogo con foco en parcelas:',
        links: [{ label: 'Parcelas en Los Muermos', href: '/parcelas-en-los-muermos' }],
      },
    ],
  },
  'parcelas-en-puerto-montt': {
    path: '/parcelas-en-puerto-montt',
    eyebrow: 'Región de Los Lagos',
    title: 'Parcelas en Puerto Montt',
    description:
      'Parcelas en venta en Puerto Montt y el sector Las Quemas. Revisa proyectos con superficies desde 5.000 m², servicios, precios y condiciones comerciales antes de coordinar una visita.',
    metadataTitle: 'Parcelas en Puerto Montt | Los Lagos | Calafate Propiedades',
    metadataDescription:
      'Parcelas en venta en Puerto Montt y Las Quemas. Proyecto Altos del Tepual con rol propio, servicios y asesoría de Calafate Propiedades.',
    filters: { type: 'terreno', priceType: 'venta', zone: 'puerto-montt' },
    breadcrumbParent: PUERTO_MONTT_BREADCRUMB_PARENT,
    relatedPages: getPuertoMonttRelatedPagesSection('/parcelas-en-puerto-montt'),
    primaryCta: { label: 'Ver parcelas disponibles', href: '/parcelas-en-puerto-montt' },
    secondaryCta: { label: 'Altos del Tepual', href: '/proyectos/altos-del-tepual' },
    highlightsTitle: 'Por qué revisar parcelas en Puerto Montt',
    highlights: [
      'Altos del Tepual: parcelas de 5.000 m² en Las Quemas, con acceso y servicios.',
      'Ubicación estratégica en la Región de Los Lagos, cercana a la conectividad de Puerto Montt.',
      'Asesoría comercial para consultar disponibilidad, visitas a terreno y condiciones de pago.',
    ],
    faqs: [
      {
        question: '¿Hay parcelas en venta en Puerto Montt?',
        answer:
          'Sí. Gestionamos el proyecto Altos del Tepual en Las Quemas, comuna de Puerto Montt, con parcelas de 5.000 m² publicadas en el sitio.',
      },
      {
        question: '¿Qué incluye el proyecto Altos del Tepual?',
        answer:
          'Parcelas con rol propio, acceso, electricidad y agua potable según condiciones publicadas en la ficha del proyecto.',
      },
      {
        question: '¿Puedo visitar el terreno antes de comprar?',
        answer:
          'Sí. Solicita una visita desde la ficha del proyecto o contacta al equipo comercial.',
      },
      {
        question: '¿Buscan terrenos en Puerto Montt?',
        answer: 'También puedes revisar el catálogo con foco en terrenos en la misma zona.',
        links: [{ label: 'Terrenos en Puerto Montt', href: '/terrenos-en-puerto-montt' }],
      },
    ],
  },
  'terrenos-en-puerto-montt': {
    path: '/terrenos-en-puerto-montt',
    eyebrow: 'Región de Los Lagos',
    title: 'Terrenos en Puerto Montt',
    description:
      'Terrenos en venta en Puerto Montt y Las Quemas. Explora lotes desde 5.000 m² con ubicación, precios y condiciones comerciales para vivienda, inversión o segunda vivienda en Los Lagos.',
    metadataTitle: 'Terrenos en Puerto Montt | Los Lagos | Calafate Propiedades',
    metadataDescription:
      'Terrenos en venta en Puerto Montt y Las Quemas. Proyecto Altos del Tepual con asesoría comercial de Calafate Propiedades.',
    filters: { type: 'terreno', priceType: 'venta', zone: 'puerto-montt' },
    breadcrumbParent: PUERTO_MONTT_BREADCRUMB_PARENT,
    relatedPages: getPuertoMonttRelatedPagesSection('/terrenos-en-puerto-montt'),
    primaryCta: { label: 'Ver terrenos disponibles', href: '/terrenos-en-puerto-montt' },
    secondaryCta: { label: 'Altos del Tepual', href: '/proyectos/altos-del-tepual' },
    highlightsTitle: 'Por qué revisar terrenos en Puerto Montt',
    highlights: [
      'Proyecto Altos del Tepual en Las Quemas, Puerto Montt.',
      'Terrenos de 5.000 m² con precio, superficie y servicios visibles en la ficha.',
      'Recorrido virtual y visitas a terreno coordinadas con el equipo comercial.',
    ],
    faqs: [
      {
        question: '¿Hay terrenos en venta en Puerto Montt?',
        answer:
          'Sí. Altos del Tepual ofrece terrenos de 5.000 m² en Las Quemas, dentro de la comuna de Puerto Montt.',
      },
      {
        question: '¿Los terrenos tienen rol propio y servicios?',
        answer:
          'Revisa la ficha de Altos del Tepual para confirmar rol propio, acceso, electricidad y agua potable vigentes.',
      },
      {
        question: '¿Cuál es el proyecto disponible en la zona?',
        answer: 'Actualmente destacamos Altos del Tepual en Las Quemas.',
        links: [{ label: 'Altos del Tepual', href: '/proyectos/altos-del-tepual' }],
      },
      {
        question: '¿También buscan parcelas en Puerto Montt?',
        answer: 'Si prefieres ver el catálogo con foco en parcelas:',
        links: [{ label: 'Parcelas en Puerto Montt', href: '/parcelas-en-puerto-montt' }],
      },
    ],
  },
  'parcelas-en-maule': {
    path: '/parcelas-en-maule',
    eyebrow: 'Región del Maule',
    title: 'Parcelas en el Maule y San Rafael',
    description:
      'Parcelas en venta en el Maule, con foco en San Rafael y conectividad hacia Talca. Revisa proyectos con superficies desde 5.000 m², precios y condiciones comerciales antes de coordinar una visita.',
    metadataTitle: 'Parcelas en el Maule | San Rafael | Calafate Propiedades',
    metadataDescription:
      'Parcelas en venta en el Maule y San Rafael. Proyecto Praderas del Maule con rol propio, acceso y asesoría comercial de Calafate Propiedades.',
    filters: { type: 'terreno', priceType: 'venta', zone: 'maule' },
    breadcrumbParent: MAULE_BREADCRUMB_PARENT,
    relatedPages: getMauleRelatedPagesSection('/parcelas-en-maule'),
    primaryCta: { label: 'Ver parcelas en el Maule', href: '/parcelas-en-maule' },
    secondaryCta: { label: 'Praderas del Maule', href: '/proyectos/praderas-del-maule' },
    highlightsTitle: 'Por qué revisar parcelas en el Maule',
    highlights: [
      'Praderas del Maule: parcelas de 5.000 m² en San Rafael, Región del Maule.',
      'Entorno rural con conectividad hacia Talca y el centro-sur de Chile.',
      'Asesoría comercial para consultar disponibilidad, visitas y condiciones de pago.',
    ],
    faqs: [
      {
        question: '¿Hay parcelas en venta en el Maule?',
        answer:
          'Sí. Gestionamos el proyecto Praderas del Maule en San Rafael, con parcelas de 5.000 m² publicadas en el sitio.',
      },
      {
        question: '¿Las parcelas están cerca de Talca?',
        answer:
          'Praderas del Maule se ubica en San Rafael, comuna de la Región del Maule con conexión hacia Talca y el resto del valle.',
      },
      {
        question: '¿Qué servicios incluye el proyecto?',
        answer:
          'Revisa la ficha de Praderas del Maule para confirmar rol propio, acceso, electricidad y condiciones vigentes.',
      },
      {
        question: '¿Puedo visitar el terreno antes de reservar?',
        answer:
          'Sí. Coordina una visita desde la ficha del proyecto o escribe al equipo comercial.',
        links: [{ label: 'Praderas del Maule', href: '/proyectos/praderas-del-maule' }],
      },
    ],
  },
  vender: {
    path: '/vender',
    layout: 'sell',
    showCatalog: false,
    eyebrow: 'Venta de parcelas, loteos y terrenos',
    title: 'Vender una parcela o terreno con Calafate Propiedades',
    description:
      'Publicamos parcelas, loteos, terrenos y propiedades en el sur de Chile. Te ayudamos a ordenar la información, definir el mensaje comercial y recibir consultas calificadas desde la web.',
    metadataTitle: 'Vender parcela, loteo o terreno en el sur de Chile | Calafate Propiedades',
    metadataDescription:
      'Servicio para vender parcelas, loteos y terrenos en Los Lagos, Los Ríos y Maule. Publicación profesional, gestión de consultas y acompañamiento comercial.',
    filters: {},
    primaryCta: { label: 'Solicitar evaluación', href: '#vender-solicitud' },
    secondaryCta: { label: 'Escribir por WhatsApp', href: '#vender-solicitud' },
    highlightsTitle: 'Qué incluye el servicio',
    highlights: [
      'Revisión de ubicación, superficie, accesos y condiciones comerciales.',
      'Ficha web con fotos, descripción y datos que el comprador necesita revisar.',
      'Gestión de consultas desde formulario, WhatsApp y campañas digitales.',
      'Cobertura en Los Lagos, Los Ríos y Región del Maule.',
    ],
    infoGrids: [
      {
        eyebrow: 'Proceso comercial',
        title: 'Cómo llevamos tu propiedad al mercado',
        subtitle:
          'No se trata solo de subir fotos: ordenamos la información que un comprador revisa antes de coordinar una visita o hacer una oferta.',
        gridLabel: 'Etapas del servicio de venta',
        steps: [
          {
            icon: 'message',
            title: 'Consulta inicial',
            description:
              'Nos cuentas qué quieres vender, ubicación, superficie aproximada y expectativa de precio. Revisamos si encaja con la cartera y zonas que trabajamos.',
          },
          {
            icon: 'clipboard',
            title: 'Orden de antecedentes',
            description:
              'Definimos rol, accesos, servicios, fotografías y condiciones de venta. Si faltan datos, te indicamos qué conviene completar antes de publicar.',
          },
          {
            icon: 'camera',
            title: 'Publicación en la web',
            description:
              'Creamos la ficha con mensaje claro, precio, moneda, superficie y material útil para campañas en Meta, Google y consultas directas.',
          },
          {
            icon: 'megaphone',
            title: 'Gestión de interesados',
            description:
              'Recibes las consultas del sitio con origen de campaña cuando aplica. Te ayudamos a responder con foco comercial y seguimiento oportuno.',
          },
        ],
      },
      {
        eyebrow: 'Antes de publicar',
        title: 'Información útil para evaluar tu propiedad',
        subtitle:
          'Mientras más clara esté la información desde el inicio, más rápido podemos orientar precio, público objetivo y siguiente paso comercial.',
        gridLabel: 'Puntos de revisión para propietarios',
        steps: [
          {
            icon: 'map',
            title: 'Ubicación y accesos',
            description:
              'Comuna, sector, camino de acceso, referencias y enlace de mapa si lo tienes. En terrenos y loteos esto es decisivo para el comprador.',
          },
          {
            icon: 'file',
            title: 'Antecedentes disponibles',
            description:
              'Rol, deslindes, planos previos, fotos actuales o antecedentes de subdivisión. No necesitas tener todo, pero ayuda a cotizar y publicar mejor.',
          },
          {
            icon: 'chart',
            title: 'Valor y condiciones',
            description:
              'Precio esperado, moneda, forma de pago, plazos o condiciones especiales. Podemos orientarte según proyectos similares publicados.',
          },
          {
            icon: 'compass',
            title: 'Disponibilidad y siguiente paso',
            description:
              'Si la propiedad está lista para visita, si requiere coordinación o si buscas vender un loteo completo o una unidad dentro de un proyecto.',
          },
        ],
      },
    ],
    asideNote: {
      kicker: 'Zonas de trabajo',
      text:
        'Gestionamos venta de terrenos, parcelas y proyectos en Los Lagos, Los Ríos y Región del Maule. Si tu propiedad está en otra zona, consúltanos: evaluamos caso a caso antes de comprometer una publicación.',
    },
    contactSection: {
      title: 'Solicita evaluación comercial',
      description:
        'Cuéntanos qué quieres vender y un asesor te responderá con el siguiente paso: revisión de antecedentes, propuesta de publicación o indicaciones si aún falta información.',
      defaultMessage:
        'Hola, quiero vender una propiedad con Calafate Propiedades. Ubicación: [comuna/sector]. Tipo: [terreno / parcela / casa / loteo]. Superficie aproximada: [m²]. Precio esperado: [opcional].',
      formTitle: 'Envíanos los antecedentes',
      formDescription:
        'Completa el formulario y te contactamos por email o teléfono. También puedes escribir por WhatsApp con el mismo mensaje base.',
    },
    ctaBanner: {
      eyebrow: '¿Listo para publicar?',
      headline: 'Conversemos sobre tu terreno, parcela o proyecto',
      sub: 'Revisamos la información disponible y te proponemos el mejor camino para salir al mercado con una ficha clara y consultas calificadas.',
    },
    relatedCatalog: {
      title: 'Conoce cómo publicamos nuestras propiedades',
      description:
        'Revisa fichas activas de terrenos, parcelas y proyectos para ver el nivel de detalle que entregamos a los compradores.',
      href: '/comprar',
      linkLabel: 'Ver propiedades en venta',
    },
    faqs: [
      {
        question: '¿Qué tipos de propiedad pueden publicar con ustedes?',
        answer:
          'Terrenos, parcelas, casas y proyectos de loteo en venta. Nos especializamos en el sur de Chile, con foco en información clara para compradores de terreno.',
      },
      {
        question: '¿Qué necesito para iniciar la evaluación?',
        answer:
          'Ubicación, tipo de propiedad, superficie aproximada y, si la tienes, expectativa de precio. Fotos y antecedentes técnicos ayudan, pero no son obligatorios en el primer contacto.',
      },
      {
        question: '¿Publican en todas las regiones de Chile?',
        answer:
          'Trabajamos principalmente en Los Lagos, Los Ríos y Región del Maule. Si tu propiedad está fuera de esas zonas, escríbenos y evaluamos si podemos gestionarla.',
      },
      {
        question: '¿Cobran por publicar o por vender?',
        answer:
          'Las condiciones comerciales se definen en la consulta inicial según tipo de propiedad, alcance del servicio y estrategia de venta acordada.',
      },
      {
        question: '¿Puedo vender un loteo completo o solo algunas parcelas?',
        answer:
          'Sí. Gestionamos tanto proyectos completos como unidades individuales, según la etapa del loteo y la información disponible.',
      },
    ],
  },
  topografia: {
    path: '/topografia',
    eyebrow: 'Servicios de topografía',
    title: 'Trabajos de topografía para terrenos y proyectos',
    description:
      'Coordinamos trabajos de topografía para terrenos, parcelas y loteos en el sur de Chile. Te ayudamos a obtener medidas, pendientes y antecedentes del terreno antes de comprar, vender o avanzar un proyecto.',
    metadataTitle: 'Trabajos de topografía | Calafate Propiedades',
    metadataDescription:
      'Servicios de topografía para terrenos, parcelas y proyectos en Los Lagos, Los Ríos y Maule. Solicita cotización y coordinación comercial.',
    showCatalog: false,
    filters: {},
    primaryCta: {
      label: 'Solicitar topografía',
      href: buildMailto(siteConfig.contact.salesEmail, 'Quiero solicitar trabajos de topografía'),
    },
    secondaryCta: { label: 'Ver terrenos en venta', href: '/terrenos' },
    highlightsTitle: 'Por qué coordinar topografía con Calafate',
    highlights: [
      'Cobertura en Los Lagos, Los Ríos y Región del Maule.',
      'Información técnica útil para comprar, vender o proyectar con más seguridad.',
      'Coordinación comercial directa: alcance, plazos y siguiente paso claros.',
    ],
    serviceSections: [
      {
        title: 'Trabajos que coordinamos',
        items: [
          'Levantamiento topográfico y plano de emplazamiento.',
          'Revisión de deslindes, límites y ubicación en terreno.',
          'Información de pendientes, cotas y condiciones del predio.',
          'Apoyo previo a compra de parcela, subdivisión o anteproyecto.',
        ],
      },
      {
        title: 'Cómo es el proceso',
        items: [
          'Nos escribes con ubicación del terreno y el objetivo del trabajo.',
          'Revisamos alcance según comuna, superficie y tipo de terreno.',
          'Coordinamos visita a terreno y plazo orientativo de entrega.',
          'Recibes antecedentes técnicos según el trabajo acordado.',
        ],
      },
      {
        title: 'Qué necesitamos para cotizar',
        items: [
          'Ubicación: comuna, rol, enlace de Google Maps o parcela publicada en el sitio.',
          'Superficie aproximada y uso (comprar, vender, construir, subdividir).',
          'Antecedentes disponibles: planos previos, deslindes o solo el terreno.',
        ],
      },
    ],
    ctaBanner: {
      eyebrow: 'Solicitud de servicio',
      headline: 'Cuéntanos ubicación y objetivo del terreno',
      sub: 'Envíanos los antecedentes básicos y te orientamos sobre el trabajo de topografía que corresponde, plazos y siguiente paso.',
    },
    relatedCatalog: {
      title: 'Terrenos y parcelas en venta',
      description:
        'Si buscas comprar, revisa oportunidades publicadas y consulta por topografía en la parcela que te interese.',
      href: '/terrenos',
      linkLabel: 'Ver terrenos en venta',
    },
    faqs: [
      {
        question: '¿Para qué sirve un trabajo de topografía?',
        answer:
          'Permite conocer medidas, pendientes, límites y condiciones reales del terreno antes de comprar, vender, financiar o proyectar una construcción.',
      },
      {
        question: '¿Puedo solicitar topografía para una parcela publicada en el sitio?',
        answer:
          'Sí. Indica el proyecto o enlace de la ficha y el equipo revisará alcance según ubicación y tipo de terreno.',
      },
      {
        question: '¿En qué zonas trabajan?',
        answer:
          'Principalmente en Los Lagos, Los Ríos y Región del Maule, según disponibilidad y tipo de trabajo.',
      },
      {
        question: '¿Cuánto demora y qué entregables recibo?',
        answer:
          'Depende del alcance y la temporada. Tras la consulta te indicamos plazo orientativo y entregables (por ejemplo planos, cotas o antecedentes de terreno).',
      },
      {
        question: '¿Calafate realiza el trabajo en terreno o coordina con terceros?',
        answer:
          'Coordinamos el servicio según el caso. En la consulta inicial te explicamos quién ejecuta el trabajo y qué incluye la cotización.',
      },
      {
        question: '¿Tienen precio publicado?',
        answer:
          'El valor depende de ubicación, superficie y tipo de levantamiento. Cotizamos caso a caso tras revisar la información que nos envíes.',
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
  if (!localized) {
    return base;
  }

  return {
    ...base,
    ...localized,
    path: base.path,
    filters: base.filters,
    showCatalog: base.showCatalog,
    layout: base.layout,
    infoGrids: localized.infoGrids ?? base.infoGrids,
    asideNote: localized.asideNote ?? base.asideNote,
    contactSection: localized.contactSection ?? base.contactSection,
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
