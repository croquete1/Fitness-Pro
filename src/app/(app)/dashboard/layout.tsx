import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { SidebarProvider } from '@/components/layout/SidebarCtx';
import DashboardFrame from '@/components/layout/DashboardFrame';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = (toAppRole(session.user.role) ?? 'CLIENT') as AppRole;

  // nome para saudação
  const sb = createServerClient();
  const { data: prof } = await sb
    .from('profiles')
    .select('name')
    .eq('id', session.user.id)
    .maybeSingle();

  const userLabel = prof?.name ?? session.user.name ?? session.user.email ?? 'Utilizador';

  return (
    <SidebarProvider>
      <DashboardFrame role={role} userLabel={userLabel}>
        {children}
      </DashboardFrame>
    </SidebarProvider>
  );
}
