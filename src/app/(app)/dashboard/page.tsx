// src/app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';

// Auth.js / NextAuth no servidor (App Router)
async function getSessionSafe() {
  // v5: auth(); v4: getServerSession()
  try {
    const mod: any = await import('next-auth');
    if (typeof mod.auth === 'function') return await mod.auth();
    if (typeof mod.getServerSession === 'function') return await mod.getServerSession();
  } catch {}
  return null;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardIndex() {
  // 1) Sessão via NextAuth (server). Se não houver, vai para /login.
  const session = await getSessionSafe();
  if (!session?.user) redirect('/login'); // proteger no server é a prática recomendada :contentReference[oaicite:1]{index=1}

  // 2) Descobrir o role:
  //   - Primeiro tenta vir no próprio session.user.role (via callbacks do NextAuth).
  //   - Se não existir, busca no Supabase (por e-mail) só para resolver o papel.
  let role = (session.user as any)?.role as string | null;
  if (!role) {
    try {
      const sb = createServerClient();
      const email = session.user.email!;
      const { data } = await sb.from('profiles').select('role').eq('email', email).single();
      role = (data as any)?.role ?? null;
    } catch {}
  }

  // 3) Redirecionar para o painel certo
  if (role === 'ADMIN')  redirect('/dashboard/admin');
  if (role === 'TRAINER') redirect('/dashboard/pt');
  redirect('/dashboard/clients'); // fallback seguro
}
