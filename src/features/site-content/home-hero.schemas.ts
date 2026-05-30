import { z } from 'zod';

const optionalText = (max: number) => z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().max(max).nullable().optional()
);

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().url('URL de imagen invalida').nullable().optional()
);

export const HomeHeroSettingsSchema = z.object({
  imageUrl: optionalUrl,
  titleLine1Es: optionalText(120),
  titleLine2Es: optionalText(120),
  subtitleEs: optionalText(320),
  titleLine1En: optionalText(120),
  titleLine2En: optionalText(120),
  subtitleEn: optionalText(320),
});

export type HomeHeroSettingsInput = z.infer<typeof HomeHeroSettingsSchema>;
