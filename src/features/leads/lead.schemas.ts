import { z } from 'zod';
import { isCuid } from '@/lib/db/ids';

function emptyStringToNull(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function optionalShortText(max: number) {
  return z.preprocess(
    emptyStringToNull,
    z.string().max(max).nullable().optional(),
  );
}

export const LeadSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(100),
  email: z.string().email('Email invalido'),
  phone: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  message: z.preprocess(emptyStringToNull, z.string().max(500).optional().nullable()),
  propertyId: z.preprocess(
    emptyStringToNull,
    z.string().refine(isCuid, 'Propiedad invalida').optional().nullable(),
  ),
  leadSource: z.preprocess(emptyStringToNull, z.string().max(40).optional().nullable()),
  landingPath: optionalShortText(500),
  referrer: optionalShortText(500),
  utmSource: optionalShortText(120),
  utmMedium: optionalShortText(120),
  utmCampaign: optionalShortText(160),
  utmContent: optionalShortText(160),
  utmTerm: optionalShortText(160),
  recaptchaToken: z.preprocess(emptyStringToNull, z.string().max(4096).optional().nullable()),
});

export type LeadInput = z.infer<typeof LeadSchema>;
