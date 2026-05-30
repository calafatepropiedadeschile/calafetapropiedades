import { z } from 'zod';

function optionalText(value: unknown, max: number) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function requiredText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function optionalUrl(value: unknown) {
  const text = optionalText(value, 500);
  if (!text) return null;

  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function linesToList(value: unknown, maxItems = 40) {
  if (typeof value !== 'string') return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

const optionalTrackingId = (pattern: RegExp, message: string) => z.preprocess(
  (value) => optionalText(value, 80),
  z.string().regex(pattern, message).nullable()
);

export const SiteSeoSettingsSchema = z.object({
  siteName: z.string().trim().min(1, 'El nombre del sitio es obligatorio.').max(90),
  titleTemplate: z.string().trim().min(1).max(120).refine(
    (value) => value.includes('%s'),
    'La plantilla debe incluir %s para insertar el titulo de cada pagina.'
  ),
  defaultTitleEs: z.string().trim().min(1, 'El titulo SEO por defecto es obligatorio.').max(70),
  defaultDescriptionEs: z.string().trim().min(1, 'La descripcion SEO por defecto es obligatoria.').max(170),
  defaultTitleEn: z.string().trim().max(70).nullable(),
  defaultDescriptionEn: z.string().trim().max(170).nullable(),
  keywords: z.array(z.string().min(1).max(80)).max(40),
  canonicalBaseUrl: z.preprocess(optionalUrl, z.string().url('URL base invalida')),
  defaultOgImage: z.preprocess(optionalUrl, z.string().url().nullable()),
  googleSiteVerification: z.string().trim().max(160).nullable(),
  googleAnalyticsId: optionalTrackingId(/^G-[A-Z0-9]+$/i, 'El ID de GA4 debe tener formato G-XXXXXXXX.'),
  metaPixelId: optionalTrackingId(/^\d{5,30}$/, 'El Pixel de Meta debe ser numerico.'),
  allowIndexing: z.boolean(),
  robotsDisallow: z.array(z.string().min(1).max(120)).max(40),
});

export type SiteSeoSettingsInput = z.infer<typeof SiteSeoSettingsSchema>;

export function parseSiteSeoSettingsFormData(formData: FormData): SiteSeoSettingsInput {
  const parsed = SiteSeoSettingsSchema.safeParse({
    siteName: requiredText(formData.get('siteName'), 90),
    titleTemplate: requiredText(formData.get('titleTemplate'), 120),
    defaultTitleEs: requiredText(formData.get('defaultTitleEs'), 70),
    defaultDescriptionEs: requiredText(formData.get('defaultDescriptionEs'), 170),
    defaultTitleEn: optionalText(formData.get('defaultTitleEn'), 70),
    defaultDescriptionEn: optionalText(formData.get('defaultDescriptionEn'), 170),
    keywords: linesToList(formData.get('keywords')),
    canonicalBaseUrl: formData.get('canonicalBaseUrl'),
    defaultOgImage: formData.get('defaultOgImage'),
    googleSiteVerification: optionalText(formData.get('googleSiteVerification'), 160),
    googleAnalyticsId: formData.get('googleAnalyticsId'),
    metaPixelId: formData.get('metaPixelId'),
    allowIndexing: formData.get('allowIndexing') === 'on',
    robotsDisallow: linesToList(formData.get('robotsDisallow')),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join('.');
    const message = issue?.message ?? 'Datos SEO invalidos';
    throw new Error(path ? `${path}: ${message}` : message);
  }

  return parsed.data;
}
