// src/app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getServerSession, type Session } from 'next-auth'; // ✅ v4 App Router

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Lê a sessão do NextAuth no servidor (v4). Se existir `authOptions`, usa-o.
// Tipado para devolver `Session | null` → evita "Property 'user' does not exist on type 'unknown'".
async function getNextAuthSession(): Promise<Session | null> {
  try {
    // tenta usar as tuas opções, se exportares `authOptions`
    const mod: any = await import('@/app/api/auth/[...nextauth]/route');
    const opts = mod?.authOptions;
    if (opts) return await getServerSession(opts);
  } catch {
    // sem authOptions: App Router aceita sem argumentos em muitos cenários
  }
  return await getServerSession();
}

export default async function DashboardIndex() {
  // 1) Gate por NextAuth (recomendado no App Router)
  const session = await getNextAuthSession();
  if (!session?.user) redirect('/login');

  // 2) Papel: usa o que vier na sessão; se não houver, vai ao Supabase só para o role
  let role = (session.user as any)?.role as string | null;
  if (!role) {
    try {
      const sb = createServerClient();
      const email = session.user.email!;
      const { data } = await sb.from('profiles').select('role').eq('email', email).single();
      role = (data as any)?.role ?? null;
    } catch {}
  }

  // 3) Redireciona para o painel correto
  if (role === 'ADMIN')  redirect('/dashboard/admin');
  if (role === 'TRAINER') redirect('/dashboard/pt');
  redirect('/dashboard/clients'); // fallback seguro
}
