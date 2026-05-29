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
    title: 'Calafate Propiedades | Propiedades en venta y alquiler',
    description:
      'Encuentra propiedades en venta y alquiler con Calafate Propiedades. Casas, apartamentos, terrenos y oportunidades inmobiliarias seleccionadas.',
    keywords: [
      'Calafate Propiedades',
      'inmobiliaria',
      'propiedades',
      'casas',
      'apartamentos',
      'terrenos',
      'real estate',
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
        es: 'Compra, venta, alquiler e inversion',
        en: 'Buying, selling, renting, and investment',
      },
    },
  ] satisfies SiteOffice[],
  copy: {
    aboutEyebrow: {
      es: 'Gestion inmobiliaria',
      en: 'Real estate management',
    },
    aboutIntro: {
      es: 'Inmobiliaria enfocada en la compra, venta, alquiler y gestion de propiedades seleccionadas.',
      en: 'Real estate agency focused on buying, selling, renting, and managing selected properties.',
    },
    aboutModelTitle: {
      es: 'Acompanamiento cercano y criterio local.',
      en: 'Close guidance and local insight.',
    },
    aboutModelParagraphs: {
      es: [
        'Calafate Propiedades trabaja con una cartera cuidada y procesos claros para conectar propietarios, compradores e inversores con oportunidades relevantes.',
        'Mantenemos una comunicacion directa durante cada etapa: valoracion, publicacion, visitas, negociacion y cierre.',
      ],
      en: [
        'Calafate Propiedades works with a curated portfolio and clear processes to connect owners, buyers, and investors with relevant opportunities.',
        'We keep communication direct through every stage: valuation, publication, visits, negotiation, and closing.',
      ],
    },
    discover: {
      eyebrow: 'Descubre',
      title: 'Calafate Propiedades',
      paragraphs: [
        'Calafate Propiedades es una inmobiliaria pensada para presentar propiedades de forma clara, profesional y orientada a generar consultas calificadas.',
        'Te acompanamos desde el primer contacto hasta la decision final, con informacion ordenada, atencion directa y seguimiento comercial.',
      ],
    },
  },
} as const;

export function buildMailto(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
