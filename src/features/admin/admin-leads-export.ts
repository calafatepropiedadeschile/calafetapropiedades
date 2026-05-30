import type { Prisma } from '@prisma/client';
import { LEAD_STATUSES, type LeadStatus } from '@/features/leads/lead-status';

const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  pendiente: 'Pendiente',
  contactada: 'Contactada',
  cerrada: 'Cerrada',
};

export function buildLeadsExportWhere(q: string, status: LeadStatus | 'todas'): Prisma.LeadWhereInput {
  const filters: Prisma.LeadWhereInput[] = [];

  if (status !== 'todas') {
    filters.push({ status });
  }

  if (q) {
    const textMatch = {
      contains: q,
      mode: 'insensitive' as const,
    };

    filters.push({
      OR: [
        { name: textMatch },
        { email: textMatch },
        { phone: textMatch },
        { message: textMatch },
        { utmCampaign: textMatch },
        { utmSource: textMatch },
        { property: { is: { titleEs: textMatch } } },
      ],
    });
  }

  return filters.length > 0 ? { AND: filters } : {};
}

export function leadsToCsv(
  leads: Array<{
    createdAt: Date;
    status: string;
    name: string;
    email: string;
    phone: string | null;
    message: string | null;
    utmCampaign: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    landingPath: string | null;
    property: { titleEs: string; slug: string } | null;
  }>
) {
  const header = [
    'Fecha',
    'Estado',
    'Nombre',
    'Email',
    'Teléfono',
    'Propiedad',
    'Slug propiedad',
    'Campaña',
    'utm_source',
    'utm_medium',
    'Landing',
    'Mensaje',
  ];
  const rows = leads.map((lead) => {
    const status = LEAD_STATUSES.includes(lead.status as LeadStatus)
      ? LEAD_STATUS_LABELS[lead.status as LeadStatus]
      : lead.status;

    return [
      lead.createdAt.toISOString(),
      status,
      lead.name,
      lead.email,
      lead.phone ?? '',
      lead.property?.titleEs ?? 'Consulta general',
      lead.property?.slug ?? '',
      lead.utmCampaign ?? '',
      lead.utmSource ?? '',
      lead.utmMedium ?? '',
      lead.landingPath ?? '',
      lead.message ?? '',
    ];
  });

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  return [header, ...rows].map((row) => row.map((cell) => escape(String(cell))).join(',')).join('\n');
}
