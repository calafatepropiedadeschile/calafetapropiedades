'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Loader2, Star, Trash2, UploadCloud } from 'lucide-react';
import type { FieldErrors, Resolver } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { PropertySchema } from '@/features/properties/property.schemas';
import {
  PROPERTY_COUNTRY_OPTIONS,
  PROPERTY_MARKET_REGION_LABELS,
  PROPERTY_MARKET_REGIONS,
  getMarketRegionForCountry,
  isPropertyMarketRegion,
} from '@/features/properties/property-markets';
import { dictionaries } from '@/lib/i18n/dictionaries';

interface DefaultValues {
  titleEs?: string;
  titleEn?: string | null;
  descriptionEs?: string;
  descriptionEn?: string | null;
  price?: number;
  priceType?: string;
  currency?: string;
  zoneEs?: string;
  zoneEn?: string | null;
  cityEs?: string;
  cityEn?: string | null;
  address?: string | null;
  province?: string | null;
  country?: string | null;
  marketRegion?: string | null;
  postalCode?: string | null;
  addressVisibility?: string;
  latitude?: number | null;
  longitude?: number | null;
  type?: string;
  status?: string;
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
  services?: string[];
  amenities?: string[];
  images?: string[];
  coverImage?: string | null;
  seoTitleEs?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionEs?: string | null;
  seoDescriptionEn?: string | null;
  customCanonical?: string | null;
  ogImage?: string | null;
}

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: DefaultValues;
}

const AMENITY_OPTIONS = [
  { value: 'pool', labelKey: 'property.amenityPool' },
  { value: 'gym', labelKey: 'property.amenityGym' },
  { value: 'security_24h', labelKey: 'property.amenitySecurity24h' },
  { value: 'garden', labelKey: 'property.amenityGarden' },
  { value: 'terrace', labelKey: 'property.amenityTerrace' },
  { value: 'deck', labelKey: 'property.amenityDeck' },
  { value: 'jacuzzi', labelKey: 'property.amenityJacuzzi' },
  { value: 'rooftop', labelKey: 'property.amenityRooftop' },
  { value: 'balcony', labelKey: 'property.amenityBalcony' },
  { value: 'grill', labelKey: 'property.amenityGrill' },
  { value: 'bbq_area', labelKey: 'property.amenityBbqArea' },
  { value: 'laundry', labelKey: 'property.amenityLaundry' },
  { value: 'elevator', labelKey: 'property.amenityElevator' },
  { value: 'doorman', labelKey: 'property.amenityDoorman' },
  { value: 'sum', labelKey: 'property.amenitySum' },
  { value: 'tennis', labelKey: 'property.amenityTennis' },
  { value: 'basketball', labelKey: 'property.amenityBasketball' },
  { value: 'padel', labelKey: 'property.amenityPadel' },
  { value: 'sauna', labelKey: 'property.amenitySauna' },
  { value: 'clubhouse', labelKey: 'property.amenityClubhouse' },
  { value: 'restaurant', labelKey: 'property.amenityRestaurant' },
  { value: 'golf_course', labelKey: 'property.amenityGolfCourse' },
  { value: 'supermarket', labelKey: 'property.amenitySupermarket' },
  { value: 'coworking', labelKey: 'property.amenityCoworking' },
  { value: 'cinema', labelKey: 'property.amenityCinema' },
  { value: 'lobby', labelKey: 'property.amenityLobby' },
  { value: 'beach_bar', labelKey: 'property.amenityBeachBar' },
  { value: 'kids_zone', labelKey: 'property.amenityKidsZone' },
  { value: 'cellar', labelKey: 'property.amenityCellar' },
  { value: 'covered_parking', labelKey: 'property.amenityCoveredParking' },
] as const;

