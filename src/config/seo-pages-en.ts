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
      'We publish land, lots, houses, and subdivisions in southern Chile. We help you organize information, define the commercial message, and receive qualified inquiries from the website.',
    metadataTitle: 'Sell land, lot, or property | Calafate Propiedades',
    metadataDescription:
      'Service to sell land, lots, and properties in Los Lagos, Los Ríos, and Maule. Professional publishing, inquiry management, and commercial support.',
    primaryCta: { label: 'Request valuation', href: '#vender-solicitud' },
    secondaryCta: { label: 'Message on WhatsApp', href: '#vender-solicitud' },
    highlightsTitle: 'What the service includes',
    highlights: [
      'Review of location, area, access, and commercial conditions.',
      'Web listing with photos, description, and buyer-ready data.',
      'Inquiry management from forms, WhatsApp, and digital campaigns.',
      'Coverage in Los Lagos, Los Ríos, and Maule Region.',
    ],
    infoGrids: [
      {
        eyebrow: 'Commercial process',
        title: 'How we bring your property to market',
        subtitle:
          'It is not only about uploading photos: we organize the information a buyer reviews before scheduling a visit or making an offer.',
        gridLabel: 'Selling service stages',
        steps: [
          {
            icon: 'message',
            title: 'Initial inquiry',
            description:
              'Tell us what you want to sell, location, approximate area, and price expectation. We check fit with our portfolio and regions.',
          },
          {
            icon: 'clipboard',
            title: 'Information review',
            description:
              'We define tax ID, access, utilities, photos, and sale terms. If data is missing, we tell you what to complete before publishing.',
          },
          {
            icon: 'camera',
            title: 'Website publishing',
            description:
              'We create the listing with clear messaging, price, currency, area, and assets useful for Meta, Google, and direct inquiries.',
          },
          {
            icon: 'megaphone',
            title: 'Buyer follow-up',
            description:
              'You receive site inquiries with campaign source when applicable. We help you respond with a commercial focus and timely follow-up.',
          },
        ],
      },
      {
        eyebrow: 'Before publishing',
        title: 'Useful information to evaluate your property',
        subtitle:
          'The clearer the information from the start, the faster we can guide price, target audience, and next commercial steps.',
        gridLabel: 'Review points for owners',
        steps: [
          {
            icon: 'map',
            title: 'Location and access',
            description:
              'Municipality, area, road access, references, and map link if available. For land and lots this is decisive for buyers.',
          },
          {
            icon: 'file',
            title: 'Available records',
            description:
              'Tax ID, boundaries, prior plans, current photos, or subdivision records. Not everything is required, but it improves quoting and publishing.',
          },
          {
            icon: 'chart',
            title: 'Value and terms',
            description:
              'Expected price, currency, payment method, timelines, or special terms. We can guide you based on similar published projects.',
          },
          {
            icon: 'compass',
            title: 'Availability and next step',
            description:
              'Whether the property is ready for visits, needs coordination, or you want to sell a full subdivision or individual lots.',
          },
        ],
      },
    ],
    asideNote: {
      kicker: 'Service areas',
      text:
        'We manage sales of land, lots, and projects in Los Lagos, Los Ríos, and Maule Region. If your property is elsewhere, contact us: we evaluate case by case before committing to a listing.',
    },
    contactSection: {
      title: 'Request a commercial valuation',
      description:
        'Tell us what you want to sell and an advisor will reply with the next step: record review, publishing proposal, or guidance if information is still missing.',
      defaultMessage:
        'Hello, I want to sell a property with Calafate Propiedades. Location: [municipality/area]. Type: [land / lot / house / subdivision]. Approx. area: [m²]. Expected price: [optional].',
      formTitle: 'Send us the details',
      formDescription:
        'Complete the form and we will contact you by email or phone. You can also write on WhatsApp using the same base message.',
    },
    ctaBanner: {
      eyebrow: 'Ready to publish?',
      headline: 'Let us talk about your land, lot, or project',
      sub: 'We review available information and propose the best path to market with a clear listing and qualified inquiries.',
    },
    relatedCatalog: {
      title: 'See how we publish properties',
      description:
        'Browse active land, lot, and project listings to see the level of detail we provide to buyers.',
      href: '/comprar',
      linkLabel: 'View properties for sale',
    },
    faqs: [
      {
        question: 'What property types can you list?',
        answer:
          'Land, lots, houses, and subdivision projects for sale. We specialize in southern Chile with clear information for land buyers.',
      },
      {
        question: 'What do I need to start the valuation?',
        answer:
          'Location, property type, approximate area, and expected price if you have it. Photos and technical records help but are not required on first contact.',
      },
      {
        question: 'Do you publish in all regions of Chile?',
        answer:
          'We mainly work in Los Lagos, Los Ríos, and Maule Region. If your property is outside those areas, write to us and we will evaluate it.',
      },
      {
        question: 'Do you charge to publish or to sell?',
        answer:
          'Commercial terms are defined in the initial consultation based on property type, service scope, and agreed sales strategy.',
      },
      {
        question: 'Can I sell a full subdivision or only some lots?',
        answer:
          'Yes. We manage full projects and individual units depending on subdivision stage and available information.',
      },
    ],
  },
  topografia: {
    eyebrow: 'Surveying services',
    title: 'Surveying for land and projects',
    description:
      'We coordinate surveying for land, lots, and subdivisions in southern Chile. Get measurements, slopes, and site data before you buy, sell, or move a project forward.',
    metadataTitle: 'Surveying services | Calafate Propiedades',
    metadataDescription:
      'Surveying for land, lots, and projects in Los Lagos, Los Ríos, and Maule. Request a quote and commercial coordination.',
    primaryCta: {
      label: 'Request surveying',
      href: buildMailto(siteConfig.contact.salesEmail, 'I want to request surveying services'),
    },
    secondaryCta: { label: 'View land for sale', href: '/terrenos' },
    highlightsTitle: 'Why coordinate surveying with Calafate',
    highlights: [
      'Coverage in Los Lagos, Los Ríos, and Maule Region.',
      'Technical information to buy, sell, or plan with more confidence.',
      'Direct commercial coordination with clear scope, timing, and next steps.',
    ],
    serviceSections: [
      {
        title: 'Work we coordinate',
        items: [
          'Topographic survey and site layout plans.',
          'Boundary review and on-site location checks.',
          'Slope, elevation, and site condition information.',
          'Support before buying a lot, subdivision, or early design.',
        ],
      },
      {
        title: 'How it works',
        items: [
          'You contact us with the site location and goal of the survey.',
          'We review scope based on municipality, area, and land type.',
          'We schedule a site visit and an indicative delivery timeline.',
          'You receive technical deliverables according to the agreed scope.',
        ],
      },
      {
        title: 'What we need for a quote',
        items: [
          'Location: municipality, parcel ID, Google Maps link, or a listing on this site.',
          'Approximate area and purpose (buy, sell, build, subdivide).',
          'Available documents: prior plans, boundaries, or land only.',
        ],
      },
    ],
    ctaBanner: {
      eyebrow: 'Service request',
      headline: 'Tell us the site location and your goal',
      sub: 'Send basic details and we will guide you on the right surveying scope, timing, and next step.',
    },
    relatedCatalog: {
      title: 'Land and lots for sale',
      description:
        'If you are looking to buy, browse published opportunities and ask about surveying for the lot you are interested in.',
      href: '/terrenos',
      linkLabel: 'View land for sale',
    },
    faqs: [
      {
        question: 'What is surveying used for?',
        answer:
          'It helps you understand measurements, slopes, boundaries, and real site conditions before buying, selling, financing, or building.',
      },
      {
        question: 'Can I request surveying for a lot listed on this site?',
        answer:
          'Yes. Share the project or listing link and the team will review scope based on location and land type.',
      },
      {
        question: 'Which areas do you cover?',
        answer:
          'Mainly Los Lagos, Los Ríos, and Maule Region, depending on availability and type of work.',
      },
      {
        question: 'How long does it take and what do I receive?',
        answer:
          'It depends on scope and season. After your inquiry we share an indicative timeline and deliverables (e.g. plans, elevations, or site data).',
      },
      {
        question: 'Does Calafate perform field work or coordinate third parties?',
        answer:
          'We coordinate the service case by case. On the first inquiry we explain who performs the work and what the quote includes.',
      },
      {
        question: 'Do you publish fixed prices?',
        answer:
          'Pricing depends on location, area, and survey type. We quote case by case after reviewing the information you send.',
      },
    ],
  },
};
