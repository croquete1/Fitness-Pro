// src/lib/auth.ts
import { getServerSession } from 'next-auth';
import type { NextAuthOptions, DefaultSession } from 'next-auth';

/**
 * Compat: muitos ficheiros fazem getServerSession(authOptions).
 * Para isso basta o segredo e a estratégia 'jwt' para decifrar o token.
 * A configuração completa (providers/callbacks) está no route handler:
 * src/app/api/auth/[...nextauth]/route.ts
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function auth() {
  return getServerSession(authOptions);
}

export type SessionUser = (DefaultSession['user'] & { id?: string; role?: string }) | null;

export async function getSessionUser(): Promise<SessionUser> {
  const s = await auth();
  return (s?.user as SessionUser) ?? null;
}
