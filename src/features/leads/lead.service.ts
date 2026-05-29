import type { LeadInput } from './lead.schemas';
import { createLeadRepository, type LeadRepository } from './lead.repository';
import { withDatabaseRole } from '@/lib/db/rls';
import { sendLeadNotification } from '@/lib/email/lead-notification';

export class InvalidLeadPropertyError extends Error {
  constructor() {
    super('La propiedad seleccionada no esta disponible.');
  }
}

export function createLeadService(repository: LeadRepository) {
  return {
    async registerLead(input: LeadInput) {
      await repository.create(input);
    },
  };
}

export function getLeadService() {
  return {
    async registerLead(input: LeadInput) {
      const property = await withDatabaseRole('public', async (db) => {
        let propertySummary: { title: string; slug: string } | null = null;

        if (input.propertyId) {
          const property = await db.property.findFirst({
            where: {
              id: input.propertyId,
              published: true,
            },
            select: {
              id: true,
              titleEs: true,
              slug: true,
            },
          });

          if (!property) {
            throw new InvalidLeadPropertyError();
          }

          propertySummary = {
            title: property.titleEs,
            slug: property.slug,
          };
        }

        await createLeadService(createLeadRepository(db)).registerLead(input);

        return propertySummary;
      });

      try {
        await sendLeadNotification({ lead: input, property });
      } catch (error) {
        console.error('Lead email notification failed.', error);
      }
    },
  };
}
