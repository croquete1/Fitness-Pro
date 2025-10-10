// src/lib/authServer.ts
import { createServerClient } from '@/lib/supabaseServer';
import { getUserRole } from '@/lib/userRepo';

export type CurrentUser = {
  id: string;
  role: string | null;
  source: 'nextauth' | 'supabase';
};

/**
 * Tenta NextAuth (v5: auth(); v4: getServerSession()) sem importar ficheiros locais.
 * Se não existir NextAuth ou não houver sessão, cai para Supabase.
 */
async function tryNextAuthSafe(): Promise<CurrentUser | null> {
  try {
    // import dinâmico para não exigir dependência no build
    const na: any = await import('next-auth');
    let authOptions: any = null;
    try {
      authOptions = (await import('@/lib/authOptions')).authOptions;
    } catch {
      authOptions = null;
    }

    // v5 (se existir)
    if (typeof na.auth === 'function') {
      const session = await na.auth(authOptions ?? undefined).catch(() => null);
      const u = (session?.user ?? null) as any;
      if (u?.id) return { id: String(u.id), role: (u.role as string) ?? null, source: 'nextauth' };
    }

    // v4 (fallback): tentar sem options; se o teu setup exigir options isto vai devolver null
    if (typeof na.getServerSession === 'function') {
      const session = authOptions
        ? await na.getServerSession(authOptions).catch(() => null)
        : await na.getServerSession().catch(() => null);
      const u = (session?.user ?? null) as any;
      if (u?.id) return { id: String(u.id), role: (u.role as string) ?? null, source: 'nextauth' };
    }
  } catch {
    // next-auth não instalado ou não configurado - ignorar
  }
  return null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // 1) tentar NextAuth (se existir)
  const na = await tryNextAuthSafe();
  if (na) return na;

  // 2) fallback: Supabase
  try {
    const sb = createServerClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    let role: string | null = null;
    try {
      role = await getUserRole(user.id, { client: sb });
    } catch {
      role = null;
    }

    return { id: user.id, role, source: 'supabase' };
  } catch {
    return null;
  }
}

/** Helper opcional: caminho do dashboard por role */
export function roleToHome(role?: string | null): '/dashboard/admin' | '/dashboard/pt' | '/dashboard/clients' {
  if (role === 'ADMIN') return '/dashboard/admin';
  if (role === 'TRAINER') return '/dashboard/pt';
  return '/dashboard/clients';
}
