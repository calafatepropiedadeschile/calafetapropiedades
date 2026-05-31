import type { PropertyFilters } from '@/types/property';
import { buildMailto, siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n/config';
import { seoLandingPagesEn } from '@/config/seo-pages-en';

import { getDefaultCanonicalBaseUrl } from '@/config/seo-url';

export const siteUrl = getDefaultCanonicalBaseUrl();

export type SeoLandingKey = 'comprar' | 'arriendos' | 'proyectos' | 'terrenos' | 'vender' | 'topografia';

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
    layout: 'sell',
    showCatalog: false,
    eyebrow: 'Venta de propiedades',
    title: 'Vender una propiedad con Calafate Propiedades',
    description:
      'Publicamos terrenos, parcelas, casas y loteos en el sur de Chile. Te ayudamos a ordenar la información, definir el mensaje comercial y recibir consultas calificadas desde la web.',
    metadataTitle: 'Vender propiedad, terreno o parcela | Calafate Propiedades',
    metadataDescription:
      'Servicio para vender terrenos, parcelas y propiedades en Los Lagos, Los Ríos y Maule. Publicación profesional, gestión de consultas y acompañamiento comercial.',
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
