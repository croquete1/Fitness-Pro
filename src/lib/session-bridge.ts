// src/lib/session-bridge.ts
import { headers, cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { toAppRole, type AppRole } from '@/lib/roles';
import { getCurrentUser } from '@/lib/authServer';
import { authOptions } from '@/lib/authOptions';

/**
 * Estrutura principal da sessão.
 * Agora expõe TAMBÉM campos "flat" no topo (id, role, name, email, image)
 * para retro-compatibilidade com código legado (me.id / me.role / etc.).
 */
export type SessionBridge = {
  session: unknown;
  user: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: AppRole;
  };
  // --- retro-compat "flat" ---
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  role?: AppRole;
};

/**
 * Lê o JWT via NextAuth no middleware/servidor (App Router),
 * devolve objeto com `user.*` e campos "flat" (id/role/...) para compat.
 */
export async function getSessionUserSafe(): Promise<SessionBridge | null> {
  const hdrs = await headers();
  const cookieStore = await cookies();
  const reqLike: any = {
    headers: Object.fromEntries(hdrs.entries()),
    cookies: Object.fromEntries(cookieStore.getAll().map((c) => [c.name, c.value])),
  };

  let token: any | null = null;
  try {
    token = await getToken({ req: reqLike, secret: process.env.NEXTAUTH_SECRET });
  } catch (error) {
    console.warn('[session-bridge] getToken falhou — a tentar getServerSession', error);
  }

  if (token) {
    const roleRaw =
      (token as any)?.role ??
      (token as any)?.user?.role ??
      (token as any)?.user?.['app_role'];

    const u = {
      id: (token as any)?.id ?? (token as any)?.user?.id,
      name: (token as any)?.name ?? (token as any)?.user?.name,
      email: (token as any)?.email ?? (token as any)?.user?.email,
      image: (token as any)?.picture ?? (token as any)?.user?.image,
      role: toAppRole(roleRaw) ?? undefined,
    };

    return {
      session: token,
      user: u,
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
    };
  }

  // fallback: tenta obter sessão NextAuth via getServerSession (v4)
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.id) {
      const role = toAppRole(user.role) ?? undefined;
      return {
        session,
        user: {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          image: user.image ?? undefined,
          role,
        },
        id: user.id,
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        image: user.image ?? undefined,
        role,
      };
    }
  } catch (error) {
    console.warn('[session-bridge] getServerSession fallback falhou', error);
  }

  // fallback: tenta sessão Supabase (caso NextAuth não esteja disponível)
  const fallback = await getCurrentUser().catch(() => null);
  if (!fallback?.id) return null;

  const role = toAppRole(fallback.role) ?? undefined;

  return {
    session: fallback,
    user: {
      id: fallback.id,
      name: undefined,
      email: undefined,
      image: undefined,
      role,
    },
    id: fallback.id,
    name: undefined,
    email: undefined,
    image: undefined,
    role,
  };
}
