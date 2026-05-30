import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';

loadEnvConfig(process.cwd());

type HeicConvert = (options: {
  buffer: Buffer;
  format: 'JPEG';
  quality: number;
}) => Promise<ArrayBuffer | Buffer | Uint8Array>;

const require = createRequire(import.meta.url);
const heicConvert = require('heic-convert') as HeicConvert;

type PropertyType = 'casa' | 'apartamento' | 'local' | 'oficina' | 'terreno';
type PropertyStatus = 'disponible' | 'vendido' | 'alquilado';
type PriceType = 'venta' | 'alquiler';
type Currency = 'USD' | 'EUR' | 'MXN' | 'CLP' | 'CLF';

type PropertyDraft = {
  sourceDir: string;
  slug?: string;
  titleEs?: string;
  titleEn?: string | null;
  descriptionEs?: string;
  descriptionEn?: string | null;
  price?: number;
  priceType?: PriceType;
  currency?: Currency;
  zoneEs?: string;
  zoneEn?: string | null;
  cityEs?: string;
  cityEn?: string | null;
  address?: string | null;
  province?: string | null;
  country?: string | null;
  marketRegion?: string;
  postalCode?: string | null;
  addressVisibility?: 'exacta' | 'aproximada' | 'zona';
  latitude?: number | null;
  longitude?: number | null;
  type?: PropertyType;
  status?: PropertyStatus;
  published?: boolean;
  featured?: boolean;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  totalArea?: number | null;
  builtArea?: number | null;
  yearBuilt?: number | null;
  expenses?: number | null;
  parking?: number | null;
  internalCode?: string | null;
  agentName?: string | null;
  agentPhone?: string | null;
  agentEmail?: string | null;
  frontage?: number | null;
  depth?: number | null;
  zoning?: string | null;
  mapUrl?: string | null;
  virtualTourUrl?: string | null;
  lotSurfaceM2?: number | null;
  totalLots?: number | null;
  availableLots?: number | null;
  stageName?: string | null;
  paymentTerms?: string | null;
  commissionPercent?: number | null;
  operationalExpenses?: string | null;
  reservationAmount?: number | null;
  waterStatus?: string | null;
  electricityStatus?: string | null;
  accessType?: string | null;
  roadType?: string | null;
  hasOwnRol?: boolean;
  availabilityNotes?: string | null;
  commercialNotes?: string | null;
  distanceHighlights?: string[];
  services?: string[];
  amenities?: string[];
  seoTitleEs?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionEs?: string | null;
  seoDescriptionEn?: string | null;
  customCanonical?: string | null;
};

type ManifestProperty = PropertyDraft;

type ResolvedProperty = Omit<PropertyDraft, 'titleEs' | 'descriptionEs' | 'price' | 'zoneEs' | 'cityEs'> & {
  titleEs: string;
  descriptionEs: string;
  price: number;
  zoneEs: string;
  cityEs: string;
};

const DEFAULT_BUCKET = 'inmobiliaria-images';
const DEFAULT_SOURCE_DIR = path.join(process.cwd(), 'public', 'Propiedades');
const DEFAULT_MANIFEST = path.join(process.cwd(), 'scripts', 'calafate-properties.manifest.json');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.heif']);
const VIDEO_EXTENSIONS = new Set(['.mov', '.mp4', '.m4v', '.webm']);

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const skipUpload = args.has('--skip-upload');
const keepHeic = args.has('--keep-heic');

function optionValue(name: string) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

const manifestPath = path.resolve(optionValue('--manifest') ?? DEFAULT_MANIFEST);
const sourceRoot = path.resolve(optionValue('--source') ?? process.env.PROPERTY_SOURCE_DIR ?? DEFAULT_SOURCE_DIR);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;
const bucket = process.env.SUPABASE_STORAGE_BUCKET
  ?? process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET
  ?? DEFAULT_BUCKET;

function encodeStoragePath(storagePath: string) {
  return storagePath.split('/').map(encodeURIComponent).join('/');
}

function sanitizeSegment(segment: string) {
  return segment
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100) || 'asset';
}

function slugify(value: string) {
  return sanitizeSegment(value.replace(/^\d+\s*[-.]\s*/, '').replace(/_+$/g, ''));
}

