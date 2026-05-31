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

function shouldEnforceRlsRoles(): boolean {
  if (process.env.DATABASE_RLS_RELAXED === 'true') {
    return false;
  }

  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}

export function withDatabaseRole<T>(
  role: DatabaseRole,
  callback: (db: RoleScopedPrismaClient) => Promise<T>
): Promise<T> {
  const roleName = DATABASE_ROLES[role];
  const prisma = getPrismaClient();

  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('SAVEPOINT app_role_switch');
    try {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE "${roleName}"`);
    } catch (error) {
      if (!isMissingRoleError(error)) throw error;
      await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT app_role_switch');

      const setupHint = 'Run scripts/setup-calafate-rls-roles.sql in Supabase SQL Editor.';

      if (shouldEnforceRlsRoles()) {
        throw new Error(
          `Database role "${roleName}" is missing. ${setupHint} Set DATABASE_RLS_RELAXED=true only for local development without RLS roles.`,
        );
      }

      console.warn(
        `Database role "${roleName}" is missing. ${setupHint} Continuing without SET ROLE (development only).`,
      );
    }
    return callback(tx);
  });
}
