import { z } from 'zod';

function optionalLine(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export const SiteOrganizationSeoSchema = z.object({
  officeStreetAddress: z.string().trim().max(120),
  officeLocality: z.string().trim().max(80),
  officeRegion: z.string().trim().max(80),
  officeAddress: z.string().trim().max(240),
});

export type SiteOrganizationSeoInput = z.infer<typeof SiteOrganizationSeoSchema>;

export function parseSiteOrganizationSeoFormData(formData: FormData): SiteOrganizationSeoInput {
  const parsed = SiteOrganizationSeoSchema.safeParse({
    officeStreetAddress: optionalLine(formData.get('officeStreetAddress'), 120),
    officeLocality: optionalLine(formData.get('officeLocality'), 80),
    officeRegion: optionalLine(formData.get('officeRegion'), 80),
    officeAddress: optionalLine(formData.get('officeAddress'), 240),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(issue?.message ?? 'Datos de organizacion invalidos');
  }

  return parsed.data;
}