const LAND_SERVICE_OPTIONS = [
  { value: 'water', labelKey: 'property.serviceWater' },
  { value: 'electricity', labelKey: 'property.serviceElectricity' },
  { value: 'gas', labelKey: 'property.serviceGas' },
  { value: 'sewer', labelKey: 'property.serviceSewer' },
  { value: 'internet', labelKey: 'property.serviceInternet' },
  { value: 'asphalt', labelKey: 'property.serviceAsphalt' },
  { value: 'street_lighting', labelKey: 'property.serviceStreetLighting' },
] as const;

const CURRENCY_VALUES = ['USD', 'EUR', 'MXN', 'CLP', 'CLF'] as const;

function resolveCurrency(value: string | undefined) {
  return CURRENCY_VALUES.includes(value as typeof CURRENCY_VALUES[number])
    ? value as typeof CURRENCY_VALUES[number]
    : 'USD';
}

const MAX_IMAGES = 12;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const IMAGE_MAX_DIMENSION = 1800;
const IMAGE_QUALITY = 0.82;

type PropertyFormValues = Omit<z.input<typeof PropertySchema>, 'type'> & {
  type: z.input<typeof PropertySchema>['type'] | '';
};

function splitStreetAddress(address?: string | null) {
  const value = address?.trim() ?? '';
  const match = value.match(/^(.*?)(?:\s+(\d+\w*(?:[-/]\d+\w*)?))$/);

  if (!match) {
    return { streetName: value, streetNumber: '' };
  }

  return {
    streetName: match[1]?.trim() ?? '',
    streetNumber: match[2]?.trim() ?? '',
  };
}

async function resizeImageOnClient(file: File): Promise<File> {
  const image = await createImageBitmap(file);
  const ratio = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    image.close();
    throw new Error('No se pudo preparar la compresion de imagen.');
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);
  image.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error('No se pudo comprimir la imagen.')),
      'image/webp',
      IMAGE_QUALITY
    );
  });

  return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
}

async function uploadToSupabase(file: File): Promise<string> {
  const payload = new FormData();
  payload.append('file', file);

  const response = await fetch('/api/admin/upload-image', {
    method: 'POST',
    body: payload,
  });

  const result = await response.json() as { url?: string; error?: string };

  if (!response.ok || !result.url) {
    throw new Error(result.error ?? 'Supabase rechazo la imagen.');
  }

  return result.url;
}

function toTextareaValue(images: string[]) {
  return images.join('\n');
}

function fromTextareaValue(value: string) {
  return value.split('\n').map((url) => url.trim()).filter(Boolean);
}

function resolveDefaultMarketRegion(country: string | null | undefined, marketRegion: string | null | undefined) {
  return isPropertyMarketRegion(marketRegion) ? marketRegion : getMarketRegionForCountry(country ?? 'Espana');
}

