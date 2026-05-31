'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { withDatabaseRole } from '@/lib/db/rls';
import { z } from 'zod';

const AgentSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().or(z.literal('')),
});

export async function createAgent(formData: FormData) {
  await requireAdminSession();

  const data = AgentSchema.parse({
    name: formData.get('name'),
    email: formData.get('email') || '',
    phone: formData.get('phone') || '',
  });

  await withDatabaseRole('admin', async (db) => 
    db.agent.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      }
    })
  );

  revalidatePath('/admin/agentes');
}

export async function deleteAgent(id: string) {
  await requireAdminSession();

  await withDatabaseRole('admin', async (db) => 
    db.agent.delete({ where: { id } })
  );

  revalidatePath('/admin/agentes');
}
