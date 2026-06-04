import { primaryContact } from '@/config/contact';

export type SiteOffice = {
  id: string;
  country: {
    es: string;
    en: string;
  };
  brandName: string;
  contactName: string;
  role: {
    es: string;
    en: string;
  };
  email: string;
  phoneLabel: string;
  phoneHref: string;
  whatsappNumber: string;
  addressLines: string[];
  scope?: {
    es: string;
    en: string;
  };
};

export const siteConfig = {
  name: 'Calafate Propiedades',
  logo: {
    primary: 'Calafate',
    secondary: 'Propiedades',
  },
  adminName: 'Calafate Admin',
  storageKeyPrefix: 'calafate',
  metadata: {
    title: 'Parcelas, loteos y terrenos en el sur de Chile | Calafate Propiedades',
    description:
      'Encuentra parcelas, loteos y terrenos en el sur de Chile. Compra propiedades y proyectos inmobiliarios seleccionados con información clara, tours 360 y asesoría directa con Calafate Propiedades.',
    keywords: [
      'Parcelas en el sur de Chile',
      'Loteos en el sur de Chile',
      'Terrenos en el sur de Chile',
      'Calafate Propiedades',
      'proyectos inmobiliarios',
      'parcelas en venta',
      'Los Lagos',
      'Los Ríos',
      'Maule',
    ],
  },
  /** Regiones para JSON-LD `areaServed` (RealEstateAgent). */
  serviceAreas: ['Los Lagos', 'Los Ríos', 'Maule'],
  contact: {
    primaryPhoneLabel: primaryContact.displayPhone,
    primaryPhoneHref: primaryContact.phoneHref,
    primaryEmail: primaryContact.email,
    salesEmail: primaryContact.email,
    whatsappNumber: primaryContact.whatsappNumber,
    whatsappDisplay: primaryContact.displayPhone,
    sellSubject: 'Quiero vender una propiedad',
    advisorySubject: 'Quiero asesoría inmobiliaria',
    social: {
      instagram: 'https://www.instagram.com/calafatepropiedades/',
      linkedin: 'https://linkedin.com',
      facebook: 'https://facebook.com',
    },
  },
  offices: [
    {
      id: 'principal',
      country: {
        es: 'Oficina principal',
        en: 'Main office',
      },
      brandName: 'Calafate Propiedades',
      contactName: 'Equipo comercial',
      role: {
        es: 'Asesoría inmobiliaria',
        en: 'Real estate advisory',
      },
      email: primaryContact.email,
      phoneLabel: primaryContact.displayPhone,
      phoneHref: primaryContact.phoneHref,
      whatsappNumber: primaryContact.whatsappNumber,
      addressLines: [
        'Antonio Varas Nro.140 A',
        'Comuna de Los Muermos',
        'Región de Los Lagos, Chile',
      ],
      scope: {
        es: 'Parcelas, terrenos, loteos y apoyo comercial',
        en: 'Lots, land, development projects, and commercial support',
      },
    },
  ] satisfies SiteOffice[],
  copy: {
    aboutEyebrow: {
      es: 'Proyectos de parcelas',
      en: 'Land projects',
    },
    aboutIntro: {
      es: 'Inmobiliaria enfocada en parcelas, terrenos y loteos con información comercial clara para compradores e inversionistas.',
      en: 'Real estate agency focused on lots, land, and development projects with clear commercial information for buyers and investors.',
    },
    aboutModelTitle: {
      es: 'Acompañamiento directo para decidir con información.',
      en: 'Direct guidance to decide with clear information.',
    },
    aboutModelParagraphs: {
      es: [
        'Calafate Propiedades trabaja con una cartera cuidada de proyectos, parcelas y terrenos en zonas con demanda real.',
        'Ordenamos ubicación, superficie, precios desde, disponibilidad y condiciones para que cada consulta avance con datos concretos.',
      ],
      en: [
        'Calafate Propiedades works with a curated portfolio of projects, lots, and land in high-demand areas.',
        'We organize location, surface area, starting prices, availability, and conditions so every inquiry moves with concrete data.',
      ],
    },
    discover: {
      imageUrl: '/images/sur_chile_proyectos.png',
      eyebrow: 'Criterio local',
      title: 'Proyectos claros para decisiones importantes',
      paragraphs: [
        'Calafate Propiedades presenta loteos, parcelas y terrenos con una lectura simple: dónde está, cuánto cuesta desde, qué superficie tiene y qué condiciones debes revisar antes de avanzar.',
        'Te acompañamos desde la primera consulta hasta la visita o evaluación final, con información ordenada, atención directa y seguimiento comercial.',
      ],
    },
  },
} as const;

export function buildMailto(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
