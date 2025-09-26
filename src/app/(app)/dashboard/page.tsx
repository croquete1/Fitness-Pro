// src/app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getNextAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export default async function DashboardIndex() {
  // 1) Gate por NextAuth
  const session = await getNextAuthSession();
  if (!session?.user) redirect('/login');

  // 2) Papel (role) — vem da sessão via callbacks; senão, lê do Supabase
  let role = (session.user as any)?.role as string | null;
  if (!role) {
    try {
      const sb = createServerClient();
      const email = session.user.email!;
      const { data } = await sb.from('profiles').select('role').eq('email', email).single();
      role = (data as any)?.role ?? null;
    } catch {}
  }

  // 3) Redireciona para o painel certo
  if (role === 'ADMIN')  redirect('/dashboard/admin');
  if (role === 'TRAINER') redirect('/dashboard/pt');
  redirect('/dashboard/clients'); // fallback
}
