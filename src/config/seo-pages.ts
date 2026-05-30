import type { PropertyFilters } from '@/types/property';
import { buildMailto, siteConfig } from '@/config/site';

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
    description: 'Encuentra terrenos, parcelas y oportunidades inmobiliarias seleccionadas por Calafate Propiedades, con informacion clara para comparar ubicacion, precio y potencial de inversion.',
    metadataTitle: 'Comprar propiedades en Chile | Calafate Propiedades',
    metadataDescription: 'Propiedades, terrenos y parcelas en venta en Chile. Revisa proyectos seleccionados con precio, ubicacion e informacion comercial clara.',
    filters: { priceType: 'venta' },
    primaryCta: { label: 'Ver propiedades', href: '/propiedades?priceType=venta' },
    secondaryCta: { label: 'Ver proyectos', href: '/proyectos' },
    highlights: [
      'Propiedades publicadas con fotografias y datos revisados.',
      'Filtros por ciudad, zona, tipo de propiedad y presupuesto.',
      'Acompanamiento comercial para resolver dudas antes de visitar o reservar.',
    ],
    faqs: [
      {
        question: 'Que tipo de propiedades puedo comprar?',
        answer: 'Actualmente el foco principal esta en terrenos, parcelas y proyectos inmobiliarios en el sur y centro de Chile.',
      },
      {
        question: 'Puedo consultar por una propiedad antes de reservar?',
        answer: 'Si. Cada ficha permite enviar una consulta para recibir informacion comercial y resolver dudas sobre disponibilidad, forma de pago o ubicacion.',
      },
    ],
  },
  arriendos: {
    path: '/arriendos',
    eyebrow: 'Arriendos',
    title: 'Propiedades en arriendo',
    description: 'Consulta arriendos en el sur de Chile. Si no hay fichas publicadas por ahora, dejanos tu mensaje y te avisamos cuando haya opciones disponibles.',
    metadataTitle: 'Arriendos | Calafate Propiedades',
    metadataDescription: 'Propiedades en arriendo gestionadas por Calafate Propiedades. Consulta disponibilidad, condiciones y ubicaciones.',
    filters: { priceType: 'arriendo' },
    primaryCta: { label: 'Ver arriendos', href: '/arriendos' },
    secondaryCta: { label: 'Hablar con un asesor', href: '/contacto' },
    highlights: [
      'Cartera visible en el sitio cuando hay propiedades publicadas.',
      'Si no hay stock web, igual puedes consultar por disponibilidad.',
      'Asesoria directa por formulario o WhatsApp.',
    ],
    faqs: [
      {
        question: 'Por que no veo propiedades en arriendo?',
        answer: 'Significa que aun no hay fichas publicadas en el sitio. Puedes contactarnos y te informamos de opciones vigentes o cuando se publique una nueva.',
      },
      {
        question: 'Como aparecen nuevos arriendos en la web?',
        answer: 'Cuando el equipo publica una propiedad con operacion Arriendo en el panel de administracion, se muestra automaticamente en esta pagina.',
      },
      {
        question: 'Como consulto por un arriendo?',
        answer: 'Desde la ficha de cada propiedad o escribiendo al equipo comercial desde la pagina de contacto.',
      },
    ],
  },
  proyectos: {
    path: '/proyectos',
    eyebrow: 'Proyectos inmobiliarios',
    title: 'Proyectos de parcelas y terrenos en Chile',
    description: 'Explora proyectos seleccionados de parcelas y terrenos, con ubicacion, superficie, imagenes, precio y condiciones comerciales pensadas para comparar antes de invertir.',
    metadataTitle: 'Proyectos de parcelas en Chile | Calafate Propiedades',
    metadataDescription: 'Proyectos inmobiliarios de parcelas y terrenos en Chile. Explora opciones en Los Lagos, Los Rios y Maule.',
    filters: { type: 'terreno', priceType: 'venta' },
    primaryCta: { label: 'Ver proyectos', href: '/proyectos' },
    secondaryCta: { label: 'Ver terrenos', href: '/terrenos' },
    highlights: [
      'Paginas individuales para cada proyecto indexable en Google.',
      'Informacion de ubicacion, precio desde y superficie.',
      'Galerias subidas a Supabase Storage para carga estable.',
    ],
    faqs: [
      {
        question: 'Que diferencia hay entre proyecto y terreno?',
        answer: 'Un proyecto agrupa una oferta inmobiliaria con varias unidades o parcelas; un terreno puede ser una unidad individual o parte de un proyecto.',
      },
      {
        question: 'Puedo pedir informacion de disponibilidad por parcela?',
        answer: 'Si. El equipo comercial puede indicar disponibilidad, valores vigentes y alternativas de pago.',
      },
    ],
  },
  terrenos: {
    path: '/terrenos',
    eyebrow: 'Terrenos y parcelas',
    title: 'Terrenos y parcelas en venta',
    description: 'Encuentra terrenos y parcelas en venta con superficies, precios y ubicaciones claras para evaluar vivienda, segunda vivienda o inversion.',
    metadataTitle: 'Terrenos en venta en Chile | Calafate Propiedades',
    metadataDescription: 'Terrenos y parcelas en venta en Chile. Revisa proyectos con superficies de 5.000 m2, ubicacion y valores actualizados.',
    filters: { type: 'terreno', priceType: 'venta' },
    primaryCta: { label: 'Ver terrenos', href: '/propiedades?type=terreno&priceType=venta' },
    secondaryCta: { label: 'Ver proyectos', href: '/proyectos' },
    highlights: [
      'Terrenos con superficie, zona y precio visible.',
      'Opciones orientadas a vivienda, descanso o inversion.',
      'Consulta directa para confirmar condiciones y factibilidades.',
    ],
    faqs: [
      {
        question: 'Los terrenos tienen rol propio?',
        answer: 'La informacion se revisa por proyecto. Cuando corresponde, la ficha indica condiciones como rol propio, servicios y acceso.',
      },
      {
        question: 'Puedo comprar con facilidad de pago?',
        answer: 'Algunos proyectos tienen condiciones especiales o credito directo. Conviene consultar cada caso con el equipo comercial.',
      },
    ],
  },
  vender: {
    path: '/vender',
    eyebrow: 'Venta de propiedades',
    title: 'Vender una propiedad con Calafate Propiedades',
    description: 'Recibe apoyo para presentar tu propiedad, ordenar su informacion, definir una estrategia comercial y conectarla con compradores calificados.',
    metadataTitle: 'Vender propiedad | Calafate Propiedades',
    metadataDescription: 'Servicio para vender propiedades, terrenos o parcelas con gestion comercial, publicacion y seguimiento de consultas.',
    filters: { priceType: 'venta' },
    primaryCta: { label: 'Solicitar evaluacion', href: buildMailto(siteConfig.contact.salesEmail, siteConfig.contact.sellSubject) },
    secondaryCta: { label: 'Ver propiedades publicadas', href: '/comprar' },
    highlights: [
      'Revision de informacion comercial antes de publicar.',
      'Publicacion con fotos, descripcion y datos utiles para compradores.',
      'Gestion de consultas desde la web y canales comerciales.',
    ],
    faqs: [
      {
        question: 'Que necesito para vender mi propiedad?',
        answer: 'Lo ideal es contar con ubicacion, antecedentes basicos, fotografias y condiciones comerciales. El equipo puede ayudarte a ordenar la publicacion.',
      },
      {
        question: 'Puedo publicar un terreno o parcela?',
        answer: 'Si. La web esta preparada para propiedades urbanas, terrenos, parcelas y proyectos inmobiliarios.',
      },
    ],
  },
  topografia: {
    path: '/topografia',
    eyebrow: 'Servicios de topografia',
    title: 'Trabajos de topografia para terrenos y proyectos',
    description: 'Solicita apoyo para trabajos de topografia asociados a terrenos, parcelas y proyectos inmobiliarios que requieren informacion tecnica confiable.',
    metadataTitle: 'Trabajos de topografia | Calafate Propiedades',
    metadataDescription: 'Servicios de topografia para terrenos, parcelas y proyectos inmobiliarios. Solicita informacion y coordinacion comercial.',
    filters: { type: 'terreno', priceType: 'venta' },
    primaryCta: { label: 'Solicitar topografia', href: buildMailto(siteConfig.contact.salesEmail, 'Quiero solicitar trabajos de topografia') },
    secondaryCta: { label: 'Ver terrenos', href: '/terrenos' },
    highlights: [
      'Apoyo para terrenos, parcelas y proyectos.',
      'Informacion tecnica orientada a decisiones inmobiliarias.',
      'Coordinacion directa con el equipo de Calafate Propiedades.',
    ],
    faqs: [
      {
        question: 'Para que sirve un trabajo de topografia?',
        answer: 'Ayuda a conocer medidas, pendientes, limites y condiciones del terreno antes de comprar, vender o proyectar una construccion.',
      },
      {
        question: 'Puedo solicitar topografia para una parcela en venta?',
        answer: 'Si. Puedes consultar por el servicio y el equipo revisara el alcance segun ubicacion y tipo de terreno.',
      },
    ],
  },
};

export const projectLandingSlugs = [
  'praderas-del-maule',
  'portal-los-muermos',
  'vive-puquila',
  'altos-del-tepual',
  'parcelas-quillahua',
  'parcelas-putrautrao',
] as const;
