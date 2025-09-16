// src/lib/session-bridge.ts
import { headers, cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { toAppRole } from '@/lib/roles';

export type AppRole = 'ADMIN' | 'PT' | 'CLIENT';

export type SessionBridge = {
  session: unknown;
  user: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: AppRole;
  };
};

/**
 * Helper para obter info mínima do utilizador via JWT do NextAuth,
 * sem depender de getServerSession nem de authConfig.
 * Mantém a assinatura { session, user } como no teu código existente.
 */
export async function getSessionUserSafe(): Promise<SessionBridge | null> {
  // Construímos um req-like para o getToken ler cookies/headers no App Router
  const hdrs = headers();
  const reqLike: any = {
    headers: Object.fromEntries(hdrs.entries()),
    // Algumas versões olham para cookies de forma direta:
    cookies: Object.fromEntries(cookies().getAll().map(c => [c.name, c.value])),
  };

  const token = await getToken({ req: reqLike, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;

  const rawRole = (token as any)?.role ?? (token as any)?.user?.role;
  const role = toAppRole(rawRole) ?? undefined;

  const user = {
    id:   (token as any)?.id ?? (token as any)?.user?.id,
    name: (token as any)?.name ?? (token as any)?.user?.name,
    email:(token as any)?.email ?? (token as any)?.user?.email,
    image:(token as any)?.picture ?? (token as any)?.user?.image,
    role,
  };

  return { session: token, user };
}
