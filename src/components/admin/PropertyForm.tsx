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
import PropertyCatalogPublishChecklist from '@/components/admin/PropertyCatalogPublishChecklist';
import type { CatalogPublishChecklistInput } from '@/features/properties/property-catalog-checklist';
import {
  LAND_AMENITY_OPTIONS,
  LAND_SERVICE_OPTIONS,
} from '@/features/properties/property-land-options';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImageCard } from './SortableImageCard';

interface DefaultValues {
  titleEs?: string;
  titleEn?: string | null;
  descriptionEs?: string;
  descriptionEn?: string | null;
  price?: number;
  priceFrom?: boolean;
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
  agentId?: string | null;
  agentName?: string | null;
  agentPhone?: string | null;
  agentEmail?: string | null;
  frontage?: number | null;
  depth?: number | null;
  zoning?: string | null;
  mapUrl?: string | null;
  virtualTourUrl?: string | null;
  youtubeUrl?: string | null;
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
  images?: string[];
  coverImage?: string | null;
  sortOrder?: number | null;
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
  propertyId?: string;
  slug?: string;
  agents?: { id: string; name: string }[];
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

const CURRENCY_VALUES = ['CLP', 'CLF', 'USD'] as const;

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

function fromTextLinesValue(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function resolveDefaultMarketRegion(country: string | null | undefined, marketRegion: string | null | undefined) {
  return isPropertyMarketRegion(marketRegion) ? marketRegion : getMarketRegionForCountry(country ?? 'Chile');
}

export default function PropertyForm({ action, defaultValues = {}, propertyId, slug: initialSlug = '', agents = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [activeLangTab, setActiveLangTab] = useState<'es' | 'en'>('es');
  const initialAddress = useMemo(() => splitStreetAddress(defaultValues.address), [defaultValues.address]);
  const [streetName, setStreetName] = useState(initialAddress.streetName);
  const [streetNumber, setStreetNumber] = useState(initialAddress.streetNumber);
  const [slugValue, setSlugValue] = useState(initialSlug);

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
      priceFrom: defaultValues.priceFrom ?? false,
      priceType: defaultValues.priceType === 'arriendo' ? 'arriendo' : 'venta',
      currency: resolveCurrency(defaultValues.currency ?? 'CLP'),
      zoneEs: defaultValues.zoneEs ?? '',
      zoneEn: defaultValues.zoneEn ?? '',
      cityEs: defaultValues.cityEs ?? '',
      cityEn: defaultValues.cityEn ?? '',
      address: defaultValues.address ?? null,
      province: defaultValues.province ?? '',
      country: defaultValues.country ?? 'Chile',
      marketRegion: resolveDefaultMarketRegion(defaultValues.country, defaultValues.marketRegion),
      postalCode: defaultValues.postalCode ?? '',
      addressVisibility: defaultValues.addressVisibility === 'exacta' || defaultValues.addressVisibility === 'aproximada'
        ? defaultValues.addressVisibility
        : 'zona',
      latitude: defaultValues.latitude ?? null,
      longitude: defaultValues.longitude ?? null,
      type: defaultValues.type === 'casa' || defaultValues.type === 'terreno'
        ? defaultValues.type
        : 'terreno',
      status: defaultValues.status === 'vendido' ? defaultValues.status : 'disponible',
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
      agentId: defaultValues.agentId ?? '',
      agentName: defaultValues.agentName ?? '',
      agentPhone: defaultValues.agentPhone ?? '',
      agentEmail: defaultValues.agentEmail ?? '',
      frontage: defaultValues.frontage ?? null,
      depth: defaultValues.depth ?? null,
      zoning: defaultValues.zoning ?? '',
      mapUrl: defaultValues.mapUrl ?? '',
      virtualTourUrl: defaultValues.virtualTourUrl ?? '',
      youtubeUrl: defaultValues.youtubeUrl ?? '',
      lotSurfaceM2: defaultValues.lotSurfaceM2 ?? defaultValues.totalArea ?? null,
      totalLots: defaultValues.totalLots ?? null,
      availableLots: defaultValues.availableLots ?? null,
      stageName: defaultValues.stageName ?? '',
      paymentTerms: defaultValues.paymentTerms ?? '',
      commissionPercent: defaultValues.commissionPercent ?? null,
      operationalExpenses: defaultValues.operationalExpenses ?? '',
      reservationAmount: defaultValues.reservationAmount ?? null,
      waterStatus: defaultValues.waterStatus ?? '',
      electricityStatus: defaultValues.electricityStatus ?? '',
      accessType: defaultValues.accessType ?? '',
      roadType: defaultValues.roadType ?? '',
      hasOwnRol: defaultValues.hasOwnRol ?? false,
      availabilityNotes: defaultValues.availabilityNotes ?? '',
      commercialNotes: defaultValues.commercialNotes ?? '',
      distanceHighlights: defaultValues.distanceHighlights ?? [],
      services: defaultValues.services ?? [],
      amenities: defaultValues.amenities ?? [],
      images: defaultValues.images ?? [],
      coverImage: defaultValues.coverImage ?? '',
      sortOrder: defaultValues.sortOrder ?? 0,
      seoTitleEs: defaultValues.seoTitleEs ?? '',
      seoTitleEn: defaultValues.seoTitleEn ?? '',
      seoDescriptionEs: defaultValues.seoDescriptionEs ?? '',
      seoDescriptionEn: defaultValues.seoDescriptionEn ?? '',
      customCanonical: defaultValues.customCanonical ?? '',
      ogImage: defaultValues.ogImage ?? '',
    },
  });

