'use client';

import { API_ROUTES } from '@/config/api';
import { getAttributionPayload } from '@/lib/marketing/attribution';
import { buildGraciasUrl } from '@/lib/marketing/gracias';
import { createMetaEventId, getMetaBrowserIds } from '@/lib/marketing/meta-cookies';
import type { LeadInput } from './lead.schemas';

export type LeadFormPayload = Pick<LeadInput, 'name' | 'email' | 'phone' | 'message' | 'propertyId'>;

export async function submitLeadForm(
  payload: LeadFormPayload,
  options?: {
    propertyTitle?: string;
    propertySlug?: string;
    formType?: 'lead' | 'contacto';
    recaptchaToken?: string | null;
    leadSource?: string;
  }
) {
  const attribution = getAttributionPayload();
  const formType = options?.formType ?? (payload.propertyId ? 'lead' : 'contacto');
  const metaEventId = createMetaEventId();
  const { fbp, fbc } = getMetaBrowserIds();

  const body = {
    ...payload,
    ...attribution,
    leadSource: options?.leadSource ?? attribution.leadSource,
    metaEventId,
    metaFbp: fbp,
    metaFbc: fbc,
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

  const graciasUrl = buildGraciasUrl({
    tipo: formType,
    proyecto: options?.propertyTitle,
    slug: options?.propertySlug,
    eventId: metaEventId,
  });

  window.location.assign(graciasUrl);
}
