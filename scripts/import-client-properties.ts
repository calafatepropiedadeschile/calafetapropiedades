import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';
import { generateSlug } from '../src/lib/utils/formatters';

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to import properties.');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const publicDir = path.join(process.cwd(), 'public');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

type PriceType = 'venta' | 'alquiler';
type Currency = 'USD' | 'EUR' | 'MXN';

type BaseProperty = {
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  type: 'casa' | 'apartamento';
  country: string;
  marketRegion: 'espana_europa' | 'mexico' | 'latam';
  cityEs: string;
  cityEn: string;
  zoneEs: string;
  zoneEn: string;
  address: string;
  province?: string | null;
  bedrooms: number;
  bathrooms: number;
  builtArea: number;
  totalArea: number;
  parking: number;
  amenities: string[];
  imageFolder: string[];
  sale?: { price: number; currency: Currency };
  rent?: { price: number; currency: Currency };
};

function collectImageFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectImageFiles(fullPath));
      continue;
    }

    if (imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function toPublicUrl(filePath: string) {
  const relativePath = path.relative(publicDir, filePath);
  return `/${relativePath.split(path.sep).map(encodeURIComponent).join('/')}`;
}

function getImages(folder: string[]) {
  const dir = path.join(publicDir, ...folder);

  if (!fs.existsSync(dir)) {
    throw new Error(`Image folder not found: ${dir}`);
  }

  const images = collectImageFiles(dir).map(toPublicUrl);

  if (images.length === 0) {
    throw new Error(`Image folder has no supported images: ${dir}`);
  }

  return images;
}

function listingFor(base: BaseProperty, priceType: PriceType, price: number, currency: Currency, index: number) {
  const slug = `${generateSlug(base.titleEs)}-${priceType}`;
  const images = getImages(base.imageFolder);

  return {
    slug,
    titleEs: base.titleEs,
    titleEn: base.titleEn,
    descriptionEs: base.descriptionEs,
    descriptionEn: base.descriptionEn,
    price,
    priceType,
    currency,
    zoneEs: base.zoneEs,
    zoneEn: base.zoneEn,
    cityEs: base.cityEs,
    cityEn: base.cityEn,
    address: base.address,
    province: base.province ?? null,
    country: base.country,
    marketRegion: base.marketRegion,
    postalCode: null,
    addressVisibility: 'zona',
    latitude: null,
    longitude: null,
    type: base.type,
    status: 'disponible',
    published: true,
    featured: priceType === 'venta',
    featuredBeforeUnpublish: false,
    bedrooms: base.bedrooms,
    bathrooms: base.bathrooms,
    area: base.builtArea,
    totalArea: base.totalArea,
    builtArea: base.builtArea,
    yearBuilt: null,
    expenses: null,
    parking: base.parking,
    internalCode: `DH-${String(index).padStart(3, '0')}-${priceType.toUpperCase()}`,
    agentName: 'Calafate Propiedades',
    agentPhone: '+56 9 9541 7524',
    agentEmail: 'calafatepropiedadesloslagos@gmail.com',
    frontage: null,
    depth: null,
    zoning: null,
    services: JSON.stringify([]),
    amenities: JSON.stringify(base.amenities),
    images: JSON.stringify(images),
    coverImage: images[0],
  };
}

const properties: BaseProperty[] = [
  {
    titleEs: 'CHAPALA CASA',
    titleEn: 'Chapala House',
    type: 'casa',
    country: 'Mexico',
    marketRegion: 'mexico',
    cityEs: 'Chapala',
    cityEn: 'Chapala',
    zoneEs: 'San Juan Cosala',
    zoneEn: 'San Juan Cosala',
    address: 'Residencial Piedra Grande San Juan Cosala',
    bedrooms: 3,
    bathrooms: 4,
    builtArea: 450,
    totalArea: 400,
    parking: 2,
    descriptionEs: 'Hermosa casa en Chapala disponible en venta y renta, con las mejores vistas del lago de Chapala y espacios pensados para disfrutar al aire libre.',
    descriptionEn: 'Beautiful house in Chapala available for sale and rent, with outstanding views of Lake Chapala and outdoor spaces designed for relaxed living.',
    amenities: ['terrace', 'deck', 'jacuzzi', 'garden', 'balcony'],
    imageFolder: ['Propiedades', 'CHAPALA CASA'],
    sale: { price: 490000, currency: 'USD' },
    rent: { price: 26000, currency: 'MXN' },
  },
  {
    titleEs: 'LAGO LUNA',
    titleEn: 'Lago Luna',
    type: 'apartamento',
    country: 'Mexico',
    marketRegion: 'mexico',
    cityEs: 'Chapala',
    cityEn: 'Chapala',
    zoneEs: 'El Chante',
    zoneEn: 'El Chante',
    address: 'Lago Luna Chantepec Jalisco',
    bedrooms: 2,
    bathrooms: 2,
    builtArea: 120,
    totalArea: 120,
    parking: 1,
    descriptionEs: 'Lindo departamento en Chapala disponible en venta y renta, con vistas privilegiadas al lago de Chapala y amenidades para disfrutar cada dia.',
    descriptionEn: 'Lovely apartment in Chapala available for sale and rent, with privileged views of Lake Chapala and amenities for everyday enjoyment.',
    amenities: ['rooftop', 'pool', 'garden', 'security_24h'],
    imageFolder: ['Propiedades', 'LAGO LUNA CHAPALA'],
    sale: { price: 2150000, currency: 'MXN' },
    rent: { price: 9000, currency: 'MXN' },
  },
  {
    titleEs: 'OCEAN OAXACA',
    titleEn: 'Ocean Oaxaca',
    type: 'casa',
    country: 'Mexico',
    marketRegion: 'mexico',
    cityEs: 'Puerto Escondido',
    cityEn: 'Puerto Escondido',
    zoneEs: 'Zicatela',
    zoneEn: 'Zicatela',
    address: 'Ocean Zicatela Puerto Escondido',
    province: 'Oaxaca',
    bedrooms: 2,
    bathrooms: 2,
    builtArea: 117,
    totalArea: 200,
    parking: 2,
    descriptionEs: 'Villa de lujo en resort 5 estrellas a pie de playa en Zicatela, Puerto Escondido, con amenidades premium para descanso e inversion.',
    descriptionEn: 'Luxury villa in a five-star beachfront resort in Zicatela, Puerto Escondido, with premium amenities for leisure and investment.',
    amenities: ['terrace', 'rooftop', 'pool', 'garden', 'gym', 'sauna', 'clubhouse', 'tennis', 'padel', 'supermarket', 'security_24h'],
    imageFolder: ['Propiedades', 'OCEAN OAXACA'],
    sale: { price: 100000, currency: 'EUR' },
  },
  {
    titleEs: 'PH Zapopan',
    titleEn: 'Zapopan Penthouse',
    type: 'apartamento',
    country: 'Mexico',
    marketRegion: 'mexico',
    cityEs: 'Guadalajara',
    cityEn: 'Guadalajara',
    zoneEs: 'Zapopan',
    zoneEn: 'Zapopan',
    address: 'Bellavista 493 Magna',
    bedrooms: 2,
    bathrooms: 3,
    builtArea: 400,
    totalArea: 400,
    parking: 3,
    descriptionEs: 'Penthouse de lujo con las mejores vistas de Zapopan, amplios espacios y amenidades pensadas para una experiencia residencial premium.',
    descriptionEn: 'Luxury penthouse with some of the best views in Zapopan, generous spaces, and amenities designed for a premium residential experience.',
    amenities: ['rooftop', 'jacuzzi', 'garden', 'balcony', 'security_24h'],
    imageFolder: ['Propiedades', 'PH ZAPOPAN'],
    sale: { price: 12500000, currency: 'MXN' },
    rent: { price: 50000, currency: 'MXN' },
  },
  {
    titleEs: 'VISTA VENTO',
    titleEn: 'Vista Vento',
    type: 'apartamento',
    country: 'Mexico',
    marketRegion: 'mexico',
    cityEs: 'Guadalajara',
    cityEn: 'Guadalajara',
    zoneEs: 'Zapopan',
    zoneEn: 'Zapopan',
    address: 'Vista Vento, Las Cumbres, Zapopan',
    bedrooms: 4,
    bathrooms: 5,
    builtArea: 220,
    totalArea: 220,
    parking: 4,
    descriptionEs: 'Departamento de lujo con las mejores vistas de Zapopan, espacios amplios y amenidades completas para vivir con comodidad y estilo.',
    descriptionEn: 'Luxury apartment with outstanding views of Zapopan, spacious interiors, and complete amenities for comfortable, stylish living.',
    amenities: ['jacuzzi', 'garden', 'balcony', 'pool', 'coworking', 'gym', 'cinema', 'bbq_area', 'security_24h'],
    imageFolder: ['Propiedades', 'VISTA VENTO'],
    sale: { price: 15500000, currency: 'MXN' },
    rent: { price: 60000, currency: 'MXN' },
  },
  {
    titleEs: 'REAL DEL CARMEN',
    titleEn: 'Real del Carmen',
    type: 'casa',
    country: 'Mexico',
    marketRegion: 'mexico',
    cityEs: 'Guadalajara',
    cityEn: 'Guadalajara',
    zoneEs: 'Zapopan',
    zoneEn: 'Zapopan',
    address: 'Real del Carmen Zapopan',
    bedrooms: 4,
    bathrooms: 4,
    builtArea: 170,
    totalArea: 100,
    parking: 2,
    descriptionEs: 'Hermosa casa amueblada en coto privado en Zapopan, cerca de Plaza Andares, con espacios comodos y amenidades para vivir con tranquilidad.',
    descriptionEn: 'Beautiful furnished house in a private gated community in Zapopan, near Plaza Andares, with comfortable spaces and amenities for peaceful living.',
    amenities: ['balcony', 'garden', 'clubhouse', 'security_24h'],
    imageFolder: ['Propiedades', 'REAL DEL CARMEN'],
    sale: { price: 5500000, currency: 'MXN' },
    rent: { price: 28000, currency: 'MXN' },
  },
  {
    titleEs: 'ALTAMIRA SURUBII',
    titleEn: 'Altamira Surubii',
    type: 'apartamento',
    country: 'Paraguay',
    marketRegion: 'latam',
    cityEs: 'Asuncion',
    cityEn: 'Asuncion',
    zoneEs: 'Mariano Roque Alonso',
    zoneEn: 'Mariano Roque Alonso',
    address: 'Altamira Surubii, Mariano Roque Alonso, Py',
    bedrooms: 1,
    bathrooms: 2,
    builtArea: 70,
    totalArea: 70,
    parking: 1,
    descriptionEs: 'Hermoso departamento amueblado en uno de los mejores desarrollos de Asuncion, con amenidades modernas y seguridad 24 horas.',
    descriptionEn: 'Beautiful furnished apartment in one of Asuncion’s best developments, with modern amenities and 24-hour security.',
    amenities: ['balcony', 'garden', 'pool', 'coworking', 'gym', 'bbq_area', 'security_24h'],
    imageFolder: ['Propiedades', 'ALTAMIRA SURUBII'],
    sale: { price: 95000, currency: 'USD' },
    rent: { price: 690, currency: 'USD' },
  },
  {
    titleEs: 'PANTANO SAN JUAN',
    titleEn: 'Pantano San Juan',
    type: 'apartamento',
    country: 'Espana',
    marketRegion: 'espana_europa',
    cityEs: 'Madrid',
    cityEn: 'Madrid',
    zoneEs: 'San Martin de Valdeiglesias',
    zoneEn: 'San Martin de Valdeiglesias',
    address: 'Pantano De San Juan, Apartamentos Pronto Fase 4',
    bedrooms: 1,
    bathrooms: 1,
    builtArea: 50,
    totalArea: 50,
    parking: 2,
    descriptionEs: 'Hermoso apartamento amueblado en la presa de San Juan, ideal para descanso, segunda vivienda o inversion.',
    descriptionEn: 'Beautiful furnished apartment by the San Juan reservoir, ideal for leisure, a second home, or investment.',
    amenities: ['balcony', 'garden', 'pool'],
    imageFolder: ['Propiedades', 'PANTANO SAN JUAN'],
    sale: { price: 95000, currency: 'EUR' },
    rent: { price: 700, currency: 'EUR' },
  },
  {
    titleEs: 'CALPE GALERAMAR',
    titleEn: 'Calpe Galetamar',
    type: 'apartamento',
    country: 'Espana',
    marketRegion: 'espana_europa',
    cityEs: 'Calpe',
    cityEn: 'Calpe',
    zoneEs: 'Alicante',
    zoneEn: 'Alicante',
    address: 'Galetamar Calpe',
    bedrooms: 1,
    bathrooms: 1,
    builtArea: 40,
    totalArea: 40,
    parking: 1,
    descriptionEs: 'Hermoso apartamento amueblado en segunda linea de playa en Calpe, con piscina, jardines y servicios para disfrutar la costa.',
    descriptionEn: 'Beautiful furnished apartment on the second line from the beach in Calpe, with a pool, gardens, and services to enjoy the coast.',
    amenities: ['balcony', 'garden', 'pool', 'lobby', 'beach_bar'],
    imageFolder: ['Propiedades', 'CALPE GALETAMAR'],
    sale: { price: 145000, currency: 'EUR' },
    rent: { price: 900, currency: 'EUR' },
  },
];

async function main() {
  let index = 1;
  const listings = properties.flatMap((property) => {
    const rows = [];

    if (property.sale) {
      rows.push(listingFor(property, 'venta', property.sale.price, property.sale.currency, index++));
    }

    if (property.rent) {
      rows.push(listingFor(property, 'alquiler', property.rent.price, property.rent.currency, index++));
    }

    return rows;
  });

  for (const listing of listings) {
    await prisma.property.upsert({
      where: { slug: listing.slug },
      update: listing,
      create: listing,
    });

    console.log(`Upserted ${listing.slug} (${listing.priceType}) with ${JSON.parse(listing.images).length} images`);
  }

  console.log(`Imported ${listings.length} published property listings.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
