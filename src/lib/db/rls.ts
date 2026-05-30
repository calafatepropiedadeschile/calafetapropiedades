import type { Prisma } from '@prisma/client';
import { getPrismaClient } from './prisma';

/** Roles internos de Postgres para RLS (Calafate Propiedades). */
const DATABASE_ROLES = {
  public: 'calafate_public_runtime',
  auth: 'calafate_auth_runtime',
  admin: 'calafate_admin_runtime',
} as const;

type DatabaseRole = keyof typeof DATABASE_ROLES;

export type RoleScopedPrismaClient = Prisma.TransactionClient;

function isMissingRoleError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('does not exist') && message.includes('role');
}

export function withDatabaseRole<T>(
  role: DatabaseRole,
  callback: (db: RoleScopedPrismaClient) => Promise<T>
): Promise<T> {
  const roleName = DATABASE_ROLES[role];
  const prisma = getPrismaClient();

  return prisma.$transaction(async (tx) => {
    try {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE "${roleName}"`);
    } catch (error) {
      if (!isMissingRoleError(error)) throw error;
      console.warn(
        `Database role "${roleName}" is missing. Run scripts/setup-calafate-rls-roles.sql in Supabase. Continuing without SET ROLE.`,
      );
    }
    return callback(tx);
  });
}
