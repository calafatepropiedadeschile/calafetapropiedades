'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { assertCuid } from '@/lib/db/ids';
import { withDatabaseRole } from '@/lib/db/rls';
import { LEAD_STATUSES, type LeadStatus } from '@/features/leads/lead-status';

export async function updateLeadStatus(id: string, status: LeadStatus) {
  await requireAdminSession();
  assertCuid(id, 'ID de consulta');

  if (!LEAD_STATUSES.includes(status)) {
    throw new Error('Estado de consulta invalido.');
  }

  await withDatabaseRole('admin', async (db) => {
    await db.lead.update({
      where: { id },
      data: { status },
      select: { id: true },
    });
  });

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
}

export async function deleteLead(id: string) {
  await requireAdminSession();
  assertCuid(id, 'ID de consulta');

  await withDatabaseRole('admin', async (db) => {
    await db.lead.delete({
      where: { id },
      select: { id: true },
    });
  });

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
}