export default function PropertyForm({ action, defaultValues = {} }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [activeLangTab, setActiveLangTab] = useState<'es' | 'en'>('es');
  const initialAddress = useMemo(() => splitStreetAddress(defaultValues.address), [defaultValues.address]);
  const [streetName, setStreetName] = useState(initialAddress.streetName);
  const [streetNumber, setStreetNumber] = useState(initialAddress.streetNumber);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(PropertySchema) as Resolver<PropertyFormValues>,
    defaultValues: {
      titleEs: defaultValues.titleEs ?? '',
      titleEn: defaultValues.titleEn ?? '',
      descriptionEs: defaultValues.descriptionEs ?? '',
      descriptionEn: defaultValues.descriptionEn ?? '',
      price: defaultValues.price ?? 0,
      priceType: defaultValues.priceType === 'alquiler' ? 'alquiler' : 'venta',
      currency: resolveCurrency(defaultValues.currency),
      zoneEs: defaultValues.zoneEs ?? '',
      zoneEn: defaultValues.zoneEn ?? '',
      cityEs: defaultValues.cityEs ?? '',
      cityEn: defaultValues.cityEn ?? '',
      address: defaultValues.address ?? null,
      province: defaultValues.province ?? '',
      country: defaultValues.country ?? 'Espana',
      marketRegion: resolveDefaultMarketRegion(defaultValues.country, defaultValues.marketRegion),
      postalCode: defaultValues.postalCode ?? '',
      addressVisibility: defaultValues.addressVisibility === 'exacta' || defaultValues.addressVisibility === 'aproximada'
        ? defaultValues.addressVisibility
        : 'zona',
      latitude: defaultValues.latitude ?? null,
      longitude: defaultValues.longitude ?? null,
      type: defaultValues.type === 'casa' || defaultValues.type === 'local' || defaultValues.type === 'oficina' || defaultValues.type === 'terreno'
        ? defaultValues.type
        : defaultValues.type === 'apartamento'
          ? 'apartamento'
          : '',
      status: defaultValues.status === 'vendido' || defaultValues.status === 'alquilado' ? defaultValues.status : 'disponible',
      published: defaultValues.published ?? false,
      featured: defaultValues.featured ?? false,
      bedrooms: defaultValues.bedrooms ?? null,
      bathrooms: defaultValues.bathrooms ?? null,
      area: defaultValues.area ?? null,
      totalArea: defaultValues.totalArea ?? null,
      builtArea: defaultValues.builtArea ?? defaultValues.area ?? null,
      yearBuilt: defaultValues.yearBuilt ?? null,
      expenses: defaultValues.expenses ?? null,
      parking: defaultValues.parking ?? null,
      internalCode: defaultValues.internalCode ?? '',
      agentName: defaultValues.agentName ?? '',
      agentPhone: defaultValues.agentPhone ?? '',
      agentEmail: defaultValues.agentEmail ?? '',
      frontage: defaultValues.frontage ?? null,
      depth: defaultValues.depth ?? null,
      zoning: defaultValues.zoning ?? '',
      services: defaultValues.services ?? [],
      amenities: defaultValues.amenities ?? [],
      images: defaultValues.images ?? [],
      coverImage: defaultValues.coverImage ?? null,
      seoTitleEs: defaultValues.seoTitleEs ?? '',
      seoTitleEn: defaultValues.seoTitleEn ?? '',
      seoDescriptionEs: defaultValues.seoDescriptionEs ?? '',
      seoDescriptionEn: defaultValues.seoDescriptionEn ?? '',
      customCanonical: defaultValues.customCanonical ?? '',
      ogImage: defaultValues.ogImage ?? '',
    },
  });

  const images = useWatch({ control, name: 'images' }) ?? [];
  const coverImage = useWatch({ control, name: 'coverImage' }) ?? '';
  const isPublished = useWatch({ control, name: 'published' }) ?? false;
  const selectedType = useWatch({ control, name: 'type' }) ?? '';
  const selectedCountry = useWatch({ control, name: 'country' }) ?? '';

  useEffect(() => {
    const nextAddress = [streetName.trim(), streetNumber.trim()].filter(Boolean).join(' ');
    setValue('address', nextAddress || null, { shouldDirty: true, shouldValidate: true });
  }, [setValue, streetName, streetNumber]);

  useEffect(() => {
    const marketRegion = getMarketRegionForCountry(selectedCountry);
    setValue('marketRegion', marketRegion, { shouldDirty: true, shouldValidate: true });
  }, [selectedCountry, setValue]);

  async function handleImageUpload(files: FileList | null) {
    if (!files?.length) return;

    const selectedFiles = Array.from(files).slice(0, Math.max(0, MAX_IMAGES - images.length));
    const invalidFile = selectedFiles.find((file) => !file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE_BYTES);

    if (invalidFile) {
      setUploadError('Cada archivo debe ser una imagen menor a 10MB.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const resizedFile = await resizeImageOnClient(file);
        const url = await uploadToSupabase(resizedFile);
        uploadedUrls.push(url);
      }

      const nextImages = [...images, ...uploadedUrls].slice(0, MAX_IMAGES);
      setValue('images', nextImages, { shouldDirty: true, shouldValidate: true });

      if (!coverImage && nextImages[0]) {
        setValue('coverImage', nextImages[0], { shouldDirty: true, shouldValidate: true });
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'No se pudieron subir las imagenes.');
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(url: string) {
    const nextImages = images.filter((image) => image !== url);
    setValue('images', nextImages, { shouldDirty: true, shouldValidate: true });

    if (coverImage === url) {
      setValue('coverImage', nextImages[0] ?? null, { shouldDirty: true, shouldValidate: true });
    }
  }

  function selectPrimaryImage(url: string) {
    const nextImages = [url, ...images.filter((image) => image !== url)];
    setValue('coverImage', url, { shouldDirty: true, shouldValidate: true });
    setValue('images', nextImages, { shouldDirty: true, shouldValidate: true });
  }

  function moveImageToGalleryPosition(url: string, targetIndex: 1 | 2) {
    const nextImages = images.filter((image) => image !== url);
    const safeIndex = Math.min(targetIndex, nextImages.length);
    nextImages.splice(safeIndex, 0, url);
    setValue('images', nextImages, { shouldDirty: true, shouldValidate: true });

    if (coverImage === url) {
      setValue('coverImage', nextImages[0] ?? null, { shouldDirty: true, shouldValidate: true });
    }
  }

  function submitForm(_values: PropertyFormValues, event?: React.BaseSyntheticEvent) {
    setFormError('');
    const form = event?.currentTarget instanceof HTMLFormElement
      ? event.currentTarget
      : event?.target instanceof HTMLFormElement
        ? event.target
        : null;

    if (isUploading || !form) return;
    const formData = new FormData(form);

    startTransition(() => {
      void action(formData);
    });
  }

  function handleInvalidForm(formErrors: FieldErrors<PropertyFormValues>) {
    const firstError = Object.values(formErrors)[0];
    const message = typeof firstError?.message === 'string'
      ? firstError.message
      : 'Revisa los campos marcados antes de guardar.';

    setFormError(message);
  }

  return (
    <form
      onSubmit={handleSubmit(submitForm, handleInvalidForm)}
      autoComplete="off"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}
    >
      {formError && (
        <p className="form-error" style={{ fontWeight: 700 }}>
          {formError}
        </p>
      )}
      <section className="admin-form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <h2 className="admin-form-section-title" style={{ margin: 0 }}>Informacion basica</h2>
          <div className="admin-lang-tabs" style={{ display: 'flex', gap: '4px', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '2px', backgroundColor: 'var(--color-surface-2)' }}>
            <button
              type="button"
              onClick={() => setActiveLangTab('es')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeLangTab === 'es' ? 'var(--color-primary)' : 'transparent',
                color: activeLangTab === 'es' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              Espanol
            </button>
            <button
              type="button"
              onClick={() => setActiveLangTab('en')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeLangTab === 'en' ? 'var(--color-primary)' : 'transparent',
                color: activeLangTab === 'en' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              Ingles
            </button>
          </div>
        </div>

        <div className="form-grid form-grid-2">
          {/* Spanish inputs wrapper */}
          <div style={{ display: activeLangTab === 'es' ? 'contents' : 'none' }}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="prop-title-es" className="input-label">Titulo (Espanol) *</label>
              <input id="prop-title-es" className="input" placeholder="Ej: Apartamento moderno con vista" {...register('titleEs')} />
              {errors.titleEs && <p className="form-error">{errors.titleEs.message}</p>}
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="prop-desc-es" className="input-label">Descripcion (Espanol) *</label>
              <textarea id="prop-desc-es" className="textarea" rows={4} placeholder="Describe la propiedad con los datos mas importantes en espanol." {...register('descriptionEs')} />
              {errors.descriptionEs && <p className="form-error">{errors.descriptionEs.message}</p>}
            </div>
          </div>

          {/* Campos de contenido en ingles con textos visibles en espanol. */}
          <div style={{ display: activeLangTab === 'en' ? 'contents' : 'none' }}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="prop-title-en" className="input-label">Titulo en ingles (opcional)</label>
              <input id="prop-title-en" className="input" placeholder="Ej: Modern apartment with view" {...register('titleEn')} />
              {errors.titleEn && <p className="form-error">{errors.titleEn.message}</p>}
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="prop-desc-en" className="input-label">Descripcion en ingles (opcional)</label>
              <textarea id="prop-desc-en" className="textarea" rows={4} placeholder="Escribe la descripcion de la propiedad en ingles." {...register('descriptionEn')} />
              {errors.descriptionEn && <p className="form-error">{errors.descriptionEn.message}</p>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Elige el tipo de inmueble *</label>
            <select className="select" {...register('type')}>
              <option value="" disabled>Selecciona</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="local">Local Comercial</option>
              <option value="oficina">Oficina</option>
              <option value="terreno">Terreno</option>
            </select>
            {errors.type && <p className="form-error">{errors.type.message}</p>}
          </div>

          <div className="input-group">
            <label className="input-label">Estado *</label>
            <select className="select" {...register('status')}>
              <option value="disponible">Disponible</option>
              <option value="vendido">Vendido</option>
              <option value="alquilado">Alquilado</option>
            </select>
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Precio y ubicacion</h2>
        <div className="form-grid form-grid-3">
          <fieldset className="input-group operation-fieldset">
            <legend className="input-label">Operacion *</legend>
            <div className="operation-options">
              <label className="operation-option">
                <input type="radio" value="venta" {...register('priceType')} />
                <span>Venta</span>
              </label>
              <label className="operation-option">
                <input type="radio" value="alquiler" {...register('priceType')} />
                <span>Alquiler</span>
              </label>
            </div>
            {errors.priceType && <p className="form-error">{errors.priceType.message}</p>}
          </fieldset>

          <div className="input-group">
            <label className="input-label">Moneda</label>
            <select className="select" {...register('currency')}>
              <option value="USD">USD (US$)</option>
              <option value="EUR">EUR (EUR)</option>
              <option value="MXN">MXN ($)</option>
              <option value="CLP">CLP ($)</option>
              <option value="CLF">UF (CLF)</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="prop-price" className="input-label">Precio *</label>
            <input id="prop-price" type="number" className="input" min="0" step="any" placeholder="250000" {...register('price', { valueAsNumber: true })} />
            {errors.price && <p className="form-error">{errors.price.message}</p>}
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Ubicacion del inmueble</h2>
        <input type="hidden" {...register('address')} />
        <div className="form-grid form-grid-2">
          {/* Spanish location inputs wrapper */}
          <div style={{ display: activeLangTab === 'es' ? 'contents' : 'none' }}>
            <div className="input-group">
              <label className="input-label">Localidad (Espanol) *</label>
              <input className="input" placeholder="Ej: Buenos Aires" {...register('cityEs')} />
              {errors.cityEs && <p className="form-error">{errors.cityEs.message}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Zona o barrio (Espanol) *</label>
              <input className="input" placeholder="Ej: Palermo" {...register('zoneEs')} />
              {errors.zoneEs && <p className="form-error">{errors.zoneEs.message}</p>}
            </div>
          </div>

          {/* Campos de ubicacion en ingles con textos visibles en espanol. */}
          <div style={{ display: activeLangTab === 'en' ? 'contents' : 'none' }}>
            <div className="input-group">
              <label className="input-label">Localidad en ingles (opcional)</label>
              <input className="input" placeholder="Ej: Buenos Aires" {...register('cityEn')} />
              {errors.cityEn && <p className="form-error">{errors.cityEn.message}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Zona o barrio en ingles (opcional)</label>
              <input className="input" placeholder="Ej: Palermo" {...register('zoneEn')} />
              {errors.zoneEn && <p className="form-error">{errors.zoneEn.message}</p>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Provincia / Region</label>
            <input className="input" placeholder="Ej: Buenos Aires" {...register('province')} />
          </div>

          <div className="input-group">
            <label className="input-label">Pais</label>
            <select className="select" {...register('country')}>
              {PROPERTY_COUNTRY_OPTIONS.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Mercado / region</label>
            <select className="select" {...register('marketRegion')}>
              {PROPERTY_MARKET_REGIONS.map((marketRegion) => (
                <option key={marketRegion} value={marketRegion}>
                  {PROPERTY_MARKET_REGION_LABELS[marketRegion]}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Codigo postal</label>
            <input className="input" placeholder="Ej: C1425" {...register('postalCode')} />
          </div>

          <div className="input-group">
            <label className="input-label">Mostrar direccion</label>
            <select className="select" {...register('addressVisibility')}>
              <option value="zona">Solo zona</option>
              <option value="aproximada">Aproximada</option>
              <option value="exacta">Exacta</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="prop-street-name" className="input-label">Nombre de la via</label>
            <input
              id="prop-street-name"
              className="input"
              placeholder="Ej: Av. Principal"
              value={streetName}
              onChange={(event) => setStreetName(event.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="prop-street-number" className="input-label">Numero de via</label>
            <input
              id="prop-street-number"
              className="input"
              placeholder="Ej: 123"
              value={streetNumber}
              onChange={(event) => setStreetNumber(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Caracteristicas</h2>
        <div className="form-grid form-grid-4">
          <div className="input-group">
            <label className="input-label">Habitaciones</label>
            <input type="number" className="input" min="0" step="1" placeholder="3" {...register('bedrooms', { valueAsNumber: true })} />
          </div>
          <div className="input-group">
            <label className="input-label">Banos</label>
            <input type="number" className="input" min="0" step="1" placeholder="2" {...register('bathrooms', { valueAsNumber: true })} />
          </div>
          <div className="input-group">
            <label className="input-label">Superficie (m2)</label>
            <input type="number" className="input" min="0" step="any" placeholder="120" {...register('builtArea', { valueAsNumber: true })} />
          </div>
          <div className="input-group">
            <label className="input-label">Superficie total (m2)</label>
            <input type="number" className="input" min="0" step="any" placeholder="180" {...register('totalArea', { valueAsNumber: true })} />
          </div>
          <div className="input-group">
            <label className="input-label">Estacionamiento</label>
            <input type="number" className="input" min="0" step="1" placeholder="1" {...register('parking', { valueAsNumber: true })} />
          </div>
          <div className="input-group">
            <label className="input-label">Ano de construccion</label>
            <input type="number" className="input" min="1800" max="2100" step="1" placeholder="2018" {...register('yearBuilt', { valueAsNumber: true })} />
            {errors.yearBuilt && <p className="form-error">{errors.yearBuilt.message}</p>}
          </div>
          <div className="input-group">
            <label className="input-label">Expensas / comunidad</label>
            <input type="number" className="input" min="0" step="any" placeholder="50000" {...register('expenses', { valueAsNumber: true })} />
          </div>
        </div>
      </section>

      {selectedType === 'terreno' && (
        <section className="admin-form-section">
          <h2 className="admin-form-section-title">Datos del terreno</h2>
          <div className="form-grid form-grid-4">
            <div className="input-group">
              <label className="input-label">Frente (m)</label>
              <input type="number" className="input" min="0" step="any" placeholder="10" {...register('frontage', { valueAsNumber: true })} />
            </div>
            <div className="input-group">
              <label className="input-label">Fondo (m)</label>
              <input type="number" className="input" min="0" step="any" placeholder="30" {...register('depth', { valueAsNumber: true })} />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Zonificacion / uso permitido</label>
              <input className="input" placeholder="Ej: Residencial, comercial, rural" {...register('zoning')} />
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-md)' }}>
            <p className="input-label" style={{ marginBottom: 'var(--space-sm)' }}>Servicios disponibles</p>
            <div className="amenity-chip-grid">
              {LAND_SERVICE_OPTIONS.map((service) => (
                <label key={service.value} className="amenity-chip">
                  <input type="checkbox" value={service.value} {...register('services')} />
                  {dictionaries.es.property[service.labelKey.split('.')[1] as keyof typeof dictionaries.es.property]}
                </label>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Gestion interna</h2>
        <div className="form-grid form-grid-4">
          <div className="input-group">
            <label className="input-label">Codigo interno</label>
            <input className="input" placeholder="Ej: DH-001" {...register('internalCode')} />
          </div>
          <div className="input-group">
            <label className="input-label">Agente responsable</label>
            <input className="input" placeholder="Nombre del agente" {...register('agentName')} />
          </div>
          <div className="input-group">
            <label className="input-label">Telefono del agente</label>
            <input className="input" placeholder="+54 11..." {...register('agentPhone')} />
          </div>
          <div className="input-group">
            <label className="input-label">Email del agente</label>
            <input type="email" className="input" placeholder="agente@empresa.com" autoComplete="off" {...register('agentEmail')} />
            {errors.agentEmail && <p className="form-error">{errors.agentEmail.message}</p>}
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Amenidades</h2>
        <div className="amenity-chip-grid">
          {AMENITY_OPTIONS.map((amenity) => (
            <label key={amenity.value} className="amenity-chip">
              <input type="checkbox" value={amenity.value} {...register('amenities')} />
              {dictionaries.es.property[amenity.labelKey.split('.')[1] as keyof typeof dictionaries.es.property]}
            </label>
          ))}
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Fotografias</h2>
        <div className="image-upload-zone">
          <UploadCloud size={30} />
          <div>
            <p style={{ fontWeight: 800 }}>Sube imagenes optimizadas a Supabase Storage</p>
            <p className="text-muted text-sm">Se redimensionan a WebP antes de subir. Maximo {MAX_IMAGES} imagenes.</p>
          </div>
          <label className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
            <ImagePlus size={16} />
            Seleccionar fotos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={isUploading || images.length >= MAX_IMAGES}
              onChange={(event) => {
                void handleImageUpload(event.target.files);
                event.currentTarget.value = '';
              }}
            />
          </label>
        </div>

        {isUploading && (
          <p className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            <Loader2 size={16} className="spin" />
            Optimizando y subiendo imagenes...
          </p>
        )}

        {uploadError && <p className="form-error" style={{ marginTop: 'var(--space-sm)' }}>{uploadError}</p>}

        {images.length > 0 && (
          <div className="image-preview-grid">
            {images.map((url, index) => (
              <div key={url} className={`image-preview-card ${coverImage === url ? 'is-primary' : ''}`}>
                <Image src={url} alt="Imagen de propiedad" fill sizes="160px" style={{ objectFit: 'cover' }} />
                <div className="image-position-badges">
                  {coverImage === url && (
                    <span className="image-position-badge is-primary">
                      <Star size={13} fill="currentColor" />
                      Principal
                    </span>
                  )}
                  {coverImage !== url && index === 1 && (
                    <span className="image-position-badge">Secundaria</span>
                  )}
                  {coverImage !== url && index === 2 && (
                    <span className="image-position-badge">Tercera</span>
                  )}
                </div>
                <div className="image-position-actions">
                  {coverImage !== url && (
                    <button
                      type="button"
                      className="image-position-btn"
                      onClick={() => selectPrimaryImage(url)}
                      aria-label="Usar esta imagen como principal"
                      title="Usar como principal"
                    >
                      <Star size={13} />
                      Principal
                    </button>
                  )}
                  {coverImage !== url && index !== 1 && images.length > 1 && (
                    <button
                      type="button"
                      className="image-position-btn"
                      onClick={() => moveImageToGalleryPosition(url, 1)}
                      aria-label="Usar esta imagen como secundaria"
                      title="Usar como secundaria"
                    >
                      2da
                    </button>
                  )}
                  {coverImage !== url && index !== 2 && images.length > 2 && (
                    <button
                      type="button"
                      className="image-position-btn"
                      onClick={() => moveImageToGalleryPosition(url, 2)}
                      aria-label="Usar esta imagen como tercera"
                      title="Usar como tercera"
                    >
                      3ra
                    </button>
                  )}
                </div>
                <button type="button" className="image-remove-btn" onClick={() => removeImage(url)} aria-label="Eliminar imagen">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="form-grid form-grid-2" style={{ marginTop: 'var(--space-md)' }}>
          <div className="input-group">
            <label className="input-label">URL portada</label>
            <input
              className="input"
              placeholder="https://..."
              value={coverImage ?? ''}
              name="coverImage"
              onChange={(event) => setValue('coverImage', event.target.value || null, { shouldDirty: true, shouldValidate: true })}
            />
            {errors.coverImage && <p className="form-error">{errors.coverImage.message}</p>}
          </div>

          <div className="input-group">
            <label className="input-label">URLs adicionales</label>
            <textarea
              name="images"
              className="textarea"
              rows={4}
              value={toTextareaValue(images)}
              placeholder="https://imagen1.jpg&#10;https://imagen2.jpg"
              onChange={(event) => setValue('images', fromTextareaValue(event.target.value), { shouldDirty: true, shouldValidate: true })}
            />
            {errors.images && <p className="form-error">{errors.images.message}</p>}
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">SEO</h2>
        <div className="form-grid form-grid-2">
          <div style={{ display: activeLangTab === 'es' ? 'contents' : 'none' }}>
            <div className="input-group">
              <label className="input-label">Titulo SEO (Espanol)</label>
              <input className="input" maxLength={70} placeholder="Titulo para Google" {...register('seoTitleEs')} />
              {errors.seoTitleEs && <p className="form-error">{errors.seoTitleEs.message}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Descripcion SEO (Espanol)</label>
              <textarea className="textarea" rows={3} maxLength={170} placeholder="Resumen breve para buscadores." {...register('seoDescriptionEs')} />
              {errors.seoDescriptionEs && <p className="form-error">{errors.seoDescriptionEs.message}</p>}
            </div>
          </div>

          <div style={{ display: activeLangTab === 'en' ? 'contents' : 'none' }}>
            <div className="input-group">
              <label className="input-label">Titulo SEO en ingles</label>
              <input className="input" maxLength={70} placeholder="Search title" {...register('seoTitleEn')} />
              {errors.seoTitleEn && <p className="form-error">{errors.seoTitleEn.message}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Descripcion SEO en ingles</label>
              <textarea className="textarea" rows={3} maxLength={170} placeholder="Short search description." {...register('seoDescriptionEn')} />
              {errors.seoDescriptionEn && <p className="form-error">{errors.seoDescriptionEn.message}</p>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Canonical personalizado</label>
            <input className="input" type="url" placeholder="https://calafatepropiedades.cl/propiedades/..." {...register('customCanonical')} />
            {errors.customCanonical && <p className="form-error">{errors.customCanonical.message}</p>}
          </div>

          <div className="input-group">
            <label className="input-label">Imagen OG personalizada</label>
            <input className="input" type="url" placeholder="https://.../imagen-og.jpg" {...register('ogImage')} />
            {errors.ogImage && <p className="form-error">{errors.ogImage.message}</p>}
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Publicacion</h2>
        <div className="form-toggle-row">
          <label className="form-check">
            <input type="checkbox" {...register('published')} />
            Publicar en el sitio
          </label>
          <label className="form-check">
            <input type="checkbox" {...register('featured')} />
            Destacar en el home
          </label>
        </div>
        {isPublished && images.length === 0 && !coverImage && (
          <p className="form-error" style={{ marginTop: 'var(--space-sm)' }}>
            Para publicar, agrega al menos una fotografia o una URL de portada.
          </p>
        )}
        {errors.featured && (
          <p className="form-error" style={{ marginTop: 'var(--space-sm)' }}>
            {errors.featured.message}
          </p>
        )}
      </section>

      <div className="form-actions">
        <Link href="/admin/propiedades" className="btn btn-outline">
          Cancelar
        </Link>
        <button type="submit" className="btn btn-primary btn-lg" disabled={isPending || isUploading}>
          {isPending ? 'Guardando...' : 'Guardar propiedad'}
        </button>
      </div>
    </form>
  );
}
