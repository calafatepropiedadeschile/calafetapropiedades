export const LEAD_STATUSES = ['pendiente', 'contactada', 'cerrada'] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];