function contentTypeFor(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.avif') return 'image/avif';
  if (extension === '.heic') return 'image/heic';
  if (extension === '.heif') return 'image/heif';

  return 'application/octet-stream';
}

function isHeic(filePath: string) {
  return ['.heic', '.heif'].includes(path.extname(filePath).toLowerCase());
}

function storagePathForImage(filePath: string, propertySlug: string, index: number) {
  const originalExtension = path.extname(filePath).toLowerCase();
  const extension = isHeic(filePath) && !keepHeic ? '.jpg' : originalExtension;
  const basename = sanitizeSegment(path.basename(filePath, path.extname(filePath)));

  return `properties/calafate/${propertySlug}/${String(index + 1).padStart(3, '0')}-${basename}${extension}`;
}

async function imageBodyForUpload(filePath: string) {
  const input = fs.readFileSync(filePath);

  if (!isHeic(filePath) || keepHeic) {
    return {
      body: input,
      contentType: contentTypeFor(filePath),
      converted: false,
    };
  }

  const converted = await heicConvert({
    buffer: input,
    format: 'JPEG',
    quality: 0.86,
  });
  const body = converted instanceof ArrayBuffer
    ? Buffer.from(new Uint8Array(converted))
    : Buffer.from(converted);

  return {
    body,
    contentType: 'image/jpeg',
    converted: true,
  };
}

