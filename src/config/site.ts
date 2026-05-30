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
    title: 'Calafate Propiedades | Parcelas, terrenos y proyectos en Chile',
    description:
      'Compra parcelas, terrenos y loteos seleccionados con Calafate Propiedades. Proyectos con informacion clara, tours 360, precios desde y asesoria directa.',
    keywords: [
      'Calafate Propiedades',
      'parcelas',
      'terrenos',
      'loteos',
      'proyectos inmobiliarios',
      'parcelas en venta',
      'Los Lagos',
      'Los Rios',
      'Maule',
      'topografia',
    ],
  },
  contact: {
    primaryPhoneLabel: '+34 000 000 000',
    primaryPhoneHref: 'tel:+34000000000',
    primaryEmail: 'contacto@calafatepropiedades.com',
    salesEmail: 'contacto@calafatepropiedades.com',
    sellSubject: 'Quiero vender una propiedad',
    advisorySubject: 'Quiero asesoria inmobiliaria',
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
        es: 'Asesoria inmobiliaria',
        en: 'Real estate advisory',
      },
      email: 'contacto@calafatepropiedades.com',
      phoneLabel: '+34 000 000 000',
      phoneHref: 'tel:+34000000000',
      whatsappNumber: '34000000000',
      addressLines: ['Direccion pendiente de confirmar'],
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
      es: 'Inmobiliaria enfocada en parcelas, terrenos y loteos con informacion comercial clara para compradores e inversionistas.',
      en: 'Real estate agency focused on lots, land, and development projects with clear commercial information for buyers and investors.',
    },
    aboutModelTitle: {
      es: 'Acompanamiento directo para decidir con informacion.',
      en: 'Direct guidance to decide with clear information.',
    },
    aboutModelParagraphs: {
      es: [
        'Calafate Propiedades trabaja con una cartera cuidada de proyectos, parcelas y terrenos en zonas con demanda real.',
        'Ordenamos ubicacion, superficie, precios desde, disponibilidad y condiciones para que cada consulta avance con datos concretos.',
      ],
      en: [
        'Calafate Propiedades works with a curated portfolio of projects, lots, and land in high-demand areas.',
        'We organize location, surface area, starting prices, availability, and conditions so every inquiry moves with concrete data.',
      ],
    },
    discover: {
      eyebrow: 'Criterio local',
      title: 'Proyectos claros para decisiones importantes',
      paragraphs: [
        'Calafate Propiedades presenta loteos, parcelas y terrenos con una lectura simple: donde esta, cuanto cuesta desde, que superficie tiene y que condiciones debes revisar antes de avanzar.',
        'Te acompanamos desde la primera consulta hasta la visita o evaluacion final, con informacion ordenada, atencion directa y seguimiento comercial.',
      ],
    },
  },
} as const;

export function buildMailto(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
