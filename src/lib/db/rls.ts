import type { Prisma } from '@prisma/client';
import { getPrismaClient } from './prisma';

const DATABASE_ROLES = {
  public: 'dahuss_public_runtime',
  auth: 'dahuss_auth_runtime',
  admin: 'dahuss_admin_runtime',
} as const;

type DatabaseRole = keyof typeof DATABASE_ROLES;

export type RoleScopedPrismaClient = Prisma.TransactionClient;

export function withDatabaseRole<T>(
  role: DatabaseRole,
  callback: (db: RoleScopedPrismaClient) => Promise<T>
): Promise<T> {
  const roleName = DATABASE_ROLES[role];
  const prisma = getPrismaClient();

  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL ROLE "${roleName}"`);
    return callback(tx);
  });
}
