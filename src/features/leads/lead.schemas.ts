import { z } from 'zod';
import { isCuid } from '@/lib/db/ids';

function emptyStringToNull(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export const LeadSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(100),
  email: z.string().email('Email invalido'),
  phone: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  message: z.preprocess(emptyStringToNull, z.string().max(500).optional().nullable()),
  propertyId: z.preprocess(
    emptyStringToNull,
    z.string().refine(isCuid, 'Propiedad invalida').optional().nullable()
  ),
});

export type LeadInput = z.infer<typeof LeadSchema>;
