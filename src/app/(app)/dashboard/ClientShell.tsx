// src/app/(app)/dashboard/ClientShell.tsx
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import type { AppRole } from '@/lib/roles';

import SidebarProvider from '@/components/layout/SidebarProvider';
import RoleSidebar from '@/components/layout/RoleSidebar';
import AppHeader from '@/components/layout/AppHeader';

export default async function ClientShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Normaliza dados do utilizador
  const role = (toAppRole(session?.user?.role) ?? 'CLIENT') as AppRole;
  const userLabel = (session?.user?.name ?? session?.user?.email ?? 'Utilizador') as string;

  return (
    <SidebarProvider>
      <div
        className="fp-shell"
        style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh' }}
      >
        <aside>
          <RoleSidebar role={role} userLabel={userLabel} />
        </aside>

        <main className="fp-main" style={{ minWidth: 0 }}>
          <AppHeader />
          <div className="fp-content">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
