import { z } from 'zod';
import { generateSlug } from '@/lib/utils/formatters';

export const STATIC_PAGE_RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'propiedades',
  'proyectos',
  'comprar',
  'arriendos',
  'terrenos',
  'vender',
  'topografia',
  'gracias',
  '_next',
  'sitemap',
]);

export const STATIC_PAGE_INTEGRATED_SLUGS = [
  'contacto',
  'nosotros',
  'propiedades',
  'comprar',
  'arriendos',
  'proyectos',
  'terrenos',
  'vender',
  'topografia',
] as const;

const STATIC_PAGE_INTEGRATED_SLUG_SET = new Set<string>(STATIC_PAGE_INTEGRATED_SLUGS);

const slugSchema = z
  .string()
  .trim()
  .min(1, 'El slug es obligatorio.')
  .max(80)
  .transform((value) => generateSlug(value))
  .refine((value) => value.length > 0, 'El slug no es valido.')
  .refine(
    (value) => !STATIC_PAGE_RESERVED_SLUGS.has(value) || STATIC_PAGE_INTEGRATED_SLUG_SET.has(value),
    'Ese slug esta reservado por el sistema.'
  );

function optionalText(value: unknown, max: number) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function optionalUrl(value: unknown) {
  const text = optionalText(value, 500);
  if (!text) return null;

  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const StaticPageSchema = z.object({
  slug: slugSchema,
  titleEs: z.string().trim().min(1, 'El titulo en español es obligatorio.').max(200),
  titleEn: z.string().trim().max(200).optional().nullable(),
  contentEs: z.string().trim().min(1, 'El contenido en español es obligatorio.').max(50000),
  contentEn: z.string().trim().max(50000).optional().nullable(),
  published: z.boolean(),
  seoTitleEs: z.string().trim().max(70).optional().nullable(),
  seoTitleEn: z.string().trim().max(70).optional().nullable(),
  seoDescriptionEs: z.string().trim().max(170).optional().nullable(),
  seoDescriptionEn: z.string().trim().max(170).optional().nullable(),
  customCanonical: z.preprocess(optionalUrl, z.string().url().nullable()),
  ogImage: z.preprocess(optionalUrl, z.string().url().nullable()),
});

export type StaticPageInput = z.infer<typeof StaticPageSchema>;

export function parseStaticPageFormData(formData: FormData): StaticPageInput {
  const parsed = StaticPageSchema.safeParse({
    slug: formData.get('slug'),
    titleEs: formData.get('titleEs'),
    titleEn: optionalText(formData.get('titleEn'), 200),
    contentEs: formData.get('contentEs'),
    contentEn: optionalText(formData.get('contentEn'), 50000),
    published: formData.get('published') === 'on',
    seoTitleEs: optionalText(formData.get('seoTitleEs'), 70),
    seoTitleEn: optionalText(formData.get('seoTitleEn'), 70),
    seoDescriptionEs: optionalText(formData.get('seoDescriptionEs'), 170),
    seoDescriptionEn: optionalText(formData.get('seoDescriptionEn'), 170),
    customCanonical: formData.get('customCanonical'),
    ogImage: formData.get('ogImage'),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join('.');
    const message = issue?.message ?? 'Datos de página invalidos';
    throw new Error(path ? `${path}: ${message}` : message);
  }

  return parsed.data;
}
