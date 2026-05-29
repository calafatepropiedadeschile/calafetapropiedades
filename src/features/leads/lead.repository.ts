import type { Prisma, PrismaClient } from '@prisma/client';
import type { LeadInput } from './lead.schemas';

type LeadDbClient = PrismaClient | Prisma.TransactionClient;

export function createLeadRepository(db: LeadDbClient) {
  return {
    create(input: LeadInput) {
      return db.lead.createMany({
        data: [{
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          message: input.message ?? null,
          propertyId: input.propertyId ?? null,
        }],
      });
    },
  };
}

export type LeadRepository = ReturnType<typeof createLeadRepository>;
