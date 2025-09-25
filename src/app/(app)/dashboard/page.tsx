import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardIndex() {
  const sb = createServerClient();
  let role: string | null = null;

  try {
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
      role = (profile as any)?.role ?? null;
    }
  } catch {}

  if (role === 'ADMIN')  redirect('/dashboard/admin');
  if (role === 'TRAINER') redirect('/dashboard/pt');
  redirect('/dashboard/clients'); // fallback seguro
}
