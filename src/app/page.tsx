// src/app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getUserRole } from '@/lib/userRepo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardIndex() {
  const sb = createServerClient();

  // 1) precisa de user; se não houver → /login (evita fallback anónimo)
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  // 2) obtém role e envia para o painel certo
  const role = await getUserRole(user.id, { client: sb });

  if (role === 'ADMIN')  redirect('/dashboard/admin');
  if (role === 'TRAINER') redirect('/dashboard/pt');
  redirect('/dashboard/clients'); // fallback cliente
}
