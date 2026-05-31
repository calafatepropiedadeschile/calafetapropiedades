'use client';

import { API_ROUTES } from '@/config/api';
import { getAttributionPayload } from '@/lib/marketing/attribution';
import { trackContactSubmit, trackGenerateLead } from '@/lib/marketing/analytics';
import { buildGraciasUrl } from '@/lib/marketing/gracias';
import type { LeadInput } from './lead.schemas';

export type LeadFormPayload = Pick<LeadInput, 'name' | 'email' | 'phone' | 'message' | 'propertyId'>;

export async function submitLeadForm(
  payload: LeadFormPayload,
  options?: {
    propertyTitle?: string;
    propertySlug?: string;
    formType?: 'lead' | 'contacto';
    recaptchaToken?: string | null;
  }
) {
  const attribution = getAttributionPayload();
  const formType = options?.formType ?? (payload.propertyId ? 'lead' : 'contacto');

  const body = {
    ...payload,
    ...attribution,
    recaptchaToken: options?.recaptchaToken ?? null,
  };

  const res = await fetch(API_ROUTES.leads, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const json = await res.json() as { success?: boolean; error?: string };

  if (!res.ok || !json.success) {
    throw new Error(json.error || 'No se pudo enviar la consulta.');
  }

  if (formType === 'contacto') {
    trackContactSubmit({
      form_type: 'contacto',
      utm_campaign: attribution.utmCampaign ?? undefined,
    });
  } else {
    trackGenerateLead({
      form_type: 'property_lead',
      property_slug: options?.propertySlug,
      utm_campaign: attribution.utmCampaign ?? undefined,
    });
  }

  const graciasUrl = buildGraciasUrl({
    tipo: formType,
    proyecto: options?.propertyTitle,
    slug: options?.propertySlug,
  });

  window.location.assign(graciasUrl);
}