function publicStorageUrl(storagePath: string) {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required to build public Storage URLs.');
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeStoragePath(storagePath)}`;
}

function loadManifest() {
  if (!fs.existsSync(manifestPath)) {
    return fs.readdirSync(sourceRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({ sourceDir: entry.name }));
  }

  const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as ManifestProperty[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Manifest must contain at least one property.');
  }

  return parsed;
}

function readZipEntry(zipPath: string, entryName: string) {
  const zip = fs.readFileSync(zipPath);
  let eocdOffset = -1;

  for (let offset = zip.length - 22; offset >= Math.max(0, zip.length - 65557); offset -= 1) {
    if (zip.readUInt32LE(offset) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error(`Invalid DOCX/ZIP file: ${zipPath}`);
  }

  const totalEntries = zip.readUInt16LE(eocdOffset + 10);
  let centralDirectoryOffset = zip.readUInt32LE(eocdOffset + 16);

  for (let index = 0; index < totalEntries; index += 1) {
    if (zip.readUInt32LE(centralDirectoryOffset) !== 0x02014b50) {
      throw new Error(`Invalid central directory in ${zipPath}`);
    }

    const compressionMethod = zip.readUInt16LE(centralDirectoryOffset + 10);
    const compressedSize = zip.readUInt32LE(centralDirectoryOffset + 20);
    const fileNameLength = zip.readUInt16LE(centralDirectoryOffset + 28);
    const extraLength = zip.readUInt16LE(centralDirectoryOffset + 30);
    const commentLength = zip.readUInt16LE(centralDirectoryOffset + 32);
    const localHeaderOffset = zip.readUInt32LE(centralDirectoryOffset + 42);
    const fileNameStart = centralDirectoryOffset + 46;
    const fileName = zip.toString('utf8', fileNameStart, fileNameStart + fileNameLength);

    if (fileName === entryName) {
      if (zip.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
        throw new Error(`Invalid local header in ${zipPath}`);
      }

      const localNameLength = zip.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = zip.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = zip.subarray(dataStart, dataStart + compressedSize);

      if (compressionMethod === 0) return compressed.toString('utf8');
      if (compressionMethod === 8) return inflateRawSync(compressed).toString('utf8');

      throw new Error(`Unsupported DOCX compression method ${compressionMethod} in ${zipPath}`);
    }

    centralDirectoryOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  throw new Error(`DOCX entry ${entryName} not found in ${zipPath}`);
}

function decodeXml(text: string) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function docxXmlToText(xml: string) {
  return decodeXml(
    xml
      .replace(/<\/w:p>/g, '\n')
      .replace(/<\/w:tr>/g, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function findDocxFile(propertyDir: string) {
  return fs.readdirSync(propertyDir, { withFileTypes: true })
    .find((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.docx'));
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function stripAccents(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const FIELD_BOUNDARY = '(?:Titulo|Nombre|Tipo|Operacion|Ubicacion|Link|Valores|CARACTERISTICAS|Medidas|Descripcion|Facilidad de pago|Informacion adicional|PORTALES INMOBILIARIOS|TEXTO|Texto)';

function captureField(text: string, label: string) {
  const match = new RegExp(`${label}\\s*:\\s*(.*?)(?=\\s+${FIELD_BOUNDARY}\\s*:|\\s+${FIELD_BOUNDARY}\\b|$)`, 'i').exec(text);
  return match ? normalizeSpaces(match[1]) : null;
}

function parseNumberValue(value: string) {
  const normalized = value.replace(/[^\d.,]/g, '').trim();
  if (!normalized) return null;

  if (/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(normalized)) {
    return Number(normalized.replace(/\./g, '').replace(',', '.'));
  }

  if (/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(normalized)) {
    return Number(normalized.replace(/,/g, ''));
  }

  return Number(normalized.replace(',', '.'));
}

function parsePriceFromText(text: string): { price: number; currency: Currency } | null {
  const values = captureField(text, 'Valores') ?? text;
  const ufMatch = /(?:desde\s*)?([\d.,]+)\s*UF\b/i.exec(values);

  if (ufMatch) {
    const price = parseNumberValue(ufMatch[1]);
    if (price && price > 0) return { price, currency: 'CLF' };
  }

  const clpMatch = /\$\s*([\d.,]+)/.exec(values);

  if (clpMatch) {
    const price = parseNumberValue(clpMatch[1]);
    if (price && price > 0) return { price, currency: 'CLP' };
  }

  const numericMatch = /\b(\d{1,3}(?:\.\d{3})+)\b/.exec(values);

  if (numericMatch) {
    const price = parseNumberValue(numericMatch[1]);
    if (price && price > 0) return { price, currency: 'CLP' };
  }

  return null;
}

function parseTotalArea(text: string) {
  const measures = captureField(text, 'Medidas') ?? text;
  const match = /([\d.,]+)\s*m(?:2|\u00b2)\b/i.exec(measures);
  const area = match ? parseNumberValue(match[1]) : null;
  return area && area > 0 ? area : null;
}

function parseFirstUrl(text: string, pattern: RegExp) {
  const match = pattern.exec(text);
  return match?.[0]?.replace(/[).,;]+$/, '') ?? null;
}

function parseTotalLots(text: string) {
  const stageMatches = Array.from(text.matchAll(/Etapa\s*\d+\s*:\s*(\d+)\s+parcelas/gi))
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value));

  if (stageMatches.length > 0) {
    return stageMatches.reduce((total, value) => total + value, 0);
  }

  const match = /(?:proyecto de|contempla|considera)\s+(\d+)\s+parcelas/i.exec(text);
  return match ? Number(match[1]) : null;
}

function parseAvailableLots(text: string) {
  const explicit = /Disponibilidad\s*:\s*(\d+)\s+unidades/i.exec(text);
  if (explicit) return Number(explicit[1]);

  const availableBlock = /Disponibles\s*:\s*([\s\S]*?)(?:PORTALES|Texto|$)/i.exec(text)?.[1];
  if (!availableBlock) return null;

  const parcelMatches = availableBlock.match(/Parcela\s+\d+/gi);
  return parcelMatches?.length ?? null;
}

function parseCommissionPercent(text: string) {
  const match = /comisi[oó]n\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*%/i.exec(text);
  return match ? parseNumberValue(match[1]) : null;
}

function parseReservationAmount(text: string) {
  const match = /Reserva\s*:\s*\$?\s*([\d.,]+)/i.exec(text);
  return match ? parseNumberValue(match[1]) : null;
}

function parseDistanceHighlights(text: string) {
  return Array.from(text.matchAll(/A\s+(?:prox\.\s*)?[^.\n-]{3,90}/gi))
    .map((match) => normalizeSpaces(match[0]))
    .filter((value, index, items) => items.indexOf(value) === index)
    .slice(0, 6);
}

function parseInfrastructure(text: string) {
  const normalized = stripAccents(text).toLowerCase();

  return {
    hasOwnRol: /\brol propio\b/i.test(normalized),
    waterStatus: normalized.includes('agua potable')
      ? 'Agua potable'
      : normalized.includes('pozo')
        ? 'Agua mediante pozo / factibilidad'
        : null,
    electricityStatus: normalized.includes('electricidad') || normalized.includes('luz')
      ? normalized.includes('factibilidad') || normalized.includes('100 metros')
        ? 'Factibilidad electrica / empalme a gestionar'
        : 'Electricidad disponible'
      : null,
    accessType: normalized.includes('camino publico')
      ? 'Camino publico'
      : normalized.includes('acceso autorizado')
        ? 'Acceso autorizado'
        : normalized.includes('acceso')
          ? 'Acceso disponible'
          : null,
    roadType: normalized.includes('ripiado')
      ? 'Caminos ripiados compactados'
      : normalized.includes('estabilizado')
        ? 'Camino estabilizado'
        : normalized.includes('caminos interiores')
          ? 'Caminos interiores'
          : null,
  };
}

function parseLocation(location: string | null) {
  if (!location) {
    return { zoneEs: null, cityEs: null, province: null };
  }

  const cleanLocation = normalizeSpaces(location.replace(/https?:\/\/\S+/g, ''));
  const parts = cleanLocation
    .split(',')
    .map((part) => normalizeSpaces(part))
    .filter(Boolean);
  const province = [...parts].reverse().find((part) => /region|provincia/i.test(stripAccents(part))) ?? parts.at(-1) ?? null;
  const city = parts.length >= 2 ? parts[parts.length - 2] : parts[0] ?? null;
  const zone = parts.length >= 3 ? parts[0] : city;

  return {
    zoneEs: zone,
    cityEs: city,
    province,
  };
}

function parseDescription(text: string, title: string) {
  const markers = ['PORTALES INMOBILIARIOS', 'TEXTO', 'Texto:'];
  const markerIndex = markers
    .map((marker) => text.toUpperCase().indexOf(marker.toUpperCase()))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  const rawDescription = markerIndex == null ? text : text.slice(markerIndex);
  const titleIndex = rawDescription.toLowerCase().indexOf(title.toLowerCase());
  const description = titleIndex >= 0 ? rawDescription.slice(titleIndex) : rawDescription;

  return normalizeSpaces(description)
    .replace(/^Texto:\s*/i, '')
    .slice(0, 4500);
}

function parseDocxProperty(sourceDir: string): PropertyDraft {
  const propertyDir = path.join(sourceRoot, sourceDir);
  const docxFile = findDocxFile(propertyDir);

  if (!docxFile) {
    throw new Error(`No DOCX metadata file found in ${propertyDir}`);
  }

  const docxPath = path.join(propertyDir, docxFile.name);
  const text = docxXmlToText(readZipEntry(docxPath, 'word/document.xml'));
  const flatText = normalizeSpaces(text);
  const searchableText = stripAccents(flatText);
  const title = captureField(searchableText, 'Titulo') ?? captureField(searchableText, 'Nombre') ?? slugify(sourceDir).replace(/-/g, ' ');
  const price = parsePriceFromText(searchableText);
  const location = parseLocation(captureField(searchableText, 'Ubicacion'));
  const totalArea = parseTotalArea(searchableText);
  const mapUrl = parseFirstUrl(text, /https?:\/\/(?:maps\.app\.goo\.gl|www\.google\.com\/maps|google\.com\/maps)[^\s)]+/i);
  const virtualTourUrl = parseFirstUrl(text, /https?:\/\/vtour\.cl\/[^\s)]+/i);
  const infrastructure = parseInfrastructure(text);
  const type = captureField(searchableText, 'Tipo')?.toLowerCase().includes('terreno') ? 'terreno' : undefined;
  const operation = captureField(searchableText, 'Operacion')?.toLowerCase().includes('alquiler') ? 'alquiler' : 'venta';

  return {
    sourceDir,
    titleEs: title,
    descriptionEs: parseDescription(text, title),
    price: price?.price,
    currency: price?.currency,
    priceType: operation,
    zoneEs: location.zoneEs ?? undefined,
    cityEs: location.cityEs ?? undefined,
    province: location.province,
    country: 'Chile',
    marketRegion: 'latam',
    type,
    totalArea,
    lotSurfaceM2: totalArea,
    totalLots: parseTotalLots(text),
    availableLots: parseAvailableLots(text),
    mapUrl,
    virtualTourUrl,
    paymentTerms: captureField(text, 'Facilidad de pago'),
    commissionPercent: parseCommissionPercent(text),
    operationalExpenses: /gastos operacionales/i.test(text) ? 'Gastos operacionales segun proyecto' : null,
    reservationAmount: parseReservationAmount(text),
    distanceHighlights: parseDistanceHighlights(text),
    ...infrastructure,
  };
}

function findFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function findPropertyMedia(sourceDir: string) {
  const propertyDir = path.join(sourceRoot, sourceDir);

  if (!fs.existsSync(propertyDir)) {
    throw new Error(`Property folder not found: ${propertyDir}`);
  }

  const allFiles = findFiles(propertyDir);
  const images = allFiles
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  const videos = allFiles
    .filter((file) => VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

  return { images, videos };
}

async function readSupabaseError(response: Response) {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    return parsed.message ?? parsed.error ?? text;
  } catch {
    return text;
  }
}

async function uploadImage(filePath: string, propertySlug: string, index: number) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to upload images.');
  }

  const storagePath = storagePathForImage(filePath, propertySlug, index);
  const uploadBody = await imageBodyForUpload(filePath);
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${encodeStoragePath(storagePath)}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Cache-Control': '31536000',
      'Content-Type': uploadBody.contentType,
      'x-upsert': 'true',
    },
    body: uploadBody.body,
  });

  if (!response.ok) {
    const message = await readSupabaseError(response);
    throw new Error(`Supabase rejected ${filePath}: ${message}`);
  }

  if (uploadBody.converted) {
    console.log(`Converted HEIC to JPG: ${path.basename(filePath)} -> ${path.basename(storagePath)}`);
  }

  return publicStorageUrl(storagePath);
}

async function connectPrisma() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to upsert properties.');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  return { prisma, pool };
}

function resolveProperty(docxProperty: PropertyDraft, manifestProperty: ManifestProperty): ResolvedProperty {
  const merged = {
    ...docxProperty,
    ...manifestProperty,
  };
  const missing = [
    ['titleEs', merged.titleEs],
    ['descriptionEs', merged.descriptionEs],
    ['price', merged.price],
    ['zoneEs', merged.zoneEs],
    ['cityEs', merged.cityEs],
  ].filter(([, value]) => value === null || value === undefined || value === '');

  if (missing.length > 0) {
    throw new Error(`${merged.sourceDir} is missing required metadata: ${missing.map(([key]) => key).join(', ')}`);
  }

  return merged as ResolvedProperty;
}

function propertyData(property: ResolvedProperty, images: string[]) {
  return {
    slug: property.slug ?? slugify(property.titleEs),
    titleEs: property.titleEs,
    titleEn: property.titleEn ?? null,
    descriptionEs: property.descriptionEs,
    descriptionEn: property.descriptionEn ?? null,
    price: property.price,
    priceType: property.priceType ?? 'venta',
    currency: property.currency ?? 'CLP',
    zoneEs: property.zoneEs,
    zoneEn: property.zoneEn ?? null,
    cityEs: property.cityEs,
    cityEn: property.cityEn ?? null,
    address: property.address ?? null,
    province: property.province ?? null,
    country: property.country ?? 'Chile',
    marketRegion: property.marketRegion ?? 'latam',
    postalCode: property.postalCode ?? null,
    addressVisibility: property.addressVisibility ?? 'zona',
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
    type: property.type ?? 'terreno',
    status: property.status ?? 'disponible',
    published: property.published ?? images.length > 0,
    featured: property.featured ?? false,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    area: property.area ?? property.builtArea ?? property.totalArea ?? null,
    totalArea: property.totalArea ?? null,
    builtArea: property.builtArea ?? null,
    yearBuilt: property.yearBuilt ?? null,
    expenses: property.expenses ?? null,
    parking: property.parking ?? null,
    internalCode: property.internalCode ?? null,
    agentName: property.agentName ?? null,
    agentPhone: property.agentPhone ?? null,
    agentEmail: property.agentEmail ?? null,
    frontage: property.frontage ?? null,
    depth: property.depth ?? null,
    zoning: property.zoning ?? null,
    mapUrl: property.mapUrl ?? null,
    virtualTourUrl: property.virtualTourUrl ?? null,
    lotSurfaceM2: property.lotSurfaceM2 ?? property.totalArea ?? null,
    totalLots: property.totalLots ?? null,
    availableLots: property.availableLots ?? null,
    stageName: property.stageName ?? null,
    paymentTerms: property.paymentTerms ?? null,
    commissionPercent: property.commissionPercent ?? null,
    operationalExpenses: property.operationalExpenses ?? null,
    reservationAmount: property.reservationAmount ?? null,
    waterStatus: property.waterStatus ?? null,
    electricityStatus: property.electricityStatus ?? null,
    accessType: property.accessType ?? null,
    roadType: property.roadType ?? null,
    hasOwnRol: property.hasOwnRol ?? false,
    availabilityNotes: property.availabilityNotes ?? null,
    commercialNotes: property.commercialNotes ?? null,
    distanceHighlights: JSON.stringify(property.distanceHighlights ?? []),
    services: JSON.stringify(property.services ?? []),
    amenities: JSON.stringify(property.amenities ?? []),
    images: JSON.stringify(images),
    coverImage: images[0] ?? null,
    seoTitleEs: property.seoTitleEs ?? property.titleEs,
    seoTitleEn: property.seoTitleEn ?? null,
    seoDescriptionEs: property.seoDescriptionEs ?? null,
    seoDescriptionEn: property.seoDescriptionEn ?? null,
    customCanonical: property.customCanonical ?? null,
    ogImage: images[0] ?? null,
  };
}

async function main() {
  const manifest = loadManifest();
  let prismaConnection: Awaited<ReturnType<typeof connectPrisma>> | null = null;

  if (!dryRun) {
    prismaConnection = await connectPrisma();
  }

  let uploadedImages = 0;
  let migratedProperties = 0;

  try {
    for (const item of manifest) {
      const docxProperty = parseDocxProperty(item.sourceDir);
      const property = resolveProperty(docxProperty, item);
      const slug = property.slug ?? slugify(property.titleEs);
      const media = findPropertyMedia(item.sourceDir);

      if (media.videos.length > 0) {
        console.log(`Skipping ${media.videos.length} video files for ${slug}.`);
      }

      const heicCount = media.images.filter(isHeic).length;

      if (heicCount > 0) {
        const action = keepHeic ? 'They will be uploaded as-is.' : 'They will be converted to JPG before upload.';
        console.log(`Note: ${slug} includes ${heicCount} HEIC/HEIF images. ${action}`);
      }

      if (dryRun) {
        console.log(`[dry-run] ${slug}: ${property.titleEs} | ${property.price} ${property.currency ?? 'CLP'} | ${property.cityEs} | ${media.images.length} images, ${media.videos.length} videos ignored.`);
        continue;
      }

      const imageUrls = [];

      for (const [index, file] of media.images.entries()) {
        imageUrls.push(
          skipUpload
            ? publicStorageUrl(storagePathForImage(file, slug, index))
            : await uploadImage(file, slug, index)
        );
      }

      if (!skipUpload) {
        uploadedImages += imageUrls.length;
      }

      const data = propertyData({ ...property, slug }, imageUrls);

      await prismaConnection?.prisma.property.upsert({
        where: { slug },
        create: data,
        update: data,
      });

      migratedProperties += 1;
      console.log(`Migrated ${slug}: ${imageUrls.length} images.`);
    }
  } finally {
    await prismaConnection?.prisma.$disconnect();
    await prismaConnection?.pool.end();
  }

  if (dryRun) {
    console.log(`Dry run completed for ${manifest.length} properties from ${sourceRoot}.`);
    return;
  }

  console.log(`Uploaded ${uploadedImages} images to Supabase Storage bucket "${bucket}".`);
  console.log(`Upserted ${migratedProperties} properties in Supabase Postgres.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
