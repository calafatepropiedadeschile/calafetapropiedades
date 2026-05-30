import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getPrismaClient } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function logAdminLoginEvent(event: string, details: Record<string, unknown> = {}) {
  console.info('Admin login event', {
    event,
    ...details,
  });
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

  if (!secret) {
    throw new Error('AUTH_SECRET is required to sign admin sessions.');
  }

  return secret;
}

function authorizeEnvAdmin(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) return null;
  if (email !== adminEmail || password !== adminPassword) return null;

  logAdminLoginEvent('env_admin_success', { email });

  return {
    id: 'env-admin',
    email: adminEmail,
    name: 'Administrador',
    role: 'admin',
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          logAdminLoginEvent('invalid_payload');
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = email.trim().toLowerCase();

        try {
          // Login directo (sin SET ROLE): evita fallos si calafate_* aún no existen en Supabase.
          const user = await getPrismaClient().user.findUnique({
            where: { email: normalizedEmail },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              role: true,
            },
          });

          if (!user) {
            logAdminLoginEvent('user_not_found', { email: normalizedEmail });
            return authorizeEnvAdmin(normalizedEmail, password);
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            logAdminLoginEvent('password_invalid', { email: normalizedEmail });
            return authorizeEnvAdmin(normalizedEmail, password);
          }

          logAdminLoginEvent('success', { email: normalizedEmail });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Admin login failed while reading the datasource.', error);
          return authorizeEnvAdmin(normalizedEmail, password);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
});
