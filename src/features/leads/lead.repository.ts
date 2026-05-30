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
          leadSource: input.leadSource ?? 'web_form',
          landingPath: input.landingPath ?? null,
          referrer: input.referrer ?? null,
          utmSource: input.utmSource ?? null,
          utmMedium: input.utmMedium ?? null,
          utmCampaign: input.utmCampaign ?? null,
          utmContent: input.utmContent ?? null,
          utmTerm: input.utmTerm ?? null,
        }],
      });
    },
  };
}

export type LeadRepository = ReturnType<typeof createLeadRepository>;
