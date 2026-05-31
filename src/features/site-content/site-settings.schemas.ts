import { z } from 'zod';

export const SiteSettingsSchema = z.object({
  whatsappNumber: z.string().optional(),
  primaryPhone: z.string().optional(),
  primaryEmail: z.string().email('Debe ser un correo válido').optional().or(z.literal('')),
  officeAddress: z.string().optional(),
  instagramUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  facebookUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  discoverImageUrl: z.string().optional(),
  discoverEyebrow: z.string().optional(),
  discoverTitle: z.string().optional(),
  discoverParagraph1: z.string().optional(),
  discoverParagraph2: z.string().optional(),
  discoverEyebrowEn: z.string().optional(),
  discoverTitleEn: z.string().optional(),
  discoverParagraph1En: z.string().optional(),
  discoverParagraph2En: z.string().optional(),
});

export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>;
