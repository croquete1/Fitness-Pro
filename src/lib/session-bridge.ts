// src/lib/session-bridge.ts
import { headers, cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { toAppRole, type AppRole } from '@/lib/roles';

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
  const hdrs = headers();
  const reqLike: any = {
    headers: Object.fromEntries(hdrs.entries()),
    cookies: Object.fromEntries(cookies().getAll().map((c) => [c.name, c.value])),
  };

  const token = await getToken({ req: reqLike, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;

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

  // devolvemos ambos: nested e flat
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
