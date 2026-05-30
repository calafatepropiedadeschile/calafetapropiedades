import { buildMailto, siteConfig } from '@/config/site';
import type { SeoLandingPageConfig } from '@/config/seo-pages';

type SeoLandingContent = Omit<SeoLandingPageConfig, 'path' | 'filters' | 'showCatalog'>;

export const seoLandingPagesEn: Record<
  'comprar' | 'arriendos' | 'proyectos' | 'terrenos' | 'vender' | 'topografia',
  SeoLandingContent
> = {
  comprar: {
    eyebrow: 'Property sales',
    title: 'Buy properties and land lots in Chile',
    description:
      'Find land, lots, and selected real estate opportunities from Calafate Propiedades with clear information to compare location, price, and investment potential.',
    metadataTitle: 'Buy properties in Chile | Calafate Propiedades',
    metadataDescription:
      'Land, lots, and properties for sale in Chile. Review selected projects with price, location, and clear commercial information.',
    primaryCta: { label: 'View properties', href: '/propiedades?priceType=venta' },
    secondaryCta: { label: 'View projects', href: '/proyectos' },
    highlights: [
      'Published listings with photos and reviewed data.',
      'Filters by city, area, property type, and budget.',
      'Commercial support to answer questions before visiting or reserving.',
    ],
    faqs: [
      {
        question: 'What types of properties can I buy?',
        answer: 'The main focus is land, lots, and real estate projects in southern and central Chile.',
      },
      {
        question: 'Can I ask about a property before reserving?',
        answer: 'Yes. Each listing lets you send an inquiry to receive commercial information and check availability, payment terms, or location.',
      },
    ],
  },
  arriendos: {
    eyebrow: 'Rentals',
    title: 'Properties for rent',
    description:
      'Browse rentals in southern Chile. If no listings are published yet, contact us and we will notify you when options are available.',
    metadataTitle: 'Rentals | Calafate Propiedades',
    metadataDescription:
      'Rental properties managed by Calafate Propiedades. Check availability, terms, and locations.',
    primaryCta: { label: 'View rentals', href: '/arriendos' },
    secondaryCta: { label: 'Talk to an advisor', href: '/contacto' },
    highlights: [
      'Inventory visible on the site when rentals are published.',
      'You can still inquire about availability if nothing is listed yet.',
      'Direct support via form or WhatsApp.',
    ],
    faqs: [
      {
        question: 'Why do I not see rental listings?',
        answer: 'It means no listings are published on the site yet. Contact us for current options or upcoming availability.',
      },
      {
        question: 'How do new rentals appear on the website?',
        answer: 'When the team publishes a property with rental operation in the admin panel, it appears automatically on this page.',
      },
      {
        question: 'How do I inquire about a rental?',
        answer: 'From each property page or by contacting the commercial team through the contact page.',
      },
    ],
  },
  proyectos: {
    eyebrow: 'Real estate projects',
    title: 'Land and lot projects in Chile',
    description:
      'Explore selected land and lot projects with location, surface area, images, price, and commercial terms designed for comparison before investing.',
    metadataTitle: 'Land projects in Chile | Calafate Propiedades',
    metadataDescription:
      'Land and lot real estate projects in Chile. Explore options in Los Lagos, Los Rios, and Maule.',
    primaryCta: { label: 'View projects', href: '/proyectos' },
    secondaryCta: { label: 'View land', href: '/terrenos' },
    highlights: [
      'Individual pages for each project indexed for search engines.',
      'Location, starting price, and surface information.',
      'Galleries hosted on Supabase Storage for stable loading.',
    ],
    faqs: [
      {
        question: 'What is the difference between a project and a single lot?',
        answer: 'A project groups a real estate offer with multiple units or lots; a single lot may be standalone or part of a project.',
      },
      {
        question: 'Can I ask about availability per lot?',
        answer: 'Yes. The commercial team can share availability, current values, and payment alternatives.',
      },
    ],
  },
  terrenos: {
    eyebrow: 'Land and lots',
    title: 'Land and lots for sale',
    description:
      'Find land and lots for sale with clear surface areas, prices, and locations for primary home, second home, or investment.',
    metadataTitle: 'Land for sale in Chile | Calafate Propiedades',
    metadataDescription:
      'Land and lots for sale in Chile. Review projects with 5,000 sqm lots, location, and updated values.',
    primaryCta: { label: 'View land', href: '/propiedades?type=terreno&priceType=venta' },
    secondaryCta: { label: 'View projects', href: '/proyectos' },
    highlights: [
      'Land with visible surface, area, and price.',
      'Options for living, leisure, or investment.',
      'Direct inquiry to confirm terms and feasibility.',
    ],
    faqs: [
      {
        question: 'Do the lots have their own tax roll (rol)?',
        answer: 'Information is reviewed per project. When applicable, the listing notes rol, services, and access conditions.',
      },
      {
        question: 'Can I buy with payment plans?',
        answer: 'Some projects offer special terms or direct financing. Ask the commercial team for each case.',
      },
    ],
  },
  vender: {
    eyebrow: 'Sell your property',
    title: 'Sell a property with Calafate Propiedades',
    description:
      'Get support to present your property, organize key information, define a commercial strategy, and connect with qualified buyers.',
    metadataTitle: 'Sell property | Calafate Propiedades',
    metadataDescription:
      'Service to sell properties, land, or lots with commercial management, publishing, and inquiry follow-up.',
    primaryCta: { label: 'Request valuation', href: buildMailto(siteConfig.contact.salesEmail, siteConfig.contact.sellSubject) },
    secondaryCta: { label: 'View published listings', href: '/comprar' },
    highlights: [
      'Commercial information review before publishing.',
      'Listings with photos, description, and useful buyer data.',
      'Inquiry management from the website and sales channels.',
    ],
    faqs: [
      {
        question: 'What do I need to sell my property?',
        answer: 'Ideally location, basic records, photos, and commercial terms. The team can help organize the listing.',
      },
      {
        question: 'Can I list land or a lot?',
        answer: 'Yes. The site supports urban properties, land, lots, and real estate projects.',
      },
    ],
  },
  topografia: {
    eyebrow: 'Surveying services',
    title: 'Surveying for land and projects',
    description:
      'Request surveying support for land, lots, and real estate projects that need reliable technical information.',
    metadataTitle: 'Surveying services | Calafate Propiedades',
    metadataDescription:
      'Surveying for land, lots, and real estate projects. Request information and commercial coordination.',
    primaryCta: {
      label: 'Request surveying',
      href: buildMailto(siteConfig.contact.salesEmail, 'I want to request surveying services'),
    },
    secondaryCta: { label: 'View land', href: '/terrenos' },
    highlights: [
      'Support for land, lots, and projects.',
      'Technical information oriented to real estate decisions.',
      'Direct coordination with the Calafate Propiedades team.',
    ],
    faqs: [
      {
        question: 'What is surveying used for?',
        answer: 'It helps understand measurements, slopes, boundaries, and land conditions before buying, selling, or building.',
      },
      {
        question: 'Can I request surveying for a lot for sale?',
        answer: 'Yes. Ask about the service and the team will review scope based on location and land type.',
      },
    ],
  },
};
