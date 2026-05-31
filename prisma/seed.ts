import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';
import { generateSlug } from '../src/lib/utils/formatters';

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  throw new Error('DATABASE_URL must be a PostgreSQL connection string. Use your Supabase pooled or direct URL before running the seed.');
}

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required to seed the admin user.`);
  }
  return value;
}

const adminEmail = requireEnv('ADMIN_EMAIL');
const adminPassword = requireEnv('ADMIN_PASSWORD');

const properties = [
  {
    titleEs: 'Apartamento moderno en Palermo con vista panoramica',
    titleEn: 'Modern apartment in Palermo with panoramic view',
    descriptionEs: 'Luminoso apartamento de categoria con balcon, amenities premium y excelente conectividad.',
    descriptionEn: 'Bright luxury apartment with balcony, premium amenities, and excellent transit.',
    price: 250000,
    priceType: 'venta',
    currency: 'USD',
    zoneEs: 'Palermo',
    zoneEn: 'Palermo',
    cityEs: 'Buenos Aires',
    cityEn: 'Buenos Aires',
    address: 'Av. Santa Fe 3200',
    country: 'Argentina',
    marketRegion: 'latam',
    latitude: -34.5889,
    longitude: -58.4222,
    type: 'apartamento',
    status: 'disponible',
    published: true,
    featured: true,
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    parking: 1,
    amenities: JSON.stringify(['pool', 'gym', 'security_24h', 'balcony']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
    ]),
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
  },
  {
    titleEs: 'Casa familiar con jardin en Belgrano',
    titleEn: 'Family home with garden in Belgrano',
    descriptionEs: 'Casa amplia con ambientes generosos, jardin privado, parrilla y cochera cubierta.',
    descriptionEn: 'Spacious home with generous spaces, private garden, barbecue, and covered garage.',
    price: 520000,
    priceType: 'venta',
    currency: 'USD',
    zoneEs: 'Belgrano',
    zoneEn: 'Belgrano',
    cityEs: 'Buenos Aires',
    cityEn: 'Buenos Aires',
    address: 'Mendoza 1800',
    country: 'Argentina',
    marketRegion: 'latam',
    latitude: -34.5627,
    longitude: -58.4566,
    type: 'casa',
    status: 'disponible',
    published: true,
    featured: true,
    bedrooms: 4,
    bathrooms: 3,
    area: 260,
    parking: 2,
    amenities: JSON.stringify(['garden', 'grill', 'covered_parking']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6',
    ]),
    coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
  },
  {
    titleEs: 'Casa amoblada en arriendo en Puerto Varas',
    titleEn: 'Furnished house for rent in Puerto Varas',
    descriptionEs: 'Casa habitable con buena conectividad, ideal para temporada o arriendo mensual. Consulta disponibilidad y condiciones con el equipo comercial.',
    descriptionEn: 'Livable home with good connectivity, ideal for seasonal or monthly rent. Contact us for availability and terms.',
    price: 850000,
    priceType: 'arriendo',
    currency: 'CLP',
    zoneEs: 'Puerto Varas',
    zoneEn: 'Puerto Varas',
    cityEs: 'Puerto Varas',
    cityEn: 'Puerto Varas',
    address: 'Sector alta vista',
    country: 'Chile',
    marketRegion: 'latam',
    latitude: -41.3195,
    longitude: -72.9854,
    type: 'casa',
    status: 'disponible',
    published: true,
    featured: false,
    bedrooms: 3,
    bathrooms: 2,
    area: 95,
    parking: 1,
    amenities: JSON.stringify(['garden', 'covered_parking']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    ]),
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
    },
  });

  for (const property of properties) {
    await prisma.property.upsert({
      where: { slug: generateSlug(property.titleEs) },
      update: property,
      create: {
        ...property,
        slug: generateSlug(property.titleEs),
      },
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