  const watchedImages = useWatch({ control, name: 'images' });
  const images = useMemo(() => watchedImages ?? [], [watchedImages]);
  const coverImage = useWatch({ control, name: 'coverImage' }) ?? '';
  const distanceHighlights = useWatch({ control, name: 'distanceHighlights' }) ?? [];
  const isPublished = useWatch({ control, name: 'published' }) ?? false;
  const selectedType = useWatch({ control, name: 'type' }) ?? '';
  const selectedPriceType = useWatch({ control, name: 'priceType' }) ?? 'venta';
  const soldStatusLabel = selectedPriceType === 'arriendo' ? 'Arrendado' : 'Vendido';
  const selectedCountry = useWatch({ control, name: 'country' }) ?? '';
  const catalogChecklistValues = useWatch({
    control,
    name: [
      'type',
      'price',
      'titleEs',
      'descriptionEs',
      'cityEs',
      'zoneEs',
      'lotSurfaceM2',
      'totalArea',
      'area',
      'builtArea',
      'totalLots',
      'availableLots',
    ],
  });
  const catalogChecklistInput = useMemo<CatalogPublishChecklistInput>(() => ({
    type: catalogChecklistValues[0] ?? selectedType,
    price: catalogChecklistValues[1] as number | null | undefined,
    titleEs: catalogChecklistValues[2],
    descriptionEs: catalogChecklistValues[3],
    cityEs: catalogChecklistValues[4],
    zoneEs: catalogChecklistValues[5],
    lotSurfaceM2: catalogChecklistValues[6] as number | null | undefined,
    totalArea: catalogChecklistValues[7] as number | null | undefined,
    area: catalogChecklistValues[8] as number | null | undefined,
    builtArea: catalogChecklistValues[9] as number | null | undefined,
    totalLots: catalogChecklistValues[10] as number | null | undefined,
    availableLots: catalogChecklistValues[11] as number | null | undefined,
    images,
    coverImage,
  }), [catalogChecklistValues, selectedType, images, coverImage]);

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
      setUploadError(error instanceof Error ? error.message : 'No se pudieron subir las imágenes.');
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        const nextImages = arrayMove(images, oldIndex, newIndex);
        setValue('images', nextImages, { shouldDirty: true, shouldValidate: true });
      }
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
          <h2 className="admin-form-section-title" style={{ margin: 0 }}>Información basica</h2>
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
              Español
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
              <label htmlFor="prop-title-es" className="input-label">Título (Español) *</label>
              <input id="prop-title-es" className="input" placeholder="Ej: Parcelas Portal Los Muermos" {...register('titleEs')} />
              {errors.titleEs && <p className="form-error">{errors.titleEs.message}</p>}
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="prop-desc-es" className="input-label">Descripción comercial (Español) *</label>
              <p className="text-sm text-muted" style={{ margin: '0 0 var(--space-sm)', lineHeight: 1.55 }}>
                Escribe 2–4 párrafos que vendan la propiedad (ubicación, perfil de comprador, ventaja del proyecto).
                Usa las secciones de terreno, condiciones y servicios para datos técnicos; evita repetir listas largas aquí.
              </p>
              <textarea
                id="prop-desc-es"
                className="textarea"
                rows={6}
                placeholder="Ej: Proyecto de parcelas con vista y acceso pavimentado, pensado para quienes buscan construir a su ritmo en una zona con demanda turistica y residencial..."
                {...register('descriptionEs')}
              />
              {errors.descriptionEs && <p className="form-error">{errors.descriptionEs.message}</p>}
            </div>
          </div>

          {/* Campos de contenido en ingles con textos visibles en español. */}
          <div style={{ display: activeLangTab === 'en' ? 'contents' : 'none' }}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="prop-title-en" className="input-label">Título en ingles (opcional)</label>
              <input id="prop-title-en" className="input" placeholder="Ej: Modern apartment with view" {...register('titleEn')} />
              {errors.titleEn && <p className="form-error">{errors.titleEn.message}</p>}
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="prop-desc-en" className="input-label">Descripción en ingles (opcional)</label>
              <textarea id="prop-desc-en" className="textarea" rows={4} placeholder="Escribe la descripción de la propiedad en ingles." {...register('descriptionEn')} />
              {errors.descriptionEn && <p className="form-error">{errors.descriptionEn.message}</p>}
            </div>
          </div>

          <div className="input-group">
              <label className="input-label">Elige el tipo de publicacion *</label>
            <select className="select" {...register('type')}>
              <option value="" disabled>Selecciona</option>
              <option value="terreno">Terreno</option>
              <option value="casa">Casa</option>
            </select>
            {errors.type && <p className="form-error">{errors.type.message}</p>}
          </div>

          <div className="input-group">
            <label className="input-label">Estado *</label>
            <select className="select" {...register('status')}>
              <option value="disponible">Disponible</option>
              <option value="vendido">{soldStatusLabel}</option>
            </select>
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Precio y ubicación</h2>
        <div className="form-grid form-grid-3">
          <fieldset className="input-group operation-fieldset">
            <legend className="input-label">Operacion *</legend>
            <div className="operation-options">
              <label className="operation-option">
                <input type="radio" value="venta" {...register('priceType')} />
                <span>Venta</span>
              </label>
              <label className="operation-option">
                <input type="radio" value="arriendo" {...register('priceType')} />
                <span>Arriendo</span>
              </label>
            </div>
            {errors.priceType && <p className="form-error">{errors.priceType.message}</p>}
          </fieldset>

          <div className="input-group">
            <label className="input-label">Moneda</label>
            <select className="select" {...register('currency')}>
              <option value="CLP">CLP ($)</option>
              <option value="CLF">UF (CLF)</option>
              <option value="USD">USD (US$)</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="prop-price" className="input-label">Precio desde *</label>
            <input id="prop-price" type="number" className="input" min="0" step="any" placeholder={selectedType === 'terreno' ? '900' : '34990000'} {...register('price', { valueAsNumber: true })} />
            {errors.price && <p className="form-error">{errors.price.message}</p>}
            <label className="form-check" style={{ marginTop: 'var(--space-sm)' }}>
              <input type="checkbox" {...register('priceFrom')} />
              Mostrar como &quot;Desde&quot; en la web (recomendado para UF y proyectos)
            </label>
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Ubicación del inmueble</h2>
        <input type="hidden" {...register('address')} />
        <div className="form-grid form-grid-2">
          {/* Spanish location inputs wrapper */}
          <div style={{ display: activeLangTab === 'es' ? 'contents' : 'none' }}>
            <div className="input-group">
              <label className="input-label">Localidad (Español) *</label>
              <input className="input" placeholder="Ej: Los Muermos" {...register('cityEs')} />
              {errors.cityEs && <p className="form-error">{errors.cityEs.message}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Zona o barrio (Español) *</label>
              <input className="input" placeholder="Ej: Quillahua" {...register('zoneEs')} />
              {errors.zoneEs && <p className="form-error">{errors.zoneEs.message}</p>}
            </div>
          </div>

          {/* Campos de ubicación en ingles con textos visibles en español. */}
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
            <label className="input-label">Region</label>
            <input className="input" placeholder="Ej: Region de Los Lagos" {...register('province')} />
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
            <input type="hidden" value="latam" {...register('marketRegion')} />
            <label className="input-label">Alcance comercial</label>
            <input className="input" value={PROPERTY_MARKET_REGION_LABELS[PROPERTY_MARKET_REGIONS[0]]} readOnly />
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

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Link Google Maps</label>
            <input className="input" type="url" placeholder="https://maps.app.goo.gl/..." {...register('mapUrl')} />
            {errors.mapUrl && <p className="form-error">{errors.mapUrl.message}</p>}
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Tour virtual 360</label>
            <input className="input" type="url" placeholder="https://vtour.cl/360/..." {...register('virtualTourUrl')} />
            {errors.virtualTourUrl && <p className="form-error">{errors.virtualTourUrl.message}</p>}
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Video YouTube</label>
            <input className="input" type="url" placeholder="https://youtube.com/watch?v=..." {...register('youtubeUrl')} />
            {errors.youtubeUrl && <p className="form-error">{errors.youtubeUrl.message}</p>}
          </div>

          <div className="input-group">
            <label className="input-label">Latitud (mapa embebido)</label>
            <input
              type="number"
              className="input"
              step="any"
              placeholder="-41.4693"
              {...register('latitude', { valueAsNumber: true })}
            />
            {errors.latitude && <p className="form-error">{errors.latitude.message}</p>}
          </div>

          <div className="input-group">
            <label className="input-label">Longitud (mapa embebido)</label>
            <input
              type="number"
              className="input"
              step="any"
              placeholder="-72.9424"
              {...register('longitude', { valueAsNumber: true })}
            />
            {errors.longitude && <p className="form-error">{errors.longitude.message}</p>}
          </div>
        </div>
      </section>

      {selectedType === 'casa' && (
        <section className="admin-form-section">
          <h2 className="admin-form-section-title">Caracteristicas de vivienda</h2>
          <div className="form-grid form-grid-4">
            <div className="input-group">
              <label className="input-label">Habitaciones</label>
              <input type="number" className="input" min="0" step="1" placeholder="3" {...register('bedrooms', { valueAsNumber: true })} />
            </div>
            <div className="input-group">
              <label className="input-label">Baños</label>
              <input type="number" className="input" min="0" step="1" placeholder="2" {...register('bathrooms', { valueAsNumber: true })} />
            </div>
            <div className="input-group">
              <label className="input-label">Superficie construida (m2)</label>
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
              <label className="input-label">Gastos comunes</label>
              <input type="number" className="input" min="0" step="any" placeholder="50000" {...register('expenses', { valueAsNumber: true })} />
            </div>
          </div>
        </section>
      )}

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
              <label className="input-label">Zonificación / uso permitido</label>
              <input className="input" placeholder="Ej: Residencial, comercial, rural" {...register('zoning')} />
            </div>
            <div className="input-group">
              <label className="input-label">Superficie por lote (m2)</label>
              <input type="number" className="input" min="0" step="any" placeholder="5000" {...register('lotSurfaceM2', { valueAsNumber: true })} />
            </div>
            <div className="input-group">
              <label className="input-label">Total de lotes</label>
              <input type="number" className="input" min="0" step="1" placeholder="35" {...register('totalLots', { valueAsNumber: true })} />
            </div>
            <div className="input-group">
              <label className="input-label">Lotes disponibles</label>
              <input type="number" className="input" min="0" step="1" placeholder="5" {...register('availableLots', { valueAsNumber: true })} />
            </div>
            <div className="input-group">
              <label className="input-label">Etapa</label>
              <input className="input" placeholder="Ej: Etapa 1 / Etapa 2" {...register('stageName')} />
            </div>
            <div className="input-group">
              <label className="input-label">Agua / factibilidad</label>
              <input className="input" placeholder="Ej: Agua potable / pozo / factibilidad" {...register('waterStatus')} />
            </div>
            <div className="input-group">
              <label className="input-label">Electricidad / empalme</label>
              <input className="input" placeholder="Ej: Empalme electrico / factibilidad" {...register('electricityStatus')} />
            </div>
            <div className="input-group">
              <label className="input-label">Tipo de acceso</label>
              <input className="input" placeholder="Ej: Camino publico / acceso autorizado" {...register('accessType')} />
            </div>
            <div className="input-group">
              <label className="input-label">Camino interior</label>
              <input className="input" placeholder="Ej: Ripiado compactado" {...register('roadType')} />
            </div>
            <label className="form-check" style={{ alignSelf: 'end', paddingBottom: '0.75rem' }}>
              <input type="checkbox" {...register('hasOwnRol')} />
              Rol propio
            </label>
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
        <h2 className="admin-form-section-title">Condiciones comerciales del loteo</h2>
        <div className="form-grid form-grid-3">
          <div className="input-group">
            <label className="input-label">Comision (%)</label>
            <input type="number" className="input" min="0" step="any" placeholder="3" {...register('commissionPercent', { valueAsNumber: true })} />
          </div>
          <div className="input-group">
            <label className="input-label">Reserva</label>
            <input type="number" className="input" min="0" step="any" placeholder="350000" {...register('reservationAmount', { valueAsNumber: true })} />
          </div>
          <div className="input-group">
            <label className="input-label">Gastos operacionales</label>
            <input className="input" placeholder="Ej: Incluidos / + gastos operacionales" {...register('operationalExpenses')} />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Facilidad de pago</label>
            <textarea className="textarea" rows={3} placeholder="Ej: 25% pie + 24 cuotas sin interes." {...register('paymentTerms')} />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Disponibilidad por lote</label>
            <textarea className="textarea" rows={3} placeholder="Ej: Parcelas 24, 26 y 27 disponibles. Valores varían según ubicación." {...register('availabilityNotes')} />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Notas comerciales internas/publicables</label>
            <textarea className="textarea" rows={3} placeholder="Ej: Unidades seleccionadas con promocion vigente." {...register('commercialNotes')} />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Distancias destacadas</label>
            <textarea
              name="distanceHighlights"
              className="textarea"
              rows={4}
              value={toTextareaValue(distanceHighlights)}
              placeholder="A 45 km de Puerto Montt&#10;A menos de 1 km de la playa"
              onChange={(event) => setValue('distanceHighlights', fromTextLinesValue(event.target.value), { shouldDirty: true, shouldValidate: true })}
            />
          </div>
        </div>
      </section>

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Gestión interna</h2>
        <div className="form-grid form-grid-4">
          <div className="input-group">
            <label className="input-label">Codigo interno</label>
            <input className="input" placeholder="Ej: DH-001" {...register('internalCode')} />
          </div>
          <div className="input-group">
            <label className="input-label">Orden en catálogo</label>
            <input type="number" className="input" placeholder="0" {...register('sortOrder', { valueAsNumber: true })} />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              Directorio de Agentes
              <span className="text-xs text-muted" style={{ fontWeight: 'normal' }}>
                (Si seleccionas uno, sobreescribe los campos manuales)
              </span>
            </label>
            <select className="select" {...register('agentId')}>
              <option value="">Ingreso manual (Ninguno)</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Nombre agente manual</label>
            <input className="input" placeholder="Nombre del agente" {...register('agentName')} />
          </div>
          <div className="input-group">
            <label className="input-label">Teléfono manual</label>
            <input className="input" placeholder="+54 11..." {...register('agentPhone')} />
          </div>
          <div className="input-group">
            <label className="input-label">Email manual</label>
            <input type="email" className="input" placeholder="agente@empresa.com" autoComplete="off" {...register('agentEmail')} />
            {errors.agentEmail && <p className="form-error">{errors.agentEmail.message}</p>}
          </div>
        </div>
      </section>

      {selectedType === 'terreno' && (
        <section className="admin-form-section">
          <h2 className="admin-form-section-title">Caracteristicas del proyecto / terreno</h2>
          <div className="amenity-chip-grid">
            {LAND_AMENITY_OPTIONS.map((amenity) => (
              <label key={amenity.value} className="amenity-chip">
                <input type="checkbox" value={amenity.value} {...register('amenities')} />
                {dictionaries.es.property[amenity.labelKey.split('.')[1] as keyof typeof dictionaries.es.property]}
              </label>
            ))}
          </div>
        </section>
      )}

      {selectedType === 'casa' && (
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
      )}

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Fotografias</h2>
        <div className="image-upload-zone">
          <UploadCloud size={30} />
          <div>
            <p style={{ fontWeight: 800 }}>Sube imágenes optimizadas a Supabase Storage</p>
            <p className="text-muted text-sm">Se redimensionan a WebP antes de subir. Maximo {MAX_IMAGES} imágenes.</p>
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
            Optimizando y subiendo imágenes...
          </p>
        )}

        {uploadError && <p className="form-error" style={{ marginTop: 'var(--space-sm)' }}>{uploadError}</p>}

        {images.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images} strategy={rectSortingStrategy}>
              <div className="image-preview-grid">
                {images.map((url, index) => (
                  <SortableImageCard
                    key={url}
                    url={url}
                    index={index}
                    coverImage={coverImage}
                    totalImages={images.length}
                    onSelectPrimary={selectPrimaryImage}
                    onMoveToPosition={moveImageToGalleryPosition}
                    onRemove={removeImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

      {propertyId && (
        <section className="admin-form-section">
          <h2 className="admin-form-section-title">URL publica</h2>
          <div className="form-grid form-grid-2">
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label" htmlFor="prop-slug">Slug (URL)</label>
              <input
                id="prop-slug"
                name="slug"
                className="input"
                value={slugValue}
                onChange={(event) => setSlugValue(event.target.value)}
                placeholder="portal-los-muermos"
              />
              <p className="text-xs text-muted" style={{ marginTop: 'var(--space-xs)' }}>
                Vista previa: /propiedades/{slugValue || 'tu-slug'}
                {propertyId && slugValue ? (
                  <>
                    {' · '}
                    <Link href={`/propiedades/${slugValue}`} target="_blank" className="text-gold">
                      Abrir previa
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="admin-form-section">
        <h2 className="admin-form-section-title">SEO</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Los campos en ingles alimentan la version <code>?lang=en</code> con hreflang. El canonical vacio usa la URL de la ficha; proyectos de terreno tambien existen en <code>/proyectos/[slug]</code>.
        </p>
        <div className="form-grid form-grid-2">
          <div style={{ display: activeLangTab === 'es' ? 'contents' : 'none' }}>
            <div className="input-group">
              <label className="input-label">Título SEO (Español)</label>
              <input className="input" maxLength={70} placeholder="Título para Google" {...register('seoTitleEs')} />
              {errors.seoTitleEs && <p className="form-error">{errors.seoTitleEs.message}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Descripción SEO (Español)</label>
              <textarea className="textarea" rows={3} maxLength={170} placeholder="Resumen breve para buscadores." {...register('seoDescriptionEs')} />
              {errors.seoDescriptionEs && <p className="form-error">{errors.seoDescriptionEs.message}</p>}
            </div>
          </div>

          <div style={{ display: activeLangTab === 'en' ? 'contents' : 'none' }}>
            <div className="input-group">
              <label className="input-label">Título SEO en ingles</label>
              <input className="input" maxLength={70} placeholder="Search title" {...register('seoTitleEn')} />
              {errors.seoTitleEn && <p className="form-error">{errors.seoTitleEn.message}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Descripción SEO en ingles</label>
              <textarea className="textarea" rows={3} maxLength={170} placeholder="Short search description." {...register('seoDescriptionEn')} />
              {errors.seoDescriptionEn && <p className="form-error">{errors.seoDescriptionEn.message}</p>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Canonical personalizado</label>
            <input className="input" type="url" placeholder="https://calafatepropiedades.vercel.app/propiedades/..." {...register('customCanonical')} />
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
        <h2 className="admin-form-section-title">Publicación</h2>
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
        <PropertyCatalogPublishChecklist
          values={catalogChecklistInput}
          showPublishWarning={isPublished}
        />
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
        <button
          type="submit"
          name="redirectMode"
          value="list"
          className="btn btn-outline btn-lg"
          disabled={isPending || isUploading}
        >
          {isPending ? 'Guardando...' : 'Guardar y volver'}
        </button>
        <button
          type="submit"
          name="redirectMode"
          value="stay"
          className="btn btn-primary btn-lg"
          disabled={isPending || isUploading}
        >
          {isPending ? 'Guardando...' : 'Guardar y seguir editando'}
        </button>
      </div>
    </form>
  );
}
