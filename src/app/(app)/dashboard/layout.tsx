import '../globals.css';
import '@/app/(app)/theme.css'; // se usares o theme.css, mantém
import { redirect } from 'next/navigation';
import { SidebarProvider } from '@/components/layout/SidebarCtx';
import DashboardFrame from '@/components/layout/DashboardFrame';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  const userLabel = session.user.name || session.user.email || 'Utilizador';

  return (
    <SidebarProvider>
      <DashboardFrame role={role} userLabel={userLabel}>
        {children}
      </DashboardFrame>
    </SidebarProvider>
  );
}
