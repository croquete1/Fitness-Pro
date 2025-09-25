// src/app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardIndex() {
  const sb = createServerClient();

  // 1) precisa de user; se não houver → /login (evita fallback anónimo)
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  // 2) obtém role e envia para o painel certo
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  const role = (profile as any)?.role as string | null;

  if (role === 'ADMIN')  redirect('/dashboard/admin');
  if (role === 'TRAINER') redirect('/dashboard/pt');
  redirect('/dashboard/clients'); // fallback cliente
}
