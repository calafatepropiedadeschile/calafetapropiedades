import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { withDatabaseRole } from '@/lib/db/rls';
import { buildLeadsExportWhere, leadsToCsv } from '@/features/admin/admin-leads-export';
import { LEAD_STATUSES, type LeadStatus } from '@/features/leads/lead-status';

function parseLeadStatus(value: string | null): LeadStatus | 'todas' {
  return LEAD_STATUSES.includes(value as LeadStatus) ? value as LeadStatus : 'todas';
}

export async function GET(request: Request) {
  await requireAdminSession();

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  const status = parseLeadStatus(searchParams.get('status'));
  const where = buildLeadsExportWhere(q, status);

  const leads = await withDatabaseRole('admin', async (db) => (
    db.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5000,
      select: {
        createdAt: true,
        status: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        utmCampaign: true,
        utmSource: true,
        utmMedium: true,
        landingPath: true,
        property: {
          select: {
            titleEs: true,
            slug: true,
          },
        },
      },
    })
  ));

  const csv = leadsToCsv(leads);
  const filename = `consultas-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
