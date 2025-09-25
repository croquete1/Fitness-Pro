import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import DashboardFrame from '@/components/layout/DashboardFrame';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sb = createServerClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  // tenta obter o nome do perfil
  let fullName: string | null = null;
  try {
    const { data } = await sb.from('profiles').select('full_name').eq('id', user.id).single();
    fullName = (data as any)?.full_name ?? null;
  } catch {}

  const role = String((user.user_metadata as any)?.role ?? 'CLIENT').toUpperCase();

  return (
    <DashboardFrame role={role} userLabel={fullName}>
      {children}
    </DashboardFrame>
  );
}
